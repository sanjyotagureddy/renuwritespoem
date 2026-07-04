import type { Metadata } from "next";
import { getPrisma } from "@/lib/db";
import CommentsList, { type CommentItem } from "@/components/admin/comments-list";

export const metadata: Metadata = {
  title: "Comments Moderation",
  description: "Approve or reject comments on poems and books.",
};

export default async function CommentsPage() {
  const prisma = getPrisma();

  const [poemComments, bookComments, songComments] = await Promise.all([
    prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        poem: { select: { title: true, slug: true } },
      },
    }),
    prisma.bookComment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        book: { select: { title: true, slug: true } },
      },
    }),
    prisma.songComment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        song: { select: { title: true, slug: true } },
      },
    }),
  ]);

  const unifiedComments: CommentItem[] = [
    ...poemComments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      status: c.status,
      user: {
        name: c.user.name,
        email: c.user.email,
      },
      commentType: "poem" as const,
      targetTitle: c.poem.title,
      targetLink: `/poems/${c.poem.slug}`,
      pinned: c.pinned,
    })),
    ...bookComments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      status: c.status,
      user: {
        name: c.user.name,
        email: c.user.email,
      },
      commentType: "book" as const,
      targetTitle: c.book.title,
      targetLink: `/books/${c.book.slug}`,
      pinned: c.pinned,
    })),
    ...songComments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      status: c.status,
      user: {
        name: c.user.name,
        email: c.user.email,
      },
      commentType: "song" as const,
      targetTitle: c.song.title,
      targetLink: `/songs`,
      pinned: c.pinned,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Comments Moderation</h1>
        <p className="text-sm text-white/50">
          Review comments before publishing them to the platform.
        </p>
      </div>

      <CommentsList initialComments={unifiedComments} />
    </div>
  );
}
