import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { rateLimit } from "@/lib/moderation/rate-limit";
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

    const { slug: idOrSlug } = await params;
    if (!idOrSlug) {
      return NextResponse.json({ error: "Missing book identifier" }, { status: 400 });
    }

    const prisma = getPrisma();

    // Find book by ID or Slug
    const book = await prisma.book.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Increment views count in database
    await prisma.book.update({
      where: { id: book.id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    const session = await getServerAuthSession();
    if (session?.user?.id) {
      await prisma.readerBookView.upsert({
        where: { userId_bookId: { userId: session.user.id, bookId: book.id } },
        create: { userId: session.user.id, bookId: book.id },
        update: { viewedAt: new Date() },
      });
    }

    return NextResponse.json({ success: true, views: book.views + 1 });
  } catch (err) {
    console.error("Failed to increment book views:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
