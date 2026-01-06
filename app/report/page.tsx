"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type AuditData = {
  inputUrl: string;
  overallScore: number;
  performance: number;
  seo: number;
  bestPractices: number;
  accessibility: number;
  summary: string;
  punchList: { title: string; detail: string; severity?: "good" | "warn" | "bad" }[];
  breakdown: { section: string; items: { label: string; value: string; note?: string }[] }[];
};

function storageKey(url: string) {
  // scoped to the audited URL so a paid unlock doesn't accidentally carry over
  return `audit:paid:${url}`;
}

export default function ReportPage() {
  const sp = useSearchParams();
  const [raw, setRaw] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  const sessionId = sp.get("session_id");
  const urlFromQuery = sp.get("url") || "";

  // Load cached report
  useEffect(() => {
    const cached = sessionStorage.getItem("audit:last");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as AuditData;
        setRaw(parsed);
        const alreadyPaid = sessionStorage.getItem(storageKey(parsed.inputUrl)) === "1";
        setPaid(alreadyPaid);
      } catch {}
    }
  }, []);

  // If we landed here directly with ?url=..., run the audit.
  useEffect(() => {
    if (!urlFromQuery) return;
    if (raw?.inputUrl === urlFromQuery) return;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch("/api/audit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: urlFromQuery }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Audit failed");
        setRaw(json);
        sessionStorage.setItem("audit:last", JSON.stringify(json));
        const alreadyPaid = sessionStorage.getItem(storageKey(json.inputUrl)) === "1";
        setPaid(alreadyPaid);
      } catch (e: any) {
        setErr(e?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    })();
  }, [urlFromQuery, raw?.inputUrl]);

  // Verify a Stripe Checkout return and unlock instantly.
  useEffect(() => {
    if (!sessionId) return;
    if (!raw?.inputUrl) return;

    (async () => {
      try {
        const res = await fetch(`/api/verify-session?session_id=${encodeURIComponent(sessionId)}`);
        const json = await res.json();
        if (json?.paid) {
          setPaid(true);
          sessionStorage.setItem(storageKey(raw.inputUrl), "1");
          // Clean the URL so people can refresh/share without the session_id.
          const next = new URL(window.location.href);
          next.searchParams.delete("session_id");
          window.history.replaceState({}, "", next.toString());
        }
      } catch {
        // if verification fails, keep the paywall in place
      }
    })();
  }, [sessionId, raw?.inputUrl]);

  const data = useMemo(() => {
    if (!raw) return null;
    const safePunch = Array.isArray(raw.punchList) ? raw.punchList : [];
    const safeBreakdown = Array.isArray(raw.breakdown) ? raw.breakdown : [];
    return {
      ...raw,
      punchList: safePunch,
      breakdown: safeBreakdown,
    };
  }, [raw]);

  async function startCheckout() {
    if (!data) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          // bring them back to THIS report (same page unlock)
          returnTo: `${window.location.origin}/report?url=${encodeURIComponent(data.inputUrl)}`,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Could not start checkout");
      window.location.href = json.url;
    } catch (e: any) {
      setErr(e?.message || "Could not start checkout");
      setLoading(false);
    }
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#0B0F1A] text-white flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl rounded-3xl bg-white/5 border border-white/10 p-8">
          <h1 className="text-2xl font-semibold">Report</h1>
          <p className="text-white/70 mt-2">
            {loading ? "Running your audit…" : "No report found yet. Go back and run an audit first."}
          </p>
          {err && <p className="text-red-300 mt-4">{err}</p>}
        </div>
      </main>
    );
  }

  const freePunch = data.punchList.slice(0, 3);
  const restPunch = data.punchList.slice(3);

  return (
    <main className="min-h-screen bg-[#0B0F1A] text-white px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <header className="rounded-3xl bg-white/5 border border-white/10 p-8 backdrop-blur">
          <div className="text-xs tracking-wider uppercase text-white/60">Report</div>
          <div className="mt-2 break-all text-white/80">{data.inputUrl}</div>
          <div className="mt-4 text-5xl font-semibold">{data.overallScore}/100</div>
          <div className="text-white/70 mt-1">Overall health score</div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ScoreCard label="Performance" value={data.performance} />
            <ScoreCard label="SEO" value={data.seo} />
            <ScoreCard label="Best Practices" value={data.bestPractices} />
            <ScoreCard label="Accessibility" value={data.accessibility} />
          </div>
        </header>

        <section className="mt-8 rounded-3xl bg-white/5 border border-white/10 p-8">
          <h2 className="text-xl font-semibold">Plain-English summary</h2>
          <p className="text-white/70 mt-3 leading-relaxed">{data.summary}</p>
        </section>

        <section className="mt-6 rounded-3xl bg-white/5 border border-white/10 p-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-semibold">Punch-list</h2>
            {!paid && (
              <span className="text-xs text-white/60">
                Showing preview (top {freePunch.length})
              </span>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {freePunch.map((p, idx) => (
              <div key={idx} className="rounded-2xl bg-black/20 border border-white/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">{p.title}</div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      p.severity === "good"
                        ? "border-emerald-400/40 text-emerald-200"
                        : p.severity === "warn"
                        ? "border-amber-400/40 text-amber-200"
                        : "border-rose-400/40 text-rose-200"
                    }`}
                  >
                    {p.severity === "good" ? "Good" : p.severity === "warn" ? "Needs attention" : "Fix"}
                  </span>
                </div>
                <div className="text-white/70 mt-2">{p.detail}</div>
              </div>
            ))}
          </div>

          {!paid && (
            <div className="mt-6 rounded-2xl bg-black/25 border border-white/10 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">Unlock the full report</div>
                  <div className="text-white/70 mt-1">
                    Full breakdown, prioritized fix list, and a downloadable PDF. Delivered instantly after payment.
                  </div>
                </div>
                <button
                  onClick={startCheckout}
                  disabled={loading}
                  className="rounded-full px-5 py-3 font-medium border border-[#F5A84B]/40 bg-[#F5A84B]/10 hover:bg-[#F5A84B]/15 transition disabled:opacity-60"
                >
                  {loading ? "Opening checkout…" : "Unlock for $19"}
                </button>
              </div>
              <div className="text-xs text-white/55 mt-3">
                Tip: We only use your contact info to deliver your report and follow up if you ask for help.
              </div>
            </div>
          )}

          {paid && restPunch.length > 0 && (
            <div className="mt-6 space-y-3">
              {restPunch.map((p, idx) => (
                <div key={idx} className="rounded-2xl bg-black/20 border border-white/10 p-4">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-white/70 mt-2">{p.detail}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {paid && (
          <section className="mt-6 rounded-3xl bg-white/5 border border-white/10 p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold">Full breakdown</h2>
              <button
                onClick={() => window.print()}
                className="rounded-full px-4 py-2 text-sm border border-white/15 bg-white/5 hover:bg-white/10"
              >
                Download / Print PDF
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {data.breakdown.map((b, idx) => (
                <div key={idx} className="rounded-2xl bg-black/20 border border-white/10 p-5">
                  <div className="font-semibold">{b.section}</div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {b.items.map((it, j) => (
                      <div key={j} className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <div className="text-sm text-white/70">{it.label}</div>
                        <div className="text-base font-medium mt-1">{it.value}</div>
                        {it.note && <div className="text-sm text-white/60 mt-1">{it.note}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-10 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Riley Digital Studio
        </footer>
      </div>
    </main>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-black/20 border border-white/10 p-5">
      <div className="text-xs tracking-wider uppercase text-white/60">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-[#7FE6B6]" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}
