"use client";

import { useEffect } from "react";

type ViewTrackerProps = {
  poemId: string;
};

export default function ViewTracker({ poemId }: ViewTrackerProps) {
  useEffect(() => {
    if (typeof window === "undefined" || !poemId) return;

    const viewedKey = `viewed_poem:${poemId}`;
    if (!sessionStorage.getItem(viewedKey)) {
      sessionStorage.setItem(viewedKey, "true");

      fetch(`/api/poems/${poemId}/view`, {
        method: "POST",
      })
        .then(() => {
          window.dispatchEvent(new CustomEvent("achievement-check"));
        })
        .catch((err) => console.error("Failed to track view:", err));
    }
  }, [poemId]);

  return null;
}
