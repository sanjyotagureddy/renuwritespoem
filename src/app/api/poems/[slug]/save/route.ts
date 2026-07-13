import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerAuthSession();
  const { slug } = await params;
  if (!session?.user?.id) return NextResponse.json({ saved: false });
  const poem = await getPrisma().poem.findUnique({ where: { slug }, select: { id: true } });
  if (!poem) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const saved = await getPrisma().savedPoem.findUnique({ where: { userId_poemId: { userId: session.user.id, poemId: poem.id } } });
  return NextResponse.json({ saved: Boolean(saved) });
}

export async function POST(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { slug } = await params;
  const prisma = getPrisma();
  const poem = await prisma.poem.findUnique({ where: { slug }, select: { id: true } });
  if (!poem) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const key = { userId: session.user.id, poemId: poem.id };
  const existing = await prisma.savedPoem.findUnique({ where: { userId_poemId: key } });
  if (existing) {
    await prisma.savedPoem.delete({ where: { userId_poemId: key } });
    return NextResponse.json({ saved: false });
  }
  await prisma.savedPoem.create({ data: key });
  return NextResponse.json({ saved: true });
}
