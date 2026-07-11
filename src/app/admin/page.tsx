import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { poemLanguageLabel, type PoemLanguage } from "@/lib/poem-language";
import { toggleFeatured } from "./poem-actions";
import ClearCacheButton from "@/components/admin/clear-cache-button";
import { formatDate } from "@/lib/utils";


function bookStatusLabel(status: string): string {
  switch (status) {
    case "AVAILABLE":
      return "Live";
    case "COMING_SOON":
      return "Draft";
    case "ARCHIVED":
      return "Archived";
    default:
      return status;
  }
}

function bookStatusColor(status: string): string {
  switch (status) {
    case "AVAILABLE":
      return "text-emerald-400/70";
    case "COMING_SOON":
      return "text-white/40";
    default:
      return "text-white/30";
  }
}

export default async function AdminDashboard() {
  const prisma = getPrisma();

  const [
    totalPoems,
    publishedPoems,
    draftPoems,
    featuredPoems,
    recentPoems,
    totalBooks,
    availableBooks,
    featuredBooks,
    recentBooks,
  ] = await Promise.all([
    prisma.poem.count(),
    prisma.poem.count({ where: { published: true } }),
    prisma.poem.count({ where: { published: false } }),
    prisma.poem.findMany({
      where: { featured: true },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        language: true,
        published: true,
        featured: true,
        publishedAt: true,
      },
    }),
    prisma.poem.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        language: true,
        published: true,
        featured: true,
        createdAt: true,
      },
    }),
    prisma.book.count(),
    prisma.book.count({ where: { status: "AVAILABLE" } }),
    prisma.book.findMany({
      where: { featured: true },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        featured: true,
        publishedAt: true,
        price: true,
        discountedPrice: true,
      },
    }),
    prisma.book.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        featured: true,
        createdAt: true,
        price: true,
        discountedPrice: true,
      },
    }),
  ]);

  const stats = [
    { label: "Total Poems", value: totalPoems },
    { label: "Published", value: publishedPoems },
    { label: "Drafts", value: draftPoems },
    { label: "Featured", value: `${featuredPoems.length}/3` },
  ];

  const bookStats = [
    { label: "Total Books", value: totalBooks },
    { label: "Available", value: availableBooks },
    { label: "Featured", value: `${featuredBooks.length}/3` },
    { label: "New Books", value: recentBooks.length },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl text-white md:text-4xl">Dashboard</h1>
        <div>
          <ClearCacheButton />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/10 bg-white/3 p-5"
          >
            <p className="mb-2 text-xs tracking-[0.18em] text-white/40 uppercase">
              {stat.label}
            </p>
            <p className="text-3xl text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Books */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl text-white">Books</h2>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/books"
              className="text-xs tracking-wider text-white/50 uppercase hover:text-white"
            >
              View all →
            </Link>
            <Link
              href="/admin/books/new"
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/20"
            >
              + New Book
            </Link>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {bookStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/3 p-5"
            >
              <p className="mb-2 text-xs tracking-[0.18em] text-white/40 uppercase">
                {stat.label}
              </p>
              <p className="text-3xl text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {featuredBooks.length > 0 && (
          <div className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-5">
            <p className="mb-3 text-xs tracking-[0.2em] text-amber-300/70 uppercase">
              Featured Books
            </p>
            <div className="flex flex-wrap gap-3">
              {featuredBooks.map((book) => (
                <Link
                  key={book.id}
                  href={`/admin/books/${book.id}/edit`}
                  className="rounded-full border border-amber-400/20 bg-black/10 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {book.title}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="divide-y divide-white/8 rounded-2xl border border-white/10 bg-white/3">
          {recentBooks.length === 0 ? (
            <div className="p-6 text-center">
              <p className="font-(family-name:--font-inter) text-white/50">
                No books yet.
              </p>
            </div>
          ) : (
            recentBooks.map((book) => (
              <div
                key={book.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-white">
                    {book.featured ? (
                      <span className="mr-2 text-amber-400">★</span>
                    ) : null}
                    {book.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`tracking-wider uppercase ${bookStatusColor(book.status)}`}
                    >
                      {bookStatusLabel(book.status)}
                    </span>
                    <span className="text-white/35">
                      {book.discountedPrice
                        ? `Offer ₹${Number(book.discountedPrice).toLocaleString("en-IN")}`
                        : `₹${book.price ? Number(book.price).toLocaleString("en-IN") : "0"}`}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Link
                    href={`/admin/books/${book.id}/edit`}
                    className="text-xs text-white/50 hover:text-white"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/books/${book.slug}`}
                    className="text-xs text-white/50 hover:text-white"
                    target="_blank"
                  >
                    View ↗
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Featured Poems */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl text-white">Featured Poems</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs tracking-wider text-white/40 uppercase">
              {featuredPoems.length} of 3 slots used
            </span>
            <Link
              href="/admin/poems/new"
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/20"
            >
              + New Poem
            </Link>
          </div>
        </div>

        {featuredPoems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-white/2 p-8 text-center">
            <p className="mb-3 font-(family-name:--font-inter) text-white/50">
              No poems are featured yet.
            </p>
            <Link
              href="/admin/poems"
              className="text-sm text-white/70 underline underline-offset-4 hover:text-white"
            >
              Go to Poems to feature one
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {featuredPoems.map((poem) => (
              <div
                key={poem.id}
                className="flex flex-col justify-between rounded-2xl border border-amber-400/20 bg-amber-500/5 p-5"
              >
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-xs text-amber-400">★</span>
                    <span className="text-xs tracking-wider text-white/50 uppercase">
                      {poemLanguageLabel(poem.language as PoemLanguage)}
                    </span>
                    <span
                      className={`ml-auto text-xs tracking-wider uppercase ${poem.published ? "text-emerald-400/70" : "text-white/40"}`}
                    >
                      {poem.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <h3 className="mb-2 text-lg text-white">{poem.title}</h3>
                  <p className="text-xs text-white/40">
                    {formatDate(poem.publishedAt)}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Link
                    href={`/admin/poems/${poem.id}/edit`}
                    className="text-xs text-white/60 underline underline-offset-4 hover:text-white"
                  >
                    Edit
                  </Link>
                  <form action={toggleFeatured}>
                    <input type="hidden" name="id" value={poem.id} />
                    <button
                      type="submit"
                      className="text-xs text-amber-400/70 underline underline-offset-4 hover:text-amber-300"
                    >
                      Unfeature
                    </button>
                  </form>
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: 3 - featuredPoems.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex min-h-35 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/1 p-5"
              >
                <p className="text-xs tracking-wider text-white/30 uppercase">
                  Empty slot
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Poems */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl text-white">Recent Poems</h2>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/poems"
              className="text-xs tracking-wider text-white/50 uppercase hover:text-white"
            >
              View all →
            </Link>
            <Link
              href="/admin/poems/new"
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/20"
            >
              + New Poem
            </Link>
          </div>
        </div>
        <div className="divide-y divide-white/8 rounded-2xl border border-white/10 bg-white/3">
          {recentPoems.length === 0 ? (
            <div className="p-6 text-center">
              <p className="font-(family-name:--font-inter) text-white/50">
                No poems yet.
              </p>
            </div>
          ) : (
            recentPoems.map((poem) => (
              <div
                key={poem.id}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {poem.featured && (
                    <span className="shrink-0 text-sm text-amber-400">★</span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-white">{poem.title}</p>
                    <p className="mt-0.5 text-xs text-white/40">
                      {poemLanguageLabel(poem.language as PoemLanguage)} •{" "}
                      {formatDate(poem.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`text-xs tracking-wider uppercase ${poem.published ? "text-emerald-400/70" : "text-white/40"}`}
                  >
                    {poem.published ? "Live" : "Draft"}
                  </span>
                  <Link
                    href={`/admin/poems/${poem.id}/edit`}
                    className="text-xs text-white/50 hover:text-white"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
