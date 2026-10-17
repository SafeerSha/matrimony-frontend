"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconArrowRight,
  IconArrowLeft,
  IconLoader2,
  IconUpload,
  IconCircleCheck,
  IconHeart,
  IconHeartHandshake,
  IconSparkles,
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
} from "@tabler/icons-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/cn";
import { profileService, mediaService, authService, isDraftUser } from "@/services";
import { toast } from "@/lib/toast";
import {
  DatePicker,
  EducationSelector,
  ProfessionCombobox,
  EmploymentStatusSelector,
  ModernSelect,
} from "@/components/ui";

const STEPS = [
  { id: 1, label: "Personal", fullLabel: "Personal Details", isRequired: true },
  { id: 2, label: "Photo", fullLabel: "Profile Picture", isRequired: false },
  { id: 3, label: "Security", fullLabel: "Account Password", isRequired: false },
  { id: 4, label: "Album", fullLabel: "Album Photos", isRequired: true },
];

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Form State
  const [draftInfo, setDraftInfo] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["marriage"]);
  const [profileData, setProfileData] = useState<any>({});
  const [preferencesData, setPreferencesData] = useState<any>({});

  // Photo States (Step 3: Profile DP is Optional, Step 4: Album Photos is REQUIRED)
  const [primaryPhoto, setPrimaryPhoto] = useState<File | null>(null);
  const [uploadedPhotoId, setUploadedPhotoId] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<File[]>([]);
  const [albumValidationError, setAlbumValidationError] = useState(false);

  // Optional Password Setup State (Step 4)
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  // Load draft data from landing page or existing backend session
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("shaadi_onboarding_draft");
        if (stored) {
          const parsed = JSON.parse(stored);
          setDraftInfo(parsed);

          const normalizedGender = parsed.gender?.toLowerCase() || "";

          setProfileData((prev: any) => ({
            ...prev,
            firstName: parsed.firstName || prev.firstName || "",
            lastName: parsed.lastName || prev.lastName || "",
            gender: normalizedGender || prev.gender || "",
            phone: parsed.phone || prev.phone || "",
            email: parsed.email || prev.email || "",
            profileFor: parsed.profileFor || prev.profileFor || "Marriage",
            createdBy: parsed.createdBy || prev.createdBy || "",
          }));

          if (parsed.preferences) {
            setPreferencesData((prev: any) => ({
              ...prev,
              ...parsed.preferences,
            }));
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

      // If user has an active session on backend, populate latest state
      profileService
        .getProfile("me")
        .then((profile) => {
          if (profile) {
            // If the user is already active and completed onboarding, do not restart onboarding
            if (!isDraftUser(profile)) {
              window.location.href = "/app/discover";
              return;
            }

            setProfileData((prev: any) => ({
              ...prev,
              ...profile,
              gender: profile.gender?.toLowerCase() || prev.gender || "",
            }));
            if (profile.preferences) {
              setPreferencesData((prev: any) => ({ ...prev, ...profile.preferences }));
            }
            if (profile.onboardingStep && profile.onboardingStep >= 1) {
              const safeStep = Math.min(profile.onboardingStep, 4) as 1 | 2 | 3 | 4;
              setStep(safeStep);
            }
          }
        })
        .catch(() => {
          // Safe to ignore if not yet authenticated
        });
    }
  }, []);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    let updatedProfile = { ...profileData };
    let updatedPreferences = { ...preferencesData };

    if (step === 1) {
      setError(null);
      const emailVal = (formData.get("email") as string || "").trim();
      if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        setError("Please enter a valid email address.");
        return;
      }

      const firstNameVal = (formData.get("firstName") as string || "").trim();
      if (!firstNameVal) {
        setError("Please enter your first name.");
        return;
      }

      const dobVal = formData.get("dob") as string;
      if (!dobVal) {
        setError("Please select your date of birth.");
        return;
      }

      const eduVal = (formData.get("education") as string || "").trim();
      if (!eduVal) {
        setError("Please select your highest education.");
        return;
      }

      const profVal = (
        (formData.get("profession") as string) ||
        (formData.get("occupation") as string) ||
        ""
      ).trim();
      if (!profVal) {
        setError("Please select or search your profession.");
        return;
      }

      const employmentStatusVal = (formData.get("employmentStatus") as string || "").trim();
      const lastNameVal = (formData.get("lastName") as string || profileData.lastName || "").trim();

      const genderVal = (formData.get("gender") as string || profileData.gender || "").trim().toLowerCase();
      if (!genderVal) {
        setError("Please select gender.");
        return;
      }

      updatedProfile = {
        ...updatedProfile,
        firstName: firstNameVal,
        lastName: lastNameVal,
        name: `${firstNameVal} ${lastNameVal}`.trim(),
        email: emailVal,
        phone: (formData.get("phone") as string || profileData.phone || "").trim(),
        gender: genderVal,
        dateOfBirth: new Date(dobVal).toISOString(),
        education: eduVal,
        occupation: profVal,
        employmentStatus: employmentStatusVal,
        bio: (formData.get("family") as string || profileData.bio || "").trim(),
      };
      setProfileData(updatedProfile);

      // Verify and persist Step 1 to backend immediately so 409 email conflicts are caught upfront
      setIsLoading(true);
      try {
        await profileService.updateProfile("me", {
          ...updatedProfile,
          preferences: updatedPreferences,
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
    }

    // Auto-save step progress in background for subsequent steps
    if (step > 1) {
      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "shaadi_onboarding_draft",
            JSON.stringify({ ...draftInfo, ...updatedProfile, preferences: updatedPreferences })
          );
        }
        profileService
          .updateProfile("me", {
            ...updatedProfile,
            preferences: updatedPreferences,
          })
          .catch(() => {});
      } catch {
        // Safe fallback
      }
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
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
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
    if (source === "complete" && albumPhotos.length === 0) {
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
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        education: profileData.education,
        occupation: profileData.occupation,
        profession: profileData.profession || profileData.occupation,
        employmentStatus: profileData.employmentStatus,
        bio: profileData.bio,
        maritalStatus: profileData.maritalStatus,
        city: profileData.city,
        country: profileData.country,
        skipPhotoCheck: true,
      });

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("shaadi_onboarding_draft");
      }

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
      }
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
    if (step < 4) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
      toast.info("Step skipped", "You can always configure this section later in your profile settings.");
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
      toast.success(
        "Password saved",
        "You can now also sign in using your email/phone and password!"
      );
      setStep(4);
    } catch (err: any) {
      const msg = err.message || "Failed to set password. You can still skip this step.";
      setPasswordError(msg);
      toast.error("Error setting password", msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Step 3: Skip Password Setup
  const handleSkipPassword = () => {
    setPasswordError(null);
    toast.info("Step skipped", "You can continue signing in anytime using Mobile OTP.");
    setStep(4);
  };

  // Step 4: Final Complete (delegates to finalizeOnboarding)
  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (albumPhotos.length === 0) {
      setAlbumValidationError(true);
      setError("At least one album photo is mandatory to complete profile setup.");
      toast.error("Album Photo Mandatory", "At least one album photo is mandatory to complete your profile setup.");
      return;
    }
    await finalizeOnboarding("complete");
  };


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
          "mx-auto flex h-16 sm:h-20 items-center justify-between px-4 sm:px-6 transition-all duration-300",
          step === 1 ? "max-w-5xl xl:max-w-6xl" : "max-w-5xl"
        )}>
          <Logo href="#" />

          {/* Desktop Stepper Breadcrumbs */}
          <div className="hidden lg:flex items-center gap-1.5">
            {STEPS.map((s) => {
              const isPast = step > s.id;
              const isCurrent = step === s.id;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all",
                    isCurrent
                      ? "bg-[#80132E] text-white shadow-xs font-bold ring-2 ring-[#D89B65]/30"
                      : isPast
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100/90 text-slate-500"
                  )}
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
                </div>
              );
            })}
          </div>

          {/* Right Header Action: Step Badge */}
          <div className="flex items-center gap-2">
            {STEPS.find((s) => s.id === step)?.isRequired ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#80132E] bg-[#FDF2F4] border border-[#80132E]/20 px-3 py-1.5 rounded-full shadow-2xs">
                <span>Step {step} of 4</span>
                <span className="w-1 h-1 rounded-full bg-[#80132E]" />
                <span className="font-bold">Required</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full shadow-2xs">
                <span>Step {step} of 4</span>
                <span className="w-1 h-1 rounded-full bg-slate-400" />
                <span>Optional</span>
              </span>
            )}
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
            return (
              <div
                key={s.id}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  isCompleted
                    ? "bg-[#80132E]"
                    : isCurrent
                    ? "bg-gradient-to-r from-[#80132E] to-[#D89B65] shadow-xs"
                    : "bg-slate-200/80"
                )}
                title={`${s.label} (${s.isRequired ? "Required" : "Optional"})`}
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
                  {draftInfo?.name && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3EC] border border-[#D89B65]/40 text-[#8C5D2C] text-xs font-bold mb-2.5">
                      <IconHeartHandshake className="h-3.5 w-3.5 text-[#D89B65]" />
                      <span>Welcome, {draftInfo.firstName || draftInfo.name}</span>
                    </div>
                  )}
                  <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
                    Personal & Contact Details
                  </h1>
                  <p className="mt-1.5 text-sm text-[var(--muted)] leading-relaxed">
                    Please provide your primary email address and confirm your core profile information.
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
                    {/* Left Column: Personal Identity & Contact */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-white/80 border border-[var(--border)] shadow-xs space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]/60">
                        <IconUser className="w-5 h-5 text-[#80132E]" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                          Identity & Contact
                        </h2>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* First Name */}
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">
                            First Name <span className="text-rose-500">*</span>
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
                              placeholder="e.g. Anand"
                              className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 pl-10 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition"
                            />
                            <IconUser className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                          </div>
                        </div>

                        {/* Last Name */}
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">
                            Last Name
                          </label>
                          <div className="relative">
                            <input
                              name="lastName"
                              type="text"
                              value={profileData.lastName ?? draftInfo?.lastName ?? ""}
                              onChange={(e) =>
                                setProfileData((prev: any) => ({ ...prev, lastName: e.target.value }))
                              }
                              placeholder="e.g. Menon"
                              className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 pl-10 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition"
                            />
                            <IconUser className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                          </div>
                        </div>
                      </div>

                      {/* Email Address */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)]">
                            Email Address <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-[11px] text-[var(--muted)]">For alerts</span>
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
                            placeholder="e.g. anand.menon@example.com"
                            className={cn(
                              "h-12 w-full rounded-xl border bg-white px-4 pl-10 text-sm text-[var(--foreground)] outline-none transition",
                              emailError
                                ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                                : "border-[var(--border)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                            )}
                          />
                          <IconMail className={cn("pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4", emailError ? "text-rose-400" : "text-[var(--muted)]")} />
                        </div>
                        {emailError && (
                          <div className="mt-2 p-2.5 rounded-xl bg-rose-50/80 border border-rose-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="text-rose-700 font-medium">⚠️ {emailError}</span>
                            <Link href="/login" className="text-[#80132E] font-bold underline hover:text-[#5c0d21]">
                              Sign in to existing account →
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Mobile Number - Verified */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)]">
                            Mobile Number
                          </label>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <IconCircleCheck className="h-3 w-3 text-emerald-600" />
                            Verified
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            name="phone"
                            type="tel"
                            readOnly
                            value={profileData.phone ?? draftInfo?.phone ?? ""}
                            className="h-12 w-full rounded-xl border border-[var(--border)] bg-slate-50/80 px-4 pl-10 text-sm font-medium text-[var(--muted-strong)] outline-none select-none cursor-not-allowed"
                          />
                          <IconPhone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Gender */}
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

                        {/* Date of Birth */}
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
                    </div>

                    {/* Right Column: Education, Profession & About You */}
                    <div className="space-y-5 lg:space-y-6">
                      <div className="p-5 sm:p-6 rounded-2xl bg-white/80 border border-[var(--border)] shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]/60">
                          <IconSchool className="w-5 h-5 text-[#80132E]" />
                          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                            Education & Career
                          </h2>
                        </div>

                        {/* Highest Education */}
                        <div>
                          <EducationSelector
                            name="education"
                            required
                            defaultValue={profileData.education}
                            onChange={(val) =>
                              setProfileData((prev: any) => ({ ...prev, education: val }))
                            }
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Profession / Career */}
                          <div>
                            <ProfessionCombobox
                              name="profession"
                              required
                              defaultValue={profileData.occupation || profileData.profession}
                              onChange={(val) =>
                                setProfileData((prev: any) => ({
                                  ...prev,
                                  occupation: val,
                                  profession: val,
                                }))
                              }
                            />
                          </div>

                          {/* Employment Status */}
                          <div>
                            <EmploymentStatusSelector
                              name="employmentStatus"
                              defaultValue={profileData.employmentStatus}
                              onChange={(val) =>
                                setProfileData((prev: any) => ({
                                  ...prev,
                                  employmentStatus: val,
                                }))
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Family & Bio */}
                      <div className="p-5 sm:p-6 rounded-2xl bg-white/80 border border-[var(--border)] shadow-xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/60">
                          <div className="flex items-center gap-2">
                            <IconSparkles className="w-5 h-5 text-[#80132E]" />
                            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                              About You & Family Background
                            </h2>
                          </div>
                          <span className="text-rose-500 font-bold text-xs">*</span>
                        </div>
                        <textarea
                          name="family"
                          required
                          rows={4}
                          value={profileData.bio ?? profileData.family ?? ""}
                          onChange={(e) =>
                            setProfileData((prev: any) => ({
                              ...prev,
                              bio: e.target.value,
                              family: e.target.value,
                            }))
                          }
                          placeholder="Tell us a bit about your family values, personal interests, and lifestyle..."
                          className="w-full rounded-xl border border-[var(--border)] bg-white p-3.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition resize-y"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end border-t border-[var(--border)]/70">
                    <button
                      type="submit"
                      className="focus-ring inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-deep)] transition-all cursor-pointer active-press"
                    >
                      <span>Continue to Profile Photo</span>
                      <IconArrowRight className="h-4 w-4" />
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
                  {primaryPhoto ? (
                    <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-6 flex flex-col items-center text-center">
                      <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-md mb-3 relative bg-slate-100">
                        <img
                          src={URL.createObjectURL(primaryPhoto)}
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
                            setPrimaryPhoto(null);
                            setUploadedPhotoId(null);
                            setUploadedPhotoUrl(null);
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
                      <IconSparkles className="h-3.5 w-3.5 text-[#D89B65]" />
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

                {/* Mobile OTP Highlight */}
                <div className="mb-6 p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <IconDeviceMobile className="h-5 w-5" />
                  </div>
                  <div className="text-xs text-emerald-950 leading-relaxed">
                    <p className="font-semibold text-emerald-900">
                      Mobile OTP login is already active
                    </p>
                    <p className="mt-0.5 text-emerald-800/90">
                      If you prefer not to create a password right now, feel free to skip this step.
                      You can sign in anytime via SMS OTP.
                    </p>
                  </div>
                </div>

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
                          onChange={(e) => setPassword(e.target.value)}
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
                          onChange={(e) => setConfirmPassword(e.target.value)}
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
                        Skip for now →
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
                      {Array.from({ length: Math.max(4, Math.min(albumPhotos.length + 1, 6)) }).map((_, idx) => {
                        const file = albumPhotos[idx];
                        const isFirstSlot = idx === 0;
                        const isFirstAndNoDp = !primaryPhoto && isFirstSlot;
                        const hasPhoto = Boolean(file);

                        if (hasPhoto && file) {
                          return (
                            <div
                              key={idx}
                              className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-xs flex flex-col justify-between p-2.5 transition-all"
                            >
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Album Photo ${idx + 1}`}
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
                                    Photo {idx + 1}
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
                                {getDisplayName()} — {isFirstAndNoDp ? "Profile DP" : `Photo ${idx + 1}`}
                              </div>
                            </div>
                          );
                        }

                        // Empty Placeholder Slot
                        const isFirstEmptyPlaceholder = isFirstSlot && albumPhotos.length === 0;
                        const isHighlightRed = isFirstEmptyPlaceholder && albumValidationError;

                        return (
                          <div
                            key={idx}
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
                              {idx === albumPhotos.length && albumPhotos.length > 0
                                ? "+ Add Photo"
                                : `Photo ${idx + 1}`}
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
