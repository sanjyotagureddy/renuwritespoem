"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

const statusColors: Record<string, string> = {
  PENDING: "border-amber-400/30 text-amber-400/80 bg-amber-500/10",
  CONFIRMED: "border-blue-400/30 text-blue-400/80 bg-blue-500/10",
  SHIPPED: "border-purple-400/30 text-purple-400/80 bg-purple-500/10",
  DELIVERED: "border-emerald-400/30 text-emerald-400/80 bg-emerald-500/10",
  REJECTED: "border-rose-400/30 text-rose-400/80 bg-rose-500/10",
};

const statusHints: Record<string, string> = {
  PENDING:
    "Payment still needs manual review. No buyer email is sent for pending.",
  CONFIRMED: "Sends a warm payment-verified confirmation to the buyer.",
  SHIPPED:
    "Requires delivery provider and tracking number, then emails tracking details.",
  DELIVERED: "Sends a delivered update to close the order loop.",
  REJECTED: "Sends a polite payment verification issue email to the buyer.",
};

const inputClasses =
  "rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-xs text-white outline-none transition-colors placeholder:text-white/25 focus:border-amber-300/50 focus:bg-black/45";

const labelClasses =
  "text-[11px] font-medium tracking-wide text-white/45 uppercase";

type OrderStatusFormProps = {
  action: (formData: FormData) => Promise<{
    success: boolean;
    statusChanged: boolean;
    noteChanged: boolean;
    emailSent: boolean;
    emailError: string | null;
  } | undefined | void>;
  order: {
    id: string;
    status: string;
    trackingProvider: string | null;
    trackingNumber: string | null;
    trackingUrl: string | null;
    adminNote: string | null;
  };
};

export default function OrderStatusForm({
  action,
  order,
}: OrderStatusFormProps) {
  const [status, setStatus] = useState(order.status);
  const [isPending, setIsPending] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const requiresTracking = status === "SHIPPED";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setNotification(null);

    const formData = new FormData(event.currentTarget);
    try {
      const res = await action(formData);

      if (res && res.success) {
        if (res.emailSent) {
          setNotification({
            type: "success",
            message: "Order status updated and confirmation email sent to buyer successfully!",
          });
        } else if (res.emailError) {
          setNotification({
            type: "error",
            message: `Order status updated in database, but sending email failed: ${res.emailError}`,
          });
        } else {
          setNotification({
            type: "success",
            message: "Order updated successfully (no notification email needed for this update).",
          });
        }
      } else {
        setNotification({
          type: "success",
          message: "Order status updated successfully!",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to update order status.",
      });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-xl border border-amber-200/15 bg-gradient-to-br from-amber-500/10 via-white/[0.04] to-rose-500/10 p-3 shadow-[0_14px_34px_rgba(0,0,0,0.16)] sm:w-[380px]"
    >
      <input type="hidden" name="id" value={order.id} />

      {notification && (
        <div
          className={`mb-3 rounded-lg border p-3 text-[11px] font-[family-name:var(--font-inter)] leading-relaxed flex items-start justify-between gap-3 animate-fadeIn ${
            notification.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/20 bg-rose-500/10 text-rose-300"
          }`}
        >
          <div className="flex-1">
            <span className="font-semibold uppercase tracking-wider text-[9px] block mb-0.5">
              {notification.type === "success" ? "Success" : "Update Issue"}
            </span>
            {notification.message}
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-white/40 hover:text-white transition-colors text-xs font-semibold focus:outline-none shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      <div className="mb-3 rounded-lg border border-white/10 bg-black/25 p-2.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-white">
              Send buyer update
            </p>
            <p className="mt-1 text-[11px] leading-4 text-white/45">
              Change status and notify when needed.
            </p>
          </div>
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] tracking-wider uppercase ${statusColors[status] ?? ""}`}
          >
            {status}
          </span>
        </div>
        <p className="mt-2 rounded-lg border border-amber-300/20 bg-amber-400/10 px-2.5 py-2 text-[11px] leading-4 text-amber-100/80">
          {statusHints[status]}
        </p>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className="space-y-1.5 sm:col-span-2">
          <span className={labelClasses}>Order status</span>
          <select
            name="status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={`${inputClasses} w-full`}
          >
            <option value="PENDING">Pending — review payment</option>
            <option value="CONFIRMED">Confirmed — payment verified</option>
            <option value="SHIPPED">Shipped — send tracking</option>
            <option value="DELIVERED">Delivered</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </label>

        <label className="space-y-1.5">
          <span className={labelClasses}>
            Delivery provider {requiresTracking && "*"}
          </span>
          <input
            name="trackingProvider"
            defaultValue={order.trackingProvider ?? ""}
            required={requiresTracking}
            maxLength={100}
            placeholder="India Post, DTDC..."
            className={`${inputClasses} w-full`}
          />
        </label>

        <label className="space-y-1.5">
          <span className={labelClasses}>
            Tracking number {requiresTracking && "*"}
          </span>
          <input
            name="trackingNumber"
            defaultValue={order.trackingNumber ?? ""}
            required={requiresTracking}
            maxLength={150}
            placeholder="AWB / tracking ID"
            className={`${inputClasses} w-full`}
          />
        </label>

        {requiresTracking && (
          <p className="rounded-lg border border-purple-300/20 bg-purple-400/10 px-2.5 py-2 text-[11px] leading-4 text-purple-100/80 sm:col-span-2">
            Shipping emails need both courier name and tracking ID. Add a
            tracking URL too if the provider has one.
          </p>
        )}

        <label className="space-y-1.5 sm:col-span-2">
          <span className={labelClasses}>Tracking URL optional</span>
          <input
            name="trackingUrl"
            type="url"
            defaultValue={order.trackingUrl ?? ""}
            maxLength={500}
            placeholder="https://..."
            className={`${inputClasses} w-full`}
          />
        </label>

        <label className="space-y-1.5 sm:col-span-2">
          <span className={labelClasses}>Message to buyer optional</span>
          <textarea
            name="adminNote"
            defaultValue={order.adminNote ?? ""}
            maxLength={1000}
            rows={3}
            placeholder="Add a warm note, delivery instruction, or payment clarification..."
            className={`${inputClasses} min-h-24 w-full resize-y leading-5`}
          />
        </label>
      </div>

      <div className="mt-3 rounded-lg border border-emerald-300/15 bg-emerald-400/10 px-2.5 py-2 text-[11px] leading-4 text-emerald-100/75">
        <span className="font-semibold text-emerald-100">
          Email behavior:
        </span>{" "}
        Confirmed, shipped, delivered, rejected send emails. Pending only saves.
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-3 w-full rounded-lg border border-amber-200/30 bg-amber-200 px-3 py-2.5 text-xs font-semibold text-stone-950 transition-colors hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
      >
        {isPending ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin text-stone-950" />
            Saving...
          </>
        ) : (
          "Save update & send email"
        )}
      </button>
    </form>
  );
}
