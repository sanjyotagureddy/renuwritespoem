"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type PurchaseFormProps = {
  bookId: string;
  bookTitle: string;
  actualPrice: number;
  discountedPrice: number | null;
  shippingCharge: number;
  onOpenChange?: (open: boolean) => void;
};

export default function PurchaseForm({
  bookId,
  bookTitle,
  actualPrice,
  discountedPrice,
  shippingCharge,
  onOpenChange,
}: PurchaseFormProps) {
  const [open, setOpen] = useState(false);
  const [copies, setCopies] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");

  const hasDiscount = discountedPrice != null && discountedPrice > 0 && discountedPrice < actualPrice;
  const payablePrice = hasDiscount ? discountedPrice : actualPrice;
  const subtotal = payablePrice * copies;
  const total = subtotal + shippingCharge;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        closePanel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function setPanelOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  function openPanel() {
    setError("");
    setSuccess(false);
    setOrderId("");
    setPanelOpen(true);
  }

  function closePanel() {
    setError("");
    setSuccess(false);
    setOrderId("");
    setPanelOpen(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("bookId", bookId);
    formData.set("copies", String(copies));

    const res = await fetch("/api/orders", { method: "POST", body: formData });
    const data = await res.json();

    if (res.ok) {
      setSuccess(true);
      setOrderId(data.orderId);
    } else {
      setError(data.error ?? "Something went wrong.");
    }
    setSubmitting(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={openPanel}
        className="w-full rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm uppercase tracking-[0.18em] text-white hover:bg-white/20 transition-colors font-medium"
      >
        Purchase Book
      </button>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm" onClick={closePanel}>
        <div className="w-[min(96vw,72rem)] rounded-[2rem] border border-emerald-400/20 bg-[#0f1118] p-6 text-center shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <p className="text-emerald-400 text-lg mb-2">Order Placed!</p>
        <p className="text-white/60 text-sm mb-1">Order ID: {orderId}</p>
        <p className="text-white/50 text-xs">
          You will receive a confirmation email shortly. We will verify your payment and update you.
        </p>
        <button
          type="button"
          onClick={closePanel}
          className="mt-4 text-xs text-white/40 hover:text-white/60 underline underline-offset-4"
        >
          Close
        </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm" onClick={closePanel}>
      <div className="w-[min(96vw,72rem)] max-h-[88vh] overflow-y-auto rounded-[2rem] border border-white/15 bg-[#0f1118] p-5 md:p-7 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-lg md:text-xl text-white">Purchase {bookTitle}</h3>
            <p className="text-xs text-white/35 mt-1">Review the offer, shipping and order total before paying.</p>
          </div>
          <button
            type="button"
            onClick={closePanel}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="mb-5 rounded-2xl border border-white/10 bg-white/2 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-xs uppercase tracking-[0.18em] text-white/45">Price</span>
            {hasDiscount && (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-emerald-300">
                Offer
              </span>
            )}
          </div>
          {hasDiscount ? (
            <div className="space-y-1">
              <p className="text-sm text-white/35 line-through">₹{actualPrice.toLocaleString("en-IN")}</p>
              <p className="text-2xl text-emerald-300">₹{discountedPrice!.toLocaleString("en-IN")}</p>
            </div>
          ) : (
            <p className="text-2xl text-white">₹{actualPrice.toLocaleString("en-IN")}</p>
          )}
          <p className="text-xs text-white/35">Shipping ₹{shippingCharge.toLocaleString("en-IN")} extra</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
          {/* Left: Form fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Full Name *</label>
                <input name="name" required className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30" />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Email *</label>
                <input name="email" type="email" required className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1.5">Phone *</label>
              <input name="phone" type="tel" required className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30" />
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1.5">Address *</label>
              <textarea name="address" required rows={2} className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30 resize-none" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-white/60 mb-1.5">City *</label>
                <input name="city" required className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30" />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1.5">State *</label>
                <input name="state" required className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30" />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Pincode *</label>
                <input name="pincode" required pattern="\d{6}" maxLength={6} className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/60 mb-1.5">Copies</label>
                <select
                  value={copies}
                  onChange={(e) => setCopies(parseInt(e.target.value, 10))}
                  className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <p className="text-xs text-white/40 mb-1">Subtotal</p>
                <p className="text-xl text-white font-medium">
                  ₹{subtotal.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-white/30">
                  ₹{payablePrice.toLocaleString("en-IN")} × {copies}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/2 px-4 py-3 text-sm text-white/70">
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>₹{shippingCharge.toLocaleString("en-IN")}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-white">
                <span>Total Payable</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1.5">Payment Screenshot *</label>
              <input
                name="paymentScreenshot"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-white/70 file:cursor-pointer"
              />
              <p className="text-[10px] text-white/25 mt-1">Upload the payment screenshot to place the order. JPG/PNG/WebP, max 5 MB.</p>
            </div>
          </div>

          {/* Right: UPI QR Code */}
          <div className="flex flex-col items-center justify-start rounded-2xl border border-white/10 bg-white/2 p-5 lg:sticky lg:top-0">
            <p className="text-xs uppercase tracking-wider text-white/50 mb-3">Pay via UPI</p>
            <div className="relative mb-3 w-full max-w-[320px] aspect-3/4 rounded-2xl bg-white p-4">
              <Image
                src="/upi-qr.png"
                alt="UPI QR Code"
                fill
                sizes="(max-width: 1024px) 100vw, 320px"
                className="object-contain p-2"
              />
            </div>
            <p className="text-lg text-white font-medium mb-1">
              ₹{total.toLocaleString("en-IN")}
            </p>
            <p className="text-[10px] text-white/30 text-center">
              Includes ₹{shippingCharge} shipping. Scan to pay, then upload the screenshot.
            </p>
          </div>
        </div>

          {error && (
            <div className="rounded-lg border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm uppercase tracking-[0.18em] text-white hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
