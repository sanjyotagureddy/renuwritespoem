import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { updatePoem } from "../../../actions";

type EditPoemPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPoemPage({ params }: EditPoemPageProps) {
  const { id } = await params;
  const prisma = getPrisma();

  const poem = await prisma.poem.findUnique({ where: { id } });
  if (!poem) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/poems"
          className="text-xs text-white/50 hover:text-white uppercase tracking-wider"
        >
          ← Poems
        </Link>
        <h1 className="text-3xl md:text-4xl text-white">Edit Poem</h1>
      </div>

      <div className="max-w-2xl">
        <form
          action={updatePoem}
          className="rounded-2xl border border-white/15 bg-white/[0.03] p-7 space-y-5"
        >
          <input type="hidden" name="id" value={poem.id} />

          <div>
            <label htmlFor="title" className="block text-sm text-white/80 mb-2">
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
            <label htmlFor="language" className="block text-sm text-white/80 mb-2">
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
            <label htmlFor="content" className="block text-sm text-white/80 mb-2">
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

          <label className="inline-flex items-center gap-2 text-sm text-white/75 cursor-pointer">
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
              className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs uppercase tracking-[0.18em] text-white hover:bg-white/20 transition-colors"
            >
              Save Changes
            </button>
            <Link
              href="/admin/poems"
              className="rounded-full border border-white/15 px-6 py-3 text-xs uppercase tracking-[0.18em] text-white/60 hover:text-white hover:border-white/30 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
