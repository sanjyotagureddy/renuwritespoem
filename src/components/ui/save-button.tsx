"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function SaveButton({ slug, type }: { slug: string; type: "poem" | "book" }) {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const endpoint = `/api/${type === "poem" ? "poems" : "books"}/${slug}/save`;

  useEffect(() => {
    if (!session?.user) return;
    fetch(endpoint)
      .then((response) => response.json())
      .then((data) => setSaved(Boolean(data.saved)))
      .catch(() => undefined);
  }, [endpoint, session?.user]);

  async function toggle() {
    if (!session?.user) return;
    setLoading(true);
    try {
      const response = await fetch(endpoint, { method: "POST" });
      const data = await response.json();
      setSaved(Boolean(data.saved));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!session?.user || loading}
      title={!session?.user ? "Sign in to save" : saved ? "Remove from library" : "Save to library"}
      className={`w-full h-10 inline-flex items-center justify-center gap-1.5 rounded-full border px-4 text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 whitespace-nowrap shadow-sm ${
        saved
          ? "border-amber-400/40 bg-amber-500/15 text-amber-300"
          : "border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:text-white"
      } ${!session?.user ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <span>{saved ? "✓" : "⊹"}</span>
      <span>{saved ? "Saved" : "Save"}</span>
    </button>
  );
}
