import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { updatePoem } from "../../../poem-actions";

type EditPoemPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPoemPage({ params }: EditPoemPageProps) {
  const { id } = await params;
  const prisma = getPrisma();

  const [poem, existingTags, genres] = await Promise.all([
    prisma.poem.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { name: true } }),
    prisma.genre.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!poem) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/poems"
          className="text-xs tracking-wider text-white/50 uppercase hover:text-white"
        >
          ← Poems
        </Link>
        <h1 className="text-3xl text-white md:text-4xl">Edit Poem</h1>
      </div>

      <div className="max-w-2xl">
        <form
          action={updatePoem}
          className="space-y-5 rounded-2xl border border-white/15 bg-white/[0.03] p-7"
        >
          <input type="hidden" name="id" value={poem.id} />

          <div>
            <label htmlFor="title" className="mb-2 block text-sm text-white/80">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              defaultValue={poem.title}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
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
              defaultValue={poem.language}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
            >
              <option value="EN">English</option>
              <option value="HI">Hindi</option>
              <option value="MR">Marathi</option>
            </select>
          </div>

          <div>
            <label htmlFor="font" className="mb-2 block text-sm text-white/80">
              Font Family
            </label>
            <select
              id="font"
              name="font"
              defaultValue={poem.font ?? ""}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
            >
              <option value="">Default Language Font</option>
              <optgroup label="English Fonts">
                <option value="Playfair Display">Playfair Display (Elegant Serif)</option>
                <option value="Lora">Lora (Classic Book Serif)</option>
                <option value="Cormorant Garamond">Cormorant Garamond (Premium Serif)</option>
                <option value="Cinzel">Cinzel (Cinematic Serif)</option>
                <option value="Caveat">Caveat (Handwriting Style)</option>
                <option value="Montserrat">Montserrat (Clean Sans)</option>
              </optgroup>
              <optgroup label="Hindi / Marathi (Devanagari) Fonts">
                <option value="Rozha One">Rozha One (Artistic Thick)</option>
                <option value="Yatra One">Yatra One (Historic Calligraphy)</option>
                <option value="Kalam">Kalam (Handwritten Style)</option>
                <option value="Amita">Amita (Flowing Decorative)</option>
                <option value="Martel">Martel (Elegant Serif)</option>
                <option value="Mukta">Mukta (Modern Clean Sans)</option>
              </optgroup>
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
              defaultValue={poem.genreId ?? ""}
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
              defaultValue={poem.tags.map(({ tag }) => tag.name).join(", ")}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
              placeholder="hope, nature, love"
            />
            <p className="mt-2 text-xs text-white/40">
              Separate tags with commas. Removing a tag here removes it from
              this poem.
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
              defaultValue={poem.content}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
            />
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-white/75">
            <input
              type="checkbox"
              name="publishNow"
              defaultChecked={poem.published}
              className="accent-white"
            />
            Published
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/20"
            >
              Save Changes
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
