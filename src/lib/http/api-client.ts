import { z } from "zod";
import { toast } from "@/lib/toast";

// Prefer explicit NEXT_PUBLIC_API_URL directly from the client browser so user requests
// reach the backend directly with the client's real IP, enabling accurate per-user rate limiting.
const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");
  }
  return typeof window !== "undefined"
    ? "/api/v1"
    : "http://localhost:4000/api/v1";
};

export const API_URL = getApiBaseUrl();

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
let refreshPromise: Promise<string | null> | null = null;

async function requestTokenRefresh(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    const storedRefresh =
      sessionStorage.getItem("refreshToken") ||
      localStorage.getItem("refreshToken") ||
      "";

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(storedRefresh ? { Authorization: `Bearer ${storedRefresh}` } : {}),
      },
      ...(storedRefresh ? { body: JSON.stringify({ refreshToken: storedRefresh }) } : {}),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json().catch(() => null);
    const newToken = data?.accessToken;
    const newRefresh = data?.refreshToken || storedRefresh;
    if (newToken) {
      try {
        sessionStorage.setItem("accessToken", newToken);
        localStorage.setItem("accessToken", newToken);
        sessionStorage.setItem("auth_token_set_at", Date.now().toString());
        if (newRefresh) {
          sessionStorage.setItem("refreshToken", newRefresh);
          localStorage.setItem("refreshToken", newRefresh);
        }
        const maxAge = 7 * 24 * 60 * 60;
        const isSecure = window.location.protocol === "https:";
        document.cookie = `matrimony_session=${encodeURIComponent(newToken)}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
      } catch {}
      return newToken;
    }
    return null;
  } catch {
    return null;
  } finally {
    refreshPromise = null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { schema?: z.ZodType<T>; _isRetry?: boolean } = {}
): Promise<T> {
  const { schema, _isRetry, ...init } = options;
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  const authHeaders: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const rawToken =
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken");
    const token =
      rawToken && rawToken !== "undefined" && rawToken !== "null"
        ? decodeURIComponent(rawToken.trim()).replace(/^Bearer\s+/i, "")
        : null;
    if (token && !(init.headers as any)?.["Authorization"] && !(init.headers as any)?.["authorization"]) {
      authHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include", // Relies on HttpOnly cookies sent automatically by the browser
    headers: {
      Accept: "application/json",
      ...(init.body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...authHeaders,
      ...init.headers,
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    // Intercept 401 Unauthorized
    if (response.status === 401 && typeof window !== "undefined") {
      const isAuthEndpoint =
        path.includes("/auth/login") ||
        path.includes("/auth/refresh") ||
        path.includes("/auth/register") ||
        path.includes("/auth/verify-otp") ||
        path.includes("/auth/quick-register");

      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.startsWith("/login") || currentPath.startsWith("/register");

      const tokenSetAt = Number(sessionStorage.getItem("auth_token_set_at") || 0);
      const isWithinGracePeriod = tokenSetAt > 0 && Date.now() - tokenSetAt < 15000;

      // If this is a normal authenticated request and not already a retry, try silent refresh first
      if (!isAuthEndpoint && !isAuthPage && !_isRetry) {
        if (!refreshPromise) {
          refreshPromise = requestTokenRefresh();
        }

        const freshToken = await refreshPromise;

        if (freshToken) {
          // Re-attempt original request with the fresh access token
          return apiFetch<T>(path, {
            ...options,
            _isRetry: true,
            headers: {
              ...(options.headers || {}),
              Authorization: `Bearer ${freshToken.replace(/^Bearer\s+/i, "")}`,
            },
          });
        }

        // If newly logged in within grace period, retry once before deciding to destroy session
        if (isWithinGracePeriod) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const currentToken = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
          if (currentToken && currentToken !== "undefined" && currentToken !== "null") {
            return apiFetch<T>(path, {
              ...options,
              _isRetry: true,
              headers: {
                ...(options.headers || {}),
                Authorization: `Bearer ${decodeURIComponent(currentToken.trim()).replace(/^Bearer\s+/i, "")}`,
              },
            });
          }
        }
      }

      // Only redirect if this isn't an explicit login submission or already on an auth page, and grace period has elapsed
      if (!isAuthEndpoint && !isAuthPage && !isRedirectingToLogin && !isWithinGracePeriod) {
        isRedirectingToLogin = true;

        try {
          sessionStorage.removeItem("accessToken");
          localStorage.removeItem("accessToken");
          sessionStorage.removeItem("refreshToken");
          localStorage.removeItem("refreshToken");
          sessionStorage.removeItem("auth_token_set_at");
          document.cookie = "matrimony_session=; path=/; max-age=0; SameSite=Lax";
        } catch {}

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

    function formatApiErrorMessage(status: number, rawMessage: string): string {
      if (
        status === 429 ||
        rawMessage.includes("ThrottlerException") ||
        rawMessage.toLowerCase().includes("too many requests")
      ) {
        return "Too many requests. For your security, please wait a minute before trying again.";
      }

      return rawMessage
        .replace(/^(ThrottlerException|InternalServerError|BadRequestException|UnauthorizedException):\s*/i, "")
        .trim();
    }

    const rawMessage = typeof body?.message === "string" ? body.message : "Request failed";
    const userMessage = formatApiErrorMessage(response.status, rawMessage);

    throw new ApiError(
      response.status,
      userMessage,
      body
    );
  }

  return schema ? schema.parse(body) : (body as T);
}