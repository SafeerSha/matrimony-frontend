"use client";

import React from "react";
import { IconHeartHandshake, IconCrown, IconWorld } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

export interface CommunityItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  iconColor: string;
}

const COMMUNITIES: CommunityItem[] = [
  {
    id: "Kerala",
    name: "Kerala Matrimony",
    icon: IconHeartHandshake,
    iconColor: "text-rose-300",
  },
  {
    id: "Telugu",
    name: "Telugu Matrimony",
    icon: IconCrown,
    iconColor: "text-amber-300",
  },
  {
    id: "Bharat",
    name: "Bharat Matrimony",
    icon: IconWorld,
    iconColor: "text-emerald-300",
  },
];

export interface HeroCommunityPillProps {
  className?: string;
  onSelectCommunity?: (communityId: string) => void;
}

export function HeroCommunityPill({ className, onSelectCommunity }: HeroCommunityPillProps) {
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
    <div className={cn("flex flex-col items-end gap-1.5 shrink-0", className)}>
      {COMMUNITIES.map((comm, idx) => {
        const IconComponent = comm.icon;
        return (
          <button
            key={comm.id}
            type="button"
            onClick={() => handleClick(comm.id)}
            aria-label={`Explore ${comm.name}`}
            className={cn(
              "group relative overflow-hidden inline-flex items-center gap-2 rounded-full",
              "border border-amber-300/40 bg-black/70 backdrop-blur-md",
              "px-3 py-1 sm:py-1.5 text-xs sm:text-[13px] font-bold text-amber-100",
              "shadow-[0_3px_12px_rgba(0,0,0,0.4)] shrink-0 whitespace-nowrap",
              "select-none cursor-pointer transition-all duration-200",
              "hover:border-amber-300/80 hover:bg-black/85 hover:scale-[1.03] active:scale-[0.97]"
            )}
          >
            {/* Cascading Looped Champagne Golden Sleek Sheen */}
            <span
              className="pointer-events-none absolute -inset-y-0 w-3/4 z-0 animate-sleek-shine bg-gradient-to-r from-transparent via-[#FBE3B5]/85 to-transparent skew-x-[-20deg]"
              style={{ animationDelay: `${idx * 0.45}s` }}
              aria-hidden="true"
            />

            {/* Respective Community Icon */}
            <IconComponent
              className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 relative z-10", comm.iconColor)}
              aria-hidden="true"
            />

            {/* Big & Bold Community Name */}
            <span className="relative z-10 tracking-wide leading-none">
              {comm.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
