import { getPrisma } from "@/lib/db";
import OrderStatusForm from "@/components/admin/order-status-form";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-white md:text-4xl">Orders</h1>
          <p className="mt-2 text-sm text-white/45">
            New orders stay pending until you verify the payment and confirm
            them.
          </p>
        </div>
        <span className="text-sm text-white/50">
          {orders.length} total • {pendingCount} pending
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <p className="text-white/50">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                {/* Order info */}
                <div className="min-w-0 space-y-2">
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

                  <div className="text-sm text-white/60">
                    <span className="text-white/80">{order.name}</span> •{" "}
                    {order.email} • {order.phone}
                  </div>

                  <div className="text-xs text-white/40">
                    {order.address}, {order.city}, {order.state} —{" "}
                    {order.pincode}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span>
                      Shipping ₹
                      {Number(order.shippingAmount).toLocaleString("en-IN")}
                    </span>
                    <span>
                      ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                    </span>
                    <span>{formatDate(order.createdAt)}</span>
                    <span className="text-white/20">{order.id}</span>
                  </div>
                  {order.trackingNumber && (
                    <div className="text-xs text-purple-200/70">
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

                {/* Actions */}
                <div className="flex shrink-0 flex-col items-stretch gap-3">
                  {/* View payment screenshot */}
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
          ))}
        </div>
      )}
    </div>
  );
}
