"use client";

import { useEffect, useState } from "react";

type Badge = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  tone: string;
};

export default function BadgeCollectionDialog({ badges }: { badges: Badge[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) =>
      event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-amber-100 uppercase transition-colors hover:bg-amber-300/20"
      >
        View badges
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="badge-collection-title"
        >
          <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/15 bg-neutral-950 p-6 shadow-2xl shadow-black/60 md:p-8">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-amber-200/70 uppercase">
                  Your collection
                </p>
                <h2
                  id="badge-collection-title"
                  className="mt-2 text-2xl font-semibold text-white"
                >
                  Reader milestones
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Close badge collection"
              >
                Close
              </button>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {badges.map((badge, index) => (
                <div
                  key={badge.id}
                  className={`rounded-xl border p-4 ${badge.unlocked ? `badge-${badge.tone}` : "border-white/8 bg-black/15 text-white/30"}`}
                >
                  <span
                    className={`mb-3 flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold ${badge.unlocked ? "border-current/30 bg-current/10" : "border-white/10 bg-white/5"}`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm font-medium text-white/80">
                    {badge.name}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/40">
                    {badge.description}
                  </p>
                  <p className="mt-3 text-[10px] font-semibold tracking-[0.14em] uppercase">
                    {badge.unlocked ? "Unlocked" : "In progress"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
