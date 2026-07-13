import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Comments",
};

const PAGE_SIZE = 10;

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AccountCommentsPage({
  searchParams,
}: PageProps) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const prisma = getPrisma();
  const userId = session.user.id;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  type RawComment = {
    id: string;
    type: string;
    targetTitle: string;
    targetSlug: string;
    body: string;
    status: string;
    pinned: boolean;
    createdAt: Date;
  };

  const [rawComments, poemCount, bookCount, audioCount] = await Promise.all([
    prisma.$queryRaw<RawComment[]>`
      SELECT 
        c.id::text,
        'Poem' as type,
        p.title as "targetTitle",
        p.slug as "targetSlug",
        c.body,
        c.status::text as status,
        c.pinned,
        c."createdAt" as "createdAt"
      FROM comments c
      JOIN poems p ON c."poemId" = p.id
      WHERE c."userId" = ${userId}
      
      UNION ALL
      
      SELECT 
        bc.id::text,
        'Book' as type,
        b.title as "targetTitle",
        b.slug as "targetSlug",
        bc.body,
        bc.status::text as status,
        bc.pinned,
        bc."createdAt" as "createdAt"
      FROM book_comments bc
      JOIN books b ON bc."bookId" = b.id
      WHERE bc."userId" = ${userId}
      
      UNION ALL
      
      SELECT 
        ac.id::text,
        'Audio' as type,
        a.title as "targetTitle",
        a.slug as "targetSlug",
        ac.body,
        ac.status::text as status,
        ac.pinned,
        ac."createdAt" as "createdAt"
      FROM audio_comments ac
      JOIN audio a ON ac."audioId" = a.id
      WHERE ac."userId" = ${userId}
      
      ORDER BY "createdAt" DESC
      LIMIT ${Prisma.raw(String(PAGE_SIZE))} OFFSET ${Prisma.raw(String(skip))}
    `,
    prisma.comment.count({ where: { userId } }),
    prisma.bookComment.count({ where: { userId } }),
    prisma.audioComment.count({ where: { userId } }),
  ]);

  const paginated = rawComments.map((c) => ({
    id: c.id,
    type: c.type as "Poem" | "Book" | "Audio",
    targetTitle: c.targetTitle,
    targetHref: c.type === "Poem" ? `/poems/${c.targetSlug}` : c.type === "Book" ? `/books/${c.targetSlug}` : "/audio",
    body: c.body,
    status: c.status,
    pinned: c.pinned,
    createdAt: new Date(c.createdAt),
  }));

  const totalCount = poemCount + bookCount + audioCount;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasNext = page < totalPages;

  function buildUrl(p: number) {
    return p > 1 ? `/account/comments?page=${p}` : "/account/comments";
  }

  const statusBadge: Record<string, string> = {
    APPROVED: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
    PENDING: "border-amber-400/25 bg-amber-500/10 text-amber-300",
    REJECTED: "border-rose-400/25 bg-rose-500/10 text-rose-300",
  };

  const typeBadge: Record<string, string> = {
    Poem: "border-amber-400/25 bg-amber-500/10 text-amber-300",
    Book: "border-sky-400/25 bg-sky-500/10 text-sky-300",
    Audio: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Comment History</h2>
        <p className="mt-1 text-sm text-white/40 font-[family-name:var(--font-inter)]">
          All your comments across poems, books, and audio.
        </p>
      </div>

      {paginated.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <p className="text-white/60">You haven&apos;t posted any comments yet.</p>
          <p className="mt-1 text-sm text-white/35">
            Share your thoughts on a{" "}
            <Link href="/poems" className="text-white/60 underline underline-offset-2 hover:text-white">
              poem
            </Link>{" "}
            to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginated.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl border border-white/8 bg-white/[0.02] p-4"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${typeBadge[comment.type]}`}
                >
                  {comment.type}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusBadge[comment.status] ?? statusBadge.PENDING}`}
                >
                  {comment.status}
                </span>
                {comment.pinned && (
                  <span className="rounded-full border border-amber-400/20 px-2 py-0.5 text-[10px] text-amber-300">
                    Pinned
                  </span>
                )}
                <span className="ml-auto text-xs text-white/30">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="line-clamp-3 text-sm leading-6 text-white/70">
                {comment.body}
              </p>
              <Link
                href={comment.targetHref}
                className="mt-2 block truncate text-xs text-white/40 hover:text-white transition-colors"
              >
                on {comment.targetTitle} →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <span className="text-xs text-white/50">
            Page{" "}
            <strong className="font-semibold text-white/80">{page}</strong> of{" "}
            <strong className="font-semibold text-white/80">{totalPages}</strong>{" "}
            · {totalCount} comments
          </span>
          <div className="flex gap-2">
            <Link
              href={buildUrl(page - 1)}
              className={`inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-semibold uppercase tracking-wider transition-all ${page === 1
                ? "pointer-events-none border-white/5 bg-white/[0.01] text-white/20"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
            >
              Previous
            </Link>
            <Link
              href={buildUrl(page + 1)}
              className={`inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-semibold uppercase tracking-wider transition-all ${!hasNext
                ? "pointer-events-none border-white/5 bg-white/[0.01] text-white/20"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
