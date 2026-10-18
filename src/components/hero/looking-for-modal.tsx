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
  IconSparkles,
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
    iconBgClass: "bg-[#FDF2F4] border-[#F7C6CE] shadow-[0_4px_14px_rgba(122,24,53,0.12)]",
    iconColorClass: "text-[#7A1835]",
    accentGlowClass: "from-[#7A1835]/10 via-[#7A1835]/5 to-transparent",
    badgeColorClass: "bg-[#FDF2F4] text-[#7A1835] border-[#F7C6CE]",
  },
  {
    id: "Friendship",
    title: "Friendship",
    badge: "Social Circle",
    icon: IconUsers,
    iconBgClass: "bg-[#FAF3EC] border-[#EAD8C7] shadow-[0_4px_14px_rgba(216,178,140,0.18)]",
    iconColorClass: "text-[#8C5D2C]",
    accentGlowClass: "from-[#D8B28C]/15 via-[#D8B28C]/5 to-transparent",
    badgeColorClass: "bg-[#FAF3EC] text-[#8C5D2C] border-[#EAD8C7]",
  },
  {
    id: "Living-together",
    title: "Living-together",
    badge: "Modern Living",
    icon: IconHomeHeart,
    iconBgClass: "bg-[#F0F7F4] border-[#C8E4D6] shadow-[0_4px_14px_rgba(30,126,82,0.12)]",
    iconColorClass: "text-[#1E7E52]",
    accentGlowClass: "from-[#1E7E52]/10 via-[#1E7E52]/5 to-transparent",
    badgeColorClass: "bg-[#F0F7F4] text-[#1E7E52] border-[#C8E4D6]",
  },
];

const MATRIMONY_OPTIONS: MatrimonySubOptionConfig[] = [
  {
    id: "Kerala",
    title: "Kerala matrimony",
    badge: "Malayali",
    icon: IconHeartHandshake,
    iconBgClass: "bg-[#FDF2F4] border-[#F7C6CE] shadow-[0_4px_14px_rgba(122,24,53,0.12)]",
    iconColorClass: "text-[#7A1835]",
    accentGlowClass: "from-[#7A1835]/10 via-[#7A1835]/5 to-transparent",
    badgeColorClass: "bg-[#FDF2F4] text-[#7A1835] border-[#F7C6CE]",
  },
  {
    id: "Telugu",
    title: "Telugu matrimony",
    badge: "Telugu",
    icon: IconSparkles,
    iconBgClass: "bg-[#FAF3EC] border-[#EAD8C7] shadow-[0_4px_14px_rgba(216,178,140,0.18)]",
    iconColorClass: "text-[#8C5D2C]",
    accentGlowClass: "from-[#D8B28C]/15 via-[#D8B28C]/5 to-transparent",
    badgeColorClass: "bg-[#FAF3EC] text-[#8C5D2C] border-[#EAD8C7]",
  },
  {
    id: "Bharat",
    title: "Bharat matrimony",
    badge: "Pan-India",
    icon: IconWorld,
    iconBgClass: "bg-[#F0F7F4] border-[#C8E4D6] shadow-[0_4px_14px_rgba(30,126,82,0.12)]",
    iconColorClass: "text-[#1E7E52]",
    accentGlowClass: "from-[#1E7E52]/10 via-[#1E7E52]/5 to-transparent",
    badgeColorClass: "bg-[#F0F7F4] text-[#1E7E52] border-[#C8E4D6]",
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
  onSelectOption,
  initialOption = null,
  initialPhone,
}: LookingForModalProps) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<ModalStep>("category");
  const [slideDirection, setSlideDirection] = useState<"forward" | "backward">("forward");
  const [selectedCategory, setSelectedCategory] = useState<LookingForOption | null>(initialOption ?? null);
  const [selectedMatrimony, setSelectedMatrimony] = useState<MatrimonyCommunityOption | null>(null);

  // Form Fields State
  const [seekingGender, setSeekingGender] = useState<"Female" | "Male">("Female"); // Bride = Female, Groom = Male
  const [createdBy, setCreatedBy] = useState("Myself");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState(initialPhone ? initialPhone.replace(/\D/g, "").slice(-10) : "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setCurrentStep("category");
      setSlideDirection("forward");
      setSelectedCategory(initialOption ?? null);
      setSelectedMatrimony(null);
      setError(null);
      setIsSubmitting(false);

      if (initialPhone) {
        setPhone(initialPhone.replace(/\D/g, "").slice(-10));
      }

      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimatingIn(true);
        });
      });
      return () => cancelAnimationFrame(frame);
    } else {
      setIsAnimatingIn(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialOption, initialPhone]);

  const handleGoBack = useCallback(() => {
    setError(null);
    setSlideDirection("backward");
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
    setSlideDirection("forward");

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
    setSlideDirection("forward");
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
      onClose();
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
      onClose();
      router.push("/verify");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            "fixed inset-0 bg-neutral-950/60 backdrop-blur-md transition-opacity duration-300 ease-out touch-none select-none",
            isAnimatingIn ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={onClose}
          onTouchMove={(e) => e.preventDefault()}
          aria-hidden="true"
        />

        {/* Glassmorphic Modal Card - Natural Height Without Dead Empty Space */}
        <div
          className={cn(
            "relative w-full max-w-full sm:max-w-[485px] transform overflow-hidden rounded-t-[2.25rem] sm:rounded-[2rem] rounded-b-none sm:rounded-b-[2rem] text-left transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            // Luxury Warm Ivory Glassmorphic Background with Champagne Gold Border
            "bg-gradient-to-b from-[#FFFDFB]/98 via-[#FFF9F6]/95 to-[#FAF2EF]/98 backdrop-blur-2xl",
            "border-t sm:border border-[#EAD8C7]/90",
            // Luxury elevated shadows & ambient gold shimmer
            "shadow-[0_-14px_44px_rgba(122,24,53,0.18)] sm:shadow-[0_24px_64px_rgba(122,24,53,0.18),0_10px_24px_rgba(216,178,140,0.14)]",
            "px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-6 sm:pb-6",
            // Smooth entering and exiting motion
            isAnimatingIn
              ? "opacity-100 translate-y-0 sm:scale-100"
              : "opacity-0 translate-y-full sm:translate-y-4 sm:scale-95 pointer-events-none"
          )}
        >
          {/* Mobile Native Sheet Grab / Pull Handle Bar */}
          <div className="flex sm:hidden justify-center pt-1 pb-2">
            <div className="h-1.25 w-11 rounded-full bg-[#D5C2C6]/90" />
          </div>

          {/* Subtle Ambient Radial Glow Accents inside glass container */}
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-60 w-60 rounded-full bg-[#D8B28C]/22 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-24 h-60 w-60 rounded-full bg-[#7A1835]/14 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#D8B28C]/70 to-transparent"
            aria-hidden="true"
          />

          {/* Active Step Content with Directional Motion */}
          <div className="relative w-full">
            {/* STEP 1: Main Category Selection */}
            {currentStep === "category" && (
              <div
                key="step-category"
                className={cn(
                  "w-full transition-opacity duration-250 ease-out",
                  slideDirection === "forward"
                    ? "animate-in fade-in slide-in-from-right-4 duration-250"
                    : "animate-in fade-in slide-in-from-left-4 duration-250"
                )}
              >
                {/* Header with Title and Close Button */}
                <div className="relative z-20 mb-4 sm:mb-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h2
                        id="looking-for-modal-heading"
                        className="text-2xl sm:text-[27px] font-black tracking-tight text-[#5C1027] font-editorial-title leading-tight"
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
                      className="group focus-ring shrink-0 grid h-9 w-9 place-items-center rounded-full bg-[#FAF3EC]/90 hover:bg-[#F7E8EB] active:scale-90 text-[#7A1835] hover:text-[#5C1027] border border-[#EAD8C7] transition-all duration-200 cursor-pointer shadow-2xs hover:rotate-90"
                      aria-label="Close dialog"
                    >
                      <IconX className="h-4 w-4 transition-transform duration-200" />
                    </button>
                  </div>

                  <p className="mt-1 text-xs sm:text-sm text-[#766B6F] leading-relaxed font-normal">
                    Choose the type of connection you are seeking on{" "}
                    <span className="font-bold text-[#7A1835]">IshtamChat</span> to tailor your registration.
                  </p>
                </div>

                {/* Options Cards - Uniform 2px Border & Perfect Balanced Padding */}
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
                          "group relative flex items-center gap-3.5 sm:gap-4 px-4.5 py-3.5 sm:px-5 sm:py-3.5 rounded-2xl cursor-pointer transition-all duration-200 ease-out select-none",
                          // Uniform 2px border everywhere so padding NEVER shifts or squishes
                          isSelected
                            ? "bg-white border-2 border-[#7A1835] shadow-[0_8px_24px_rgba(122,24,53,0.14)]"
                            : "bg-white/85 border-2 border-[#EAD8C7]/70 hover:bg-white hover:border-[#7A1835]/40 hover:shadow-[0_8px_20px_rgba(122,24,53,0.08)] hover:-translate-y-0.5 active:scale-[0.985]"
                        )}
                      >
                        <div
                          className={cn(
                            "grid h-12 w-12 sm:h-12.5 sm:w-12.5 shrink-0 place-items-center rounded-2xl border transition-transform duration-300 ease-out group-hover:scale-110 group-active:scale-95",
                            option.iconBgClass,
                            option.iconColorClass
                          )}
                        >
                          <IconComponent className="h-6 w-6 sm:h-6.5 sm:w-6.5" />
                        </div>

                        <div className="flex-1 min-w-0 pr-2">
                          <span className="text-[17px] sm:text-lg font-extrabold tracking-[-0.02em] text-[#211B1E] group-hover:text-[#7A1835] transition-colors duration-200 whitespace-nowrap leading-tight">
                            {option.title}
                          </span>
                        </div>

                        <div className="shrink-0">
                          <span
                            className={cn(
                              "inline-flex items-center px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold border whitespace-nowrap transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-xs",
                              option.badgeColorClass
                            )}
                          >
                            {option.badge}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Matrimony Sub-options (Kerala, Telugu, Bharat) */}
            {currentStep === "matrimony_sub" && (
              <div
                key="step-matrimony-sub"
                className={cn(
                  "w-full transition-opacity duration-250 ease-out",
                  slideDirection === "forward"
                    ? "animate-in fade-in slide-in-from-right-4 duration-250"
                    : "animate-in fade-in slide-in-from-left-4 duration-250"
                )}
              >
                {/* Header */}
                <div className="relative z-20 mb-4 sm:mb-5">
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <button
                      type="button"
                      onClick={handleGoBack}
                      className="group focus-ring inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF3EC]/95 hover:bg-[#F7E8EB] active:scale-95 text-[#7A1835] hover:text-[#5C1027] border border-[#EAD8C7] transition-all duration-200 cursor-pointer shadow-2xs text-xs sm:text-sm font-bold tracking-tight"
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
                      className="group focus-ring shrink-0 grid h-9 w-9 place-items-center rounded-full bg-[#FAF3EC]/90 hover:bg-[#F7E8EB] active:scale-90 text-[#7A1835] hover:text-[#5C1027] border border-[#EAD8C7] transition-all duration-200 cursor-pointer shadow-2xs hover:rotate-90"
                      aria-label="Close dialog"
                    >
                      <IconX className="h-4 w-4 transition-transform duration-200" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-2xl sm:text-[27px] font-black tracking-tight text-[#5C1027] font-editorial-title leading-tight">
                      Select Matrimony
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-[#766B6F] leading-relaxed font-normal">
                      Choose your community on{" "}
                      <span className="font-bold text-[#7A1835]">IshtamChat</span> to find tailored matches.
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
                          "group relative flex items-center gap-3.5 sm:gap-4 px-4.5 py-3.5 sm:px-5 sm:py-3.5 rounded-2xl cursor-pointer transition-all duration-200 ease-out select-none",
                          isSelected
                            ? "bg-white border-2 border-[#7A1835] shadow-[0_8px_24px_rgba(122,24,53,0.14)]"
                            : "bg-white/85 border-2 border-[#EAD8C7]/70 hover:bg-white hover:border-[#7A1835]/40 hover:shadow-[0_8px_20px_rgba(122,24,53,0.08)] hover:-translate-y-0.5 active:scale-[0.985]"
                        )}
                      >
                        <div
                          className={cn(
                            "grid h-12 w-12 sm:h-12.5 sm:w-12.5 shrink-0 place-items-center rounded-2xl border transition-transform duration-300 ease-out group-hover:scale-110 group-active:scale-95",
                            option.iconBgClass,
                            option.iconColorClass
                          )}
                        >
                          <IconComponent className="h-6 w-6 sm:h-6.5 sm:w-6.5" />
                        </div>

                        <div className="flex-1 min-w-0 pr-2">
                          <span className="text-[17px] sm:text-lg font-extrabold tracking-[-0.02em] text-[#211B1E] group-hover:text-[#7A1835] transition-colors duration-200 whitespace-nowrap leading-tight">
                            {option.title}
                          </span>
                        </div>

                        <div className="shrink-0">
                          <span
                            className={cn(
                              "inline-flex items-center px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold border whitespace-nowrap transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-xs",
                              option.badgeColorClass
                            )}
                          >
                            {option.badge}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 3: Full Registration Details Form */}
            {currentStep === "registration_form" && (
              <div
                key="step-registration-form"
                className={cn(
                  "w-full transition-opacity duration-250 ease-out",
                  slideDirection === "forward"
                    ? "animate-in fade-in slide-in-from-right-4 duration-250"
                    : "animate-in fade-in slide-in-from-left-4 duration-250"
                )}
              >
                {/* Header with Go Back, Context Tag, and Close Button */}
                <div className="relative z-20 mb-3.5 sm:mb-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <button
                      type="button"
                      onClick={handleGoBack}
                      className="group focus-ring inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF3EC]/95 hover:bg-[#F7E8EB] active:scale-95 text-[#7A1835] hover:text-[#5C1027] border border-[#EAD8C7] transition-all duration-200 cursor-pointer shadow-2xs text-xs font-bold tracking-tight"
                      aria-label="Go back to previous step"
                    >
                      <IconArrowLeft className="h-3.5 w-3.5 stroke-[2.5] transition-transform duration-200 group-hover:-translate-x-0.5" />
                      <span>Go Back</span>
                    </button>

                    {/* Category / Community Badge Indicator */}
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold border border-[#EAD8C7] bg-[#FAF3EC] text-[#7A1835] shadow-2xs">
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
                      className="group focus-ring shrink-0 grid h-8 w-8 place-items-center rounded-full bg-[#FAF3EC]/90 hover:bg-[#F7E8EB] active:scale-90 text-[#7A1835] hover:text-[#5C1027] border border-[#EAD8C7] transition-all duration-200 cursor-pointer shadow-2xs hover:rotate-90"
                      aria-label="Close dialog"
                    >
                      <IconX className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-[23px] font-black tracking-tight text-[#5C1027] font-editorial-title leading-tight">
                      {selectedCategory === "Marriage"
                        ? "Register for Marriage"
                        : selectedCategory === "Living-together"
                        ? "Register for Living Together"
                        : "Register for Friendship"}
                    </h2>
                    <p className="mt-0.5 text-xs text-[#766B6F] leading-relaxed font-normal">
                      Fill in your details to receive your 6-digit verification code.
                    </p>
                  </div>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmitRegistration} className="relative z-10 space-y-3">
                  {/* Marriage specific fields: Seeking for & Created by */}
                  {selectedCategory === "Marriage" && (
                    <div className="space-y-2.5 p-3 rounded-2xl bg-white/75 border border-[#EAD8C7]/90 shadow-2xs">
                      {/* Seeking for Bride / Groom */}
                      <div>
                        <label className="block text-[11px] font-bold text-[#5C1027] mb-1 uppercase tracking-wider">
                          I am seeking for
                        </label>
                        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#FAF3EC] border border-[#EAD8C7]">
                          <button
                            type="button"
                            onClick={() => setSeekingGender("Female")}
                            className={cn(
                              "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer",
                              seekingGender === "Female"
                                ? "bg-white text-[#7A1835] shadow-xs border border-[#F7C6CE]"
                                : "text-[#766B6F] hover:text-[#211B1E]"
                            )}
                          >
                            <IconHeartHandshake className="h-4 w-4" />
                            <span>Bride (Female)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSeekingGender("Male")}
                            className={cn(
                              "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer",
                              seekingGender === "Male"
                                ? "bg-white text-[#7A1835] shadow-xs border border-[#F7C6CE]"
                                : "text-[#766B6F] hover:text-[#211B1E]"
                            )}
                          >
                            <IconUser className="h-4 w-4" />
                            <span>Groom (Male)</span>
                          </button>
                        </div>
                      </div>

                      {/* Created by with ModernSelect */}
                      <div>
                        <label className="block text-[11px] font-bold text-[#5C1027] mb-1 uppercase tracking-wider">
                          Profile Created By
                        </label>
                        <ModernSelect
                          value={createdBy}
                          onChange={setCreatedBy}
                          options={CREATED_BY_OPTIONS}
                          size="sm"
                          triggerClassName="h-9.5 rounded-xl border-[#EAD8C7] bg-white text-[#211B1E] text-xs sm:text-sm font-semibold hover:border-[#7A1835]/40 hover:bg-[#FAF3EC]/30 focus:border-[#7A1835] focus:ring-2 focus:ring-[#7A1835]/12"
                          menuClassName="border border-[#EAD8C7] bg-white/98 backdrop-blur-xl shadow-[0_16px_40px_rgba(122,24,53,0.18)] rounded-2xl p-1.5 z-50 overflow-hidden"
                        />
                      </div>
                    </div>
                  )}

                  {/* Name Fields: First Name and Last Name */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#5C1027] mb-1 uppercase tracking-wider">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="e.g. Rahul"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#EAD8C7] bg-white text-[#211B1E] placeholder:text-[#A89FA3] text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#7A1835] focus:ring-2 focus:ring-[#7A1835]/12 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#5C1027] mb-1 uppercase tracking-wider">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                          if (error) setError(null);
                        }}
                        placeholder="e.g. Nair"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#EAD8C7] bg-white text-[#211B1E] placeholder:text-[#A89FA3] text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#7A1835] focus:ring-2 focus:ring-[#7A1835]/12 transition-all"
                      />
                    </div>
                  </div>

                  {/* Mobile Number Field */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#5C1027] mb-1 uppercase tracking-wider">
                      Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#7A1835] pointer-events-none select-none">
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
                        className="w-full pl-20 pr-4 py-2 rounded-xl border border-[#EAD8C7] bg-white text-[#211B1E] placeholder:text-[#A89FA3] text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#7A1835] focus:ring-2 focus:ring-[#7A1835]/12 transition-all"
                      />
                    </div>
                  </div>

                  {/* Error Message Alert */}
                  {error && (
                    <div className="p-2.5 rounded-xl bg-[#FDF2F4] border border-[#F7C6CE] text-xs font-semibold text-[#7A1835] animate-in fade-in duration-200">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-1.5 py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#7A1835] via-[#6D142E] to-[#5C1027] text-white font-extrabold text-xs sm:text-sm tracking-tight shadow-[0_8px_20px_rgba(122,24,53,0.22)] hover:shadow-[0_12px_28px_rgba(122,24,53,0.3)] hover:brightness-105 active:scale-[0.985] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                        <span>Sending Verification Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Register Free & Verify</span>
                        <IconArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  {/* Trust Reassurance Badge */}
                  <div className="flex items-center justify-center gap-2 pt-0.5 text-[11px] text-[#766B6F]">
                    <IconShieldCheck className="h-3.5 w-3.5 text-[#1E7E52]" />
                    <span>100% Privacy • No Spam Guarantee</span>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
