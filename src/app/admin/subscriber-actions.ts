"use server";

import { getPrisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const session = await getServerAuthSession();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function deleteSubscriber(id: string) {
  await verifyAdmin();
  const prisma = getPrisma();
  
  const sub = await prisma.subscriber.findUnique({
    where: { id },
    select: { email: true }
  });

  if (sub) {
    await prisma.$transaction([
      prisma.subscriber.delete({ where: { id } }),
      // Also clean up unsubscribed list if they are deleted
      prisma.unsubscribedEmail.deleteMany({ where: { email: sub.email } })
    ]);
  }

  revalidatePath("/admin/subscribers");
  return { success: true };
}

export async function toggleSubscriberStatus(id: string, action: "verify" | "unsubscribe") {
  await verifyAdmin();
  const prisma = getPrisma();
  
  const sub = await prisma.subscriber.findUnique({
    where: { id }
  });

  if (!sub) {
    throw new Error("Subscriber not found");
  }

  if (action === "verify") {
    await prisma.$transaction([
      prisma.subscriber.update({
        where: { id },
        data: {
          verified: true,
          verifyToken: null,
          subscribedAt: new Date(),
          unsubscribedAt: null,
        }
      }),
      prisma.unsubscribedEmail.deleteMany({ where: { email: sub.email } })
    ]);
  } else if (action === "unsubscribe") {
    await prisma.$transaction([
      prisma.subscriber.update({
        where: { id },
        data: {
          verified: false,
          unsubscribedAt: new Date(),
        }
      }),
      // Add to suppression list
      prisma.unsubscribedEmail.upsert({
        where: { email: sub.email },
        create: { email: sub.email },
        update: {}
      })
    ]);
  }

  revalidatePath("/admin/subscribers");
  return { success: true };
}
