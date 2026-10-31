/**
 * Feature Flags Configuration for IshtamChat
 *
 * Controls whether out-of-scope pages or features show the "Under Development"
 * placeholder during the Sprint 1 demo.
 *
 * TO TURN OFF PLACEHOLDERS LATER:
 * Simply change `ENABLE_IN_PROGRESS_PLACEHOLDERS: false` below.
 */

export interface FeatureFlags {
  /** Master toggle: set to false to instantly restore all normal page contents */
  ENABLE_IN_PROGRESS_PLACEHOLDERS: boolean;

  /** Individual page switches (true = live content, false = Under Development) */
  pages: {
    // Sprint 1 Demo Agenda Items (Live)
    home: boolean;
    profileCreation: boolean;
    loginOtp: boolean;
    preferences: boolean;
    discover: boolean;
    profile: boolean;

    // Outside Sprint 1 Agenda (Under Development)
    matches: boolean;
    messages: boolean;
    favorites: boolean;
    interests: boolean;
    notifications: boolean;
    settings: boolean;
    subscription: boolean;
    support: boolean;
  };
}

export const FEATURE_FLAGS: FeatureFlags = {
  // Master toggle: Set to false to disable all placeholders and reveal normal page content
  ENABLE_IN_PROGRESS_PLACEHOLDERS: false,

  pages: {
    // Sprint 1 Agenda items remain active
    home: true,
    profileCreation: true,
    loginOtp: true,
    preferences: true,
    discover: true,
    profile: true,

    // Live Features
    matches: true,
    messages: true,
    favorites: true,
    interests: true,
    notifications: false,
    settings: true,
    subscription: true,
    support: false,
  },
};

/**
 * Checks if a given page is enabled.
 * If master toggle is false, returns true for every page.
 */
export function isPageEnabled(pageKey: keyof FeatureFlags['pages']): boolean {
  if (!FEATURE_FLAGS.ENABLE_IN_PROGRESS_PLACEHOLDERS) {
    return true;
  }
  return FEATURE_FLAGS.pages[pageKey] ?? true;
}

/**
 * Subscription & Monetization Mode Flag
 *
 * Controls whether the application runs in Free Trial mode or Paid Gateway mode:
 *
 * - true (DEFAULT / EARLY RELEASE):
 *   Zero-payment complimentary access mode.
 *   Users activate full messaging & interaction passes with 1 click.
 *   Shows "Claim Free Trial" and celebration launch banners.
 *
 * - false (PAYMENT GATEWAY LIVE):
 *   Standard paid subscription mode.
 *   Prompts users to "Explore Membership Plans" and choose paid pricing (₹500, etc.).
 *   Wired for direct payment gateway checkout (Razorpay / Stripe).
 *
 * To switch modes:
 * Set NEXT_PUBLIC_ENABLE_FREE_TRIAL=false in your .env file,
 * OR set ENABLE_FREE_TRIAL_MODE: false directly below.
 */
export const SUBSCRIPTION_FLAGS = {
  ENABLE_FREE_TRIAL_MODE:
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ENABLE_FREE_TRIAL !== undefined
      ? process.env.NEXT_PUBLIC_ENABLE_FREE_TRIAL === 'true'
      : true,
};

export function isFreeTrialMode(): boolean {
  return SUBSCRIPTION_FLAGS.ENABLE_FREE_TRIAL_MODE;
}
