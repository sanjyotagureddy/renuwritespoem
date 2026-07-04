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
const SUPPORT_EMAIL = ADMIN_EMAIL || FROM_EMAIL || "renuwritespoem@gmail.com";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatInr(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

function cleanSubjectPart(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function emailShell({
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
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; background:linear-gradient(180deg,#fff7ed 0%,#ffffff 48%,#fdf2f8 100%);">
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
                <td style="overflow:hidden; border:1px solid #f1d5c6; border-radius:28px; background:#ffffff; box-shadow:0 24px 70px rgba(124,45,18,0.12);">
                  <div style="padding:34px 28px 30px; background:#fff7ed; background-image:linear-gradient(135deg,#fff7ed 0%,#ffedd5 55%,#fce7f3 100%); color:#431407; text-align:center;">
                    <p style="margin:0 0 12px; color:#9a3412; font-family:Arial,sans-serif; font-size:12px; font-weight:800; letter-spacing:2px; text-transform:uppercase;">${eyebrow}</p>
                    ${badge ? `<div style="display:inline-block; margin:0 0 14px; padding:7px 13px; border-radius:999px; background:#7c2d12; color:#ffffff; font-family:Arial,sans-serif; font-size:12px; font-weight:800;">${badge}</div>` : ""}
                    <h1 style="margin:0; color:#431407; font-family:Georgia,'Times New Roman',serif; font-size:34px; line-height:1.18; letter-spacing:-0.5px;">${title}</h1>
                    ${subtitle ? `<p style="margin:16px auto 0; max-width:520px; color:#5f2411; font-family:Arial,sans-serif; font-size:15px; line-height:1.7;">${subtitle}</p>` : ""}
                  </div>
                  <div style="padding:28px; font-family:Arial,sans-serif; color:#1f2937; font-size:15px; line-height:1.7;">
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

function detailTable(rows: Array<[string, string]>): string {
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

function callout({
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

function buttonLink(label: string, href: string): string {
  return `
    <p style="margin:18px 0 0;">
      <a href="${href}" style="display:inline-block; padding:12px 18px; border-radius:999px; background:#7c2d12; color:#ffffff; font-family:Arial,sans-serif; font-size:14px; font-weight:800; text-decoration:none;">${label}</a>
    </p>
  `;
}

function orderSupportBlock(orderId: string): string {
  return callout({
    tone: "blue",
    title: "Need to contact us about this order?",
    body: `Reply to this email or write to <a href="mailto:${escapeHtml(
      SUPPORT_EMAIL,
    )}" style="color:#1e3a8a; font-weight:800; text-decoration:none;">${escapeHtml(
      SUPPORT_EMAIL,
    )}</a>. Please include your Order ID: <strong>${orderId}</strong>.`,
  });
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

  const safeBuyerName = escapeHtml(buyerName);
  const safeBuyerEmail = escapeHtml(buyerEmail);
  const safeBookTitle = escapeHtml(bookTitle);
  const safePhone = escapeHtml(phone);
  const safeAddress = escapeHtml(`${address}, ${city}, ${state} - ${pincode}`);

  const orderTable = detailTable([
    ["Book", safeBookTitle],
    ["Buyer", safeBuyerName],
    ["Email", safeBuyerEmail],
    ["Phone", safePhone],
    ["Address", safeAddress],
    ["Copies", String(copies)],
    ["Subtotal", formatInr(subtotal)],
    ["Shipping", formatInr(shippingAmount)],
    ["Total", formatInr(totalAmount)],
    ["Order ID", escapeHtml(orderId)],
  ]);

  await mailer.sendMail({
    from: FROM_EMAIL,
    to: buyerEmail,
    subject: `Thank you for your order — ${bookTitle}`,
    replyTo: FROM_EMAIL,
    text: `Thank you for choosing Renu Writes Poem, ${buyerName}!

We are delighted that ${bookTitle} will soon find a place with you. Your order has been received and is awaiting payment verification.

Once the payment screenshot is reviewed, we will send you a confirmation email. You will receive another update with tracking details when your book is shipped.

Order ID: ${orderId}
Book: ${bookTitle}
Copies: ${copies}
Total: ${formatInr(totalAmount)}

If you contact us about this order, please include Order ID: ${orderId}.

With gratitude,
Renu Writes Poem`,
    html: emailShell({
      eyebrow: "Order received",
      badge: "Awaiting payment verification",
      title: `Thank you, ${safeBuyerName}!`,
      subtitle: `We are delighted that <strong style="color:#ffffff;">${safeBookTitle}</strong> will soon find a place with you.`,
      children: `
        <p style="margin:0 0 14px;">Your order has been received. Before we prepare the shipment, we will manually verify your payment screenshot.</p>
        ${callout({
          tone: "warm",
          title: "What happens next?",
          body: "Once payment is verified, you will receive a confirmation email. When the book ships, we will send the courier name and tracking details.",
        })}
        ${orderTable}
        ${orderSupportBlock(escapeHtml(orderId))}
      `,
    }),
  });

  if (ADMIN_EMAIL) {
    await mailer.sendMail({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Book Order — ${bookTitle} × ${copies}`,
      replyTo: buyerEmail,
      text: `New order received\n\nBuyer: ${buyerName}\nEmail: ${buyerEmail}\nBook: ${bookTitle}\nCopies: ${copies}\nTotal: ${formatInr(totalAmount)}\nOrder ID: ${orderId}`,
      html: emailShell({
        eyebrow: "Admin notice",
        badge: "New pending order",
        title: "New order received",
        subtitle: "A buyer placed an order. Please review the payment screenshot before confirming.",
        children: `
          ${callout({
            tone: "blue",
            title: "Action needed",
            body: "Open the admin orders page, verify the payment screenshot, then mark the order as confirmed or rejected.",
          })}
          ${orderTable}
        `,
      }),
    });

    return { buyerSent: true, adminSent: true };
  }

  return { buyerSent: true, adminSent: false };
}

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
      eyebrow: "Order confirmed",
      badge: "Payment verified",
      heading: "Your order is confirmed",
      tone: "green" as const,
      message:
        "We have verified your payment and your order is now being prepared with care.",
    },
    SHIPPED: {
      subject: "Your order has shipped",
      eyebrow: "Shipping update",
      badge: "On the way",
      heading: "Your book is on the way",
      tone: "purple" as const,
      message: "Your order has been handed to the delivery provider.",
    },
    DELIVERED: {
      subject: "Your order was delivered",
      eyebrow: "Delivery update",
      badge: "Delivered",
      heading: "Order delivered",
      tone: "green" as const,
      message:
        "Your order has been marked as delivered. We hope the book brings a quiet, beautiful moment to your day.",
    },
    REJECTED: {
      subject: "Update about your order",
      eyebrow: "Order update",
      badge: "Needs attention",
      heading: "We could not confirm your order",
      tone: "rose" as const,
      message:
        "We were unable to verify the payment for this order. Please reply to this email if you need help or want to share corrected payment details.",
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
        ${detailTable([
          ["Delivery provider", safeProvider],
          ["Tracking number", safeNumber],
          ...(safeTrackingUrl
            ? ([
                [
                  "Tracking link",
                  `<a href="${safeTrackingUrl}" style="color:#7c2d12; font-weight:800; text-decoration:none;">Open tracking ↗</a>`,
                ],
              ] as Array<[string, string]>)
            : []),
        ])}
        ${safeTrackingUrl ? buttonLink("Track your order", safeTrackingUrl) : ""}
      `
      : "";

  await mailer.sendMail({
    from: FROM_EMAIL,
    to: buyerEmail,
    replyTo: FROM_EMAIL,
    subject: `${statusCopy.subject} — Order ${orderId} — ${bookTitle}`,
    text: `${statusCopy.heading}

Hi ${buyerName},
${statusCopy.message}

Book: ${bookTitle}
Order ID: ${orderId}${trackingProvider ? `\nProvider: ${trackingProvider}` : ""}${trackingNumber ? `\nTracking: ${trackingNumber}` : ""}${trackingUrl ? `\nTrack: ${trackingUrl}` : ""}${note ? `\n\nNote: ${note}` : ""}

If you contact us about this order, please include Order ID: ${orderId}.

With gratitude,
Renu Writes Poem`,
    html: emailShell({
      eyebrow: statusCopy.eyebrow,
      badge: statusCopy.badge,
      title: statusCopy.heading,
      subtitle: `Hi ${safeName}, ${statusCopy.message}`,
      children: `
        ${callout({
          tone: statusCopy.tone,
          title: statusCopy.heading,
          body: statusCopy.message,
        })}
        ${detailTable([
          ["Book", safeBook],
          ["Order ID", safeOrderId],
        ])}
        ${trackingBlock}
        ${safeNote ? callout({ tone: "warm", title: "A note from us", body: safeNote }) : ""}
        ${orderSupportBlock(safeOrderId)}
      `,
    }),
  });
}
