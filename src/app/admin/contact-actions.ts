"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { sendContactReply } from "@/lib/email";
import { requireAdmin } from "./shared-actions";

export async function replyToContact(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const replyBody = String(formData.get("replyBody") ?? "").trim();

  if (!id) throw new Error("Message ID is required.");
  if (!replyBody) throw new Error("Reply body is required.");

  const prisma = getPrisma();
  const msg = await prisma.contactMessage.findUnique({ where: { id } });
  if (!msg) throw new Error("Contact message not found.");

  await sendContactReply({
    toName: msg.name,
    toEmail: msg.email,
    originalSubject: msg.subject,
    replyBody,
  });

  await prisma.contactMessage.update({
    where: { id },
    data: {
      repliedAt: new Date(),
      repliedNote: replyBody,
    },
  });

  revalidatePath("/admin/contacts");
}

export async function deleteContact(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Message ID is required.");

  const prisma = getPrisma();
  await prisma.contactMessage.delete({ where: { id } });

  revalidatePath("/admin/contacts");
}
