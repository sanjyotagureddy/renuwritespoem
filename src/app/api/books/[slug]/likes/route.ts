import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const limitCheck = await rateLimit("book-likes", 15, 60000); // 15 per min
  if (limitCheck.limited) {
    return NextResponse.json(
      { error: "Too many actions. Please try again in a minute." },
      { status: 429 },
    );
  }
  const session = await getServerAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to like books." }, { status: 401 });
  }

  const { slug } = await params;
  const prisma = getPrisma();

  const book = await prisma.book.findUnique({ where: { slug }, select: { id: true } });
  if (!book) {
    return NextResponse.json({ error: "Book not found." }, { status: 404 });
  }

  const existing = await prisma.bookLike.findUnique({
    where: { bookId_userId: { bookId: book.id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.bookLike.delete({
      where: { bookId_userId: { bookId: book.id, userId: session.user.id } },
    });
  } else {
    await prisma.bookLike.create({
      data: { bookId: book.id, userId: session.user.id },
    });
  }

  const [likeCount, liked] = await Promise.all([
    prisma.bookLike.count({ where: { bookId: book.id } }),
    prisma.bookLike
      .findUnique({ where: { bookId_userId: { bookId: book.id, userId: session.user.id } } })
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

  const book = await prisma.book.findUnique({ where: { slug }, select: { id: true } });
  if (!book) {
    return NextResponse.json({ error: "Book not found." }, { status: 404 });
  }

  const [likeCount, likes, liked] = await Promise.all([
    prisma.bookLike.count({ where: { bookId: book.id } }),
    prisma.bookLike.findMany({
      where: { bookId: book.id },
      include: { user: { select: { name: true, image: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    session?.user?.id
      ? prisma.bookLike
          .findUnique({ where: { bookId_userId: { bookId: book.id, userId: session.user.id } } })
          .then((l) => Boolean(l))
      : Promise.resolve(false),
  ]);

  const users = likes.map((l) => ({
    name: l.user.name ?? l.user.email?.split("@")[0] ?? "Anonymous",
    image: l.user.image,
  }));

  return NextResponse.json({ liked, likeCount, users });
}
