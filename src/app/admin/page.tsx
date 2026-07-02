import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { poemLanguageLabel, type PoemLanguage } from "@/lib/poem-language";
import { toggleFeatured } from "./actions";

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function AdminDashboard() {
  const prisma = getPrisma();

  const [totalPoems, publishedPoems, draftPoems, featuredPoems, recentPoems] = await Promise.all([
    prisma.poem.count(),
    prisma.poem.count({ where: { published: true } }),
    prisma.poem.count({ where: { published: false } }),
    prisma.poem.findMany({
      where: { featured: true },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        language: true,
        published: true,
        featured: true,
        publishedAt: true,
      },
    }),
    prisma.poem.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        language: true,
        published: true,
        featured: true,
        createdAt: true,
      },
    }),
  ]);

  const stats = [
    { label: "Total Poems", value: totalPoems },
    { label: "Published", value: publishedPoems },
    { label: "Drafts", value: draftPoems },
    { label: "Featured", value: `${featuredPoems.length}/3` },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-4xl text-white">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-white/40 mb-2">{stat.label}</p>
            <p className="text-3xl text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Featured Poems */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-white">Featured Poems</h2>
          <span className="text-xs text-white/40 uppercase tracking-wider">
            {featuredPoems.length} of 3 slots used
          </span>
        </div>

        {featuredPoems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
            <p className="text-white/50 font-[family-name:var(--font-inter)] mb-3">
              No poems are featured yet.
            </p>
            <Link
              href="/admin/poems"
              className="text-sm text-white/70 hover:text-white underline underline-offset-4"
            >
              Go to Poems to feature one
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredPoems.map((poem) => (
              <div
                key={poem.id}
                className="rounded-2xl border border-amber-400/20 bg-amber-500/5 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-amber-400 text-xs">★</span>
                    <span className="text-xs uppercase tracking-wider text-white/50">
                      {poemLanguageLabel(poem.language as PoemLanguage)}
                    </span>
                    <span
                      className={`ml-auto text-xs uppercase tracking-wider ${poem.published ? "text-emerald-400/70" : "text-white/40"}`}
                    >
                      {poem.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <h3 className="text-white text-lg mb-2">{poem.title}</h3>
                  <p className="text-xs text-white/40">{formatDate(poem.publishedAt)}</p>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Link
                    href={`/admin/poems/${poem.id}/edit`}
                    className="text-xs text-white/60 hover:text-white underline underline-offset-4"
                  >
                    Edit
                  </Link>
                  <form action={toggleFeatured}>
                    <input type="hidden" name="id" value={poem.id} />
                    <button
                      type="submit"
                      className="text-xs text-amber-400/70 hover:text-amber-300 underline underline-offset-4"
                    >
                      Unfeature
                    </button>
                  </form>
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: 3 - featuredPoems.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-5 flex items-center justify-center min-h-[140px]"
              >
                <p className="text-xs text-white/30 uppercase tracking-wider">Empty slot</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Poems */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-white">Recent Poems</h2>
          <Link
            href="/admin/poems"
            className="text-xs text-white/50 hover:text-white uppercase tracking-wider"
          >
            View all →
          </Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/8">
          {recentPoems.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-white/50 font-[family-name:var(--font-inter)]">No poems yet.</p>
            </div>
          ) : (
            recentPoems.map((poem) => (
              <div key={poem.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  {poem.featured && <span className="text-amber-400 text-sm shrink-0">★</span>}
                  <div className="min-w-0">
                    <p className="text-white truncate">{poem.title}</p>
                    <p className="text-xs text-white/40 mt-0.5">
                      {poemLanguageLabel(poem.language as PoemLanguage)} •{" "}
                      {formatDate(poem.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs uppercase tracking-wider ${poem.published ? "text-emerald-400/70" : "text-white/40"}`}
                  >
                    {poem.published ? "Live" : "Draft"}
                  </span>
                  <Link
                    href={`/admin/poems/${poem.id}/edit`}
                    className="text-xs text-white/50 hover:text-white"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
