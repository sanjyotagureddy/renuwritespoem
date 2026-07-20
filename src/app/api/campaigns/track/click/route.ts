import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const limitCheck = await rateLimit("campaign-click", 60, 60000); // 60 per minute
  if (limitCheck.limited) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const { searchParams } = new URL(request.url);
  const deliveryId = searchParams.get("d");
  const targetUrl = searchParams.get("url");

  if (!deliveryId || !targetUrl) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Validate that the redirect target is same-origin to prevent open-redirect phishing
  const siteOrigin = new URL(siteUrl).origin;
  let parsedTarget: URL;
  try {
    parsedTarget = new URL(targetUrl, siteUrl);
  } catch {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (parsedTarget.origin !== siteOrigin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const prisma = getPrisma();

    // Verify campaign delivery exists before recording click
    const delivery = await prisma.campaignDelivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    await prisma.campaignClick.create({
      data: {
        deliveryId,
        url: targetUrl,
      },
    });
  } catch (error) {
    console.error("Failed to track campaign link click:", error);
  }

  // Perform temporary 302 redirect to the validated destination URL
  return NextResponse.redirect(parsedTarget);
}
