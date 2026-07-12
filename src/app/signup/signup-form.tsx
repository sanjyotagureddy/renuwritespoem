"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signUpAction } from "../actions/auth-actions";
import PasswordFieldGroup from "@/components/auth/password-field-group";

export default function SignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await signUpAction(formData);
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center md:p-10 min-h-[480px] flex flex-col justify-center items-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl text-white mb-3">Check your email</h2>
        <p className="text-white/60 font-[family-name:var(--font-inter)] max-w-sm leading-relaxed mb-8">
          We sent a verification link to your email address. Please click the link in the email to activate your account.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/10 px-6 py-2.5 text-xs font-semibold tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/15"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-8 md:p-10 flex flex-col justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-white/45 mb-3 text-center">Join Sanctuary</p>
        <h1 className="text-3xl text-white mb-6 text-center">Create account</h1>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 font-[family-name:var(--font-inter)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5 font-medium">Full Name</label>
            <input
              type="text"
              name="name"
              required
              className="w-full min-h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/35"
              placeholder="e.g. John Doe"
            />
          </div>

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

          <PasswordFieldGroup
            passwordValue={password}
            setPasswordValue={setPassword}
            confirmPasswordValue={confirmPassword}
            setConfirmPasswordValue={setConfirmPassword}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-10 mt-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-neutral-950 font-bold text-xs uppercase tracking-[0.18em] transition-colors"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
      </div>

      <div className="mt-8 pt-4 border-t border-white/5 text-center">
        <p className="text-xs text-white/45">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
