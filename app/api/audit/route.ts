import { NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  url: z.string().url(),
});

type PsiCategory =
  | "performance"
  | "accessibility"
  | "best-practices"
  | "seo";

type Finding = {
  level: "ok" | "warn" | "bad";
  title: string;
  detail: string;
};

function toPct(score0to1: number | undefined) {
  if (typeof score0to1 !== "number") return 0;
  return Math.round(Math.max(0, Math.min(1, score0to1)) * 100);
}

function weightedOverall(scores: Record<string, number>) {
  // Weight what usually affects leads most for small businesses
  const perf = scores.performance ?? 0;
  const seo = scores.seo ?? 0;
  const bp = scores.bestPractices ?? 0;
  const acc = scores.accessibility ?? 0;
  return Math.round(perf * 0.45 + seo * 0.30 + bp * 0.15 + acc * 0.10);
}

function buildFindings(scores: Record<string, number>): Finding[] {
  const findings: Finding[] = [];

  const perf = scores.performance ?? 0;
  const seo = scores.seo ?? 0;

  if (perf < 50) {
    findings.push({
      level: "bad",
      title: "Site is slow on real devices",
      detail:
        "Slow pages bleed visitors. Fix images, reduce heavy scripts, and tighten the first screen so it loads fast.",
    });
  } else if (perf < 75) {
    findings.push({
      level: "warn",
      title: "Speed is decent but not sharp",
      detail:
        "You’re close. Compress images, lazy-load media, and avoid giant background videos on mobile.",
    });
  } else {
    findings.push({
      level: "ok",
      title: "Speed is solid",
      detail: "Load time looks healthy. Don’t break this when you add new media.",
    });
  }

  if (seo < 50) {
    findings.push({
      level: "bad",
      title: "SEO basics are missing",
      detail:
        "Search engines may not understand the page. Add clear titles, meta descriptions, and structured headings (H1/H2).",
    });
  } else if (seo < 75) {
    findings.push({
      level: "warn",
      title: "SEO is okay but leaving reach on the table",
      detail:
        "Tighten the page title, add more relevant page text, and make sure each page has a unique description.",
    });
  } else {
    findings.push({
      level: "ok",
      title: "SEO foundation is strong",
      detail: "Good baseline. Next gains come from content + local listings + backlinks.",
    });
  }

  // A couple universal conversion checks (no crawling needed)
  findings.push({
    level: "warn",
    title: "Make the first screen say the offer instantly",
    detail:
      "Your homepage should answer: what you do, who it’s for, and how to book, in 5 seconds or less. If it doesn’t, rewrite the hero.",
  });

  findings.push({
    level: "warn",
    title: "One clear call-to-action",
    detail:
      "If you have multiple competing buttons, visitors stall. Pick one primary action and make it obvious.",
  });

  return findings;
}

async function fetchPageSpeed(url: string, categories: PsiCategory[], apiKey?: string) {
  const params = new URLSearchParams();
  params.set("url", url);
  params.set("strategy", "mobile");
  categories.forEach((c) => params.append("category", c));
  if (apiKey) params.set("key", apiKey);

  const endpoint = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?" + params.toString();
  const res = await fetch(endpoint, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PageSpeed error (${res.status}): ${text.slice(0, 300)}`);
  }
  return res.json();
}

async function aiPolishSummary(input: {
  url: string;
  overall: number;
  scores: Record<string, number>;
  findings: Finding[];
}) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  // Minimal OpenAI REST call, compatible with typical deployments.
  // If you prefer the official SDK, we can switch, but this avoids extra deps.
  const prompt = {
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You write concise, blunt but helpful website audit summaries for small businesses. No hype. No buzzwords. Plain English. 5-7 sentences max.",
      },
      {
        role: "user",
        content:
          `Website: ${input.url}
` +
          `Overall score: ${input.overall}/100
` +
          `Scores: ${JSON.stringify(input.scores)}
` +
          `Findings: ${JSON.stringify(input.findings)}

` +
          "Write a short summary that explains what's hurting leads most and what to do first. End with one confident next step.",
      },
    ],
    temperature: 0.4,
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(prompt),
  });

  if (!res.ok) return null;
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  return typeof text === "string" ? text : null;
}

export async function POST(req: Request) {
  try {
    const body = BodySchema.parse(await req.json());
    const url = body.url;

    const psi = await fetchPageSpeed(
      url,
      ["performance", "accessibility", "best-practices", "seo"],
      process.env.PAGESPEED_API_KEY
    );

    const cats = psi?.lighthouseResult?.categories ?? {};
    const scores = {
      performance: toPct(cats?.performance?.score),
      accessibility: toPct(cats?.accessibility?.score),
      bestPractices: toPct(cats?.["best-practices"]?.score),
      seo: toPct(cats?.seo?.score),
    };

    const overall = weightedOverall(scores);
    const findings = buildFindings(scores);

    const fallbackSummary =
      `Your site scored ${overall}/100 on a mobile-first check. ` +
      `The biggest lead-leaks are usually speed and clarity. ` +
      (scores.performance < 75
        ? "Speed needs attention first, especially images and heavy scripts. "
        : "Speed looks solid, so focus on messaging and conversion clarity. ") +
      (scores.seo < 75
        ? "SEO basics can be tightened so people can actually find you. "
        : "SEO foundation is decent. ") +
      "Fix the first screen (hero) so visitors instantly know what you do and how to book.";

    const aiSummary = await aiPolishSummary({ url, overall, scores, findings });

    return NextResponse.json({
      url,
      generatedAt: new Date().toISOString(),
      scores,
      overall,
      findings,
      plainEnglish: aiSummary ?? fallbackSummary,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unknown error" },
      { status: 400 }
    );
  }
}
