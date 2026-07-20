"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { sendOrderStatusUpdate } from "@/lib/email";
import { requireAdmin } from "./shared-actions";

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const trackingProvider = String(
    formData.get("trackingProvider") ?? "",
  ).trim();
  const trackingNumber = String(formData.get("trackingNumber") ?? "").trim();
  const trackingUrl = String(formData.get("trackingUrl") ?? "").trim();
  const adminNote = String(formData.get("adminNote") ?? "").trim();

  if (!id || !status) throw new Error("Order ID and status are required.");

  const validStatuses = [
    "PENDING",
    "CONFIRMED",
    "SHIPPED",
    "DELIVERED",
    "REJECTED",
  ];
  if (!validStatuses.includes(status)) throw new Error("Invalid status.");
  if (
    trackingProvider.length > 100 ||
    trackingNumber.length > 150 ||
    trackingUrl.length > 500 ||
    adminNote.length > 1000
  ) {
    throw new Error("One or more order update fields are too long.");
  }
  if (trackingUrl && !/^https?:\/\//i.test(trackingUrl)) {
    throw new Error("Tracking URL must start with http:// or https://.");
  }
  if (status === "SHIPPED" && (!trackingProvider || !trackingNumber)) {
    throw new Error(
      "Delivery provider and tracking number are required when shipping an order.",
    );
  }

  const prisma = getPrisma();
  const existing = await prisma.bookOrder.findUnique({
    where: { id },
    include: { book: { select: { title: true } } },
  });
  if (!existing) throw new Error("Order not found.");
  if (
    status === "SHIPPED" &&
    existing.status !== "CONFIRMED" &&
    existing.status !== "SHIPPED"
  ) {
    throw new Error("Confirm payment before marking an order as shipped.");
  }
  if (
    status === "DELIVERED" &&
    existing.status !== "SHIPPED" &&
    existing.status !== "DELIVERED"
  ) {
    throw new Error("An order must be shipped before it can be delivered.");
  }

  const updated = await prisma.bookOrder.update({
    where: { id },
    data: {
      status: status as
        "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "REJECTED",
      adminNote: adminNote || null,
      trackingProvider: trackingProvider || null,
      trackingNumber: trackingNumber || null,
      trackingUrl: trackingUrl || null,
    },
  });

  const statusChanged = existing.status !== updated.status;
  const noteChanged = (existing.adminNote ?? "") !== (updated.adminNote ?? "");
  let emailSent = false;
  let emailError: string | null = null;

  if ((statusChanged || noteChanged) && updated.status !== "PENDING") {
    try {
      await sendOrderStatusUpdate({
        buyerEmail: updated.email,
        buyerName: updated.name,
        bookTitle: existing.book.title,
        orderId: updated.orderNumber ?? updated.id,
        status: updated.status,
        trackingProvider: updated.trackingProvider,
        trackingNumber: updated.trackingNumber,
        trackingUrl: updated.trackingUrl,
        note: updated.adminNote,
      });
      emailSent = true;
    } catch (error) {
      console.error("Order status email failed:", error);
      emailError = error instanceof Error ? error.message : String(error);
    }
  }

  revalidatePath("/admin/orders");

  return {
    success: true,
    statusChanged,
    noteChanged,
    emailSent,
    emailError,
  };
}
