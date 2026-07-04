import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ commentId: string }> },
) {
  const limitCheck = await rateLimit("book-comment-likes", 15, 60000); // 15 per min
  if (limitCheck.limited) {
    return NextResponse.json(
      { error: "Too many actions. Please try again in a minute." },
      { status: 429 },
    );
  }
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to like comments." }, { status: 401 });
  }

  const { commentId } = await params;
  const prisma = getPrisma();

  const comment = await prisma.bookComment.findUnique({ where: { id: commentId }, select: { id: true } });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }

  const existing = await prisma.bookCommentLike.findUnique({
    where: { commentId_userId: { commentId, userId: session.user.id } },
  });

  if (existing) {
    await prisma.bookCommentLike.delete({
      where: { commentId_userId: { commentId, userId: session.user.id } },
    });
  } else {
    await prisma.bookCommentLike.create({
      data: { commentId, userId: session.user.id },
    });
  }

  const likeCount = await prisma.bookCommentLike.count({ where: { commentId } });

  return NextResponse.json({ liked: !existing, likeCount });
}
