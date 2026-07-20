"use server";

import { getPrisma } from "@/lib/db";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe-helper";

export async function updateSubscriberPreferences({
  email,
  token,
  name,
  prefPoems,
  prefBooks,
  prefAudio,
  unsubscribeAll,
}: {
  email: string;
  token: string;
  name: string | null;
  prefPoems: boolean;
  prefBooks: boolean;
  prefAudio: boolean;
  unsubscribeAll: boolean;
}) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();

  // 1. Authorize access via HMAC signature
  if (!verifyUnsubscribeToken(cleanEmail, cleanToken)) {
    throw new Error("Invalid or expired authentication token. Please request a new link.");
  }

  const prisma = getPrisma();

  // Find the subscriber
  const subscriber = await prisma.subscriber.findUnique({
    where: { email: cleanEmail }
  });

  if (!subscriber) {
    throw new Error("Subscriber not found.");
  }

  // 2. Perform updates
  if (unsubscribeAll || (!prefPoems && !prefBooks && !prefAudio)) {
    // Unsubscribe completely
    await prisma.$transaction([
      prisma.subscriber.update({
        where: { email: cleanEmail },
        data: {
          verified: false,
          unsubscribedAt: new Date(),
          prefPoems: false,
          prefBooks: false,
          prefAudio: false,
        }
      }),
      prisma.unsubscribedEmail.upsert({
        where: { email: cleanEmail },
        create: { email: cleanEmail },
        update: {}
      })
    ]);
    return { success: true, unsubscribed: true };
  } else {
    // Save preferences and ensure subscriber is unsuppressed/resubscribed
    await prisma.$transaction([
      prisma.subscriber.update({
        where: { email: cleanEmail },
        data: {
          name: name ? name.trim() || null : null,
          prefPoems,
          prefBooks,
          prefAudio,
          verified: true, // ensure verified
          unsubscribedAt: null, // clear suppression
        }
      }),
      prisma.unsubscribedEmail.deleteMany({
        where: { email: cleanEmail }
      })
    ]);
    return { success: true, unsubscribed: false };
  }
}
