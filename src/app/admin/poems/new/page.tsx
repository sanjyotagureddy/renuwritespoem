import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { createPoem } from "../../actions";

export default async function NewPoemPage() {
  const [existingTags, genres] = await Promise.all([
    getPrisma().tag.findMany({
      orderBy: { name: "asc" },
      select: { name: true },
    }),
    getPrisma().genre.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/poems"
          className="text-xs tracking-wider text-white/50 uppercase hover:text-white"
        >
          ← Poems
        </Link>
        <h1 className="text-3xl text-white md:text-4xl">New Poem</h1>
      </div>

      <div className="max-w-2xl">
        <form
          action={createPoem}
          className="space-y-5 rounded-2xl border border-white/15 bg-white/[0.03] p-7"
        >
          <div>
            <label htmlFor="title" className="mb-2 block text-sm text-white/80">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
              placeholder="Poem title"
            />
          </div>

          <div>
            <label
              htmlFor="language"
              className="mb-2 block text-sm text-white/80"
            >
              Language
            </label>
            <select
              id="language"
              name="language"
              defaultValue="EN"
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
            >
              <option value="EN">English</option>
              <option value="HI">Hindi</option>
              <option value="MR">Marathi</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="genreId"
              className="mb-2 block text-sm text-white/80"
            >
              Genre
            </label>
            <select
              id="genreId"
              name="genreId"
              defaultValue=""
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
            >
              <option value="">No genre</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tags" className="mb-2 block text-sm text-white/80">
              Tags
            </label>
            <input
              id="tags"
              name="tags"
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
              placeholder="hope, nature, love"
            />
            <p className="mt-2 text-xs text-white/40">
              Separate tags with commas. New tags will be created automatically.
            </p>
            {existingTags.length > 0 ? (
              <p className="mt-2 text-xs text-white/30">
                Existing: {existingTags.map((tag) => tag.name).join(", ")}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="content"
              className="mb-2 block text-sm text-white/80"
            >
              Content
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={14}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
              placeholder="Write your poem here..."
            />
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-white/75">
            <input type="checkbox" name="publishNow" className="accent-white" />
            Publish immediately
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/20"
            >
              Create Poem
            </button>
            <Link
              href="/admin/poems"
              className="rounded-full border border-white/15 px-6 py-3 text-xs tracking-[0.18em] text-white/60 uppercase transition-colors hover:border-white/30 hover:text-white"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
