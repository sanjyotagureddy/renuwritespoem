"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { Search, X, Loader2 } from "lucide-react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function handleSearch(val: string) {
    setQuery(val);

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (val.trim()) {
        params.set("q", val);
      } else {
        params.delete("q");
      }
      // Reset page to 1 on search change
      params.delete("page");

      const queryString = params.toString();
      router.push(`/poems${queryString ? `?${queryString}` : ""}`);
    });
  }

  return (
    <div className="relative w-full max-w-md font-[family-name:var(--font-inter)]">
      <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-white/40">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </span>
      <input
        type="text"
        value={query}
        placeholder="Search poems by title, verses, or keywords..."
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-amber-400/40 rounded-xl py-2.5 pl-10 pr-9 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-amber-400/30 transition-all"
      />
      {query && (
        <button
          onClick={() => handleSearch("")}
          className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-white transition-colors"
          aria-label="Clear Search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
