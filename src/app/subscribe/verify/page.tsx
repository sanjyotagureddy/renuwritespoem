import { getPrisma } from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscription Verified — Renu Writes Poem",
  description: "Your newsletter subscription has been successfully verified.",
  robots: { index: false, follow: false },
};

interface VerifyPageProps {
  searchParams: Promise<{ email?: string; token?: string }>;
}

export default async function VerifySubscribePage({ searchParams }: VerifyPageProps) {
  const { email, token } = await searchParams;

  if (!email || !token) {
    return <ErrorPanel message="Missing verification details. Please click the exact link in your email." />;
  }

  const prisma = getPrisma();

  try {
    const subscriber = await prisma.subscriber.findUnique({
      where: { email },
      select: { id: true, verifyToken: true, verified: true },
    });

    if (!subscriber) {
      return <ErrorPanel message="We couldn't find a pending subscription for this email address." />;
    }

    if (subscriber.verified) {
      return <SuccessPanel message="Your email is already verified and subscribed!" />;
    }

    if (subscriber.verifyToken !== token) {
      return <ErrorPanel message="This verification link is invalid or has expired. Please sign up again." />;
    }

    // Verify subscriber, clean up suppression list, and mark invite conversion
    await prisma.$transaction([
      prisma.subscriber.update({
        where: { email },
        data: {
          verified: true,
          verifyToken: null,
          subscribedAt: new Date(),
          unsubscribedAt: null,
        },
      }),
      prisma.unsubscribedEmail.deleteMany({
        where: { email },
      }),
      prisma.invite.updateMany({
        where: { inviteeEmail: email, signedUpAt: null },
        data: { signedUpAt: new Date() },
      }),
    ]);

    return <SuccessPanel message="Subscription verified successfully! Thank you for joining Renu Writes Poem." />;
  } catch (err) {
    console.error("Verification page error:", err);
    return <ErrorPanel message="An unexpected error occurred. Please try again later." />;
  }
}

function SuccessPanel({ message }: { message: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center backdrop-blur-sm shadow-2xl">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-2xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Subscription Confirmed</h1>
        <p className="text-sm leading-relaxed text-emerald-200/85 mb-8">{message}</p>
        <Link
          href="/"
          className="inline-block w-full rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold tracking-wider text-black transition-all hover:bg-emerald-400 hover:scale-[1.02]"
        >
          Explore the Poems
        </Link>
      </div>
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 text-center backdrop-blur-sm shadow-2xl">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-2xl">
          !
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Verification Failed</h1>
        <p className="text-sm leading-relaxed text-rose-200/85 mb-8">{message}</p>
        <Link
          href="/"
          className="inline-block w-full rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold tracking-wider text-white transition-all hover:bg-white/10"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
