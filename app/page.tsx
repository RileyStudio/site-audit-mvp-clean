"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const normalizedUrl = useMemo(() => url.trim(), [url]);

  function runAudit() {
    if (!normalizedUrl) return;
    sessionStorage.setItem("audit:url", normalizedUrl);
    router.push("/report");
  }

  async function startCheckout() {
    // Optional: keep url around so report can pick it up after checkout if needed
    if (normalizedUrl) sessionStorage.setItem("audit:url", normalizedUrl);

    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data?.url) {
      alert(data?.error || "Checkout failed. Please try again.");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <main className="page">
      <div className="container">
        {/* HERO */}
        <section className="hero">
          <div className="kicker">
            <span className="pill">MVP</span>
            <span className="kickerText">FAST WEBSITE PUNCH-LIST</span>
          </div>

          <h1 className="h1">Paste a link. Get a clean audit report.</h1>

          <p className="sub">
            Checks what costs you leads: mobile experience, load speed, basic SEO,
            and clarity. Plain-English results, not tech-speak.
          </p>

          <div className="bar">
            <input
              className="input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.com"
              inputMode="url"
            />
            <button className="btn" onClick={runAudit} disabled={!normalizedUrl}>
              Run audit
            </button>
          </div>

          <p className="tip">Tip: Start with your own site or a local business you know.</p>
        </section>

        {/* PRICING */}
        <section className="grid">
          <div className="card">
            <div className="cardTop">
              <div className="tabs">
                <span className="tab">WHAT YOU CAN SELL</span>
                <span className="tab muted">PAID REPORT</span>
              </div>

              <h2 className="title">Instant Report ($19)</h2>
              <p className="small">
                One-time purchase. Unlock the full report for the URL you enter above.
              </p>
            </div>

            <div className="cardBottom">
              <button className="btn outline" onClick={startCheckout}>
                Unlock full report
              </button>
            </div>
          </div>

          <div className="card dim">
            <div className="cardTop">
              <div className="tabs">
                <span className="tab">UPGRADE</span>
                <span className="tab muted">MONTHLY CHECKS</span>
              </div>

              <h2 className="title">Site Monitoring ($49/mo)</h2>
              <p className="small">
                Run the audit weekly and email results. Easy recurring revenue once the MVP works.
              </p>
            </div>

            <div className="cardBottom">
              <span className="coming">Not enabled yet</span>
            </div>
          </div>
        </section>

        <footer className="footer">© {new Date().getFullYear()} Riley Digital Studio</footer>
      </div>
    </main>
  );
}
