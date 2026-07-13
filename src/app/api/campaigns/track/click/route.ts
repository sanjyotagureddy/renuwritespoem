import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deliveryId = searchParams.get("d");
  const targetUrl = searchParams.get("url");

  if (!deliveryId || !targetUrl) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const prisma = getPrisma();

    // Verify campaign delivery exists
    const delivery = await prisma.campaignDelivery.findUnique({
      where: { id: deliveryId },
    });

    if (delivery) {
      await prisma.campaignClick.create({
        data: {
          deliveryId,
          url: targetUrl,
        },
      });
    }
  } catch (error) {
    console.error("Failed to track campaign link click:", error);
  }

  // Perform temporary 302 redirect to the destination URL
  try {
    return NextResponse.redirect(new URL(targetUrl));
  } catch {
    try {
      return NextResponse.redirect(new URL(targetUrl, request.url));
    } catch {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
}
