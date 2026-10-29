"use client";

import React from "react";
import { IconSparkles } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

export interface CommunityItem {
  id: string;
  name: string;
}

const COMMUNITIES: CommunityItem[] = [
  { id: "Kerala", name: "Kerala Matrimony" },
  { id: "Telugu", name: "Telugu Matrimony" },
  { id: "Bharat", name: "Bharat Matrimony" },
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
    <div className={cn("flex flex-col items-end gap-1 shrink-0", className)}>
      {COMMUNITIES.map((comm, idx) => (
        <button
          key={comm.id}
          type="button"
          onClick={() => handleClick(comm.id)}
          aria-label={`Explore ${comm.name}`}
          className={cn(
            "group relative overflow-hidden inline-flex items-center gap-1.5 rounded-full",
            "border border-amber-300/35 bg-black/60 backdrop-blur-md",
            "px-2.5 py-0.5 text-[10px] font-bold text-amber-200",
            "shadow-[0_2px_8px_rgba(0,0,0,0.35)] shrink-0 whitespace-nowrap",
            "select-none cursor-pointer transition-all duration-200",
            "hover:border-amber-300/70 hover:bg-black/75 hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          {/* Cascading Looped Champagne Golden Sleek Sheen */}
          <span
            className="pointer-events-none absolute -inset-y-0 w-3/4 z-0 animate-sleek-shine bg-gradient-to-r from-transparent via-[#FBE3B5]/85 to-transparent skew-x-[-20deg]"
            style={{ animationDelay: `${idx * 0.45}s` }}
            aria-hidden="true"
          />

          {/* Sparkle Icon */}
          <IconSparkles
            className="h-2.5 w-2.5 text-amber-300 shrink-0 relative z-10 animate-pulse"
            aria-hidden="true"
          />

          {/* Community Name */}
          <span className="relative z-10 tracking-wide leading-none">
            {comm.name}
          </span>
        </button>
      ))}
    </div>
  );
}
