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

const PAGE_SIZE = 20;

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

  const [poemLikes, bookLikes, audioLikes] = await Promise.all([
    prisma.like.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { poem: { select: { title: true, slug: true } } },
    }),
    prisma.bookLike.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { book: { select: { title: true, slug: true } } },
    }),
    prisma.audioLike.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { audio: { select: { title: true, slug: true } } },
    }),
  ]);

  const allLikes = [
    ...poemLikes.map((l) => ({
      id: `poem-${l.poemId}`,
      type: "Poem" as const,
      title: l.poem.title,
      href: `/poems/${l.poem.slug}`,
      createdAt: l.createdAt,
    })),
    ...bookLikes.map((l) => ({
      id: `book-${l.bookId}`,
      type: "Book" as const,
      title: l.book.title,
      href: `/books/${l.book.slug}`,
      createdAt: l.createdAt,
    })),
    ...audioLikes.map((l) => ({
      id: `audio-${l.audioId}`,
      type: "Audio" as const,
      title: l.audio.title,
      href: "/audio",
      createdAt: l.createdAt,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const totalCount = allLikes.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginated = allLikes.slice(skip, skip + PAGE_SIZE);
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
