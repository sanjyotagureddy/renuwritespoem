"use client";

import { useEffect } from "react";

type BookViewTrackerProps = {
  bookId: string;
};

export default function BookViewTracker({ bookId }: BookViewTrackerProps) {
  useEffect(() => {
    if (typeof window === "undefined" || !bookId) return;

    const viewedKey = `viewed_book:${bookId}`;
    if (!sessionStorage.getItem(viewedKey)) {
      sessionStorage.setItem(viewedKey, "true");

      fetch(`/api/books/${bookId}/view`, {
        method: "POST",
      })
        .then(() => {
          window.dispatchEvent(new CustomEvent("achievement-check"));
        })
        .catch((err) => console.error("Failed to track view:", err));
    }
  }, [bookId]);

  return null;
}
