"use client";

import { signIn } from "next-auth/react";

export default function GoogleSignInButton() {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl: "/admin" })}
      className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-white/25 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/40"
    >
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" role="img" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 4 1.5l2.7-2.6C17 3 14.7 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12z"
          />
          <path
            fill="#34A853"
            d="M3.2 7.3l3.2 2.3C7.2 7.6 9.4 6 12 6c1.9 0 3.2.8 4 1.5l2.7-2.6C17 3 14.7 2 12 2 8.2 2 4.9 4.1 3.2 7.3z"
          />
          <path
            fill="#FBBC05"
            d="M12 22c2.6 0 4.8-.9 6.4-2.5l-3-2.4c-.8.6-1.9 1-3.4 1-2.5 0-4.7-1.7-5.5-4l-3.2 2.5C5 19.9 8.2 22 12 22z"
          />
          <path
            fill="#4285F4"
            d="M21.6 12.2c0-.7-.1-1.2-.2-1.8H12v3.9h5.5c-.3 1.2-1 2.1-2 2.8l3 2.4c1.7-1.6 3.1-4 3.1-7.3z"
          />
        </svg>
      </span>
      <span>Continue with Google</span>
    </button>
  );
}
