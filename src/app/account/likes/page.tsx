import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Likes",
};

const PAGE_SIZE = 10;

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AccountLikesPage({ searchParams }: PageProps) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const prisma = getPrisma();
  const userId = session.user.id;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  type RawLike = {
    id: string;
    type: string;
    targetTitle: string;
    targetSlug: string;
    createdAt: Date;
  };

  const [rawLikes, poemCount, bookCount, audioCount] = await Promise.all([
    prisma.$queryRaw<RawLike[]>`
      SELECT 
        l.id::text,
        'Poem' as type,
        p.title as "targetTitle",
        p.slug as "targetSlug",
        l."createdAt" as "createdAt"
      FROM likes l
      JOIN poems p ON l."poemId" = p.id
      WHERE l."userId" = ${userId}
      
      UNION ALL
      
      SELECT 
        bl.id::text,
        'Book' as type,
        b.title as "targetTitle",
        b.slug as "targetSlug",
        bl."createdAt" as "createdAt"
      FROM book_likes bl
      JOIN books b ON bl."bookId" = b.id
      WHERE bl."userId" = ${userId}
      
      UNION ALL
      
      SELECT 
        al.id::text,
        'Audio' as type,
        a.title as "targetTitle",
        a.slug as "targetSlug",
        al."createdAt" as "createdAt"
      FROM audio_likes al
      JOIN audio a ON al."audioId" = a.id
      WHERE al."userId" = ${userId}
      
      ORDER BY "createdAt" DESC
      LIMIT ${PAGE_SIZE} OFFSET ${skip}
    `,
    prisma.like.count({ where: { userId } }),
    prisma.bookLike.count({ where: { userId } }),
    prisma.audioLike.count({ where: { userId } }),
  ]);

  const paginated = rawLikes.map((l) => ({
    id: `${l.type.toLowerCase()}-${l.id}`,
    type: l.type as "Poem" | "Book" | "Audio",
    title: l.targetTitle,
    href: l.type === "Poem" ? `/poems/${l.targetSlug}` : l.type === "Book" ? `/books/${l.targetSlug}` : "/audio",
    createdAt: new Date(l.createdAt),
  }));

  const totalCount = poemCount + bookCount + audioCount;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasNext = page < totalPages;

  function buildUrl(p: number) {
    return p > 1 ? `/account/likes?page=${p}` : "/account/likes";
  }

  const typeBadge = {
    Poem: "border-amber-400/25 bg-amber-500/10 text-amber-300",
    Book: "border-sky-400/25 bg-sky-500/10 text-sky-300",
    Audio: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Liked Content</h2>
        <p className="mt-1 text-sm text-white/40 font-[family-name:var(--font-inter)]">
          Poems, books, and audio you&apos;ve liked.
        </p>
      </div>

      {paginated.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <p className="text-white/60">You haven&apos;t liked anything yet.</p>
          <p className="mt-1 text-sm text-white/35">
            Explore{" "}
            <Link href="/poems" className="text-white/60 underline underline-offset-2 hover:text-white">
              poems
            </Link>{" "}
            and tap the heart to save your favourites.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {paginated.map((like) => (
            <Link
              key={like.id}
              href={like.href}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.02] p-4 transition-colors hover:border-white/15 hover:bg-white/[0.04]"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white/80">
                  {like.title}
                </p>
                <p className="mt-1 text-xs text-white/35">
                  {formatDate(like.createdAt)}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${typeBadge[like.type]}`}
              >
                {like.type}
              </span>
            </Link>
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
            · {totalCount} likes
          </span>
          <div className="flex gap-2">
            <Link
              href={buildUrl(page - 1)}
              className={`inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-semibold uppercase tracking-wider transition-all ${
                page === 1
                  ? "pointer-events-none border-white/5 bg-white/[0.01] text-white/20"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              Previous
            </Link>
            <Link
              href={buildUrl(page + 1)}
              className={`inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-semibold uppercase tracking-wider transition-all ${
                !hasNext
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
