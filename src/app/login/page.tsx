import type { Metadata } from "next";
import { redirect } from "next/navigation";
import GoogleSignInButton from "@/components/auth/google-sign-in-button";
import SignOutButton from "@/components/auth/sign-out-button";
import { getServerAuthSession } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

function getAuthErrorMessage(errorCode: string | undefined): string | null {
  if (!errorCode) return null;

  switch (errorCode) {
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthCreateAccount":
      return "Google sign-in failed. Check Google OAuth credentials and callback URL configuration.";
    case "AccessDenied":
      return "Access denied. This account does not have permission to continue.";
    case "Configuration":
      return "Auth configuration error. Verify AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, and AUTH_SECRET.";
    default:
      return `Sign-in error: ${errorCode}`;
  }
}

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to access the admin dashboard.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerAuthSession();
  const params = await searchParams;
  const authError = getAuthErrorMessage(params.error);

  if (session?.user?.role === "ADMIN") {
    redirect("/admin");
  }

  const signedInNonAdmin = Boolean(session?.user);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_420px] gap-6 md:gap-8 items-stretch">
        <div className="hidden md:block rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-10">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">Renu Writes Poem</p>
          <h2 className="text-4xl leading-tight text-white mb-4">Creator Portal</h2>
          <p className="text-white/65 font-[family-name:var(--font-inter)] leading-relaxed">
            Sign in with Google to continue. Admin privileges are granted only to approved accounts.
          </p>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-8 md:p-10 text-center min-h-[560px] flex flex-col justify-center">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45 mb-3">Secure Sign-In</p>
          <h1 className="text-3xl md:text-4xl text-white mb-4">
            {signedInNonAdmin ? "Access Pending" : "Sign In"}
          </h1>
          <p className="text-white/60 font-[family-name:var(--font-inter)] mb-8 max-w-sm mx-auto">
            {signedInNonAdmin
              ? "You are signed in, but this account is not approved for admin access yet."
              : "Continue with Google. If your email is approved, you will be redirected to the admin dashboard."}
          </p>

          {authError ? (
            <div className="mb-6 rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 font-[family-name:var(--font-inter)]">
              {authError}
            </div>
          ) : null}

          {signedInNonAdmin ? <SignOutButton /> : <GoogleSignInButton />}
        </div>
      </div>
    </div>
  );
}
