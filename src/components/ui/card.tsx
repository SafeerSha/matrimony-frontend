import React, { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardVariant = "default" | "interactive" | "warm" | "champagne" | "glass" | "outline";
export type CardPadding = "none" | "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

const variants: Record<CardVariant, string> = {
  default:
    "bg-white border border-[#EAD8C7]/90 shadow-[0_1px_3px_rgba(45,15,25,0.04),0_8px_24px_-4px_rgba(122,24,53,0.08),0_18px_36px_-6px_rgba(40,10,20,0.06)]",
  interactive:
    "bg-white border border-[#EAD8C7]/90 shadow-[0_1px_3px_rgba(45,15,25,0.04),0_8px_24px_-4px_rgba(122,24,53,0.08),0_18px_36px_-6px_rgba(40,10,20,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_2px_6px_rgba(45,15,25,0.06),0_16px_36px_-6px_rgba(122,24,53,0.16),0_24px_48px_-10px_rgba(33,27,30,0.10)] hover:border-[#D8B28C] cursor-pointer",
  warm:
    "bg-white border border-[#EAD8C7]/90 shadow-[0_1px_3px_rgba(45,15,25,0.04),0_8px_24px_-4px_rgba(122,24,53,0.08),0_18px_36px_-6px_rgba(40,10,20,0.06)]",
  champagne:
    "bg-white border border-[#D8B28C]/80 shadow-[0_12px_36px_-8px_rgba(216,178,140,0.30)] ring-1 ring-[#D8B28C]/35",
  glass:
    "bg-white/95 backdrop-blur-xl border border-[#EAD8C7]/90 shadow-[0_1px_3px_rgba(45,15,25,0.04),0_8px_24px_-4px_rgba(122,24,53,0.08),0_18px_36px_-6px_rgba(40,10,20,0.06)]",
  outline:
    "bg-white border border-[#EAD8C7] shadow-xs"
};

const paddings: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8"
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant = "default", padding, ...props },
  ref
) {
  // If padding prop is omitted, we do not force a padding class unless specified, 
  // ensuring backwards compatibility with components that define their own p-* classes.
  const paddingClass = padding ? paddings[padding] : "";

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl transition-colors",
        variants[variant],
        paddingClass,
        className
      )}
      {...props}
    />
  );
});