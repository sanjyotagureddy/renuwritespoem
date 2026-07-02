import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/db";
import BookPurchaseLayout from "@/components/books/book-purchase-layout";
import BookLikeButton from "@/components/books/like-button";
import BookCommentSection from "@/components/books/comment-section";
import PurchaseForm from "@/components/books/purchase-form";

type PageProps = {
  params: Promise<{ slug: string }>;
};

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
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <Link
          href="/books"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50 hover:text-white/80 mb-10"
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
            publishedAt: book.publishedAt ? book.publishedAt.toISOString() : null,
            price: book.price ?? 0,
            discountedPrice: book.discountedPrice,
            shippingCharge: book.shippingCharge,
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <Link
        href="/books"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/50 hover:text-white/80 mb-10"
      >
        ← Back to Books
      </Link>

      <div className={`grid grid-cols-1 gap-8 items-start ${canPurchase ? "lg:grid-cols-1" : "lg:grid-cols-[1fr_320px]"}`}>
        <div className="rounded-2xl border border-white/15 bg-white/3 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-72 md:shrink-0 aspect-3/4 md:aspect-auto relative bg-white/5">
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

            <div className="p-7 md:p-10 flex flex-col justify-between flex-1 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  {book.featured && <span className="text-amber-400 text-sm">★</span>}
                  <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wider ${statusColor(book.status)}`}>
                    {statusLabel(book.status)}
                  </span>
                  {book.publishedAt && (
                    <span className="ml-auto text-xs uppercase tracking-wider text-white/40">
                      {formatDate(book.publishedAt)}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl text-white mb-4">{book.title}</h1>

                {book.description && (
                  <p className="text-white/65 leading-relaxed font-(family-name:--font-inter) whitespace-pre-line">
                    {book.description}
                  </p>
                )}
              </div>

              {book.status === "AVAILABLE" && book.price ? (
                <div className="rounded-2xl border border-white/10 bg-white/2 p-5 md:p-6 space-y-4">
                  <div className="flex items-end justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/45 mb-2">Purchase</p>
                      <p className="text-2xl text-white">₹{book.price.toLocaleString("en-IN")}</p>
                    </div>
                    <p className="text-xs text-white/35 max-w-sm text-left md:text-right">
                      Manual UPI checkout with shipping included. The form below uses the full width.
                    </p>
                  </div>
                  <PurchaseForm bookId={book.id} bookTitle={book.title} price={book.price} />
                </div>
              ) : book.status === "AVAILABLE" ? (
                <div>
                  {book.purchaseUrl ? (
                    <a
                      href={book.purchaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-3 text-sm uppercase tracking-[0.18em] text-white hover:bg-white/20 transition-colors"
                    >
                      Purchase Book
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3 text-sm uppercase tracking-[0.18em] text-white/40 cursor-not-allowed"
                    >
                      Purchase Coming Soon
                    </button>
                  )}
                </div>
              ) : null}

              {book.status === "COMING_SOON" && (
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/5 px-6 py-3 text-sm uppercase tracking-[0.18em] text-amber-400/70">
                  Coming Soon
                </div>
              )}
            </div>
          </div>
        </div>

        {!canPurchase && (
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-white/15 bg-white/3 p-5 space-y-6">
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
