"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export default function BooksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Books Route Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <GlassCard className="flex max-w-md flex-col items-center space-y-6 bg-black/40 p-8" rounded="3xl">
        <div className="rounded-full bg-white/5 p-4">
          <AlertTriangle className="h-8 w-8 text-white/60" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-medium text-white md:text-2xl">
            Oops! It&apos;s not you, it&apos;s us.
          </h2>
          <p className="text-sm text-white/60">
            We had a little hiccup grabbing the books collection. Please give it another try!
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-medium uppercase tracking-wider text-white transition-colors hover:bg-white/10 hover:text-white"
        >
          Try Again
        </button>
      </GlassCard>
    </div>
  );
}
