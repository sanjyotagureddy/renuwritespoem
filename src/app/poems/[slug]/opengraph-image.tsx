import { ImageResponse } from "next/og";
import { getPrisma } from "@/lib/db";
import { siteConfig } from "@/lib/seo";

export const runtime = "nodejs"; // Prisma doesn't work well on Edge by default unless using Prisma Accelerate/WASM

// Image metadata
export const alt = "Renu Writes Poem";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prisma = getPrisma();
  
  const poem = await prisma.poem.findUnique({
    where: { slug },
    select: { title: true, excerpt: true, content: true, language: true, coverImage: true },
  });

  if (!poem) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 64,
            background: "#0a0a0a",
            color: "white",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Poem Not Found
        </div>
      ),
      { ...size }
    );
  }

  const excerpt = poem.excerpt ?? poem.content.slice(0, 150).trim() + "...";

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
          backgroundImage: "radial-gradient(circle at top left, rgba(251,191,36,0.15), transparent 50%), radial-gradient(circle at bottom right, rgba(255,255,255,0.05), transparent 50%)",
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
            border: "1px solid rgba(255, 255, 255, 0.1)",
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
              border: "1px solid rgba(251, 191, 36, 0.3)",
              background: "rgba(251, 191, 36, 0.1)",
              color: "#fcd34d", // amber-300
              fontSize: 20,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              marginBottom: "40px",
            }}
          >
            {poem.language === "EN" ? "English Poem" : poem.language === "HI" ? "हिन्दी कविता" : "मराठी कविता"}
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
              overflow: "hidden",
            }}
          >
            {poem.title}
          </div>

          {/* Excerpt */}
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "rgba(255, 255, 255, 0.7)",
              lineHeight: 1.5,
              maxWidth: "800px",
              overflow: "hidden",
            }}
          >
            {excerpt}
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
