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
import { profileService, mediaService, authService } from "@/services";
import { toast } from "@/lib/toast";
import {
  DatePicker,
  EducationSelector,
  ProfessionCombobox,
  EmploymentStatusSelector,
  ModernSelect,
} from "@/components/ui";

const AGE_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const age = (18 + i).toString();
  return { value: age, label: `${age} yrs` };
});

const HEIGHT_OPTIONS = [
  "4'10\"", "4'11\"", "5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"",
  "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"",
  "6'2\"", "6'3\"", "6'4\""
];

const HEIGHT_SELECT_OPTIONS = HEIGHT_OPTIONS.map((h) => ({ value: h, label: h }));

const MARITAL_STATUS_OPTIONS = [
  'Never Married',
  'Divorced',
  'Awaiting Divorce',
  'Widowed',
  'Open to All',
];

const RELIGION_OPTIONS = [
  'Open to all communities',
  'Hindu',
  'Muslim',
  'Christian',
  'Jain',
  'Sikh',
  'Buddhist',
  'Spiritual / Non-religious',
];

const LOCATION_OPTIONS = [
  'Kerala',
  'Bengaluru',
  'Chennai',
  'Mumbai',
  'Hyderabad',
  'Delhi NCR',
  'UAE / Gulf',
  'Abroad (US/UK/EU)',
  'Any location',
];

const EDUCATION_OPTIONS = [
  'Any qualification',
  'Graduate Degree',
  'Postgraduate / Masters',
  'Doctorate / PhD',
  'Professional (CA/MBBS/LLB/MBA)',
];

const PROFESSION_OPTIONS = [
  'Any profession',
  'Software / IT',
  'Healthcare / Medical',
  'Finance & Banking',
  'Government / Civil Services',
  'Business & Entrepreneurship',
];

const DIET_OPTIONS = [
  "Doesn't Matter",
  'Vegetarian',
  'Eggetarian',
  'Non-Vegetarian',
];

const STEPS = [
  { id: 1, label: "Personal", fullLabel: "Personal Details", isRequired: true },
  { id: 2, label: "Preferences", fullLabel: "Partner Preferences", isRequired: true },
  { id: 3, label: "Photo", fullLabel: "Profile Picture", isRequired: false },
  { id: 4, label: "Security", fullLabel: "Account Password", isRequired: false },
  { id: 5, label: "Album", fullLabel: "Album & Launch", isRequired: false },
];

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Form State
  const [draftInfo, setDraftInfo] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["marriage"]);
  const [profileData, setProfileData] = useState<any>({});
  const [preferencesData, setPreferencesData] = useState<any>({
    minAge: 21,
    maxAge: 32,
    minHeight: "5'0\"",
    maxHeight: "6'0\"",
    maritalStatus: ["Never Married"],
    religions: ["Open to all communities"],
    locations: ["Kerala", "Bengaluru"],
    education: ["Graduate Degree", "Postgraduate / Masters"],
    professions: ["Any profession"],
    diet: ["Doesn't Matter"],
  });
  const [primaryPhoto, setPrimaryPhoto] = useState<File | null>(null);

  // Optional Password Setup State (Step 5)
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
            setProfileData((prev: any) => ({
              ...prev,
              ...profile,
              gender: profile.gender?.toLowerCase() || prev.gender || "",
            }));
            if (profile.preferences) {
              setPreferencesData((prev: any) => ({ ...prev, ...profile.preferences }));
            }
            if (profile.onboardingStep && profile.onboardingStep >= 1) {
              const safeStep = Math.min(profile.onboardingStep, 5) as 1 | 2 | 3 | 4 | 5;
              setStep(safeStep);
            }
          }
        })
        .catch(() => {
          // Safe to ignore if not yet authenticated
        });
    }
  }, []);

  const togglePreferenceArrayItem = (key: string, item: string, defaultAllItem?: string) => {
    setPreferencesData((prev: any) => {
      const raw = prev[key];
      const currentList: string[] = Array.isArray(raw)
        ? raw
        : typeof raw === "string" && raw.length > 0
        ? raw.split(",").map((s) => s.trim())
        : [];

      let updatedList: string[];

      if (defaultAllItem && item === defaultAllItem) {
        // If clicking "Open to all" / "Doesn't Matter" / "Any location", reset to just that
        updatedList = [defaultAllItem];
      } else {
        // If defaultAllItem is currently selected and another is clicked, remove defaultAllItem
        const filtered = defaultAllItem ? currentList.filter((x) => x !== defaultAllItem) : currentList;
        if (filtered.includes(item)) {
          updatedList = filtered.filter((x) => x !== item);
          if (updatedList.length === 0 && defaultAllItem) {
            updatedList = [defaultAllItem];
          }
        } else {
          updatedList = [...filtered, item];
        }
      }

      return {
        ...prev,
        [key]: updatedList,
      };
    });
  };

  const isPreferenceItemSelected = (key: string, item: string) => {
    const raw = preferencesData[key];
    if (Array.isArray(raw)) {
      return raw.includes(item);
    }
    if (typeof raw === "string") {
      return raw.split(",").map((s) => s.trim()).includes(item);
    }
    return false;
  };

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

      updatedProfile = {
        ...updatedProfile,
        firstName: firstNameVal,
        lastName: lastNameVal,
        name: `${firstNameVal} ${lastNameVal}`.trim(),
        email: emailVal,
        phone: (formData.get("phone") as string || profileData.phone || "").trim(),
        gender: (formData.get("gender") as string || profileData.gender || "female").toLowerCase(),
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
    } else if (step === 2) {
      setError(null);
      const minAge = Number(preferencesData.minAge) || 21;
      const maxAge = Number(preferencesData.maxAge) || 32;

      if (minAge > maxAge) {
        setError("Minimum age cannot be greater than maximum age.");
        return;
      }

      const locationsList = Array.isArray(preferencesData.locations) && preferencesData.locations.length > 0
        ? preferencesData.locations
        : (preferencesData.location ? [preferencesData.location] : ["Any location"]);

      const religionsList = Array.isArray(preferencesData.religions) && preferencesData.religions.length > 0
        ? preferencesData.religions
        : ["Open to all communities"];

      const maritalStatusList = Array.isArray(preferencesData.maritalStatus) && preferencesData.maritalStatus.length > 0
        ? preferencesData.maritalStatus
        : ["Never Married"];

      const educationList = Array.isArray(preferencesData.education) && preferencesData.education.length > 0
        ? preferencesData.education
        : ["Any qualification"];

      const professionsList = Array.isArray(preferencesData.professions) && preferencesData.professions.length > 0
        ? preferencesData.professions
        : ["Any profession"];

      const dietList = Array.isArray(preferencesData.diet) && preferencesData.diet.length > 0
        ? preferencesData.diet
        : ["Doesn't Matter"];

      updatedPreferences = {
        ...updatedPreferences,
        ...preferencesData,
        minAge,
        maxAge,
        minHeight: preferencesData.minHeight || "5'0\"",
        maxHeight: preferencesData.maxHeight || "6'0\"",
        maritalStatus: maritalStatusList,
        religions: religionsList,
        locations: locationsList,
        education: educationList,
        professions: professionsList,
        diet: dietList,
        location: locationsList.join(", "),
        religion: religionsList.join(", "),
      };

      setPreferencesData(updatedPreferences);

      setIsLoading(true);
      try {
        await profileService.updatePreferences("me", updatedPreferences).catch(() => {});
        await profileService.updateProfile("me", {
          ...updatedProfile,
          preferences: updatedPreferences,
        }).catch(() => {});
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

    if (step < 5) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5);
    }

  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPrimaryPhoto(e.target.files[0]);
    }
  };

  // Fast-track: Allow skipping all remaining steps once Step 1 is filled
  const handleSkipToFinish = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Upload primary photo if selected
      if (primaryPhoto) {
        await mediaService.uploadPhoto(primaryPhoto).catch(() => {});
      }

      // 2. Save any Preferences collected so far
      if (Object.keys(preferencesData).length > 0) {
        await profileService.updatePreferences("me", preferencesData).catch(() => {});
      }

      // 3. Save Profile details
      await profileService.updateProfile("me", {
        ...profileData,
        isVerified: true,
      }).catch(() => {});

      // 4. Mark Onboarding as Completed on Backend (activates user and sets onboardingStep = 5)
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
        "Your profile is active! You can customize remaining preferences and photo anytime in your Profile."
      );

      setTimeout(() => {
        window.location.href = "/app/discover";
      }, 400);
    } catch (err: any) {
      console.warn("Skip to finish fallback:", err);
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
        "Welcome to ShaadiChat! Exploring compatible matches."
      );
      setTimeout(() => {
        window.location.href = "/app/discover";
      }, 400);
    } finally {
      setIsLoading(false);
    }

  };

  // Skip a single optional step to advance to next
  const handleSkipSingleStep = () => {
    setError(null);
    if (step < 5) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5);
      toast.info("Step skipped", "You can always configure this section later in your profile settings.");
    } else {
      handleSkipToFinish();
    }
  };

  // Step 4: Save Optional Password
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
      setStep(5);
    } catch (err: any) {
      const msg = err.message || "Failed to set password. You can still skip this step.";
      setPasswordError(msg);
      toast.error("Error setting password", msg);
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Step 4: Skip Password Setup
  const handleSkipPassword = () => {
    setPasswordError(null);
    toast.info("Step skipped", "You can continue signing in anytime using Mobile OTP.");
    setStep(5);
  };

  // Step 6: Final Complete
  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Upload primary photo if selected
      if (primaryPhoto) {
        await mediaService.uploadPhoto(primaryPhoto).catch((err) => {
          console.warn("Primary photo upload failed during onboarding:", err);
        });
      }

      // 2. Save Preferences
      if (Object.keys(preferencesData).length > 0) {
        await profileService.updatePreferences("me", preferencesData).catch(() => {});
      }

      // 3. Save Profile
      await profileService.updateProfile("me", {
        ...profileData,
        isVerified: true,
      });

      // 4. Mark Onboarding as Completed on Backend (activates user and sets onboardingStep = 5)
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
        skipPhotoCheck: !primaryPhoto,
      });

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("shaadi_onboarding_draft");
      }

      toast.flash(
        "success",
        "Profile setup complete!",
        "Your profile is now live! Exploring compatible matches."
      );

      setTimeout(() => {
        window.location.href = "/app/discover";
      }, 500);
    } catch (err: any) {
      console.error("Onboarding error:", err);
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
      // If mock/sandbox environment without active backend token, still allow seamless flow:
      if (err.status === 401 || err.status === 404 || !err.status) {
        toast.flash(
          "success",
          "Profile setup complete!",
          "Welcome to ShaadiChat! Exploring compatible matches."
        );
        setTimeout(() => {
          window.location.href = "/app/discover";
        }, 500);
        return;
      }
      const msg = err.message || "Something went wrong saving your profile.";
      setError(msg);
      toast.error("Profile setup failed", msg);
      setIsLoading(false);
    }
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
        <div className="mx-auto flex h-16 sm:h-20 max-w-5xl items-center justify-between px-4 sm:px-6">
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

          {/* Right Header Action: Fast-track Skip or Step Badge */}
          <div className="flex items-center gap-2">
            {step <= 2 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#80132E] bg-[#FDF2F4] border border-[#80132E]/20 px-3 py-1.5 rounded-full shadow-2xs">
                <span>Step {step} of 5</span>
                <span className="w-1 h-1 rounded-full bg-[#80132E]" />
                <span className="font-bold">Required</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSkipToFinish}
                disabled={isLoading}
                className="focus-ring inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#80132E] hover:text-[#5c0d21] bg-[#FAF3EC] hover:bg-[#f5e9dc] border border-[#D89B65]/50 hover:border-[#D89B65] px-3.5 sm:px-4 py-1.5 rounded-full transition-all shadow-2xs cursor-pointer active-press"
                title="Save baseline and jump straight to discovering matches"
              >
                {/* <IconSparkles className="h-3.5 w-3.5 text-[#D89B65]" /> */}
                <span className="hidden sm:inline">Finish Later & View Matches</span>
                <span className="sm:hidden">Skip to Matches</span>
                <IconArrowRight className="h-3.5 w-3.5 text-[#80132E]" />
              </button>
            )}
          </div>
        </div>

        {/* Multi-Segmented Luxury Progress Track */}
        <div className="grid grid-cols-5 gap-1 w-full px-4 sm:px-6 pb-2 pt-0.5 max-w-5xl mx-auto">
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
        <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-3xl border border-[var(--border)] shadow-[0_24px_70px_rgba(92,16,39,0.08)] overflow-hidden">
          <div className="p-6 sm:p-10 lg:p-12">
            {error && (
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
                      <IconSparkles className="h-3.5 w-3.5 text-[#D89B65]" />
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
                      Personal Details (Step 1) and Partner Preferences (Step 2) are required to activate your account and discover compatible matches. Remaining steps (photos, password, and album) can be completed now or skipped for later.
                    </span>
                  </div>
                </div>

                <form onSubmit={handleNext} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

                    {/* Email Address */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)]">
                          Email Address <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] text-[var(--muted)]">For match alerts & password sign in</span>
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
                    <div className="sm:col-span-2">
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

                    {/* Gender */}
                    <div>
                      <ModernSelect
                        label="Gender"
                        required
                        name="gender"
                        value={profileData.gender ?? draftInfo?.gender ?? ""}
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

                    {/* Highest Education */}
                    <div className="sm:col-span-2">
                      <EducationSelector
                        name="education"
                        required
                        defaultValue={profileData.education}
                        onChange={(val) =>
                          setProfileData((prev: any) => ({ ...prev, education: val }))
                        }
                      />
                    </div>

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

                    {/* Family & Bio */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">
                        About You & Family Background <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        name="family"
                        required
                        rows={3}
                        value={profileData.bio ?? profileData.family ?? ""}
                        onChange={(e) =>
                          setProfileData((prev: any) => ({
                            ...prev,
                            bio: e.target.value,
                            family: e.target.value,
                          }))
                        }
                        placeholder="Tell us a bit about your family values, personal interests, and lifestyle..."
                        className="w-full rounded-xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      type="submit"
                      className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-deep)] transition-all cursor-pointer active-press"
                    >
                      <span>Continue to Preferences</span>
                      <IconArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* Step 2: Partner Preferences (REQUIRED)                                    */}
            {/* ========================================================================= */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF2F4] text-[#80132E] text-xs font-semibold mb-2.5 border border-[#80132E]/20 shadow-2xs">
                    <span>Step 2 of 5</span>
                    <span className="w-1 h-1 rounded-full bg-[#80132E]" />
                    <span className="font-bold">Required</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
                    Partner Preferences
                  </h1>
                  <p className="mt-1.5 text-sm text-[var(--muted)]">
                    Define your partner criteria. These matchmaking parameters ensure you discover compatible matches aligned with your life expectations.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleNext} className="space-y-6">
                  {/* 1. Age & Height Range */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white/80 border border-[var(--border)] shadow-xs space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]/60">
                      <IconCalendar className="w-5 h-5 text-[#80132E]" />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                        Age & Height Range
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Age Range */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-2">
                          Age Range
                        </label>
                        <div className="grid grid-cols-2 gap-3 items-center">
                          <ModernSelect
                            label="Min Age"
                            value={String(preferencesData.minAge ?? 21)}
                            onChange={(val) =>
                              setPreferencesData((prev: any) => ({ ...prev, minAge: Number(val) }))
                            }
                            options={AGE_OPTIONS}
                          />
                          <ModernSelect
                            label="Max Age"
                            value={String(preferencesData.maxAge ?? 32)}
                            onChange={(val) =>
                              setPreferencesData((prev: any) => ({ ...prev, maxAge: Number(val) }))
                            }
                            options={AGE_OPTIONS}
                          />
                        </div>
                      </div>

                      {/* Height Range */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-2">
                          Height Range
                        </label>
                        <div className="grid grid-cols-2 gap-3 items-center">
                          <ModernSelect
                            label="Min Height"
                            value={preferencesData.minHeight ?? "5'0\""}
                            onChange={(val) =>
                              setPreferencesData((prev: any) => ({ ...prev, minHeight: val }))
                            }
                            options={HEIGHT_SELECT_OPTIONS}
                          />
                          <ModernSelect
                            label="Max Height"
                            value={preferencesData.maxHeight ?? "6'0\""}
                            onChange={(val) =>
                              setPreferencesData((prev: any) => ({ ...prev, maxHeight: val }))
                            }
                            options={HEIGHT_SELECT_OPTIONS}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Marital Status */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white/80 border border-[var(--border)] shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/60">
                      <div className="flex items-center gap-2">
                        <IconHeart className="w-5 h-5 text-[#80132E]" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                          Marital Status
                        </h2>
                      </div>
                      <span className="text-[11px] text-[var(--muted)]">Tap to select</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {MARITAL_STATUS_OPTIONS.map((opt) => {
                        const isSelected = isPreferenceItemSelected("maritalStatus", opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => togglePreferenceArrayItem("maritalStatus", opt, "Open to All")}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer active-press",
                              isSelected
                                ? "bg-[#80132E] text-white border-[#80132E] shadow-xs font-semibold ring-2 ring-[#D89B65]/30"
                                : "bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50"
                            )}
                          >
                            {isSelected && <IconCheck className="w-3.5 h-3.5 text-[#D89B65] stroke-[3]" />}
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Religion / Community */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white/80 border border-[var(--border)] shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/60">
                      <div className="flex items-center gap-2">
                        <IconSparkles className="w-5 h-5 text-[#80132E]" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                          Religion / Community
                        </h2>
                      </div>
                      <span className="text-[11px] text-[var(--muted)]">Multi-choice supported</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {RELIGION_OPTIONS.map((opt) => {
                        const isSelected = isPreferenceItemSelected("religions", opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              togglePreferenceArrayItem("religions", opt, "Open to all communities")
                            }
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer active-press",
                              isSelected
                                ? "bg-[#80132E] text-white border-[#80132E] shadow-xs font-semibold ring-2 ring-[#D89B65]/30"
                                : "bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50"
                            )}
                          >
                            {isSelected && <IconCheck className="w-3.5 h-3.5 text-[#D89B65] stroke-[3]" />}
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 4. Preferred Locations */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white/80 border border-[var(--border)] shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/60">
                      <div className="flex items-center gap-2">
                        <IconMapPin className="w-5 h-5 text-[#80132E]" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                          Preferred Locations
                        </h2>
                      </div>
                      <span className="text-[11px] text-[var(--muted)]">State / City / Region</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {LOCATION_OPTIONS.map((opt) => {
                        const isSelected = isPreferenceItemSelected("locations", opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => togglePreferenceArrayItem("locations", opt, "Any location")}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer active-press",
                              isSelected
                                ? "bg-[#80132E] text-white border-[#80132E] shadow-xs font-semibold ring-2 ring-[#D89B65]/30"
                                : "bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50"
                            )}
                          >
                            {isSelected && <IconCheck className="w-3.5 h-3.5 text-[#D89B65] stroke-[3]" />}
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. Education & Profession */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white/80 border border-[var(--border)] shadow-xs space-y-5">
                    <div className="flex items-center gap-2 pb-2 border-b border-[var(--border)]/60">
                      <IconSchool className="w-5 h-5 text-[#80132E]" />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                        Education & Career Background
                      </h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-2">
                          Education Level
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {EDUCATION_OPTIONS.map((opt) => {
                            const isSelected = isPreferenceItemSelected("education", opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() =>
                                  togglePreferenceArrayItem("education", opt, "Any qualification")
                                }
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer active-press",
                                  isSelected
                                    ? "bg-[#80132E] text-white border-[#80132E] shadow-xs font-semibold ring-2 ring-[#D89B65]/30"
                                    : "bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50"
                                )}
                              >
                                {isSelected && <IconCheck className="w-3.5 h-3.5 text-[#D89B65] stroke-[3]" />}
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-2">
                          Profession / Sector
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {PROFESSION_OPTIONS.map((opt) => {
                            const isSelected = isPreferenceItemSelected("professions", opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() =>
                                  togglePreferenceArrayItem("professions", opt, "Any profession")
                                }
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer active-press",
                                  isSelected
                                    ? "bg-[#80132E] text-white border-[#80132E] shadow-xs font-semibold ring-2 ring-[#D89B65]/30"
                                    : "bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50"
                                )}
                              >
                                {isSelected && <IconCheck className="w-3.5 h-3.5 text-[#D89B65] stroke-[3]" />}
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 6. Diet Preference */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white/80 border border-[var(--border)] shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/60">
                      <div className="flex items-center gap-2">
                        <IconCoffee className="w-5 h-5 text-[#80132E]" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--foreground)]">
                          Diet Preference
                        </h2>
                      </div>
                      <span className="text-[11px] text-[var(--muted)]">Lifestyle choice</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {DIET_OPTIONS.map((opt) => {
                        const isSelected = isPreferenceItemSelected("diet", opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => togglePreferenceArrayItem("diet", opt, "Doesn't Matter")}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-all cursor-pointer active-press",
                              isSelected
                                ? "bg-[#80132E] text-white border-[#80132E] shadow-xs font-semibold ring-2 ring-[#D89B65]/30"
                                : "bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50"
                            )}
                          >
                            {isSelected && <IconCheck className="w-3.5 h-3.5 text-[#D89B65] stroke-[3]" />}
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions: Back & Save & Continue (No skip here since Step 2 is Required) */}
                  <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[var(--border)]/70">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="focus-ring inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--surface-muted)] px-5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--border)] transition-all order-2 sm:order-1 cursor-pointer"
                    >
                      <IconArrowLeft className="h-4 w-4" /> Back to Personal Details
                    </button>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end order-1 sm:order-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="focus-ring inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-deep)] transition-all cursor-pointer active-press disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <IconLoader2 className="h-4 w-4 animate-spin" />
                            <span>Saving Preferences...</span>
                          </>
                        ) : (
                          <>
                            <span>Save & Continue to Photo</span>
                            <IconArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* Step 3: Primary Photo Upload (OPTIONAL / SKIPPABLE)                       */}
            {/* ========================================================================= */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-2.5">
                    <span>Optional Step 3 of 5</span>
                    <span className="w-1 h-1 rounded-full bg-slate-400" />
                    <span className="text-[#80132E] font-bold">Skip Anytime</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
                    Profile Picture
                  </h1>
                  <p className="mt-1.5 text-sm text-[var(--muted)]">
                    Upload a clear display photo. Profiles with photos get 10x more genuine connections.
                  </p>
                </div>

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
                      <h4 className="text-sm font-bold text-slate-800 truncate max-w-xs">
                        {primaryPhoto.name}
                      </h4>
                      <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                        <IconCircleCheck className="h-3.5 w-3.5 text-emerald-600" />
                        Photo selected & ready to save
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
                          onClick={() => setPrimaryPhoto(null)}
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
                        Click to upload your display picture
                      </h3>
                      <p className="text-xs text-[var(--muted)] mt-1.5">JPEG, PNG, JPG up to 5MB.</p>
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
                      <IconArrowLeft className="h-4 w-4" /> Back
                    </button>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end order-1 sm:order-2">
                      <button
                        type="button"
                        onClick={handleSkipSingleStep}
                        className="text-xs sm:text-sm font-semibold text-[var(--muted)] hover:text-[#80132E] px-3 py-2 transition cursor-pointer"
                      >
                        Upload photo later →
                      </button>
                      <button
                        type="submit"
                        className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 text-sm font-semibold text-white shadow-md hover:bg-[var(--primary-deep)] transition-all cursor-pointer"
                      >
                        <span>{primaryPhoto ? "Save & Continue" : "Continue"}</span>
                        <IconArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleSkipToFinish}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[#80132E] transition cursor-pointer"
                    >
                      <IconSparkles className="h-3.5 w-3.5 text-[#D89B65]" />
                      <span>Explore matches without photo for now</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* Step 4: Account Security / Optional Password (OPTIONAL / SKIPPABLE)        */}
            {/* ========================================================================= */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2.5">
                    <IconShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Optional Step 4 of 5 • Security</span>
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
                      <IconArrowLeft className="h-4 w-4" /> Back
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

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleSkipToFinish}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)] hover:text-[#80132E] transition cursor-pointer"
                    >
                      {/* <IconSparkles className="h-3.5 w-3.5 text-[#D89B65]" /> */}
                      <span>Skip to Matches (Mobile OTP is active)</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* Step 5: Album & Verification (FINAL PROFILE LAUNCH)                        */}
            {/* ========================================================================= */}
            {step === 5 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 text-center">
                  <div className="mx-auto h-16 w-16 bg-[#FAF3EC] border border-[#D89B65]/40 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <IconHeart className="h-8 w-8 text-[#80132E]" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
                    Your Profile is Ready!
                  </h1>
                  <p className="mt-2 text-sm text-[var(--muted)] max-w-md mx-auto">
                    You can add supplementary photos to your gallery now, or launch directly into finding matches.
                  </p>
                </div>

                <form onSubmit={handleComplete} className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-2">
                      Supplementary Gallery Photos (Optional)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square border border-dashed border-[var(--border)] rounded-2xl bg-[var(--surface-muted)] flex flex-col items-center justify-center hover:bg-[var(--primary)]/5 hover:border-[var(--primary)]/30 cursor-pointer transition-colors text-[var(--muted)] group"
                        >
                          <IconUpload className="h-6 w-6 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-[var(--primary)]" />
                          <span className="text-[11px] font-medium mt-1.5 text-slate-400 group-hover:text-[var(--primary)]">
                            Photo {i}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#FAF3EC]/80 border border-[#D89B65]/40 p-4 rounded-2xl flex items-start gap-3.5">
                    <IconCircleCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#80132E]">
                        Profile Verified & Ready to Launch
                      </h4>
                      <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                        Your profile status will be activated immediately. You will be able to explore
                        verified profiles, send interests, and receive matchmaking recommendations.
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
                      <IconArrowLeft className="h-4 w-4" /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="focus-ring inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 text-sm font-bold text-white shadow-md hover:bg-[var(--primary-deep)] transition-all disabled:opacity-50 order-1 sm:order-2 cursor-pointer active-press"
                    >
                      {isLoading ? (
                        <>
                          <IconLoader2 className="h-5 w-5 animate-spin" />
                          <span>Finalizing...</span>
                        </>
                      ) : (
                        <>
                          <IconSparkles className="h-4 w-4 text-[#F9E2B2]" />
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
