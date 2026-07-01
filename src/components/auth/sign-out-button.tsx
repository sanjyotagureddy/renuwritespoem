"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-full border border-white/25 px-5 py-2.5 text-xs uppercase tracking-[0.18em] text-white/80 hover:text-white hover:border-white/40 transition-colors"
    >
      Sign Out
    </button>
  );
}
