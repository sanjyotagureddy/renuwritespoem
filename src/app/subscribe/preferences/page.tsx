import React from "react";
import type { Metadata } from "next";
import { getPrisma } from "@/lib/db";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe-helper";
import PreferencesForm from "./preferences-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Subscription Preferences — Renu Writes Poem",
  description: "Manage your newsletter preferences and update email notifications.",
  robots: { index: false, follow: false },
};

interface PreferencesPageProps {
  searchParams: Promise<{
    email?: string;
    token?: string;
  }>;
}

export default async function PreferencesPage({ searchParams }: PreferencesPageProps) {
  const { email, token } = await searchParams;

  if (!email || !token) {
    return <ErrorPanel message="Invalid link. Missing email or authentication token." />;
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();

  // Validate the authentication token
  if (!verifyUnsubscribeToken(cleanEmail, cleanToken)) {
    return <ErrorPanel message="This preferences link is invalid or has expired. Please check your latest email link." />;
  }

  const prisma = getPrisma();
  const subscriber = await prisma.subscriber.findUnique({
    where: { email: cleanEmail },
  });

  if (!subscriber) {
    return <ErrorPanel message="We couldn't find a subscription associated with this email address." />;
  }

  const isUnsubscribed = Boolean(subscriber.unsubscribedAt);

  return (
    <div className="relative max-w-xl mx-auto px-6 py-16 md:py-24 overflow-hidden min-h-[70vh]">
      {/* Background visual glow */}
      <div className="absolute -top-10 left-1/3 w-[30rem] h-[30rem] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="relative z-10 space-y-6">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium tracking-wider text-emerald-300 uppercase mb-4">
            Preferences
          </span>
          <h1 className="text-3xl font-bold text-white mb-2 font-[family-name:var(--font-playfair)]">
            Manage Subscription
          </h1>
          <p className="text-xs text-white/50 leading-relaxed font-[family-name:var(--font-inter)]">
            Email: <strong className="text-white/80">{cleanEmail}</strong>
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md">
          <PreferencesForm
            email={cleanEmail}
            token={cleanToken}
            initialName={subscriber.name}
            initialPrefPoems={subscriber.prefPoems}
            initialPrefBooks={subscriber.prefBooks}
            initialPrefAudio={subscriber.prefAudio}
            initialUnsubscribed={isUnsubscribed}
          />
        </div>
      </div>
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 text-center backdrop-blur-sm shadow-2xl">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-2xl font-[family-name:var(--font-inter)]">
          !
        </div>
        <h1 className="text-xl font-bold text-white mb-3">Authorization Failed</h1>
        <p className="text-xs leading-relaxed text-rose-200/80 mb-8">{message}</p>
        <Link
          href="/"
          className="inline-block w-full rounded-full border border-white/20 bg-white/5 px-6 py-3 text-xs font-semibold tracking-wider text-white transition-all hover:bg-white/10"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
