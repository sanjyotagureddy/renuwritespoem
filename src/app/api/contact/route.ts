import { NextResponse } from "next/server";
import { sendContactMessage } from "@/lib/email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const message = String(body.message ?? "").trim();
    const website = String(body.website ?? "").trim();

    // Honeypot fields are invisible to people but commonly filled by bots.
    if (website) return NextResponse.json({ sent: true });

    if (!name || !email || !subject || !message) {
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
    if (name.length > 100 || subject.length > 150 || message.length > 5000) {
      return NextResponse.json(
        { error: "One or more fields are too long." },
        { status: 400 },
      );
    }

    await sendContactMessage({ name, email, subject, message });
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
