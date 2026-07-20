import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import ResetPasswordForm from "./reset-form";
import { getServerAuthSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your Renu Writes Poem account.",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const session = await getServerAuthSession();
  const params = await searchParams;
  const token = params.token;

  if (session?.user) {
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    }
    redirect("/");
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_420px] gap-6 md:gap-8 items-stretch">
        {/* Left Panel */}
        <div className="hidden md:block rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-10 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">Renu Writes Poem</p>
            <h2 className="text-4xl leading-tight text-white mb-4">Set your new password</h2>
            <p className="text-white/65 font-[family-name:var(--font-inter)] leading-relaxed">
              Please enter your new password below. Make sure it is at least 8 characters long and contains a mix of characters for security.
            </p>
          </div>
          <div className="mt-auto border-t border-white/10 pt-6">
            <p className="text-xs text-white/40 italic">
              &ldquo;A fresh page, a clean stroke.&rdquo;
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 text-center md:p-10 flex flex-col justify-center items-center min-h-[400px]">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl text-white mb-3">Invalid Link</h2>
            <p className="text-white/60 font-[family-name:var(--font-inter)] max-w-sm leading-relaxed mb-8">
              The password reset token is missing. Please make sure you clicked the full link from your recovery email.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/10 px-6 py-2.5 text-xs font-semibold tracking-[0.18em] text-white uppercase transition-colors hover:bg-white/15"
            >
              Request Reset Link
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
