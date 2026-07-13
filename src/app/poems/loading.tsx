import React from "react";

export default function PoemsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:py-24 font-[family-name:var(--font-inter)] relative">
      {/* Background glow */}
      <div className="absolute top-20 right-1/4 w-[30rem] h-[30rem] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header section skeleton */}
      <div className="text-center md:text-left space-y-4 mb-16 animate-pulse">
        <div className="h-3 w-32 bg-white/10 rounded-full mx-auto md:mx-0" />
        <div className="h-12 w-64 bg-white/15 rounded-xl mx-auto md:mx-0" />
        <div className="h-4 w-96 bg-white/10 rounded-lg mx-auto md:mx-0" />
      </div>

      {/* Search & Filters block skeleton */}
      <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 mb-12 animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-10 bg-white/10 rounded-lg col-span-1 md:col-span-2" />
          <div className="h-10 bg-white/10 rounded-lg" />
          <div className="h-10 bg-white/10 rounded-lg" />
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-7 w-20 bg-white/10 rounded-full" />
          ))}
        </div>
      </div>

      {/* Poems Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 space-y-5 animate-pulse flex flex-col justify-between h-[280px]"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-amber-500/20 rounded-md" />
                <div className="h-5 w-12 bg-white/10 rounded-md" />
              </div>
              <div className="h-7 bg-white/15 rounded-xl w-3/4" />
              <div className="space-y-2 pt-2">
                <div className="h-3.5 bg-white/10 rounded-lg w-full" />
                <div className="h-3.5 bg-white/10 rounded-lg w-5/6" />
                <div className="h-3.5 bg-white/10 rounded-lg w-2/3" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <div className="h-3.5 w-24 bg-white/10 rounded-lg" />
              <div className="h-3.5 w-16 bg-white/10 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
