import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to comment." }, { status: 401 });
  }

  const { slug } = await params;
  const prisma = getPrisma();

  const poem = await prisma.poem.findUnique({ where: { slug }, select: { id: true } });
  if (!poem) {
    return NextResponse.json({ error: "Poem not found." }, { status: 404 });
  }

  const body = await request.json();
  const text = String(body.text ?? "").trim();

  if (!text || text.length > 1000) {
    return NextResponse.json(
      { error: "Comment must be between 1 and 1000 characters." },
      { status: 400 },
    );
  }

  const comment = await prisma.comment.create({
    data: {
      body: text,
      poemId: poem.id,
      userId: session.user.id,
      status: "APPROVED",
    },
    include: {
      user: { select: { name: true, image: true, email: true } },
    },
  });

  return NextResponse.json({
    id: comment.id,
    body: comment.body,
    createdAt: comment.createdAt,
    edited: false,
    userId: session.user.id,
    likeCount: 0,
    liked: false,
    user: {
      name: comment.user.name ?? comment.user.email?.split("@")[0] ?? "Anonymous",
      image: comment.user.image,
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getServerAuthSession();
  const { slug } = await params;
  const prisma = getPrisma();

  const poem = await prisma.poem.findUnique({ where: { slug }, select: { id: true } });
  if (!poem) {
    return NextResponse.json({ error: "Poem not found." }, { status: 404 });
  }

  const userId = session?.user?.id;

  const comments = await prisma.comment.findMany({
    where: { poemId: poem.id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, image: true, email: true } },
      _count: { select: { likes: true } },
      ...(userId
        ? { likes: { where: { userId }, select: { userId: true } } }
        : {}),
    },
  });

  return NextResponse.json(
    comments.map((c) => {
      const likesArr = "likes" in c && Array.isArray(c.likes) ? c.likes : [];
      return {
        id: c.id,
        body: c.body,
        createdAt: c.createdAt,
        edited: c.edited,
        userId: c.userId,
        likeCount: c._count.likes,
        liked: likesArr.length > 0,
        user: {
          name: c.user.name ?? c.user.email?.split("@")[0] ?? "Anonymous",
          image: c.user.image,
        },
      };
    }),
  );
}
