"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [loadingPay, setLoadingPay] = useState(false);
  const router = useRouter();

  const cleanUrl = (input: string) => {
    const t = input.trim();
    if (!t) return "";
    // If user types "example.com" add https:// so downstream tools behave.
    if (!/^https?:\/\//i.test(t)) return `https://${t}`;
    return t;
  };

  const handleRunAudit = async () => {
    const u = cleanUrl(url);
    if (!u) return;
    setLoadingAudit(true);
    try {
      sessionStorage.setItem("audit:url", u);
      router.push("/report");
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleUnlock = async () => {
    const u = cleanUrl(url) || sessionStorage.getItem("audit:url") || "";
    if (!u) return;

    setLoadingPay(true);
    try {
      // Your /api/checkout route should create a Stripe Checkout Session
      // and return JSON like { url: "https://checkout.stripe.com/..." }
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data?.error || "Checkout failed. Check your /api/checkout route logs.";
        alert(msg);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      alert("Checkout created, but no redirect URL was returned. Your /api/checkout should return { url }.");
    } catch (e: any) {
      alert(e?.message || "Checkout error. Open Vercel logs for /api/checkout.");
    } finally {
      setLoadingPay(false);
    }
  };

  return (
    <main className="min-h-screen w-full text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-[#070A12]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(900px_500px_at_20%_15%,rgba(245,168,75,0.18),transparent_60%),radial-gradient(900px_500px_at_80%_40%,rgba(86,142,255,0.14),transparent_55%),radial-gradient(1100px_650px_at_50%_95%,rgba(255,255,255,0.06),transparent_55%)]" />

      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        {/* HERO CARD */}
        <section className="rounded-[28px] border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.55)]">
          <div className="p-8 md:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] uppercase tracking-wider text-white/65">
              <span className="h-2 w-2 rounded-full bg-[#F5A84B]" />
              MVP Fast Website Punch-List
            </div>

            <h1 className="mt-6 text-4xl md:text-6xl font-semibold leading-[1.05]">
              Paste a link.
              <span className="block text-white/85">Get a clean audit report.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm md:text-base text-white/70">
              Checks the real stuff that costs you leads: mobile experience, load speed, basic SEO, and clarity.
              Results are explained in plain English, not tech-speak.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1 rounded-2xl border border-white/12 bg-black/30 px-4 py-3 focus-within:border-white/30">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="example.com"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-white/35"
                />
              </div>

              <button
                onClick={handleRunAudit}
                disabled={loadingAudit}
                className="rounded-2xl border border-[#F5A84B]/35 bg-[#F5A84B] px-6 py-3 text-sm font-semibold text-black hover:bg-[#F5A84B]/90 disabled:opacity-60"
              >
                {loadingAudit ? "Running…" : "Run audit"}
              </button>
            </div>

            <p className="mt-3 text-xs text-white/45">
              Tip: Start by auditing your own site or a local business you know. If this feels useful, people will pay for it.
            </p>
          </div>
        </section>

        {/* OFFER CARDS */}
        <section className="mt-8 grid grid-cols-1 gap-6 md:mt-10 md:grid-cols-2">
          {/* Instant Report */}
          <div className="rounded-[26px] border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
            <div className="p-7 md:p-8">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-wider text-white/55">
                  What you can sell
                </div>
                <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] text-white/60">
                  Paid report
                </div>
              </div>

              <h3 className="mt-3 text-2xl font-semibold">Instant Report</h3>
              <p className="mt-1 text-white/70">$19 one-time</p>

              <p className="mt-4 text-sm text-white/70">
                Unlock the complete audit for the URL you enter above.
                No phone calls. No subscription trap.
              </p>

              <button
                onClick={handleUnlock}
                disabled={loadingPay}
                className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60"
              >
                {loadingPay ? "Opening checkout…" : "Unlock full report"}
              </button>

              <p className="mt-3 text-xs text-white/45">
                If you don’t type a URL, this uses the last URL you ran.
              </p>
            </div>
          </div>

          {/* Monitoring */}
          <div className="rounded-[26px] border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.35)] opacity-80">
            <div className="p-7 md:p-8">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-wider text-white/55">
                  Upgrade
                </div>
                <div className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] text-white/60">
                  Monthly checks
                </div>
              </div>

              <h3 className="mt-3 text-2xl font-semibold">Site Monitoring</h3>
              <p className="mt-1 text-white/70">$49 / month</p>

              <p className="mt-4 text-sm text-white/70">
                Run the audit weekly and email results. Easy recurring revenue once the MVP is stable.
              </p>

              <div className="mt-6 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-xs text-white/55">
                Coming soon
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-10 text-center text-xs text-white/35">
          © {new Date().getFullYear()} Riley Digital Studio
        </footer>
      </div>
    </main>
  );
}
}

