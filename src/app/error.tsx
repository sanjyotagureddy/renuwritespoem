"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Application error:", error);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <div className="rounded-full border border-rose-300/20 bg-rose-400/10 px-4 py-2 font-[family-name:var(--font-inter)] text-xs font-semibold tracking-[0.24em] text-rose-200 uppercase">
        Something broke
      </div>
      <h1 className="mt-7 text-4xl font-bold text-white md:text-6xl">
        It&apos;s not you. We messed up something.
      </h1>
      <p className="mt-5 max-w-2xl font-[family-name:var(--font-inter)] text-base leading-8 text-white/55 md:text-lg">
        A page tripped over itself while loading. We&apos;ve kept the message
        gentle, but yes — this one is on us. Please try again, or head back
        home while we sort it out.
      </p>

      {error.digest && (
        <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 font-[family-name:var(--font-inter)] text-xs text-white/35">
          Error reference: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-amber-200/30 bg-amber-200 px-6 py-3 font-[family-name:var(--font-inter)] text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-100"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-white/15 bg-white/5 px-6 py-3 font-[family-name:var(--font-inter)] text-sm font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white"
        >
          Go home
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-white/15 px-6 py-3 font-[family-name:var(--font-inter)] text-sm font-semibold text-white/55 transition-colors hover:bg-white/10 hover:text-white"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}
