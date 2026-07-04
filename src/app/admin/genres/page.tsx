import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { createGenre, updateGenre } from "../actions";
import DeleteGenreForm from "./delete-genre-form";

export default async function AdminGenresPage() {
  const prisma = getPrisma();

  const genres = await prisma.genre.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { poems: true } },
    },
  });

  const usedCount = genres.filter((genre) => genre._count.poems > 0).length;
  const unusedCount = genres.length - usedCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl text-white md:text-4xl">Genres</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/45">
            Create and organize poem genres. Genres appear on poem cards and
            help readers browse by mood or theme.
          </p>
        </div>
        <Link
          href="/genres"
          target="_blank"
          className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs tracking-[0.18em] text-white/65 uppercase transition-colors hover:bg-white/10 hover:text-white"
        >
          View public page ↗
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[
          ["Total", genres.length],
          ["Used", usedCount],
          ["Unused", unusedCount],
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

      <section className="rounded-2xl border border-amber-200/15 bg-gradient-to-br from-amber-500/10 via-white/[0.03] to-rose-500/10 p-5">
        <h2 className="text-lg text-white">Add new genre</h2>
        <form action={createGenre} className="mt-4 grid gap-3 md:grid-cols-[0.7fr_1fr_auto]">
          <label className="space-y-1.5">
            <span className="text-[11px] font-medium tracking-wide text-white/45 uppercase">
              Name
            </span>
            <input
              name="name"
              required
              maxLength={80}
              placeholder="Love, Nature, Devotion..."
              className="w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-amber-300/50"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-[11px] font-medium tracking-wide text-white/45 uppercase">
              Description optional
            </span>
            <input
              name="description"
              maxLength={500}
              placeholder="Short note about this genre"
              className="w-full rounded-xl border border-white/15 bg-black/35 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-amber-300/50"
            />
          </label>
          <button
            type="submit"
            className="self-end rounded-xl border border-amber-200/30 bg-amber-200 px-5 py-3 text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-100"
          >
            Add genre
          </button>
        </form>
      </section>

      {genres.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <p className="mb-3 font-[family-name:var(--font-inter)] text-white/50">
            No genres yet.
          </p>
          <p className="text-sm text-white/35">
            Add your first genre above, then assign it while creating or editing
            a poem.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/8 rounded-2xl border border-white/10 bg-white/[0.03]">
          {genres.map((genre) => (
            <div
              key={genre.id}
              className="grid gap-4 px-5 py-4 lg:grid-cols-[1fr_auto]"
            >
              <form
                action={updateGenre}
                className="grid min-w-0 gap-3 md:grid-cols-[0.7fr_1fr]"
              >
                <input type="hidden" name="id" value={genre.id} />
                <label className="space-y-1.5">
                  <span className="text-[11px] font-medium tracking-wide text-white/35 uppercase">
                    Name
                  </span>
                  <input
                    name="name"
                    required
                    maxLength={80}
                    defaultValue={genre.name}
                    className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-white/35"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-[11px] font-medium tracking-wide text-white/35 uppercase">
                    Description
                  </span>
                  <input
                    name="description"
                    maxLength={500}
                    defaultValue={genre.description ?? ""}
                    placeholder="No description"
                    className="w-full rounded-xl border border-white/15 bg-black/25 px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-white/25 focus:border-white/35"
                  />
                </label>
                <div className="flex flex-wrap items-center gap-2 md:col-span-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/40">
                    /{genre.slug}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/40">
                    {genre._count.poems} poem
                    {genre._count.poems !== 1 ? "s" : ""}
                  </span>
                  <button
                    type="submit"
                    className="rounded-lg px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Save
                  </button>
                  {genre._count.poems > 0 && (
                    <Link
                      href={`/poems?genre=${genre.slug}`}
                      target="_blank"
                      className="rounded-lg px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      View poems ↗
                    </Link>
                  )}
                </div>
              </form>

              <div className="flex items-end justify-start lg:justify-end">
                <DeleteGenreForm
                  genreId={genre.id}
                  poemCount={genre._count.poems}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
