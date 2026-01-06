"use client";

import { useMemo, useState } from "react";

function isProbablyUrl(input: string) {
  const v = input.trim();
  if (!v) return false;
  // allow people to type without https://
  try {
    const u = new URL(v.startsWith("http") ? v : `https://${v}`);
    return Boolean(u.hostname && u.hostname.includes("."));
  } catch {
    return false;
  }
}

function normalizeUrl(input: string) {
  const v = input.trim();
  if (!v) return "";
  return v.startsWith("http") ? v : `https://${v}`;
}

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const canRun = useMemo(() => isProbablyUrl(url), [url]);

  async function runFreeAudit() {
    setMsg(null);

    if (!canRun) {
      setMsg("Enter a valid website (example: example.com).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizeUrl(url) }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.error || "Couldn’t run the audit. Try again.");
        return;
      }

      // Store for /report page to read (your report page already does this pattern)
      sessionStorage.setItem("audit:last", JSON.stringify(data));

      // Send them to the report view
      window.location.href = "/report";
    } catch {
      setMsg("Network issue. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function buyFullReport() {
    setMsg(null);
    if (!canRun) {
      setMsg("Enter a website first, then unlock the full report.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalizeUrl(url) }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        setMsg(data?.error || "Checkout couldn’t start. Try again.");
        return;
      }

      window.location.href = data.url; // Stripe Checkout URL
    } catch {
      setMsg("Network issue. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen w-full px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
            <span className="font-semibold tracking-wide">MVP</span>
            <span className="opacity-60">FAST WEBSITE PUNCH-LIST</span>
          </div>

          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white">
            Paste a link. Get a clean audit report.
          </h1>

          <p className="mt-3 max-w-3xl text-white/70">
            Checks the stuff that costs you leads: mobile experience, load speed,
            basic SEO, and clarity. Plain-English results, not tech-speak.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com"
              className="h-12 w-full flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 text-white outline-none placeholder:text-white/35 focus:border-white/25"
            />
            <button
              onClick={runFreeAudit}
              disabled={loading}
              className="h-12 rounded-2xl border border-[#F5A84B]/40 bg-[#F5A84B]/10 px-5 font-medium text-[#F5A84B] hover:bg-[#F5A84B]/15 disabled:opacity-60"
            >
              {loading ? "Working…" : "Run audit"}
            </button>
          </div>

          <p className="mt-3 text-sm text-white/55">
            Tip: Start with your own site or a local business you know. If it’s useful,
            people will pay for the full version.
          </p>

          {msg ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/75">
              {msg}
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-2 inline-flex items-center gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                WHAT YOU CAN BUY
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                PAID REPORT
              </span>
            </div>

            <h2 className="text-lg font-semibold text-white">Instant Full Report ($19)</h2>
            <p className="mt-2 text-sm text-white/65">
              One-time purchase. Unlock the complete report for the URL you enter above.
            </p>

            <button
              onClick={buyFullReport}
              disabled={loading}
              className="mt-4 h-11 w-full rounded-2xl border border-white/10 bg-black/35 px-4 font-medium text-white hover:bg-black/45 disabled:opacity-60"
            >
              {loading ? "Starting checkout…" : "Unlock full report"}
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-2 inline-flex items-center gap-2 text-xs text-white/60">
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                UPGRADE
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                MONTHLY CHECKS
              </span>
            </div>

            <h2 className="text-lg font-semibold text-white">
              Site Monitoring ($49/mo)
              <span className="ml-2 rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-xs font-medium text-white/60">
                Coming soon
              </span>
            </h2>

            <p className="mt-2 text-sm text-white/65">
              Weekly checks + emailed results. This will launch after the MVP is stable.
            </p>

            <button
              disabled
              className="mt-4 h-11 w-full rounded-2xl border border-white/10 bg-black/20 px-4 font-medium text-white/40"
            >
              Not available yet
            </button>
          </div>
        </div>

        <div className="mt-10 text-center text-xs text-white/35">
          © {new Date().getFullYear()} Riley Digital Studio
        </div>
      </div>
    </main>
  );
}
