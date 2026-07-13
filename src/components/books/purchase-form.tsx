"use client";

import { useEffect, useId, useRef, useState } from "react";
import SuccessScreen from "./purchase-form/success-screen";
import PaymentQR from "./purchase-form/payment-qr";

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
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const hasDiscount =
    discountedPrice != null &&
    discountedPrice > 0 &&
    discountedPrice < actualPrice;
  const payablePrice = hasDiscount ? discountedPrice : actualPrice;
  const subtotal = payablePrice * copies;
  const total = subtotal + shippingCharge;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        setError("");
        setSuccess(false);
        setOrderId("");
        setOpen(false);
        onOpenChange?.(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, success]);

  function setPanelOpen(nextOpen: boolean) {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  }

  function openPanel() {
    setError("");
    setSuccess(false);
    setOrderId("");
    setIdempotencyKey(crypto.randomUUID());
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
    formData.set("idempotencyKey", idempotencyKey);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(
          data?.error ?? "We couldn't place the order. Please try again.",
        );
      setSuccess(true);
      setOrderId(data.orderId);
      window.dispatchEvent(new CustomEvent("achievement-check"));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "We couldn't place the order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={openPanel}
        className="w-full rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-medium tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/20"
      >
        Purchase Book
      </button>
    );
  }

  if (success) {
    return (
      <SuccessScreen
        titleId={titleId}
        orderId={orderId}
        onClose={closePanel}
        closeButtonRef={closeButtonRef}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm"
      onClick={closePanel}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[88vh] w-[min(96vw,72rem)] overflow-y-auto rounded-[2rem] border border-white/15 bg-[#0f1118] p-5 shadow-2xl md:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h3 id={titleId} className="text-lg text-white md:text-xl">
              Purchase {bookTitle}
            </h3>
            <p className="mt-1 text-xs text-white/35">
              Review the offer, shipping and order total before paying.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closePanel}
            aria-label="Close purchase form"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="mb-5 space-y-3 rounded-2xl border border-white/10 bg-white/2 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs tracking-[0.18em] text-white/45 uppercase">
              Price
            </span>
            {hasDiscount && (
              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] tracking-wider text-emerald-300 uppercase">
                Offer
              </span>
            )}
          </div>
          {hasDiscount ? (
            <div className="space-y-1">
              <p className="text-sm text-white/35 line-through">
                ₹{actualPrice.toLocaleString("en-IN")}
              </p>
              <p className="text-2xl text-emerald-300">
                ₹{discountedPrice!.toLocaleString("en-IN")}
              </p>
            </div>
          ) : (
            <p className="text-2xl text-white">
              ₹{actualPrice.toLocaleString("en-IN")}
            </p>
          )}
          <p className="text-xs text-white/35">
            Shipping ₹{shippingCharge.toLocaleString("en-IN")} extra
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* Left: Form fields */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs text-white/60">
                    Full Name *
                  </label>
                  <input
                    name="name"
                    required
                    className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-white/60">
                    Email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-white/60">
                  Phone *
                </label>
                <input
                  name="phone"
                  type="tel"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={15}
                  className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-white/60">
                  Address *
                </label>
                <textarea
                  name="address"
                  required
                  rows={2}
                  className="w-full resize-none rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs text-white/60">
                    City *
                  </label>
                  <input
                    name="city"
                    required
                    className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-white/60">
                    State *
                  </label>
                  <input
                    name="state"
                    required
                    className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-white/60">
                    Pincode *
                  </label>
                  <input
                    name="pincode"
                    required
                    pattern="\d{6}"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs text-white/60">
                    Copies
                  </label>
                  <select
                    value={copies}
                    onChange={(e) => setCopies(parseInt(e.target.value, 10))}
                    className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                  <p className="mb-1 text-xs text-white/40">Subtotal</p>
                  <p className="text-xl font-medium text-white">
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
                <label className="mb-1.5 block text-xs text-white/60">
                  Payment Screenshot *
                </label>
                <input
                  name="paymentScreenshot"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2.5 text-sm text-white outline-none file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:text-white/70"
                />
                <p className="mt-1 text-[10px] text-white/25">
                  Upload the payment screenshot to place the order.
                  JPG/PNG/WebP, max 5 MB.
                </p>
              </div>
            </div>

            {/* Right: UPI QR Code */}
            <PaymentQR total={total} shippingCharge={shippingCharge} />
          </div>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-lg border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
