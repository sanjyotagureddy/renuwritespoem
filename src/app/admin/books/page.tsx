import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { toggleBookFeatured, updateBookStatus } from "../actions/book-actions";
import DeleteBookForm from "./delete-book-form";
import { statusLabel, statusColor, formatDate } from "@/lib/utils";

const PAGE_SIZE = 10;

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminBooksPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const prisma = getPrisma();

  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const [
    books,
    totalCount,
    featuredCount,
    availableCount,
    comingSoonCount,
    archivedCount,
    needsSetupCount
  ] = await Promise.all([
    prisma.book.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        featured: true,
        createdAt: true,
        publishedAt: true,
        price: true,
        coverImage: true,
        views: true,
      },
    }),
    prisma.book.count(),
    prisma.book.count({ where: { featured: true } }),
    prisma.book.count({ where: { status: "AVAILABLE" } }),
    prisma.book.count({ where: { status: "COMING_SOON" } }),
    prisma.book.count({ where: { status: "ARCHIVED" } }),
    prisma.book.count({
      where: {
        OR: [
          { price: null },
          { price: { lte: 0 } },
          { coverImage: null },
        ]
      }
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasNext = page < totalPages;

  function buildUrl(p: number) {
    return p > 1 ? `/admin/books?page=${p}` : "/admin/books";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl text-white md:text-4xl">Books</h1>
          <p className="mt-2 text-sm text-white/45">
            Manage book visibility, featured slots, and purchase readiness.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/books"
            target="_blank"
            className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-xs tracking-[0.18em] text-white/65 uppercase transition-colors hover:bg-white/10 hover:text-white"
          >
            View public page ↗
          </Link>
          <Link
            href="/admin/books/new"
            className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-xs tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/20"
          >
            + New Book
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {[
          ["Total", totalCount],
          ["Available", availableCount],
          ["Coming Soon", comingSoonCount],
          ["Archived", archivedCount],
          ["Needs Setup", needsSetupCount],
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

      {books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <p className="mb-3 font-[family-name:var(--font-inter)] text-white/50">
            No books yet.
          </p>
          <Link
            href="/admin/books/new"
            className="text-sm text-white/70 underline underline-offset-4 hover:text-white"
          >
            Add your first book
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-white/8 rounded-2xl border border-white/10 bg-white/[0.03]">
          {books.map((book) => (
            <div
              key={book.id}
              className="flex flex-col justify-between gap-3 px-5 py-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                {book.featured && (
                  <span className="shrink-0 text-sm text-amber-400">★</span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-white">{book.title}</p>
                  <p className="mt-0.5 text-xs text-white/40">
                    Created {formatDate(book.createdAt)}
                    {book.publishedAt
                      ? ` • Published ${formatDate(book.publishedAt)}`
                      : ""}
                    {` • ${book.views.toLocaleString()} ${book.views === 1 ? 'view' : 'views'}`}
                  </p>
                  {(!book.price || Number(book.price) <= 0 || !book.coverImage) && (
                    <p className="mt-1 text-xs text-amber-300/70">
                      Add {[
                        !book.price || Number(book.price) <= 0 ? "price" : null,
                        !book.coverImage ? "cover image" : null,
                      ]
                        .filter(Boolean)
                        .join(" and ")}{" "}
                      before making this book available.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] tracking-wider uppercase ${statusColor(book.status)}`}
                >
                  {statusLabel(book.status)}
                </span>

                <form action={updateBookStatus}>
                  <input type="hidden" name="id" value={book.id} />
                  <select
                    name="status"
                    defaultValue={book.status}
                    className="rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 text-xs text-white outline-none transition-colors hover:bg-white/10"
                    aria-label={`Change status for ${book.title}`}
                  >
                    <option value="COMING_SOON">Coming Soon</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  <button
                    type="submit"
                    className="ml-1 rounded-lg px-2.5 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Save
                  </button>
                </form>

                <form action={toggleBookFeatured}>
                  <input type="hidden" name="id" value={book.id} />
                  <button
                    type="submit"
                    className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                      book.featured
                        ? "text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                    title={
                      !book.featured && featuredCount >= 3
                        ? "Unfeature another book first (max 3)"
                        : undefined
                    }
                  >
                    {book.featured ? "★ Unfeature" : "☆ Feature"}
                  </button>
                </form>

                <Link
                  href={`/admin/books/${book.id}/edit`}
                  className="rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Edit
                </Link>

                {book.status !== "ARCHIVED" && (
                  <Link
                    href={`/books/${book.slug}`}
                    className="rounded-lg px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    target="_blank"
                  >
                    View ↗
                  </Link>
                )}

                <DeleteBookForm bookId={book.id} />
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
            · {totalCount} books
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
