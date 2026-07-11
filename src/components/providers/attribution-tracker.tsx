"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

function AttributionTrackerInner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const src = searchParams.get("src");
    if (src) {
      const cleanSrc = src.toLowerCase().trim().slice(0, 50);

      // Store in localStorage if we don't have a source yet (first touch attribution)
      if (!localStorage.getItem("attribution_src")) {
        localStorage.setItem("attribution_src", cleanSrc);
      }

      // Avoid logging multiple clicks for the exact same source+path in the current browsing session
      const sessionLogKey = `attribution_click:${cleanSrc}:${pathname}`;
      if (!sessionStorage.getItem(sessionLogKey)) {
        sessionStorage.setItem(sessionLogKey, "true");

        fetch("/api/attribution/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: cleanSrc,
            path: pathname,
          }),
        }).catch((err) => console.error("Attribution click log error:", err));
      }
    }
  }, [searchParams, pathname]);

  useEffect(() => {
    // Sync signup source when user signs up / signs in
    if (status === "authenticated" && session?.user?.id) {
      const storedSrc = localStorage.getItem("attribution_src");
      const synced = localStorage.getItem("attribution_synced");

      if (storedSrc && !synced) {
        fetch("/api/attribution/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: storedSrc }),
        })
          .then((res) => {
            if (res.ok) {
              localStorage.setItem("attribution_synced", "true");
            }
          })
          .catch((err) => console.error("Attribution signup sync error:", err));
      }
    }
  }, [status, session]);

  return null;
}

export default function AttributionTracker() {
  return (
    <Suspense fallback={null}>
      <AttributionTrackerInner />
    </Suspense>
  );
}
