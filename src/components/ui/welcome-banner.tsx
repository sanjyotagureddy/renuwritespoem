"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

function WelcomeBannerContent() {
  const searchParams = useSearchParams();
  const invitedBy = searchParams.get("invitedBy");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (invitedBy) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 8000); // Auto-hide after 8 seconds
      return () => clearTimeout(timer);
    }
  }, [invitedBy]);

  if (!invitedBy) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-[100] border-b border-amber-500/20 bg-neutral-950/90 py-3.5 px-6 shadow-2xl backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 font-[family-name:var(--font-inter)]">
            <div className="flex items-center gap-3 text-sm font-medium text-amber-100">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>
              <span>
                Welcome to Renu Writes Poem! You were personally invited by{" "}
                <strong className="text-amber-400 font-semibold">{invitedBy}</strong> to explore.
              </span>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="rounded-lg p-1 text-white/40 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function WelcomeBanner() {
  return (
    <Suspense fallback={null}>
      <WelcomeBannerContent />
    </Suspense>
  );
}
