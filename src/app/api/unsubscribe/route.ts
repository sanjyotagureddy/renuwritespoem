import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { createHmac } from "crypto";

function getUnsubscribeToken(email: string): string {
  const secret = process.env.NEXTAUTH_SECRET || "default-secret-key-12345";
  return createHmac("sha256", secret).update(email).digest("hex").slice(0, 16);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.trim().toLowerCase();
    const token = searchParams.get("token")?.trim();

    if (!email || !token) {
      return new NextResponse(
        `<html>
          <head>
            <title>Invalid Request</title>
            <style>
              body { background: #0a0a0a; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { background: #111; border: 1px solid #222; border-radius: 16px; padding: 32px; max-width: 400px; text-align: center; }
              h1 { color: #ef4444; }
              p { color: #888; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Invalid Request</h1>
              <p>Missing required parameters.</p>
            </div>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html" }, status: 400 }
      );
    }

    const expectedToken = getUnsubscribeToken(email);
    if (token !== expectedToken) {
      return new NextResponse(
        `<html>
          <head>
            <title>Invalid Signature</title>
            <style>
              body { background: #0a0a0a; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .card { background: #111; border: 1px solid #222; border-radius: 16px; padding: 32px; max-width: 400px; text-align: center; }
              h1 { color: #ef4444; }
              p { color: #888; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Invalid Signature</h1>
              <p>This unsubscribe link is invalid or has expired.</p>
            </div>
          </body>
        </html>`,
        { headers: { "Content-Type": "text/html" }, status: 400 }
      );
    }

    const prisma = getPrisma();
    await prisma.$transaction([
      prisma.unsubscribedEmail.upsert({
        where: { email },
        create: { email },
        update: {},
      }),
      prisma.subscriber.updateMany({
        where: { email },
        data: {
          verified: false,
          unsubscribedAt: new Date(),
          verifyToken: null
        }
      })
    ]);

    return new NextResponse(
      `<html>
        <head>
          <title>Unsubscribed Successfully</title>
          <style>
            body { background: #0a0a0a; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .card { background: #111; border: 1px solid #222; border-radius: 16px; padding: 32px; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            h1 { color: #f59e0b; margin-top: 0; }
            p { color: #888; font-size: 14px; line-height: 1.6; }
            a { color: #f59e0b; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Unsubscribed</h1>
            <p>Your email has been suppressed from receiving further invitations from Renu Writes Poem.</p>
            <p><a href="/">Go to Renu Writes Poem</a></p>
          </div>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    console.error("Unsubscribe API error:", err);
    return new NextResponse("An unexpected error occurred.", { status: 500 });
  }
}
