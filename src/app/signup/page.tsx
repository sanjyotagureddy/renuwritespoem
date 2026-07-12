import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SignUpForm from "./signup-form";
import { getServerAuthSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a reader account on Renu Writes Poem.",
};

export default async function SignUpPage() {
  const session = await getServerAuthSession();

  if (session?.user) {
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    }
    redirect("/");
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_420px] gap-6 md:gap-8 items-stretch">
        {/* Left Welcome panel */}
        <div className="hidden md:block rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-10 flex flex-col justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-4">Renu Writes Poem</p>
            <h2 className="text-4xl leading-tight text-white mb-4">Create your account</h2>
            <p className="text-white/65 font-[family-name:var(--font-inter)] leading-relaxed mb-6">
              Create a reader account to save your favorite poems, write comments, buy poetry books, and receive updates directly from Renu.
            </p>
          </div>
          <div className="mt-auto border-t border-white/10 pt-6">
            <p className="text-xs text-white/40 italic">
              &ldquo;Poetry is the language of the soul.&rdquo;
            </p>
          </div>
        </div>

        {/* Right Form panel */}
        <SignUpForm />
      </div>
    </div>
  );
}
