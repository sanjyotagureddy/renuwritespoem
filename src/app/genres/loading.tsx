import React from "react";

export default function GenresLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24 font-[family-name:var(--font-inter)]">
      {/* Header skeleton */}
      <div className="mb-12 md:mb-16 animate-pulse space-y-4">
        <div className="h-4 w-28 bg-white/10 rounded-full" />
        <div className="h-12 w-48 bg-white/15 rounded-xl" />
        <div className="h-4 w-[500px] bg-white/10 rounded-lg" />
      </div>

      {/* Genres Grid skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <article
            key={i}
            className="rounded-2xl border border-white/15 bg-white/[0.03] p-6 animate-pulse space-y-6"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-2">
                <div className="h-7 w-32 bg-white/15 rounded-lg" />
                <div className="h-4 w-16 bg-white/10 rounded-full" />
              </div>
              <div className="h-6 w-16 bg-white/10 rounded-full" />
            </div>

            <div className="space-y-2">
              <div className="h-3 w-full bg-white/10 rounded" />
              <div className="h-3 w-5/6 bg-white/10 rounded" />
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-10 bg-white/5 border border-white/10 rounded-xl w-full" />
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
