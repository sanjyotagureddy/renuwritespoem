import { NextResponse } from "next/server";
import { validateContactMessageTone } from "@/lib/contact-guard";
import { sendContactMessage } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d][\d\s().-]{6,19}$/;

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
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();
    const website = String(body.website ?? "").trim();

    // Honeypot fields are invisible to people but commonly filled by bots.
    if (website) return NextResponse.json({ sent: true });

    if (!name || !email || !phone || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }
    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: "Enter a valid email address." },
        { status: 400 },
      );
    }
    if (!PHONE_PATTERN.test(phone)) {
      return NextResponse.json(
        { error: "Enter a valid phone number." },
        { status: 400 },
      );
    }
    if (
      name.length > 100 ||
      phone.length > 20 ||
      subject.length > 150 ||
      message.length > 5000
    ) {
      return NextResponse.json(
        { error: "One or more fields are too long." },
        { status: 400 },
      );
    }
    const toneError = validateContactMessageTone({ subject, message });
    if (toneError) {
      return NextResponse.json({ error: toneError }, { status: 400 });
    }

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
