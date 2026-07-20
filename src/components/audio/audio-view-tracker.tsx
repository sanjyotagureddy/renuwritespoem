"use client";

import { useEffect } from "react";

type AudioViewTrackerProps = {
  audioId: string;
};

export default function AudioViewTracker({ audioId }: AudioViewTrackerProps) {
  useEffect(() => {
    if (typeof window === "undefined" || !audioId) return;

    const viewedKey = `viewed_audio:${audioId}`;
    if (!sessionStorage.getItem(viewedKey)) {
      sessionStorage.setItem(viewedKey, "true");

      fetch(`/api/audio/${audioId}/view`, {
        method: "POST",
      })
        .then(() => {
          window.dispatchEvent(new CustomEvent("achievement-check"));
        })
        .catch((err) => console.error("Failed to track audio view:", err));
    }
  }, [audioId]);

  return null;
}
