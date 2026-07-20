import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { rateLimit } from "@/lib/moderation/rate-limit";

export type LikeType = "poem" | "book" | "audio";
export type CommentLikeType = "poemComment" | "bookComment" | "audioComment";

interface SharedLike {
  user: {
    name: string | null;
    image: string | null;
    email: string | null;
  };
}

export async function handleCommentLikeToggle(
  commentId: string,
  type: CommentLikeType
) {
  try {
    const limitCheck = await rateLimit("comment-likes", 15, 60000); // 15 per min
    if (limitCheck.limited) {
      return NextResponse.json(
        { error: "Too many actions. Please try again in a minute." },
        { status: 429 }
      );
    }
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to like comments." }, { status: 401 });
    }

    const prisma = getPrisma();
    let commentExists = false;

    if (type === "poemComment") {
      const c = await prisma.comment.findUnique({ where: { id: commentId }, select: { id: true } });
      commentExists = !!c;
    } else if (type === "bookComment") {
      const c = await prisma.bookComment.findUnique({ where: { id: commentId }, select: { id: true } });
      commentExists = !!c;
    } else {
      const c = await prisma.audioComment.findUnique({ where: { id: commentId }, select: { id: true } });
      commentExists = !!c;
    }

    if (!commentExists) {
      return NextResponse.json({ error: "Comment not found." }, { status: 404 });
    }

    let existing = false;
    if (type === "poemComment") {
      const l = await prisma.commentLike.findUnique({ where: { commentId_userId: { commentId, userId: session.user.id } } });
      existing = !!l;
      if (existing) {
        await prisma.commentLike.delete({ where: { commentId_userId: { commentId, userId: session.user.id } } });
      } else {
        await prisma.commentLike.create({ data: { commentId, userId: session.user.id } });
      }
    } else if (type === "bookComment") {
      const l = await prisma.bookCommentLike.findUnique({ where: { commentId_userId: { commentId, userId: session.user.id } } });
      existing = !!l;
      if (existing) {
        await prisma.bookCommentLike.delete({ where: { commentId_userId: { commentId, userId: session.user.id } } });
      } else {
        await prisma.bookCommentLike.create({ data: { commentId, userId: session.user.id } });
      }
    } else {
      const l = await prisma.audioCommentLike.findUnique({ where: { commentId_userId: { commentId, userId: session.user.id } } });
      existing = !!l;
      if (existing) {
        await prisma.audioCommentLike.delete({ where: { commentId_userId: { commentId, userId: session.user.id } } });
      } else {
        await prisma.audioCommentLike.create({ data: { commentId, userId: session.user.id } });
      }
    }

    let likeCount = 0;
    if (type === "poemComment") {
      likeCount = await prisma.commentLike.count({ where: { commentId } });
    } else if (type === "bookComment") {
      likeCount = await prisma.bookCommentLike.count({ where: { commentId } });
    } else {
      likeCount = await prisma.audioCommentLike.count({ where: { commentId } });
    }

    return NextResponse.json({ liked: !existing, likeCount });
  } catch (err) {
    console.error(`Toggle comment like error for ${type}:`, err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function handleEntityLikeToggle(
  slug: string,
  type: LikeType
) {
  try {
    const limitCheck = await rateLimit(`${type}-likes`, 15, 60000);
    if (limitCheck.limited) {
      return NextResponse.json(
        { error: "Too many actions. Please try again in a minute." },
        { status: 429 }
      );
    }
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: `Sign in to like ${type}s.` }, { status: 401 });
    }

    const prisma = getPrisma();
    let entityId: string | null = null;

    if (type === "poem") {
      const p = await prisma.poem.findUnique({ where: { slug }, select: { id: true } });
      if (!p) return NextResponse.json({ error: "Poem not found." }, { status: 404 });
      entityId = p.id;
    } else if (type === "book") {
      const b = await prisma.book.findUnique({ where: { slug }, select: { id: true } });
      if (!b) return NextResponse.json({ error: "Book not found." }, { status: 404 });
      entityId = b.id;
    } else {
      const a = await prisma.audio.findUnique({ where: { slug }, select: { id: true } });
      if (!a) return NextResponse.json({ error: "Audio not found." }, { status: 404 });
      entityId = a.id;
    }

    let existing = false;
    if (type === "poem") {
      const l = await prisma.like.findUnique({ where: { poemId_userId: { poemId: entityId, userId: session.user.id } } });
      existing = !!l;
      if (existing) {
        await prisma.like.delete({ where: { poemId_userId: { poemId: entityId, userId: session.user.id } } });
      } else {
        await prisma.like.create({ data: { poemId: entityId, userId: session.user.id } });
      }
    } else if (type === "book") {
      const l = await prisma.bookLike.findUnique({ where: { bookId_userId: { bookId: entityId, userId: session.user.id } } });
      existing = !!l;
      if (existing) {
        await prisma.bookLike.delete({ where: { bookId_userId: { bookId: entityId, userId: session.user.id } } });
      } else {
        await prisma.bookLike.create({ data: { bookId: entityId, userId: session.user.id } });
      }
    } else {
      const l = await prisma.audioLike.findUnique({ where: { audioId_userId: { audioId: entityId, userId: session.user.id } } });
      existing = !!l;
      if (existing) {
        await prisma.audioLike.delete({ where: { audioId_userId: { audioId: entityId, userId: session.user.id } } });
      } else {
        await prisma.audioLike.create({ data: { audioId: entityId, userId: session.user.id } });
      }
    }

    let likeCount = 0;
    let liked = false;
    if (type === "poem") {
      likeCount = await prisma.like.count({ where: { poemId: entityId } });
      const l = await prisma.like.findUnique({ where: { poemId_userId: { poemId: entityId, userId: session.user.id } } });
      liked = !!l;
    } else if (type === "book") {
      likeCount = await prisma.bookLike.count({ where: { bookId: entityId } });
      const l = await prisma.bookLike.findUnique({ where: { bookId_userId: { bookId: entityId, userId: session.user.id } } });
      liked = !!l;
    } else {
      likeCount = await prisma.audioLike.count({ where: { audioId: entityId } });
      const l = await prisma.audioLike.findUnique({ where: { audioId_userId: { audioId: entityId, userId: session.user.id } } });
      liked = !!l;
    }

    return NextResponse.json({ liked, likeCount });
  } catch (err) {
    console.error(`Toggle entity like error for ${type}:`, err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function handleGetEntityLikes(
  slug: string,
  type: LikeType
) {
  try {
    const session = await getServerAuthSession();
    const prisma = getPrisma();
    let entityId: string | null = null;

    if (type === "poem") {
      const p = await prisma.poem.findUnique({ where: { slug }, select: { id: true } });
      if (!p) return NextResponse.json({ error: "Poem not found." }, { status: 404 });
      entityId = p.id;
    } else if (type === "book") {
      const b = await prisma.book.findUnique({ where: { slug }, select: { id: true } });
      if (!b) return NextResponse.json({ error: "Book not found." }, { status: 404 });
      entityId = b.id;
    } else {
      const a = await prisma.audio.findUnique({ where: { slug }, select: { id: true } });
      if (!a) return NextResponse.json({ error: "Audio not found." }, { status: 404 });
      entityId = a.id;
    }

    let likeCount = 0;
    let likes: SharedLike[] = [];
    let liked = false;

    if (type === "poem") {
      const [resCount, resLikes, resLiked] = await Promise.all([
        prisma.like.count({ where: { poemId: entityId } }),
        prisma.like.findMany({
          where: { poemId: entityId },
          include: { user: { select: { name: true, image: true, email: true } } },
          orderBy: { createdAt: "desc" },
        }),
        session?.user?.id
          ? prisma.like.findUnique({ where: { poemId_userId: { poemId: entityId, userId: session.user.id } } }).then((l) => !!l)
          : Promise.resolve(false),
      ]);
      likeCount = resCount;
      likes = resLikes;
      liked = resLiked;
    } else if (type === "book") {
      const [resCount, resLikes, resLiked] = await Promise.all([
        prisma.bookLike.count({ where: { bookId: entityId } }),
        prisma.bookLike.findMany({
          where: { bookId: entityId },
          include: { user: { select: { name: true, image: true, email: true } } },
          orderBy: { createdAt: "desc" },
        }),
        session?.user?.id
          ? prisma.bookLike.findUnique({ where: { bookId_userId: { bookId: entityId, userId: session.user.id } } }).then((l) => !!l)
          : Promise.resolve(false),
      ]);
      likeCount = resCount;
      likes = resLikes;
      liked = resLiked;
    } else {
      const [resCount, resLikes, resLiked] = await Promise.all([
        prisma.audioLike.count({ where: { audioId: entityId } }),
        prisma.audioLike.findMany({
          where: { audioId: entityId },
          include: { user: { select: { name: true, image: true, email: true } } },
          orderBy: { createdAt: "desc" },
        }),
        session?.user?.id
          ? prisma.audioLike.findUnique({ where: { audioId_userId: { audioId: entityId, userId: session.user.id } } }).then((l) => !!l)
          : Promise.resolve(false),
      ]);
      likeCount = resCount;
      likes = resLikes;
      liked = resLiked;
    }

    const users = likes.map((l) => ({
      name: l.user.name ?? l.user.email?.split("@")[0] ?? "Anonymous",
      image: l.user.image,
    }));

    return NextResponse.json({ liked, likeCount, users });
  } catch (err) {
    console.error(`Get entity likes error for ${type}:`, err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
