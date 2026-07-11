"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type AttributionRow = {
  source: string;
  clicks: number;
  signups: number;
};

type AttributionAnalyticsTableProps = {
  data: AttributionRow[];
};

const ITEMS_PER_PAGE = 5;

export default function AttributionAnalyticsTable({ data }: AttributionAnalyticsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (data.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="font-[family-name:var(--font-inter)] text-white/50 text-sm">No attribution traffic logged yet.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = data.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-white/80">
          <thead>
            <tr className="border-b border-white/10 text-xs tracking-wider text-white/40 uppercase">
              <th className="pb-3 font-semibold">Source Channel</th>
              <th className="pb-3 font-semibold text-center">Clicks (Traffic)</th>
              <th className="pb-3 font-semibold text-center">Signups</th>
              <th className="pb-3 font-semibold text-right">Conversion Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {paginatedData.map((row) => (
              <tr key={row.source} className="hover:bg-white/[0.01] transition-colors">
                <td className="py-3 font-medium text-amber-400 capitalize">{row.source}</td>
                <td className="py-3 text-center font-semibold">{row.clicks}</td>
                <td className="py-3 text-center font-semibold">{row.signups}</td>
                <td className="py-3 text-right font-semibold text-emerald-400">
                  {row.clicks > 0 ? `${((row.signups / row.clicks) * 100).toFixed(1)}%` : "0.0%"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="flex items-center gap-1 text-xs font-semibold tracking-wider text-white/50 uppercase transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-20"
            aria-label="Previous Page"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>

          <div className="flex items-center gap-1.5 text-xs text-white/40 font-[family-name:var(--font-inter)]">
            <span>Page</span>
            <span className="font-semibold text-white">{currentPage}</span>
            <span>of</span>
            <span className="font-semibold text-white">{totalPages}</span>
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 text-xs font-semibold tracking-wider text-white/50 uppercase transition-colors hover:text-white disabled:pointer-events-none disabled:opacity-20"
            aria-label="Next Page"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
