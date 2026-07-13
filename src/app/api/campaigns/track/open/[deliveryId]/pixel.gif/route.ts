import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

// Transparent 1x1 GIF Base64
const PIXEL_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

type RouteParams = {
  params: Promise<{ deliveryId: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { deliveryId } = await params;
    const prisma = getPrisma();

    // Verify delivery exists
    const delivery = await prisma.campaignDelivery.findUnique({
      where: { id: deliveryId },
    });

    if (delivery) {
      await prisma.campaignDelivery.update({
        where: { id: deliveryId },
        data: {
          openedAt: delivery.openedAt ?? new Date(),
          openCount: { increment: 1 },
        },
      });
    }
  } catch (error) {
    console.error("Failed to track email open:", error);
  }

  // Return transparent 1x1 pixel image with headers disabling cache
  return new NextResponse(PIXEL_GIF, {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
