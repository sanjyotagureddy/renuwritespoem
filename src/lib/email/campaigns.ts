import { siteConfig } from "@/lib/seo";
import { getUnsubscribeToken } from "@/lib/email/unsubscribe-helper";
import {
  getMailer,
  FROM_EMAIL,
  escapeHtml,
  emailShell,
  cleanSubjectPart,
} from "./shell";

export async function sendCampaignEmail({
  recipientEmail,
  recipientName,
  subject,
  bodyHtml,
}: {
  recipientEmail: string;
  recipientName: string | null;
  subject: string;
  bodyHtml: string;
}): Promise<boolean> {
  const mailer = getMailer();
  if (!mailer || !FROM_EMAIL) return false;

  const unsubscribeToken = getUnsubscribeToken(recipientEmail);
  const unsubscribeUrl = `${siteConfig.url}/api/unsubscribe?email=${encodeURIComponent(recipientEmail)}&token=${unsubscribeToken}`;
  const preferencesUrl = `${siteConfig.url}/subscribe/preferences?email=${encodeURIComponent(recipientEmail)}&token=${unsubscribeToken}`;

  const greeting = recipientName ? `Hi ${escapeHtml(recipientName)},` : "Hello,";

  const emailBody = emailShell({
    eyebrow: "Newsletter Update",
    title: cleanSubjectPart(subject),
    children: `
      <p style="margin:0 0 14px;">${greeting}</p>
      <div style="font-[family-name:var(--font-inter)]; line-height:1.7; color:#374151;">
        ${bodyHtml}
      </div>
      <div style="margin-top:28px; padding-top:14px; border-top:1px solid #f3e8df; text-align:center; font-size:11px; color:#9ca3af; line-height:1.6;">
        <p style="margin:0 0 4px;">This email was sent to ${escapeHtml(recipientEmail)} because you subscribed to updates from Renu Writes Poem.</p>
        <a href="${preferencesUrl}" style="color:#9a3412; font-weight:700; text-decoration:none; margin-right:12px;">Manage Preferences</a>
        <a href="${unsubscribeUrl}" style="color:#9ca3af; text-decoration:underline;">Unsubscribe completely</a>
      </div>
    `,
  });

  try {
    await mailer.sendMail({
      from: `"Renu Writes Poem" <${FROM_EMAIL}>`,
      to: recipientEmail,
      subject: cleanSubjectPart(subject),
      html: emailBody,
    });
    return true;
  } catch (err) {
    console.error(`Failed to send campaign email to ${recipientEmail}:`, err);
    return false;
  }
}

export async function sendCampaignEmailBcc({
  bccEmails,
  subject,
  bodyHtml,
}: {
  bccEmails: string[];
  subject: string;
  bodyHtml: string;
}): Promise<boolean> {
  const mailer = getMailer();
  if (!mailer || !FROM_EMAIL) return false;

  const preferencesUrl = `${siteConfig.url}/unsubscribe`;

  const emailBody = emailShell({
    eyebrow: "Newsletter Update",
    title: cleanSubjectPart(subject),
    children: `
      <p style="margin:0 0 14px;">Hello Reader,</p>
      <div style="font-[family-name:var(--font-inter)]; line-height:1.7; color:#374151;">
        ${bodyHtml}
      </div>
      <div style="margin-top:28px; padding-top:14px; border-top:1px solid #f3e8df; text-align:center; font-size:11px; color:#9ca3af; line-height:1.6;">
        <p style="margin:0 0 4px;">This email was sent to you because you subscribed to updates from Renu Writes Poem.</p>
        <a href="${preferencesUrl}" style="color:#9a3412; font-weight:700; text-decoration:none;">Unsubscribe / Manage Preferences</a>
      </div>
    `,
  });

  try {
    await mailer.sendMail({
      from: `"Renu Writes Poem" <${FROM_EMAIL}>`,
      to: FROM_EMAIL,
      bcc: bccEmails,
      subject: cleanSubjectPart(subject),
      html: emailBody,
    });
    return true;
  } catch (err) {
    console.error(`Failed to send campaign BCC email to ${bccEmails.length} recipients:`, err);
    return false;
  }
}

export async function sendAdminUnsubscribeNotification(email: string): Promise<boolean> {
  const mailer = getMailer();
  if (!mailer || !FROM_EMAIL) return false;

  const adminEmail = process.env.ADMIN_EMAIL || FROM_EMAIL;

  const emailBody = emailShell({
    eyebrow: "Admin Notification",
    title: "Subscriber Opt-Out",
    children: `
      <p style="margin:0 0 14px;">Hi Admin,</p>
      <p style="margin:0 0 20px;">The following subscriber has opted out and unsubscribed from your newsletter updates:</p>
      <div style="padding:14px; background:#f3f4f6; border-radius:8px; font-family:monospace; font-size:14px; color:#1f2937; margin-bottom:20px;">
        ${escapeHtml(email)}
      </div>
      <p style="margin:0; font-size:12px; color:#9ca3af;">This email has been added to your suppression list and will not receive further campaign broadcasts.</p>
    `,
  });

  try {
    await mailer.sendMail({
      from: `"Renu Writes Poem" <${FROM_EMAIL}>`,
      to: adminEmail,
      subject: `[Admin] Newsletter Unsubscribe: ${email}`,
      html: emailBody,
    });
    return true;
  } catch (err) {
    console.error("Failed to send admin unsubscribe notification:", err);
    return false;
  }
}
