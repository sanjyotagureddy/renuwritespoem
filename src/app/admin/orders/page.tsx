import { getPrisma } from "@/lib/db";
import { updateOrderStatus } from "../actions/order-actions";
import OrdersClient from "./orders-client";

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
            them. Click any order row to expand details or update its status.
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
        <OrdersClient initialOrders={orders} updateOrderStatusAction={updateOrderStatus} />
      )}
    </div>
  );
}
