"use client";

import { useEffect, useMemo, useState } from "react";

type Finding = {
  level: "ok" | "warn" | "bad";
  title: string;
  detail: string;
};

type AuditResult = {
  url: string;
  generatedAt: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  overall: number;
  findings: Finding[];
  plainEnglish?: string;
};

function clamp(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export default function ReportPage() {
  const [data, setData] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("audit:last");
      if (!raw) {
        setError("No audit found yet. Go back and run an audit first.");
        return;
      }
      setData(JSON.parse(raw));
    } catch {
      setError("Report data was corrupted. Please run the audit again.");
    }
  }, []);

  const overall = useMemo(() => clamp(data?.overall ?? 0), [data?.overall]);

  return (
    <main className="min-h-screen w-full px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">Audit report</h1>
            <p className="mt-1 text-sm text-white/60">
              {data?.url ? (
                <>
                  For: <span className="text-white/80">{data.url}</span>
                </>
              ) : (
                "Paste a link on the home page to generate a report."
              )}
            </p>
          </div>

          <a
            href="/"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Run another
          </a>
        </div>

        {error ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/75">
            {error}
          </div>
        ) : null}

        {data ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur md:col-span-1">
              <div className="text-sm text-white/60">Overall</div>
              <div className="mt-2 text-5xl font-semibold text-white">
                {overall}
              </div>
              <div className="mt-3 text-sm text-white/55">
                Generated {data.generatedAt ? `on ${data.generatedAt}` : "just now"}.
              </div>

              <div className="mt-6 space-y-3 text-sm text-white/75">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Performance</span>
                  <span>{clamp(data.scores.performance)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Accessibility</span>
                  <span>{clamp(data.scores.accessibility)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Best Practices</span>
                  <span>{clamp(data.scores.bestPractices)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">SEO</span>
                  <span>{clamp(data.scores.seo)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur md:col-span-2">
              <h2 className="text-lg font-semibold text-white">Findings</h2>

              {data.plainEnglish ? (
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {data.plainEnglish}
                </p>
              ) : (
                <p className="mt-3 text-sm text-white/60">
                  Here are the key issues detected.
                </p>
              )}

              <div className="mt-5 space-y-3">
                {data.findings?.length ? (
                  data.findings.map((f, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-white">{f.title}</div>
                        <div className="text-xs text-white/55">
                          {f.level.toUpperCase()}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-white/70">
                        {f.detail}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                    No findings returned. Try running the audit again.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
