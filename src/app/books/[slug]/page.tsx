import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/db";
import BookPurchaseLayout from "@/components/books/book-purchase-layout";
import BookLikeButton from "@/components/books/like-button";
import BookCommentSection from "@/components/books/comment-section";

type PageProps = {
  params: Promise<{ slug: string }>;
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

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await getPrisma().book.findUnique({
    where: { slug },
    omit: { coverData: true, coverMime: true },
  });

  if (!book) {
    return { title: "Book Not Found" };
  }

  return {
    title: book.title,
    description: book.description ?? `${book.title} by Renu`,
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const prisma = getPrisma();

  const book = await prisma.book.findUnique({
    where: { slug },
    omit: { coverData: true, coverMime: true },
  });

  if (!book || book.status === "ARCHIVED") {
    notFound();
  }

  const canPurchase = book.status === "AVAILABLE" && Boolean(book.price);

  if (canPurchase) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <Link
          href="/books"
          className="mb-10 inline-flex items-center gap-2 text-xs tracking-[0.2em] text-white/50 uppercase hover:text-white/80"
        >
          ← Back to Books
        </Link>

        <BookPurchaseLayout
          book={{
            id: book.id,
            title: book.title,
            slug: book.slug,
            description: book.description,
            coverImage: book.coverImage,
            featured: book.featured,
            status: book.status,
            publishedAt: book.publishedAt
              ? book.publishedAt.toISOString()
              : null,
            price: book.price ?? 0,
            discountedPrice: book.discountedPrice,
            shippingCharge: book.shippingCharge,
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <Link
        href="/books"
        className="mb-10 inline-flex items-center gap-2 text-xs tracking-[0.2em] text-white/50 uppercase hover:text-white/80"
      >
        ← Back to Books
      </Link>

      <div
        className={`grid grid-cols-1 items-start gap-8 ${canPurchase ? "lg:grid-cols-1" : "lg:grid-cols-[1fr_320px]"}`}
      >
        <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/3">
          <div className="flex flex-col md:flex-row">
            <div className="relative aspect-3/4 bg-white/5 md:aspect-auto md:w-72 md:shrink-0">
              {book.coverImage ? (
                <Image
                  src={book.coverImage}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 288px"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-6xl text-white/10">📖</span>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between gap-8 p-7 md:p-10">
              <div>
                <div className="mb-4 flex items-center gap-2">
                  {book.featured && (
                    <span className="text-sm text-amber-400">★</span>
                  )}
                  <span
                    className={`rounded-full border px-3 py-1 text-xs tracking-wider uppercase ${statusColor(book.status)}`}
                  >
                    {statusLabel(book.status)}
                  </span>
                  {book.publishedAt && (
                    <span className="ml-auto text-xs tracking-wider text-white/40 uppercase">
                      {formatDate(book.publishedAt)}
                    </span>
                  )}
                </div>

                <h1 className="mb-4 text-3xl text-white md:text-4xl">
                  {book.title}
                </h1>

                {book.description && (
                  <p className="font-(family-name:--font-inter) leading-relaxed whitespace-pre-line text-white/65">
                    {book.description}
                  </p>
                )}
              </div>

              {book.status === "AVAILABLE" ? (
                <div>
                  {book.purchaseUrl ? (
                    <a
                      href={book.purchaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-3 text-sm tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/20"
                    >
                      Purchase Book
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3 text-sm tracking-[0.18em] text-white/40 uppercase"
                    >
                      Purchase Coming Soon
                    </button>
                  )}
                </div>
              ) : null}

              {book.status === "COMING_SOON" && (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/5 px-6 py-3 text-sm tracking-[0.18em] text-amber-400/70 uppercase">
                  Coming Soon
                </div>
              )}
            </div>
          </div>
        </div>

        {!canPurchase && (
          <aside className="lg:sticky lg:top-24">
            <div className="space-y-6 rounded-2xl border border-white/15 bg-white/3 p-5">
              <BookLikeButton slug={book.slug} />
              <div className="border-t border-white/10 pt-5">
                <BookCommentSection slug={book.slug} />
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
