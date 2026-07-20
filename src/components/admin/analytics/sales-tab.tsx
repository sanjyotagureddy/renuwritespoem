import React from "react";
import { ShoppingBag, UserCheck } from "lucide-react";

type SalesTabProps = {
  salesData: {
    totalRevenue: number;
    totalCopiesSold: number;
    activeOrdersCount: number;
    bookSalesList: Array<{
      id: string;
      title: string;
      copiesSold: number;
    }>;
    recentOrders: Array<{
      id: string;
      orderNumber: string | null;
      name: string;
      email: string;
      copies: number;
      totalAmount: number;
      status: string;
      createdAt: string;
      bookTitle: string;
    }>;
  };
};

export default function SalesTab({ salesData }: SalesTabProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Key Sales Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] p-5 hover:border-emerald-500/35 hover:bg-emerald-500/[0.03] transition-all">
          <p className="mb-2 text-[10px] tracking-widest text-emerald-400/60 uppercase font-semibold">
            Total Sales Revenue
          </p>
          <p className="text-3xl font-bold text-emerald-400">
            {formatCurrency(salesData.totalRevenue)}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:border-white/20 hover:bg-white/[0.03] transition-all">
          <p className="mb-2 text-[10px] tracking-widest text-white/40 uppercase font-semibold">
            Copies Sold
          </p>
          <p className="text-3xl font-bold text-white">{salesData.totalCopiesSold}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.02] p-5 hover:border-amber-500/35 hover:bg-amber-500/[0.03] transition-all">
          <p className="mb-2 text-[10px] tracking-widest text-amber-400/60 uppercase font-semibold">
            Active Order Queue
          </p>
          <p className="text-3xl font-bold text-amber-400">{salesData.activeOrdersCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Book Sales Leaderboard */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
          <h3 className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-emerald-400" />
            Book Sales Leaderboard
          </h3>
          <div className="space-y-4 pt-2">
            {salesData.bookSalesList.length === 0 ? (
              <p className="text-xs text-white/30 italic text-center py-4">No book sales recorded.</p>
            ) : (
              salesData.bookSalesList.map((book) => {
                const maxCount = Math.max(...salesData.bookSalesList.map((b) => b.copiesSold), 1);
                const percentage = Math.min(100, (book.copiesSold / maxCount) * 100);
                return (
                  <div key={book.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-white/80 truncate max-w-[200px]" title={book.title}>
                        {book.title}
                      </span>
                      <span className="text-emerald-400 font-bold">{book.copiesSold} sold</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Orders List */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/10 bg-white/[0.02] px-5 py-4">
            <h3 className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-amber-400" />
              Recent Orders
            </h3>
          </div>
          <div className="divide-y divide-white/5">
            {salesData.recentOrders.length === 0 ? (
              <p className="p-8 text-center text-xs text-white/30 italic">No orders received yet.</p>
            ) : (
              salesData.recentOrders.map((ord) => (
                <div key={ord.id} className="flex justify-between items-center px-5 py-4 text-xs font-[family-name:var(--font-inter)] hover:bg-white/[0.01]">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white/90">
                        {ord.orderNumber || "#UNNUMBERED"}
                      </span>
                      <span className="text-[10px] text-white/40">
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 truncate max-w-[260px]">
                      {ord.name} ({ord.email}) — <span className="italic">{ord.bookTitle}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="font-bold text-white">{formatCurrency(ord.totalAmount)}</p>
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] uppercase font-bold tracking-wide ${ord.status === "DELIVERED"
                        ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                        : ord.status === "SHIPPED"
                          ? "bg-sky-500/10 border border-sky-500/25 text-sky-400"
                          : ord.status === "CONFIRMED"
                            ? "bg-purple-500/10 border border-purple-500/25 text-purple-400"
                            : "bg-amber-500/10 border border-amber-500/25 text-amber-400"
                      }`}>
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
