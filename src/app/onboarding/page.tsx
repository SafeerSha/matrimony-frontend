"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowRight,
  IconArrowLeft,
  IconLoader2,
  IconUpload,
  IconCircleCheck,
  IconHeart,
  IconHeartHandshake,
  IconShieldCheck,
  IconLock,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconDeviceMobile,
  IconMail,
  IconUser,
  IconPhone,
  IconCamera,
  IconTrash,
  IconCalendar,
  IconMapPin,
  IconSchool,
  IconCoffee,
  IconWorld,
  IconHome,
  IconHomeHeart,
  IconUsers,
  IconSparkles,
} from "@tabler/icons-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/cn";
import { profileService, mediaService, authService, isDraftUser } from "@/services";
import { isEmailAuthMode } from "@/config/feature-flags";
import { toast } from "@/lib/toast";
import {
  DatePicker,
  EducationSelector,
  ProfessionCombobox,
  EmploymentStatusSelector,
  ModernSelect,
} from "@/components/ui";
import {
  CLIENT_EMPLOYMENT_OPTIONS,
  CLIENT_INCOME_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  RELIGION_OPTIONS,
  POPULAR_CASTES_BY_RELIGION,
  POPULAR_INDIAN_STATES,
  HEIGHT_OPTIONS_CM,
  POPULAR_EDUCATION_OPTIONS,
} from "@/lib/data/education-profession-data";

const STEPS = [
  { id: 1, label: "Personal", fullLabel: "Personal Details", isRequired: true },
  { id: 2, label: "Photo", fullLabel: "Profile Picture", isRequired: false },
  { id: 3, label: "Security", fullLabel: "Account Password", isRequired: false },
  { id: 4, label: "Album", fullLabel: "Album Photos", isRequired: true },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Form State
  const [draftInfo, setDraftInfo] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["marriage"]);
  const [profileData, setProfileData] = useState<any>({});
  const [preferencesData, setPreferencesData] = useState<any>({});

  // Progressive Onboarding & Auto-Save State
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "offline">("idle");
  const [maxStepReached, setMaxStepReached] = useState<number>(1);

  // Photo States (Step 2: Profile DP is Optional, Step 4: Album Photos is REQUIRED)
  const [primaryPhoto, setPrimaryPhoto] = useState<File | null>(null);
  const [uploadedPhotoId, setUploadedPhotoId] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<File[]>([]);
  const [existingAlbumPhotos, setExistingAlbumPhotos] = useState<Array<{ id: string; url: string; isPrimary?: boolean }>>([]);
  const [albumValidationError, setAlbumValidationError] = useState(false);

  // Optional Password Setup State (Step 3)
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [hasPasswordSet, setHasPasswordSet] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  // Progressive Persistence Helper: synchronously writes to sessionStorage & localStorage
  const saveDraftLocally = (data: any) => {
    if (typeof window !== "undefined") {
      try {
        let existingDraft: any = {};
        try {
          const stored = sessionStorage.getItem("shaadi_onboarding_draft") || localStorage.getItem("shaadi_onboarding_draft");
          if (stored) existingDraft = JSON.parse(stored);
        } catch {
          // ignore parsing error
        }

        const { primaryPhoto: _p, albumPhotos: _a, ...serializable } = data;

        const merged: any = {
          ...existingDraft,
          ...serializable,
        };

        // Preserve password fields so page reload or step switching never drops saved credentials
        if (serializable.password !== undefined) {
          merged.password = serializable.password;
        } else if (password) {
          merged.password = password;
        }

        if (serializable.confirmPassword !== undefined) {
          merged.confirmPassword = serializable.confirmPassword;
        } else if (confirmPassword) {
          merged.confirmPassword = confirmPassword;
        }

        if (serializable.hasPasswordSet !== undefined) {
          merged.hasPasswordSet = serializable.hasPasswordSet;
        } else if (hasPasswordSet || localStorage.getItem("shaadi_password_enabled") === "true") {
          merged.hasPasswordSet = true;
        }

        const json = JSON.stringify(merged);
        sessionStorage.setItem("shaadi_onboarding_draft", json);
        localStorage.setItem("shaadi_onboarding_draft", json);
      } catch (e) {
        console.warn("Failed saving onboarding draft to local storage:", e);
      }
    }
  };

  // Background Auto-Save Helper: sends non-blocking profile update to backend
  const triggerBackgroundAutoSave = async (targetStep: number, profileToSave: any, preferencesToSave?: any) => {
    setAutoSaveStatus("saving");
    try {
      const {
        primaryPhoto: _p,
        albumPhotos: _a,
        photos: _ph,
        password: _pwd,
        confirmPassword: _cpwd,
        hasPasswordSet: _hps,
        ...cleanProfile
      } = profileToSave;
      await profileService.updateProfile("me", {
        ...cleanProfile,
        onboardingStep: targetStep,
        preferences: preferencesToSave || preferencesData,
      });
      setAutoSaveStatus("saved");
      setTimeout(() => {
        setAutoSaveStatus((current) => (current === "saved" ? "idle" : current));
      }, 2500);
    } catch (err: any) {
      console.warn("Background auto-save fallback (data kept safe in local draft):", err);
      setAutoSaveStatus("offline");
      setTimeout(() => {
        setAutoSaveStatus((current) => (current === "offline" ? "idle" : current));
      }, 3000);
    }
  };

  // Validation helper for Step 1 mandatory fields
  const validateStep1Basic = (dataToValidate?: any) => {
    const data = dataToValidate || profileData;
    const firstNameVal = (data.firstName || draftInfo?.firstName || "").trim();
    if (!firstNameVal) {
      setError("Please enter your name.");
      return false;
    }
    const permanentAddressVal = (data.permanentAddress || "").trim();
    if (!permanentAddressVal) {
      setError("Permanent Address is mandatory. (Note: It will remain confidential and hidden from other users).");
      return false;
    }
    const isEmailAuth = isEmailAuthMode();
    const phoneVal = (data.phone || draftInfo?.phone || "").trim();
    if (!isEmailAuth && !phoneVal) {
      setError("Cell number is mandatory. (Note: It will remain confidential and hidden from other users).");
      return false;
    }
    const emailVal = (data.email || "").trim();
    if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setError("A valid Email ID is mandatory. (Note: It will remain confidential and hidden from other users).");
      return false;
    }
    const eduVal = (data.education || "").trim();
    if (!eduVal) {
      setError("Please specify your educational qualification.");
      return false;
    }
    const dobVal = data.dateOfBirth;
    if (!dobVal) {
      setError("Please select your date of birth.");
      return false;
    }
    const genderVal = (data.gender || "").trim();
    if (!genderVal) {
      setError("Please select gender.");
      return false;
    }
    const maritalVal = (data.maritalStatus || profileData.maritalStatus || "").trim();
    if (!maritalVal) {
      setError("Please select your marital status.");
      return false;
    }
    return true;
  };

  // Load draft data from landing page or existing backend session
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("shaadi_onboarding_draft") || localStorage.getItem("shaadi_onboarding_draft");
        if (stored) {
          const parsed = JSON.parse(stored);
          setDraftInfo(parsed);

          const normalizedGender = parsed.gender?.toLowerCase() || "";

          setProfileData((prev: any) => ({
            ...prev,
            firstName: parsed.firstName || prev.firstName || "",
            lastName: parsed.lastName || prev.lastName || "",
            gender: normalizedGender || prev.gender || "",
            maritalStatus: parsed.maritalStatus || prev.maritalStatus || "Never Married",
            phone: parsed.phone || prev.phone || "",
            email: parsed.email || prev.email || "",
            profileFor: parsed.profileFor || prev.profileFor || "Marriage",
            createdBy: parsed.createdBy || prev.createdBy || "",
            category: parsed.category || parsed.profileFor || prev.category || "Marriage",
            lookingIn: parsed.lookingIn || prev.lookingIn || "",
            nationality: parsed.nationality || prev.nationality || "Indian",
            state: parsed.state || prev.state || "Kerala",
            city: parsed.city || prev.city || "",
            fatherName: parsed.fatherName || prev.fatherName || "",
            religion: parsed.religion || prev.religion || "Christian",
            caste: parsed.caste || prev.caste || "Roman Catholic Syrian Christian",
            permanentAddress: parsed.permanentAddress || prev.permanentAddress || "",
            height: parsed.height || prev.height || "170 cm",
            employmentStatus: parsed.employmentStatus || prev.employmentStatus || "Govt. Employ",
            income: parsed.income || parsed.annualIncome || prev.income || prev.annualIncome || "5 to 12 lakhs",
            annualIncome: parsed.annualIncome || parsed.income || prev.annualIncome || prev.income || "5 to 12 lakhs",
            fatherAlive: parsed.fatherAlive !== undefined ? parsed.fatherAlive : prev.fatherAlive !== undefined ? prev.fatherAlive : true,
            motherAlive: parsed.motherAlive !== undefined ? parsed.motherAlive : prev.motherAlive !== undefined ? prev.motherAlive : true,
            brothersCount: parsed.brothersCount ?? prev.brothersCount ?? 0,
            brothersMarried: parsed.brothersMarried ?? prev.brothersMarried ?? 0,
            sistersCount: parsed.sistersCount ?? prev.sistersCount ?? 0,
            sistersMarried: parsed.sistersMarried ?? prev.sistersMarried ?? 0,
            bio: parsed.bio || prev.bio || "",
          }));

          if (parsed.uploadedPhotoUrl) {
            setUploadedPhotoUrl(parsed.uploadedPhotoUrl);
          }
          if (parsed.uploadedPhotoId) {
            setUploadedPhotoId(parsed.uploadedPhotoId);
          }
          if (parsed.maxStepReached) {
            setMaxStepReached(Math.min(Math.max(parsed.maxStepReached, 1), 4));
          }
          if (parsed.onboardingStep) {
            const safeDraftStep = Math.min(Math.max(parsed.onboardingStep, 1), 4) as 1 | 2 | 3 | 4;
            setStep(safeDraftStep);
            setMaxStepReached((prev) => Math.max(prev, safeDraftStep));
          }

          if (parsed.preferences) {
            setPreferencesData((prev: any) => ({
              ...prev,
              ...parsed.preferences,
            }));
          }

          if (parsed.password) {
            setPassword(parsed.password);
          }
          if (parsed.confirmPassword) {
            setConfirmPassword(parsed.confirmPassword);
          } else if (parsed.password) {
            setConfirmPassword(parsed.password);
          }

          if (
            parsed.hasPasswordSet ||
            (typeof window !== "undefined" && localStorage.getItem("shaadi_password_enabled") === "true")
          ) {
            setHasPasswordSet(true);
          }

          if (parsed.lookingIn) {
            setPreferencesData((prev: any) => ({
              ...prev,
              location: prev.location || parsed.lookingIn,
              locations: prev.locations?.length ? prev.locations : [parsed.lookingIn],
            }));
          }

          if (parsed.profileFor || parsed.category) {
            const rawCat = (parsed.category || parsed.profileFor).toLowerCase();
            const catId = rawCat.includes("friend")
              ? "friendship"
              : rawCat.includes("living")
              ? "living_together"
              : "marriage";
            setSelectedCategories([catId]);
          }
        }
      } catch (err) {
        console.warn("Failed reading local onboarding draft:", err);
      }

      if (typeof window !== "undefined" && localStorage.getItem("shaadi_password_enabled") === "true") {
        setHasPasswordSet(true);
      }

      // If user has an active session on backend, populate latest state
      profileService
        .getProfile("me")
        .then((profile) => {
          if (profile) {
            // If the user is already active and completed onboarding, do not restart onboarding
            if (!isDraftUser(profile)) {
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("shaadi_onboarding_draft");
                localStorage.removeItem("shaadi_onboarding_draft");
              }
              authService.refreshToken().catch(() => {}).finally(() => {
                window.location.href = "/app/discover";
              });
              return;
            }

            setProfileData((prev: any) => ({
              ...profile,
              ...prev,
              gender: profile.gender?.toLowerCase() || prev.gender || "",
              maritalStatus: profile.maritalStatus || prev.maritalStatus || "Never Married",
            }));
            if (profile.preferences) {
              setPreferencesData((prev: any) => ({ ...profile.preferences, ...prev }));
            }

            // Restore photos from backend if present
            if (profile.photos && Array.isArray(profile.photos) && profile.photos.length > 0) {
              const primaryP = profile.photos.find((p: any) => p.isPrimary);
              if (primaryP) {
                setUploadedPhotoUrl(primaryP.url);
                setUploadedPhotoId(primaryP.id);
              } else if (profile.avatarUrl) {
                setUploadedPhotoUrl(profile.avatarUrl);
              }
              const nonPrimary = profile.photos.filter((p: any) => !p.isPrimary);
              if (nonPrimary.length > 0) {
                setExistingAlbumPhotos(nonPrimary);
              }
            } else if (profile.avatarUrl) {
              setUploadedPhotoUrl(profile.avatarUrl);
            }

            if (profile.onboardingStep && profile.onboardingStep >= 1) {
              const safeStep = Math.min(profile.onboardingStep, 4) as 1 | 2 | 3 | 4;
              setStep((curr) => {
                const target = Math.max(curr, safeStep) as 1 | 2 | 3 | 4;
                setMaxStepReached((prevMax) => Math.max(prevMax, target));
                return target;
              });
            }
          }
        })
        .catch(() => {
          // Safe to ignore if not yet authenticated
        });

      router.prefetch("/");
    }
  }, [router]);

  // Auto-save draft locally whenever form inputs change (debounced 400ms)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!profileData || Object.keys(profileData).length === 0) return;

    const timer = setTimeout(() => {
      saveDraftLocally({
        ...draftInfo,
        ...profileData,
        preferences: preferencesData,
        uploadedPhotoId,
        uploadedPhotoUrl,
        password,
        confirmPassword,
        hasPasswordSet,
        onboardingStep: step,
        maxStepReached,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [profileData, preferencesData, step, maxStepReached, uploadedPhotoId, uploadedPhotoUrl, password, confirmPassword, hasPasswordSet]);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    let updatedProfile = { ...profileData };
    let updatedPreferences = { ...preferencesData };

    if (step === 1) {
      setError(null);

      // 1. Name
      const firstNameVal = (formData.get("firstName") as string || profileData.firstName || "").trim();
      const lastNameVal = (formData.get("lastName") as string || profileData.lastName || "").trim();
      if (!firstNameVal) {
        setError("Please enter your name.");
        return;
      }

      // 5. Permanent Address - Strictly Mandatory
      const permanentAddressVal = (formData.get("permanentAddress") as string || profileData.permanentAddress || "").trim();
      if (!permanentAddressVal) {
        setError("Permanent Address is mandatory. (Note: It will remain confidential and hidden from other users).");
        return;
      }

      // 6. Cell Number - Mandatory in SMS mode, optional in Email mode
      const isEmailAuth = isEmailAuthMode();
      const phoneVal = (formData.get("phone") as string || profileData.phone || draftInfo?.phone || "").trim();
      if (!isEmailAuth && !phoneVal) {
        setError("Cell number is mandatory. (Note: It will remain confidential and hidden from other users).");
        return;
      }

      // 6. Email ID - Strictly Mandatory
      const emailVal = (formData.get("email") as string || profileData.email || "").trim();
      if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        setError("A valid Email ID is mandatory. (Note: It will remain confidential and hidden from other users).");
        return;
      }

      // 2. Nationality & State
      const nationalityVal = (formData.get("nationality") as string || profileData.nationality || "Indian").trim();
      const stateVal = (formData.get("state") as string || profileData.state || "Kerala").trim();
      const cityVal = (formData.get("city") as string || profileData.city || "").trim();

      // 3. Father's Name
      const fatherNameVal = (formData.get("fatherName") as string || profileData.fatherName || "").trim();

      // 4. Religion and Caste
      const religionVal = (formData.get("religion") as string || profileData.religion || "").trim();
      const casteVal = (formData.get("caste") as string || profileData.caste || "").trim();

      // 7. Educational qualification
      const eduVal = (formData.get("education") as string || profileData.education || "").trim();
      if (!eduVal) {
        setError("Please specify your educational qualification.");
        return;
      }

      // 8. Present Employment
      const employmentStatusVal = (formData.get("employmentStatus") as string || profileData.employmentStatus || "").trim();

      // 9. Annual Income
      const incomeVal = (formData.get("income") as string || profileData.income || "").trim();

      // 10. Height
      const heightVal = (formData.get("height") as string || profileData.height || "").trim();

      // Other baseline details
      const dobVal = formData.get("dob") as string || profileData.dateOfBirth;
      if (!dobVal) {
        setError("Please select your date of birth.");
        return;
      }

      const genderVal = (formData.get("gender") as string || profileData.gender || "").trim().toLowerCase();
      if (!genderVal) {
        setError("Please select gender.");
        return;
      }

      const maritalStatusVal = (formData.get("maritalStatus") as string || profileData.maritalStatus || "Never Married").trim();
      if (!maritalStatusVal) {
        setError("Please select your marital status.");
        return;
      }

      const profVal = (
        (formData.get("profession") as string) ||
        (formData.get("occupation") as string) ||
        profileData.occupation ||
        ""
      ).trim();

      // 11. Family details
      const fatherAliveVal = profileData.fatherAlive !== false;
      const motherAliveVal = profileData.motherAlive !== false;
      const rawBrothersCount = formData.get("brothersCount");
      const rawBrothersMarried = formData.get("brothersMarried");
      const rawSistersCount = formData.get("sistersCount");
      const rawSistersMarried = formData.get("sistersMarried");

      const brothersCountVal = rawBrothersCount !== null ? Number(rawBrothersCount) : (profileData.brothersCount ?? 0);
      const brothersMarriedVal = rawBrothersMarried !== null ? Number(rawBrothersMarried) : (profileData.brothersMarried ?? 0);
      const sistersCountVal = rawSistersCount !== null ? Number(rawSistersCount) : (profileData.sistersCount ?? 0);
      const sistersMarriedVal = rawSistersMarried !== null ? Number(rawSistersMarried) : (profileData.sistersMarried ?? 0);

      updatedProfile = {
        ...updatedProfile,
        firstName: firstNameVal,
        lastName: lastNameVal,
        name: `${firstNameVal} ${lastNameVal}`.trim(),
        nationality: nationalityVal,
        state: stateVal,
        city: cityVal,
        fatherName: fatherNameVal,
        religion: religionVal,
        caste: casteVal,
        permanentAddress: permanentAddressVal,
        phone: phoneVal,
        email: emailVal,
        education: eduVal,
        employmentStatus: employmentStatusVal,
        income: incomeVal,
        annualIncome: incomeVal,
        height: heightVal,
        occupation: profVal || employmentStatusVal,
        profession: profVal || employmentStatusVal,
        gender: genderVal,
        maritalStatus: maritalStatusVal,
        dateOfBirth: new Date(dobVal).toISOString(),
        fatherAlive: fatherAliveVal,
        motherAlive: motherAliveVal,
        brothersCount: isNaN(brothersCountVal) ? 0 : brothersCountVal,
        brothersMarried: isNaN(brothersMarriedVal) ? 0 : brothersMarriedVal,
        sistersCount: isNaN(sistersCountVal) ? 0 : sistersCountVal,
        sistersMarried: isNaN(sistersMarriedVal) ? 0 : sistersMarriedVal,
        bio: (formData.get("family") as string || profileData.bio || "").trim(),
      };
      setProfileData(updatedProfile);

      // Verify and persist Step 1 to backend immediately so 409 email conflicts are caught upfront
      setIsLoading(true);
      try {
        await profileService.updateProfile("me", {
          ...updatedProfile,
          preferences: updatedPreferences,
          onboardingStep: 2,
        });
      } catch (err: any) {
        setIsLoading(false);
        const errMsg = err?.message || "";
        if (
          err?.status === 409 ||
          err?.statusCode === 409 ||
          errMsg.toLowerCase().includes("already associated") ||
          errMsg.toLowerCase().includes("already exists") ||
          errMsg.toLowerCase().includes("conflict")
        ) {
          setEmailError("This email address is already associated with another account.");
          setError("This email address is already in use by another account. Please use a different email or sign in to your existing account.");
          toast.error("Email Already Registered", "Please use a different email address.");
          return;
        }
        // For other network/mock warnings, continue
      } finally {
        setIsLoading(false);
      }

      // Immediately persist Step 1 to local draft storage
      saveDraftLocally({
        ...draftInfo,
        ...updatedProfile,
        preferences: updatedPreferences,
        onboardingStep: 2,
        maxStepReached: Math.max(maxStepReached, 2),
      });
      setMaxStepReached((prev) => Math.max(prev, 2));
      setStep(2);
      triggerBackgroundAutoSave(2, updatedProfile, updatedPreferences);
      return;
    }

    if (step === 2) {
      setIsLoading(true);
      let photoUrlToSave = uploadedPhotoUrl;
      let photoIdToSave = uploadedPhotoId;

      if (primaryPhoto && !uploadedPhotoId) {
        try {
          const uploadRes = await mediaService.uploadPhoto(primaryPhoto, true);
          if (uploadRes?.id) {
            photoIdToSave = uploadRes.id;
            setUploadedPhotoId(uploadRes.id);
            await mediaService.setPrimaryPhoto(uploadRes.id).catch(() => {});
          }
          if (uploadRes?.url) {
            photoUrlToSave = uploadRes.url;
            setUploadedPhotoUrl(uploadRes.url);
          }
        } catch (photoErr) {
          console.warn("Primary photo upload failed during step 2 save:", photoErr);
        }
      }

      const updated = {
        ...profileData,
        ...(photoUrlToSave ? { avatarUrl: photoUrlToSave, photoUrl: photoUrlToSave } : {}),
      };
      setProfileData(updated);

      saveDraftLocally({
        ...draftInfo,
        ...updated,
        preferences: preferencesData,
        uploadedPhotoId: photoIdToSave,
        uploadedPhotoUrl: photoUrlToSave,
        onboardingStep: 3,
        maxStepReached: Math.max(maxStepReached, 3),
      });

      setMaxStepReached((prev) => Math.max(prev, 3));
      setStep(3);
      setIsLoading(false);
      triggerBackgroundAutoSave(3, updated);
      return;
    }

    // Auto-save step progress in background for subsequent steps
    if (step > 2) {
      saveDraftLocally({
        ...draftInfo,
        ...updatedProfile,
        preferences: updatedPreferences,
        onboardingStep: Math.min(step + 1, 4),
        maxStepReached: Math.max(maxStepReached, Math.min(step + 1, 4)),
      });
      triggerBackgroundAutoSave(Math.min(step + 1, 4), updatedProfile, updatedPreferences);
    }

    if (step < 4) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const getDisplayName = () => {
    return (
      [profileData.firstName || draftInfo?.firstName, profileData.lastName || draftInfo?.lastName]
        .filter(Boolean)
        .join(" ") ||
      draftInfo?.name ||
      "Profile"
    );
  };

  const getUserBaseName = () => {
    return getDisplayName().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "_") || "Profile";
  };

  const handleBack = () => {
    if (step > 1) {
      const prevStep = (step - 1) as 1 | 2 | 3 | 4;
      setError(null);
      setPasswordError(null);

      // Save progress so returning retains all details
      saveDraftLocally({
        ...draftInfo,
        ...profileData,
        preferences: preferencesData,
        uploadedPhotoId,
        uploadedPhotoUrl,
        onboardingStep: prevStep,
        maxStepReached,
      });

      setStep(prevStep);
      triggerBackgroundAutoSave(prevStep, profileData);
    }
  };

  const handleStepClick = (targetStep: 1 | 2 | 3 | 4) => {
    if (targetStep === step) return;

    // Disallow jumping ahead if target step is beyond what has been reached
    if (targetStep > Math.max(step, maxStepReached)) {
      if (step === 1 && !validateStep1Basic()) {
        return;
      }
    }

    // If leaving step 1, validate basic fields
    if (step === 1 && targetStep > 1) {
      if (!validateStep1Basic()) return;
    }

    setError(null);
    setPasswordError(null);

    // Synchronously save current step data to guarantee no loss
    saveDraftLocally({
      ...draftInfo,
      ...profileData,
      preferences: preferencesData,
      uploadedPhotoId,
      uploadedPhotoUrl,
      onboardingStep: targetStep,
      maxStepReached: Math.max(maxStepReached, targetStep),
    });

    setMaxStepReached((prev) => Math.max(prev, targetStep));
    setStep(targetStep);
    triggerBackgroundAutoSave(targetStep, profileData);
  };

  // Step 3: Profile Photo Handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const cleanName = getUserBaseName();
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
      const renamedFile = new File([file], `${cleanName}_Profile_DP.${ext}`, { type: file.type });
      setPrimaryPhoto(renamedFile);
      setUploadedPhotoId(null);
      setUploadedPhotoUrl(null);
    }
  };

  // Step 4: Required Album Photos Handler
  const handleAlbumPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      const cleanName = getUserBaseName();

      const renamed = selected.map((file, idx) => {
        const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
        const fileIndex = albumPhotos.length + idx + 1;
        const isFirstAndNoPrimary = !primaryPhoto && albumPhotos.length === 0 && idx === 0;
        const fileName = isFirstAndNoPrimary
          ? `${cleanName}_Profile_DP.${ext}`
          : `${cleanName}_Album_${fileIndex}.${ext}`;
        return new File([file], fileName, { type: file.type });
      });

      setAlbumPhotos((prev) => [...prev, ...renamed].slice(0, 6));
      setError(null);
      setAlbumValidationError(false);
      if (albumInputRef.current) {
        albumInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAlbumPhoto = (indexToRemove: number) => {
    setAlbumPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Unified Onboarding Finalization
  const finalizeOnboarding = async (source: "complete" | "skip_to_finish") => {
    setIsLoading(true);
    setError(null);

    // Step 4 requires at least 1 album photo
    if (source === "complete" && albumPhotos.length === 0 && existingAlbumPhotos.length === 0) {
      setAlbumValidationError(true);
      setError("At least one album photo is mandatory to complete profile setup.");
      toast.error("Album Photo Mandatory", "At least one album photo is mandatory to complete your profile setup.");
      setIsLoading(false);
      return;
    }

    try {
      let hasPrimarySet = false;
      let primaryPhotoUrl = uploadedPhotoUrl;
      let primaryPhotoIdVal = uploadedPhotoId;

      // 1. Upload primary profile photo if selected in Step 2
      if (primaryPhoto && !uploadedPhotoId) {
        try {
          const uploadRes = await mediaService.uploadPhoto(primaryPhoto, true);
          if (uploadRes?.id) {
            primaryPhotoIdVal = uploadRes.id;
            await mediaService.setPrimaryPhoto(uploadRes.id).catch(() => {});
            hasPrimarySet = true;
          }
          if (uploadRes?.url) {
            primaryPhotoUrl = uploadRes.url;
          }
        } catch (photoErr) {
          console.warn("Primary photo upload failed during onboarding:", photoErr);
        }
      } else if (uploadedPhotoId) {
        hasPrimarySet = true;
      }

      // 2. Upload album photos (Step 4)
      // Note: If Step 2 was skipped without a DP, the FIRST album photo becomes Primary DP!
      const allPhotoRecords: { id: string; url: string; isPrimary: boolean }[] = [];
      if (primaryPhotoIdVal && primaryPhotoUrl) {
        allPhotoRecords.push({ id: primaryPhotoIdVal, url: primaryPhotoUrl, isPrimary: true });
      }

      for (let i = 0; i < albumPhotos.length; i++) {
        const file = albumPhotos[i];
        const shouldBePrimary = !hasPrimarySet && i === 0;
        try {
          const uploadRes = await mediaService.uploadPhoto(file, shouldBePrimary);
          if (uploadRes?.id && uploadRes?.url) {
            if (shouldBePrimary) {
              await mediaService.setPrimaryPhoto(uploadRes.id).catch(() => {});
              hasPrimarySet = true;
              primaryPhotoUrl = uploadRes.url;
            }
            allPhotoRecords.push({
              id: uploadRes.id,
              url: uploadRes.url,
              isPrimary: shouldBePrimary,
            });
          }
        } catch (albumErr) {
          console.warn(`Album photo ${i + 1} upload failed during onboarding:`, albumErr);
        }
      }

      // 3. Save Preferences
      if (Object.keys(preferencesData).length > 0) {
        await profileService.updatePreferences("me", preferencesData).catch(() => {});
      }

      // 4. Save Profile details with photo gallery & avatarUrl
      const profilePayload: any = {
        ...profileData,
        isVerified: true,
      };
      if (allPhotoRecords.length > 0) {
        profilePayload.photos = allPhotoRecords;
        if (primaryPhotoUrl) {
          profilePayload.avatarUrl = primaryPhotoUrl;
          profilePayload.photoUrl = primaryPhotoUrl;
        }
      }
      await profileService.updateProfile("me", profilePayload).catch(() => {});

      // 5. Complete Onboarding on backend:
      // Always pass skipPhotoCheck: true so backend does not block if photos are still processing
      await profileService.completeOnboarding({
        email: profileData.email,
        phone: profileData.phone,
        permanentAddress: profileData.permanentAddress,
        fatherName: profileData.fatherName,
        nationality: profileData.nationality,
        state: profileData.state,
        religion: profileData.religion,
        caste: profileData.caste,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        height: profileData.height,
        education: profileData.education,
        occupation: profileData.occupation,
        profession: profileData.profession || profileData.occupation,
        employmentStatus: profileData.employmentStatus,
        income: profileData.annualIncome || profileData.income,
        annualIncome: profileData.annualIncome || profileData.income,
        fatherAlive: profileData.fatherAlive !== false,
        motherAlive: profileData.motherAlive !== false,
        brothersCount: profileData.brothersCount || 0,
        brothersMarried: profileData.brothersMarried || 0,
        sistersCount: profileData.sistersCount || 0,
        sistersMarried: profileData.sistersMarried || 0,
        bio: profileData.bio,
        maritalStatus: profileData.maritalStatus,
        city: profileData.city,
        country: profileData.country,
        skipPhotoCheck: true,
      });

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("shaadi_onboarding_draft");
        localStorage.removeItem("shaadi_onboarding_draft");
      }

      // Refresh auth tokens so the updated ACTIVE status is stored in cookies and session
      await authService.refreshToken().catch(() => {});

      toast.flash(
        "success",
        "Profile Setup Complete!",
        "Your profile is active! Exploring compatible matches."
      );

      setTimeout(() => {
        window.location.href = "/app/discover";
      }, 400);
    } catch (err: any) {
      console.warn("Onboarding finalization fallback:", err);
      const errMsg = err?.message || "";
      if (
        err?.status === 409 ||
        err?.statusCode === 409 ||
        errMsg.toLowerCase().includes("already associated") ||
        errMsg.toLowerCase().includes("conflict")
      ) {
        setStep(1);
        setEmailError("This email address is already associated with another account.");
        setError("This email is already associated with another account. Please update your email address in Step 1.");
        toast.error("Email Conflict", "This email address is already registered.");
        setIsLoading(false);
        return;
      }
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("shaadi_onboarding_draft");
        localStorage.removeItem("shaadi_onboarding_draft");
      }
      await authService.refreshToken().catch(() => {});
      toast.flash(
        "success",
        "Profile Setup Complete!",
        "Welcome to IshtamChat! Exploring compatible matches."
      );
      setTimeout(() => {
        window.location.href = "/app/discover";
      }, 400);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipToFinish = async () => {
    await finalizeOnboarding("skip_to_finish");
  };

  // Skip a single optional step to advance to next (Steps 2, 3)
  const handleSkipSingleStep = () => {
    setError(null);
    if (step === 2) {
      saveDraftLocally({
        ...draftInfo,
        ...profileData,
        preferences: preferencesData,
        uploadedPhotoId,
        uploadedPhotoUrl,
        onboardingStep: 3,
        maxStepReached: Math.max(maxStepReached, 3),
      });
      setMaxStepReached((prev) => Math.max(prev, 3));
      setStep(3);
      triggerBackgroundAutoSave(3, profileData);
      toast.info("Step skipped", "You can always configure this section later in your profile settings.");
    } else if (step === 3) {
      handleSkipPassword();
    } else {
      // Step 4 cannot be skipped because at least 1 album photo is required
      setError("Please upload at least one album photo to activate your profile.");
      toast.error("Album Photo Required", "At least one album photo is required.");
    }
  };

  // Step 3: Save Optional Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match. Please re-enter.");
      return;
    }

    setIsSavingPassword(true);
    try {
      await authService.setPassword(password);
      setHasPasswordSet(true);
      toast.success(
        "Password saved",
        "You can now also sign in using your email/phone and password!"
      );
    } catch (err: any) {
      const msg = err.message || "Failed to set password. You can still skip this step.";
      setPasswordError(msg);
      toast.error("Error setting password", msg);
      setIsSavingPassword(false);
      return;
    } finally {
      setIsSavingPassword(false);
    }

    setHasPasswordSet(true);
    saveDraftLocally({
      ...draftInfo,
      ...profileData,
      preferences: preferencesData,
      uploadedPhotoId,
      uploadedPhotoUrl,
      password,
      confirmPassword,
      hasPasswordSet: true,
      onboardingStep: 4,
      maxStepReached: Math.max(maxStepReached, 4),
    });
    setMaxStepReached((prev) => Math.max(prev, 4));
    setStep(4);
    triggerBackgroundAutoSave(4, profileData);
  };

  // Step 3: Skip Password Setup
  const handleSkipPassword = () => {
    setPasswordError(null);
    if (hasPasswordSet) {
      toast.info("Password retained", "Your existing password remains saved for your account.");
    } else {
      toast.info("Step skipped", "You can continue signing in anytime using Mobile OTP.");
    }

    saveDraftLocally({
      ...draftInfo,
      ...profileData,
      preferences: preferencesData,
      uploadedPhotoId,
      uploadedPhotoUrl,
      password,
      confirmPassword,
      hasPasswordSet,
      onboardingStep: 4,
      maxStepReached: Math.max(maxStepReached, 4),
    });
    setMaxStepReached((prev) => Math.max(prev, 4));
    setStep(4);
    triggerBackgroundAutoSave(4, profileData);
  };

  // Complete Later Handler: saves all current progress and returns to landing page
  const handleCompleteLater = () => {
    // 1. Synchronously persist current progress to local draft storage
    saveDraftLocally({
      ...draftInfo,
      ...profileData,
      preferences: preferencesData,
      uploadedPhotoId,
      uploadedPhotoUrl,
      password,
      confirmPassword,
      hasPasswordSet,
      onboardingStep: step,
      maxStepReached,
    });

    // 2. Trigger asynchronous background auto-save to backend
    triggerBackgroundAutoSave(step, profileData);

    // 3. Inform the user with reassurance that progress is preserved
    toast.info("Progress saved", "Your profile details have been saved safely. You can complete onboarding anytime!");

    // 4. Navigate back to landing page
    router.push("/");
  };

  const handleRemoveExistingAlbumPhoto = async (photoId: string) => {
    setExistingAlbumPhotos((prev) => prev.filter((p) => p.id !== photoId));
    try {
      await mediaService.deletePhoto(photoId);
    } catch (e) {
      console.warn("Failed deleting album photo:", e);
    }
  };

  // Step 4: Final Complete (delegates to finalizeOnboarding)
  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (albumPhotos.length === 0 && existingAlbumPhotos.length === 0) {
      setAlbumValidationError(true);
      setError("At least one album photo is mandatory to complete profile setup.");
      toast.error("Album Photo Mandatory", "At least one album photo is mandatory to complete your profile setup.");
      return;
    }
    await finalizeOnboarding("complete");
  };

  // Determine active registration stream & community for onboarding badges & messaging
  const getRegistrationBadge = () => {
    const cat = String(
      draftInfo?.category ||
      draftInfo?.profileFor ||
      profileData?.category ||
      profileData?.profileFor ||
      ""
    ).toLowerCase();

    const community = String(
      draftInfo?.lookingIn ||
      draftInfo?.community ||
      profileData?.lookingIn ||
      preferencesData?.location ||
      ""
    ).toLowerCase();

    // Marriage variants
    if (cat.includes("marriage") || cat === "") {
      if (community.includes("kerala")) {
        return {
          label: "Kerala Matrimony",
          colorClass: "bg-[#FDF2F4] border-[#F7C6CE] text-[#7A1835]",
          icon: IconHeartHandshake,
        };
      }
      if (community.includes("telugu")) {
        return {
          label: "Telugu Matrimony",
          colorClass: "bg-[#FAF3EC] border-[#EAD8C7] text-[#8C5D2C]",
          icon: IconHeartHandshake,
        };
      }
      if (community.includes("bharat")) {
        return {
          label: "Bharat Matrimony",
          colorClass: "bg-[#F0F7F4] border-[#C8E4D6] text-[#1E7E52]",
          icon: IconWorld,
        };
      }
      return {
        label: "Matrimony",
        colorClass: "bg-[#FDF2F4] border-[#F7C6CE] text-[#7A1835]",
        icon: IconHeartHandshake,
      };
    }

    // Friendship
    if (cat.includes("friend")) {
      return {
        label: "Friendship",
        colorClass: "bg-[#FAF5FF] border-[#E9D5FF] text-[#7E22CE]",
        icon: IconUsers,
      };
    }

    // Living Together
    if (cat.includes("living")) {
      return {
        label: "Living Together",
        colorClass: "bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]",
        icon: IconHomeHeart,
      };
    }

    return {
      label: "Matrimony",
      colorClass: "bg-[#FDF2F4] border-[#F7C6CE] text-[#7A1835]",
      icon: IconHeartHandshake,
    };
  };

  const regBadge = getRegistrationBadge();
  const RegIcon = regBadge.icon;

  return (
    <main className="relative min-h-screen w-full bg-[var(--background)] flex flex-col">
      {/* 1. Subtle Botanical Leaf Corner Accents (Safely bounded so they never cause scroll overflow) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="absolute top-0 left-0 origin-top-left -translate-x-[6%] -translate-y-[8%] opacity-60 sm:opacity-75 lg:opacity-85 hidden sm:block">
          <div className="relative aspect-[3/2] w-36 sm:w-44 md:w-56 lg:w-72 drop-shadow-[0_12px_24px_rgba(10,50,30,0.12)] animate-botanical-float-left">
            <Image
              src="/images/green-leaves.png"
              alt=""
              width={576}
              height={384}
              priority
              quality={85}
              className="h-full w-full object-contain object-top-left"
            />
          </div>
        </div>

        <div className="absolute bottom-0 right-0 origin-bottom-right translate-x-[6%] translate-y-[8%] opacity-60 sm:opacity-75 lg:opacity-85 hidden sm:block">
          <div className="relative aspect-[3/2] w-36 sm:w-44 md:w-56 lg:w-72 drop-shadow-[0_12px_24px_rgba(10,50,30,0.12)] animate-botanical-float-right">
            <Image
              src="/images/green-leaves.png"
              alt=""
              width={576}
              height={384}
              priority
              quality={85}
              className="h-full w-full object-contain object-bottom-right rotate-180"
            />
          </div>
        </div>
      </div>


      {/* 2. Sticky Luxury Navigation & Step Progress Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)]/80 bg-white/90 backdrop-blur-xl">
        <div className={cn(
          "mx-auto flex h-16 sm:h-20 items-center justify-between px-3 sm:px-6 transition-all duration-300 gap-2 sm:gap-4",
          step === 1 ? "max-w-5xl xl:max-w-6xl" : "max-w-5xl"
        )}>
          <Logo href="/" className="shrink-0" />

          {/* Desktop Stepper Breadcrumbs */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            {STEPS.map((s) => {
              const isPast = step > s.id;
              const isCurrent = step === s.id;
              const isAccessible = s.id <= Math.max(step, maxStepReached);

              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={!isAccessible}
                  onClick={() => isAccessible && handleStepClick(s.id as 1 | 2 | 3 | 4)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border whitespace-nowrap shrink-0",
                    isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                    isCurrent
                      ? "bg-[#80132E] text-white shadow-xs font-bold ring-2 ring-[#D89B65]/30 border-[#80132E]"
                      : isPast
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70"
                      : isAccessible
                      ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80"
                      : "bg-slate-100/90 text-slate-400 border-transparent"
                  )}
                  title={isAccessible ? `Go to Step ${s.id}: ${s.label}` : `Complete earlier steps to access ${s.label}`}
                >
                  {isPast ? (
                    <IconCheck className="h-3 w-3 text-emerald-600 stroke-[3]" />
                  ) : (
                    <span className="text-[11px] font-mono">{s.id}</span>
                  )}
                  <span>{s.label}</span>
                  {s.isRequired ? (
                    <span
                      className={cn(
                        "text-[9px] px-1 py-0.2 rounded font-semibold uppercase tracking-wider",
                        isCurrent ? "bg-white/20 text-white" : "text-amber-800 bg-amber-50"
                      )}
                    >
                      Req
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "text-[9px] px-1 py-0.2 rounded font-normal",
                        isCurrent ? "bg-white/15 text-white/90" : "text-slate-400"
                      )}
                    >
                      Opt
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Header Action: Step Badge, Auto-save Status & Complete Later */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Live Auto-save status feedback */}
            {autoSaveStatus === "saving" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full animate-pulse shadow-2xs whitespace-nowrap shrink-0">
                <IconLoader2 className="w-3 h-3 animate-spin text-amber-600 shrink-0" />
                <span className="hidden sm:inline">Saving progress...</span>
                <span className="sm:hidden">Saving...</span>
              </span>
            )}
            {autoSaveStatus === "saved" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full shadow-2xs animate-in fade-in duration-300 whitespace-nowrap shrink-0">
                <IconCheck className="w-3 h-3 text-emerald-600 stroke-[3] shrink-0" />
                <span className="hidden sm:inline">Progress saved</span>
                <span className="sm:hidden">Saved</span>
              </span>
            )}
            {autoSaveStatus === "offline" && (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full shadow-2xs whitespace-nowrap shrink-0" title="Changes saved locally on device">
                <IconShieldCheck className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="hidden sm:inline">Saved locally</span>
                <span className="sm:hidden">Saved</span>
              </span>
            )}

            {STEPS.find((s) => s.id === step)?.isRequired ? (
              <span className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-[#80132E] bg-[#FDF2F4] border border-[#80132E]/20 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-2xs whitespace-nowrap shrink-0">
                <span className="hidden sm:inline">Step {step} of 4</span>
                <span className="sm:hidden font-bold">Step {step}/4</span>
                <span className="hidden md:inline-block w-1 h-1 rounded-full bg-[#80132E]" />
                <span className="hidden md:inline font-bold">Required</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-2xs whitespace-nowrap shrink-0">
                <span className="hidden sm:inline">Step {step} of 4</span>
                <span className="sm:hidden">Step {step}/4</span>
                <span className="hidden md:inline-block w-1 h-1 rounded-full bg-slate-400" />
                <span className="hidden md:inline">Optional</span>
              </span>
            )}

            {/* Complete Later Button */}
            <button
              type="button"
              onClick={handleCompleteLater}
              className="focus-ring inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-2 rounded-xl border border-[var(--border)] bg-white text-xs font-semibold text-[var(--muted-strong)] hover:text-[#80132E] hover:border-[#80132E]/30 hover:bg-[#FDF2F4]/70 transition-all shadow-2xs cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
              title="Save progress and return to landing page. You can complete your profile anytime."
            >
              <IconHome className="h-3.5 w-3.5 text-[var(--muted)] shrink-0" />
              <span className="hidden sm:inline">Complete Later</span>
              <span className="sm:hidden">Later</span>
            </button>
          </div>
        </div>

        {/* Multi-Segmented Luxury Progress Track */}
        <div className={cn(
          "grid grid-cols-4 gap-1.5 w-full px-4 sm:px-6 pb-2 pt-0.5 mx-auto transition-all duration-300",
          step === 1 ? "max-w-5xl xl:max-w-6xl" : "max-w-5xl"
        )}>
          {STEPS.map((s) => {
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            const isAccessible = s.id <= Math.max(step, maxStepReached);

            return (
              <button
                key={s.id}
                type="button"
                disabled={!isAccessible}
                onClick={() => isAccessible && handleStepClick(s.id as 1 | 2 | 3 | 4)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 block w-full p-0 border-0",
                  isAccessible ? "cursor-pointer hover:opacity-80" : "cursor-default",
                  isCompleted
                    ? "bg-[#80132E]"
                    : isCurrent
                    ? "bg-gradient-to-r from-[#80132E] to-[#D89B65] shadow-xs"
                    : "bg-slate-200/80"
                )}
                title={`${s.label} (${s.isRequired ? "Required" : "Optional"})${isAccessible ? " - Click to navigate" : ""}`}
              />
            );
          })}
        </div>
      </header>

      {/* 3. Form Wizard Card Container */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className={cn(
          "w-full bg-white/95 backdrop-blur-xl rounded-3xl border border-[var(--border)] shadow-[0_24px_70px_rgba(92,16,39,0.08)] overflow-hidden transition-all duration-300",
          step === 1 ? "max-w-5xl xl:max-w-6xl" : "max-w-2xl"
        )}>
          <div className="p-6 sm:p-8 lg:p-10">
            {error && step === 1 && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-sm text-red-700 animate-in fade-in"
              >
                {error}
              </div>
            )}

            {/* ========================================================================= */}
            {/* Step 1: Personal & Contact Details (MANDATORY CORE PROFILE IDENTITY)       */}
            {/* ========================================================================= */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2.5">
                    {draftInfo?.name && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3EC] border border-[#D89B65]/40 text-[#8C5D2C] text-xs font-bold shadow-2xs">
                        <IconHeartHandshake className="h-3.5 w-3.5 text-[#D89B65]" />
                        <span>Welcome, {draftInfo.firstName || draftInfo.name}</span>
                      </div>
                    )}
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs transition-all animate-in fade-in zoom-in-95 duration-200",
                        regBadge.colorClass
                      )}
                    >
                      <RegIcon className="h-3.5 w-3.5 shrink-0" />
                      <span>{regBadge.label}</span>
                    </div>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
                    Personal & Contact Details
                  </h1>
                  <p className="mt-1.5 text-sm text-[var(--muted)] leading-relaxed">
                    Please complete your{" "}
                    <span className="font-bold text-[#80132E]">
                      {regBadge.label}
                    </span>{" "}
                    profile and confirm your core profile information.
                  </p>
                </div>

                {/* Helpful Information Notice: Highlighting required baseline steps */}
                <div className="mb-6 p-3.5 rounded-2xl bg-[#FAF3EC]/80 border border-[#D89B65]/35 flex items-start gap-3">
                  <div className="text-xs text-amber-950 leading-relaxed">
                    <span className="font-bold text-[#8C5D2C]">Essential Profile Setup: </span>
                    <span className="text-slate-700">
                      Personal Details (Step 1) and Album Photos (Step 4) are required to activate your account and discover compatible matches. Profile photo and password can be completed now or updated later in your profile. Partner preferences can be customized anytime directly on the Discover page.
                    </span>
                  </div>
                </div>

                <form onSubmit={handleNext} className="space-y-6">
                  {/* Two-Column Responsive Layout for Desktop Mode */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-start">
                    
                    {/* LEFT COLUMN: Identity, Religion, Caste, and Confidential Details */}
                    <div className="space-y-5">
                      
                      {/* Card 1: Personal Identity & Origin */}
                      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[var(--border)] shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]/60">
                          <IconUser className="w-5 h-5 text-[#80132E]" />
                          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                            1. Personal & Family Identity
                          </h2>
                        </div>

                        {/* 1. Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">
                              First Name / Name <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                name="firstName"
                                type="text"
                                required
                                value={profileData.firstName ?? draftInfo?.firstName ?? ""}
                                onChange={(e) =>
                                  setProfileData((prev: any) => ({ ...prev, firstName: e.target.value }))
                                }
                                placeholder="e.g. S Georgekutty"
                                className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 pl-10 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition"
                              />
                              <IconUser className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">
                              Last Name / Initial
                            </label>
                            <div className="relative">
                              <input
                                name="lastName"
                                type="text"
                                value={profileData.lastName ?? draftInfo?.lastName ?? ""}
                                onChange={(e) =>
                                  setProfileData((prev: any) => ({ ...prev, lastName: e.target.value }))
                                }
                                placeholder="e.g. Sebastian"
                                className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 pl-10 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition"
                              />
                              <IconUser className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                            </div>
                          </div>
                        </div>

                        {/* 2. Nationality, State & City */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">
                              Nationality <span className="text-rose-500">*</span>
                            </label>
                            <input
                              name="nationality"
                              type="text"
                              required
                              value={profileData.nationality ?? "Indian"}
                              onChange={(e) =>
                                setProfileData((prev: any) => ({ ...prev, nationality: e.target.value }))
                              }
                              placeholder="e.g. Indian"
                              className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition"
                            />
                          </div>

                          <div>
                            <ModernSelect
                              label="State"
                              required
                              name="state"
                              value={profileData.state ?? "Kerala"}
                              options={POPULAR_INDIAN_STATES.map((s) => ({ value: s, label: s }))}
                              onChange={(val) =>
                                setProfileData((prev: any) => ({ ...prev, state: val }))
                              }
                              placeholder="Select State"
                              maxHeight="max-h-[220px]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">
                              City / District
                            </label>
                            <input
                              name="city"
                              type="text"
                              value={profileData.city ?? ""}
                              onChange={(e) =>
                                setProfileData((prev: any) => ({ ...prev, city: e.target.value }))
                              }
                              placeholder="e.g. Kochi, Kozhikode"
                              className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition"
                            />
                          </div>
                        </div>

                        {/* 3. Father's Name */}
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">
                            Father's Name
                          </label>
                          <input
                            name="fatherName"
                            type="text"
                            value={profileData.fatherName ?? ""}
                            onChange={(e) =>
                              setProfileData((prev: any) => ({ ...prev, fatherName: e.target.value }))
                            }
                            placeholder="e.g. Sebastian"
                            className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition"
                          />
                        </div>

                        {/* 4. Religion and Caste */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <ModernSelect
                              label="Religion"
                              required
                              name="religion"
                              value={profileData.religion || "Christian"}
                              options={RELIGION_OPTIONS.map((r) => ({ value: r, label: r }))}
                              onChange={(val) => {
                                const availableCastes = POPULAR_CASTES_BY_RELIGION[val] || ["Other"];
                                const defaultCaste = availableCastes[0] || "Other";
                                setProfileData((prev: any) => ({
                                  ...prev,
                                  religion: val,
                                  caste: availableCastes.includes(prev.caste) ? prev.caste : defaultCaste,
                                }));
                              }}
                              placeholder="Select Religion"
                              maxHeight="max-h-[220px]"
                            />
                          </div>

                          <div>
                            <ModernSelect
                              label="Caste / Community"
                              required
                              name="caste"
                              value={profileData.caste || (POPULAR_CASTES_BY_RELIGION[profileData.religion || "Christian"]?.[0] || "")}
                              options={(() => {
                                const list = POPULAR_CASTES_BY_RELIGION[profileData.religion || "Christian"] || ["Other"];
                                const opts = list.map((c) => ({ value: c, label: c }));
                                if (profileData.caste && !list.includes(profileData.caste)) {
                                  opts.unshift({ value: profileData.caste, label: profileData.caste });
                                }
                                return opts;
                              })()}
                              onChange={(val) =>
                                setProfileData((prev: any) => ({ ...prev, caste: val }))
                              }
                              placeholder="Select Caste / Community"
                              maxHeight="max-h-[220px]"
                            />
                          </div>
                        </div>

                        {/* Gender & Date of Birth */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <ModernSelect
                              label="Gender"
                              required
                              name="gender"
                              value={profileData.gender || ""}
                              onChange={(val) =>
                                setProfileData((prev: any) => ({ ...prev, gender: val }))
                              }
                              options={[
                                { value: "female", label: "Female" },
                                { value: "male", label: "Male" },
                              ]}
                              placeholder="Select Gender"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">
                              Date of Birth <span className="text-rose-500">*</span>
                            </label>
                            <DatePicker
                              name="dob"
                              required
                              defaultValue={profileData.dateOfBirth}
                              onChange={(d) => {
                                if (d) {
                                  setProfileData((prev: any) => ({
                                    ...prev,
                                    dateOfBirth: d.toISOString(),
                                  }));
                                }
                              }}
                              placeholder="Select Date of Birth"
                              minAge={18}
                              maxAge={70}
                            />
                          </div>
                        </div>

                        {/* Height & Marital Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <ModernSelect
                              label="Height"
                              required
                              name="height"
                              value={profileData.height ?? "170 cm"}
                              options={HEIGHT_OPTIONS_CM.map((h) => ({ value: h.value, label: h.label }))}
                              onChange={(val) =>
                                setProfileData((prev: any) => ({ ...prev, height: val }))
                              }
                              placeholder="Select Height"
                              maxHeight="max-h-[220px]"
                            />
                          </div>

                          <div>
                            <ModernSelect
                              label="Marital Status"
                              required
                              name="maritalStatus"
                              value={profileData.maritalStatus || "Never Married"}
                              options={MARITAL_STATUS_OPTIONS.map((st) => ({
                                value: st,
                                label: st,
                              }))}
                              onChange={(val) =>
                                setProfileData((prev: any) => ({ ...prev, maritalStatus: val }))
                              }
                              placeholder="Select Marital Status"
                              maxHeight="max-h-[220px]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card 2: Confidential Contact & Permanent Address (Blended with standard card styles) */}
                      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[var(--border)] shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/60">
                          <div className="flex items-center gap-2">
                            <IconLock className="w-5 h-5 text-[#80132E]" />
                            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                              Contact & Address
                            </h2>
                          </div>
                          {/* <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--muted-strong)] bg-slate-50 px-2.5 py-1 rounded-full border border-[var(--border)]">
                            <IconLock className="w-3.5 h-3.5 text-[var(--muted)]" /> Hidden from public profile
                          </span> */}
                        </div>

                        <p className="text-xs text-[var(--muted)] leading-relaxed">
                          Your permanent address, cell number, and email ID are collected strictly for verified membership records and will never be shared publicly.
                        </p>

                        {/* 5. Permanent Address */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)]">
                              5. Permanent Address <span className="text-rose-500">*</span>
                            </label>
                            {/* <span className="text-[11px] font-medium text-[var(--muted)] flex items-center gap-1">
                              <IconLock className="w-3 h-3 text-[var(--muted)]" /> Hidden from profile
                            </span> */}
                          </div>
                          <textarea
                            name="permanentAddress"
                            required
                            rows={3}
                            value={profileData.permanentAddress ?? ""}
                            onChange={(e) =>
                              setProfileData((prev: any) => ({ ...prev, permanentAddress: e.target.value }))
                            }
                            placeholder="Enter your permanent residential address"
                            className="w-full rounded-xl border border-[var(--border)] bg-white p-3.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition resize-y"
                          />
                        </div>

                        {/* 6. Cell Number & Mail ID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)]">
                                6. Cell Number {isEmailAuthMode() ? <span className="text-[10px] text-slate-400 normal-case font-normal">(Optional)</span> : <span className="text-rose-500">*</span>}
                              </label>
                              {/* <span className="text-[11px] font-medium text-[var(--muted)] flex items-center gap-1">
                                <IconLock className="w-3 h-3 text-[var(--muted)]" /> Hidden
                              </span> */}
                            </div>
                            <div className="relative">
                              <input
                                name="phone"
                                type="tel"
                                required={!isEmailAuthMode()}
                                value={profileData.phone ?? draftInfo?.phone ?? ""}
                                onChange={(e) =>
                                  setProfileData((prev: any) => ({ ...prev, phone: e.target.value }))
                                }
                                placeholder="+91 9876543210"
                                className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 pl-10 text-sm font-medium text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition"
                              />
                              <IconPhone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)]">
                                6. Mail ID <span className="text-rose-500">*</span>
                              </label>
                              {/* <span className="text-[11px] font-medium text-[var(--muted)] flex items-center gap-1">
                                <IconLock className="w-3 h-3 text-[var(--muted)]" /> Hidden
                              </span> */}
                            </div>
                            <div className="relative">
                              <input
                                name="email"
                                type="email"
                                required
                                value={profileData.email ?? ""}
                                onChange={(e) => {
                                  setEmailError(null);
                                  setProfileData((prev: any) => ({ ...prev, email: e.target.value }));
                                }}
                                placeholder="name@example.com"
                                className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 pl-10 text-sm font-medium text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition"
                              />
                              <IconMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* RIGHT COLUMN: Education, Employment, Income, and Family Details */}
                    <div className="space-y-5">
                      
                      {/* Card 3: Education & Career */}
                      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[var(--border)] shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]/60">
                          <IconSchool className="w-5 h-5 text-[#80132E]" />
                          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                            Education & Career
                          </h2>
                        </div>

                        {/* 7. Educational qualification */}
                        <div>
                          <ModernSelect
                            label="7. Educational Qualification"
                            required
                            name="education"
                            value={profileData.education ?? "MA"}
                            options={(() => {
                              const opts = [...POPULAR_EDUCATION_OPTIONS];
                              if (
                                profileData.education &&
                                !opts.some(
                                  (o) =>
                                    o.value.toLowerCase() === profileData.education.toLowerCase() ||
                                    o.label.toLowerCase() === profileData.education.toLowerCase()
                                )
                              ) {
                                opts.unshift({
                                  value: profileData.education,
                                  label: profileData.education,
                                  description: "Custom / Selected",
                                });
                              }
                              return opts;
                            })()}
                            onChange={(val) =>
                              setProfileData((prev: any) => ({ ...prev, education: val }))
                            }
                            placeholder="Select Educational Qualification"
                            searchable
                            maxHeight="max-h-[260px]"
                          />
                        </div>

                        {/* 8. Present Employment & 9. Annual Income */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <ModernSelect
                              label="8. Present Employment"
                              required
                              name="employmentStatus"
                              value={profileData.employmentStatus ?? "Govt. Employ"}
                              options={CLIENT_EMPLOYMENT_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
                              onChange={(val) =>
                                setProfileData((prev: any) => ({ ...prev, employmentStatus: val }))
                              }
                              placeholder="Select Employment"
                              maxHeight="max-h-[220px]"
                            />
                          </div>

                          <div>
                            <ModernSelect
                              label="9. Annual Income"
                              required
                              name="income"
                              value={profileData.annualIncome || profileData.income || "5 to 12 lakhs"}
                              options={CLIENT_INCOME_OPTIONS.map((opt) => ({ value: opt, label: opt }))}
                              onChange={(val) =>
                                setProfileData((prev: any) => ({ ...prev, income: val, annualIncome: val }))
                              }
                              placeholder="Select Income"
                              maxHeight="max-h-[220px]"
                            />
                          </div>
                        </div>

                        {/* Job Title / Profession */}
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">
                            Job Title / Profession Designation
                          </label>
                          <input
                            name="profession"
                            type="text"
                            value={profileData.occupation ?? profileData.profession ?? ""}
                            onChange={(e) =>
                              setProfileData((prev: any) => ({
                                ...prev,
                                occupation: e.target.value,
                                profession: e.target.value,
                              }))
                            }
                            placeholder="e.g. Higher Secondary Teacher / Officer"
                            className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition"
                          />
                        </div>
                      </div>

                      {/* Card 4: 11. Family Details */}
                      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[var(--border)] shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]/60">
                          <IconUsers className="w-5 h-5 text-[#80132E]" />
                          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                            11. Family Details
                          </h2>
                        </div>

                        {/* Father & Mother Living Ticks */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-[var(--border)]/60">
                          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--foreground)]">
                            <input
                              type="checkbox"
                              name="fatherAlive"
                              checked={profileData.fatherAlive !== false}
                              onChange={(e) =>
                                setProfileData((prev: any) => ({ ...prev, fatherAlive: e.target.checked }))
                              }
                              className="h-4 w-4 rounded text-[#80132E] focus:ring-[#80132E]"
                            />
                            <span>Father (Living / Alive)</span>
                          </label>

                          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--foreground)]">
                            <input
                              type="checkbox"
                              name="motherAlive"
                              checked={profileData.motherAlive !== false}
                              onChange={(e) =>
                                setProfileData((prev: any) => ({ ...prev, motherAlive: e.target.checked }))
                              }
                              className="h-4 w-4 rounded text-[#80132E] focus:ring-[#80132E]"
                            />
                            <span>Mother (Living / Alive)</span>
                          </label>
                        </div>

                        {/* a. Brothers count and married status */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1">
                              Brothers Count
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              name="brothersCount"
                              value={profileData.brothersCount ?? 0}
                              onChange={(e) =>
                                setProfileData((prev: any) => ({ ...prev, brothersCount: Number(e.target.value) }))
                              }
                              className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1">
                              Married Brothers
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={profileData.brothersCount ?? 10}
                              name="brothersMarried"
                              value={profileData.brothersMarried ?? 0}
                              onChange={(e) =>
                                setProfileData((prev: any) => ({ ...prev, brothersMarried: Number(e.target.value) }))
                              }
                              className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                            />
                          </div>
                        </div>

                        {/* b. Sisters count and married status */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1">
                              Sisters Count
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              name="sistersCount"
                              value={profileData.sistersCount ?? 0}
                              onChange={(e) =>
                                setProfileData((prev: any) => ({ ...prev, sistersCount: Number(e.target.value) }))
                              }
                              className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1">
                              Married Sisters
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={profileData.sistersCount ?? 10}
                              name="sistersMarried"
                              value={profileData.sistersMarried ?? 0}
                              onChange={(e) =>
                                setProfileData((prev: any) => ({ ...prev, sistersMarried: Number(e.target.value) }))
                              }
                              className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                            />
                          </div>
                        </div>

                        {/* Family Background Notes */}
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">
                            Family Values & About Profile
                          </label>
                          <textarea
                            name="family"
                            rows={3}
                            value={profileData.bio ?? profileData.family ?? ""}
                            onChange={(e) =>
                              setProfileData((prev: any) => ({
                                ...prev,
                                bio: e.target.value,
                                family: e.target.value,
                              }))
                            }
                            placeholder="Additional details about your family, values, and lifestyle..."
                            className="w-full rounded-xl border border-[var(--border)] bg-white p-3.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition resize-y"
                          />
                        </div>
                      </div>

                    </div>

                  </div>

                  <div className="pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-[var(--border)]/70">
                    <button
                      type="button"
                      onClick={handleCompleteLater}
                      className="focus-ring inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--surface-muted)] px-5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--border)] transition-all cursor-pointer"
                    >
                      <IconHome className="h-4 w-4 text-[var(--muted)]" />
                      <span>Complete Later</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="focus-ring inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-deep)] transition-all cursor-pointer active-press disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <IconLoader2 className="h-4 w-4 animate-spin" />
                          <span>Saving Profile...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue to Profile Photo</span>
                          <IconArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* Step 2: Primary Photo Upload (OPTIONAL / SKIPPABLE)                       */}
            {/* ========================================================================= */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2.5 border border-slate-200">
                    <span>Optional Step 2 of 4</span>
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                    <span className="text-emerald-700 font-semibold">Optional</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
                    Profile Picture (Optional)
                  </h1>
                  <p className="mt-1.5 text-sm text-[var(--muted)]">
                    You can upload a main display photo now, or skip this step and add photos directly to your album in Step 4.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleNext} className="space-y-6">
                  {(primaryPhoto || uploadedPhotoUrl) ? (
                    <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-6 flex flex-col items-center text-center">
                      <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-md mb-3 relative bg-slate-100">
                        <img
                          src={primaryPhoto ? URL.createObjectURL(primaryPhoto) : uploadedPhotoUrl!}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold mb-2 shadow-2xs">
                        <IconCircleCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Primary Profile DP</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 truncate max-w-xs">
                        {getDisplayName()} — Profile DP
                      </h4>
                      <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                        <IconCircleCheck className="h-3.5 w-3.5 text-emerald-600" />
                        Selected as your main profile photo
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-semibold text-[var(--primary)] bg-white px-3.5 py-1.5 rounded-lg border border-[var(--border)] shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                        >
                          Change Photo
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (uploadedPhotoId) {
                              mediaService.deletePhoto(uploadedPhotoId).catch(() => {});
                            }
                            setPrimaryPhoto(null);
                            setUploadedPhotoId(null);
                            setUploadedPhotoUrl(null);
                            setProfileData((prev: any) => ({ ...prev, avatarUrl: null, photoUrl: null }));
                            saveDraftLocally({
                              ...draftInfo,
                              ...profileData,
                              avatarUrl: null,
                              photoUrl: null,
                              uploadedPhotoId: null,
                              uploadedPhotoUrl: null,
                              onboardingStep: 2,
                            });
                          }}
                          className="text-xs font-semibold text-rose-600 bg-white px-3.5 py-1.5 rounded-lg border border-rose-200 shadow-2xs hover:bg-rose-50 transition cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--border)] rounded-2xl bg-[var(--surface-muted)] p-10 sm:p-12 text-center hover:bg-[var(--primary)]/5 hover:border-[var(--primary)]/30 transition-colors cursor-pointer group"
                    >
                      <div className="h-16 w-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-[var(--primary)] group-hover:scale-105 transition-transform">
                        <IconUpload className="h-8 w-8" />
                      </div>
                      <h3 className="text-sm font-semibold text-[var(--foreground)]">
                        Click to upload your display picture (Optional)
                      </h3>
                      <p className="text-xs text-[var(--muted)] mt-1.5">JPEG, PNG, JPG up to 5MB (You can also skip and add photos in Step 4)</p>
                      <button
                        type="button"
                        className="mt-5 text-xs font-semibold text-[var(--primary)] bg-white px-4 py-2 rounded-lg shadow-sm border border-[var(--border)] group-hover:border-[var(--primary)]/30"
                      >
                        Browse Files
                      </button>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />

                  {/* Watermark Privacy Notice */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    <IconShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Your photo is watermarked and privacy-protected against unauthorized downloads.</span>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--border)]/70">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="focus-ring inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--surface-muted)] px-5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--border)] transition-all order-2 sm:order-1 cursor-pointer"
                    >
                      <IconArrowLeft className="h-4 w-4" /> Back to Personal Details
                    </button>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end order-1 sm:order-2">
                      <button
                        type="button"
                        onClick={handleSkipSingleStep}
                        className="text-xs sm:text-sm font-semibold text-[var(--muted)] hover:text-[#80132E] px-3 py-2 transition cursor-pointer"
                      >
                        Skip for now →
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-deep)] transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <IconLoader2 className="h-4 w-4 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <span>{primaryPhoto ? "Save Photo & Continue" : "Continue"}</span>
                            <IconArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setStep(4)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[#80132E] transition cursor-pointer"
                    >
                      <IconShieldCheck className="h-3.5 w-3.5 text-[#D89B65]" />
                      <span>Skip to Album Photos (Step 4) →</span>
                    </button>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Profile picture is optional. You will add at least 1 photo to your album in Step 4.
                    </p>
                  </div> */}
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* Step 3: Account Security / Optional Password (OPTIONAL / SKIPPABLE)        */}
            {/* ========================================================================= */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2.5">
                    <IconShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Optional Step 3 of 4 • Security</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
                    Set a Login Password
                  </h1>
                  <p className="mt-1.5 text-sm text-[var(--muted)] leading-relaxed">
                    You can always log in with Mobile OTP. Setting a password is optional and enables email login.
                  </p>
                </div>

                {passwordError && (
                  <div
                    role="alert"
                    className="mb-4 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs sm:text-sm text-red-700"
                  >
                    {passwordError}
                  </div>
                )}

                {/* Mobile OTP / Password Status Highlight */}
                {hasPasswordSet ? (
                  <div className="mb-6 p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <IconShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="text-xs text-emerald-950 leading-relaxed">
                      <p className="font-semibold text-emerald-900 flex items-center gap-2">
                        <span>Password Configured & Saved</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200/80 text-emerald-900">
                          Active
                        </span>
                      </p>
                      <p className="mt-0.5 text-emerald-800/90">
                        Your account password has been saved. You can enter a new password below anytime if you wish to change it, or continue forward.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <IconDeviceMobile className="h-5 w-5" />
                    </div>
                    <div className="text-xs text-emerald-950 leading-relaxed">
                      <p className="font-semibold text-emerald-900">
                        {isEmailAuthMode() ? "Recommended: Set your account password" : "Mobile OTP login is already active"}
                      </p>
                      <p className="mt-0.5 text-emerald-800/90">
                        {isEmailAuthMode()
                          ? "Set a password to easily sign in anytime using your email address. You can also sign in via Email OTP."
                          : "If you prefer not to create a password right now, feel free to skip this step. You can sign in anytime via SMS OTP."}
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSavePassword} className="space-y-5">
                  <div className="space-y-4">
                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">
                        Create Password (Min 8 characters)
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--muted)]">
                          <IconLock className="h-5 w-5" />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPassword(val);
                            if (passwordError) setPasswordError(null);
                            saveDraftLocally({ password: val });
                          }}
                          placeholder="Enter new password"
                          className="h-12 w-full rounded-xl border border-[var(--border)] bg-white pl-11 pr-12 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] p-1.5 rounded-lg cursor-pointer"
                        >
                          {showPassword ? (
                            <IconEyeOff className="h-4 w-4" />
                          ) : (
                            <IconEye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--muted)]">
                          <IconLock className="h-5 w-5" />
                        </span>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            const val = e.target.value;
                            setConfirmPassword(val);
                            if (passwordError) setPasswordError(null);
                            saveDraftLocally({ confirmPassword: val });
                          }}
                          placeholder="Re-enter password"
                          className="h-12 w-full rounded-xl border border-[var(--border)] bg-white pl-11 pr-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--border)]/70">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="focus-ring inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--surface-muted)] px-5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--border)] transition-all order-2 sm:order-1 cursor-pointer"
                    >
                      <IconArrowLeft className="h-4 w-4" /> Back to Profile Photo
                    </button>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end order-1 sm:order-2">
                      <button
                        type="button"
                        onClick={handleSkipPassword}
                        className="text-xs sm:text-sm font-semibold text-[var(--muted)] hover:text-[#80132E] px-3 py-2 transition cursor-pointer"
                      >
                        {hasPasswordSet ? "Continue with saved password →" : "Skip for now →"}
                      </button>
                      <button
                        type="submit"
                        disabled={isSavingPassword || !password}
                        className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-deep)] transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isSavingPassword ? (
                          <>
                            <IconLoader2 className="h-4 w-4 animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : hasPasswordSet ? (
                          <>
                            <span>Update & Continue</span>
                            <IconArrowRight className="h-4 w-4" />
                          </>
                        ) : (
                          <>
                            <span>Save & Continue</span>
                            <IconArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (albumPhotos.length > 0) {
                          handleSkipToFinish();
                        } else {
                          setStep(4);
                          toast.info("Album Photo Required", "Please upload at least one album photo to complete your profile.");
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[#80132E] transition cursor-pointer"
                    >
                      <span>Continue to Album Photos (Step 4) →</span>
                    </button>
                  </div> */}
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* Step 4: Album Photos (REQUIRED: At least 1 photo)                          */}
            {/* ========================================================================= */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF2F4] text-[#80132E] text-xs font-semibold mb-2.5 border border-[#80132E]/20 shadow-2xs">
                    <span>Step 4 of 4</span>
                    <span className="w-1 h-1 rounded-full bg-[#80132E]" />
                    <span className="font-bold">Required</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
                    Album Photos
                  </h1>
                  <p className="mt-1.5 text-sm text-[var(--muted)] max-w-md mx-auto">
                    Upload clear photos to your profile album to activate your profile and start discovering compatible matches.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleComplete} className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-strong)]">
                        Album Photos <span className="text-rose-500">* (At least 1 required)</span>
                      </label>
                      {/* <span className="text-xs text-slate-500 font-medium">
                        {albumPhotos.length} of 6 photos selected
                      </span> */}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                      {/* Render existing saved album photos */}
                      {existingAlbumPhotos.map((photo, idx) => (
                        <div
                          key={`existing-${photo.id}`}
                          className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-emerald-200 bg-slate-100 shadow-xs flex flex-col justify-between p-2.5 transition-all"
                        >
                          <img
                            src={photo.url}
                            alt={`Saved Photo ${idx + 1}`}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                          <div className="relative z-10 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-700/90 text-white text-[10px] font-bold shadow-xs backdrop-blur-xs">
                              <IconCircleCheck className="w-3 h-3" />
                              Saved Photo
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingAlbumPhoto(photo.id)}
                              className="h-7 w-7 rounded-full bg-white/90 text-rose-600 hover:bg-rose-600 hover:text-white transition flex items-center justify-center shadow-xs cursor-pointer"
                              title="Remove photo"
                            >
                              <IconTrash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="relative z-10 bg-black/65 backdrop-blur-xs text-white px-2 py-1 rounded-lg text-[11px] font-medium truncate">
                            {getDisplayName()} — Photo {idx + 1}
                          </div>
                        </div>
                      ))}

                      {/* Render newly selected album photo files */}
                      {albumPhotos.map((file, idx) => {
                        const totalIdx = existingAlbumPhotos.length + idx;
                        const isFirstSlot = totalIdx === 0;
                        const isFirstAndNoDp = !primaryPhoto && !uploadedPhotoUrl && isFirstSlot;

                        return (
                          <div
                            key={`new-${idx}`}
                            className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-xs flex flex-col justify-between p-2.5 transition-all"
                          >
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Album Photo ${totalIdx + 1}`}
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                            <div className="relative z-10 flex items-center justify-between">
                              {isFirstAndNoDp ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold shadow-xs backdrop-blur-xs">
                                  <IconCircleCheck className="w-3 h-3" />
                                  Primary DP
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs">
                                  Photo {totalIdx + 1}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveAlbumPhoto(idx)}
                                className="h-7 w-7 rounded-full bg-white/90 text-rose-600 hover:bg-rose-600 hover:text-white transition flex items-center justify-center shadow-xs cursor-pointer"
                                title="Remove photo"
                              >
                                <IconTrash className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="relative z-10 bg-black/65 backdrop-blur-xs text-white px-2 py-1 rounded-lg text-[11px] font-medium truncate">
                              {getDisplayName()} — {isFirstAndNoDp ? "Profile DP" : `Photo ${totalIdx + 1}`}
                            </div>
                          </div>
                        );
                      })}

                      {/* Render empty placeholders up to limit */}
                      {Array.from({
                        length: Math.max(1, Math.min(4 - (existingAlbumPhotos.length + albumPhotos.length), 6 - (existingAlbumPhotos.length + albumPhotos.length)))
                      }).map((_, placeholderIdx) => {
                        const totalCount = existingAlbumPhotos.length + albumPhotos.length;
                        const isFirstEmptyPlaceholder = totalCount === 0 && placeholderIdx === 0;
                        const isHighlightRed = isFirstEmptyPlaceholder && albumValidationError;

                        return (
                          <div
                            key={`placeholder-${placeholderIdx}`}
                            onClick={() => albumInputRef.current?.click()}
                            className={cn(
                              "aspect-square rounded-2xl flex flex-col items-center justify-center p-3 sm:p-4 text-center cursor-pointer transition-all group relative",
                              isHighlightRed
                                ? "border-2 border-dashed border-rose-500 bg-rose-50/80 ring-4 ring-rose-400/30 shadow-md animate-pulse"
                                : isFirstEmptyPlaceholder
                                ? "border-2 border-dashed border-[#D89B65]/70 hover:border-[#80132E] bg-[#FAF3EC]/60 hover:bg-[#FAF3EC] shadow-2xs"
                                : "border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)]/50 bg-[var(--surface-muted)] hover:bg-[var(--primary)]/5"
                            )}
                          >
                            <div
                              className={cn(
                                "h-10 w-10 rounded-full shadow-2xs flex items-center justify-center transition-transform group-hover:scale-110 mb-2",
                                isHighlightRed
                                  ? "bg-rose-100 text-rose-600 ring-2 ring-rose-300"
                                  : isFirstEmptyPlaceholder
                                  ? "bg-white text-[#80132E]"
                                  : "bg-white text-slate-400 group-hover:text-[var(--primary)]"
                              )}
                            >
                              <IconUpload className="h-5 w-5" />
                            </div>

                            <span
                              className={cn(
                                "text-xs font-bold leading-tight",
                                isHighlightRed
                                  ? "text-rose-600"
                                  : isFirstEmptyPlaceholder
                                  ? "text-[#80132E]"
                                  : "text-slate-700 group-hover:text-[var(--primary)]"
                              )}
                            >
                              {totalCount > 0 ? "+ Add Photo" : "Upload Photo"}
                            </span>

                            <span className="text-[10px] mt-1.5 font-medium">
                              {isHighlightRed ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300 text-[10px] font-bold">
                                  Mandatory *
                                </span>
                              ) : isFirstEmptyPlaceholder ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-900 border border-amber-300 text-[10px] font-semibold">
                                  Mandatory *
                                </span>
                              ) : (
                                <span className="text-slate-400">Optional</span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      ref={albumInputRef}
                      className="hidden"
                      onChange={handleAlbumPhotoSelect}
                    />
                  </div>

                  {/* Watermark and privacy protection notice */}
                  <div className="bg-[#FAF3EC]/80 border border-[#D89B65]/40 p-4 rounded-2xl flex items-start gap-3.5">
                    <IconShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#80132E]">
                        Privacy Protected & Watermarked Photos
                      </h4>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                        Your photos are protected against unauthorized downloads and screenshot abuse. Once submitted, your profile will be active to explore verified matches.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[var(--border)]/70">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={isLoading}
                      className="focus-ring inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--surface-muted)] px-6 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--border)] transition-all disabled:opacity-50 order-2 sm:order-1 cursor-pointer"
                    >
                      <IconArrowLeft className="h-4 w-4" /> Back to Security
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="focus-ring inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 text-sm font-bold text-white shadow-md hover:bg-[var(--primary-deep)] transition-all disabled:opacity-50 order-1 sm:order-2 cursor-pointer active-press"
                    >
                      {isLoading ? (
                        <>
                          <IconLoader2 className="h-5 w-5 animate-spin" />
                          <span>Finalizing Profile...</span>
                        </>
                      ) : (
                        <>
                          <IconHeartHandshake className="h-4 w-4 text-[#F9E2B2]" />
                          <span>Complete & Explore Matches</span>
                          <IconArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
