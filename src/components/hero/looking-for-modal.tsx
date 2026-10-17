"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  IconHeartHandshake,
  IconUsers,
  IconHomeHeart,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";

export type LookingForOption = "Marriage" | "Friendship" | "Living-together";

export interface LookingForModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (option: LookingForOption) => void;
  initialOption?: LookingForOption | null;
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

export function LookingForModal({
  isOpen,
  onClose,
  onSelectOption,
  initialOption = null,
}: LookingForModalProps) {
  const [selectedOption, setSelectedOption] = useState<LookingForOption | null>(initialOption ?? null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedOption(initialOption ?? null);
    }
  }, [isOpen, initialOption]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
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

  if (!isOpen || !mounted) return null;

  const handleSelectOption = (optionId: LookingForOption) => {
    setSelectedOption(optionId);
    // Brief visual feedback before triggering user flow
    setTimeout(() => {
      onSelectOption(optionId);
    }, 130);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="looking-for-modal-heading"
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-6 text-center">
        {/* Glassmorphism Backdrop with Deep Blur & Dark Translucent Tint */}
        <div
          className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md transition-opacity duration-300 animate-in fade-in touch-none select-none"
          onClick={onClose}
          onTouchMove={(e) => e.preventDefault()}
          aria-hidden="true"
        />

        {/* Glassmorphic Modal Card / Mobile Bottom Sheet */}
        <div
          className={cn(
            "relative w-full max-w-full sm:max-w-[475px] transform overflow-hidden rounded-t-[2.25rem] sm:rounded-[2rem] rounded-b-none sm:rounded-b-[2rem] text-left transition-all duration-300",
            // Luxury Warm Ivory Glassmorphic Background with Champagne Gold Border
            "bg-gradient-to-b from-[#FFFDFB]/98 via-[#FFF9F6]/95 to-[#FAF2EF]/98 backdrop-blur-2xl",
            "border-t sm:border border-[#EAD8C7]/90",
            // Luxury elevated shadows & ambient gold shimmer
            "shadow-[0_-14px_44px_rgba(122,24,53,0.18)] sm:shadow-[0_28px_72px_rgba(122,24,53,0.18),0_12px_28px_rgba(216,178,140,0.15)]",
            "animate-in fade-in slide-in-from-bottom-8 sm:zoom-in-95 sm:slide-in-from-bottom-3 duration-300",
            "px-5 pt-3 pb-[max(2rem,env(safe-area-inset-bottom))] sm:p-7"
          )}
        >
          {/* Mobile Native Sheet Grab / Pull Handle Bar */}
          <div className="flex sm:hidden justify-center pt-1 pb-2.5">
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

          {/* Header with Title and Close Button in a non-overlapping flex layout */}
          <div className="relative z-20 mb-5 sm:mb-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2
                  id="looking-for-modal-heading"
                  className="text-2xl sm:text-[28px] font-black tracking-tight text-[#5C1027] font-editorial-title leading-tight"
                >
                  What You're Looking For
                </h2>
              </div>

              {/* Close Button with App Champagne Theme */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="focus-ring shrink-0 grid h-9 w-9 place-items-center rounded-full bg-[#FAF3EC]/90 hover:bg-[#F7E8EB] active:scale-95 text-[#7A1835] hover:text-[#5C1027] border border-[#EAD8C7] transition-all cursor-pointer shadow-2xs"
                aria-label="Close dialog"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-1.5 text-xs sm:text-sm text-[#766B6F] leading-relaxed font-normal">
              Choose the type of connection you are seeking on{" "}
              <span className="font-bold text-[#7A1835]">IshtamChat</span> to tailor your registration.
            </p>
          </div>

          {/* Selectable Options List (3 Themed Glass Option Cards) */}
          <div
            role="radiogroup"
            aria-labelledby="looking-for-modal-heading"
            className="relative z-10 flex flex-col gap-3 sm:gap-3.5"
          >
            {LOOKING_FOR_OPTIONS.map((option) => {
              const isSelected = selectedOption === option.id;
              const IconComponent = option.icon;

              return (
                <div
                  key={option.id}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => handleSelectOption(option.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectOption(option.id);
                    }
                  }}
                  className={cn(
                    "group relative flex items-center gap-3.5 sm:gap-4 px-4 py-3 sm:px-4.5 sm:py-3.5 rounded-2xl cursor-pointer transition-all duration-200 select-none",
                    // App themed card styling
                    isSelected
                      ? "bg-white border-2 border-[#7A1835] shadow-[0_12px_32px_rgba(122,24,53,0.16)] ring-4 ring-[#7A1835]/12 scale-[1.01]"
                      : "bg-white/85 border border-[#EAD8C7]/80 hover:bg-white hover:border-[#7A1835]/40 hover:shadow-[0_10px_26px_rgba(122,24,53,0.08)] hover:-translate-y-0.5"
                  )}
                >
                  {/* Option Icon with themed container */}
                  <div
                    className={cn(
                      "grid h-12 w-12 sm:h-13 sm:w-13 shrink-0 place-items-center rounded-2xl border transition-transform duration-200 group-hover:scale-105",
                      option.iconBgClass,
                      option.iconColorClass
                    )}
                  >
                    <IconComponent className="h-6 w-6 sm:h-6.5 sm:w-6.5" />
                  </div>

                  {/* Option Title */}
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="text-[17px] sm:text-lg font-extrabold tracking-[-0.02em] text-[#211B1E] group-hover:text-[#7A1835] transition-colors whitespace-nowrap leading-tight">
                      {option.title}
                    </span>
                  </div>

                  {/* Themed Pill Badge on the right */}
                  <div className="shrink-0">
                    <span
                      className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold border whitespace-nowrap transition-transform duration-200 group-hover:scale-105 shadow-2xs",
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
      </div>
    </div>,
    document.body
  );
}
