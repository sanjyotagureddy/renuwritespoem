import OrderStatusForm from "@/components/admin/order-status-form";
import { getPrisma } from "@/lib/db";
import { updateOrderStatus } from "../actions";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const statusColors: Record<string, string> = {
  PENDING: "border-amber-400/30 text-amber-400/80 bg-amber-500/10",
  CONFIRMED: "border-blue-400/30 text-blue-400/80 bg-blue-500/10",
  SHIPPED: "border-purple-400/30 text-purple-400/80 bg-purple-500/10",
  DELIVERED: "border-emerald-400/30 text-emerald-400/80 bg-emerald-500/10",
  REJECTED: "border-rose-400/30 text-rose-400/80 bg-rose-500/10",
};

export default async function AdminOrdersPage() {
  const prisma = getPrisma();

  const orders = await prisma.bookOrder.findMany({
    orderBy: { createdAt: "desc" },
    omit: { paymentData: true, paymentMime: true },
    include: {
      book: { select: { title: true, slug: true } },
    },
  });

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const confirmedCount = orders.filter((o) => o.status === "CONFIRMED").length;
  const shippedCount = orders.filter((o) => o.status === "SHIPPED").length;
  const deliveredCount = orders.filter((o) => o.status === "DELIVERED").length;
  const rejectedCount = orders.filter((o) => o.status === "REJECTED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-3xl text-white md:text-4xl">Orders</h1>
          <p className="mt-2 text-sm text-white/45">
            New orders stay pending until you verify the payment and confirm
            them.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {[
          ["Total", orders.length],
          ["Pending", pendingCount],
          ["Confirmed", confirmedCount],
          ["Shipped", shippedCount],
          ["Delivered", deliveredCount],
          ["Rejected", rejectedCount],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <p className="mb-1 text-[10px] tracking-[0.18em] text-white/35 uppercase">
              {label}
            </p>
            <p className="text-2xl text-white">{value}</p>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <p className="mb-3 font-[family-name:var(--font-inter)] text-white/50">
            No orders yet.
          </p>
          <p className="text-sm text-white/35">
            New book purchases will appear here after a buyer submits their
            payment screenshot.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const displayOrderId = order.orderNumber ?? order.id;

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] tracking-wider uppercase ${statusColors[order.status] ?? ""}`}
                      >
                        {order.status}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {order.book.title}
                      </span>
                      <span className="text-xs text-white/30">
                        × {order.copies}
                      </span>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[1.1fr_0.9fr]">
                      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                        <p className="text-[10px] font-semibold tracking-[0.18em] text-white/35 uppercase">
                          Buyer details
                        </p>
                        <div className="mt-3 space-y-2 font-[family-name:var(--font-inter)] text-sm">
                          <p className="font-semibold text-white/90">
                            {order.name}
                          </p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-white/55">
                            <a
                              href={`mailto:${order.email}`}
                              className="transition-colors hover:text-white"
                            >
                              {order.email}
                            </a>
                            <a
                              href={`tel:${order.phone}`}
                              className="transition-colors hover:text-white"
                            >
                              {order.phone}
                            </a>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-amber-200/15 bg-amber-400/10 p-4">
                        <p className="text-[10px] font-semibold tracking-[0.18em] text-amber-100/50 uppercase">
                          Order ID
                        </p>
                        <p className="mt-2 break-all font-mono text-sm font-semibold text-amber-100">
                          #{displayOrderId}
                        </p>
                        <p className="mt-2 text-xs text-amber-100/55">
                          Ask buyers to mention this ID when contacting you.
                        </p>
                        {order.orderNumber && (
                          <p className="mt-1 break-all font-mono text-[10px] text-amber-100/35">
                            Internal: {order.id}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                      <p className="text-[10px] font-semibold tracking-[0.18em] text-white/35 uppercase">
                        Shipping address
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/65">
                        {order.address}, {order.city}, {order.state} —{" "}
                        {order.pincode}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                        Shipping ₹
                        {Number(order.shippingAmount).toLocaleString("en-IN")}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                        ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>

                    {order.trackingNumber && (
                      <div className="rounded-xl border border-purple-300/15 bg-purple-400/10 px-4 py-3 text-xs text-purple-100/75">
                        {order.trackingProvider} • {order.trackingNumber}
                        {order.trackingUrl && (
                          <>
                            {" "}
                            •{" "}
                            <a
                              href={order.trackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline underline-offset-2"
                            >
                              Track ↗
                            </a>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-col items-stretch gap-2">
                    <a
                      href={`/api/orders/${order.id}/screenshot`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="self-end rounded-lg px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      Screenshot ↗
                    </a>

                    <OrderStatusForm
                      action={updateOrderStatus}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
