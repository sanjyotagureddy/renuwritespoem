import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { rateLimit } from "@/lib/moderation/rate-limit";

export async function POST(request: Request) {
  try {
    const limitCheck = await rateLimit("attribution-log", 30, 60000); // 30 per minute
    if (limitCheck.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { source, path } = await request.json();

    if (!source || typeof source !== "string") {
      return NextResponse.json({ error: "Invalid source parameter" }, { status: 400 });
    }

    const prisma = getPrisma();

    // Write to database click logs
    await prisma.attributionLog.create({
      data: {
        source: source.toLowerCase().slice(0, 50),
        path: typeof path === "string" ? path.slice(0, 255) : "/",
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to log attribution click:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
