"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem("cookie-consent");
      if (!consent) {
        const timer = setTimeout(() => setShowBanner(true), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
    window.location.reload();
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("cookie-consent", "essential");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-6 inset-x-6 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="relative rounded-3xl border border-white/10 bg-neutral-950/80 backdrop-blur-md p-6 shadow-2xl hover:border-white/15 transition-all duration-300">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-500/5 via-transparent to-transparent pointer-events-none -z-10" />
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🍪</span>
            <h3 className="text-sm font-semibold text-white font-[family-name:var(--font-playfair)]">
              Cookie &amp; Tracking Preferences
            </h3>
          </div>
          
          <p className="text-xs text-white/60 leading-relaxed font-[family-name:var(--font-inter)] font-light">
            We use cookies and local storage to keep you signed in, remember your reading settings, and compile anonymized referral attribution analytics. You can learn more in our{" "}
            <Link href="/privacy" className="text-amber-400 hover:text-amber-300 underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </p>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handleAcceptAll}
              className="flex-1 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-black hover:bg-white/90 active:scale-95 transition-all"
            >
              Accept All
            </button>
            <button
              onClick={handleAcceptEssential}
              className="flex-1 inline-flex items-center justify-center rounded-full bg-white/5 border border-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white/80 hover:bg-white/10 active:scale-95 transition-all"
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
