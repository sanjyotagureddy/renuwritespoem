import { NextResponse } from "next/server";
import { OrderSchema } from "@/lib/validations";
import { OrderService } from "@/services/order-service";

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = OrderSchema.safeParse(formData);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const screenshot = formData.get("paymentScreenshot") as File | null;

  if (!screenshot || screenshot.size === 0) {
    return NextResponse.json(
      { error: "Payment screenshot is required to place the order." },
      { status: 400 },
    );
  }

  try {
    const result = await OrderService.createOrder(parsed.data, screenshot);

    if (result.duplicate) {
      return NextResponse.json({
        orderId: result.orderId,
        totalAmount: result.totalAmount,
        duplicate: true,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 400 }
    );
  }
}
