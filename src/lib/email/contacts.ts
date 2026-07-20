import { siteConfig } from "@/lib/seo";
import { getPrisma } from "@/lib/db";
import { getUnsubscribeToken } from "@/lib/email/unsubscribe-helper";
import {
  getMailer,
  FROM_EMAIL,
  ADMIN_EMAIL,
  escapeHtml,
  cleanSubjectPart,
  emailShell,
  detailTable,
} from "./shell";

export async function sendContactMessage({
  name,
  email,
  phone,
  subject,
  message,
}: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): Promise<void> {
  const mailer = getMailer();
  if (!mailer || !FROM_EMAIL || !ADMIN_EMAIL) {
    throw new Error("Contact email is not configured.");
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
  const messageRef = new Date().toISOString().slice(0, 16).replace("T", " ");
  const subjectLine = `Website message from ${cleanSubjectPart(name)} — ${cleanSubjectPart(subject)} — ${messageRef}`;

  await mailer.sendMail({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    replyTo: email,
    subject: subjectLine,
    text: `From: ${name} <${email}>\nPhone: ${phone}\nSubject: ${subject}\n\n${message}`,
    html: emailShell({
      eyebrow: "Website message",
      badge: "Contact form",
      title: "New message received",
      subtitle: `From ${safeName} about “${safeSubject}”.`,
      children: `
        ${detailTable([
          ["From", safeName],
          ["Email", `<a href="mailto:${safeEmail}" style="color:#9a3412; font-weight:700; text-decoration:none;">${safeEmail}</a>`],
          ["Phone", `<a href="tel:${safePhone}" style="color:#9a3412; font-weight:700; text-decoration:none;">${safePhone}</a>`],
          ["Subject", safeSubject],
        ])}
        <div style="margin-top:20px; padding:20px; border-radius:18px; background:#fff7ed; color:#431407; line-height:1.75;">${safeMessage}</div>
        <p style="margin:18px 0 0; color:#6b4f43;">Reply to this email to respond directly to ${safeName}.</p>
      `,
    }),
  });
}

export async function sendContactReply({
  toName,
  toEmail,
  originalSubject,
  replyBody,
}: {
  toName: string;
  toEmail: string;
  originalSubject: string;
  replyBody: string;
}): Promise<void> {
  const mailer = getMailer();
  if (!mailer || !FROM_EMAIL) throw new Error("Email is not configured.");

  const safeName = escapeHtml(toName);
  const safeSubject = escapeHtml(originalSubject);
  const safeBody = escapeHtml(replyBody).replaceAll("\n", "<br />");

  await mailer.sendMail({
    from: FROM_EMAIL,
    to: toEmail,
    replyTo: FROM_EMAIL,
    subject: `Re: ${cleanSubjectPart(originalSubject)}`,
    text: `Hi ${toName},\n\n${replyBody}\n\nWith gratitude,\nRenu Writes Poem`,
    html: emailShell({
      eyebrow: "Reply from Renu",
      title: `Re: ${safeSubject}`,
      subtitle: `A personal reply to your message.`,
      children: `
        <p style="margin:0 0 10px;">Hi ${safeName},</p>
        <div style="margin:20px 0; padding:20px; border-radius:18px; background:#fff7ed; color:#431407; line-height:1.75;">${safeBody}</div>
        <p style="margin:18px 0 0; color:#6b4f43;">Feel free to reply to this email if you have any follow-up questions.</p>
      `,
    }),
  });
}

export async function sendInvitationEmail(
  senderName: string,
  recipientEmail: string,
  inviteId: string,
  personalNote?: string,
  poemId?: string
): Promise<boolean> {
  const mailer = getMailer();
  if (!mailer || !FROM_EMAIL) return false;

  let poemTitle = "";
  let poemExcerpt = "";
  let poemCover = "";
  let poemSlug = "";

  if (poemId) {
    try {
      const prisma = getPrisma();
      const poem = await prisma.poem.findUnique({
        where: { id: poemId },
        select: { title: true, excerpt: true, coverImage: true, slug: true }
      });
      if (poem) {
        poemTitle = poem.title;
        poemExcerpt = poem.excerpt ?? "";
        poemCover = poem.coverImage ?? "";
        poemSlug = poem.slug;
      }
    } catch (err) {
      console.error("Failed to fetch poem details for invite email:", err);
    }
  }

  const token = getUnsubscribeToken(recipientEmail);
  const unsubscribeUrl = `${siteConfig.url}/api/unsubscribe?email=${encodeURIComponent(recipientEmail)}&token=${token}`;

  const hasPoem = Boolean(poemTitle && poemSlug);
  const emailBody = emailShell({
    eyebrow: "Personal Invitation",
    title: `${senderName} thinks you'd love this`,
    subtitle: hasPoem 
      ? `Renu just published a poem you might enjoy — invited by ${senderName}.`
      : `${senderName} thought you would appreciate the poetry, books, and recitations on Renu's poetry website.`,
    children: `
      ${personalNote ? `
        <div style="margin:20px 0; padding:16px 20px; border-left:4px solid #ea580c; background:#faf5f2; color:#431407; border-radius:4px 12px 12px 4px; font-size:14px; line-height:1.6; font-style:italic;">
          &ldquo;${escapeHtml(personalNote)}&rdquo;
        </div>
      ` : ""}

      ${hasPoem ? `
        <div style="background:#faf5f2; border:1px solid #f3e8df; border-radius:18px; padding:24px; margin:20px 0; text-align:center;">
          ${poemCover ? `<img src="${escapeHtml(poemCover)}" alt="${escapeHtml(poemTitle)}" style="max-width:100%; height:auto; border-radius:12px; margin-bottom:16px; border:1px solid #f3e8df; max-height:220px; object-fit:cover;" />` : ""}
          <h3 style="margin:0 0 10px; color:#431407; font-family:Georgia,serif; font-size:20px; font-weight:700;">${escapeHtml(poemTitle)}</h3>
          ${poemExcerpt ? `<p style="margin:0 0 18px; color:#6b7280; font-size:14px; font-style:italic; line-height:1.6;">&ldquo;${escapeHtml(poemExcerpt)}&rdquo;</p>` : ""}
          <a href="${escapeHtml(`${siteConfig.url}/poems/${poemSlug}?invitedBy=${encodeURIComponent(senderName)}&src=invite`)}" style="display:inline-block; padding:12px 28px; background:#9a3412; color:#ffffff; text-decoration:none; border-radius:999px; font-weight:700; font-size:13px; letter-spacing:1.5px; text-transform:uppercase;">Read Full Poem</a>
        </div>
      ` : `
        <div style="background:#faf5f2; border:1px solid #f3e8df; border-radius:18px; padding:24px; margin:20px 0; text-align:center;">
          <h3 style="margin:0 0 10px; color:#431407; font-family:Georgia,serif; font-size:20px; font-weight:700;">Renu Writes Poem</h3>
          <p style="margin:0 0 18px; color:#6b7280; font-size:14px; line-height:1.6;">A warm, visual sanctuary of heartfelt verses, poetry anthologies, and voice recitations by Renu.</p>
          <a href="${escapeHtml(`${siteConfig.url}?invitedBy=${encodeURIComponent(senderName)}&src=invite`)}" style="display:inline-block; padding:12px 28px; background:#9a3412; color:#ffffff; text-decoration:none; border-radius:999px; font-weight:700; font-size:13px; letter-spacing:1.5px; text-transform:uppercase;">Explore Sanctuary</a>
        </div>
      `}

      <p style="margin:0 0 14px;">Here is what you can discover on the platform:</p>
      <ul style="margin:0 0 20px; padding-left:20px; color:#374151;">
        <li style="margin-bottom:8px;"><strong>Read Poems:</strong> Moving verses on love, nature, life, and solitude.</li>
        <li style="margin-bottom:8px;"><strong>Listen to Audio:</strong> Immersive recitations voiced directly by Renu.</li>
        <li style="margin-bottom:8px;"><strong>Browse Books:</strong> Published poetry collections available for purchase.</li>
      </ul>
      <p style="margin:0; color:#4b5563;">We warmly welcome you to drop by, read a verse, and share your thoughts in the comments.</p>

      <div style="margin-top:28px; padding-top:14px; border-top:1px solid #f3e8df; text-align:center;">
        <a href="${unsubscribeUrl}" style="color:#9ca3af; font-size:11px; text-decoration:underline;">Unsubscribe / Suppress future invites</a>
      </div>
    `,
  });

  const subjectText = hasPoem
    ? `${senderName} invited you to read "${poemTitle}" on Renu Writes Poem`
    : `${senderName} invited you to explore Renu Writes Poem`;

  try {
    await mailer.sendMail({
      from: `"${senderName} via Renu Writes Poem" <${FROM_EMAIL}>`,
      to: recipientEmail,
      subject: cleanSubjectPart(subjectText),
      html: emailBody,
    });
    return true;
  } catch (err) {
    console.error("Failed to send invitation email:", err);
    return false;
  }
}
