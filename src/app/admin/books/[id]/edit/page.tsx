import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { updateBook } from "../../../book-actions";

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
        <Link
          href="/admin/books"
          className="text-xs tracking-wider text-white/50 uppercase hover:text-white"
        >
          ← Books
        </Link>
        <h1 className="text-3xl text-white md:text-4xl">Edit Book</h1>
      </div>

      <div className="max-w-2xl">
        <form
          action={updateBook}
          className="space-y-5 rounded-2xl border border-white/15 bg-white/3 p-7"
        >
          <input type="hidden" name="id" value={book.id} />

          <div>
            <label htmlFor="title" className="mb-2 block text-sm text-white/80">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              defaultValue={book.title}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm text-white/80"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={book.description ?? ""}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label
              htmlFor="coverImage"
              className="mb-2 block text-sm text-white/80"
            >
              Cover Image
            </label>
            {book.coverImage && (
              <div className="mb-3">
                <div className="relative aspect-[3/4] w-24 overflow-hidden rounded-lg border border-white/10">
                  <Image
                    src={book.coverImage}
                    alt="Current cover"
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <p className="mt-1 text-xs text-white/30">
                  Current cover. Upload a new file to replace it.
                </p>
              </div>
            )}
            <input
              id="coverImage"
              name="coverImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:tracking-wider file:text-white/70 file:uppercase hover:file:bg-white/20 focus:border-white/40"
            />
            <p className="mt-1 text-xs text-white/30">
              JPG, PNG, or WebP. Max 5 MB. Leave empty to keep current.
            </p>
          </div>

          <div>
            <label htmlFor="price" className="mb-2 block text-sm text-white/80">
              Actual Price (₹)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={book.price?.toString() ?? ""}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
              placeholder="299"
            />
          </div>

          <div>
            <label
              htmlFor="discountedPrice"
              className="mb-2 block text-sm text-white/80"
            >
              Discounted Price (₹)
            </label>
            <input
              id="discountedPrice"
              name="discountedPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={book.discountedPrice?.toString() ?? ""}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
              placeholder="249"
            />
            <p className="mt-1 text-xs text-white/30">
              Leave empty if there is no offer price.
            </p>
          </div>

          <div>
            <label
              htmlFor="shippingCharge"
              className="mb-2 block text-sm text-white/80"
            >
              Shipping Charge (₹)
            </label>
            <input
              id="shippingCharge"
              name="shippingCharge"
              type="number"
              step="0.01"
              min="0"
              defaultValue={book.shippingCharge.toString()}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
              placeholder="40"
            />
          </div>

          <div>
            <label
              htmlFor="purchaseUrl"
              className="mb-2 block text-sm text-white/80"
            >
              Purchase URL
            </label>
            <input
              id="purchaseUrl"
              name="purchaseUrl"
              type="url"
              defaultValue={book.purchaseUrl ?? ""}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-2 block text-sm text-white/80"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={book.status}
              className="w-full rounded-xl border border-white/20 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/40"
            >
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
            <button
              type="submit"
              className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-xs tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/20"
            >
              Save Changes
            </button>
            <Link
              href="/admin/books"
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
