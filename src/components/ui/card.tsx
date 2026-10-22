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
    "bg-white border border-[var(--champagne-border)] shadow-[var(--elevation-card)]",
  interactive:
    "bg-white border border-[var(--champagne-border)] shadow-[var(--elevation-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--elevation-card-hover)] hover:border-[var(--accent)] cursor-pointer",
  warm:
    "bg-white border border-[var(--champagne-border)] shadow-[var(--elevation-card)]",
  champagne:
    "bg-white border border-[var(--accent)]/60 shadow-[0_12px_36px_-8px_rgba(201,151,87,0.22)] ring-1 ring-[var(--accent)]/30",
  glass:
    "bg-white/95 backdrop-blur-xl border border-[var(--champagne-border)] shadow-[var(--elevation-card)]",
  outline:
    "bg-white border border-[var(--champagne-border)] shadow-xs"
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