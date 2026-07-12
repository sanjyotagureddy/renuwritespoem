"use server";

import { getPrisma } from "@/lib/db";

export async function lookupOrder(orderIdOrNumber: string, email: string) {
  const cleanInput = orderIdOrNumber.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanInput || !cleanEmail) {
    throw new Error("Order ID/Number and Email address are required.");
  }

  const prisma = getPrisma();

  // Find order by matching ID or Order Number, and email
  const order = await prisma.bookOrder.findFirst({
    where: {
      OR: [
        { id: cleanInput },
        { orderNumber: cleanInput },
        { orderNumber: `#${cleanInput}` }
      ],
      email: { equals: cleanEmail, mode: "insensitive" }
    },
    include: {
      book: {
        select: {
          title: true,
          coverImage: true,
        }
      }
    }
  });

  if (!order) {
    throw new Error("No order found matching those details. Please check your order reference and email.");
  }

  // Map to a clean, serializable object to avoid returning raw Decimal / DB classes
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    name: order.name,
    email: order.email,
    phone: order.phone,
    address: order.address,
    city: order.city,
    state: order.state,
    pincode: order.pincode,
    copies: order.copies,
    shippingAmount: Number(order.shippingAmount),
    totalAmount: Number(order.totalAmount),
    status: order.status,
    adminNote: order.adminNote,
    trackingProvider: order.trackingProvider,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    createdAt: order.createdAt.toISOString(),
    book: {
      title: order.book.title,
      coverImage: order.book.coverImage,
    }
  };
}
