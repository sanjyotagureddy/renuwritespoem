import React from "react";

export default function AudioLoading() {
  return (
    <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 overflow-hidden font-[family-name:var(--font-inter)]">
      {/* Background Glow */}
      <div className="absolute -top-10 left-1/3 w-[35rem] h-[35rem] bg-violet-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Header skeleton */}
      <div className="relative z-10 mb-12 animate-pulse space-y-4">
        <div className="h-6 w-32 bg-white/10 rounded-full" />
        <div className="h-12 w-72 bg-white/15 rounded-xl" />
        <div className="h-4 w-96 bg-white/10 rounded-lg" />
      </div>

      {/* Player Layout Split skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Player & Active Track cover */}
        <div className="lg:col-span-5 space-y-6 bg-white/[0.02] border border-white/10 p-6 rounded-2xl animate-pulse">
          <div className="aspect-square bg-neutral-900 rounded-xl relative overflow-hidden flex items-center justify-center border border-white/5">
            <span className="text-6xl text-white/5 select-none animate-pulse">🎵</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-6 w-3/4 bg-white/15 rounded-lg" />
              <div className="h-4 w-1/2 bg-white/10 rounded-lg" />
            </div>
            <div className="h-1 bg-white/10 rounded-full w-full" />
            <div className="flex items-center justify-center gap-6 py-2">
              <div className="h-10 w-10 bg-white/10 rounded-full" />
              <div className="h-14 w-14 bg-white/15 rounded-full" />
              <div className="h-10 w-10 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right Column: Track List */}
        <div className="lg:col-span-7 bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-4 animate-pulse">
          <div className="h-5 w-40 bg-white/10 rounded-lg mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 rounded-xl border border-white/5 bg-white/[0.01]"
              >
                <div className="h-12 w-12 bg-white/10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 bg-white/15 rounded" />
                  <div className="h-3 w-2/3 bg-white/10 rounded" />
                </div>
                <div className="h-8 w-8 bg-white/10 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
