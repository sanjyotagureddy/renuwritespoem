import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { rateLimit } from "@/lib/moderation/rate-limit";
import { getServerAuthSession } from "@/lib/auth";
import { fetchUserBadgeStats, getBadges } from "@/lib/domain/badges";

export async function GET() {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limitCheck = await rateLimit("check-badges", 60, 60000); // 60 requests per minute
    if (limitCheck.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const prisma = getPrisma();
    const userId = session.user.id;
    const userEmail = session.user.email ?? "";

    const stats = await fetchUserBadgeStats(prisma, userId, userEmail);
    const badges = getBadges(stats);

    return NextResponse.json(badges);
  } catch (err) {
    console.error("Failed to check user badges:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
