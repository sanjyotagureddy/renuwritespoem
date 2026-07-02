import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { toggleBookFeatured } from "../actions";
import DeleteBookForm from "./delete-book-form";

function statusLabel(status: string): string {
  switch (status) {
    case "AVAILABLE": return "Available";
    case "COMING_SOON": return "Coming Soon";
    case "ARCHIVED": return "Archived";
    default: return status;
  }
}

function statusColor(status: string): string {
  switch (status) {
    case "AVAILABLE": return "border-emerald-400/30 text-emerald-400/80 bg-emerald-500/10";
    case "COMING_SOON": return "border-amber-400/30 text-amber-400/80 bg-amber-500/10";
    default: return "border-white/15 text-white/40 bg-white/5";
  }
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl text-white">Books</h1>
        <Link
          href="/admin/books/new"
          className="rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white hover:bg-white/20 transition-colors"
        >
          + New Book
        </Link>
      </div>

      <p className="text-sm text-white/50 font-[family-name:var(--font-inter)]">
        {books.length} book{books.length !== 1 ? "s" : ""} total • {featuredCount}/3 featured
      </p>

      {books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <p className="text-white/50 font-[family-name:var(--font-inter)] mb-3">No books yet.</p>
          <Link href="/admin/books/new" className="text-sm text-white/70 hover:text-white underline underline-offset-4">
            Add your first book
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/8">
          {books.map((book) => (
            <div key={book.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                {book.featured && <span className="text-amber-400 text-sm shrink-0">★</span>}
                <div className="min-w-0">
                  <p className="text-white truncate">{book.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">
                    Created {formatDate(book.createdAt)}
                    {book.publishedAt ? ` • Published ${formatDate(book.publishedAt)}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider border ${statusColor(book.status)}`}>
                  {statusLabel(book.status)}
                </span>

                <form action={toggleBookFeatured}>
                  <input type="hidden" name="id" value={book.id} />
                  <button
                    type="submit"
                    className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                      book.featured
                        ? "text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
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
