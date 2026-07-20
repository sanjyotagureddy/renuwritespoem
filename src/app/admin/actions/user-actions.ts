"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "./shared-actions";
import { UpdateUserRoleSchema, UpdateUserModerationSchema } from "@/lib/validations";
import { sendAccountVerificationEmail, sendPasswordResetEmail } from "@/lib/email";

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

export async function adminResendVerification(userId: string) {
  await requireAdmin();
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, signUpSource: true }
  });

  if (!user || user.signUpSource !== "credentials") {
    throw new Error("Invalid user for credentials verification resend");
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({ where: { email: user.email } }),
    prisma.emailVerificationToken.create({
      data: {
        email: user.email,
        token,
        expires
      }
    })
  ]);

  await sendAccountVerificationEmail(user.email, token, user.name);
}

export async function adminSendPasswordReset(userId: string) {
  await requireAdmin();
  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, signUpSource: true }
  });

  if (!user || user.signUpSource !== "credentials") {
    throw new Error("Invalid user for password reset");
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { email: user.email } }),
    prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expires
      }
    })
  ]);

  await sendPasswordResetEmail(user.email, token, user.name);
}
