"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  IconHeartHandshake,
  IconUsers,
  IconHomeHeart,
  IconX,
  IconArrowLeft,
  IconCrown,
  IconWorld,
  IconUser,
  IconLoader2,
  IconArrowRight,
  IconShieldCheck,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { authService, type QuickRegisterDto } from "@/services";
import { toast } from "@/lib/toast";
import { ModernSelect, type ModernSelectOption } from "@/components/ui/modern-select";

export type LookingForOption = "Marriage" | "Friendship" | "Living-together";
export type MatrimonyCommunityOption = "Kerala" | "Telugu" | "Bharat";
export type ModalStep = "category" | "matrimony_sub" | "registration_form";

export interface LookingForModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption?: (option: LookingForOption, community?: MatrimonyCommunityOption) => void;
  initialOption?: LookingForOption | null;
  initialPhone?: string;
}

interface OptionConfig {
  id: LookingForOption;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBgClass: string;
  iconColorClass: string;
  accentGlowClass: string;
  badgeColorClass: string;
}

interface MatrimonySubOptionConfig {
  id: MatrimonyCommunityOption;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBgClass: string;
  iconColorClass: string;
  accentGlowClass: string;
  badgeColorClass: string;
}

const LOOKING_FOR_OPTIONS: OptionConfig[] = [
  {
    id: "Marriage",
    title: "Marriage",
    badge: "Lifelong Bond",
    icon: IconHeartHandshake,
    iconBgClass: "bg-gradient-to-br from-[#A31D42]/50 to-[#5C1027]/80 border border-[#FF9EAF]/30 shadow-[0_4px_16px_rgba(163,29,66,0.35)]",
    iconColorClass: "text-[#FFCAD4]",
    accentGlowClass: "from-[#A31D42]/20 via-[#A31D42]/10 to-transparent",
    badgeColorClass: "bg-white/15 text-[#FFE3EA] border border-white/25 backdrop-blur-xs font-semibold",
  },
  {
    id: "Friendship",
    title: "Friendship",
    badge: "Social Circle",
    icon: IconUsers,
    iconBgClass: "bg-gradient-to-br from-[#D8B28C]/35 to-[#8C5D2C]/60 border border-[#E8BE88]/35 shadow-[0_4px_16px_rgba(216,178,140,0.25)]",
    iconColorClass: "text-[#FCD8A5]",
    accentGlowClass: "from-[#D8B28C]/20 via-[#D8B28C]/10 to-transparent",
    badgeColorClass: "bg-white/15 text-[#FFF0D4] border border-white/25 backdrop-blur-xs font-semibold",
  },
  {
    id: "Living-together",
    title: "Living-together",
    badge: "Modern Living",
    icon: IconHomeHeart,
    iconBgClass: "bg-gradient-to-br from-[#1E7E52]/40 to-[#0E4F32]/70 border border-[#6EE7B7]/30 shadow-[0_4px_16px_rgba(30,126,82,0.3)]",
    iconColorClass: "text-[#A7F3D0]",
    accentGlowClass: "from-[#1E7E52]/20 via-[#1E7E52]/10 to-transparent",
    badgeColorClass: "bg-white/15 text-[#D1FAE5] border border-white/25 backdrop-blur-xs font-semibold",
  },
];

const MATRIMONY_OPTIONS: MatrimonySubOptionConfig[] = [
  {
    id: "Kerala",
    title: "Kerala matrimony",
    badge: "Malayali",
    icon: IconHeartHandshake,
    iconBgClass: "bg-gradient-to-br from-[#A31D42]/50 to-[#5C1027]/80 border border-[#FF9EAF]/30 shadow-[0_4px_16px_rgba(163,29,66,0.35)]",
    iconColorClass: "text-[#FFCAD4]",
    accentGlowClass: "from-[#A31D42]/20 via-[#A31D42]/10 to-transparent",
    badgeColorClass: "bg-white/15 text-[#FFE3EA] border border-white/25 backdrop-blur-xs font-semibold",
  },
  {
    id: "Telugu",
    title: "Telugu matrimony",
    badge: "Telugu",
    icon: IconCrown,
    iconBgClass: "bg-gradient-to-br from-[#D8B28C]/35 to-[#8C5D2C]/60 border border-[#E8BE88]/35 shadow-[0_4px_16px_rgba(216,178,140,0.25)]",
    iconColorClass: "text-[#FCD8A5]",
    accentGlowClass: "from-[#D8B28C]/20 via-[#D8B28C]/10 to-transparent",
    badgeColorClass: "bg-white/15 text-[#FFF0D4] border border-white/25 backdrop-blur-xs font-semibold",
  },
  {
    id: "Bharat",
    title: "Bharat matrimony",
    badge: "Pan-India",
    icon: IconWorld,
    iconBgClass: "bg-gradient-to-br from-[#1E7E52]/40 to-[#0E4F32]/70 border border-[#6EE7B7]/30 shadow-[0_4px_16px_rgba(30,126,82,0.3)]",
    iconColorClass: "text-[#A7F3D0]",
    accentGlowClass: "from-[#1E7E52]/20 via-[#1E7E52]/10 to-transparent",
    badgeColorClass: "bg-white/15 text-[#D1FAE5] border border-white/25 backdrop-blur-xs font-semibold",
  },
];

const CREATED_BY_OPTIONS: ModernSelectOption[] = [
  { value: "Myself", label: "Myself" },
  { value: "By Parent", label: "By Parent" },
  { value: "By Sibling", label: "By Sibling" },
  { value: "By Cousin", label: "By Cousin" },
  { value: "By Relative", label: "By Relative" },
  { value: "By Friend", label: "By Friend" },
];

export function LookingForModal({
  isOpen,
  onClose,
  initialOption = null,
  initialPhone,
}: LookingForModalProps) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<ModalStep>("category");
  const [selectedCategory, setSelectedCategory] = useState<LookingForOption | null>(initialOption ?? null);
  const [selectedMatrimony, setSelectedMatrimony] = useState<MatrimonyCommunityOption | null>(null);

  // Form Fields State
  const [seekingGender, setSeekingGender] = useState<"Female" | "Male">("Female");
  const [createdBy, setCreatedBy] = useState("Myself");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState(initialPhone ? initialPhone.replace(/\D/g, "").slice(-10) : "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal Animation & Rendering States (for dialog open/close)
  const [mounted, setMounted] = useState(false);
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  useEffect(() => {
    setMounted(true);
    router.prefetch("/verify");
  }, [router]);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setCurrentStep("category");
      setSelectedCategory(initialOption ?? null);
      setSelectedMatrimony(null);
      setError(null);
      setIsSubmitting(false);

      if (initialPhone) {
        setPhone(initialPhone.replace(/\D/g, "").slice(-10));
      }

      const timer = setTimeout(() => {
        setIsAnimatingIn(true);
      }, 30);
      return () => clearTimeout(timer);
    } else {
      setIsAnimatingIn(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 360);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialOption, initialPhone]);

  const handleGoBack = useCallback(() => {
    setError(null);
    if (currentStep === "registration_form") {
      if (selectedCategory === "Marriage") {
        setCurrentStep("matrimony_sub");
      } else {
        setCurrentStep("category");
      }
    } else if (currentStep === "matrimony_sub") {
      setCurrentStep("category");
    }
  }, [currentStep, selectedCategory]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (currentStep === "registration_form" || currentStep === "matrimony_sub") {
          handleGoBack();
        } else {
          onClose();
        }
      }
    },
    [currentStep, handleGoBack, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalTouchAction = document.body.style.touchAction;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.touchAction = originalTouchAction;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isRendered || !mounted) return null;

  // Step 1: Click a category
  const handleSelectCategory = (categoryId: LookingForOption) => {
    setSelectedCategory(categoryId);
    setError(null);

    if (categoryId === "Marriage") {
      setCurrentStep("matrimony_sub");
    } else {
      // Friendship & Living-together go straight to registration form
      setCurrentStep("registration_form");
    }
  };

  // Step 2: Click a matrimony option
  const handleSelectMatrimony = (communityId: MatrimonyCommunityOption) => {
    setSelectedMatrimony(communityId);
    setError(null);
    setCurrentStep("registration_form");
  };

  // Step 3: Handle Quick Registration Submission
  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst) {
      setError("Please enter your first name");
      return;
    }

    if (!trimmedLast) {
      setError("Please enter your last name");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    const fullName = `${trimmedFirst} ${trimmedLast}`;
    const fullPhone = `+91 ${cleanPhone}`;

    const isByLocked = selectedCategory === "Friendship" || selectedCategory === "Living-together";
    const finalCreatedBy = isByLocked ? "Myself" : createdBy;
    const isCreatedByMyself = finalCreatedBy.trim().toLowerCase() === "myself";

    const derivedUserGender = isCreatedByMyself
      ? (seekingGender === "Female" ? "male" : "female")
      : undefined;

    const chosenCat = selectedCategory ?? "Marriage";
    const normalizedCategory =
      chosenCat === "Living-together" ? "Living Together" : chosenCat;

    const payload: QuickRegisterDto = {
      name: fullName,
      phone: fullPhone,
      profileFor: normalizedCategory,
      category: normalizedCategory,
      gender: derivedUserGender,
      lookingFor: seekingGender,
      createdBy: finalCreatedBy,
      ...(chosenCat === "Marriage" && selectedMatrimony ? { lookingIn: selectedMatrimony } : {}),
    };

    setIsSubmitting(true);

    // Keep background form state in sync without scrolling the page
    window.dispatchEvent(
      new CustomEvent("ishtam:select-category", {
        detail: {
          category: normalizedCategory,
          community: selectedMatrimony ?? undefined,
        },
      })
    );

    try {
      await authService.quickRegister(payload);
      authService.sendOtp(fullPhone).catch(() => {});

      toast.info(
        "Verification Code Sent",
        `We've sent a 6-digit verification code to ${fullPhone}.`
      );
      // Navigate directly to /verify without dismissing the modal beforehand to eliminate landing page flash
      router.push("/verify");
    } catch (err: any) {
      if (err?.status === 409) {
        setError("An account with this mobile number already exists. Please sign in.");
        toast.warning("Account exists", "Please sign in to access your profile.");
        setIsSubmitting(false);
        return;
      }
      console.warn("Backend notice (proceeding with local draft):", err);
      authService.sendOtp(fullPhone).catch(() => {});
      toast.info(
        "Verification Code Sent",
        `Please verify your mobile number to continue.`
      );
      // Navigate directly to /verify without dismissing the modal beforehand
      router.push("/verify");
    }
  };

  // RENDER STEP 1: Main Category Selection
  const renderCategoryStep = () => (
    <div className="w-full">
      {/* Header with Title and Close Button */}
      <div className="relative z-20 mb-4 sm:mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2
              id="looking-for-modal-heading"
              className="text-2xl sm:text-3xl font-black tracking-tight font-editorial-title leading-tight drop-shadow-xs bg-gradient-to-r from-white via-amber-50 to-[#FBE3B5] bg-clip-text text-transparent"
            >
              What You're Looking For
            </h2>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="group focus-ring shrink-0 grid h-9 w-9 place-items-center rounded-full bg-white/15 hover:bg-[#FBE3B5]/20 active:scale-90 text-white/95 hover:text-[#FBE3B5] border border-[#FBE3B5]/30 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xs hover:rotate-90"
            aria-label="Close dialog"
          >
            <IconX className="h-4 w-4 transition-transform duration-200" />
          </button>
        </div>

        <p className="mt-1 text-sm sm:text-base text-rose-100/90 leading-relaxed font-normal">
          Choose the type of connection you are seeking on{" "}
          <span className="font-bold text-[#FCD8A5]">IshtamChat</span> to tailor your registration.
        </p>
      </div>

      {/* Options Cards - Blended Luxury Glass Cards */}
      <div
        role="radiogroup"
        aria-labelledby="looking-for-modal-heading"
        className="relative z-10 flex flex-col gap-3 sm:gap-3.5"
      >
        {LOOKING_FOR_OPTIONS.map((option) => {
          const isSelected = selectedCategory === option.id;
          const IconComponent = option.icon;

          return (
            <div
              key={option.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => handleSelectCategory(option.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelectCategory(option.id);
                }
              }}
              className={cn(
                "group relative flex items-center gap-3.5 sm:gap-4 px-4.5 py-3.5 sm:px-5 sm:py-3.5 rounded-2xl cursor-pointer transition-all duration-200 ease-out select-none backdrop-blur-md overflow-hidden",
                isSelected
                  ? "bg-gradient-to-r from-white/[0.25] via-[#FBE3B5]/[0.20] to-white/[0.18] border-2 border-[#FCD8A5] ring-2 ring-[#FCD8A5]/40 shadow-[0_12px_32px_rgba(0,0,0,0.25),0_0_24px_rgba(251,227,181,0.3)]"
                  : "bg-gradient-to-r from-white/[0.14] via-[#FBE3B5]/[0.08] to-white/[0.10] hover:from-white/[0.22] hover:via-[#FBE3B5]/[0.15] hover:to-white/[0.16] border border-[#FBE3B5]/30 hover:border-[#FCD8A5]/80 hover:shadow-[0_10px_28px_rgba(0,0,0,0.22),0_0_22px_rgba(251,227,181,0.2)] hover:-translate-y-0.5 active:scale-[0.985]"
              )}
            >
              {/* Top specular hairline highlight */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent"
                aria-hidden="true"
              />

              {/* Subtle ambient accent glow on hover */}
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  option.accentGlowClass
                )}
                aria-hidden="true"
              />

              {/* Icon */}
              <div
                className={cn(
                  "relative z-10 grid h-12 w-12 sm:h-12.5 sm:w-12.5 shrink-0 place-items-center rounded-2xl border transition-transform duration-300 ease-out group-hover:scale-110 group-active:scale-95",
                  option.iconBgClass,
                  option.iconColorClass
                )}
              >
                <IconComponent className="h-6 w-6 sm:h-6.5 sm:w-6.5" />
              </div>

              {/* Title */}
              <div className="relative z-10 flex-1 min-w-0 pr-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-[-0.01em] text-white group-hover:text-[#FCD8A5] transition-colors duration-200 whitespace-nowrap leading-tight drop-shadow-xs">
                  {option.title}
                </span>
              </div>

              {/* Badge + subtle forward chevron */}
              <div className="relative z-10 flex items-center gap-2 shrink-0">
                <span
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-bold border whitespace-nowrap transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-xs",
                    option.badgeColorClass
                  )}
                >
                  {option.badge}
                </span>
                <IconArrowRight className="h-4 w-4 text-white/30 group-hover:text-[#FCD8A5] group-hover:translate-x-0.5 transition-all duration-200 hidden sm:block" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // RENDER STEP 2: Matrimony Sub-options (Kerala, Telugu, Bharat)
  const renderMatrimonyStep = () => (
    <div className="w-full">
      {/* Header */}
      <div className="relative z-20 mb-4 sm:mb-5">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <button
            type="button"
            onClick={handleGoBack}
            className="group focus-ring inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 hover:bg-[#FBE3B5]/20 active:scale-95 text-white/95 hover:text-[#FBE3B5] border border-[#FBE3B5]/30 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xs text-xs sm:text-sm font-bold tracking-tight"
            aria-label="Go back to connection options"
          >
            <IconArrowLeft className="h-4 w-4 stroke-[2.5] transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Go Back</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="group focus-ring shrink-0 grid h-9 w-9 place-items-center rounded-full bg-white/15 hover:bg-[#FBE3B5]/20 active:scale-90 text-white/95 hover:text-[#FBE3B5] border border-[#FBE3B5]/30 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xs hover:rotate-90"
            aria-label="Close dialog"
          >
            <IconX className="h-4 w-4 transition-transform duration-200" />
          </button>
        </div>

        <div className="min-w-0">
          <h2 className="text-2xl sm:text-[27px] font-black tracking-tight font-editorial-title leading-tight drop-shadow-xs bg-gradient-to-r from-white via-amber-50 to-[#FBE3B5] bg-clip-text text-transparent">
            Select Matrimony
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-rose-100/80 leading-relaxed font-normal">
            Choose your community on{" "}
            <span className="font-bold text-[#FCD8A5]">IshtamChat</span> to find tailored matches.
          </p>
        </div>
      </div>

      {/* Sub-options Cards */}
      <div
        role="radiogroup"
        aria-label="Select matrimony community"
        className="relative z-10 flex flex-col gap-3 sm:gap-3.5"
      >
        {MATRIMONY_OPTIONS.map((option) => {
          const isSelected = selectedMatrimony === option.id;
          const IconComponent = option.icon;

          return (
            <div
              key={option.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => handleSelectMatrimony(option.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelectMatrimony(option.id);
                }
              }}
              className={cn(
                "group relative flex items-center gap-3.5 sm:gap-4 px-4.5 py-3.5 sm:px-5 sm:py-3.5 rounded-2xl cursor-pointer transition-all duration-200 ease-out select-none backdrop-blur-md overflow-hidden",
                isSelected
                  ? "bg-gradient-to-r from-white/[0.25] via-[#FBE3B5]/[0.20] to-white/[0.18] border-2 border-[#FCD8A5] ring-2 ring-[#FCD8A5]/40 shadow-[0_12px_32px_rgba(0,0,0,0.25),0_0_24px_rgba(251,227,181,0.3)]"
                  : "bg-gradient-to-r from-white/[0.14] via-[#FBE3B5]/[0.08] to-white/[0.10] hover:from-white/[0.22] hover:via-[#FBE3B5]/[0.15] hover:to-white/[0.16] border border-[#FBE3B5]/30 hover:border-[#FCD8A5]/80 hover:shadow-[0_10px_28px_rgba(0,0,0,0.22),0_0_22px_rgba(251,227,181,0.2)] hover:-translate-y-0.5 active:scale-[0.985]"
              )}
            >
              {/* Top specular hairline highlight */}
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent"
                aria-hidden="true"
              />

              {/* Subtle ambient accent glow on hover */}
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  option.accentGlowClass
                )}
                aria-hidden="true"
              />

              {/* Icon */}
              <div
                className={cn(
                  "relative z-10 grid h-12 w-12 sm:h-12.5 sm:w-12.5 shrink-0 place-items-center rounded-2xl border transition-transform duration-300 ease-out group-hover:scale-110 group-active:scale-95",
                  option.iconBgClass,
                  option.iconColorClass
                )}
              >
                <IconComponent className="h-6 w-6 sm:h-6.5 sm:w-6.5" />
              </div>

              {/* Title */}
              <div className="relative z-10 flex-1 min-w-0 pr-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-[-0.01em] text-white group-hover:text-[#FCD8A5] transition-colors duration-200 whitespace-nowrap leading-tight drop-shadow-xs">
                  {option.title}
                </span>
              </div>

              {/* Badge + subtle forward chevron */}
              <div className="relative z-10 flex items-center gap-2 shrink-0">
                <span
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-bold border whitespace-nowrap transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-xs",
                    option.badgeColorClass
                  )}
                >
                  {option.badge}
                </span>
                <IconArrowRight className="h-4 w-4 text-white/30 group-hover:text-[#FCD8A5] group-hover:translate-x-0.5 transition-all duration-200 hidden sm:block" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

    // Context-aware dynamic placeholders based on seeking gender (Bride vs Groom) and chosen community
  const isSeekingBride = seekingGender === "Female";
  const firstNamePlaceholder = isSeekingBride
    ? selectedMatrimony === "Telugu"
      ? "e.g. Karthik"
      : "e.g. Rahul"
    : selectedMatrimony === "Telugu"
    ? "e.g. Sravani"
    : "e.g. Ananya";

  const lastNamePlaceholder = isSeekingBride
    ? selectedMatrimony === "Telugu"
      ? "e.g. Reddy"
      : selectedMatrimony === "Bharat"
      ? "e.g. Sharma"
      : "e.g. Nair"
    : selectedMatrimony === "Telugu"
    ? "e.g. Rao"
    : selectedMatrimony === "Bharat"
    ? "e.g. Verma"
    : "e.g. Menon";

  // RENDER STEP 3: Full Registration Details Form
  const renderRegistrationStep = () => (
    <div className="w-full">
      {/* Header with Go Back, Context Tag, and Close Button */}
      <div className="relative z-20 mb-3.5 sm:mb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            type="button"
            onClick={handleGoBack}
            className="group focus-ring inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/95 hover:text-white border border-white/20 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xs text-xs font-bold tracking-tight"
            aria-label="Go back to previous step"
          >
            <IconArrowLeft className="h-3.5 w-3.5 stroke-[2.5] transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Go Back</span>
          </button>

          {/* Category / Community Badge Indicator */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-bold border border-[#C99757]/40 bg-[#C99757]/20 text-[#FCD8A5] shadow-xs">
            {selectedCategory === "Marriage"
              ? `${selectedMatrimony ?? "Kerala"} Matrimony`
              : selectedCategory === "Living-together"
              ? "Living Together"
              : "Friendship"}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="group focus-ring shrink-0 grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white/90 hover:text-white border border-white/20 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xs hover:rotate-90"
            aria-label="Close dialog"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        <div className="min-w-0">
          <h2 className="text-2xl sm:text-[26px] font-black tracking-tight font-editorial-title leading-tight drop-shadow-xs bg-gradient-to-r from-white via-amber-50 to-[#FBE3B5] bg-clip-text text-transparent">
            {selectedCategory === "Marriage"
              ? "Register for Marriage"
              : selectedCategory === "Living-together"
              ? "Register for Living Together"
              : "Register for Friendship"}
          </h2>
          <p className="mt-1 text-sm sm:text-base text-rose-100/90 leading-relaxed font-normal">
            Fill in your details to receive your 6-digit verification code.
          </p>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmitRegistration} className="relative z-10 space-y-3">
        {/* Marriage specific fields: Seeking for & Created by */}
        {selectedCategory === "Marriage" && (
          <div className="space-y-2.5 p-3 rounded-2xl bg-gradient-to-r from-white/[0.12] via-[#FBE3B5]/[0.08] to-white/[0.08] border border-[#FBE3B5]/25 shadow-xs">
            {/* Seeking for Bride / Groom */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#FCD8A5] mb-1.5 tracking-wide">
                I am seeking for
              </label>
              <div className="h-12 grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/15 border border-white/15">
                <button
                  type="button"
                  onClick={() => setSeekingGender("Female")}
                  className={cn(
                    "h-full flex items-center justify-center gap-1.5 px-3 rounded-lg text-sm sm:text-base font-bold transition-all duration-150 cursor-pointer",
                    seekingGender === "Female"
                      ? "bg-gradient-to-r from-[#D8B28C] via-[#E8BE88] to-[#C99757] text-[#3D0816] shadow-sm font-black"
                      : "text-white/85 hover:text-white hover:bg-white/15"
                  )}
                >
                  <IconHeartHandshake className="h-4 w-4" />
                  <span>Bride (Female)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSeekingGender("Male")}
                  className={cn(
                    "h-full flex items-center justify-center gap-1.5 px-3 rounded-lg text-sm sm:text-base font-bold transition-all duration-150 cursor-pointer",
                    seekingGender === "Male"
                      ? "bg-gradient-to-r from-[#D8B28C] via-[#E8BE88] to-[#C99757] text-[#3D0816] shadow-sm font-black"
                      : "text-white/85 hover:text-white hover:bg-white/15"
                  )}
                >
                  <IconUser className="h-4 w-4" />
                  <span>Groom (Male)</span>
                </button>
              </div>
            </div>

            {/* Created by with ModernSelect */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#FCD8A5] mb-1.5 tracking-wide">
                Profile Created By
              </label>
              <ModernSelect
                value={createdBy}
                onChange={setCreatedBy}
                options={CREATED_BY_OPTIONS}
                size="md"
                triggerClassName="h-12 rounded-xl border-white/20 bg-white text-[#180D12] text-sm sm:text-base font-medium hover:border-[#C99757]/80 focus:border-[#C99757] focus:ring-2 focus:ring-[#C99757]/20"
                menuClassName="border border-[#EAD8C7] bg-white/98 backdrop-blur-xl shadow-[0_16px_40px_rgba(30,3,10,0.35)] rounded-2xl p-1.5 z-50 overflow-hidden"
              />
            </div>
          </div>
        )}

        {/* Name Fields: First Name and Last Name */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#FCD8A5] mb-1.5 tracking-wide">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                if (error) setError(null);
              }}
              placeholder={firstNamePlaceholder}
              className="h-12 w-full px-3.5 rounded-xl border border-white/20 bg-white text-[#180D12] placeholder:text-neutral-400 text-sm sm:text-base font-medium focus:outline-none focus:border-[#C99757] focus:ring-2 focus:ring-[#C99757]/20 transition-all shadow-xs"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-[#FCD8A5] mb-1.5 tracking-wide">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                if (error) setError(null);
              }}
              placeholder={lastNamePlaceholder}
              className="h-12 w-full px-3.5 rounded-xl border border-white/20 bg-white text-[#180D12] placeholder:text-neutral-400 text-sm sm:text-base font-medium focus:outline-none focus:border-[#C99757] focus:ring-2 focus:ring-[#C99757]/20 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Mobile Number Field */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-[#FCD8A5] mb-1.5 tracking-wide">
            Mobile Number
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 flex items-center gap-1.5 text-sm sm:text-base font-bold text-[#7A1835] pointer-events-none select-none">
              <span>🇮🇳 +91</span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, ""));
                if (error) setError(null);
              }}
              placeholder="98765 43210"
              className="h-12 w-full pl-20 pr-4 rounded-xl border border-white/20 bg-white text-[#180D12] placeholder:text-neutral-400 text-sm sm:text-base font-medium focus:outline-none focus:border-[#C99757] focus:ring-2 focus:ring-[#C99757]/20 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Error Message Alert */}
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-400/40 text-sm font-semibold text-rose-200 animate-in fade-in duration-200">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full mt-2 px-5 rounded-xl bg-gradient-to-b from-[#F3DFBC] via-[#E8BE88] to-[#C99757] hover:from-[#F8E7CD] hover:to-[#D4A367] text-[#3D0816] font-black text-sm sm:text-base tracking-tight border-t border-white/40 border-x border-[#D8B28C] border-b-2 border-b-[#7A501E] shadow-[0_8px_20px_-3px_rgba(0,0,0,0.5),0_2px_5px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-2px_3px_rgba(122,80,30,0.3)] hover:shadow-[0_12px_26px_-3px_rgba(0,0,0,0.6),0_3px_7px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 active:translate-y-[1.5px] active:shadow-[0_2px_5px_rgba(0,0,0,0.4)] transition-all duration-150 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <IconLoader2 className="h-4 w-4 animate-spin text-[#3D0816]" />
              <span>Sending Verification Code...</span>
            </>
          ) : (
            <>
              <span>Register Free & Verify</span>
              <IconArrowRight className="h-4 w-4 stroke-[2.5]" />
            </>
          )}
        </button>

        {/* Trust Reassurance Badge */}
        <div className="flex items-center justify-center gap-2 pt-0.5 text-xs sm:text-sm text-rose-100/85 font-medium">
          <IconShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>100% Privacy • No Spam Guarantee</span>
        </div>
      </form>
    </div>
  );

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="looking-for-modal-heading"
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4 text-center">
        {/* Glassmorphism Backdrop with Deep Blur & Dark Translucent Tint */}
        <div
          className={cn(
            "fixed inset-0 bg-neutral-950/45 backdrop-blur-md transition-opacity duration-400 ease-out touch-none select-none",
            isAnimatingIn ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={onClose}
          onTouchMove={(e) => e.preventDefault()}
          aria-hidden="true"
        />

        {/* Glassmorphic Modal Card */}
        <div
          className={cn(
            "relative w-full max-w-full sm:max-w-[485px] transform overflow-hidden rounded-t-[2.25rem] sm:rounded-[2rem] rounded-b-none sm:rounded-b-[2rem] text-left transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
            // Luxury Deep Burgundy Gradient with Champagne Gold Border
            "bg-gradient-to-br from-[#9E2046] via-[#781432] to-[#45091A] text-white backdrop-blur-2xl",
            "border-t sm:border border-[#FBE3B5]/50 sm:border-[#FBE3B5]/40",
            // Luxury elevated shadows & ambient gold shimmer
            "shadow-[0_-16px_50px_rgba(50,5,18,0.5),0_0_35px_rgba(251,227,181,0.12)] sm:shadow-[0_28px_80px_rgba(45,4,16,0.55),0_0_45px_rgba(251,227,181,0.18)]",
            "px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-6 sm:pb-6",
            // Smooth entering and exiting motion for dialog itself
            isAnimatingIn
              ? "opacity-100 translate-y-0 sm:scale-100"
              : "opacity-0 translate-y-12 sm:translate-y-6 sm:scale-[0.96] pointer-events-none"
          )}
        >
          {/* Mobile Native Sheet Grab / Pull Handle Bar */}
          <div className="flex sm:hidden justify-center pt-1 pb-2">
            <div className="h-1.25 w-11 rounded-full bg-[#FBE3B5]/40" />
          </div>

          {/* Golden Radiance Blend Layer across surface */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_80%_at_90%_0%,rgba(251,227,181,0.30)_0%,rgba(216,166,94,0.15)_35%,transparent_75%)]"
            aria-hidden="true"
          />

          {/* Subtle Ambient Radial Glow Accents inside glass container */}
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-60 w-60 rounded-full bg-gradient-to-bl from-[#FBE3B5]/35 via-[#D8A65E]/20 to-transparent blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-24 h-60 w-60 rounded-full bg-[#FF809B]/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#FBE3B5] to-transparent"
            aria-hidden="true"
          />

          {/* Active Step Content - Direct, instant display without content transition effects */}
          <div className="relative w-full">
            {currentStep === "category" && renderCategoryStep()}
            {currentStep === "matrimony_sub" && renderMatrimonyStep()}
            {currentStep === "registration_form" && renderRegistrationStep()}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
