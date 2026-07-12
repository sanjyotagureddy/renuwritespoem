import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { checkCommentTone } from "@/lib/contact-guard";
import { rateLimit } from "@/lib/rate-limit";

export type CommentType = "poem" | "book" | "audio";

interface SharedComment {
  id: string;
  body: string;
  createdAt: Date;
  edited: boolean;
  userId: string;
  pinned: boolean;
  user: {
    name: string | null;
    image: string | null;
    email: string | null;
  };
  _count: {
    likes: number;
  };
  likes?: { userId: string }[];
}

interface CreatedComment {
  id: string;
  body: string;
  createdAt: Date;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  pinned: boolean;
  user: {
    name: string | null;
    image: string | null;
    email: string | null;
  };
}

interface CommentUserId {
  userId: string;
}

interface UpdatedComment {
  id: string;
  body: string;
  edited: boolean;
}

export async function handleGetComments(
  request: Request,
  slug: string,
  type: CommentType
) {
  try {
    const session = await getServerAuthSession();
    const prisma = getPrisma();
    const userId = session?.user?.id;

    let entityId: string | null = null;
    if (type === "poem") {
      const poem = await prisma.poem.findUnique({ where: { slug }, select: { id: true } });
      if (!poem) return NextResponse.json({ error: "Poem not found." }, { status: 404 });
      entityId = poem.id;
    } else if (type === "book") {
      const book = await prisma.book.findUnique({ where: { slug }, select: { id: true } });
      if (!book) return NextResponse.json({ error: "Book not found." }, { status: 404 });
      entityId = book.id;
    } else if (type === "audio") {
      const audio = await prisma.audio.findUnique({ where: { slug }, select: { id: true } });
      if (!audio) return NextResponse.json({ error: "Audio not found." }, { status: 404 });
      entityId = audio.id;
    }

    if (!entityId) return NextResponse.json({ error: "Entity not found." }, { status: 404 });

    const url = new URL(request.url);
    let limit = parseInt(url.searchParams.get("limit") ?? "4", 10);
    if (isNaN(limit) || limit < 1) limit = 4;
    else if (limit > 50) limit = 50;

    let offset = parseInt(url.searchParams.get("offset") ?? "0", 10);
    if (isNaN(offset) || offset < 0) offset = 0;

    let comments: SharedComment[] = [];
    let totalCount = 0;

    if (type === "poem") {
      const [resComments, resCount] = await Promise.all([
        prisma.comment.findMany({
          where: { poemId: entityId, status: "APPROVED" },
          orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
          skip: offset,
          take: limit + 1,
          include: {
            user: { select: { name: true, image: true, email: true } },
            _count: { select: { likes: true } },
            ...(userId ? { likes: { where: { userId }, select: { userId: true } } } : {}),
          },
        }),
        prisma.comment.count({ where: { poemId: entityId, status: "APPROVED" } }),
      ]);
      comments = resComments;
      totalCount = resCount;
    } else if (type === "book") {
      const [resComments, resCount] = await Promise.all([
        prisma.bookComment.findMany({
          where: { bookId: entityId, status: "APPROVED" },
          orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
          skip: offset,
          take: limit + 1,
          include: {
            user: { select: { name: true, image: true, email: true } },
            _count: { select: { likes: true } },
            ...(userId ? { likes: { where: { userId }, select: { userId: true } } } : {}),
          },
        }),
        prisma.bookComment.count({ where: { bookId: entityId, status: "APPROVED" } }),
      ]);
      comments = resComments;
      totalCount = resCount;
    } else {
      const [resComments, resCount] = await Promise.all([
        prisma.audioComment.findMany({
          where: { audioId: entityId, status: "APPROVED" },
          orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
          skip: offset,
          take: limit + 1,
          include: {
            user: { select: { name: true, image: true, email: true } },
            _count: { select: { likes: true } },
            ...(userId ? { likes: { where: { userId }, select: { userId: true } } } : {}),
          },
        }),
        prisma.audioComment.count({ where: { audioId: entityId, status: "APPROVED" } }),
      ]);
      comments = resComments;
      totalCount = resCount;
    }

    const hasMore = comments.length > limit;
    const paginatedComments = hasMore ? comments.slice(0, limit) : comments;

    return NextResponse.json({
      comments: paginatedComments.map((c) => {
        const likesArr = c.likes && Array.isArray(c.likes) ? c.likes : [];
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
  } catch (err) {
    console.error(`Get comments error for ${type}:`, err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function handlePostComment(
  request: Request,
  slug: string,
  type: CommentType
) {
  try {
    const limitCheck = await rateLimit(`${type}-comments`, 5, 60000);
    if (limitCheck.limited) {
      return NextResponse.json(
        { error: "Too many comments posted. Please try again in a minute." },
        { status: 429 }
      );
    }

    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to comment." }, { status: 401 });
    }

    const prisma = getPrisma();
    let entityId: string | null = null;
    if (type === "poem") {
      const poem = await prisma.poem.findUnique({ where: { slug }, select: { id: true } });
      if (!poem) return NextResponse.json({ error: "Poem not found." }, { status: 404 });
      entityId = poem.id;
    } else if (type === "book") {
      const book = await prisma.book.findUnique({ where: { slug }, select: { id: true } });
      if (!book) return NextResponse.json({ error: "Book not found." }, { status: 404 });
      entityId = book.id;
    } else if (type === "audio") {
      const audio = await prisma.audio.findUnique({ where: { slug }, select: { id: true } });
      if (!audio) return NextResponse.json({ error: "Audio not found." }, { status: 404 });
      entityId = audio.id;
    }

    if (!entityId) return NextResponse.json({ error: "Entity not found." }, { status: 404 });

    const body = await request.json();
    const text = String(body.text ?? "").trim();

    if (!text || text.length > 1000) {
      return NextResponse.json(
        { error: "Comment must be between 1 and 1000 characters." },
        { status: 400 }
      );
    }

    const toneCheck = checkCommentTone(text);
    const status = toneCheck.isAbusive ? "PENDING" : "APPROVED";

    let comment: CreatedComment;
    if (type === "poem") {
      comment = await prisma.comment.create({
        data: { body: text, poemId: entityId, userId: session.user.id, status },
        include: { user: { select: { name: true, image: true, email: true } } },
      });
    } else if (type === "book") {
      comment = await prisma.bookComment.create({
        data: { body: text, bookId: entityId, userId: session.user.id, status },
        include: { user: { select: { name: true, image: true, email: true } } },
      });
    } else {
      comment = await prisma.audioComment.create({
        data: { body: text, audioId: entityId, userId: session.user.id, status },
        include: { user: { select: { name: true, image: true, email: true } } },
      });
    }

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
  } catch (err) {
    console.error(`Post comment error for ${type}:`, err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function handlePatchComment(
  request: Request,
  commentId: string,
  type: CommentType
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const prisma = getPrisma();
    let comment: CommentUserId | null;
    if (type === "poem") {
      comment = await prisma.comment.findUnique({ where: { id: commentId }, select: { userId: true } });
    } else if (type === "book") {
      comment = await prisma.bookComment.findUnique({ where: { id: commentId }, select: { userId: true } });
    } else {
      comment = await prisma.audioComment.findUnique({ where: { id: commentId }, select: { userId: true } });
    }

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

    let updated: UpdatedComment;
    if (type === "poem") {
      updated = await prisma.comment.update({ where: { id: commentId }, data: { body: text, edited: true } });
    } else if (type === "book") {
      updated = await prisma.bookComment.update({ where: { id: commentId }, data: { body: text, edited: true } });
    } else {
      updated = await prisma.audioComment.update({ where: { id: commentId }, data: { body: text, edited: true } });
    }

    return NextResponse.json({ id: updated.id, body: updated.body, edited: updated.edited });
  } catch (err) {
    console.error(`Patch comment error for ${type}:`, err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function handleDeleteComment(
  commentId: string,
  type: CommentType
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const prisma = getPrisma();
    let comment: CommentUserId | null;
    if (type === "poem") {
      comment = await prisma.comment.findUnique({ where: { id: commentId }, select: { userId: true } });
    } else if (type === "book") {
      comment = await prisma.bookComment.findUnique({ where: { id: commentId }, select: { userId: true } });
    } else {
      comment = await prisma.audioComment.findUnique({ where: { id: commentId }, select: { userId: true } });
    }

    if (!comment) {
      return NextResponse.json({ error: "Comment not found." }, { status: 404 });
    }

    if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "You cannot delete this comment." }, { status: 403 });
    }

    if (type === "poem") {
      await prisma.comment.delete({ where: { id: commentId } });
    } else if (type === "book") {
      await prisma.bookComment.delete({ where: { id: commentId } });
    } else {
      await prisma.audioComment.delete({ where: { id: commentId } });
    }

    return NextResponse.json({ deleted: true });
  } catch (err) {
    console.error(`Delete comment error for ${type}:`, err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
