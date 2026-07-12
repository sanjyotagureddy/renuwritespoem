"use server";

import { getPrisma } from "@/lib/db";
import { sendAdminUnsubscribeNotification } from "@/lib/email";

export async function unsubscribePublicAction(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error("Email is required.");
  }

  const prisma = getPrisma();

  await prisma.$transaction([
    prisma.unsubscribedEmail.upsert({
      where: { email: cleanEmail },
      create: { email: cleanEmail },
      update: {},
    }),
    prisma.subscriber.updateMany({
      where: { email: cleanEmail },
      data: {
        verified: false,
        unsubscribedAt: new Date(),
        verifyToken: null,
      },
    }),
  ]);

  // Alert the admin regarding the subscription preference change
  await sendAdminUnsubscribeNotification(cleanEmail).catch((err) =>
    console.error("Failed to notify admin of unsubscribe:", err)
  );

  return { success: true };
}
