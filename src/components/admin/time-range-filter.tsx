"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

export default function TimeRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get("range") || "7d";

  const options = [
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "all", label: "All Time" },
  ];

  const handleRangeChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", val);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 p-1 rounded-xl font-[family-name:var(--font-inter)] text-xs text-white">
      <div className="flex items-center gap-1.5 px-2 text-white/40 font-semibold">
        <Calendar className="h-3.5 w-3.5 text-amber-400" />
        <span>Range:</span>
      </div>
      <div className="flex items-center gap-1">
        {options.map((opt) => {
          const isActive = currentRange === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleRangeChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg font-bold tracking-wide transition-all cursor-pointer ${
                isActive
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/10 scale-105"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
