"use client";

import { useMemo, useState } from "react";

function normalizeUrl(input: string) {
  let u = input.trim();
  if (!u) return "";
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  return u;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const normalized = useMemo(() => normalizeUrl(url), [url]);

  async function runAudit() {
    setErr(null);
    const target = normalized;
    if (!target) return setErr("Paste a website link first.");
    setLoading(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Audit failed.");
      // Store in session for the report page
      sessionStorage.setItem("audit:last", JSON.stringify(data));
      window.location.href = "/report";
    } catch (e: any) {
      setErr(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="hero">
        <div className="kicker">
          <span className="badge">Website Audit</span>
          <span>Quick, plain-English report</span>
        </div>
        <h1 className="h1">Paste a link. Get a clean audit report.</h1>
        <p className="sub">
          This checks real-world things that cost you leads: mobile experience, load speed, basic SEO, and clarity.
          It explains the results in plain English, not tech-speak.
        </p>

        <div className="row">
          <input
            className="input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="example.com"
            inputMode="url"
          />
          <button className="btn" onClick={runAudit} disabled={loading}>
            {loading ? "Running audit…" : "Run audit"}
          </button>
        </div>

        {err && (
          <div style={{ marginTop: 12, color: "rgba(255,92,92,0.95)" }}>
            {err}
          </div>
        )}

        <div className="footer">
          Tip: Start with your own site. Then try a local business site you know well.
        </div>
      </div>

      <div className="grid">
        <div className="card span6">
          <div className="kicker"><span className="badge">Upgrade</span><span>Full report</span></div>
          <div className="title">Full Report Unlock</div>
          <div className="small">
            Get the detailed breakdown, prioritized fix list, and a downloadable PDF. Delivered immediately after payment.
          </div>
        </div>
        <div className="card span6">
          <div className="kicker"><span className="badge">Coming soon</span><span>Monthly checks</span></div>
          <div className="title">Site Monitoring</div>
          <div className="small">
            Optional monthly monitoring is coming soon.
          </div>
        </div>
      </div>
    </>
  );
}
