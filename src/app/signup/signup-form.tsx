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
  const [agreed, setAgreed] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (!agreed) {
      setShowModal(true);
    } else {
      setAgreed(false);
    }
  };

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
    } catch {
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
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-8 backdrop-blur-md md:p-10 flex flex-col justify-between">
      <div>
        <h3 className="text-2xl font-light text-white mb-6">Create Reader Account</h3>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-sm text-red-400 font-[family-name:var(--font-inter)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5 font-medium">Display Name</label>
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

          <div className="flex items-start gap-3 mt-3">
            <input
              type="checkbox"
              id="consent-checkbox"
              required
              checked={agreed}
              onClick={handleCheckboxClick}
              onChange={() => {}}
              className="mt-0.5 w-4 h-4 rounded border-white/10 bg-black/20 text-amber-500 outline-none transition-colors focus:border-amber-400 cursor-pointer"
            />
            <label htmlFor="consent-checkbox" className="text-xs text-white/60 leading-normal cursor-pointer select-none font-[family-name:var(--font-inter)]">
              I have read and agree to the email verification terms and the newsletter auto-subscription policy.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !agreed}
            className="w-full min-h-10 mt-4 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/30 disabled:text-neutral-950/40 text-neutral-950 font-bold text-xs uppercase tracking-[0.18em] transition-colors"
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

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold mb-4 tracking-wide text-amber-400">Terms of Registration</h3>
            
            <div className="space-y-4 text-sm text-white/70 leading-relaxed font-[family-name:var(--font-inter)] mb-6 max-h-60 overflow-y-auto pr-1">
              <div>
                <h4 className="font-medium text-white mb-1">1. Email Verification</h4>
                <p>
                  We require confirming your email address before granting access to leave comments or likes (not required if you sign in with Google). A verification link will be sent automatically.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">2. Newsletter Updates</h4>
                <p>
                  Registering automatically subscribes you to Renu&apos;s creative poetry, recitation announcements, and book updates. You can manage email preferences or unsubscribe at any time.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/5 pt-4">
              <button
                type="button"
                onClick={() => {
                  setAgreed(false);
                  setShowModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/60 hover:text-white transition-colors"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => {
                  setAgreed(true);
                  setShowModal(false);
                }}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
