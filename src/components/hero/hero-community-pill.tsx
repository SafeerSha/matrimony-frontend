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
}

export function HeroCommunityPill({
  className,
  onSelectCommunity,
  orientation = "vertical",
  variant = "hero",
}: HeroCommunityPillProps) {
  const isNavbar = variant === "navbar";

  const handleClick = (communityId: string) => {
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
        return (
          <button
            key={comm.id}
            type="button"
            onClick={() => handleClick(comm.id)}
            aria-label={`Explore ${comm.name}`}
            className={cn(
              "group relative overflow-hidden inline-flex items-center gap-2 transition-all duration-200 select-none cursor-pointer shrink-0 whitespace-nowrap",
              isNavbar
                ? "rounded-xl border border-[var(--border)]/90 bg-white/75 hover:bg-white/98 backdrop-blur-md px-3.5 py-2 text-xs sm:text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)] shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                : "rounded-full border border-amber-300/40 bg-black/70 hover:bg-black/85 backdrop-blur-md px-3 py-1 sm:py-1.5 text-xs sm:text-[13px] font-bold text-amber-100 shadow-[0_3px_12px_rgba(0,0,0,0.4)] hover:border-amber-300/80 hover:scale-[1.03] active:scale-[0.97]"
            )}
          >
            {/* Cascading Looped Light Sheen */}
            <span
              className={cn(
                "pointer-events-none absolute -inset-y-0 w-3/4 z-0 animate-sleek-shine skew-x-[-20deg]",
                isNavbar
                  ? "bg-gradient-to-r from-transparent via-[#FBE3B5]/35 to-transparent"
                  : "bg-gradient-to-r from-transparent via-[#FBE3B5]/85 to-transparent"
              )}
              style={{ animationDelay: `${idx * 0.45}s` }}
              aria-hidden="true"
            />

            {/* Respective Community Icon */}
            <IconComponent
              className={cn(
                "h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 relative z-10 transition-transform group-hover:scale-110",
                isNavbar ? comm.navbarColor : comm.iconColor
              )}
              aria-hidden="true"
            />

            {/* Community Name */}
            <span className="relative z-10 tracking-normal leading-none">
              {comm.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
