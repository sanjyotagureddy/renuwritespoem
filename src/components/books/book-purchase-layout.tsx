"use client";

import { useState } from "react";
import Image from "next/image";
import BookLikeButton from "./like-button";
import BookCommentSection from "./comment-section";
import PurchaseForm from "./purchase-form";

type BookPurchaseLayoutProps = {
  book: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    coverImage: string | null;
    featured: boolean;
    status: string;
    publishedAt: string | null;
    price: number;
    discountedPrice: number | null;
    shippingCharge: number;
  };
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

function formatDate(date: string | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export default function BookPurchaseLayout({ book }: BookPurchaseLayoutProps) {
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const hasDiscount =
    book.discountedPrice != null &&
    book.discountedPrice > 0 &&
    book.discountedPrice < book.price;
  const discountPercent = hasDiscount
    ? Math.round(((book.price - book.discountedPrice!) / book.price) * 100)
    : 0;

  return (
    <div
      className={`grid grid-cols-1 items-start gap-8 ${purchaseOpen ? "lg:grid-cols-1" : "lg:grid-cols-[1fr_320px]"}`}
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
                {hasDiscount ? (
                  <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-medium tracking-wider text-amber-300 uppercase">
                    Sale
                  </span>
                ) : null}
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

            <div className="space-y-4 rounded-2xl border border-white/10 bg-white/2 p-5 md:p-6">
              <div>
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <p className="text-xs tracking-[0.2em] text-white/45 uppercase">
                      Purchase
                    </p>
                    {hasDiscount ? (
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium tracking-wider text-emerald-300 uppercase">
                        Limited-time deal · {discountPercent}% off
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2">
                    {hasDiscount ? (
                      <div className="flex items-baseline gap-3">
                        <p className="text-3xl font-medium text-emerald-300">
                          ₹{book.discountedPrice!.toLocaleString("en-IN")}
                        </p>
                        <p className="text-base text-white/35 line-through">
                          ₹{book.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                    ) : (
                      <p className="text-2xl text-white">
                        ₹{book.price.toLocaleString("en-IN")}
                      </p>
                    )}
                    <p
                      className={`text-xs ${book.shippingCharge === 0 ? "font-medium text-emerald-300" : "text-white/45"}`}
                    >
                      {book.shippingCharge === 0
                        ? "Free shipping"
                        : `+ ₹${book.shippingCharge.toLocaleString("en-IN")} shipping`}
                    </p>
                  </div>
                </div>
              </div>

              <PurchaseForm
                bookId={book.id}
                bookTitle={book.title}
                actualPrice={book.price}
                discountedPrice={book.discountedPrice}
                shippingCharge={book.shippingCharge}
                onOpenChange={setPurchaseOpen}
              />
            </div>
          </div>
        </div>
      </div>

      {!purchaseOpen && (
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
  );
}
