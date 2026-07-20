"use client";

import React, { useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "../actions/auth-actions";

export default function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await forgotPasswordAction(formData);
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        setSuccess(true);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center md:p-10 min-h-[400px] flex flex-col justify-center items-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
          </svg>
        </div>
        <h2 className="text-2xl text-white mb-3">Email Sent</h2>
        <p className="text-white/60 font-[family-name:var(--font-inter)] max-w-sm leading-relaxed mb-8">
          If that email address exists in our database, we have sent a link to reset your password. Please check your inbox.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/10 px-6 py-2.5 text-xs font-semibold tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/15"
        >
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-8 md:p-10 flex flex-col justify-between min-h-[400px]">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-white/45 mb-3 text-center">Account Recovery</p>
        <h1 className="text-3xl text-white mb-4 text-center font-light">Forgot password</h1>
        <p className="text-white/60 font-[family-name:var(--font-inter)] text-center text-sm mb-8 max-w-xs mx-auto">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 font-[family-name:var(--font-inter)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5 font-medium">Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="w-full min-h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/35"
              placeholder="e.g. john@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-10 mt-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-neutral-950 font-bold text-xs uppercase tracking-[0.18em] transition-colors"
          >
            {loading ? "Sending link..." : "Send Reset Link"}
          </button>
        </form>
      </div>

      <div className="mt-8 pt-4 border-t border-white/5 text-center">
        <p className="text-xs text-white/45">
          Remember your password?{" "}
          <Link href="/login" className="text-amber-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
