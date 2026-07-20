import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { rateLimit } from "@/lib/moderation/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const limitCheck = await rateLimit("audio-views", 60, 60000); // 60 per minute
    if (limitCheck.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { slug: idOrSlug } = await params;
    if (!idOrSlug) {
      return NextResponse.json({ error: "Missing audio identifier" }, { status: 400 });
    }

    const prisma = getPrisma();

    // Find audio track by ID or Slug
    const audio = await prisma.audio.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!audio) {
      return NextResponse.json({ error: "Audio track not found" }, { status: 404 });
    }

    // Increment views count in database
    await prisma.audio.update({
      where: { id: audio.id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true, views: audio.views + 1 });
  } catch (err) {
    console.error("Failed to increment audio views:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
