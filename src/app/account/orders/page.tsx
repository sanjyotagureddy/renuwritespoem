import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Orders",
};

const PAGE_SIZE = 20;

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AccountOrdersPage({ searchParams }: PageProps) {
  const session = await getServerAuthSession();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const prisma = getPrisma();
  const userEmail = session.user.email ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [totalCount, orders] = await Promise.all([
    prisma.bookOrder.count({ where: { email: userEmail } }),
    prisma.bookOrder.findMany({
      where: { email: userEmail },
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      omit: { paymentData: true, paymentMime: true },
      include: { book: { select: { title: true, slug: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const hasNext = page < totalPages;

  function buildUrl(p: number) {
    return p > 1 ? `/account/orders?page=${p}` : "/account/orders";
  }

  const statusBadge: Record<string, string> = {
    PENDING: "border-amber-400/25 bg-amber-500/10 text-amber-300",
    CONFIRMED: "border-sky-400/25 bg-sky-500/10 text-sky-300",
    SHIPPED: "border-violet-400/25 bg-violet-500/10 text-violet-300",
    DELIVERED: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
    REJECTED: "border-rose-400/25 bg-rose-500/10 text-rose-300",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Order History</h2>
        <p className="mt-1 text-sm text-white/40 font-[family-name:var(--font-inter)]">
          Book orders placed with your email address.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
          <p className="text-white/60">No book orders found.</p>
          <p className="mt-1 text-sm text-white/35">
            Browse our{" "}
            <Link href="/books" className="text-white/60 underline underline-offset-2 hover:text-white">
              bookshop
            </Link>{" "}
            to place an order.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl border border-white/8 bg-white/[0.02] p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/books/${order.book.slug}`}
                    className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                  >
                    {order.book.title}
                  </Link>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/40">
                    <span>#{order.orderNumber ?? order.id.slice(0, 8)}</span>
                    <span>{formatDate(order.createdAt)}</span>
                    <span>
                      {order.copies} {order.copies === 1 ? "copy" : "copies"}
                    </span>
                    <span>₹{order.totalAmount.toString()}</span>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusBadge[order.status] ?? statusBadge.PENDING}`}
                >
                  {order.status}
                </span>
              </div>

              {/* Tracking info */}
              {order.status === "SHIPPED" && order.trackingNumber && (
                <div className="mt-3 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/30 mb-1">
                    Tracking
                  </p>
                  <div className="flex items-center gap-3 text-xs text-white/55">
                    {order.trackingProvider && (
                      <span>{order.trackingProvider}</span>
                    )}
                    {order.trackingUrl ? (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-300/70 underline underline-offset-2 hover:text-sky-300"
                      >
                        {order.trackingNumber}
                      </a>
                    ) : (
                      <span>{order.trackingNumber}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <span className="text-xs text-white/50">
            Page{" "}
            <strong className="font-semibold text-white/80">{page}</strong> of{" "}
            <strong className="font-semibold text-white/80">{totalPages}</strong>{" "}
            · {totalCount} orders
          </span>
          <div className="flex gap-2">
            <Link
              href={buildUrl(page - 1)}
              className={`inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-semibold uppercase tracking-wider transition-all ${
                page === 1
                  ? "pointer-events-none border-white/5 bg-white/[0.01] text-white/20"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              Previous
            </Link>
            <Link
              href={buildUrl(page + 1)}
              className={`inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-semibold uppercase tracking-wider transition-all ${
                !hasNext
                  ? "pointer-events-none border-white/5 bg-white/[0.01] text-white/20"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              Next
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
