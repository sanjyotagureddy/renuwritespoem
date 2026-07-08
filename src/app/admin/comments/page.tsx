import type { Metadata } from "next";
import { getPrisma } from "@/lib/db";
import CommentsList, { type CommentItem } from "@/components/admin/comments-list";

export const metadata: Metadata = {
  title: "Comments Moderation",
  description: "Approve or reject comments on poems, books, and audio.",
};

type PageProps = {
  searchParams: Promise<{
    page?: string;
    filter?: string;
  }>;
};

export default async function CommentsPage({ searchParams }: PageProps) {
  const prisma = getPrisma();
  const { page: pageRaw, filter: filterRaw } = await searchParams;

  const page = parseInt(pageRaw ?? "1", 10) > 0 ? parseInt(pageRaw ?? "1", 10) : 1;
  const activeFilter = (filterRaw ?? "PENDING").toUpperCase() as "PENDING" | "APPROVED" | "REJECTED" | "ALL";
  const validFilters = ["PENDING", "APPROVED", "REJECTED", "ALL"];
  const filter = validFilters.includes(activeFilter) ? activeFilter : "PENDING";

  const pageSize = 15;
  const take = page * pageSize;

  const whereClause = filter === "ALL" ? {} : { status: filter };

  // Fetch comments up to current offset limit
  const [
    poemComments,
    bookComments,
    audioComments,
    // Status counts for filtering tabs
    pendingPoem, pendingBook, pendingAudio,
    approvedPoem, approvedBook, approvedAudio,
    rejectedPoem, rejectedBook, rejectedAudio,
  ] = await Promise.all([
    prisma.comment.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take,
      include: {
        user: { select: { name: true, email: true } },
        poem: { select: { title: true, slug: true } },
      },
    }),
    prisma.bookComment.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take,
      include: {
        user: { select: { name: true, email: true } },
        book: { select: { title: true, slug: true } },
      },
    }),
    prisma.audioComment.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take,
      include: {
        user: { select: { name: true, email: true } },
        audio: { select: { title: true, slug: true } },
      },
    }),
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.bookComment.count({ where: { status: "PENDING" } }),
    prisma.audioComment.count({ where: { status: "PENDING" } }),
    prisma.comment.count({ where: { status: "APPROVED" } }),
    prisma.bookComment.count({ where: { status: "APPROVED" } }),
    prisma.audioComment.count({ where: { status: "APPROVED" } }),
    prisma.comment.count({ where: { status: "REJECTED" } }),
    prisma.bookComment.count({ where: { status: "REJECTED" } }),
    prisma.audioComment.count({ where: { status: "REJECTED" } }),
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
    ...audioComments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
      status: c.status,
      user: {
        name: c.user.name,
        email: c.user.email,
      },
      commentType: "audio" as const,
      targetTitle: c.audio.title,
      targetLink: `/audio`,
      pinned: c.pinned,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const skip = (page - 1) * pageSize;
  const paginatedComments = unifiedComments.slice(skip, skip + pageSize);

  const pendingTotal = pendingPoem + pendingBook + pendingAudio;
  const approvedTotal = approvedPoem + approvedBook + approvedAudio;
  const rejectedTotal = rejectedPoem + rejectedBook + rejectedAudio;
  const allTotal = pendingTotal + approvedTotal + rejectedTotal;

  const counts = {
    PENDING: pendingTotal,
    APPROVED: approvedTotal,
    REJECTED: rejectedTotal,
    ALL: allTotal,
  };

  const currentFilterTotal = counts[filter];
  const hasNextPage = currentFilterTotal > page * pageSize;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Comments Moderation</h1>
        <p className="text-sm text-white/50">
          Review comments before publishing them to the platform.
        </p>
      </div>

      <CommentsList
        initialComments={paginatedComments}
        counts={counts}
        filter={filter}
        page={page}
        hasNextPage={hasNextPage}
      />
    </div>
  );
}
