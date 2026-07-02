import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { updateBook } from "../../../actions";

type EditBookPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditBookPage({ params }: EditBookPageProps) {
  const { id } = await params;
  const book = await getPrisma().book.findUnique({
    where: { id },
    omit: { coverData: true },
  });
  if (!book) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/books" className="text-xs text-white/50 hover:text-white uppercase tracking-wider">
          ← Books
        </Link>
        <h1 className="text-3xl md:text-4xl text-white">Edit Book</h1>
      </div>

      <div className="max-w-2xl">
        <form action={updateBook} className="rounded-2xl border border-white/15 bg-white/[0.03] p-7 space-y-5">
          <input type="hidden" name="id" value={book.id} />

          <div>
            <label htmlFor="title" className="block text-sm text-white/80 mb-2">Title</label>
            <input id="title" name="title" required defaultValue={book.title} className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm text-white/80 mb-2">Description</label>
            <textarea id="description" name="description" rows={6} defaultValue={book.description ?? ""} className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40" />
          </div>

          <div>
            <label htmlFor="coverImage" className="block text-sm text-white/80 mb-2">Cover Image</label>
            {book.coverImage && (
              <div className="mb-3">
                <img src={book.coverImage} alt="Current cover" className="w-24 h-auto rounded-lg border border-white/10" />
                <p className="text-xs text-white/30 mt-1">Current cover. Upload a new file to replace it.</p>
              </div>
            )}
            <input id="coverImage" name="coverImage" type="file" accept="image/jpeg,image/png,image/webp" className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-wider file:text-white/70 file:cursor-pointer hover:file:bg-white/20" />
            <p className="text-xs text-white/30 mt-1">JPG, PNG, or WebP. Max 5 MB. Leave empty to keep current.</p>
          </div>

          <div>
            <label htmlFor="purchaseUrl" className="block text-sm text-white/80 mb-2">Purchase URL</label>
            <input id="purchaseUrl" name="purchaseUrl" type="url" defaultValue={book.purchaseUrl ?? ""} className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40" />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm text-white/80 mb-2">Status</label>
            <select id="status" name="status" defaultValue={book.status} className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40">
              <option value="COMING_SOON">Coming Soon</option>
              <option value="AVAILABLE">Available</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs uppercase tracking-[0.18em] text-white hover:bg-white/20 transition-colors">
              Save Changes
            </button>
            <Link href="/admin/books" className="rounded-full border border-white/15 px-6 py-3 text-xs uppercase tracking-[0.18em] text-white/60 hover:text-white hover:border-white/30 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
