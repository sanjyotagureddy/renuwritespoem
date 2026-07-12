import { NextResponse } from "next/server";
import { validateContactMessageTone } from "@/lib/contact-guard";
import { sendContactMessage } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { getPrisma } from "@/lib/db";
import { ContactSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const limitCheck = await rateLimit("contact", 3, 300000); // 3 per 5 mins
    if (limitCheck.limited) {
      return NextResponse.json(
        { error: "Too many messages sent. Please try again in a few minutes." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = ContactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, phone, subject, message, website } = parsed.data;

    // Honeypot fields are invisible to people but commonly filled by bots.
    if (website) return NextResponse.json({ sent: true });

    const toneError = validateContactMessageTone({ subject, message });
    if (toneError) {
      return NextResponse.json({ error: toneError }, { status: 400 });
    }

    // Persist to DB first
    const prisma = getPrisma();
    await prisma.contactMessage.create({
      data: { name, email, phone, subject, message },
    });

    await sendContactMessage({ name, email, phone, subject, message });

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Contact email failed:", error);
    return NextResponse.json(
      {
        error:
          "We couldn't send your message. Please try again or email us directly.",
      },
      { status: 500 },
    );
  }
}
