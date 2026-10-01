import { z } from "zod";

const originSchema = z.string().url();

export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const allowed = [
    process.env.NEXT_PUBLIC_APP_URL,
    new URL(request.url).origin
  ].filter(Boolean);

  return originSchema.safeParse(origin).success && allowed.includes(origin);
}

export function assertSafeMethod(request: Request) {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && !isAllowedOrigin(request)) {
    throw new Error("FORBIDDEN_ORIGIN");
  }
}