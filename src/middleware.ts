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

  // Dedicated Admin Login Page: allow unauthenticated visitors, but redirect existing ADMINs directly to /admin
  if (pathname === "/admin/login") {
    const session = await getSessionPayload(request);
    const normalizedRole = typeof session?.role === "string" ? session.role.toUpperCase() : "";
    if (normalizedRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return response;
  }

  // Protected Admin Portal routes: require authenticated ADMIN, redirecting to /admin/login
  if (pathname.startsWith("/admin")) {
    const session = await getSessionPayload(request);
    const normalizedRole = typeof session?.role === "string" ? session.role.toUpperCase() : "";

    if (!session || normalizedRole !== "ADMIN") {
      const login = new URL("/admin/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    return response;
  }

  // Protected Member App routes (/app/*)
  if (pathname.startsWith("/app")) {
    const session = await getSessionPayload(request);
    if (!session) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    return response;
  }

  // Protected RM Portal routes (/rm/*)
  if (pathname.startsWith("/rm")) {
    const session = await getSessionPayload(request);
    const normalizedRole = typeof session?.role === "string" ? session.role.toUpperCase() : "";

    if (!session || (normalizedRole !== "RM" && normalizedRole !== "ADMIN")) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      login.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(login);
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/discover",
    "/app",
    "/app/:path*",
    "/admin",
    "/admin/:path*",
    "/rm",
    "/rm/:path*"
  ]
};
