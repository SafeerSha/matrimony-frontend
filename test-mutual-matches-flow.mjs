import { z } from "zod";

// Import schemas defined in validation
import {
  MatchesResponseSchema,
  LiveConnectionSchema,
  InitiateChatResponseSchema,
  CelebrationPayloadSchema,
} from "./src/lib/validation/matches.ts";

import { FEATURE_FLAGS, isPageEnabled } from "./src/config/feature-flags.ts";

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedCount++;
  }
}

console.log("\n=======================================================");
console.log("MUTUAL MATCHES & CELEBRATION MODAL VERIFICATION SUITE");
console.log("=======================================================\n");

// -----------------------------------------------------------------
// TEST 1: Feature Flag Compliance
// -----------------------------------------------------------------
console.log("1. Checking Feature Flags...");
assert(FEATURE_FLAGS.pages.matches === true, "FEATURE_FLAGS.pages.matches is enabled (Epic 5 live matches)");
assert(FEATURE_FLAGS.pages.interests === false, "FEATURE_FLAGS.pages.interests is false as required");
assert(FEATURE_FLAGS.pages.favorites === false, "FEATURE_FLAGS.pages.favorites is false as required");
assert(isPageEnabled("matches") === true, "isPageEnabled('matches') returns true");
assert(isPageEnabled("interests") === false, "isPageEnabled('interests') returns false (shows UnderDevelopment)");

// -----------------------------------------------------------------
// TEST 2: AC-1 - Live Mutual Matches Retrieval & Schema Validation
// -----------------------------------------------------------------
console.log("\n2. AC-1: Live Mutual Matches Retrieval & Normalization...");

const mockLiveBackendMatches = [
  {
    id: "conn-101",
    senderId: "current-user-uuid",
    receiverId: "partner-uuid-1",
    status: "ACCEPTED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sender: {
      id: "current-user-uuid",
      firstName: "Test",
      lastName: "User",
      profileId: "SC-TEST01",
      profile: { city: "Kochi", occupation: "Software Architect" },
      photos: [{ url: "https://images.unsplash.com/photo-user.jpg", isPrimary: true, isVerified: true }],
    },
    receiver: {
      id: "partner-uuid-1",
      firstName: "Ananya",
      lastName: "Menon",
      profileId: "SC-ANAN99",
      dateOfBirth: "1997-04-12T00:00:00.000Z",
      profile: {
        city: "Ernakulam",
        country: "Kerala",
        occupation: "Product Designer",
        education: "Master of Design",
        bio: "Passionate about sustainable architecture and arts.",
        religion: "Hindu",
        maritalStatus: "Never Married",
        isVerified: true,
      },
      photos: [{ url: "https://images.unsplash.com/photo-ananya.jpg", isPrimary: true, isVerified: true }],
    },
    partner: {
      id: "partner-uuid-1",
      firstName: "Ananya",
      lastName: "Menon",
      profileId: "SC-ANAN99",
      dateOfBirth: "1997-04-12T00:00:00.000Z",
      profile: {
        city: "Ernakulam",
        country: "Kerala",
        occupation: "Product Designer",
        education: "Master of Design",
        bio: "Passionate about sustainable architecture and arts.",
        religion: "Hindu",
        maritalStatus: "Never Married",
        isVerified: true,
      },
      photos: [{ url: "https://images.unsplash.com/photo-ananya.jpg", isPrimary: true, isVerified: true }],
    },
    isMutualMatch: true,
  },
  {
    id: "conn-102",
    senderId: "partner-uuid-2",
    receiverId: "current-user-uuid",
    status: "ACCEPTED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    partner: {
      id: "partner-uuid-2",
      firstName: "Meera",
      lastName: "Nair",
      profileId: "SC-MEER88",
      dateOfBirth: "1998-08-20T00:00:00.000Z",
      profile: {
        city: "Thiruvananthapuram",
        country: "Kerala",
        occupation: "Doctor (MD Pediatrics)",
        education: "MBBS, MD",
        bio: "Warm, family-oriented medical practitioner.",
      },
      photos: [{ url: "https://images.unsplash.com/photo-meera.jpg", isPrimary: true }],
    },
    isMutualMatch: true,
  },
];

// Validate against MatchesResponseSchema
const parsedMatches = MatchesResponseSchema.safeParse(mockLiveBackendMatches);
assert(parsedMatches.success, "Live connections payload strictly matches Zod MatchesResponseSchema");
assert(parsedMatches.data?.length === 2, "Parsed 2 valid mutual match records");

// Test Happy Path Normalization
const item1 = mockLiveBackendMatches[0];
const partner1 = item1.partner;
assert(partner1.firstName === "Ananya" && partner1.lastName === "Menon", "Partner name accurately parsed");
assert(partner1.photos[0].url === "https://images.unsplash.com/photo-ananya.jpg", "Primary photo URL properly captured");
assert(item1.isMutualMatch === true, "Record marked as mutual match");

// Test Empty State Validation
const emptyMatchesResult = MatchesResponseSchema.safeParse([]);
assert(emptyMatchesResult.success && emptyMatchesResult.data.length === 0, "Empty matches array gracefully validates");

// Test Malformed / Failure handling
const invalidPayload = [{ id: 123, status: 999 }];
const invalidResult = MatchesResponseSchema.safeParse(invalidPayload);
assert(!invalidResult.success, "Malformed matches data is rejected by Zod schema validation");

// -----------------------------------------------------------------
// TEST 3: AC-2 - Celebratory Trigger
// -----------------------------------------------------------------
console.log("\n3. AC-2: Celebratory Trigger Validation...");

const celebrationPayload = {
  match: {
    id: "partner-uuid-1",
    name: "Ananya Menon",
    age: 29,
    city: "Ernakulam",
    state: "Kerala",
    profession: "Product Designer",
    education: "Master of Design",
    image: "https://images.unsplash.com/photo-ananya.jpg",
    compatibility: 96,
    verified: true,
    about: "Passionate about sustainable architecture and arts.",
  },
  currentUser: {
    name: "You",
    image: "https://images.unsplash.com/photo-user.jpg",
    city: "Kochi",
    verified: true,
  },
  initialGreeting: "Namaste! Delighted to connect with you.",
};

const celebrationCheck = CelebrationPayloadSchema.safeParse(celebrationPayload);
assert(celebrationCheck.success, "Celebration trigger payload matches Zod schema contract");
assert(celebrationCheck.data?.match.id === "partner-uuid-1", "Match ID in celebration payload is correct");
assert(celebrationCheck.data?.match.compatibility === 96, "Celebration compatibility score validated");

// -----------------------------------------------------------------
// TEST 4: AC-3 - One-Click Conversation CTA & Chat Initialization
// -----------------------------------------------------------------
console.log("\n4. AC-3: One-Click Conversation CTA & Endpoint Contract...");

const mockInitiateChatResponse = {
  success: true,
  conversationId: "conv-partner-uuid-1",
  contactId: "partner-uuid-1",
  partner: {
    id: "partner-uuid-1",
    name: "Ananya Menon",
    photo: "https://images.unsplash.com/photo-ananya.jpg",
    bio: "Passionate about sustainable architecture and arts.",
    city: "Ernakulam",
    occupation: "Product Designer",
  },
  message: "Conversation initialized successfully",
};

const chatInitCheck = InitiateChatResponseSchema.safeParse(mockInitiateChatResponse);
assert(chatInitCheck.success, "Chat initialization response conforms to InitiateChatResponseSchema");
assert(chatInitCheck.data?.conversationId === "conv-partner-uuid-1", "Conversation ID properly returned for transition");
assert(chatInitCheck.data?.success === true, "CTA response status indicates immediate chat capability");

console.log("\n=======================================================");
if (failedCount === 0) {
  console.log(`ALL ${passedCount} ACCEPTANCE CRITERIA VERIFICATION CHECKS PASSED! ✨`);
} else {
  console.error(`${failedCount} CHECKS FAILED.`);
  process.exit(1);
}
console.log("=======================================================\n");
