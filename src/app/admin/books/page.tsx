import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { toggleBookFeatured, updateBookStatus } from "../actions";
import DeleteBookForm from "./delete-book-form";

function statusLabel(status: string): string {
  switch (status) {
    case "AVAILABLE":
      return "Available";
    case "COMING_SOON":
      return "Coming Soon";
    case "ARCHIVED":
      return "Archived";
    default:
      return status;
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "AVAILABLE":
      return "border-emerald-400/30 text-emerald-400/80 bg-emerald-500/10";
    case "COMING_SOON":
      return "border-amber-400/30 text-amber-400/80 bg-amber-500/10";
    default:
      return "border-white/15 text-white/40 bg-white/5";
  }
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function AdminBooksPage() {
  const prisma = getPrisma();

  const books = await prisma.book.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      featured: true,
      createdAt: true,
      publishedAt: true,
    },
  });

  const featuredCount = books.filter((b) => b.featured).length;
  const availableCount = books.filter((b) => b.status === "AVAILABLE").length;
  const comingSoonCount = books.filter((b) => b.status === "COMING_SOON").length;
  const archivedCount = books.filter((b) => b.status === "ARCHIVED").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white md:text-4xl">Books</h1>
          <p className="mt-2 text-sm text-white/45">
            Manage book visibility, featured slots, and purchase readiness.
          </p>
        </div>
        <Link
          href="/admin/books/new"
          className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-xs tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/20"
        >
          + New Book
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          ["Total", books.length],
          ["Available", availableCount],
          ["Coming Soon", comingSoonCount],
          ["Archived", archivedCount],
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
                  </p>
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
    </div>
  );
}
