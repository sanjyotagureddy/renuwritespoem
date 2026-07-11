"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "./shared-actions";

export async function updateUserRole(formData: FormData) {
  const session = await requireAdmin();
  const userId = String(formData.get("userId") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();

  if (!userId || (role !== "ADMIN" && role !== "READER")) {
    return;
  }

  if (userId === session.user.id && role !== "ADMIN") {
    return;
  }

  await getPrisma().user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");
}

export async function updateUserModeration(formData: FormData) {
  const session = await requireAdmin();
  const userId = String(formData.get("userId") ?? "").trim();
  const action = String(formData.get("action") ?? "").trim();
  const moderationNote = String(formData.get("moderationNote") ?? "").trim();

  if (!userId || userId === session.user.id) {
    return;
  }

  const prisma = getPrisma();
  const note = moderationNote || null;

  if (action === "flag") {
    await prisma.user.update({
      where: { id: userId },
      data: {
        flaggedAt: new Date(),
        moderationNote: note,
      },
    });
  } else if (action === "disable") {
    await prisma.user.update({
      where: { id: userId },
      data: {
        flaggedAt: new Date(),
        disabledAt: new Date(),
        moderationNote: note,
      },
    });
  } else if (action === "restore") {
    await prisma.user.update({
      where: { id: userId },
      data: {
        flaggedAt: null,
        disabledAt: null,
        moderationNote: note,
      },
    });
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}
