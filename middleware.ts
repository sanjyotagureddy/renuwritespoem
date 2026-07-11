import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default function middleware(req: any, event: any) {
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }
  return withAuth({
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    callbacks: {
      authorized: ({ token }) => token?.role === "ADMIN",
    },
    pages: {
      signIn: "/login",
    },
  })(req, event);
}

export const config = {
  matcher: ["/admin/:path*"],
};
