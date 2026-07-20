"use client";

import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import GoogleSignInButton from "@/components/auth/google-sign-in-button";
import { resendVerificationAction } from "@/actions/auth-actions";

type LoginFormProps = {
  initialError?: string | null;
  verified?: boolean;
};

export default function LoginForm({ initialError, verified: initialVerified }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(initialError || null);
  const [verifiedAlert, setVerifiedAlert] = useState<boolean>(initialVerified || false);
  const [loading, setLoading] = useState<boolean>(false);
  const [resending, setResending] = useState<boolean>(false);
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setVerifiedAlert(false);
    setResendSuccess(false);
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        // NextAuth maps authorize errors to error strings. Custom error: UNVERIFIED_EMAIL
        if (res.error.includes("UNVERIFIED_EMAIL")) {
          setError("UNVERIFIED_EMAIL");
        } else if (res.error.includes("No user found") || res.error.includes("Incorrect password")) {
          setError("Invalid email or password.");
        } else {
          setError(res.error);
        }
      } else {
        // Redirect to homepage or previous url
        const callbackUrl = searchParams.get("callbackUrl") || "/";
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) return;
    setResending(true);
    setError(null);

    try {
      const res = await resendVerificationAction(email);
      if (res.error) {
        setError(res.error);
      } else if (res.success) {
        setResendSuccess(true);
      }
    } catch {
      setError("Failed to resend verification email. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-8 md:p-10 text-center flex flex-col justify-between">
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-xs uppercase tracking-[0.22em] text-white/45 mb-3">Account Access</p>
        <h1 className="text-3xl text-white mb-6">Sign in</h1>

        {verifiedAlert && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 font-[family-name:var(--font-inter)] text-left">
            Your email has been successfully verified! You can now log in.
          </div>
        )}

        {resendSuccess && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 font-[family-name:var(--font-inter)] text-left">
            Verification link resent! Please check your email inbox.
          </div>
        )}

        {error && error !== "UNVERIFIED_EMAIL" && (
          <div className="mb-6 rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 font-[family-name:var(--font-inter)] text-left">
            {error}
          </div>
        )}

        {error === "UNVERIFIED_EMAIL" && (
          <div className="mb-6 rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 font-[family-name:var(--font-inter)] text-left flex flex-col gap-2">
            <span>Your email address has not been verified yet. Please check your inbox or verify your account.</span>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              className="text-left text-xs font-semibold text-amber-400 hover:underline focus:outline-none"
            >
              {resending ? "Resending verification..." : "Resend verification link"}
            </button>
          </div>
        )}

        {/* Google Sign-in */}
        <div className="mb-6">
          <GoogleSignInButton />
        </div>

        {/* Divider */}
        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-4 text-white/35 text-[10px] uppercase tracking-[0.2em] font-medium">Or continue with email</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5 font-medium">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full min-h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/35"
              placeholder="e.g. john@example.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs uppercase tracking-wider text-white/50 font-medium">Password</label>
              <Link href="/forgot-password" className="text-[11px] text-amber-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full min-h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/35"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-10 mt-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-neutral-950 font-bold text-xs uppercase tracking-[0.18em] transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>

      <div className="mt-8 pt-4 border-t border-white/5 text-center flex flex-col gap-3">
        <p className="text-xs text-white/45">
          New reader?{" "}
          <Link href="/signup" className="text-amber-400 hover:underline">
            Create an account
          </Link>
        </p>
        <p className="text-[10px] text-white/30 leading-relaxed font-[family-name:var(--font-inter)] max-w-xs mx-auto">
          Note: By signing in or creating an account, you agree to create a reader account and subscribe to receive our email newsletter updates. You can manage preferences or unsubscribe at any time.
        </p>
      </div>
    </div>
  );
}
