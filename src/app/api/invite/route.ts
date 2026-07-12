import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";
import { checkCommentTone } from "@/lib/contact-guard";
import { sendInvitationEmail } from "@/lib/email";
import { InviteSchema } from "@/lib/validations";

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
    const parsed = InviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { senderName, inviteeName, recipientEmail, personalNote, poemId } = parsed.data;

    if (recipientEmail === session.user.email?.toLowerCase()) {
      return NextResponse.json(
        { error: "You cannot invite yourself." },
        { status: 400 }
      );
    }

    if (personalNote) {
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
