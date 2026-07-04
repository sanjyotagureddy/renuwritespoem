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
    subject: `Thank you for your order — ${bookTitle}`,
    replyTo: FROM_EMAIL,
    text: `Thank you for choosing Renu Writes Poem, ${buyerName}!

We are delighted that ${bookTitle} will soon find a place with you. Your order has been received and is currently awaiting payment verification.

Once the payment screenshot is reviewed, we will send you a confirmation email. You will receive another update with tracking details when your book is shipped.

Order ID: ${orderId}
Book: ${bookTitle}
Copies: ${copies}
Total: ₹${totalAmount.toLocaleString("en-IN")}

With gratitude,
Renu Writes Poem`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 16px; color: #111827;">
        <div style="padding: 28px 24px; border-radius: 18px; background: #111827; color: #ffffff; text-align: center;">
          <p style="margin: 0 0 8px; color: #fbbf24; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Renu Writes Poem</p>
          <h2 style="margin: 0 0 12px; font-family: Georgia, serif; font-size: 28px;">Thank you, ${safeBuyerName}!</h2>
          <p style="margin: 0; color: #d1d5db; line-height: 1.65;">We are delighted that <strong style="color: #ffffff;">${safeBookTitle}</strong> will soon find a place with you.</p>
        </div>
        <div style="padding: 24px 4px 0;">
          <p style="margin: 0 0 12px; color: #4b5563; line-height: 1.7;">Your order has been received and is currently awaiting payment verification.</p>
          <div style="margin: 18px 0; padding: 16px 18px; border-left: 3px solid #f59e0b; background: #fffbeb; color: #78350f; line-height: 1.6;">
            <strong>What happens next?</strong><br />We will review your payment screenshot and email you once the order is confirmed. When your book ships, you will receive the delivery provider and tracking details.
          </div>
        </div>
        ${orderTable}
        ${supportFooter}
        <p style="margin-top: 22px; color: #6b7280; font-family: Georgia, serif; font-size: 15px; font-style: italic;">With gratitude,<br />Renu Writes Poem</p>
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

export async function sendOrderStatusUpdate({
  buyerEmail,
  buyerName,
  bookTitle,
  orderId,
  status,
  trackingProvider,
  trackingNumber,
  trackingUrl,
  note,
}: {
  buyerEmail: string;
  buyerName: string;
  bookTitle: string;
  orderId: string;
  status: "CONFIRMED" | "SHIPPED" | "DELIVERED" | "REJECTED";
  trackingProvider?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  note?: string | null;
}): Promise<void> {
  const mailer = getMailer();
  if (!mailer || !FROM_EMAIL) throw new Error("Order email is not configured.");

  const statusCopy = {
    CONFIRMED: {
      subject: "Payment verified — order confirmed",
      heading: "Your order is confirmed",
      message:
        "We have verified your payment and your order is now being prepared.",
    },
    SHIPPED: {
      subject: "Your order has shipped",
      heading: "Your book is on the way",
      message: "Your order has been handed to the delivery provider.",
    },
    DELIVERED: {
      subject: "Your order was delivered",
      heading: "Order delivered",
      message:
        "Your order has been marked as delivered. We hope you enjoy the book.",
    },
    REJECTED: {
      subject: "Update about your order",
      heading: "We could not confirm your order",
      message:
        "We were unable to verify the payment for this order. Please reply if you need help.",
    },
  }[status];

  const safeName = escapeHtml(buyerName);
  const safeBook = escapeHtml(bookTitle);
  const safeOrderId = escapeHtml(orderId);
  const safeProvider = trackingProvider ? escapeHtml(trackingProvider) : "";
  const safeNumber = trackingNumber ? escapeHtml(trackingNumber) : "";
  const safeNote = note ? escapeHtml(note).replaceAll("\n", "<br />") : "";
  const safeTrackingUrl =
    trackingUrl && /^https?:\/\//i.test(trackingUrl)
      ? escapeHtml(trackingUrl)
      : "";

  const trackingBlock =
    status === "SHIPPED"
      ? `
    <div style="margin: 20px 0; padding: 18px; border-radius: 12px; background: #f3f4f6;">
      <p style="margin: 0 0 8px;"><strong>Delivery provider:</strong> ${safeProvider}</p>
      <p style="margin: 0;"><strong>Tracking number:</strong> ${safeNumber}</p>
      ${safeTrackingUrl ? `<p style="margin: 14px 0 0;"><a href="${safeTrackingUrl}" style="display: inline-block; padding: 10px 16px; border-radius: 999px; background: #111827; color: #ffffff; text-decoration: none;">Track your order</a></p>` : ""}
    </div>
  `
      : "";

  await mailer.sendMail({
    from: FROM_EMAIL,
    to: buyerEmail,
    replyTo: FROM_EMAIL,
    subject: `${statusCopy.subject} — ${bookTitle}`,
    text: `${statusCopy.heading}\n\nHi ${buyerName},\n${statusCopy.message}\nBook: ${bookTitle}\nOrder ID: ${orderId}${trackingProvider ? `\nProvider: ${trackingProvider}` : ""}${trackingNumber ? `\nTracking: ${trackingNumber}` : ""}${trackingUrl ? `\nTrack: ${trackingUrl}` : ""}${note ? `\n\nNote: ${note}` : ""}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 16px; color: #111827;">
        <h2 style="margin: 0 0 12px; font-size: 24px;">${statusCopy.heading}</h2>
        <p>Hi ${safeName},</p>
        <p style="color: #4b5563; line-height: 1.6;">${statusCopy.message}</p>
        <p><strong>Book:</strong> ${safeBook}<br /><strong>Order ID:</strong> ${safeOrderId}</p>
        ${trackingBlock}
        ${safeNote ? `<div style="margin-top: 18px; padding: 14px; border-left: 3px solid #d1d5db; color: #4b5563;">${safeNote}</div>` : ""}
        <p style="margin-top: 24px; color: #9ca3af; font-size: 13px;">— Renu Writes Poem</p>
      </div>
    `,
  });
}
