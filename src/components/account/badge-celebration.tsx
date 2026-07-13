"use client";

import { useEffect, useState } from "react";

type Badge = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  tone: string;
};

const storageKey = "renuwritespoem:celebrated-badges";

export default function BadgeCelebration({ badges }: { badges: Badge[] }) {
  const [badge, setBadge] = useState<Badge | null>(null);

  useEffect(() => {
    const celebrated = new Set<string>(
      JSON.parse(window.localStorage.getItem(storageKey) ?? "[]"),
    );
    const newestUnlocked = [...badges]
      .reverse()
      .find((item) => item.unlocked && !celebrated.has(item.id));
    if (newestUnlocked) setBadge(newestUnlocked);
  }, [badges]);

  function close() {
    if (!badge) return;
    const celebrated = new Set<string>(
      JSON.parse(window.localStorage.getItem(storageKey) ?? "[]"),
    );
    celebrated.add(badge.id);
    window.localStorage.setItem(storageKey, JSON.stringify([...celebrated]));
    setBadge(null);
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) =>
      event.key === "Escape" && close();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!badge) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-celebration-title"
    >
      <div
        className={`celebration-${badge.tone} w-full max-w-sm rounded-3xl border p-8 text-center shadow-2xl shadow-black/50`}
      >
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-current/30 bg-current/10 text-xl font-semibold">
          ✦
        </span>
        <p className="mt-6 text-xs font-semibold tracking-[0.24em] uppercase">
          New reader badge
        </p>
        <h2
          id="badge-celebration-title"
          className="mt-3 text-2xl font-semibold text-white"
        >
          {badge.name}
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/65">
          {badge.description}. Thank you for making space for poetry.
        </p>
        <button
          type="button"
          onClick={close}
          className="mt-7 rounded-full border border-current/35 bg-current/10 px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-current/20"
        >
          Keep reading
        </button>
      </div>
    </div>
  );
}
