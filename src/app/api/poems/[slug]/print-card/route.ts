import "regenerator-runtime/runtime";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { getPrisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { checkCommentTone } from "@/lib/contact-guard";
import { siteConfig } from "@/lib/seo";
import { invalidateCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  // 1. Rate Limit Check (8 requests per hour per IP)
  const limitCheck = await rateLimit("print-card", 8, 3600000);
  if (limitCheck.limited) {
    return NextResponse.json(
      { error: "Too many card generation requests. Please try again later." },
      { status: 429 }
    );
  }

  const { slug } = await params;
  const prisma = getPrisma();

  // 2. Query Poem
  const poem = await prisma.poem.findUnique({
    where: { slug },
  });

  if (!poem || !poem.published) {
    return NextResponse.json(
      { error: "Poem not found or not available for printing." },
      { status: 404 }
    );
  }

  // 3. Parse Dedication & Theme Options
  let body: any = {};

  try {
    body = await request.json();
  } catch {
    // If body is empty or invalid JSON, fall back to defaults
  }

  const dedicatedTo = (body.dedicatedTo || "").trim().slice(0, 40);
  const fromName = (body.fromName || "").trim().slice(0, 40);
  const message = (body.message || "").trim().slice(0, 150);
  const theme = (body.theme || "classic").toLowerCase();
  const orientation = (body.orientation || "landscape").toLowerCase();

  // 4. Content Tone Guard on Dedication Message
  if (message) {
    const toneCheck = checkCommentTone(message);
    if (toneCheck.isAbusive) {
      return NextResponse.json(
        { error: `Message issue: ${toneCheck.reason}` },
        { status: 400 }
      );
    }
  }

  try {
    // 5. Load Font Files
    const fontsDir = path.join(process.cwd(), "public", "fonts");

    const playfairRegularBytes = new Uint8Array(fs.readFileSync(path.join(fontsDir, "PlayfairDisplay-Regular.ttf")));
    const playfairBoldBytes = new Uint8Array(fs.readFileSync(path.join(fontsDir, "PlayfairDisplay-Bold.ttf")));
    const interRegularBytes = new Uint8Array(fs.readFileSync(path.join(fontsDir, "Inter-Regular.ttf")));
    const interBoldBytes = new Uint8Array(fs.readFileSync(path.join(fontsDir, "Inter-Bold.ttf")));
    const devanagariRegularBytes = new Uint8Array(fs.readFileSync(path.join(fontsDir, "NotoSansDevanagari-Regular.ttf")));
    const devanagariBoldBytes = new Uint8Array(fs.readFileSync(path.join(fontsDir, "NotoSansDevanagari-Bold.ttf")));

    // 6. Initialize PDF Document
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const fontPlayfairRegular = await pdfDoc.embedFont(playfairRegularBytes);
    const fontPlayfairBold = await pdfDoc.embedFont(playfairBoldBytes);
    const fontInterRegular = await pdfDoc.embedFont(interRegularBytes);
    const fontInterBold = await pdfDoc.embedFont(interBoldBytes);
    const fontDevanagariRegular = await pdfDoc.embedFont(devanagariRegularBytes);
    const fontDevanagariBold = await pdfDoc.embedFont(devanagariBoldBytes);

    // Determine default fonts based on language
    const isDevanagariPoem = poem.language === "HI" || poem.language === "MR";
    const bodyFont = isDevanagariPoem ? fontDevanagariRegular : fontInterRegular;
    const titleFont = isDevanagariPoem ? fontDevanagariBold : fontPlayfairBold;

    // helper to pick font for dedication fields (handles mixed Hindi/English names)
    const getFontForText = (text: string, defaultFont: any, bold = false) => {
      if (/[\u0900-\u097F]/.test(text)) {
        return bold ? fontDevanagariBold : fontDevanagariRegular;
      }
      return defaultFont;
    };

    // A5 Portrait canvas (width: 419.53 pt, height: 595.28 pt) - Ideal orientation for poetry cards
    const page = pdfDoc.addPage([419.53, 595.28]);
    const { width, height } = page.getSize();

    // 7. Theme Configurations
    let bgColor = rgb(0.99, 0.98, 0.96); // Classic Warm Ivory (#FDFBF7)
    let borderColor = rgb(0.83, 0.68, 0.21); // Gold Filigree (#D4AF37)
    let titleColor = rgb(0.1, 0.1, 0.1);
    let textColor = rgb(0.16, 0.16, 0.16);
    let accentColor = rgb(0.72, 0.52, 0.04);
    let watermarkColor = rgb(0.5, 0.4, 0.2);

    if (theme === "minimal") {
      bgColor = rgb(0.98, 0.98, 0.98); // Off-White (#FAFAFA)
      borderColor = rgb(0.35, 0.38, 0.42); // Slate Grey (#5A626A)
      titleColor = rgb(0.06, 0.07, 0.08);
      textColor = rgb(0.17, 0.18, 0.19);
      accentColor = rgb(0.29, 0.33, 0.41);
      watermarkColor = rgb(0.4, 0.42, 0.45);
    } else if (theme === "floral" || theme === "rose" || theme === "romantic") {
      bgColor = rgb(0.99, 0.91, 0.93); // Distinct Romantic Blush Rose (#FDE8EC)
      borderColor = rgb(0.54, 0.15, 0.24); // Deep Burgundy Wine (#8B263E)
      titleColor = rgb(0.29, 0.05, 0.11);
      textColor = rgb(0.24, 0.1, 0.14);
      accentColor = rgb(0.54, 0.15, 0.24);
      watermarkColor = rgb(0.5, 0.25, 0.3);
    }

    // Draw Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: bgColor,
    });

    // Draw Expressive Vector SVG Line Art Motif (Theme Matched, Positioned Above Footer)
    try {
      // Classic: Expressive Antique Calligraphy Quill & Swirl Flourishes
      let lineArtPath = "M 15 -35 C 20 -20 28 -5 18 20 C 12 30 0 38 -8 40 M 18 20 C 25 15 32 5 28 -10 M 15 -25 C 22 -20 26 -12 25 -2 M 12 -15 C 18 -10 22 -2 20 8 M 5 25 C -5 28 -15 25 -22 18 C -28 10 -25 -2 -15 -8 C -5 -12 8 -8 15 -2 C 22 5 25 18 18 28 M -12 5 C -18 12 -12 22 -2 20";
      if (theme === "minimal") {
        // Minimalist: Expressive Mountain Peaks, Crescent Moon & Flying Birds
        lineArtPath = "M -35 35 L -10 -10 L 10 15 L 35 35 M -10 -10 L 15 -35 M -20 20 L 5 -15 M -15 -25 C -8 -25 -5 -18 -8 -10 C -1 -12 3 -20 -3 -27 M 15 -20 C 20 -25 25 -22 28 -20 C 25 -15 20 -18 15 -20 M -25 -10 C -20 -15 -15 -12 -12 -10 C -15 -5 -20 -8 -25 -10";
      } else if (theme === "floral" || theme === "rose" || theme === "romantic") {
        // Floral: Expressive Botanical Rose Bloom, Petals & Leaf Sprig
        lineArtPath = "M 0 -15 C -8 -25 8 -25 0 -15 M -5 -20 C -18 -15 -12 0 0 5 C 12 0 18 -15 5 -20 M -12 -8 C -22 2 -8 18 0 18 C 8 18 22 2 12 -8 M 0 18 C 0 30 -5 38 -10 45 M -3 28 C -15 25 -20 35 -10 40 C -2 38 -3 28 -3 28 M 0 32 C 12 30 18 40 8 42 C 2 40 0 32 0 32";
      }

      const margin = 20;
      page.drawSvgPath(lineArtPath, {
        x: width - margin - 60,
        y: margin + 95,
        borderColor: borderColor,
        borderWidth: 1.2,
        opacity: 0.22,
        scale: 1.4,
      });
    } catch (svgErr) {
      console.warn("SVG watermark path drawing skipped:", svgErr);
    }

    // Draw Outer & Inner Decorative Borders
    const margin = 20;
    page.drawRectangle({
      x: margin,
      y: margin,
      width: width - margin * 2,
      height: height - margin * 2,
      borderColor: borderColor,
      borderWidth: 1.5,
    });

    page.drawRectangle({
      x: margin + 4,
      y: margin + 4,
      width: width - (margin + 4) * 2,
      height: height - (margin + 4) * 2,
      borderColor: borderColor,
      borderWidth: 0.5,
    });

    // Header Watermark Brand
    const brandText = "RENU WRITES POEM — KEEPSAKE CARD";
    page.drawText(brandText, {
      x: width / 2 - (fontInterBold.widthOfTextAtSize(brandText, 7) / 2),
      y: height - margin - 18,
      size: 7,
      font: fontInterBold,
      color: accentColor,
    });

    // Dedication Block (Top)
    let currentY = height - margin - 38;
    if (dedicatedTo || fromName || message) {
      let dedicationLine = "";
      if (dedicatedTo && fromName) {
        dedicationLine = `Dedicated to ${dedicatedTo} · From ${fromName}`;
      } else if (dedicatedTo) {
        dedicationLine = `Dedicated to ${dedicatedTo}`;
      } else if (fromName) {
        dedicationLine = `From ${fromName}`;
      }

      if (dedicationLine) {
        const lineFont = getFontForText(dedicationLine, fontInterBold, true);
        page.drawText(dedicationLine, {
          x: width / 2 - (lineFont.widthOfTextAtSize(dedicationLine, 10) / 2),
          y: currentY,
          size: 10,
          font: lineFont,
          color: accentColor,
        });
        currentY -= 16;
      }

      if (message) {
        const msgText = `"${message}"`;
        const msgFont = getFontForText(msgText, fontInterRegular, false);
        page.drawText(msgText, {
          x: width / 2 - (msgFont.widthOfTextAtSize(msgText, 9) / 2),
          y: currentY,
          size: 9,
          font: msgFont,
          color: textColor,
        });
        currentY -= 20;
      } else {
        currentY -= 6;
      }

      // Divider Line
      page.drawLine({
        start: { x: width / 2 - 40, y: currentY },
        end: { x: width / 2 + 40, y: currentY },
        thickness: 0.5,
        color: borderColor,
      });
      currentY -= 22;
    } else {
      currentY -= 10;
    }

    // Poem Title
    const titleFontSize = 18;
    const titleWidth = titleFont.widthOfTextAtSize(poem.title, titleFontSize);
    page.drawText(poem.title, {
      x: width / 2 - (titleWidth / 2),
      y: currentY,
      size: titleFontSize,
      font: titleFont,
      color: titleColor,
    });
    currentY -= 24;

    // Poem Author Byline
    const byline = "by Renu";
    const bylineWidth = fontInterRegular.widthOfTextAtSize(byline, 9);
    page.drawText(byline, {
      x: width / 2 - (bylineWidth / 2),
      y: currentY,
      size: 9,
      font: fontInterRegular,
      color: watermarkColor,
    });
    currentY -= 22;

    // Poem Lines Content
    const lines = poem.content
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    let poemFontSize = 11;
    let lineHeight = 17;
    if (lines.length > 15) {
      poemFontSize = 9.5;
      lineHeight = 14;
    } else if (lines.length > 22) {
      poemFontSize = 8.5;
      lineHeight = 12.5;
    }

    const maxVisibleLines = Math.floor((currentY - (margin + 35)) / lineHeight);
    const displayLines = lines.slice(0, maxVisibleLines);

    displayLines.forEach((line) => {
      const lineFont = getFontForText(line, bodyFont, false);
      const lineW = lineFont.widthOfTextAtSize(line, poemFontSize);
      page.drawText(line, {
        x: width / 2 - (lineW / 2),
        y: currentY,
        size: poemFontSize,
        font: lineFont,
        color: textColor,
      });
      currentY -= lineHeight;
    });

    if (lines.length > maxVisibleLines) {
      const ellipsisText = "...";
      const ellipsisW = fontInterRegular.widthOfTextAtSize(ellipsisText, 10);
      page.drawText(ellipsisText, {
        x: width / 2 - (ellipsisW / 2),
        y: currentY,
        size: 10,
        font: fontInterRegular,
        color: watermarkColor,
      });
    }

    // Footer Watermark & Poem Link
    const footerUrl = `${siteConfig.url}/poems/${poem.slug}`;
    const footerText = `Read full poem online at ${siteConfig.name} — ${footerUrl}`;
    page.drawText(footerText, {
      x: width / 2 - (fontInterRegular.widthOfTextAtSize(footerText, 7) / 2),
      y: margin + 10,
      size: 7,
      font: fontInterRegular,
      color: watermarkColor,
    });

    // 8. Update DB Counters & Logs
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipHash = forwardedFor ? forwardedFor.split(",")[0] : "127.0.0.1";

    try {
      if ("printCard" in prisma && typeof (prisma as any).printCard?.create === "function") {
        await prisma.$transaction([
          prisma.poem.update({
            where: { id: poem.id },
            data: { downloadCount: { increment: 1 } },
          }),
          (prisma as any).printCard.create({
            data: {
              poemId: poem.id,
              dedicatedTo: dedicatedTo || null,
              fromName: fromName || null,
              message: message || null,
              theme,
              ipHash,
            },
          }),
        ]);
        await invalidateCache(`poem:details:${slug}`);
      }
    } catch (dbErr) {
      console.warn("DB card count update skipped due to cached client schema:", dbErr);
    }

    // 9. Return PDF Response
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${poem.slug}-card.pdf"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Print card PDF generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate printable PDF card." },
      { status: 500 }
    );
  }
}
