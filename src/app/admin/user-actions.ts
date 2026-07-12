"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "./shared-actions";
import { UpdateUserRoleSchema, UpdateUserModerationSchema } from "@/lib/validations";

export async function updateUserRole(formData: FormData) {
  const session = await requireAdmin();
  const parsed = UpdateUserRoleSchema.safeParse(formData);

  if (!parsed.success) {
    return;
  }

  const { userId, role } = parsed.data;

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
  const parsed = UpdateUserModerationSchema.safeParse(formData);

  if (!parsed.success) {
    return;
  }

  const { userId, action, moderationNote } = parsed.data;

  if (userId === session.user.id) {
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
