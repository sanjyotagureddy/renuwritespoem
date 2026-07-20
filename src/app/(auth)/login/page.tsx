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
        <div className="hidden md:block relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-10 flex flex-col justify-between">
          {/* Ambient background animations */}
          <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Drifting fluid blobs */}
            <div 
              className="absolute -top-[30%] -left-[30%] w-[100%] h-[100%] rounded-full bg-gradient-to-br from-amber-500/20 via-rose-500/10 to-transparent blur-[120px] mix-blend-screen opacity-80"
              style={{ animation: 'blob-one 18s infinite ease-in-out' }}
            />
            <div 
              className="absolute -bottom-[30%] -right-[30%] w-[100%] h-[100%] rounded-full bg-gradient-to-br from-purple-600/20 via-emerald-500/10 to-transparent blur-[120px] mix-blend-screen opacity-80"
              style={{ animation: 'blob-two 22s infinite ease-in-out' }}
            />
            <div 
              className="absolute top-[20%] left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-emerald-500/15 via-blue-500/10 to-transparent blur-[100px] mix-blend-screen opacity-60"
              style={{ animation: 'blob-three 20s infinite ease-in-out' }}
            />

            {/* Bouncing Audio Soundwaves / Poetry Equalizer */}
            <div className="absolute inset-y-0 right-0 w-[40%] flex items-center justify-around opacity-15 pr-6">
              <span className="w-1 bg-gradient-to-t from-transparent via-amber-400 to-transparent rounded-full animate-pulse" style={{ height: '35%', animationDuration: '1.2s' }} />
              <span className="w-1 bg-gradient-to-t from-transparent via-rose-400 to-transparent rounded-full animate-pulse" style={{ height: '55%', animationDuration: '0.8s', animationDelay: '0.2s' }} />
              <span className="w-1 bg-gradient-to-t from-transparent via-purple-400 to-transparent rounded-full animate-pulse" style={{ height: '75%', animationDuration: '1.5s', animationDelay: '0.4s' }} />
              <span className="w-1 bg-gradient-to-t from-transparent via-emerald-400 to-transparent rounded-full animate-pulse" style={{ height: '45%', animationDuration: '1s', animationDelay: '0.1s' }} />
              <span className="w-1 bg-gradient-to-t from-transparent via-amber-400 to-transparent rounded-full animate-pulse" style={{ height: '65%', animationDuration: '1.3s', animationDelay: '0.3s' }} />
            </div>

            {/* Rising Sparkles Flow */}
            <div className="absolute inset-0">
              <span className="absolute w-1.5 h-1.5 bg-amber-400 rounded-full left-[12%] opacity-0" style={{ animation: 'float-up 8s infinite linear', animationDelay: '0s' }} />
              <span className="absolute w-2.5 h-2.5 bg-purple-400 rounded-full left-[28%] opacity-0" style={{ animation: 'float-up 12s infinite linear', animationDelay: '2.5s' }} />
              <span className="absolute w-2 h-2 bg-emerald-400 rounded-full left-[48%] opacity-0" style={{ animation: 'float-up 10s infinite linear', animationDelay: '1.2s' }} />
              <span className="absolute w-1.5 h-1.5 bg-rose-400 rounded-full left-[65%] opacity-0" style={{ animation: 'float-up 7s infinite linear', animationDelay: '3.8s' }} />
              <span className="absolute w-2.5 h-2.5 bg-amber-400 rounded-full left-[78%] opacity-0" style={{ animation: 'float-up 14s infinite linear', animationDelay: '0.5s' }} />
              <span className="absolute w-2 h-2 bg-purple-400 rounded-full left-[92%] opacity-0" style={{ animation: 'float-up 9s infinite linear', animationDelay: '4.2s' }} />
              <span className="absolute w-1.5 h-1.5 bg-white rounded-full left-[38%] opacity-0" style={{ animation: 'float-up 11s infinite linear', animationDelay: '5.5s' }} />
            </div>

            <style dangerouslySetInnerHTML={{__html: `
              @keyframes blob-one {
                0% { transform: translate(0px, 0px) scale(1); }
                33% { transform: translate(30px, -50px) scale(1.15); }
                66% { transform: translate(-20px, 20px) scale(0.9); }
                100% { transform: translate(0px, 0px) scale(1); }
              }
              @keyframes blob-two {
                0% { transform: translate(0px, 0px) scale(1); }
                33% { transform: translate(-40px, 40px) scale(0.9); }
                66% { transform: translate(30px, -20px) scale(1.15); }
                100% { transform: translate(0px, 0px) scale(1); }
              }
              @keyframes blob-three {
                0% { transform: translate(0px, 0px) scale(1); }
                33% { transform: translate(40px, 20px) scale(1.1); }
                66% { transform: translate(-30px, -30px) scale(0.95); }
                100% { transform: translate(0px, 0px) scale(1); }
              }
              @keyframes float-up {
                0% { transform: translateY(110%) translateX(0); opacity: 0; }
                15% { opacity: 0.5; }
                85% { opacity: 0.5; }
                100% { transform: translateY(-10%) translateX(20px); opacity: 0; }
              }
            `}} />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium uppercase tracking-[0.15em] text-amber-400 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                A Portal of Verses &amp; spoken word
              </span>
              <h2 className="text-4xl leading-tight font-light text-white mb-6 tracking-wide">
                Step into the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-300 to-purple-400 font-medium">
                  sanctuary of words
                </span>
              </h2>
              <p className="text-white/70 text-sm leading-relaxed font-[family-name:var(--font-inter)] mb-8 max-w-sm">
                A place where language breathes, Marathi and Hindi verses find their voice, and audio recitations carry the warmth of rhythm. Join us to bookmark your favorite recitations, share thoughtful feedback, and explore new releases.
              </p>
              
              {/* Feature Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs text-white/60 font-[family-name:var(--font-inter)]">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm transition-colors hover:bg-white/[0.04]">
                  <span className="text-amber-400 text-sm">🎙️</span>
                  <span>Audio Poems</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm transition-colors hover:bg-white/[0.04]">
                  <span className="text-rose-400 text-sm">📚</span>
                  <span>Published Books</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm transition-colors hover:bg-white/[0.04]">
                  <span className="text-purple-400 text-sm">✍️</span>
                  <span>Creative Updates</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm transition-colors hover:bg-white/[0.04]">
                  <span className="text-emerald-400 text-sm">💬</span>
                  <span>Reader Comments</span>
                </div>
              </div>
            </div>

            <div className="mt-auto border-t border-white/10 pt-6">
              <p className="text-base text-amber-100/90 font-serif italic leading-relaxed">
                &ldquo;शब्द ही अनुभव, शब्द ही श्वास...&rdquo;
              </p>
              <p className="text-[10px] text-white/40 tracking-[0.15em] uppercase mt-2 font-medium">
                — Renu Writes Poem
              </p>
            </div>
          </div>
        </div>

        <LoginForm initialError={authError} verified={isVerified} />
      </div>
    </div>
  );
}
