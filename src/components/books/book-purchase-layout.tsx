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

  return (
    <div className={`grid grid-cols-1 gap-8 items-start ${purchaseOpen ? "lg:grid-cols-1" : "lg:grid-cols-[1fr_320px]"}`}>
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

            <div className="rounded-2xl border border-white/10 bg-white/2 p-5 md:p-6 space-y-4">
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/45 mb-2">Purchase</p>
                  <p className="text-2xl text-white">₹{book.price.toLocaleString("en-IN")}</p>
                </div>
                <p className="text-xs text-white/35 max-w-sm text-left md:text-right">
                  Manual UPI checkout with shipping set from the admin panel.
                </p>
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
          <div className="rounded-2xl border border-white/15 bg-white/3 p-5 space-y-6">
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