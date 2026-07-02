import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY is not set. Emails will not be sent.");
    return null;
  }
  return new Resend(key);
}

const FROM_EMAIL = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
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
  const resend = getResend();
  if (!resend) return { buyerSent: false, adminSent: false };

  if (FROM_EMAIL.includes("onboarding@resend.dev")) {
    console.warn("FROM_EMAIL is using onboarding@resend.dev. Verify a production sender domain in Resend for reliable delivery.");
  }

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
  const buyerResult = await resend.emails.send({
    from: FROM_EMAIL,
    to: buyerEmail,
    subject: `Order Received — ${bookTitle}`,
    replyTo: supportEmail,
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

  if (buyerResult.error) {
    throw new Error(`Buyer email failed: ${buyerResult.error.message}`);
  }

  // Email to admin
  if (ADMIN_EMAIL) {
    const adminResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Book Order — ${bookTitle} × ${copies}`,
      replyTo: supportEmail,
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

    if (adminResult.error) {
      throw new Error(`Admin email failed: ${adminResult.error.message}`);
    }

    return { buyerSent: true, adminSent: true };
  }

  return { buyerSent: true, adminSent: false };
}
