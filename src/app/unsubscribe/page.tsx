"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { unsubscribePublicAction } from "./actions";

export default function PublicUnsubscribePage() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setError("");
    setSuccess(false);

    startTransition(async () => {
      try {
        await unsubscribePublicAction(email.trim());
        setSuccess(true);
        setEmail("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process request. Please try again.");
      }
    });
  }

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-6 py-16 font-[family-name:var(--font-inter)] text-white">
      {/* Premium ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-md shadow-2xl space-y-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-amber-300 uppercase mb-4">
            Opt-Out
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2 leading-tight">
            Unsubscribe Newsletter
          </h1>
          <p className="text-xs text-white/40 leading-normal max-w-sm mx-auto">
            We are sad to see you go. Enter your email address below to immediately opt-out and suppress future campaign dispatches.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-5 py-4 animate-fadeIn">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xl font-bold">
              ✓
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-white">Successfully Unsubscribed</h2>
              <p className="text-xs text-white/50 leading-relaxed max-w-xs mx-auto">
                You have been unsubscribed and your email address has been added to our newsletter suppression list.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-all"
            >
              Return to Website
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 animate-fadeIn">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[10px] font-semibold tracking-wide text-white/40 uppercase">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                disabled={isPending}
                value={email}
                placeholder="reader@example.com"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-xs text-white placeholder-white/20 outline-none focus:border-amber-300/40 focus:ring-1 focus:ring-amber-300/40 transition-all"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-center text-xs text-rose-300">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full inline-flex items-center justify-center rounded-xl border border-amber-300/20 bg-amber-200 px-4 py-3 text-xs font-semibold text-stone-950 hover:bg-amber-100 disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Unsubscribe Me"
              )}
            </button>

            <div className="text-center pt-2">
              <Link href="/" className="text-[11px] text-white/40 hover:text-white transition-colors underline">
                Cancel and return to home page
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
