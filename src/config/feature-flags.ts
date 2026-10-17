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

    // Epic 5 Live Features
    matches: true,
    messages: false,
    favorites: false,
    interests: false,
    notifications: false,
    settings: false,
    subscription: false,
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
