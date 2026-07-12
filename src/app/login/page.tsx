import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";
import { getServerAuthSession } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; verified?: string }>;
};

function getAuthErrorMessage(errorCode: string | undefined): string | null {
  if (!errorCode) return null;

  switch (errorCode) {
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthCreateAccount":
      return "We could not complete Google sign-in. Please try again.";
    case "AccessDenied":
      return "This account cannot access this area.";
    case "Configuration":
      return "Sign-in is temporarily unavailable. Please try again later.";
    case "VerificationMissing":
      return "Verification token is missing. Please check your verification link.";
    case "VerificationExpired":
      return "Verification link has expired or is invalid. Please request a new verification link below.";
    case "VerificationError":
      return "Failed to verify account. Please try again.";
    case "CredentialsSignin":
      return "Invalid email or password.";
    default:
      return "Sign-in failed. Please try again.";
  }
}

export const metadata: Metadata = {
  title: "Login",
  description: "Secure sign-in for Renu Writes Poem.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerAuthSession();
  const params = await searchParams;
  const authError = getAuthErrorMessage(params.error);
  const isVerified = params.verified === "true";

  if (session?.user) {
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    }
    redirect("/");
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_420px] gap-6 md:gap-8 items-stretch">
        <div className="hidden md:block rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-10 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">Renu Writes Poem</p>
            <h2 className="text-4xl leading-tight text-white mb-4">Welcome back</h2>
            <p className="text-white/65 font-[family-name:var(--font-inter)] leading-relaxed">
              Sign in to write comments on poems, save your liked recitations, and check your poetry book orders.
            </p>
          </div>
          <div className="mt-auto border-t border-white/10 pt-6">
            <p className="text-xs text-white/40 italic">
              &ldquo;Every verse is an open door.&rdquo;
            </p>
          </div>
        </div>

        <LoginForm initialError={authError} verified={isVerified} />
      </div>
    </div>
  );
}
