"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  function handleRunAudit() {
    if (!url.trim()) return;
    sessionStorage.setItem("audit:url", url.trim());
    router.push("/report");
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-black via-zinc-900 to-black flex justify-center px-6 py-20 text-white">
      <div className="w-full max-w-6xl space-y-16">

        {/* HERO */}
        <section className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-10">
          <p className="text-xs uppercase tracking-wide text-white/50">
            MVP Fast Website Punch-List
          </p>

          <h1 className="mt-4 text-4xl md:text-5xl font-semibold leading-tight">
            Paste a link.<br />Get a clean audit report.
          </h1>

          <p className="mt-4 max-w-2xl text-white/70">
            Checks the things that cost you leads: mobile experience, load speed,
            basic SEO, and clarity. Plain-English results. No tech-speak.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com"
              className="flex-1 rounded-2xl bg-black/40 border border-white/15 px-4 py-3 text-sm outline-none focus:border-white/40"
            />
            <button
              onClick={handleRunAudit}
              className="rounded-2xl bg-white text-black px-6 py-3 text-sm font-medium hover:bg-white/90"
            >
              Run audit
            </button>
          </div>

          <p className="mt-3 text-xs text-white/50">
            Tip: Start with your own site or a local business you know.
          </p>
        </section>

        {/* PRICING */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Instant Report */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8">
            <h3 className="text-xl font-semibold">Instant Report</h3>
            <p className="mt-1 text-white/60">$19 one-time</p>

            <p className="mt-4 text-sm text-white/70">
              Unlock the complete audit for the URL you enter above.
              No calls. No subscriptions.
            </p>

            <button
              className="mt-6 rounded-2xl bg-white text-black px-5 py-2 text-sm font-medium hover:bg-white/90"
            >
              Unlock full report
            </button>
          </div>

          {/* Monitoring */}
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 opacity-70">
            <h3 className="text-xl font-semibold">Site Monitoring</h3>
            <p className="mt-1 text-white/60">$49 / month</p>

            <p className="mt-4 text-sm text-white/70">
              Weekly checks with emailed results.
              Launching after the MVP stabilizes.
            </p>

            <span className="inline-block mt-6 text-xs text-white/50">
              Coming soon
            </span>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="text-center text-xs text-white/40">
          © 2026 Riley Digital Studio
        </footer>

      </div>
    </main>
  );
}

