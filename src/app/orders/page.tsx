"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import { lookupOrder } from "./order-lookup-action";

type OrderDetails = {
  id: string;
  orderNumber: string | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  copies: number;
  shippingAmount: number;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "REJECTED";
  adminNote: string | null;
  trackingProvider: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  createdAt: string;
  book: {
    title: string;
    coverImage: string | null;
  };
};

export default function OrderLookupPage() {
  const [isPending, startTransition] = useTransition();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderDetails | null>(null);

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const data = await lookupOrder(orderId, email);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lookup failed.");
        setOrder(null);
      }
    });
  }

  function handleReset() {
    setOrder(null);
    setOrderId("");
    setEmail("");
    setError("");
  }

  return (
    <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-24 overflow-hidden min-h-[75vh]">
      {/* Background glow */}
      <div className="absolute -top-10 left-1/4 w-[30rem] h-[30rem] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      {!order ? (
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium tracking-wider text-emerald-300 uppercase mb-4">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Tracking
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-emerald-100 to-teal-300 bg-clip-text text-transparent">
              Track Your Order
            </h1>
            <p className="text-sm text-white/50 leading-relaxed font-[family-name:var(--font-inter)]">
              Enter your Order Number (e.g. #10001 or ID) and email address below to look up your shipment status.
            </p>
          </div>

          <form onSubmit={handleLookup} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5 font-semibold">
                Order Number or ID
              </label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. #10001"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/40 mb-1.5 font-semibold">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. buyer@example.com"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-300">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 py-3 text-xs font-semibold tracking-wider text-black uppercase transition-all hover:scale-[1.01] disabled:opacity-40"
            >
              {isPending ? "Searching..." : "Track Status"}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-8 animate-fadeIn font-[family-name:var(--font-inter)]">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/10 pb-6">
            <div>
              <button
                onClick={handleReset}
                className="text-xs text-emerald-400 hover:underline uppercase tracking-wider mb-2 block"
              >
                ← Look Up Another Order
              </button>
              <h1 className="text-2xl font-bold text-white">
                Order {order.orderNumber ?? order.id}
              </h1>
              <p className="text-xs text-white/40 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </p>
            </div>
            <div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                order.status === "DELIVERED"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : order.status === "SHIPPED"
                  ? "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                  : order.status === "CONFIRMED"
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  : order.status === "REJECTED"
                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                  : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
              }`}>
                {order.status}
              </span>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left: Timeline & Status Details */}
            <div className="md:col-span-7 space-y-6">
              {/* Timeline */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
                <h3 className="text-xs uppercase tracking-wider text-white/40 font-semibold mb-4">
                  Shipment Status Timeline
                </h3>
                <div className="relative border-l border-white/10 pl-6 ml-3 space-y-6">
                  {/* Step 1: Placed */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500" />
                    <p className="text-xs font-semibold text-white">Order Placed</p>
                    <p className="text-[11px] text-white/50">Your order has been received and is awaiting payment manual check.</p>
                  </div>

                  {/* Step 2: Confirmed */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full ${
                      ["CONFIRMED", "SHIPPED", "DELIVERED"].includes(order.status)
                        ? "bg-emerald-500"
                        : "bg-[#181a20] border border-white/10"
                    }`} />
                    <p className={`text-xs font-semibold ${["CONFIRMED", "SHIPPED", "DELIVERED"].includes(order.status) ? "text-white" : "text-white/30"}`}>
                      Payment Confirmed
                    </p>
                    <p className="text-[11px] text-white/40">We verified your payment screenshot. Preparing shipment.</p>
                  </div>

                  {/* Step 3: Shipped */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full ${
                      ["SHIPPED", "DELIVERED"].includes(order.status)
                        ? "bg-emerald-500"
                        : "bg-[#181a20] border border-white/10"
                    }`} />
                    <p className={`text-xs font-semibold ${["SHIPPED", "DELIVERED"].includes(order.status) ? "text-white" : "text-white/30"}`}>
                      Dispatched / In Transit
                    </p>
                    <p className="text-[11px] text-white/40">Your package has been handed over to the courier partner.</p>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full ${
                      order.status === "DELIVERED"
                        ? "bg-emerald-500"
                        : "bg-[#181a20] border border-white/10"
                    }`} />
                    <p className={`text-xs font-semibold ${order.status === "DELIVERED" ? "text-white" : "text-white/30"}`}>
                      Delivered
                    </p>
                    <p className="text-[11px] text-white/40">Enjoy the poetry! Book has been safely delivered.</p>
                  </div>
                </div>
              </div>

              {/* Status Note or Refund/Cancellation Alert */}
              {(order.status === "REJECTED" || order.adminNote) && (
                <div className={`rounded-2xl border p-5 ${
                  order.status === "REJECTED"
                    ? "border-rose-500/20 bg-rose-500/5 text-rose-300"
                    : "border-emerald-500/20 bg-emerald-500/5 text-emerald-300"
                }`}>
                  <h3 className="text-xs uppercase tracking-wider font-semibold mb-2">
                    {order.status === "REJECTED" ? "⚠️ Order Update Notes" : "💡 Note From Author"}
                  </h3>
                  <p className="text-xs leading-relaxed text-white/70">
                    {order.adminNote ?? "No additional notes provided. Please contact support if you have questions."}
                  </p>
                </div>
              )}

              {/* Tracking Details Block */}
              {order.status === "SHIPPED" && order.trackingNumber && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
                  <h3 className="text-xs uppercase tracking-wider text-white/40 font-semibold">
                    Delivery Courier Tracking
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-white/40">Courier Partner</p>
                      <p className="font-semibold text-white mt-0.5">{order.trackingProvider}</p>
                    </div>
                    <div>
                      <p className="text-white/40">Tracking ID</p>
                      <p className="font-semibold text-white mt-0.5">{order.trackingNumber}</p>
                    </div>
                  </div>
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-all text-center w-full"
                    >
                      Track Shipment on Courier Website ↗
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Right: Item details, price, address */}
            <div className="md:col-span-5 space-y-6">
              {/* Product Info */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <h3 className="text-xs uppercase tracking-wider text-white/40 font-semibold">
                  Items Purchased
                </h3>
                <div className="flex gap-4">
                  <div className="relative w-16 h-20 rounded-lg overflow-hidden border border-white/10 bg-white/5 shrink-0">
                    {order.book.coverImage ? (
                      <Image
                        src={order.book.coverImage}
                        alt={order.book.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-xl">📖</div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white leading-snug">
                      {order.book.title}
                    </h4>
                    <p className="text-[11px] text-white/40 mt-1">Quantity: {order.copies}</p>
                    <p className="text-xs font-bold text-emerald-400 mt-2">
                      Total: ₹{order.totalAmount}
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 text-xs space-y-1.5 text-white/50 font-[family-name:var(--font-inter)]">
                  <div className="flex justify-between">
                    <span>Copies Subtotal</span>
                    <span className="text-white">₹{order.totalAmount - order.shippingAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Charge</span>
                    <span className="text-white">₹{order.shippingAmount}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2 font-bold text-sm">
                    <span className="text-white">Total Amount Paid</span>
                    <span className="text-emerald-400">₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-3">
                <h3 className="text-xs uppercase tracking-wider text-white/40 font-semibold">
                  Shipping Destination
                </h3>
                <div className="text-xs leading-relaxed text-white/70">
                  <p className="font-semibold text-white">{order.name}</p>
                  <p className="mt-1">{order.address}</p>
                  <p>{order.city}, {order.state} - {order.pincode}</p>
                  <p className="mt-2 text-white/40">Phone: {order.phone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
