import { z } from "zod";
import { toast } from "@/lib/toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Module-level guard to prevent multiple concurrent redirects if multiple API calls 401 simultaneously
let isRedirectingToLogin = false;

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { schema?: z.ZodType<T> } = {}
): Promise<T> {
  const { schema, ...init } = options;
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include", // Relies on HttpOnly cookies sent automatically by the browser
    headers: {
      Accept: "application/json",
      ...(init.body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    // Intercept 401 Unauthorized for expired sessions
    if (response.status === 401 && typeof window !== "undefined") {
      const isLoginRequest = path.includes("/auth/login");
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.startsWith("/login") || currentPath.startsWith("/register");

      // Only redirect if this isn't an explicit login submission or already on an auth page
      if (!isLoginRequest && !isAuthPage && !isRedirectingToLogin) {
        isRedirectingToLogin = true;

        const currentFullUrl = window.location.pathname + window.location.search;
        const loginUrl = `/login?next=${encodeURIComponent(currentFullUrl)}`;

        // Show toast notification immediately on screen so the user clearly sees what happened
        toast.warning(
          "Session Expired",
          "Your session has ended. Redirecting to login..."
        );

        // Also prepare flash toast so it re-displays on the login page
        toast.flash(
          "warning",
          "Session Expired",
          "Your session has ended. Please sign in again to continue."
        );

        // Delay redirect briefly (1.2s) so the user sees the toast notification and message
        setTimeout(() => {
          window.location.href = loginUrl;
        }, 1200);
      }
    }

    throw new ApiError(
      response.status,
      typeof body?.message === "string" ? body.message : "Request failed",
      body
    );
  }

  return schema ? schema.parse(body) : (body as T);
}