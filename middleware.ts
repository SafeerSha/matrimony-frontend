import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "__Host-matrimony_session";
const FALLBACK_COOKIE = "matrimony_session";
const DEFAULT_JWT_SECRET = "d74c959aa3b21d3e248e4d25708670dc000e491b846f78a34d6d33415a284fce";

async function verifyToken(rawToken: string, secretStr: string) {
  try {
    const cleanToken = decodeURIComponent(rawToken.trim());
    const secret = new TextEncoder().encode(secretStr);
    const { payload } = await jwtVerify(cleanToken, secret, {
      algorithms: ["HS256"]
    });
    return payload?.sub ? payload : null;
  } catch {
    return null;
  }
}

async function getSessionPayload(request: NextRequest) {
  const secret = process.env.AUTH_SECRET || process.env.JWT_ACCESS_SECRET || DEFAULT_JWT_SECRET;
  
  // Try matrimony_session first as client JS updates it directly upon verification
  const fallbackToken = request.cookies.get(FALLBACK_COOKIE)?.value;
  if (fallbackToken) {
    const session = await verifyToken(fallbackToken, secret);
    if (session) return session;
  }

  // Also check __Host-matrimony_session
  const hostToken = request.cookies.get(SESSION_COOKIE)?.value;
  if (hostToken) {
    const session = await verifyToken(hostToken, secret);
    if (session) return session;
  }

  return null;
}

export default async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("X-Request-Id", crypto.randomUUID());

  const pathname = request.nextUrl.pathname;

  // Convenience redirect from /discover to /app/discover
  if (pathname === "/discover" || pathname === "/discover/") {
    return NextResponse.redirect(new URL("/app/discover", request.url));
  }

  const isProtectedPath = pathname.startsWith("/app") || pathname.startsWith("/admin") || pathname.startsWith("/rm");

  if (isProtectedPath) {
    const session = await getSessionPayload(request);
    
    if (!session) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }

    // Role-based authorization (case-insensitive matching backend 'ADMIN' and 'RM')
    const normalizedRole = typeof session.role === "string" ? session.role.toUpperCase() : "";

    if (pathname.startsWith("/admin") && normalizedRole !== "ADMIN") {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      login.searchParams.set("error", "admin_required");
      return NextResponse.redirect(login);
    }
    
    if (pathname.startsWith("/rm") && normalizedRole !== "RM" && normalizedRole !== "ADMIN") {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      login.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(login);
    }
  }

  return response;
}

export const config = {
  matcher: ["/discover", "/app/:path*", "/admin/:path*", "/rm/:path*"]
};
