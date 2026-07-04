import type { Metadata } from "next";
import Link from "next/link";
import { getPrisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Genres",
  description:
    "Browse Renu's poems by genre, mood, and theme including love, nature, life, solitude, and more.",
};

export default async function GenresPage() {
  const prisma = getPrisma();

  const genres = await prisma.genre.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          poems: { where: { published: true } },
        },
      },
      poems: {
        where: { published: true },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 3,
        select: {
          id: true,
          title: true,
          slug: true,
          language: true,
        },
      },
    },
  });

  const visibleGenres = genres.filter((genre) => genre._count.poems > 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="mb-12 md:mb-16">
        <p className="mb-3 text-sm tracking-[0.22em] text-white/40 uppercase">
          Browse by theme
        </p>
        <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
          Genres
        </h1>
        <p className="max-w-3xl font-[family-name:var(--font-inter)] text-lg text-white/60">
          Find poems by mood, subject, and emotional landscape. Each genre opens
          a small doorway into a different kind of feeling.
        </p>
      </div>

      {visibleGenres.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-10 text-center">
          <h2 className="mb-3 text-2xl text-white">No genres published yet</h2>
          <p className="font-[family-name:var(--font-inter)] text-white/60">
            Genres will appear here once published poems are assigned to them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleGenres.map((genre) => (
            <article
              key={genre.id}
              className="rounded-2xl border border-white/15 bg-white/[0.03] p-6 transition-colors hover:border-white/30"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl text-white">{genre.name}</h2>
                  <p className="mt-1 text-xs tracking-[0.18em] text-white/30 uppercase">
                    {genre._count.poems} poem
                    {genre._count.poems !== 1 ? "s" : ""}
                  </p>
                </div>
                <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-xs text-amber-100/70">
                  /{genre.slug}
                </span>
              </div>

              {genre.description && (
                <p className="mb-5 font-[family-name:var(--font-inter)] text-sm leading-6 text-white/55">
                  {genre.description}
                </p>
              )}

              {genre.poems.length > 0 && (
                <div className="mb-6 space-y-2">
                  {genre.poems.map((poem) => (
                    <Link
                      key={poem.id}
                      href={`/poems/${poem.slug}`}
                      className="block rounded-xl border border-white/10 bg-black/15 px-4 py-3 text-sm text-white/65 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      {poem.title}
                    </Link>
                  ))}
                </div>
              )}

              <Link
                href={`/poems?genre=${genre.slug}`}
                className="inline-flex items-center gap-2 text-sm tracking-[0.18em] text-white/75 uppercase transition-colors hover:text-white"
              >
                View all
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
