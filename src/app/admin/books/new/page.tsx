import Link from "next/link";
import { createBook } from "../../actions/book-actions";

export default function NewBookPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/books" className="text-xs text-white/50 hover:text-white uppercase tracking-wider">
          ← Books
        </Link>
        <h1 className="text-3xl md:text-4xl text-white">New Book</h1>
      </div>

      <div className="max-w-2xl">
        <form action={createBook} className="rounded-2xl border border-white/15 bg-white/3 p-7 space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm text-white/80 mb-2">Title</label>
            <input id="title" name="title" required className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40" placeholder="Book title" />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm text-white/80 mb-2">Description</label>
            <textarea id="description" name="description" rows={6} className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40" placeholder="About this book..." />
          </div>

          <div>
            <label htmlFor="coverImage" className="block text-sm text-white/80 mb-2">Cover Image</label>
            <input id="coverImage" name="coverImage" type="file" accept="image/jpeg,image/png,image/webp" className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-wider file:text-white/70 file:cursor-pointer hover:file:bg-white/20" />
            <p className="text-xs text-white/30 mt-1">JPG, PNG, or WebP. Max 5 MB.</p>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm text-white/80 mb-2">Actual Price (₹)</label>
            <input id="price" name="price" type="number" step="0.01" min="0" className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40" placeholder="299" />
          </div>

          <div>
            <label htmlFor="discountedPrice" className="block text-sm text-white/80 mb-2">Discounted Price (₹)</label>
            <input id="discountedPrice" name="discountedPrice" type="number" step="0.01" min="0" className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40" placeholder="249" />
            <p className="text-xs text-white/30 mt-1">Leave empty if there is no offer price.</p>
          </div>

          <div>
            <label htmlFor="shippingCharge" className="block text-sm text-white/80 mb-2">Shipping Charge (₹)</label>
            <input id="shippingCharge" name="shippingCharge" type="number" step="0.01" min="0" defaultValue={40} className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40" placeholder="40" />
          </div>

          <div>
            <label htmlFor="purchaseUrl" className="block text-sm text-white/80 mb-2">Purchase URL</label>
            <input id="purchaseUrl" name="purchaseUrl" type="url" className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40" placeholder="https://..." />
          </div>

          <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-semibold text-white">SEO Settings (Optional)</h3>
            <div>
              <label htmlFor="seoTitle" className="mb-2 block text-sm text-white/80">
                SEO Title
              </label>
              <input
                id="seoTitle"
                name="seoTitle"
                className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
                placeholder="Custom title for search engines"
              />
            </div>
            <div>
              <label htmlFor="seoDescription" className="mb-2 block text-sm text-white/80">
                SEO Description
              </label>
              <textarea
                id="seoDescription"
                name="seoDescription"
                rows={3}
                className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
                placeholder="Meta description for search results"
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm text-white/80 mb-2">Status</label>
            <select id="status" name="status" defaultValue="COMING_SOON" className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40">
              <option value="COMING_SOON">Coming Soon</option>
              <option value="AVAILABLE">Available</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-white/75">
            <input type="checkbox" name="notifySubscribers" className="accent-white" />
            Notify subscribers via email on publish (if marked Available)
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs uppercase tracking-[0.18em] text-white hover:bg-white/20 transition-colors">
              Create Book
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
