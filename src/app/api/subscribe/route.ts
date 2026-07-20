import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { SubscriberSchema } from "@/lib/validations";
import { sendSubscriberVerificationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/moderation/rate-limit";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    // 1. Apply rate limiter to prevent spamming the endpoint (5 attempts per 5 minutes per IP)
    const limitCheck = await rateLimit("newsletter-subscribe", 5, 300000);
    if (limitCheck.limited) {
      return NextResponse.json(
        { error: "Too many subscription attempts. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = SubscriberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, name } = parsed.data;
    const prisma = getPrisma();

    const existing = await prisma.subscriber.findUnique({
      where: { email }
    });

    // 2. Prevent Email Enumeration: If the user is already verified and active,
    // return success immediately without sending verification emails or returning errors.
    if (existing && existing.verified && !existing.unsubscribedAt) {
      return NextResponse.json({ success: true });
    }

    const verifyToken = crypto.randomBytes(32).toString("hex");

    if (existing) {
      // Update existing pending or unsubscribed subscriber with a new verify token
      await prisma.subscriber.update({
        where: { email },
        data: {
          name: name || existing.name,
          verifyToken,
          verified: false, // reset verified until they click verify link
          unsubscribedAt: null, // clear unsubscribe status
        }
      });
    } else {
      // Create new pending subscriber
      await prisma.subscriber.create({
        data: {
          email,
          name: name || null,
          verifyToken,
          verified: false,
        }
      });
    }

    const sent = await sendSubscriberVerificationEmail(email, verifyToken, name);
    if (!sent) {
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
