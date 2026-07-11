import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isAdminRoute(pathname: string) {
  return pathname.startsWith("/admin");
}

export default function middleware(req: NextRequest, event: any) {
  if (process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const pathname = req.nextUrl.pathname;

  if (isAdminRoute(pathname)) {
    // Admin routes require ADMIN role
    return withAuth({
      secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
      callbacks: {
        authorized: ({ token }) => token?.role === "ADMIN",
      },
      pages: {
        signIn: "/login",
      },
    })(req as any, event);
  }

  // Account routes require any signed-in user
  return withAuth({
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  })(req as any, event);
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
