import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerAuthSession();
  const { slug } = await params;
  if (!session?.user?.id) return NextResponse.json({ saved: false });
  const book = await getPrisma().book.findUnique({ where: { slug }, select: { id: true } });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const saved = await getPrisma().savedBook.findUnique({ where: { userId_bookId: { userId: session.user.id, bookId: book.id } } });
  return NextResponse.json({ saved: Boolean(saved) });
}

export async function POST(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { slug } = await params;
  const prisma = getPrisma();
  const book = await prisma.book.findUnique({ where: { slug }, select: { id: true } });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const key = { userId: session.user.id, bookId: book.id };
  const existing = await prisma.savedBook.findUnique({ where: { userId_bookId: key } });
  if (existing) {
    await prisma.savedBook.delete({ where: { userId_bookId: key } });
    return NextResponse.json({ saved: false });
  }
  await prisma.savedBook.create({ data: key });
  return NextResponse.json({ saved: true });
}
