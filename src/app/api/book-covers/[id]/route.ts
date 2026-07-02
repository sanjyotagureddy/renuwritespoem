import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const prisma = getPrisma();

  const book = await prisma.book.findUnique({
    where: { id },
    select: { coverData: true, coverMime: true },
  });

  if (!book?.coverData || !book.coverMime) {
    return new NextResponse(null, { status: 404 });
  }

  const buffer = Buffer.from(book.coverData, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": book.coverMime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
