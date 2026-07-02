import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { poemLanguageLabel, type PoemLanguage } from "@/lib/poem-language";
import { togglePublish, toggleFeatured } from "../actions";
import DeletePoemForm from "./delete-poem-form";

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function AdminPoemsPage() {
  const prisma = getPrisma();

  const poems = await prisma.poem.findMany({
    orderBy: { createdAt: "desc" },
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
  });

  const featuredCount = poems.filter((p) => p.featured).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl text-white">Poems</h1>
        <Link
          href="/admin/poems/new"
          className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white hover:bg-white/20 transition-colors"
        >
          + New Poem
        </Link>
      </div>

      <p className="text-sm text-white/50 font-[family-name:var(--font-inter)]">
        {poems.length} poem{poems.length !== 1 ? "s" : ""} total • {featuredCount}/3 featured
      </p>

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
                {poem.published && (
                  <Link
                    href={`/poems/${poem.slug}`}
                    className="rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    target="_blank"
                  >
                    View ↗
                  </Link>
                )}

                {/* Delete */}
                <DeletePoemForm poemId={poem.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
