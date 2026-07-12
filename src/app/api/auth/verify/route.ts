import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { siteConfig } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const token = searchParams.get("token");

    if (!email || !token) {
      return NextResponse.redirect(`${siteConfig.url}/login?error=VerificationMissing`);
    }

    const prisma = getPrisma();

    // Check if verification token exists and is valid
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token }
    });

    if (
      !verificationToken ||
      verificationToken.email.toLowerCase() !== email.toLowerCase() ||
      verificationToken.expires < new Date()
    ) {
      return NextResponse.redirect(`${siteConfig.url}/login?error=VerificationExpired`);
    }

    // Mark email as verified and delete token
    await prisma.$transaction([
      prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { emailVerified: new Date() }
      }),
      prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id }
      })
    ]);

    return NextResponse.redirect(`${siteConfig.url}/login?verified=true`);
  } catch (err) {
    console.error("Account verification error:", err);
    return NextResponse.redirect(`${siteConfig.url}/login?error=VerificationError`);
  }
}
