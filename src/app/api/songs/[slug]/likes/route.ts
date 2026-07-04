import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const limitCheck = await rateLimit("song-likes", 15, 60000); // 15 per min
  if (limitCheck.limited) {
    return NextResponse.json(
      { error: "Too many actions. Please try again in a minute." },
      { status: 429 },
    );
  }
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to like songs." }, { status: 401 });
  }

  const { slug } = await params;
  const prisma = getPrisma();

  const song = await prisma.song.findUnique({ where: { slug }, select: { id: true } });
  if (!song) {
    return NextResponse.json({ error: "Song not found." }, { status: 404 });
  }

  const existing = await prisma.songLike.findUnique({
    where: { songId_userId: { songId: song.id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.songLike.delete({
      where: { songId_userId: { songId: song.id, userId: session.user.id } },
    });
  } else {
    await prisma.songLike.create({
      data: { songId: song.id, userId: session.user.id },
    });
  }

  const [likeCount, liked] = await Promise.all([
    prisma.songLike.count({ where: { songId: song.id } }),
    prisma.songLike
      .findUnique({
        where: { songId_userId: { songId: song.id, userId: session.user.id } },
      })
      .then((l) => Boolean(l)),
  ]);

  return NextResponse.json({ liked, likeCount });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getServerAuthSession();
  const { slug } = await params;
  const prisma = getPrisma();

  const song = await prisma.song.findUnique({ where: { slug }, select: { id: true } });
  if (!song) {
    return NextResponse.json({ error: "Song not found." }, { status: 404 });
  }

  const [likeCount, likes, liked] = await Promise.all([
    prisma.songLike.count({ where: { songId: song.id } }),
    prisma.songLike.findMany({
      where: { songId: song.id },
      include: { user: { select: { name: true, image: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    session?.user?.id
      ? prisma.songLike
          .findUnique({
            where: { songId_userId: { songId: song.id, userId: session.user.id } },
          })
          .then((l) => Boolean(l))
      : Promise.resolve(false),
  ]);

  const users = likes.map((l) => ({
    name: l.user.name ?? l.user.email?.split("@")[0] ?? "Anonymous",
    image: l.user.image,
  }));

  return NextResponse.json({ liked, likeCount, users });
}
