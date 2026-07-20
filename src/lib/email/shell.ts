import nodemailer from "nodemailer";

export function getMailer() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.warn("Gmail SMTP is not configured. Emails will not be sent.");
    return null;
  }
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

export const FROM_EMAIL = process.env.FROM_EMAIL ?? process.env.GMAIL_USER ?? "";
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
export const SUPPORT_EMAIL = ADMIN_EMAIL || FROM_EMAIL || "renuwritespoem@gmail.com";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatInr(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function cleanSubjectPart(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export function emailShell({
  eyebrow,
  title,
  subtitle,
  badge,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  badge?: string;
  children: string;
}): string {
  return `
    <div style="margin:0; padding:0; background:#fff7ed;">
      <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${escapeHtml(
        subtitle ?? title,
      ).replace(/<[^>]*>/g, "")}</div>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; background:#fff7ed;">
        <tr>
          <td style="padding:28px 14px;">
            <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; max-width:680px; margin:0 auto; border-collapse:collapse;">
              <tr>
                <td style="padding:0 0 14px; text-align:center;">
                  <div style="display:inline-block; padding:8px 14px; border:1px solid #f5c2a4; border-radius:999px; background:#ffffffcc; color:#9a3412; font-family:Arial,sans-serif; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase;">
                    Renu Writes Poem
                  </div>
                </td>
              </tr>
              <tr>
                <td style="overflow:hidden; border:1px solid #f1d5c6; border-radius:28px; background:#ffffff;">
                  <!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;"><tr><td style="background:#fff7ed;"><![endif]-->
                  <div style="padding:30px 20px 26px; background:#fff7ed; color:#431407; text-align:center;">
                    <p style="margin:0 0 10px; color:#9a3412; font-family:Arial,sans-serif; font-size:11px; font-weight:800; letter-spacing:2px; text-transform:uppercase;">${eyebrow}</p>
                    ${badge ? `<div style="display:inline-block; margin:0 0 14px; padding:7px 13px; border-radius:999px; background:#7c2d12; color:#ffffff; font-family:Arial,sans-serif; font-size:12px; font-weight:800;">${badge}</div>` : ""}
                    <h1 style="margin:0; color:#431407; font-family:Georgia,'Times New Roman',serif; font-size:26px; line-height:1.25; letter-spacing:-0.3px; word-wrap:break-word; overflow-wrap:break-word;">${title}</h1>
                    ${subtitle ? `<p style="margin:14px auto 0; max-width:520px; color:#5f2411; font-family:Arial,sans-serif; font-size:14px; line-height:1.7;">${subtitle}</p>` : ""}
                  </div>
                  <!--[if mso]></td></tr></table><![endif]-->
                  <div style="padding:24px 20px; font-family:Arial,sans-serif; color:#1f2937; font-size:15px; line-height:1.7;">
                    ${children}
                    <div style="margin-top:28px; padding-top:20px; border-top:1px solid #f3e8df; color:#6b4f43; font-size:13px; line-height:1.7;">
                      <p style="margin:0 0 6px;">Need help? Reply to this email or write to <a href="mailto:${escapeHtml(
                        SUPPORT_EMAIL,
                      )}" style="color:#9a3412; font-weight:700; text-decoration:none;">${escapeHtml(
                        SUPPORT_EMAIL,
                      )}</a>.</p>
                      <p style="margin:0; font-family:Georgia,'Times New Roman',serif; font-style:italic; color:#9a3412;">With gratitude,<br />Renu Writes Poem</p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 8px 0; text-align:center; color:#9ca3af; font-family:Arial,sans-serif; font-size:12px;">
                  A small note from Renu Writes Poem.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export function detailTable(rows: Array<[string, string]>): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:separate; border-spacing:0; margin:22px 0; overflow:hidden; border:1px solid #f3e8df; border-radius:18px; background:#fffaf7; font-family:Arial,sans-serif; font-size:14px;">
      ${rows
        .map(
          ([label, value]) => `
            <tr>
              <td style="padding:13px 16px; border-bottom:1px solid #f3e8df; color:#8b5e45; width:35%; vertical-align:top;">${label}</td>
              <td style="padding:13px 16px; border-bottom:1px solid #f3e8df; color:#1f2937; font-weight:700; text-align:right; vertical-align:top;">${value}</td>
            </tr>
          `,
        )
        .join("")}
    </table>
  `;
}

export function callout({
  tone,
  title,
  body,
}: {
  tone: "warm" | "green" | "blue" | "rose" | "purple";
  title: string;
  body: string;
}): string {
  const colors = {
    warm: ["#fff7ed", "#fb923c", "#7c2d12"],
    green: ["#ecfdf5", "#34d399", "#065f46"],
    blue: ["#eff6ff", "#60a5fa", "#1e3a8a"],
    rose: ["#fff1f2", "#fb7185", "#9f1239"],
    purple: ["#faf5ff", "#c084fc", "#581c87"],
  }[tone];

  return `
    <div style="margin:20px 0; padding:18px 20px; border-left:5px solid ${colors[1]}; border-radius:16px; background:${colors[0]}; color:${colors[2]};">
      <p style="margin:0 0 6px; font-weight:800;">${title}</p>
      <p style="margin:0; line-height:1.7;">${body}</p>
    </div>
  `;
}

export function buttonLink(label: string, href: string): string {
  return `
    <p style="margin:18px 0 0;">
      <a href="${href}" style="display:inline-block; padding:12px 18px; border-radius:999px; background:#7c2d12; color:#ffffff; font-family:Arial,sans-serif; font-size:14px; font-weight:800; text-decoration:none;">${label}</a>
    </p>
  `;
}
