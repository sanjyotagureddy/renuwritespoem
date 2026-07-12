import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { SubscriberSchema } from "@/lib/validations";
import { sendSubscriberVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
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

    // Check if email is unsubscribed (if there's a suppression table, but let's check)
    const isUnsubscribed = await prisma.unsubscribedEmail.findUnique({
      where: { email }
    });
    if (isUnsubscribed) {
      // Re-allow subscription by removing from unsubscribe list,
      // or we can allow subscribing but we must remove them from unsubscribedEmail once verified.
      // For now, let's keep them and we will delete from unsubscribedEmail once they click verify.
    }

    const existing = await prisma.subscriber.findUnique({
      where: { email }
    });

    if (existing && existing.verified && !existing.unsubscribedAt) {
      return NextResponse.json(
        { error: "This email is already subscribed." },
        { status: 400 }
      );
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
