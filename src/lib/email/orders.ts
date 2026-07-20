import {
  getMailer,
  FROM_EMAIL,
  ADMIN_EMAIL,
  SUPPORT_EMAIL,
  escapeHtml,
  formatInr,
  emailShell,
  detailTable,
  callout,
  buttonLink,
} from "./shell";

export function orderSupportBlock(orderId: string): string {
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
    text: `Thank you for choosing Renu Writes Poem, ${buyerName}!\n\nWe are delighted that ${bookTitle} will soon find a place with you. Your order has been received and is awaiting payment verification.\n\nOnce the payment screenshot is reviewed, we will send you a confirmation email. You will receive another update with tracking details when your book is shipped.\n\nOrder ID: ${orderId}\nBook: ${bookTitle}\nCopies: ${copies}\nTotal: ${formatInr(totalAmount)}\n\nIf you contact us about this order, please include Order ID: ${orderId}.\n\nWith gratitude,\nRenu Writes Poem`,
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
    text: `${statusCopy.heading}\r\n\r\nHi ${buyerName},\r\n${statusCopy.message}\r\n\r\nBook: ${bookTitle}\r\nOrder ID: ${orderId}${trackingProvider ? `\r\nProvider: ${trackingProvider}` : ""}${trackingNumber ? `\r\nTracking: ${trackingNumber}` : ""}${trackingUrl ? `\r\nTrack: ${trackingUrl}` : ""}${note ? `\r\n\r\nNote: ${note}` : ""}\r\n\r\nIf you contact us about this order, please include Order ID: ${orderId}.\r\n\r\nWith gratitude,\r\nRenu Writes Poem`,
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
