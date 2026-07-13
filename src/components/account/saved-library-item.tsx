"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SavedLibraryItem({ type, slug, title, savedAt }: { type: "poem" | "book"; slug: string; title: string; savedAt: string }) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  const href = `/${type === "poem" ? "poems" : "books"}/${slug}`;

  async function remove() {
    setRemoving(true);
    await fetch(`/api/${type === "poem" ? "poems" : "books"}/${slug}/save`, { method: "POST" });
    router.refresh();
  }

  return <div className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.02] p-4">
    <Link href={href} className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-white/80">{title}</p>
      <p className="mt-1 text-xs text-white/35">Saved {savedAt}</p>
    </Link>
    <button type="button" onClick={remove} disabled={removing} className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 transition-colors hover:border-rose-300/30 hover:text-rose-200 disabled:opacity-50">
      {removing ? "Removing…" : "Remove"}
    </button>
  </div>;
}
