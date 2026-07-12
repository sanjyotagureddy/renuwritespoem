import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const limitCheck = await rateLimit("audio-views", 60, 60000); // 60 per minute
    if (limitCheck.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { slug: id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing audio ID" }, { status: 400 });
    }

    const prisma = getPrisma();

    // Increment views count in database
    await prisma.audio.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to increment views:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
