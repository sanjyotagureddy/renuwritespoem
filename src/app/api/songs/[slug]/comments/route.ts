import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { checkCommentTone } from "@/lib/contact-guard";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const limitCheck = await rateLimit("song-comments", 5, 60000); // 5 per min
  if (limitCheck.limited) {
    return NextResponse.json(
      { error: "Too many comments posted. Please try again in a minute." },
      { status: 429 },
    );
  }
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to comment." }, { status: 401 });
  }

  const { slug } = await params;
  const prisma = getPrisma();

  const song = await prisma.song.findUnique({ where: { slug }, select: { id: true } });
  if (!song) {
    return NextResponse.json({ error: "Song not found." }, { status: 404 });
  }

  const body = await request.json();
  const text = String(body.text ?? "").trim();

  if (!text || text.length > 1000) {
    return NextResponse.json(
      { error: "Comment must be between 1 and 1000 characters." },
      { status: 400 },
    );
  }

  const toneCheck = checkCommentTone(text);
  const status = toneCheck.isAbusive ? "PENDING" : "APPROVED";

  const comment = await prisma.songComment.create({
    data: {
      body: text,
      songId: song.id,
      userId: session.user.id,
      status,
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
    status: comment.status,
    pinned: false,
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getServerAuthSession();
  const { slug } = await params;
  const prisma = getPrisma();

  const song = await prisma.song.findUnique({ where: { slug }, select: { id: true } });
  if (!song) {
    return NextResponse.json({ error: "Song not found." }, { status: 404 });
  }

  const userId = session?.user?.id;

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "4", 10);
  const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

  const [comments, totalCount] = await Promise.all([
    prisma.songComment.findMany({
      where: { songId: song.id, status: "APPROVED" },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      skip: offset,
      take: limit + 1,
      include: {
        user: { select: { name: true, image: true, email: true } },
        _count: { select: { likes: true } },
        ...(userId
          ? { likes: { where: { userId }, select: { userId: true } } }
          : {}),
      },
    }),
    prisma.songComment.count({
      where: { songId: song.id, status: "APPROVED" },
    }),
  ]);

  const hasMore = comments.length > limit;
  const paginatedComments = hasMore ? comments.slice(0, limit) : comments;

  return NextResponse.json({
    comments: paginatedComments.map((c) => {
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
        pinned: c.pinned,
      };
    }),
    hasMore,
    totalCount,
  });
}
