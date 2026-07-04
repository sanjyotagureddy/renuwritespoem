import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-3xl flex-col items-center justify-center px-6 py-20 text-center">
      <div className="rounded-full border border-amber-300/20 bg-amber-400/10 px-4 py-2 font-[family-name:var(--font-inter)] text-xs font-semibold tracking-[0.24em] text-amber-100 uppercase">
        Page not found
      </div>
      <h1 className="mt-7 text-4xl font-bold text-white md:text-6xl">
        This page wandered off.
      </h1>
      <p className="mt-5 max-w-2xl font-[family-name:var(--font-inter)] text-base leading-8 text-white/55 md:text-lg">
        The link may be old, moved, or just taking a poetic detour. Let&apos;s
        get you back somewhere useful.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-full border border-amber-200/30 bg-amber-200 px-6 py-3 font-[family-name:var(--font-inter)] text-sm font-semibold text-stone-950 transition-colors hover:bg-amber-100"
        >
          Go home
        </Link>
        <Link
          href="/poems"
          className="rounded-full border border-white/15 bg-white/5 px-6 py-3 font-[family-name:var(--font-inter)] text-sm font-semibold text-white/75 transition-colors hover:bg-white/10 hover:text-white"
        >
          Read poems
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
