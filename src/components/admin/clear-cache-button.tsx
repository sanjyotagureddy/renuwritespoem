"use client";

import { useState, useTransition } from "react";
import { clearAllCache } from "@/app/admin/actions/shared-actions";

export default function ClearCacheButton() {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  function handleClearCache() {
    if (isPending) return;
    setSuccess(false);

    startTransition(async () => {
      try {
        await clearAllCache();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        console.error("Failed to clear cache:", err);
        alert("Failed to clear cache. Please try again.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClearCache}
      disabled={isPending}
      className={`relative inline-flex items-center gap-2.5 rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
        success
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
          : isPending
            ? "border-white/10 bg-white/5 text-white/40 cursor-not-allowed"
            : "border-amber-300/30 bg-amber-400/5 text-amber-200 hover:bg-amber-400/10 hover:border-amber-300/50 hover:text-white"
      }`}
    >
      {/* Spinner / Icon */}
      <span
        className={`inline-block transition-transform duration-700 ${
          isPending ? "animate-spin" : ""
        }`}
      >
        {success ? (
          <span className="text-emerald-400">✓</span>
        ) : (
          <span className="text-amber-400">⚡</span>
        )}
      </span>

      <span>
        {isPending ? "Clearing Cache..." : success ? "Cache Cleared!" : "Clear Cache"}
      </span>
    </button>
  );
}
