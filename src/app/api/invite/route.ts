import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { checkCommentTone } from "@/lib/contact-guard";
import { sendInvitationEmail } from "@/lib/email";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to send invitations." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const senderName = String(body.senderName ?? "").trim();
    const inviteeName = String(body.inviteeName ?? "Friend").trim();
    const recipientEmail = String(body.recipientEmail ?? "").trim().toLowerCase();
    const personalNote = body.personalNote ? String(body.personalNote).trim() : undefined;
    const poemId = body.poemId ? String(body.poemId).trim() : undefined;

    if (!senderName || senderName.length < 2) {
      return NextResponse.json(
        { error: "Please enter your name (minimum 2 characters)." },
        { status: 400 }
      );
    }

    if (!inviteeName || inviteeName.length < 2) {
      return NextResponse.json(
        { error: "Please enter your friend's name (minimum 2 characters)." },
        { status: 400 }
      );
    }

    if (!recipientEmail || !EMAIL_PATTERN.test(recipientEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid recipient email address." },
        { status: 400 }
      );
    }

    if (recipientEmail === session.user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: "You cannot invite yourself." },
        { status: 400 }
      );
    }

    if (personalNote) {
      if (personalNote.length > 100) {
        return NextResponse.json(
          { error: "Personal note cannot exceed 100 characters." },
          { status: 400 }
        );
      }
      const toneCheck = checkCommentTone(personalNote);
      if (toneCheck.isAbusive) {
        return NextResponse.json(
          { error: `Inappropriate personal note: ${toneCheck.reason ?? "disrespectful language"}` },
          { status: 400 }
        );
      }
    }

    const prisma = getPrisma();

    // 1. Abuse check: total lifetime invites
    const lifetimeCount = await prisma.invite.count({
      where: { inviterUserId: session.user.id }
    });
    if (lifetimeCount >= 50) {
      return NextResponse.json(
        { error: "You have reached your lifetime limit of 50 invitations." },
        { status: 403 }
      );
    }

    // 2. Abuse check: daily limit (5 invites per 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dailyCount = await prisma.invite.count({
      where: {
        inviterUserId: session.user.id,
        sentAt: { gte: oneDayAgo }
      }
    });
    if (dailyCount >= 5) {
      return NextResponse.json(
        { error: "Daily limit reached. You can send up to 5 invitations per day." },
        { status: 429 }
      );
    }

    // 3. Unsubscribed check
    const isUnsubscribed = await prisma.unsubscribedEmail.findUnique({
      where: { email: recipientEmail }
    });
    if (isUnsubscribed) {
      // Return silent success to prevent email verification probing
      return NextResponse.json({ success: true });
    }

    // 4. Create the invite record
    const invite = await prisma.invite.create({
      data: {
        inviterUserId: session.user.id,
        inviteeName,
        inviteeEmail: recipientEmail,
        poemId: poemId || null,
        personalNote: personalNote || null,
      }
    });

    // 5. Send the invitation email
    const success = await sendInvitationEmail(
      senderName,
      recipientEmail,
      invite.id,
      personalNote,
      poemId
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to send invitation email. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Invite API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
