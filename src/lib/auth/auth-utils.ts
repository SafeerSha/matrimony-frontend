/**
 * Utility functions for user authorization, draft onboarding status verification,
 * and routing resolution.
 */

export interface UserStatusCheckInput {
  user?: {
    id?: string;
    status?: "DRAFT" | "ACTIVE" | string;
    isPhoneVerified?: boolean;
    [key: string]: any;
  } | null;
  profile?: {
    firstName?: string;
    category?: string;
    onboardingStep?: number;
    status?: "DRAFT" | "ACTIVE" | string;
    [key: string]: any;
  } | null;
  [key: string]: any;
}

/**
 * Determines whether an authenticated user is still in DRAFT mode or has an incomplete profile.
 *
 * Rules:
 * - user.status === "DRAFT" => Draft (must complete onboarding)
 * - profile.onboardingStep < 5 => Incomplete (must complete onboarding)
 * - profile.status === "DRAFT" => Draft
 * - user.status === "ACTIVE" & (onboardingStep is undefined or >= 5) => Active (allowed in app)
 */
export function isDraftUser(data?: UserStatusCheckInput | null): boolean {
  if (!data) return false;

  const userStatus = data.user?.status ? String(data.user.status).toUpperCase().trim() : "";
  const profileStatus = data.profile?.status ? String(data.profile.status).toUpperCase().trim() : "";

  // 1. Explicit DRAFT user or profile status
  if (userStatus === "DRAFT" || profileStatus === "DRAFT") {
    return true;
  }

  // 2. Profile onboarding step check (1 through 4 = in progress, 5 = completed)
  if (data.profile?.onboardingStep !== undefined && data.profile?.onboardingStep !== null) {
    const step = Number(data.profile.onboardingStep);
    if (!isNaN(step) && step < 5) {
      return true;
    }
  }

  // 3. Explicit ACTIVE status
  if (userStatus === "ACTIVE" || profileStatus === "ACTIVE") {
    return false;
  }

  // 4. Client-side local draft check as defense-in-depth
  if (typeof window !== "undefined") {
    const draft = sessionStorage.getItem("shaadi_onboarding_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          return true;
        }
      } catch {}
    }
  }

  return false;
}

/**
 * Computes the correct post-login / post-verification target URL.
 * Incomplete / draft profiles are ALWAYS routed to /onboarding.
 * Active completed users are routed to their intended ?next= target or fallback.
 */
export function resolvePostAuthRoute(
  authRes?: UserStatusCheckInput | null,
  fallbackTarget = "/app/discover"
): { url: string; isDraft: boolean } {
  const isDraft = isDraftUser(authRes);

  if (isDraft) {
    return { url: "/onboarding", isDraft: true };
  }

  let destination = fallbackTarget;
  if (typeof window !== "undefined") {
    const searchParams = new URLSearchParams(window.location.search);
    const next = searchParams.get("next");
    if (
      next &&
      next.startsWith("/") &&
      !next.startsWith("//") &&
      !next.startsWith("/login") &&
      !next.startsWith("/register")
    ) {
      destination = next;
    }
  }

  return { url: destination, isDraft: false };
}
