import nodemailer from "nodemailer";

function getMailer() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.warn("Gmail SMTP is not configured. Emails will not be sent.");
    return null;
  }
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

const FROM_EMAIL = process.env.FROM_EMAIL ?? process.env.GMAIL_USER ?? "";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendOrderConfirmation({
  buyerEmail,
  buyerName,
  bookTitle,
  phone,
  address,
  city,
  state,
  pincode,
  copies,
  shippingAmount,
  subtotal,
  totalAmount,
  orderId,
}: {
  buyerEmail: string;
  buyerName: string;
  bookTitle: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  copies: number;
  shippingAmount: number;
  subtotal: number;
  totalAmount: number;
  orderId: string;
}): Promise<{ buyerSent: boolean; adminSent: boolean }> {
  const mailer = getMailer();
  if (!mailer || !FROM_EMAIL) return { buyerSent: false, adminSent: false };

  const supportEmail = "renuwritespoem@gmail.com";
  const safeBuyerName = escapeHtml(buyerName);
  const safeBuyerEmail = escapeHtml(buyerEmail);
  const safeBookTitle = escapeHtml(bookTitle);
  const safePhone = escapeHtml(phone);
  const safeAddress = escapeHtml(`${address}, ${city}, ${state} - ${pincode}`);

  const orderRows = [
    ["Book", safeBookTitle],
    ["Buyer", safeBuyerName],
    ["Email", safeBuyerEmail],
    ["Phone", safePhone],
    ["Address", safeAddress],
    ["Copies", String(copies)],
    ["Subtotal", `₹${subtotal.toLocaleString("en-IN")}`],
    ["Shipping", `₹${shippingAmount.toLocaleString("en-IN")}`],
    ["Total", `₹${totalAmount.toLocaleString("en-IN")}`],
    ["Order ID", escapeHtml(orderId)],
  ];

  const orderTable = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 22px 0; font-size: 14px;">
      ${orderRows
        .map(
          ([label, value]) => `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; width: 34%; vertical-align: top;">${label}</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 600; vertical-align: top; text-align: right;">${value}</td>
            </tr>
          `,
        )
        .join("")}
    </table>
  `;

  const supportFooter = `
    <div style="margin-top: 22px; padding-top: 18px; border-top: 1px solid #e5e7eb; color: #4b5563; font-size: 13px; line-height: 1.6;">
      <p style="margin: 0 0 6px;">If you have any questions, reach out at <a href="mailto:${supportEmail}" style="color: #111827; text-decoration: underline;">${supportEmail}</a>.</p>
      <p style="margin: 0;">We will verify your payment and update you soon.</p>
    </div>
  `;
  // Email to buyer
  await mailer.sendMail({
    from: FROM_EMAIL,
    to: buyerEmail,
    subject: `Order Received — ${bookTitle}`,
    replyTo: FROM_EMAIL,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 16px; color: #111827;">
        <h2 style="margin: 0 0 12px; font-size: 24px;">Thank you, ${safeBuyerName}!</h2>
        <p style="margin: 0; color: #4b5563;">Your order for <strong>${safeBookTitle}</strong> has been received.</p>
        ${orderTable}
        ${supportFooter}
        <p style="margin-top: 22px; color: #9ca3af; font-size: 13px;">— Renu Writes Poem</p>
      </div>
    `,
  });

  // Email to admin
  if (ADMIN_EMAIL) {
    await mailer.sendMail({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Book Order — ${bookTitle} × ${copies}`,
      replyTo: buyerEmail,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 16px; color: #111827;">
          <h2 style="margin: 0 0 12px; font-size: 24px;">New Order Received</h2>
          <p style="margin: 0; color: #4b5563;">A new book order has been placed and is awaiting review.</p>
          ${orderTable}
          ${supportFooter}
          <p style="margin-top: 22px; color: #9ca3af; font-size: 13px;">Check the admin panel to review and confirm.</p>
        </div>
      `,
    });

    return { buyerSent: true, adminSent: true };
  }

  return { buyerSent: true, adminSent: false };
}

export async function sendContactMessage({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const mailer = getMailer();
  if (!mailer || !FROM_EMAIL || !ADMIN_EMAIL) {
    throw new Error("Contact email is not configured.");
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");

  await mailer.sendMail({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    replyTo: email,
    subject: `Website message — ${subject}`,
    text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 16px; color: #111827;">
        <h2 style="margin: 0 0 18px; font-size: 24px;">New website message</h2>
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 9px 0; color: #6b7280; width: 25%;">From</td><td style="padding: 9px 0; font-weight: 600;">${safeName}</td></tr>
          <tr><td style="padding: 9px 0; color: #6b7280;">Email</td><td style="padding: 9px 0;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
          <tr><td style="padding: 9px 0; color: #6b7280;">Subject</td><td style="padding: 9px 0; font-weight: 600;">${safeSubject}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 18px; border-radius: 12px; background: #f3f4f6; line-height: 1.65;">${safeMessage}</div>
        <p style="margin-top: 18px; color: #6b7280; font-size: 13px;">Reply to this email to respond directly to ${safeName}.</p>
      </div>
    `,
  });
}
