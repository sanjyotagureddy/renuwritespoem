import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerAuthSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse(null, { status: 403 });
  }

  const { id } = await params;
  const prisma = getPrisma();

  const order = await prisma.bookOrder.findUnique({
    where: { id },
    select: { paymentData: true, paymentMime: true, paymentUrl: true },
  });

  if (!order) {
    return new NextResponse(null, { status: 404 });
  }

  if (order.paymentUrl && order.paymentUrl.startsWith("http")) {
    return NextResponse.redirect(order.paymentUrl);
  }

  if (!order.paymentData || !order.paymentMime) {
    return new NextResponse(null, { status: 404 });
  }

  const buffer = Buffer.from(order.paymentData, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": order.paymentMime,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
