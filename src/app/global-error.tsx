"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Global application error:", error);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0a0a0a", color: "#ffffff" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            fontFamily: "Arial, sans-serif",
            background:
              "radial-gradient(circle at top, rgba(251,191,36,0.14), transparent 34%), #0a0a0a",
            textAlign: "center",
          }}
        >
          <section style={{ maxWidth: 680 }}>
            <p
              style={{
                display: "inline-block",
                margin: "0 0 24px",
                padding: "9px 14px",
                border: "1px solid rgba(251,113,133,0.28)",
                borderRadius: 999,
                background: "rgba(251,113,133,0.10)",
                color: "#fecdd3",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              Something broke
            </p>
            <h1
              style={{
                margin: 0,
                fontFamily: "Georgia, serif",
                fontSize: "clamp(38px, 7vw, 68px)",
                lineHeight: 1.08,
              }}
            >
              It&apos;s not you. We messed up something.
            </h1>
            <p
              style={{
                margin: "22px auto 0",
                maxWidth: 560,
                color: "rgba(255,255,255,0.58)",
                fontSize: 17,
                lineHeight: 1.8,
              }}
            >
              The site hit a rough patch while loading. Try again, or head back
              home and give us a moment to clean up our tiny digital spill.
            </p>
            {error.digest ? (
              <p
                style={{
                  display: "inline-block",
                  margin: "22px 0 0",
                  padding: "10px 14px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.42)",
                  fontSize: 12,
                }}
              >
                Error reference: {error.digest}
              </p>
            ) : null}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                flexWrap: "wrap",
                marginTop: 34,
              }}
            >
              <button
                type="button"
                onClick={reset}
                style={{
                  border: "1px solid rgba(254,240,138,0.35)",
                  borderRadius: 999,
                  background: "#fde68a",
                  color: "#1c1917",
                  padding: "13px 22px",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
              <Link
                href="/"
                style={{
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.82)",
                  padding: "13px 22px",
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Go home
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
