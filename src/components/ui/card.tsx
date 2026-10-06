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
    "bg-[var(--surface)] border border-[var(--border)] shadow-[var(--elevation-card)]",
  interactive:
    "bg-[var(--surface)] border border-[var(--border)] shadow-[var(--elevation-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--elevation-card-hover)] hover:border-[var(--border-strong)] cursor-pointer",
  warm:
    "bg-gradient-to-b from-[var(--surface)] via-white to-[var(--background)] border border-[var(--border)] shadow-[var(--elevation-card)]",
  champagne:
    "bg-gradient-to-b from-[#FFFDFB] to-white border border-[#EAD8C7] shadow-[0_12px_36px_-10px_rgba(216,178,140,0.22)] ring-1 ring-[var(--accent)]/30",
  glass:
    "bg-white/85 backdrop-blur-xl border border-[var(--border)]/80 shadow-[var(--elevation-card)]",
  outline:
    "bg-transparent border border-[var(--border)]"
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