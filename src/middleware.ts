import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  // 1. Traceability: Generate or propagate Trace & Correlation IDs
  const traceId = req.headers.get("x-trace-id") ?? crypto.randomUUID();
  const correlationId = req.headers.get("x-correlation-id") ?? crypto.randomUUID();

  // Mutate request headers so downstream Server Actions/API routes can read them
  req.headers.set("x-trace-id", traceId);
  req.headers.set("x-correlation-id", correlationId);

  let response: NextResponse | Response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // 2. Auth Pipeline: Protect specific routes
  const pathname = req.nextUrl.pathname;
  const isProtectedPath = pathname.startsWith("/admin") || pathname.startsWith("/account");

  if (isProtectedPath && process.env.NODE_ENV !== "development") {
    const authMiddleware = withAuth({
      secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
      callbacks: {
        authorized: ({ token }) => {
          if (pathname.startsWith("/admin")) {
            return token?.role === "ADMIN";
          }
          return !!token;
        },
      },
      pages: {
        signIn: "/login",
      },
    });

    // @ts-expect-error next-auth middleware typings are complex
    const authResponse = await authMiddleware(req, event);
    
    if (authResponse) {
      response = authResponse;
    }
  }

  // 3. Set traceability headers on the outgoing response so the client sees them
  if (response && "headers" in response) {
    response.headers.set("x-trace-id", traceId);
    response.headers.set("x-correlation-id", correlationId);
  }

  return response;
}

// 4. Matcher Config: Run on all paths except static files to ensure trace IDs are always logged
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
