import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { poemLanguageLabel, type PoemLanguage } from "@/lib/domain/poem-language";
import { togglePublish, toggleFeatured } from "../poem-actions";
import DeletePoemForm from "./delete-poem-form";
import { formatDate } from "@/lib/utils";

const PAGE_SIZE = 10;

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminPoemsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const prisma = getPrisma();

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [
    poems,
    totalCount,
    featuredCount,
    publishedCount,
    draftCount
  ] = await Promise.all([
    prisma.poem.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        language: true,
        published: true,
        featured: true,
        createdAt: true,
        publishedAt: true,
      },
    }),
    prisma.poem.count(),
    prisma.poem.count({ where: { featured: true } }),
    prisma.poem.count({ where: { published: true } }),
    prisma.poem.count({ where: { published: false } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasNext = page < totalPages;

  function buildUrl(p: number) {
    return p > 1 ? `/admin/poems?page=${p}` : "/admin/poems";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white md:text-4xl">Poems</h1>
          <p className="mt-2 text-sm text-white/45">
            Manage publishing, featured slots, languages, and poem visibility.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/poems"
            target="_blank"
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs tracking-[0.18em] text-white/65 uppercase transition-colors hover:bg-white/10 hover:text-white"
          >
            View public page ↗
          </Link>
          <Link
            href="/admin/poems/new"
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-xs tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/20"
          >
            + New Poem
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Total", totalCount],
          ["Published", publishedCount],
          ["Drafts", draftCount],
          ["Featured", `${featuredCount}/3`],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <p className="mb-1 text-[10px] tracking-[0.18em] text-white/35 uppercase">
              {label}
            </p>
            <p className="text-2xl text-white">{value}</p>
          </div>
        ))}
      </div>

      {poems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <p className="text-white/50 font-[family-name:var(--font-inter)] mb-3">
            No poems have been created yet.
          </p>
          <Link
            href="/admin/poems/new"
            className="text-sm text-white/70 hover:text-white underline underline-offset-4"
          >
            Create your first poem
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/8">
          {poems.map((poem) => (
            <div
              key={poem.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
            >
              {/* Info */}
              <div className="flex items-center gap-3 min-w-0">
                {poem.featured && <span className="text-amber-400 text-sm shrink-0">★</span>}
                <div className="min-w-0">
                  <p className="text-white truncate">{poem.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {poemLanguageLabel(poem.language as PoemLanguage)} • Created{" "}
                    {formatDate(poem.createdAt)}
                    {poem.publishedAt ? ` • Published ${formatDate(poem.publishedAt)}` : ""}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider border ${
                    poem.published
                      ? "border-emerald-400/30 text-emerald-400/80 bg-emerald-500/10"
                      : "border-white/15 text-white/40 bg-white/5"
                  }`}
                >
                  {poem.published ? "Published" : "Draft"}
                </span>

                {/* Toggle Publish */}
                <form action={togglePublish}>
                  <input type="hidden" name="id" value={poem.id} />
                  <button
                    type="submit"
                    className="rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {poem.published ? "Unpublish" : "Publish"}
                  </button>
                </form>

                {/* Toggle Featured */}
                <form action={toggleFeatured}>
                  <input type="hidden" name="id" value={poem.id} />
                  <button
                    type="submit"
                    className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                      poem.featured
                        ? "text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                    title={
                      !poem.featured && featuredCount >= 3
                        ? "Unfeature another poem first (max 3)"
                        : undefined
                    }
                  >
                    {poem.featured ? "★ Unfeature" : "☆ Feature"}
                  </button>
                </form>

                {/* Edit */}
                <Link
                  href={`/admin/poems/${poem.id}/edit`}
                  className="rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Edit
                </Link>

                {/* View */}
                <Link
                  href={`/poems/${poem.slug}`}
                  className="rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  target="_blank"
                >
                  View ↗
                </Link>

                {/* Delete */}
                <DeletePoemForm poemId={poem.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <span className="text-xs text-white/50">
            Page <strong className="font-semibold text-white/80">{page}</strong>{" "}
            of{" "}
            <strong className="font-semibold text-white/80">{totalPages}</strong>{" "}
            · {totalCount} poems
          </span>
          <div className="flex gap-2">
            <Link
              href={buildUrl(page - 1)}
              className={`inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-semibold uppercase tracking-wider transition-all ${
                page === 1
                  ? "pointer-events-none cursor-not-allowed border-white/5 bg-white/[0.01] text-white/20"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              Previous
            </Link>
            <Link
              href={buildUrl(page + 1)}
              className={`inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-semibold uppercase tracking-wider transition-all ${
                !hasNext
                  ? "pointer-events-none cursor-not-allowed border-white/5 bg-white/[0.01] text-white/20"
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
