"use client";

import React, { useState } from "react";
import { Search, X, MailOpen, MousePointerClick, CheckCircle, AlertTriangle } from "lucide-react";

type ClickType = {
  id: string;
  url: string;
  clickedAt: Date;
};

type DeliveryType = {
  id: string;
  email: string;
  status: string;
  error: string | null;
  sentAt: Date;
  openedAt: Date | null;
  openCount: number;
  clicks: ClickType[];
};

export default function DeliveryLogsClient({
  deliveries,
}: {
  deliveries: DeliveryType[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SENT" | "OPENED" | "CLICKED" | "FAILED">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  // Filter handlers
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: typeof statusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Filter deliveries
  const filteredDeliveries = deliveries.filter((d) => {
    // 1. Search filter
    const matchesSearch = d.email.toLowerCase().includes(searchTerm.toLowerCase().trim());
    if (!matchesSearch) return false;

    // 2. Status tab filter
    switch (statusFilter) {
      case "SENT":
        return d.status === "SUCCESS";
      case "OPENED":
        return d.status === "SUCCESS" && d.openCount > 0;
      case "CLICKED":
        return d.status === "SUCCESS" && d.clicks.length > 0;
      case "FAILED":
        return d.status === "FAILED";
      default:
        return true;
    }
  });

  const totalCount = filteredDeliveries.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedDeliveries = filteredDeliveries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Counts for tabs
  const sentCount = deliveries.filter((d) => d.status === "SUCCESS").length;
  const openedCount = deliveries.filter((d) => d.status === "SUCCESS" && d.openCount > 0).length;
  const clickedCount = deliveries.filter((d) => d.status === "SUCCESS" && d.clicks.length > 0).length;
  const failedCount = deliveries.filter((d) => d.status === "FAILED").length;

  return (
    <div className="space-y-4">
      {/* Search & Filters Toolbar */}
      <div className="flex flex-col gap-4 bg-white/[0.02] border border-white/10 rounded-2xl p-4 font-[family-name:var(--font-inter)]">
        {/* Search Email Input */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/40">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search recipient email address..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2 pl-9 pr-9 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold tracking-wider uppercase">
          <button
            onClick={() => handleStatusFilterChange("ALL")}
            className={`rounded-xl border px-3 py-1.5 transition-all cursor-pointer ${
              statusFilter === "ALL"
                ? "border-white/30 text-white bg-white/10 scale-[1.02]"
                : "border-white/10 text-white/50 bg-white/[0.02] hover:border-white/20 hover:text-white/80"
            }`}
          >
            All ({deliveries.length})
          </button>
          <button
            onClick={() => handleStatusFilterChange("SENT")}
            className={`rounded-xl border px-3 py-1.5 transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "SENT"
                ? "border-emerald-400/50 text-emerald-400 bg-emerald-500/20 scale-[1.02]"
                : "border-emerald-400/15 text-emerald-400/50 bg-emerald-500/5 hover:border-emerald-400/30 hover:text-emerald-400/80"
            }`}
          >
            <CheckCircle className="h-3 w-3" /> Sent ({sentCount})
          </button>
          <button
            onClick={() => handleStatusFilterChange("OPENED")}
            className={`rounded-xl border px-3 py-1.5 transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "OPENED"
                ? "border-sky-400/50 text-sky-400 bg-sky-500/20 scale-[1.02]"
                : "border-sky-400/15 text-sky-400/50 bg-sky-500/5 hover:border-sky-400/30 hover:text-sky-400/80"
            }`}
          >
            <MailOpen className="h-3 w-3" /> Opened ({openedCount})
          </button>
          <button
            onClick={() => handleStatusFilterChange("CLICKED")}
            className={`rounded-xl border px-3 py-1.5 transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "CLICKED"
                ? "border-indigo-400/50 text-indigo-400 bg-indigo-500/20 scale-[1.02]"
                : "border-indigo-400/15 text-indigo-400/50 bg-indigo-500/5 hover:border-indigo-400/30 hover:text-indigo-400/80"
            }`}
          >
            <MousePointerClick className="h-3 w-3" /> Clicked ({clickedCount})
          </button>
          <button
            onClick={() => handleStatusFilterChange("FAILED")}
            className={`rounded-xl border px-3 py-1.5 transition-all cursor-pointer flex items-center gap-1.5 ${
              statusFilter === "FAILED"
                ? "border-rose-400/50 text-rose-400 bg-rose-500/20 scale-[1.02]"
                : "border-rose-400/15 text-rose-400/50 bg-rose-500/5 hover:border-rose-400/30 hover:text-rose-400/80"
            }`}
          >
            <AlertTriangle className="h-3 w-3" /> Failed ({failedCount})
          </button>
        </div>
      </div>

      {/* Recipient Logs Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02] font-[family-name:var(--font-inter)]">
        <table className="w-full text-left text-xs text-white/60">
          <thead className="border-b border-white/10 bg-white/[0.02] text-[10px] font-semibold tracking-wider text-white/45 uppercase">
            <tr>
              <th className="px-6 py-4">Recipient Email</th>
              <th className="px-6 py-4">Delivery Status</th>
              <th className="px-6 py-4">Opened At</th>
              <th className="px-6 py-4">Opens</th>
              <th className="px-6 py-4">Trace Details / Fail Reason</th>
              <th className="px-6 py-4 text-right">Delivery Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedDeliveries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-white/30">
                  No recipient records found matching the current search or filters.
                </td>
              </tr>
            ) : (
              paginatedDeliveries.map((delivery) => {
                // Determine recipient status tag
                let statusBadge = (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] text-emerald-400 font-medium">
                    Sent
                  </span>
                );

                if (delivery.status === "FAILED") {
                  statusBadge = (
                    <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[10px] text-rose-400 font-medium">
                      Failed
                    </span>
                  );
                } else if (delivery.clicks.length > 0) {
                  statusBadge = (
                    <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] text-indigo-400 font-medium">
                      Clicked
                    </span>
                  );
                } else if (delivery.openCount > 0) {
                  statusBadge = (
                    <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[10px] text-sky-400 font-medium">
                      Opened
                    </span>
                  );
                }

                // Group clicks to show unique counts per link
                const linkClicksMap: Record<string, number> = {};
                delivery.clicks.forEach((c) => {
                  linkClicksMap[c.url] = (linkClicksMap[c.url] || 0) + 1;
                });
                const groupedClicks = Object.entries(linkClicksMap);

                return (
                  <tr key={delivery.id} className="hover:bg-white/[0.01]">
                    <td className="px-6 py-4 space-y-1.5">
                      <div className="font-medium text-white">{delivery.email}</div>
                      {groupedClicks.length > 0 && (
                        <div className="text-[10px] space-y-1 pl-2 border-l border-white/10 text-white/40">
                          <p className="font-semibold uppercase tracking-wider text-[8px] text-indigo-400/70">Clicked Links:</p>
                          {groupedClicks.map(([url, count]) => (
                            <div key={url} className="truncate max-w-sm">
                              🔗 <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-300 hover:underline">{url}</a>{" "}
                              <span className="text-white/20">({count}x)</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">{statusBadge}</td>
                    <td className="px-6 py-4 text-white/60">
                      {delivery.openedAt ? (
                        new Date(delivery.openedAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {delivery.openCount > 0 ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/15 text-[10px] font-bold text-sky-400">
                          {delivery.openCount}
                        </span>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate text-white/45">
                      {delivery.error || "Completed successfully"}
                    </td>
                    <td className="px-6 py-4 text-right text-white/50">
                      {new Date(delivery.sentAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 pt-4 font-[family-name:var(--font-inter)]">
          <span className="text-xs text-white/50">
            Page <strong className="font-semibold text-white/80">{currentPage}</strong> of{" "}
            <strong className="font-semibold text-white/80">{totalPages}</strong> · {totalCount} recipients
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                currentPage === 1
                  ? "pointer-events-none border-white/5 bg-white/[0.01] text-white/20"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`inline-flex h-9 items-center justify-center rounded-lg border px-4 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                currentPage === totalPages
                  ? "pointer-events-none border-white/5 bg-white/[0.01] text-white/20"
                  : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
