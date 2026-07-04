import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";

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

export async function POST(request: Request) {
  const formData = await request.formData();

  const bookId = String(formData.get("bookId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const pincode = String(formData.get("pincode") ?? "").trim();
  const copies = Math.max(
    1,
    parseInt(String(formData.get("copies") ?? "1"), 10) || 1,
  );
  const screenshot = formData.get("paymentScreenshot") as File | null;
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "").trim();

  // Validate required fields
  if (
    !bookId ||
    !name ||
    !email ||
    !phone ||
    !address ||
    !city ||
    !state ||
    !pincode
  ) {
    return NextResponse.json(
      { error: "All fields are required." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address." },
      { status: 400 },
    );
  }

  const tooLong = Object.entries({
    name,
    email,
    phone,
    address,
    city,
    state,
  }).find(
    ([key, value]) =>
      value.length > MAX_LENGTHS[key as keyof typeof MAX_LENGTHS],
  );
  if (tooLong)
    return NextResponse.json(
      { error: `${tooLong[0]} is too long.` },
      { status: 400 },
    );

  const normalizedPhone = phone.replace(/[\s()-]/g, "");
  if (!/^(?:\+91)?[6-9]\d{9}$/.test(normalizedPhone)) {
    return NextResponse.json(
      { error: "Enter a valid Indian mobile number." },
      { status: 400 },
    );
  }

  if (!/^[0-9a-f-]{36}$/i.test(idempotencyKey)) {
    return NextResponse.json(
      { error: "Invalid order request. Please reopen the purchase form." },
      { status: 400 },
    );
  }

  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json(
      { error: "Pincode must be 6 digits." },
      { status: 400 },
    );
  }

  if (copies > 50) {
    return NextResponse.json(
      { error: "Maximum 50 copies per order." },
      { status: 400 },
    );
  }

  if (!screenshot || screenshot.size === 0) {
    return NextResponse.json(
      { error: "Payment screenshot is required to place the order." },
      { status: 400 },
    );
  }

  const prisma = getPrisma();
  const existingOrder = await prisma.bookOrder.findUnique({
    where: { idempotencyKey },
    select: { id: true, totalAmount: true },
  });
  if (existingOrder) {
    return NextResponse.json({
      orderId: existingOrder.id,
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
  paymentData = buffer.toString("base64");
  paymentMime = screenshot.type;

  const order = await prisma.bookOrder.create({
    data: {
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
      bookId: book.id,
    },
    select: { id: true },
  });

  // Send emails (don't block the response if it fails)
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
      orderId: order.id,
    });
    buyerSent = sendResult.buyerSent;
    adminSent = sendResult.adminSent;
  } catch (e) {
    console.error("Failed to send order email:", e);
  }

  return NextResponse.json({
    orderId: order.id,
    totalAmount,
    buyerSent,
    adminSent,
  });
}
