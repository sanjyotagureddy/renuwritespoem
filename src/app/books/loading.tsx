import React from "react";

export default function BooksLoading() {
  return (
    <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 overflow-hidden font-[family-name:var(--font-inter)]">
      {/* Background Glow */}
      <div className="absolute -top-10 left-1/3 w-[35rem] h-[35rem] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Header skeleton */}
      <div className="relative z-10 mb-12 md:mb-16 animate-pulse space-y-4">
        <div className="h-6 w-24 bg-white/10 rounded-full" />
        <div className="h-12 w-48 bg-white/15 rounded-xl" />
        <div className="h-4 w-96 bg-white/10 rounded-lg" />
      </div>

      {/* Books grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/15 bg-white/[0.03] overflow-hidden flex flex-col sm:flex-row h-[240px] animate-pulse"
          >
            {/* Cover Image skeleton */}
            <div className="sm:w-48 sm:shrink-0 bg-white/5 aspect-[3/4] sm:aspect-auto" />

            {/* Info skeleton */}
            <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-16 bg-white/10 rounded-full" />
                </div>
                <div className="h-7 w-3/4 bg-white/15 rounded-lg" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-white/10 rounded" />
                  <div className="h-3 w-5/6 bg-white/10 rounded" />
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="h-4 w-20 bg-white/10 rounded" />
                <div className="h-6 w-16 bg-white/15 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
