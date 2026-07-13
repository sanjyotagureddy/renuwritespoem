import React from "react";

export default function GalleryLoading() {
  return (
    <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24 overflow-hidden font-[family-name:var(--font-inter)]">
      {/* Background Glow */}
      <div className="absolute -top-24 left-1/3 w-[40rem] h-[40rem] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Hero Header skeleton */}
      <div className="space-y-4 mb-12 border-b border-white/5 pb-12 animate-pulse">
        <div className="h-4 w-28 bg-white/10 rounded-full" />
        <div className="h-14 w-60 bg-white/15 rounded-xl" />
        <div className="h-4 w-[500px] bg-white/10 rounded-lg" />
      </div>

      {/* Category filter tabs skeleton */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white/[0.01] border border-white/5 p-2 rounded-2xl max-w-fit animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 w-24 bg-white/10 rounded-xl" />
        ))}
      </div>

      {/* Masonry layout column skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-pulse">
        <div className="flex flex-col gap-4">
          <div className="h-[300px] bg-white/[0.03] border border-white/5 rounded-2xl" />
          <div className="h-[400px] bg-white/[0.03] border border-white/5 rounded-2xl" />
          <div className="h-[250px] bg-white/[0.03] border border-white/5 rounded-2xl" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="h-[420px] bg-white/[0.03] border border-white/5 rounded-2xl" />
          <div className="h-[280px] bg-white/[0.03] border border-white/5 rounded-2xl" />
          <div className="h-[350px] bg-white/[0.03] border border-white/5 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
