import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ commentId: string }> },
) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { commentId } = await params;
  const prisma = getPrisma();

  const comment = await prisma.bookComment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });

  if (!comment) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }
  if (comment.userId !== session.user.id) {
    return NextResponse.json({ error: "You can only edit your own comments." }, { status: 403 });
  }

  const body = await request.json();
  const text = String(body.text ?? "").trim();

  if (!text || text.length > 1000) {
    return NextResponse.json({ error: "Comment must be between 1 and 1000 characters." }, { status: 400 });
  }

  const updated = await prisma.bookComment.update({
    where: { id: commentId },
    data: { body: text, edited: true },
  });

  return NextResponse.json({ id: updated.id, body: updated.body, edited: updated.edited });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ commentId: string }> },
) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { commentId } = await params;
  const prisma = getPrisma();

  const comment = await prisma.bookComment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });

  if (!comment) {
    return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  }
  if (comment.userId !== session.user.id) {
    return NextResponse.json({ error: "You can only delete your own comments." }, { status: 403 });
  }

  await prisma.bookComment.delete({ where: { id: commentId } });

  return NextResponse.json({ deleted: true });
}
