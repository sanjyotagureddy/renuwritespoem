import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing book ID" }, { status: 400 });
    }

    const prisma = getPrisma();

    // Increment views count in database
    await prisma.book.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to increment views:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
