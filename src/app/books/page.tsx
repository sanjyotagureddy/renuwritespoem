import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPrisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Books",
  description: "Explore books by Renu — poetry collections and more.",
};

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

export default async function BooksPage() {
  const prisma = getPrisma();

  const books = await prisma.book.findMany({
    where: { status: { not: "ARCHIVED" } },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    omit: { coverData: true, coverMime: true },
    include: {
      _count: { select: { likes: true, comments: true } },
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <div className="mb-12 md:mb-16">
        <p className="text-sm uppercase tracking-[0.22em] text-white/40 mb-3">Library</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Books</h1>
        <p className="text-lg text-white/60 max-w-3xl font-[family-name:var(--font-inter)]">
          Poetry collections, anthologies, and writings by Renu.
        </p>
      </div>

      {books.length === 0 ? (
        <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-10 text-center">
          <h2 className="text-2xl text-white mb-3">No books yet</h2>
          <p className="text-white/60 font-[family-name:var(--font-inter)]">
            Books will appear here once published.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.slug}`}
              className="group rounded-2xl border border-white/15 bg-white/[0.03] overflow-hidden transition-colors hover:border-white/30 flex flex-col sm:flex-row"
            >
              {/* Cover Image */}
              <div className="sm:w-48 sm:shrink-0 aspect-[3/4] sm:aspect-auto relative bg-white/5">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 192px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl text-white/10">📖</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {book.featured && <span className="text-amber-400 text-xs">★</span>}
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${statusColor(book.status)}`}>
                      {statusLabel(book.status)}
                    </span>
                  </div>

                  <h2 className="text-xl text-white mb-2 group-hover:text-white/90">
                    {book.title}
                  </h2>

                  {book.description && (
                    <p className="text-sm text-white/55 leading-relaxed line-clamp-3 mb-4">
                      {book.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-white/35">
                    <span className="flex items-center gap-1">♡ {book._count.likes}</span>
                    <span className="flex items-center gap-1">💬 {book._count.comments}</span>
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-white/60 group-hover:text-white transition-colors">
                    View →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
