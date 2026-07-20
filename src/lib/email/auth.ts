import { siteConfig } from "@/lib/seo";
import {
  getMailer,
  FROM_EMAIL,
  escapeHtml,
  emailShell,
  buttonLink,
} from "./shell";

export async function sendSubscriberVerificationEmail(
  recipientEmail: string,
  token: string,
  name?: string | null
): Promise<boolean> {
  const mailer = getMailer();
  if (!mailer || !FROM_EMAIL) return false;

  const verifyUrl = `${siteConfig.url}/subscribe/verify?email=${encodeURIComponent(recipientEmail)}&token=${token}`;
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hello,";

  const emailBody = emailShell({
    eyebrow: "Newsletter Subscription",
    title: "Verify your email address",
    subtitle: "Thank you for subscribing to Renu Writes Poem. Please verify your email to complete the setup.",
    children: `
      <p style="margin:0 0 14px;">${greeting}</p>
      <p style="margin:0 0 20px;">We received a request to subscribe this email address to Renu Writes Poem's newsletter for updates on new poems, books, and audio play recitations.</p>
      ${buttonLink("Verify Email Address", verifyUrl)}
      <p style="margin:20px 0 0; font-size:12px; color:#9ca3af;">If the button above does not work, copy and paste this URL into your browser:<br />
      <a href="${verifyUrl}" style="color:#9a3412;">${verifyUrl}</a></p>
      <p style="margin:20px 0 0; font-size:11px; color:#9ca3af;">If you did not request this subscription, you can safely ignore this email.</p>
    `,
  });

  try {
    await mailer.sendMail({
      from: `"Renu Writes Poem" <${FROM_EMAIL}>`,
      to: recipientEmail,
      subject: "Verify your newsletter subscription — Renu Writes Poem",
      html: emailBody,
    });
    return true;
  } catch (err) {
    console.error("Failed to send subscriber verification email:", err);
    return false;
  }
}

export async function sendAccountVerificationEmail(
  recipientEmail: string,
  token: string,
  name?: string | null
): Promise<boolean> {
  const mailer = getMailer();
  if (!mailer || !FROM_EMAIL) return false;

  const verifyUrl = `${siteConfig.url}/api/auth/verify?email=${encodeURIComponent(recipientEmail)}&token=${token}`;
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hello,";

  const emailBody = emailShell({
    eyebrow: "Account Creation",
    title: "Verify your reader account",
    subtitle: "Thank you for joining Renu Writes Poem. Please verify your email to activate your account.",
    children: `
      <p style="margin:0 0 14px;">${greeting}</p>
      <p style="margin:0 0 20px;">We received a registration request for this email address to create a reader account on Renu Writes Poem.</p>
      ${buttonLink("Verify Account", verifyUrl)}
      <p style="margin:20px 0 0; font-size:12px; color:#9ca3af;">If the button above does not work, copy and paste this URL into your browser:<br />
      <a href="${verifyUrl}" style="color:#9a3412;">${verifyUrl}</a></p>
      <p style="margin:20px 0 0; font-size:11px; color:#9ca3af;">If you did not create this account, you can safely ignore this email.</p>
    `,
  });

  try {
    await mailer.sendMail({
      from: `"Renu Writes Poem" <${FROM_EMAIL}>`,
      to: recipientEmail,
      subject: "Verify your reader account — Renu Writes Poem",
      html: emailBody,
    });
    return true;
  } catch (err) {
    console.error("Failed to send account verification email:", err);
    return false;
  }
}

export async function sendPasswordResetEmail(
  recipientEmail: string,
  token: string,
  name?: string | null
): Promise<boolean> {
  const mailer = getMailer();
  if (!mailer || !FROM_EMAIL) return false;

  const resetUrl = `${siteConfig.url}/reset-password?token=${token}`;
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hello,";

  const emailBody = emailShell({
    eyebrow: "Account Recovery",
    title: "Reset your password",
    subtitle: "We received a request to reset the password for your Renu Writes Poem account.",
    children: `
      <p style="margin:0 0 14px;">${greeting}</p>
      <p style="margin:0 0 20px;">Click the button below to reset your password. This link is valid for 1 hour.</p>
      ${buttonLink("Reset Password", resetUrl)}
      <p style="margin:20px 0 0; font-size:12px; color:#9ca3af;">If the button above does not work, copy and paste this URL into your browser:<br />
      <a href="${resetUrl}" style="color:#9a3412;">${resetUrl}</a></p>
      <p style="margin:20px 0 0; font-size:11px; color:#9ca3af;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    `,
  });

  try {
    await mailer.sendMail({
      from: `"Renu Writes Poem" <${FROM_EMAIL}>`,
      to: recipientEmail,
      subject: "Reset your password — Renu Writes Poem",
      html: emailBody,
    });
    return true;
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    return false;
  }
}
