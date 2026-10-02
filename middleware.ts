import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "__Host-matrimony_session";

async function getSessionPayload(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  // Use AUTH_SECRET or JWT_ACCESS_SECRET to align with backend if possible
  const secret = process.env.AUTH_SECRET || process.env.JWT_ACCESS_SECRET;

  if (!token || !secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"]
    });
    return payload.sub ? payload : null;
  } catch {
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("X-Request-Id", crypto.randomUUID());

  const pathname = request.nextUrl.pathname;
  const isProtectedPath = pathname.startsWith("/app") || pathname.startsWith("/admin") || pathname.startsWith("/rm");

  if (isProtectedPath) {
    const session = await getSessionPayload(request);
    
    if (!session) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }

    // Role-based authorization
    if (pathname.startsWith("/admin") && session.role !== "admin") {
      return NextResponse.redirect(new URL("/app", request.url));
    }
    
    if (pathname.startsWith("/rm") && session.role !== "rm" && session.role !== "admin") {
      return NextResponse.redirect(new URL("/app", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*", "/rm/:path*"]
};