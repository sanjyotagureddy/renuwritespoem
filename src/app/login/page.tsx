import type { Metadata } from "next";
import { redirect } from "next/navigation";
import GoogleSignInButton from "@/components/auth/google-sign-in-button";
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
      return "We could not complete Google sign-in. Please try again.";
    case "AccessDenied":
      return "This account cannot access this area.";
    case "Configuration":
      return "Sign-in is temporarily unavailable. Please try again later.";
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

  if (session?.user) {
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    }
    redirect("/");
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_420px] gap-6 md:gap-8 items-stretch">
        <div className="hidden md:block rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-10">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">Renu Writes Poem</p>
          <h2 className="text-4xl leading-tight text-white mb-4">Welcome back</h2>
          <p className="text-white/65 font-[family-name:var(--font-inter)] leading-relaxed">
            Use your Google account to continue securely.
          </p>
        </div>

        <div className="rounded-3xl border border-white/15 bg-white/[0.04] p-8 md:p-10 text-center min-h-[560px] flex flex-col justify-between">
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45 mb-3">Account Access</p>
            <h1 className="text-3xl md:text-4xl text-white mb-4">Sign in</h1>
            <p className="text-white/60 font-[family-name:var(--font-inter)] mb-8 max-w-sm mx-auto">
              Continue with Google to sign in securely.
            </p>

            {authError ? (
              <div className="mb-6 rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 font-[family-name:var(--font-inter)]">
                {authError}
              </div>
            ) : null}

            <GoogleSignInButton />
          </div>

          <p className="mt-auto pt-6 text-[10px] text-white/30 leading-relaxed font-[family-name:var(--font-inter)] max-w-xs mx-auto">
            Note: By continuing with Google, you agree to create a reader account and subscribe to receive our email newsletter updates. You can manage your preferences or unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
