"use client";

import React, { useState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "../actions/auth-actions";
import PasswordFieldGroup from "@/components/auth/password-field-group";

type ResetPasswordFormProps = {
  token: string;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
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
      const res = await resetPasswordAction(token, formData);
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
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center md:p-10 min-h-[400px] flex flex-col justify-center items-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-2xl text-white mb-3">Password Updated</h2>
        <p className="text-white/60 font-[family-name:var(--font-inter)] max-w-sm leading-relaxed mb-8">
          Your password has been reset successfully. You can now log in using your new credentials.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/10 px-6 py-2.5 text-xs font-semibold tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/15"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-8 md:p-10 flex flex-col justify-between min-h-[400px]">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-white/45 mb-3 text-center">Account Security</p>
        <h1 className="text-3xl text-white mb-6 text-center">New password</h1>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 font-[family-name:var(--font-inter)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordFieldGroup
            passwordValue={password}
            setPasswordValue={setPassword}
            confirmPasswordValue={confirmPassword}
            setConfirmPasswordValue={setConfirmPassword}
            passwordLabel="New Password"
            confirmPlaceholder="Confirm new password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-10 mt-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-neutral-950 font-bold text-xs uppercase tracking-[0.18em] transition-colors"
          >
            {loading ? "Saving password..." : "Reset Password"}
          </button>
        </form>
      </div>

      <div className="mt-8 pt-4 border-t border-white/5 text-center">
        <p className="text-xs text-white/45">
          Cancel and return to{" "}
          <Link href="/login" className="text-amber-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
