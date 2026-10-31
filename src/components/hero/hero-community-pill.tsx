"use client";

import React from "react";
import { IconHeartHandshake, IconCrown, IconWorld } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

export interface CommunityItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  iconColor: string;
  navbarColor: string;
}

const COMMUNITIES: CommunityItem[] = [
  {
    id: "Kerala",
    name: "Kerala Matrimony",
    icon: IconHeartHandshake,
    iconColor: "text-rose-300",
    navbarColor: "text-rose-600",
  },
  {
    id: "Telugu",
    name: "Telugu Matrimony",
    icon: IconCrown,
    iconColor: "text-amber-300",
    navbarColor: "text-amber-600",
  },
  {
    id: "Bharat",
    name: "Bharat Matrimony",
    icon: IconWorld,
    iconColor: "text-emerald-300",
    navbarColor: "text-emerald-600",
  },
];

export interface HeroCommunityPillProps {
  className?: string;
  onSelectCommunity?: (communityId: string) => void;
  orientation?: "vertical" | "horizontal";
  variant?: "hero" | "navbar";
  clickable?: boolean;
}

export function HeroCommunityPill({
  className,
  onSelectCommunity,
  orientation = "vertical",
  variant = "hero",
  clickable,
}: HeroCommunityPillProps) {
  const isNavbar = variant === "navbar";
  const isClickable = clickable !== undefined ? clickable : !isNavbar;

  const handleClick = (communityId: string) => {
    if (!isClickable) return;
    if (onSelectCommunity) {
      onSelectCommunity(communityId);
    } else {
      window.dispatchEvent(
        new CustomEvent("open-looking-for-community", {
          detail: { community: communityId },
        })
      );
    }
  };

  return (
    <div
      className={cn(
        orientation === "horizontal"
          ? "flex flex-row items-center gap-2 shrink-0"
          : "flex flex-col items-end gap-1.5 shrink-0",
        className
      )}
    >
      {COMMUNITIES.map((comm, idx) => {
        const IconComponent = comm.icon;
        const itemContent = (
          <>
            {/* Cascading Looped Light Sheen */}
            <span
              className={cn(
                "pointer-events-none absolute -inset-y-0 w-3/4 z-0 animate-sleek-shine skew-x-[-20deg]",
                isNavbar
                  ? "bg-gradient-to-r from-transparent via-[#FBE3B5]/25 to-transparent"
                  : "bg-gradient-to-r from-transparent via-[#FBE3B5]/85 to-transparent"
              )}
              style={{ animationDelay: `${idx * 0.45}s` }}
              aria-hidden="true"
            />

            {/* Respective Community Icon */}
            <IconComponent
              className={cn(
                "h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 relative z-10",
                isNavbar ? comm.navbarColor : comm.iconColor
              )}
              aria-hidden="true"
            />

            {/* Community Name */}
            <span className="relative z-10 tracking-normal leading-none font-medium">
              {comm.name}
            </span>
          </>
        );

        const baseClasses = cn(
          "group relative overflow-hidden inline-flex items-center gap-2 select-none shrink-0 whitespace-nowrap",
          isNavbar
            ? "rounded-xl border border-[var(--border)]/90 bg-white/70 backdrop-blur-md px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm text-[var(--foreground)] shadow-2xs"
            : "rounded-full border border-amber-300/40 bg-black/70 backdrop-blur-md px-3 py-1 sm:py-1.5 text-xs sm:text-[13px] font-bold text-amber-100 shadow-[0_3px_12px_rgba(0,0,0,0.4)]",
          isClickable
            ? isNavbar
              ? "cursor-pointer hover:bg-white/95 hover:text-[var(--primary)] hover:border-[var(--primary)]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              : "cursor-pointer hover:border-amber-300/80 hover:bg-black/85 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
            : "cursor-default pointer-events-none"
        );

        if (!isClickable) {
          return (
            <div key={comm.id} className={baseClasses}>
              {itemContent}
            </div>
          );
        }

        return (
          <button
            key={comm.id}
            type="button"
            onClick={() => handleClick(comm.id)}
            aria-label={`Explore ${comm.name}`}
            className={baseClasses}
          >
            {itemContent}
          </button>
        );
      })}
    </div>
  );
}
