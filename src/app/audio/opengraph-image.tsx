import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const runtime = "nodejs";

// Image metadata
export const alt = "Renu Writes Poem - Audio Recitations";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a", // neutral-950
          backgroundImage: "radial-gradient(circle at top left, rgba(139,92,246,0.15), transparent 50%), radial-gradient(circle at bottom right, rgba(255,255,255,0.05), transparent 50%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px",
            textAlign: "center",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            borderRadius: "24px",
            background: "rgba(255, 255, 255, 0.03)",
            width: "90%",
            height: "85%",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 24px",
              borderRadius: "9999px",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              background: "rgba(139, 92, 246, 0.1)",
              color: "#c084fc", // purple-400
              fontSize: 20,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: "40px",
            }}
          >
            Audio Recitations
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              color: "white",
              marginBottom: "32px",
              lineHeight: 1.2,
            }}
          >
            Listen to Poem Recitations
          </div>

          {/* Description */}
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "rgba(255, 255, 255, 0.7)",
              lineHeight: 1.5,
              maxWidth: "800px",
            }}
          >
            Immerse yourself in beautiful recitations of verses on life, love, and mystery, voiced directly by {siteConfig.author}.
          </div>

          {/* Author/Site Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "auto",
              paddingTop: "40px",
              width: "100%",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div style={{ display: "flex", color: "white", fontSize: 24, fontWeight: "bold" }}>
              Renu Writes Poem
            </div>
            <div style={{ display: "flex", color: "rgba(255, 255, 255, 0.5)", fontSize: 24 }}>
              {siteConfig.url.replace("https://", "").replace("http://", "")}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
