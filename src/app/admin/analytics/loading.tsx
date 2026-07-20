import React from "react";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4 border-b border-white/5 pb-4">
        <div className="h-6 w-24 bg-white/10 rounded-lg" />
        <div className="h-8 w-48 bg-white/15 rounded-xl" />
      </div>

      <div className="flex gap-4 border-b border-white/5 pb-4">
        <div className="h-10 w-32 rounded-full bg-white/15" />
        <div className="h-10 w-32 rounded-full bg-white/5" />
        <div className="h-10 w-32 rounded-full bg-white/5" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-10 w-24 bg-white/20 rounded-xl" />
          </div>
        ))}
      </div>

      <div className="h-96 w-full rounded-3xl border border-white/5 bg-white/[0.02] mt-8" />
    </div>
  );
}
