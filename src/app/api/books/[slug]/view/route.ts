import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { getServerAuthSession } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const limitCheck = await rateLimit("book-views", 60, 60000); // 60 per minute
    if (limitCheck.limited) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { slug: id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing book ID" }, { status: 400 });
    }

    const prisma = getPrisma();

    // Increment views count in database
    await prisma.book.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    const session = await getServerAuthSession();
    if (session?.user?.id) {
      await prisma.readerBookView.upsert({
        where: { userId_bookId: { userId: session.user.id, bookId: id } },
        create: { userId: session.user.id, bookId: id },
        update: { viewedAt: new Date() },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to increment views:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
