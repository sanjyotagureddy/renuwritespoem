import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getPrisma } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";
import { OrderSchema } from "@/lib/validations";

const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_LENGTHS = {
  name: 100,
  email: 254,
  phone: 15,
  address: 500,
  city: 100,
  state: 100,
} as const;

function hasValidImageSignature(buffer: Buffer, mime: string): boolean {
  if (mime === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8;
  if (mime === "image/png")
    return buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mime === "image/webp")
    return (
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  return false;
}

function makeOrderNumber(): string {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `RWP-${yyyy}${mm}${dd}-${suffix}`;
}

async function createUniqueOrderNumber(
  prisma: ReturnType<typeof getPrisma>,
): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const orderNumber = makeOrderNumber();
    const existing = await prisma.bookOrder.findUnique({
      where: { orderNumber },
      select: { id: true },
    });
    if (!existing) return orderNumber;
  }

  throw new Error("Could not generate a unique order number.");
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = OrderSchema.safeParse(formData);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 },
    );
  }

  const {
    bookId,
    name,
    email,
    phone,
    address,
    city,
    state,
    pincode,
    copies,
    idempotencyKey,
  } = parsed.data;

  const normalizedPhone = phone.replace(/[\s()-]/g, "");
  const screenshot = formData.get("paymentScreenshot") as File | null;

  if (!screenshot || screenshot.size === 0) {
    return NextResponse.json(
      { error: "Payment screenshot is required to place the order." },
      { status: 400 },
    );
  }

  const prisma = getPrisma();
  const existingOrder = await prisma.bookOrder.findUnique({
    where: { idempotencyKey },
    select: { id: true, orderNumber: true, totalAmount: true },
  });
  if (existingOrder) {
    return NextResponse.json({
      orderId: existingOrder.orderNumber ?? existingOrder.id,
      totalAmount: existingOrder.totalAmount,
      duplicate: true,
    });
  }
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: {
      id: true,
      title: true,
      price: true,
      discountedPrice: true,
      shippingCharge: true,
      status: true,
    },
  });

  if (!book || book.status !== "AVAILABLE") {
    return NextResponse.json(
      { error: "Book is not available for purchase." },
      { status: 400 },
    );
  }

  const price = book.price ? Number(book.price) : 0;
  if (price <= 0) {
    return NextResponse.json(
      { error: "Book price is not set." },
      { status: 400 },
    );
  }

  const shippingCharge = Number(book.shippingCharge ?? 0);
  const discount = book.discountedPrice ? Number(book.discountedPrice) : null;
  const payablePrice =
    discount && discount > 0 && discount < price ? discount : price;
  const subtotal = payablePrice * copies;
  const totalAmount = subtotal + shippingCharge;

  // Process payment screenshot
  let paymentData: string | null = null;
  let paymentMime: string | null = null;
  let paymentUrl: string | null = null;

  if (!ALLOWED_TYPES.has(screenshot.type)) {
    return NextResponse.json(
      { error: "Screenshot must be JPG, PNG, or WebP." },
      { status: 400 },
    );
  }
  if (screenshot.size > MAX_SCREENSHOT_SIZE) {
    return NextResponse.json(
      { error: "Screenshot must be under 5 MB." },
      { status: 400 },
    );
  }
  const buffer = Buffer.from(await screenshot.arrayBuffer());
  if (!hasValidImageSignature(buffer, screenshot.type)) {
    return NextResponse.json(
      { error: "The uploaded file is not a valid image." },
      { status: 400 },
    );
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const ext = screenshot.type.split("/")[1] || "png";
      const screenshotBlob = await put(`orders/payment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`, screenshot, {
        access: "public",
      });
      paymentUrl = screenshotBlob.url;
    } catch (err) {
      console.error("Vercel Blob screenshot upload failed, falling back to base64 DB:", err);
      paymentData = buffer.toString("base64");
      paymentMime = screenshot.type;
    }
  } else {
    paymentData = buffer.toString("base64");
    paymentMime = screenshot.type;
  }

  const orderNumber = await createUniqueOrderNumber(prisma);

  const order = await prisma.bookOrder.create({
    data: {
      orderNumber,
      idempotencyKey,
      name,
      email,
      phone: normalizedPhone,
      address,
      city,
      state,
      pincode,
      copies,
      shippingAmount: shippingCharge,
      totalAmount,
      paymentData,
      paymentMime,
      paymentUrl,
      bookId: book.id,
    },
    select: { id: true, orderNumber: true },
  });
  let buyerSent = false;
  let adminSent = false;
  try {
    const sendResult = await sendOrderConfirmation({
      buyerEmail: email,
      buyerName: name,
      bookTitle: book.title,
      phone,
      address,
      city,
      state,
      pincode,
      copies,
      shippingAmount: shippingCharge,
      subtotal,
      totalAmount,
      orderId: order.orderNumber ?? order.id,
    });
    buyerSent = sendResult.buyerSent;
    adminSent = sendResult.adminSent;
  } catch (e) {
    console.error("Failed to send order email:", e);
  }

  return NextResponse.json({
    orderId: order.orderNumber ?? order.id,
    totalAmount,
    buyerSent,
    adminSent,
  });
}
