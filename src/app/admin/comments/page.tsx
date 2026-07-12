import type { Metadata } from "next";
import { getPrisma } from "@/lib/db";
import CommentsList, { type CommentItem } from "@/components/admin/comments-list";

export const dynamic = "force-dynamic";

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

type RawComment = {
  id: string;
  body: string;
  createdAt: Date;
  status: string;
  pinned: boolean;
  commentType: string;
  targetTitle: string;
  targetSlug: string;
  userName: string | null;
  userEmail: string;
};

export default async function CommentsPage({ searchParams }: PageProps) {
  const prisma = getPrisma();
  const { page: pageRaw, filter: filterRaw } = await searchParams;

  const page = parseInt(pageRaw ?? "1", 10) > 0 ? parseInt(pageRaw ?? "1", 10) : 1;
  const activeFilter = (filterRaw ?? "PENDING").toUpperCase() as "PENDING" | "APPROVED" | "REJECTED" | "ALL";
  const validFilters = ["PENDING", "APPROVED", "REJECTED", "ALL"];
  const filter = validFilters.includes(activeFilter) ? activeFilter : "PENDING";

  const pageSize = 15;
  const skip = (page - 1) * pageSize;
  const statusFilter = filter === "ALL" ? null : filter;

  // Fetch comments page and count in parallel
  const [
    rawComments,
    // Status counts for filtering tabs
    pendingPoem, pendingBook, pendingAudio,
    approvedPoem, approvedBook, approvedAudio,
    rejectedPoem, rejectedBook, rejectedAudio,
  ] = await Promise.all([
    prisma.$queryRaw<RawComment[]>`
      SELECT 
        c.id,
        c.body,
        c."createdAt" as "createdAt",
        c.status::text as status,
        c.pinned,
        'poem' as "commentType",
        p.title as "targetTitle",
        p.slug as "targetSlug",
        u.name as "userName",
        u.email as "userEmail"
      FROM comments c
      JOIN poems p ON c."poemId" = p.id
      JOIN users u ON c."userId" = u.id
      WHERE (${statusFilter}::text IS NULL OR c.status::text = ${statusFilter})

      UNION ALL

      SELECT 
        bc.id,
        bc.body,
        bc."createdAt" as "createdAt",
        bc.status::text as status,
        bc.pinned,
        'book' as "commentType",
        b.title as "targetTitle",
        b.slug as "targetSlug",
        u.name as "userName",
        u.email as "userEmail"
      FROM book_comments bc
      JOIN books b ON bc."bookId" = b.id
      JOIN users u ON bc."userId" = u.id
      WHERE (${statusFilter}::text IS NULL OR bc.status::text = ${statusFilter})

      UNION ALL

      SELECT 
        ac.id,
        ac.body,
        ac."createdAt" as "createdAt",
        ac.status::text as status,
        ac.pinned,
        'audio' as "commentType",
        a.title as "targetTitle",
        a.slug as "targetSlug",
        u.name as "userName",
        u.email as "userEmail"
      FROM audio_comments ac
      JOIN audio a ON ac."audioId" = a.id
      JOIN users u ON ac."userId" = u.id
      WHERE (${statusFilter}::text IS NULL OR ac.status::text = ${statusFilter})

      ORDER BY "createdAt" DESC
      LIMIT ${pageSize} OFFSET ${skip}
    `,
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

  const paginatedComments: CommentItem[] = rawComments.map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: new Date(c.createdAt).toISOString(),
    status: c.status as "PENDING" | "APPROVED" | "REJECTED",
    user: {
      name: c.userName,
      email: c.userEmail,
    },
    commentType: c.commentType as "poem" | "book" | "audio",
    targetTitle: c.targetTitle,
    targetLink: 
      c.commentType === "poem" 
        ? `/poems/${c.targetSlug}` 
        : c.commentType === "book" 
          ? `/books/${c.targetSlug}` 
          : "/audio",
    pinned: c.pinned,
  }));

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
          Manage user comments. Safe comments are automatically approved, while comments flagged for tone are held for manual review.
        </p>
      </div>

      <CommentsList
        key={`${filter}-${page}`}
        initialComments={paginatedComments}
        counts={counts}
        filter={filter}
        page={page}
        hasNextPage={hasNextPage}
      />
    </div>
  );
}
