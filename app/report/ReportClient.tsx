"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type AuditResult = {
  url: string;
  score: number;
  notes: string[];
  paid: boolean;
};

export default function ReportClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<"idle" | "loading" | "error" | "done">("idle");
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<AuditResult | null>(null);

  const url = useMemo(() => {
    const fromSession = typeof window !== "undefined" ? sessionStorage.getItem("audit:url") : "";
    return (fromSession || "").trim();
  }, []);

  const sessionId = searchParams?.get("session_id") || "";

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!url) {
        router.push("/");
        return;
      }

      setStatus("loading");
      setError("");

      try {
        let paid = false;

        if (sessionId) {
          const v = await fetch(`/api/verify?session_id=${encodeURIComponent(sessionId)}`, {
            cache: "no-store",
          });
          const vj = await v.json();
          paid = Boolean(vj?.paid);
        }

        const r = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, paid }),
        });

        const j = await r.json();

        if (!r.ok) throw new Error(j?.error || "Audit failed.");

        if (!cancelled) {
          setResult(j);
          setStatus("done");
        }
      } catch (e: any) {
        if (!cancelled) {
          setStatus("error");
          setError(e?.message || "Something went wrong.");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router, url, sessionId]);

  return (
    <main className="page">
      <div className="container">
        <div className="reportHeader">
          <button className="linkBtn" onClick={() => router.push("/")}>
            ← Back
          </button>
          <h1 className="h1">Audit report</h1>
          <p className="sub">{url}</p>
        </div>

        {status === "loading" && (
          <div className="card">
            <h2 className="title">Running audit…</h2>
            <p className="small">This can take 10–30 seconds depending on the site.</p>
          </div>
        )}

        {status === "error" && (
          <div className="card">
            <h2 className="title">Couldn’t generate the report</h2>
            <p className="small">{error}</p>
          </div>
        )}

        {status === "done" && result && (
          <div className="grid">
            <div className="card">
              <div className="tabs">
                <span className="tab">SCORE</span>
              </div>
              <div className="score">{result.score}</div>
              <p className="small">{result.paid ? "Full report unlocked." : "Preview mode."}</p>
            </div>

            <div className="card">
              <div className="tabs">
                <span className="tab">{result.paid ? "FULL NOTES" : "TOP ISSUES"}</span>
              </div>
              <ul className="list">
                {result.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>

              {!result.paid && (
                <div className="cardBottom">
                  <button
                    className="btn outline"
                    onClick={async () => {
                      const res = await fetch("/api/checkout", { method: "POST" });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok || !data?.url) {
                        alert(data?.error || "Checkout failed. Please try again.");
                        return;
                      }
                      window.location.href = data.url;
                    }}
                  >
                    Unlock full report
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
