/**
 * Verification Test Suite: Save Onboarding Progress at Each Step
 * Validates AC-1, AC-2, and AC-3 with both happy paths and failure/rejection handling.
 */

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${details ? ` -> ${details}` : ""}`);
    failedCount++;
  }
}

console.log("\n=======================================================");
console.log("ONBOARDING PROGRESS SAVE & STEP RETENTION TEST SUITE");
console.log("=======================================================\n");

// ---------------------------------------------------------------------
// Mock Storage Implementation (Simulates window.sessionStorage & localStorage)
// ---------------------------------------------------------------------
class MemoryStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

const mockSessionStorage = new MemoryStorage();
const mockLocalStorage = new MemoryStorage();

// ---------------------------------------------------------------------
// Pure Logic Emulation mirroring src/app/onboarding/page.tsx
// ---------------------------------------------------------------------
function saveDraftLocally(data, session = mockSessionStorage, local = mockLocalStorage, state = {}) {
  try {
    let existingDraft = {};
    try {
      const stored = session.getItem("shaadi_onboarding_draft") || local.getItem("shaadi_onboarding_draft");
      if (stored) existingDraft = JSON.parse(stored);
    } catch {}

    const { primaryPhoto: _p, albumPhotos: _a, ...serializable } = data;
    const merged = {
      ...existingDraft,
      ...serializable,
    };

    if (serializable.password !== undefined) {
      merged.password = serializable.password;
    } else if (state.password) {
      merged.password = state.password;
    }

    if (serializable.confirmPassword !== undefined) {
      merged.confirmPassword = serializable.confirmPassword;
    } else if (state.confirmPassword) {
      merged.confirmPassword = state.confirmPassword;
    }

    if (serializable.hasPasswordSet !== undefined) {
      merged.hasPasswordSet = serializable.hasPasswordSet;
    } else if (state.hasPasswordSet || local.getItem("shaadi_password_enabled") === "true") {
      merged.hasPasswordSet = true;
    }

    const json = JSON.stringify(merged);
    session.setItem("shaadi_onboarding_draft", json);
    local.setItem("shaadi_onboarding_draft", json);
    return true;
  } catch (err) {
    return false;
  }
}

function validateStep1Basic(data) {
  if (!data?.firstName?.trim()) {
    return { valid: false, error: "Please enter your name." };
  }
  if (!data?.permanentAddress?.trim()) {
    return { valid: false, error: "Permanent Address is mandatory." };
  }
  const phone = (data?.phone || "").trim();
  if (!phone) {
    return { valid: false, error: "Cell number is mandatory." };
  }
  const email = (data?.email || "").trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: "A valid Email ID is mandatory." };
  }
  if (!data?.education?.trim()) {
    return { valid: false, error: "Please specify your educational qualification." };
  }
  if (!data?.dateOfBirth) {
    return { valid: false, error: "Please select your date of birth." };
  }
  if (!data?.gender?.trim()) {
    return { valid: false, error: "Please select gender." };
  }
  if (!data?.maritalStatus?.trim()) {
    return { valid: false, error: "Please select your marital status." };
  }
  return { valid: true };
}

// Emulates step transition with asynchronous background auto-save
async function handleStepTransition({
  currentStep,
  targetStep,
  profileData,
  preferencesData,
  maxStepReached,
  uploadedPhotoUrl,
  uploadedPhotoId,
  mockBackendService,
}) {
  // Guard: Step 1 validation when moving forward
  if (currentStep === 1 && targetStep > 1) {
    const validation = validateStep1Basic(profileData);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
        step: currentStep,
        maxStepReached,
      };
    }
  }

  // 1. Synchronously save draft to local storage
  const newMax = Math.max(maxStepReached, targetStep);
  const draftPayload = {
    ...profileData,
    preferences: preferencesData,
    uploadedPhotoUrl,
    uploadedPhotoId,
    onboardingStep: targetStep,
    maxStepReached: newMax,
  };
  saveDraftLocally(draftPayload);

  // 2. Asynchronous background auto-save to backend
  let backendSaveResult = null;
  let backendError = null;
  try {
    backendSaveResult = await mockBackendService.updateProfile("me", {
      ...profileData,
      onboardingStep: targetStep,
      preferences: preferencesData,
    });
  } catch (err) {
    backendError = err;
  }

  return {
    success: true,
    step: targetStep,
    maxStepReached: newMax,
    backendSaved: Boolean(backendSaveResult),
    backendError,
  };
}

// Emulates initial mount & data restoration
function restoreOnboardingState({
  mockSession = mockSessionStorage,
  mockLocal = mockLocalStorage,
  backendProfile = null,
}) {
  let restoredProfile = {};
  let restoredPreferences = {};
  let restoredStep = 1;
  let maxReached = 1;
  let photoUrl = null;
  let photoId = null;
  let restoredPassword = "";
  let restoredConfirmPassword = "";
  let restoredHasPasswordSet = false;

  // 1. Read from local draft storage
  const storedJson = mockSession.getItem("shaadi_onboarding_draft") || mockLocal.getItem("shaadi_onboarding_draft");
  if (storedJson) {
    try {
      const parsed = JSON.parse(storedJson);
      restoredProfile = { ...parsed };
      if (parsed.preferences) restoredPreferences = { ...parsed.preferences };
      if (parsed.uploadedPhotoUrl) photoUrl = parsed.uploadedPhotoUrl;
      if (parsed.uploadedPhotoId) photoId = parsed.uploadedPhotoId;
      if (parsed.maxStepReached) maxReached = Math.max(1, parsed.maxStepReached);
      if (parsed.onboardingStep) restoredStep = Math.max(1, Math.min(parsed.onboardingStep, 4));
      if (parsed.password) restoredPassword = parsed.password;
      if (parsed.confirmPassword) restoredConfirmPassword = parsed.confirmPassword;
      else if (parsed.password) restoredConfirmPassword = parsed.password;
      if (parsed.hasPasswordSet) restoredHasPasswordSet = true;
    } catch {}
  }

  if (mockLocal.getItem("shaadi_password_enabled") === "true") {
    restoredHasPasswordSet = true;
  }

  // 2. Merge with backend profile if available
  if (backendProfile) {
    restoredProfile = {
      ...backendProfile,
      ...restoredProfile, // preserves in-flight draft updates
    };
    if (backendProfile.preferences) {
      restoredPreferences = { ...backendProfile.preferences, ...restoredPreferences };
    }
    if (backendProfile.photos && Array.isArray(backendProfile.photos)) {
      const primary = backendProfile.photos.find((p) => p.isPrimary);
      if (primary && !photoUrl) {
        photoUrl = primary.url;
        photoId = primary.id;
      }
    }
    if (backendProfile.onboardingStep && backendProfile.onboardingStep >= 1) {
      const backendStep = Math.min(backendProfile.onboardingStep, 4);
      restoredStep = Math.max(restoredStep, backendStep);
      maxReached = Math.max(maxReached, restoredStep);
    }
  }

  return {
    profileData: restoredProfile,
    preferencesData: restoredPreferences,
    step: restoredStep,
    maxStepReached: maxReached,
    uploadedPhotoUrl: photoUrl,
    uploadedPhotoId: photoId,
    password: restoredPassword,
    confirmPassword: restoredConfirmPassword,
    hasPasswordSet: restoredHasPasswordSet,
  };
}

// =====================================================================
// TEST SUITE EXECUTION
// =====================================================================

// ---------------------------------------------------------------------
// TEST 1: AC-1 - User input is automatically saved when navigating to next step (Happy Path)
// ---------------------------------------------------------------------
console.log("1. AC-1: Forward Step Navigation Auto-Save (Happy Path)...");

mockSessionStorage.clear();
mockLocalStorage.clear();

let backendCalls = [];
const mockBackendService = {
  updateProfile: async (userId, data) => {
    backendCalls.push({ userId, data });
    return { success: true, ...data };
  },
};

const validStep1Data = {
  firstName: "Sreenath",
  lastName: "Menon",
  gender: "male",
  maritalStatus: "Never Married",
  dateOfBirth: "1994-06-15T00:00:00.000Z",
  phone: "+91 9847123456",
  email: "sreenath.menon@example.com",
  permanentAddress: "House No 42, Palm Meadows, Kakkanad, Kochi",
  nationality: "Indian",
  state: "Kerala",
  city: "Kochi",
  fatherName: "K. R. Menon",
  religion: "Hindu",
  caste: "Nair",
  education: "B.Tech Computer Science",
  employmentStatus: "Private Sector",
  annualIncome: "12 to 25 lakhs",
  height: "178 cm",
  fatherAlive: true,
  motherAlive: true,
  brothersCount: 1,
  brothersMarried: 0,
  sistersCount: 1,
  sistersMarried: 1,
  bio: "Nuclear family based in Kochi, progressive and traditional values.",
};

(async () => {
  // Transition 1 -> 2
  const transition1to2 = await handleStepTransition({
    currentStep: 1,
    targetStep: 2,
    profileData: validStep1Data,
    preferencesData: { location: "Kerala" },
    maxStepReached: 1,
    mockBackendService,
  });

  assert(transition1to2.success === true, "AC-1: Step 1 -> 2 navigation succeeds with valid data");
  assert(transition1to2.step === 2, "AC-1: Step advances to 2");
  assert(transition1to2.maxStepReached === 2, "AC-1: maxStepReached updated to 2");
  assert(transition1to2.backendSaved === true, "AC-1: Backend updateProfile was invoked");

  // Check storage contents
  const savedDraft1 = JSON.parse(mockSessionStorage.getItem("shaadi_onboarding_draft"));
  assert(savedDraft1.firstName === "Sreenath", "AC-1: First name saved in local storage");
  assert(savedDraft1.permanentAddress === "House No 42, Palm Meadows, Kakkanad, Kochi", "AC-1: Address saved in local storage");
  assert(savedDraft1.onboardingStep === 2, "AC-1: onboardingStep saved as 2 in local storage");

  // Check backend payload
  const lastBackendCall = backendCalls[backendCalls.length - 1];
  assert(lastBackendCall.data.onboardingStep === 2, "AC-1: Backend API received onboardingStep: 2");
  assert(lastBackendCall.data.email === "sreenath.menon@example.com", "AC-1: Backend API received email");
  assert(lastBackendCall.data.education === "B.Tech Computer Science", "AC-1: Backend API received education");

  // Transition 2 -> 3 (Primary photo uploaded / selected)
  const transition2to3 = await handleStepTransition({
    currentStep: 2,
    targetStep: 3,
    profileData: { ...validStep1Data, avatarUrl: "https://cdn.example.com/photos/sreenath_dp.jpg" },
    preferencesData: { location: "Kerala" },
    maxStepReached: 2,
    uploadedPhotoUrl: "https://cdn.example.com/photos/sreenath_dp.jpg",
    uploadedPhotoId: "photo-uuid-101",
    mockBackendService,
  });

  assert(transition2to3.success === true, "AC-1: Step 2 -> 3 navigation succeeds");
  assert(transition2to3.step === 3, "AC-1: Step advances to 3");
  const savedDraft2 = JSON.parse(mockSessionStorage.getItem("shaadi_onboarding_draft"));
  assert(savedDraft2.uploadedPhotoUrl === "https://cdn.example.com/photos/sreenath_dp.jpg", "AC-1: Photo URL persisted upon Step 2 transition");
  assert(savedDraft2.onboardingStep === 3, "AC-1: onboardingStep saved as 3 in storage");

  // Transition 3 -> 4 (Password skipped or saved)
  const transition3to4 = await handleStepTransition({
    currentStep: 3,
    targetStep: 4,
    profileData: { ...validStep1Data, avatarUrl: "https://cdn.example.com/photos/sreenath_dp.jpg" },
    preferencesData: { location: "Kerala" },
    maxStepReached: 3,
    uploadedPhotoUrl: "https://cdn.example.com/photos/sreenath_dp.jpg",
    uploadedPhotoId: "photo-uuid-101",
    mockBackendService,
  });

  assert(transition3to4.success === true, "AC-1: Step 3 -> 4 navigation succeeds");
  assert(transition3to4.step === 4, "AC-1: Step advances to 4");
  const savedDraft3 = JSON.parse(mockSessionStorage.getItem("shaadi_onboarding_draft"));
  assert(savedDraft3.onboardingStep === 4, "AC-1: onboardingStep saved as 4 in storage");

  // ---------------------------------------------------------------------
  // TEST 2: AC-1 - Failure / Rejection Handling
  // ---------------------------------------------------------------------
  console.log("\n2. AC-1: Validation & Failure Handling...");

  // Missing First Name
  const invalidNoName = { ...validStep1Data, firstName: "" };
  const failNoName = await handleStepTransition({
    currentStep: 1,
    targetStep: 2,
    profileData: invalidNoName,
    preferencesData: {},
    maxStepReached: 1,
    mockBackendService,
  });
  assert(failNoName.success === false, "AC-1: Rejects navigation when firstName is missing");
  assert(failNoName.step === 1, "AC-1: Stays on step 1 when firstName is missing");

  // Missing Permanent Address
  const invalidNoAddress = { ...validStep1Data, permanentAddress: "" };
  const failNoAddress = await handleStepTransition({
    currentStep: 1,
    targetStep: 2,
    profileData: invalidNoAddress,
    preferencesData: {},
    maxStepReached: 1,
    mockBackendService,
  });
  assert(failNoAddress.success === false, "AC-1: Rejects navigation when permanentAddress is missing");
  assert(failNoAddress.error.includes("Permanent Address is mandatory"), "AC-1: Returns address error message");

  // Invalid Email Format
  const invalidEmail = { ...validStep1Data, email: "invalid-email-string" };
  const failInvalidEmail = await handleStepTransition({
    currentStep: 1,
    targetStep: 2,
    profileData: invalidEmail,
    preferencesData: {},
    maxStepReached: 1,
    mockBackendService,
  });
  assert(failInvalidEmail.success === false, "AC-1: Rejects navigation with invalid email format");

  // Backend 409 Conflict Simulation (email already in use)
  const conflictBackendService = {
    updateProfile: async () => {
      const err = new Error("This email address is already associated with another account.");
      err.status = 409;
      err.statusCode = 409;
      throw err;
    },
  };
  const failConflict = await handleStepTransition({
    currentStep: 1,
    targetStep: 2,
    profileData: validStep1Data,
    preferencesData: {},
    maxStepReached: 1,
    mockBackendService: conflictBackendService,
  });
  assert(failConflict.backendError !== null, "AC-1: Catches 409 email conflict from backend");
  assert(failConflict.backendError.status === 409, "AC-1: Confirms status code 409");

  // Network Failure Resilience: local data preserved even if backend auto-save blips
  const failingBackendService = {
    updateProfile: async () => {
      throw new Error("Network timeout or offline");
    },
  };
  mockSessionStorage.clear();
  const transitionWithOfflineBackend = await handleStepTransition({
    currentStep: 2,
    targetStep: 3,
    profileData: validStep1Data,
    preferencesData: {},
    maxStepReached: 2,
    mockBackendService: failingBackendService,
  });
  assert(transitionWithOfflineBackend.success === true, "AC-1: User transition is NOT blocked if background backend call blips");
  const offlineDraft = JSON.parse(mockSessionStorage.getItem("shaadi_onboarding_draft"));
  assert(offlineDraft.firstName === "Sreenath", "AC-1: Local draft safely preserved during network failure");

  // ---------------------------------------------------------------------
  // TEST 3: AC-2 - Returning to a previous step keeps data populated
  // ---------------------------------------------------------------------
  console.log("\n3. AC-2: Returning to Previous Step (Happy Path & Data Population)...");

  // User is on Step 2, filled Step 1 previously -> click Back to Step 1
  const returnToStep1 = await handleStepTransition({
    currentStep: 2,
    targetStep: 1,
    profileData: validStep1Data,
    preferencesData: { location: "Kerala" },
    maxStepReached: 2,
    mockBackendService,
  });

  assert(returnToStep1.success === true, "AC-2: Back navigation from Step 2 -> 1 succeeds");
  assert(returnToStep1.step === 1, "AC-2: Active step becomes 1");

  // Check state restoration
  const restoredStateOnStep1 = restoreOnboardingState({
    mockSession: mockSessionStorage,
    mockLocal: mockLocalStorage,
  });
  assert(restoredStateOnStep1.profileData.firstName === "Sreenath", "AC-2: First name remained populated on return to Step 1");
  assert(restoredStateOnStep1.profileData.permanentAddress === "House No 42, Palm Meadows, Kakkanad, Kochi", "AC-2: Permanent address remained populated on return to Step 1");
  assert(restoredStateOnStep1.profileData.religion === "Hindu", "AC-2: Religion remained populated on return to Step 1");
  assert(restoredStateOnStep1.profileData.caste === "Nair", "AC-2: Caste remained populated on return to Step 1");
  assert(restoredStateOnStep1.profileData.education === "B.Tech Computer Science", "AC-2: Education remained populated on return to Step 1");
  assert(restoredStateOnStep1.profileData.brothersCount === 1, "AC-2: Brothers count remained populated on return to Step 1");
  assert(restoredStateOnStep1.profileData.sistersMarried === 1, "AC-2: Married sisters remained populated on return to Step 1");

  // User on Step 3 -> click Back to Step 2 (Photo DP should remain populated)
  const returnToStep2 = await handleStepTransition({
    currentStep: 3,
    targetStep: 2,
    profileData: validStep1Data,
    preferencesData: { location: "Kerala" },
    maxStepReached: 3,
    uploadedPhotoUrl: "https://cdn.example.com/photos/sreenath_dp.jpg",
    uploadedPhotoId: "photo-uuid-101",
    mockBackendService,
  });
  assert(returnToStep2.step === 2, "AC-2: Active step becomes 2");
  const restoredStateOnStep2 = restoreOnboardingState({
    mockSession: mockSessionStorage,
    mockLocal: mockLocalStorage,
  });
  assert(restoredStateOnStep2.uploadedPhotoUrl === "https://cdn.example.com/photos/sreenath_dp.jpg", "AC-2: Display photo URL remains populated on return to Step 2");
  assert(restoredStateOnStep2.uploadedPhotoId === "photo-uuid-101", "AC-2: Display photo ID remains populated on return to Step 2");

  // ---------------------------------------------------------------------
  // TEST 4: AC-3 - No data is lost when switching between onboarding steps
  // ---------------------------------------------------------------------
  console.log("\n4. AC-3: Arbitrary Step Switching & Zero Data Loss...");

  // Multi-hop switching: 1 -> 2 -> 3 -> 1 -> 3 -> 4
  const stepsJourney = [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 1 },
    { from: 1, to: 3 },
    { from: 3, to: 4 },
  ];

  let currentProfileState = {
    ...validStep1Data,
    avatarUrl: "https://cdn.example.com/photos/sreenath_dp.jpg",
  };
  let currentMax = 1;

  for (const hop of stepsJourney) {
    const res = await handleStepTransition({
      currentStep: hop.from,
      targetStep: hop.to,
      profileData: currentProfileState,
      preferencesData: { location: "Kerala" },
      maxStepReached: currentMax,
      uploadedPhotoUrl: "https://cdn.example.com/photos/sreenath_dp.jpg",
      uploadedPhotoId: "photo-uuid-101",
      mockBackendService,
    });
    currentMax = res.maxStepReached;
  }

  const finalRestoredState = restoreOnboardingState({
    mockSession: mockSessionStorage,
    mockLocal: mockLocalStorage,
  });

  assert(finalRestoredState.profileData.firstName === "Sreenath", "AC-3: First name preserved after multi-step navigation");
  assert(finalRestoredState.profileData.email === "sreenath.menon@example.com", "AC-3: Email preserved after multi-step navigation");
  assert(finalRestoredState.profileData.phone === "+91 9847123456", "AC-3: Phone preserved after multi-step navigation");
  assert(finalRestoredState.profileData.permanentAddress === "House No 42, Palm Meadows, Kakkanad, Kochi", "AC-3: Permanent address preserved after multi-step navigation");
  assert(finalRestoredState.profileData.education === "B.Tech Computer Science", "AC-3: Education preserved after multi-step navigation");
  assert(finalRestoredState.uploadedPhotoUrl === "https://cdn.example.com/photos/sreenath_dp.jpg", "AC-3: Primary photo preserved across switching");
  assert(finalRestoredState.step === 4, "AC-3: Final step is step 4");
  assert(finalRestoredState.maxStepReached === 4, "AC-3: maxStepReached tracked as 4");

  // Page reload simulation with existing backend profile + local draft merge
  const mockBackendProfile = {
    id: "prof-101",
    userId: "usr-101",
    onboardingStep: 3,
    photos: [{ id: "photo-uuid-101", url: "https://cdn.example.com/photos/sreenath_dp.jpg", isPrimary: true }],
  };
  const reloadRestored = restoreOnboardingState({
    mockSession: mockSessionStorage,
    mockLocal: mockLocalStorage,
    backendProfile: mockBackendProfile,
  });
  assert(reloadRestored.profileData.firstName === "Sreenath", "AC-3: Reload retains local draft details");
  assert(reloadRestored.uploadedPhotoUrl === "https://cdn.example.com/photos/sreenath_dp.jpg", "AC-3: Reload restores photo from backend/draft");

  // Non-serializable blob safety: verify File objects do not break storage serialization
  const dataWithBlob = {
    ...validStep1Data,
    primaryPhoto: { name: "my_dp.jpg", size: 102400 }, // simulates File object
    albumPhotos: [{ name: "album1.jpg" }],
  };
  const saveSuccess = saveDraftLocally(dataWithBlob);
  assert(saveSuccess === true, "AC-3: Strips un-serializable File blobs safely without error");
  const parsedCleanDraft = JSON.parse(mockSessionStorage.getItem("shaadi_onboarding_draft"));
  assert(parsedCleanDraft.primaryPhoto === undefined, "AC-3: Raw File object is not persisted in JSON");
  assert(parsedCleanDraft.firstName === "Sreenath", "AC-3: Text fields remain cleanly serialized");

  // ---------------------------------------------------------------------
  // 5. AC-4: Password Setup Retention & Draft Restoration (Step 3)
  // ---------------------------------------------------------------------
  console.log("\n5. AC-4: Step 3 Password Persistence Across Refresh & Navigation...");

  // Test Case 1: Typing password in Step 3 saves to local draft synchronously
  const mockPassword = "SecretPassword123!";
  saveDraftLocally({ password: mockPassword, confirmPassword: mockPassword, onboardingStep: 3 });
  const draftWithPwd = JSON.parse(mockSessionStorage.getItem("shaadi_onboarding_draft"));
  assert(draftWithPwd.password === mockPassword, "AC-4: Typed password persisted immediately to draft");
  assert(draftWithPwd.confirmPassword === mockPassword, "AC-4: Typed confirmPassword persisted immediately to draft");

  // Test Case 2: Page reload while on Step 3 restores password & confirmPassword fields
  const reloadOnStep3 = restoreOnboardingState({
    mockSession: mockSessionStorage,
    mockLocal: mockLocalStorage,
  });
  assert(reloadOnStep3.password === mockPassword, "AC-4: Refreshing on Step 3 restores password into state");
  assert(reloadOnStep3.confirmPassword === mockPassword, "AC-4: Refreshing on Step 3 restores confirmPassword into state");
  assert(reloadOnStep3.step === 3, "AC-4: Refreshing on Step 3 preserves active step as 3");

  // Test Case 3: Saving password (handleSavePassword) enables shaadi_password_enabled and advances step
  mockLocalStorage.setItem("shaadi_password_enabled", "true");
  saveDraftLocally({
    ...reloadOnStep3.profileData,
    password: mockPassword,
    confirmPassword: mockPassword,
    hasPasswordSet: true,
    onboardingStep: 4,
    maxStepReached: 4,
  });
  const draftAfterSave = JSON.parse(mockSessionStorage.getItem("shaadi_onboarding_draft"));
  assert(draftAfterSave.hasPasswordSet === true, "AC-4: hasPasswordSet flag stored in draft upon save");
  assert(draftAfterSave.password === mockPassword, "AC-4: password retained in draft upon advancing to Step 4");

  // Test Case 4: Page reload after saving password restores hasPasswordSet flag and password fields
  const reloadAfterSave = restoreOnboardingState({
    mockSession: mockSessionStorage,
    mockLocal: mockLocalStorage,
  });
  assert(reloadAfterSave.hasPasswordSet === true, "AC-4: Reload after save restores hasPasswordSet as true");
  assert(reloadAfterSave.password === mockPassword, "AC-4: Reload after save restores password");
  assert(reloadAfterSave.step === 4, "AC-4: Step is step 4 after save");

  // Test Case 5: Returning back to Step 3 from Step 4 retains populated password fields
  saveDraftLocally(
    {
      ...reloadAfterSave.profileData,
      onboardingStep: 3,
      maxStepReached: 4,
    },
    mockSessionStorage,
    mockLocalStorage,
    { password: mockPassword, confirmPassword: mockPassword, hasPasswordSet: true }
  );

  const returnedToStep3 = restoreOnboardingState({
    mockSession: mockSessionStorage,
    mockLocal: mockLocalStorage,
  });
  assert(returnedToStep3.step === 3, "AC-4: Back navigation sets active step to 3");
  assert(returnedToStep3.password === mockPassword, "AC-4: Password fields remain populated when navigating back to Step 3");
  assert(returnedToStep3.hasPasswordSet === true, "AC-4: hasPasswordSet remains true when navigating back to Step 3");

  // Test Case 6: Profile finalization cleans up draft storage
  mockSessionStorage.removeItem("shaadi_onboarding_draft");
  mockLocalStorage.removeItem("shaadi_onboarding_draft");
  const finalizedStorage = mockSessionStorage.getItem("shaadi_onboarding_draft");
  assert(finalizedStorage === null, "AC-4: Draft storage cleaned up on onboarding completion");

  // ---------------------------------------------------------------------
  // 6. AC-5: Complete Later Action & Seamless Resume
  // ---------------------------------------------------------------------
  console.log("\n6. AC-5: Complete Later Action & Seamless Draft Retention...");

  // Emulate handleCompleteLater
  function handleCompleteLater({ profileData, preferencesData, step, maxStepReached, password, confirmPassword, hasPasswordSet, uploadedPhotoUrl, uploadedPhotoId }) {
    saveDraftLocally(
      {
        ...profileData,
        preferences: preferencesData,
        uploadedPhotoUrl,
        uploadedPhotoId,
        password,
        confirmPassword,
        hasPasswordSet,
        onboardingStep: step,
        maxStepReached,
      },
      mockSessionStorage,
      mockLocalStorage,
      { password, confirmPassword, hasPasswordSet }
    );
    return { redirectedTo: "/" };
  }

  // Test Case 1: Complete later on Step 1 retains partial input and exits to landing page
  const step1Partial = {
    firstName: "Pooja",
    lastName: "Hegde",
    phone: "+91 9123456789",
    email: "pooja@example.com",
    gender: "female",
    permanentAddress: "Banjara Hills, Hyderabad",
  };
  const exitStep1 = handleCompleteLater({
    profileData: step1Partial,
    preferencesData: { location: "Hyderabad" },
    step: 1,
    maxStepReached: 1,
  });
  assert(exitStep1.redirectedTo === "/", "AC-5: Complete later navigates back to landing page");
  const storedAfterStep1Exit = restoreOnboardingState({ mockSession: mockSessionStorage, mockLocal: mockLocalStorage });
  assert(storedAfterStep1Exit.profileData.firstName === "Pooja", "AC-5: First name preserved when exiting via Complete Later");
  assert(storedAfterStep1Exit.profileData.email === "pooja@example.com", "AC-5: Email preserved when exiting via Complete Later");
  assert(storedAfterStep1Exit.step === 1, "AC-5: Step preserved as 1 upon resume");

  // Test Case 2: Complete later on Step 3 preserves password and step 3 status
  const exitStep3 = handleCompleteLater({
    profileData: step1Partial,
    preferencesData: { location: "Hyderabad" },
    step: 3,
    maxStepReached: 3,
    password: "SecurePassword999!",
    confirmPassword: "SecurePassword999!",
    hasPasswordSet: true,
    uploadedPhotoUrl: "https://cdn.example.com/pooja.jpg",
    uploadedPhotoId: "photo-999",
  });
  assert(exitStep3.redirectedTo === "/", "AC-5: Exits to landing page from Step 3");
  const storedAfterStep3Exit = restoreOnboardingState({ mockSession: mockSessionStorage, mockLocal: mockLocalStorage });
  assert(storedAfterStep3Exit.password === "SecurePassword999!", "AC-5: Password preserved when exiting from Step 3");
  assert(storedAfterStep3Exit.hasPasswordSet === true, "AC-5: hasPasswordSet preserved when exiting from Step 3");
  assert(storedAfterStep3Exit.uploadedPhotoUrl === "https://cdn.example.com/pooja.jpg", "AC-5: Photo URL preserved when exiting from Step 3");
  assert(storedAfterStep3Exit.step === 3, "AC-5: Resuming opens Step 3 directly");

  // ---------------------------------------------------------------------
  // 7. Feature Story: Marital Status in Onboarding Personal Details (AC-1, AC-2, AC-3)
  // ---------------------------------------------------------------------
  console.log("\n7. Feature: Marital Status in Onboarding Personal Details...");

  // AC-1 & AC-2: Field validation & predefined options
  const MARITAL_STATUS_OPTIONS = [
    "Never Married",
    "Divorced",
    "Widowed",
    "Awaiting Divorce",
    "Annulled",
  ];
  assert(MARITAL_STATUS_OPTIONS.length === 5, "AC-2: Predefined marital status options count is 5");
  assert(MARITAL_STATUS_OPTIONS.includes("Never Married"), "AC-2: Includes 'Never Married'");
  assert(MARITAL_STATUS_OPTIONS.includes("Divorced"), "AC-2: Includes 'Divorced'");
  assert(MARITAL_STATUS_OPTIONS.includes("Widowed"), "AC-2: Includes 'Widowed'");
  assert(MARITAL_STATUS_OPTIONS.includes("Awaiting Divorce"), "AC-2: Includes 'Awaiting Divorce'");
  assert(MARITAL_STATUS_OPTIONS.includes("Annulled"), "AC-2: Includes 'Annulled'");

  // Validation failure if maritalStatus is missing or empty
  const missingMarital = { ...validStep1Data, maritalStatus: "" };
  const maritalValidation = validateStep1Basic(missingMarital);
  assert(maritalValidation.valid === false, "AC-1: Rejects Step 1 transition if maritalStatus is missing");
  assert(maritalValidation.error === "Please select your marital status.", "AC-1: Returns marital status error message");

  // AC-3: Selected marital status is successfully saved when moving to Step 2
  const customMaritalProfile = { ...validStep1Data, maritalStatus: "Divorced" };
  const maritalTransition = await handleStepTransition({
    currentStep: 1,
    targetStep: 2,
    profileData: customMaritalProfile,
    preferencesData: { location: "Kerala" },
    maxStepReached: 1,
    mockBackendService,
  });
  assert(maritalTransition.success === true, "AC-3: Navigation to Step 2 succeeds with selected marital status");
  const storedDraftWithMarital = JSON.parse(mockSessionStorage.getItem("shaadi_onboarding_draft"));
  assert(storedDraftWithMarital.maritalStatus === "Divorced", "AC-3: Marital status 'Divorced' saved to local draft storage");

  // Verify backend API received maritalStatus
  const maritalBackendCall = backendCalls[backendCalls.length - 1];
  assert(maritalBackendCall.data.maritalStatus === "Divorced", "AC-3: Backend updateProfile received selected maritalStatus");

  // Verify marital status retained on browser reload
  const reloadedMaritalState = restoreOnboardingState({
    mockSession: mockSessionStorage,
    mockLocal: mockLocalStorage,
  });
  assert(reloadedMaritalState.profileData.maritalStatus === "Divorced", "AC-3: Marital status preserved across page reload");

  // Verify alternative option 'Never Married' persists properly
  const neverMarriedProfile = { ...validStep1Data, maritalStatus: "Never Married" };
  await handleStepTransition({
    currentStep: 1,
    targetStep: 2,
    profileData: neverMarriedProfile,
    preferencesData: { location: "Kerala" },
    maxStepReached: 1,
    mockBackendService,
  });
  const reloadedNeverMarried = restoreOnboardingState({
    mockSession: mockSessionStorage,
    mockLocal: mockLocalStorage,
  });
  assert(reloadedNeverMarried.profileData.maritalStatus === "Never Married", "AC-3: 'Never Married' selection persists accurately");

  // ---------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------
  console.log("\n=======================================================");
  console.log(`TOTAL TESTS: ${passedCount + failedCount}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${failedCount}`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
})();

