"use client";

import React, { useState, useEffect } from "react";
import { IconSparkles } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

export interface CommunityItem {
  id: string;
  name: string;
  shortTag: string;
}

const COMMUNITIES: CommunityItem[] = [
  { id: "Kerala", name: "Kerala Matrimony", shortTag: "Kerala" },
  { id: "Telugu", name: "Telugu Matrimony", shortTag: "Telugu" },
  { id: "Bharat", name: "Bharat Matrimony", shortTag: "Bharat" },
];

export interface HeroCommunityPillProps {
  className?: string;
  onSelectCommunity?: (communityId: string) => void;
}

export function HeroCommunityPill({ className, onSelectCommunity }: HeroCommunityPillProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % COMMUNITIES.length);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const current = COMMUNITIES[currentIndex];

  const handleClick = () => {
    if (onSelectCommunity) {
      onSelectCommunity(current.id);
    } else {
      // Dispatch global event for LookingForModal if available
      window.dispatchEvent(
        new CustomEvent("open-looking-for-community", {
          detail: { community: current.id },
        })
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Current community: ${current.name}. Click to explore.`}
      className={cn(
        "group relative inline-flex items-center gap-1.5 rounded-full",
        "border border-amber-300/40 bg-black/65 backdrop-blur-md",
        "px-2.5 py-1 text-[10px] font-bold text-amber-200",
        "shadow-[0_2px_10px_rgba(0,0,0,0.35)] shrink-0 whitespace-nowrap",
        "overflow-hidden cursor-pointer select-none",
        "transition-all duration-300 hover:border-amber-300/70 hover:bg-black/75 hover:scale-[1.02] active:scale-[0.98]",
        className
      )}
    >
      {/* Ambient subtle golden glow on hover */}
      <span
        className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/0 via-amber-300/10 to-amber-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* Sparkle icon */}
      <IconSparkles className="h-3 w-3 text-amber-300 shrink-0 animate-pulse" aria-hidden="true" />

      {/* Looped Slide-Up Community Name */}
      <div className="relative h-3.5 overflow-hidden flex items-center">
        <span
          key={current.id}
          className="animate-slide-in-fade whitespace-nowrap tracking-wide leading-none"
        >
          {current.name}
        </span>
      </div>
    </button>
  );
}
