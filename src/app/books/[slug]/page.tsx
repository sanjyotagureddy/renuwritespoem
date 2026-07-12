import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/db";
import BookPurchaseLayout from "@/components/books/book-purchase-layout";
import BookLikeButton from "@/components/books/like-button";
import BookCommentSection from "@/components/books/comment-section";
import ShareButton from "@/components/ui/share-button";
import InviteModal from "@/components/ui/invite-modal";
import { siteConfig } from "@/lib/seo";
import { getCache, setCache } from "@/lib/cache";
import BookDescription from "@/components/books/book-description";
import BookViewTracker from "@/components/books/book-view-tracker";

type PageProps = {
  params: Promise<{ slug: string }>;
};

import { statusLabel, statusColor, formatDate } from "@/lib/utils";

import { Book } from "@prisma/client";

type BookCacheItem = Omit<Book, "coverData" | "coverMime">;

async function getBookBySlug(slug: string): Promise<BookCacheItem | null> {
  const cacheKey = `book:details:${slug}`;
  const cached = await getCache<BookCacheItem>(cacheKey);
  if (cached) {
    if (cached.createdAt) cached.createdAt = new Date(cached.createdAt);
    if (cached.updatedAt) cached.updatedAt = new Date(cached.updatedAt);
    if (cached.publishedAt) cached.publishedAt = new Date(cached.publishedAt);
    return cached;
  }

  const prisma = getPrisma();
  const book = await prisma.book.findUnique({
    where: { slug },
    omit: { coverData: true, coverMime: true },
  });

  if (book) {
    await setCache(cacheKey, book, 86400); // Cache for 24 hours
  }
  return book;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    return { title: "Book Not Found" };
  }

  const description = book.description ?? `${book.title} by Renu.`;
  const images = book.coverImage ? [book.coverImage] : ["/author.jpg"];

  return {
    title: book.title,
    description,
    alternates: {
      canonical: `/books/${slug}`,
    },
    openGraph: {
      title: book.title,
      description,
      type: "website",
      url: `/books/${slug}`,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: book.title,
      description,
      images,
    },
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book || book.status === "ARCHIVED") {
    notFound();
  }

  const canPurchase = book.status === "AVAILABLE" && Boolean(book.price);

  const bookSchema = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "description": book.description ?? `${book.title} by Renu`,
    "image": book.coverImage
      ? (book.coverImage.startsWith("http") ? book.coverImage : `${siteConfig.url}${book.coverImage}`)
      : `${siteConfig.url}/author.jpg`,
    "author": {
      "@type": "Person",
      "name": siteConfig.author,
      "url": siteConfig.url
    },
    ...(book.status === "AVAILABLE" && book.price ? {
      "offers": {
        "@type": "Offer",
        "price": Number(book.price),
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "url": book.purchaseUrl ?? `${siteConfig.url}/books/${book.slug}`
      }
    } : book.status === "COMING_SOON" ? {
      "offers": {
        "@type": "Offer",
        "availability": "https://schema.org/PreOrder",
        "url": `${siteConfig.url}/books/${book.slug}`
      }
    } : {})
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteConfig.url,
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Books",
        "item": `${siteConfig.url}/books`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": book.title,
        "item": `${siteConfig.url}/books/${book.slug}`,
      },
    ],
  };

  if (canPurchase) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
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
            price: Number(book.price ?? 0),
            discountedPrice: book.discountedPrice
              ? Number(book.discountedPrice)
              : null,
            shippingCharge: Number(book.shippingCharge),
            views: book.views || 0,
          }}
        />
        <BookViewTracker bookId={book.id} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
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
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] tracking-wider text-white/50 uppercase whitespace-nowrap">
                    {(book.views || 0).toLocaleString()} {(book.views || 0) === 1 ? 'view' : 'views'}
                  </span>
                </div>

                <h1 className="mb-4 text-3xl text-white md:text-4xl">
                  {book.title}
                </h1>

                {book.description && (
                  <BookDescription description={book.description} />
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
              <ShareButton
                shareUrl={`${siteConfig.url}/books/${book.slug}`}
                title={book.title}
                shareText={`Check out the book "${book.title}"${book.price ? ` (₹${Number(book.price)})` : ""} on Renu Writes Poem:`}
                accentClass="text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/30"
              />
              <InviteModal
                accentClass="text-emerald-400 border-emerald-500/30"
                buttonAccent="hover:border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400"
              />
              <div className="border-t border-white/10 pt-5">
                <BookCommentSection slug={book.slug} />
              </div>
            </div>
          </aside>
        )}
      </div>
      <BookViewTracker bookId={book.id} />
    </div>
  );
}
