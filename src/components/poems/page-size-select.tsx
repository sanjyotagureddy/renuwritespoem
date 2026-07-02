"use client";

import { useRouter, useSearchParams } from "next/navigation";

const PAGE_SIZE_OPTIONS = [6, 9, 12, 15];

export default function PageSizeSelect({ current }: { current: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const size = parseInt(e.target.value, 10);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (size !== 9) {
      params.set("size", String(size));
    } else {
      params.delete("size");
    }
    const qs = params.toString();
    router.push(`/poems${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/30">Show</span>
      <select
        value={current}
        onChange={handleChange}
        className="rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-xs text-white/70 outline-none focus:border-white/30 cursor-pointer"
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  );
}
