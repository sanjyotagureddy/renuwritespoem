"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getPrisma } from "@/lib/db";
import { SignUpSchema, ForgotPasswordSchema, ResetPasswordSchema } from "@/lib/validations";
import { sendAccountVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { rateLimit } from "@/lib/moderation/rate-limit";

export type ActionResponse = {
  success?: boolean;
  error?: string;
};

export async function signUpAction(formData: FormData): Promise<ActionResponse> {
  try {
    const limitCheck = await rateLimit("signup", 3, 300000);
    if (limitCheck.limited) {
      return { error: "Too many registration attempts. Please try again in 5 minutes." };
    }

    const rawData = Object.fromEntries(formData.entries());
    const parsed = SignUpSchema.safeParse(rawData);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Invalid input data";
      return { error: errorMsg };
    }

    const { name, email, password } = parsed.data;
    const prisma = getPrisma();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true }
    });

    if (existingUser) {
      if (existingUser.passwordHash) {
        return { error: "An account with this email already exists." };
      } else {
        return { error: "This email is registered using Google Sign-in. Please log in with Google." };
      }
    }

    // Hash password
    const saltRounds = parseInt(process.env.PASSWORD_SALT_ROUNDS ?? "10", 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "READER",
        signUpSource: "credentials"
      }
    });

    // Create verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: {
        email,
        token,
        expires
      }
    });

    // Send verification email
    await sendAccountVerificationEmail(email, token, name);

    return { success: true };
  } catch (err) {
    console.error("Failed to sign up:", err);
    return { error: "An error occurred during registration. Please try again." };
  }
}

export async function resendVerificationAction(email: string): Promise<ActionResponse> {
  try {
    const limitCheck = await rateLimit("resend-verification", 3, 300000);
    if (limitCheck.limited) {
      return { error: "Too many verification requests. Please try again in 5 minutes." };
    }

    if (!email) {
      return { error: "Email is required." };
    }

    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true, emailVerified: true, passwordHash: true }
    });

    // Security best practice: don't reveal if user does not exist, is already verified, or uses Google OAuth
    if (!user || user.emailVerified || !user.passwordHash) {
      return { success: true };
    }

    // Generate new token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Remove any previous verification tokens and create new
    await prisma.$transaction([
      prisma.emailVerificationToken.deleteMany({ where: { email } }),
      prisma.emailVerificationToken.create({
        data: {
          email,
          token,
          expires
        }
      })
    ]);

    await sendAccountVerificationEmail(email, token, user.name);

    return { success: true };
  } catch (err) {
    console.error("Failed to resend verification email:", err);
    return { error: "An error occurred. Please try again later." };
  }
}

export async function forgotPasswordAction(formData: FormData): Promise<ActionResponse> {
  try {
    const limitCheck = await rateLimit("forgot-password", 3, 300000);
    if (limitCheck.limited) {
      return { error: "Too many password recovery requests. Please try again in 5 minutes." };
    }

    const rawData = Object.fromEntries(formData.entries());
    const parsed = ForgotPasswordSchema.safeParse(rawData);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Invalid email address";
      return { error: errorMsg };
    }

    const { email } = parsed.data;
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true, passwordHash: true }
    });

    // Security best practice: don't reveal if user does not exist
    if (!user) {
      return { success: true };
    }

    if (!user.passwordHash) {
      return { error: "This email is registered using Google Sign-in. Password recovery is not available." };
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { email } }),
      prisma.passwordResetToken.create({
        data: {
          email,
          token,
          expires
        }
      })
    ]);

    await sendPasswordResetEmail(email, token, user.name);

    return { success: true };
  } catch (err) {
    console.error("Failed to request password reset:", err);
    return { error: "An error occurred. Please try again later." };
  }
}

export async function resetPasswordAction(token: string, formData: FormData): Promise<ActionResponse> {
  try {
    const limitCheck = await rateLimit("reset-password", 5, 300000);
    if (limitCheck.limited) {
      return { error: "Too many password reset attempts. Please try again in 5 minutes." };
    }

    if (!token) {
      return { error: "Reset token is missing or invalid." };
    }

    const rawData = Object.fromEntries(formData.entries());
    const parsed = ResetPasswordSchema.safeParse(rawData);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Invalid input data";
      return { error: errorMsg };
    }

    const { password } = parsed.data;
    const prisma = getPrisma();

    // Verify token exists and is not expired
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return { error: "This link has expired or is invalid. Please request a new password reset." };
    }

    // Hash new password
    const saltRounds = parseInt(process.env.PASSWORD_SALT_ROUNDS ?? "10", 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update password and delete token
    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { passwordHash }
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      })
    ]);

    return { success: true };
  } catch (err) {
    console.error("Failed to reset password:", err);
    return { error: "An error occurred resetting your password. Please try again." };
  }
}
