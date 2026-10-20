import "server-only";

import { cookies } from "next/headers";
import { jwtVerify, type JWTPayload } from "jose";

const SESSION_COOKIE = "__Host-matrimony_session";
const FALLBACK_COOKIE = "matrimony_session";
const DEFAULT_JWT_SECRET = "d74c959aa3b21d3e248e4d25708670dc000e491b846f78a34d6d33415a284fce";

export type Session = JWTPayload & {
  sub: string;
  email?: string;
  name?: string;
  role?: "user" | "admin" | string;
  status?: "DRAFT" | "ACTIVE" | string;
};

function getSecret() {
  const value = process.env.AUTH_SECRET || process.env.JWT_ACCESS_SECRET || DEFAULT_JWT_SECRET;
  return new TextEncoder().encode(value);
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const secret = getSecret();

  // Try matrimony_session first as client updates this directly
  const fallbackToken = cookieStore.get(FALLBACK_COOKIE)?.value;
  if (fallbackToken) {
    try {
      const cleanToken = decodeURIComponent(fallbackToken.trim());
      const { payload } = await jwtVerify(cleanToken, secret, {
        algorithms: ["HS256"],
      });
      if (payload?.sub) return payload as Session;
    } catch {}
  }

  // Also try __Host-matrimony_session
  const hostToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (hostToken) {
    try {
      const cleanToken = decodeURIComponent(hostToken.trim());
      const { payload } = await jwtVerify(cleanToken, secret, {
        algorithms: ["HS256"],
      });
      if (payload?.sub) return payload as Session;
    } catch {}
  }

  return null;
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export { SESSION_COOKIE, FALLBACK_COOKIE };