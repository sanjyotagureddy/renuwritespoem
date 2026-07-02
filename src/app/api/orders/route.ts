import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";

const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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
  const copies = Math.max(1, parseInt(String(formData.get("copies") ?? "1"), 10) || 1);
  const screenshot = formData.get("paymentScreenshot") as File | null;

  // Validate required fields
  if (!bookId || !name || !email || !phone || !address || !city || !state || !pincode) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: "Pincode must be 6 digits." }, { status: 400 });
  }

  if (copies > 50) {
    return NextResponse.json({ error: "Maximum 50 copies per order." }, { status: 400 });
  }

  if (!screenshot || screenshot.size === 0) {
    return NextResponse.json({ error: "Payment screenshot is required to place the order." }, { status: 400 });
  }

  const prisma = getPrisma();
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true, title: true, price: true, discountedPrice: true, shippingCharge: true, status: true },
  });

  if (!book || book.status !== "AVAILABLE") {
    return NextResponse.json({ error: "Book is not available for purchase." }, { status: 400 });
  }

  if (!book.price || book.price <= 0) {
    return NextResponse.json({ error: "Book price is not set." }, { status: 400 });
  }

  const shippingCharge = book.shippingCharge ?? 0;
  const payablePrice = book.discountedPrice && book.discountedPrice > 0 && book.discountedPrice < book.price
    ? book.discountedPrice
    : book.price;
  const subtotal = payablePrice * copies;
  const totalAmount = subtotal + shippingCharge;

  // Process payment screenshot
  let paymentData: string | null = null;
  let paymentMime: string | null = null;

  if (!ALLOWED_TYPES.has(screenshot.type)) {
    return NextResponse.json({ error: "Screenshot must be JPG, PNG, or WebP." }, { status: 400 });
  }
  if (screenshot.size > MAX_SCREENSHOT_SIZE) {
    return NextResponse.json({ error: "Screenshot must be under 5 MB." }, { status: 400 });
  }
  const buffer = Buffer.from(await screenshot.arrayBuffer());
  paymentData = buffer.toString("base64");
  paymentMime = screenshot.type;

  const prismaAny: any = prisma;
  const order = await prismaAny["bookOrder"].create({
    data: {
      name,
      email,
      phone,
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

  return NextResponse.json({ orderId: order.id, totalAmount, buyerSent, adminSent });
}
