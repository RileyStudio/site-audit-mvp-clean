"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const runAudit = () => {
    if (!url.trim()) return;
    sessionStorage.setItem("audit:url", url.trim());
    router.push("/report");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-4xl space-y-20">

        {/* HERO */}
        <section className="text-center space-y-6">
          <p className="text-xs uppercase tracking-widest text-white/50">
            MVP Fast Website Punch-List
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            Paste a link.<br />
            Get a clean audit report.
          </h1>

          <p className="mx-auto max-w-2xl text-white/70">
            Checks what costs you leads: mobile experience, load speed,
            basic SEO, and clarity. Plain-English results.
          </p>

          <div className="mx-auto mt-6 flex max-w-xl flex-col sm:flex-row gap-3">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com"
              className="flex-1 rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-sm outline-none focus:border-white/40"
            />
            <button
              onClick={runAudit}
              className="rounded-xl bg-white text-black px-6 py-3 text-sm font-medium hover:bg-white/90"
            >
              Run audit
            </button>
          </div>

          <p className="text-xs text-white/40">
            Tip: Start with your own site or a local business you know.
          </p>
        </section>

        {/* PRICING */}
        <section className="grid gap-6 md:grid-cols-2">

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-left">
            <h3 className="text-lg font-semibold">Instant Report</h3>
            <p className="mt-1 text-white/60">$19 one-time</p>

            <p className="mt-4 text-sm text-white/70">
              Unlock the full audit for the URL you enter.
              No calls. No subscriptions.
            </p>

            <button className="mt-6 w-full rounded-xl bg-white text-black py-2 text-sm font-medium hover:bg-white/90">
              Unlock full report
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 opacity-70">
            <h3 className="text-lg font-semibold">Site Monitoring</h3>
            <p className="mt-1 text-white/60">$49 / month</p>

            <p className="mt-4 text-sm text-white/70">
              Weekly checks with emailed results.
              Launching after MVP stabilization.
            </p>

            <span className="mt-6 inline-block text-xs text-white/50">
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


            <button className="mt-6 rounded-2xl bg-white text-black px-5 py-2 text-sm font-medium hover:bg-white/90">
              Unlock full report
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-8 opacity-70">
            <h3 className="text-xl font-semibold">Site Monitoring</h3>
            <p className="mt-1 text-white/60">$49 / month</p>

            <p className="mt-4 text-sm text-white/70">
              Weekly checks with emailed results.
              Launching after MVP stabilization.
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
