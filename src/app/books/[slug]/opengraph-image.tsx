import { ImageResponse } from "next/og";
import { getPrisma } from "@/lib/db";
import { siteConfig } from "@/lib/seo";

export const runtime = "nodejs";

export const alt = "Renu Writes Poem - Book Details";
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
  
  const book = await prisma.book.findUnique({
    where: { slug },
    select: { title: true, description: true, status: true, price: true, coverImage: true },
  });

  if (!book) {
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
          Book Not Found
        </div>
      ),
      { ...size }
    );
  }

  const imageUrl = book.coverImage
    ? (book.coverImage.startsWith("http") ? book.coverImage : `${siteConfig.url}${book.coverImage}`)
    : `${siteConfig.url}/author.jpg`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a", // neutral-950
          backgroundImage: "radial-gradient(circle at top left, rgba(16,185,129,0.15), transparent 50%), radial-gradient(circle at bottom right, rgba(255,255,255,0.05), transparent 50%)",
          fontFamily: "sans-serif",
          padding: "50px 60px",
        }}
      >
        {/* Left Side: Book Cover */}
        <div style={{ display: "flex", width: "35%", height: "100%", justifyContent: "center", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={book.title}
            style={{
              width: "320px",
              height: "440px",
              objectFit: "cover",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          />
        </div>

        {/* Right Side: Details */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "60%",
            height: "100%",
            justifyContent: "center",
            paddingLeft: "20px",
          }}
        >
          {/* Status & Price Badge */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                padding: "6px 16px",
                borderRadius: "9999px",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                background: "rgba(16, 185, 129, 0.1)",
                color: "#34d399", // emerald-400
                fontSize: 16,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              {book.status === "AVAILABLE" ? "Available" : book.status === "COMING_SOON" ? "Coming Soon" : "Archived"}
            </div>
            {book.price && (
              <div
                style={{
                  display: "flex",
                  padding: "6px 16px",
                  borderRadius: "9999px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "white",
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                ₹{Number(book.price)}
              </div>
            )}
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              fontSize: 54,
              fontWeight: 700,
              color: "white",
              marginBottom: "20px",
              lineHeight: 1.2,
            }}
          >
            {book.title}
          </div>

          {/* Description */}
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "rgba(255, 255, 255, 0.7)",
              lineHeight: 1.5,
              marginBottom: "30px",
              overflow: "hidden",
            }}
          >
            {book.description ?? `A book by ${siteConfig.author}.`}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "auto",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", color: "white", fontSize: 20, fontWeight: "bold" }}>
              Renu Writes Poem
            </div>
            <div style={{ display: "flex", color: "rgba(255, 255, 255, 0.5)", fontSize: 20 }}>
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
