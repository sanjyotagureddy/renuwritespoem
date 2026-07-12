"use client";

import React, { useState } from "react";
import OrderStatusForm from "@/components/admin/order-status-form";
import { formatDateTime as formatDate } from "@/lib/utils";

type OrderType = {
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
  shippingAmount: unknown;
  totalAmount: unknown;
  status: string;
  trackingProvider: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  adminNote: string | null;
  createdAt: Date;
  book: {
    title: string;
    slug: string;
  };
};

const statusColors: Record<string, string> = {
  PENDING: "border-amber-400/30 text-amber-400/80 bg-amber-500/10",
  CONFIRMED: "border-blue-400/30 text-blue-400/80 bg-blue-500/10",
  SHIPPED: "border-purple-400/30 text-purple-400/80 bg-purple-500/10",
  DELIVERED: "border-emerald-400/30 text-emerald-400/80 bg-emerald-500/10",
  REJECTED: "border-rose-400/30 text-rose-400/80 bg-rose-500/10",
};

export default function OrdersClient({
  initialOrders,
  updateOrderStatusAction,
}: {
  initialOrders: OrderType[];
  updateOrderStatusAction: (formData: FormData) => void | Promise<void>;
}) {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  function toggleExpand(id: string) {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  return (
    <div className="space-y-3">
      {initialOrders.map((order) => {
        const isExpanded = expandedIds[order.id];
        const displayOrderId = order.orderNumber ?? order.id;

        return (
          <div
            key={order.id}
            className={`rounded-2xl border transition-all duration-300 ${
              isExpanded
                ? "border-white/20 bg-white/[0.04] p-5"
                : "border-white/10 bg-white/[0.02] hover:bg-white/[0.03] hover:border-white/15 px-5 py-4"
            }`}
          >
            {/* Header / Summary Bar (Always Visible) */}
            <div
              onClick={() => toggleExpand(order.id)}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between cursor-pointer select-none"
            >
              <div className="flex flex-wrap items-center gap-3 min-w-0">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[9px] font-medium tracking-wider uppercase shrink-0 ${
                    statusColors[order.status] ?? "border-white/10 text-white/50 bg-white/5"
                  }`}
                >
                  {order.status}
                </span>

                <div className="min-w-0 flex items-center gap-2">
                  <span className="text-xs font-semibold text-white truncate max-w-[200px]">
                    {order.name}
                  </span>
                  <span className="text-white/30 text-[10px]">·</span>
                  <span className="text-xs text-white/60 font-mono">
                    #{displayOrderId.slice(0, 10)}
                    {displayOrderId.length > 10 ? "..." : ""}
                  </span>
                </div>

                <span className="text-white/30 text-[10px] hidden md:inline">·</span>

                <div className="text-xs text-white/55 truncate hidden md:block max-w-[250px]">
                  {order.book.title} <span className="text-white/30">× {order.copies}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t border-white/5 pt-2.5 sm:border-none sm:pt-0">
                <div className="text-xs font-semibold text-white">
                  ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] text-white/40 font-[family-name:var(--font-inter)]">
                    {formatDate(order.createdAt).split(" at ")[0]}
                  </span>
                  
                  {/* Chevron Toggle Indicator */}
                  <span className="text-white/40 text-xs select-none">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>
              </div>
            </div>

            {/* Expanded Detailed Area */}
            {isExpanded && (
              <div className="mt-5 border-t border-white/10 pt-5 animate-fadeIn">
                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                  <div className="min-w-0 flex-1 space-y-4">
                    {/* Unified Order & Reference Details Box */}
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-[10px] font-semibold tracking-[0.18em] text-white/35 uppercase">
                            Book Ordered
                          </p>
                          <h4 className="mt-1.5 font-bold text-white text-base">
                            {order.book.title}
                          </h4>
                          <p className="mt-1 text-xs text-white/55">
                            Quantity: <span className="text-white font-semibold">{order.copies} {order.copies === 1 ? "copy" : "copies"}</span>
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-[10px] font-semibold tracking-[0.18em] text-white/35 uppercase">
                            Order ID Reference
                          </p>
                          <p className="mt-1.5 font-mono text-sm font-bold text-emerald-400">
                            #{displayOrderId}
                          </p>
                          {order.orderNumber && (
                            <p className="mt-0.5 font-mono text-[9px] text-white/30">
                              DB ID: {order.id}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {/* Buyer Details */}
                      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <p className="text-[10px] font-semibold tracking-[0.18em] text-white/35 uppercase">
                          Buyer details
                        </p>
                        <div className="mt-3 space-y-2 font-[family-name:var(--font-inter)] text-sm">
                          <p className="font-semibold text-white/90">
                            {order.name}
                          </p>
                          <div className="flex flex-col gap-1 text-white/55 text-xs">
                            <a
                              href={`mailto:${order.email}`}
                              className="transition-colors hover:text-white"
                            >
                              ✉ {order.email}
                            </a>
                            <a
                              href={`tel:${order.phone}`}
                              className="transition-colors hover:text-white"
                            >
                              📞 {order.phone}
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-semibold tracking-[0.18em] text-white/35 uppercase">
                            Shipping address
                          </p>
                          <p className="mt-3 text-xs leading-5 text-white/70">
                            {order.address}, {order.city}, {order.state} — {order.pincode}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Subtotals breakdown */}
                    <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-white/40">
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                        Shipping: ₹{Number(order.shippingAmount).toLocaleString("en-IN")}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-white/70 font-semibold">
                        Total Amount: ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                        Placed: {formatDate(order.createdAt)}
                      </span>
                    </div>

                    {/* Tracking details status box */}
                    {order.trackingNumber && (
                      <div className="rounded-xl border border-purple-300/15 bg-purple-400/10 px-4 py-3 text-xs text-purple-100/75 flex items-center justify-between">
                        <div>
                          <span className="font-semibold">{order.trackingProvider}</span>: {order.trackingNumber}
                        </div>
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-purple-300 hover:text-purple-200"
                          >
                            Track Shipment ↗
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions / Update Form */}
                  <div className="flex shrink-0 flex-col items-stretch gap-3 lg:w-72">
                    <a
                      href={`/api/orders/${order.id}/screenshot`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-white/10 bg-white/5 py-2.5 text-center text-xs font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all"
                    >
                      View Payment Screenshot ↗
                    </a>

                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                      <p className="text-[10px] font-semibold tracking-[0.18em] text-white/35 uppercase mb-3">
                        Update Order Status
                      </p>
                      <OrderStatusForm
                        action={updateOrderStatusAction}
                        order={{
                          id: order.id,
                          status: order.status,
                          trackingProvider: order.trackingProvider,
                          trackingNumber: order.trackingNumber,
                          trackingUrl: order.trackingUrl,
                          adminNote: order.adminNote,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
