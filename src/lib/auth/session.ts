import "server-only";

import { cookies } from "next/headers";
import { jwtVerify, type JWTPayload } from "jose";

const SESSION_COOKIE = "__Host-matrimony_session";

export type Session = JWTPayload & {
  sub: string;
  email?: string;
  name?: string;
  role?: "user" | "admin";
};

function getSecret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not configured.");
  return new TextEncoder().encode(value);
}

export async function getSession(): Promise<Session | null> {
  if (process.env.NODE_ENV === "development") {
    return {
      sub: "mock-user-123",
      email: "dev@example.com",
      name: "Developer",
      role: "user",
    };
  }

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });

    if (!payload.sub) return null;
    return payload as Session;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export { SESSION_COOKIE };