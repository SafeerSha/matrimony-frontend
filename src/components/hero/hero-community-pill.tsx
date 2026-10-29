"use client";

import React from "react";
import { IconSparkles } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

export interface HeroCommunityPillProps {
  className?: string;
  onSelectCommunity?: (communityId: string) => void;
}

export function HeroCommunityPill({ className, onSelectCommunity }: HeroCommunityPillProps) {
  const handleClick = (communityId?: string) => {
    if (onSelectCommunity && communityId) {
      onSelectCommunity(communityId);
    } else {
      window.dispatchEvent(
        new CustomEvent("open-looking-for-community", {
          detail: { community: communityId || "Kerala" },
        })
      );
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => handleClick()}
      aria-label="Kerala, Telugu, and Bharat Matrimony. Click to register."
      className={cn(
        "group relative overflow-hidden inline-flex items-center gap-1.5 rounded-full",
        "border border-amber-300/40 bg-black/65 backdrop-blur-md",
        "px-2.5 py-1 text-[9.5px] sm:text-[10px] font-bold text-amber-200",
        "shadow-[0_2px_10px_rgba(0,0,0,0.35)] shrink-0 whitespace-nowrap",
        "select-none cursor-pointer transition-all duration-300",
        "hover:border-amber-300/70 hover:bg-black/75 hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
    >
      {/* Looped Champagne Golden Sleek Light Sheen Animation */}
      <span
        className="pointer-events-none absolute -inset-y-0 w-3/4 z-0 animate-sleek-shine bg-gradient-to-r from-transparent via-[#FBE3B5]/85 to-transparent skew-x-[-20deg]"
        aria-hidden="true"
      />

      {/* Sparkle Icon */}
      <IconSparkles className="h-2.5 w-2.5 text-amber-300 shrink-0 relative z-10 animate-pulse" aria-hidden="true" />

      {/* Communities list with gold diamond bullets */}
      <div className="relative z-10 flex items-center gap-1.5 leading-none tracking-wide">
        <span
          className="hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleClick("Kerala");
          }}
        >
          Kerala
        </span>
        <span className="text-amber-300/50 text-[7px] select-none">•</span>
        <span
          className="hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleClick("Telugu");
          }}
        >
          Telugu
        </span>
        <span className="text-amber-300/50 text-[7px] select-none">•</span>
        <span
          className="hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleClick("Bharat");
          }}
        >
          Bharat
        </span>
      </div>
    </div>
  );
}
