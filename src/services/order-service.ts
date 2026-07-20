import { put } from "@vercel/blob";
import { getPrisma } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";

export interface CreateOrderDTO {
  bookId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  copies: number;
  idempotencyKey: string;
}

const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export class OrderService {
  /**
   * Helper to validate image signatures
   */
  static hasValidImageSignature(buffer: Buffer, mime: string): boolean {
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

  static makeOrderNumber(): string {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `RWP-${yyyy}${mm}${dd}-${suffix}`;
  }

  static async createUniqueOrderNumber(
    prisma: ReturnType<typeof getPrisma>
  ): Promise<string> {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const orderNumber = this.makeOrderNumber();
      const existing = await prisma.bookOrder.findUnique({
        where: { orderNumber },
        select: { id: true },
      });
      if (!existing) return orderNumber;
    }

    throw new Error("Could not generate a unique order number.");
  }

  static async processScreenshot(screenshot: File) {
    if (!ALLOWED_TYPES.has(screenshot.type)) {
      throw new Error("Screenshot must be JPG, PNG, or WebP.");
    }
    if (screenshot.size > MAX_SCREENSHOT_SIZE) {
      throw new Error("Screenshot must be under 5 MB.");
    }
    const buffer = Buffer.from(await screenshot.arrayBuffer());
    if (!this.hasValidImageSignature(buffer, screenshot.type)) {
      throw new Error("The uploaded file is not a valid image.");
    }

    let paymentData: string | null = null;
    let paymentMime: string | null = null;
    let paymentUrl: string | null = null;

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

    return { paymentData, paymentMime, paymentUrl };
  }

  static async createOrder(dto: CreateOrderDTO, screenshot: File) {
    const prisma = getPrisma();
    
    // 1. Idempotency Check
    const existingOrder = await prisma.bookOrder.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
      select: { id: true, orderNumber: true, totalAmount: true },
    });
    
    if (existingOrder) {
      return {
        duplicate: true,
        orderId: existingOrder.orderNumber ?? existingOrder.id,
        totalAmount: existingOrder.totalAmount,
        buyerSent: false,
        adminSent: false,
      };
    }

    // 2. Fetch and Validate Book
    const book = await prisma.book.findUnique({
      where: { id: dto.bookId },
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
      throw new Error("Book is not available for purchase.");
    }

    const price = book.price ? Number(book.price) : 0;
    if (price <= 0) {
      throw new Error("Book price is not set.");
    }

    const shippingCharge = Number(book.shippingCharge ?? 0);
    const discount = book.discountedPrice ? Number(book.discountedPrice) : null;
    const payablePrice =
      discount && discount > 0 && discount < price ? discount : price;
    const subtotal = payablePrice * dto.copies;
    const totalAmount = subtotal + shippingCharge;

    // 3. Process Upload
    const { paymentData, paymentMime, paymentUrl } = await this.processScreenshot(screenshot);

    // 4. Create Order
    const normalizedPhone = dto.phone.replace(/[\s()-]/g, "");
    const orderNumber = await this.createUniqueOrderNumber(prisma);

    const order = await prisma.bookOrder.create({
      data: {
        orderNumber,
        idempotencyKey: dto.idempotencyKey,
        name: dto.name,
        email: dto.email,
        phone: normalizedPhone,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        copies: dto.copies,
        shippingAmount: shippingCharge,
        totalAmount,
        paymentData,
        paymentMime,
        paymentUrl,
        bookId: book.id,
      },
      select: { id: true, orderNumber: true },
    });

    // 5. Dispatch Email
    let buyerSent = false;
    let adminSent = false;
    try {
      const sendResult = await sendOrderConfirmation({
        buyerEmail: dto.email,
        buyerName: dto.name,
        bookTitle: book.title,
        phone: dto.phone,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        copies: dto.copies,
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

    return {
      duplicate: false,
      orderId: order.orderNumber ?? order.id,
      totalAmount,
      buyerSent,
      adminSent,
    };
  }
}
