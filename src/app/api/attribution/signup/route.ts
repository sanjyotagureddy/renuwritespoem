import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getPrisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { source } = await request.json();
    if (!source || typeof source !== "string") {
      return NextResponse.json({ error: "Invalid source parameter" }, { status: 400 });
    }

    const prisma = getPrisma();

    // Check if the user already has a signUpSource set
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { signUpSource: true },
    });

    if (user && !user.signUpSource) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          signUpSource: source.toLowerCase().slice(0, 50),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update user signup attribution:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
