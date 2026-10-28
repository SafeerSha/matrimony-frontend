"use client";

import React, { forwardRef, type ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { IconLoader2 } from '@tabler/icons-react';
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "blush"
  | "champagne"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  href?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-b from-[#941A35] via-[var(--primary)] to-[var(--primary-deep)] text-white border-t border-white/25 border-x border-[var(--primary)] border-b-2 border-b-[#4A0818] shadow-[0_6px_16px_-2px_rgba(0,0,0,0.5),0_2px_4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2),inset_0_-2px_3px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_24px_-2px_rgba(0,0,0,0.6),0_3px_6px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 active:translate-y-[1.5px] active:shadow-[0_2px_5px_rgba(0,0,0,0.4)] transition-all duration-150 font-bold",
  secondary:
    "bg-gradient-to-b from-white via-slate-50 to-slate-100/90 text-[var(--foreground)] border border-slate-200 border-b-2 border-b-slate-300 shadow-[0_3px_0_0_#CBD5E1,0_3px_8px_rgba(148,163,184,0.3)] hover:shadow-[0_4px_0_0_#CBD5E1,0_5px_12px_rgba(148,163,184,0.35)] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-[0_1px_0_0_#CBD5E1] transition-all duration-150 font-bold",
  blush:
    "bg-gradient-to-b from-[#FDF2F4] via-[#FCE7EB] to-[#F8D4DC] text-[var(--blush-deep)] border border-[#F7C6CE] border-b-2 border-b-[#EAAFB9] shadow-[0_3px_0_0_#EAAFB9,0_3px_8px_rgba(234,175,185,0.3)] hover:shadow-[0_4px_0_0_#EAAFB9,0_5px_12px_rgba(234,175,185,0.35)] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-[0_1px_0_0_#EAAFB9] transition-all duration-150 font-bold",
  champagne:
    "bg-gradient-to-b from-[#F7E7CE] via-[#EED7B5] to-[#E3C397] text-[#4A2600] border border-[#D8B28C] border-b-2 border-b-[#B88E5E] shadow-[0_3px_0_0_#B88E5E,0_3px_8px_rgba(184,142,94,0.3)] hover:shadow-[0_4px_0_0_#B88E5E,0_5px_12px_rgba(184,142,94,0.35)] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-[0_1px_0_0_#B88E5E] transition-all duration-150 font-bold",
  outline:
    "bg-transparent text-[var(--foreground)] border-2 border-[var(--border)] hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] active:translate-y-[1px] transition-all duration-150 font-bold",
  ghost:
    "bg-transparent text-[var(--muted-strong)] hover:bg-[var(--primary-lighter)] hover:text-[var(--primary)] active:translate-y-[1px] transition-all duration-150 font-bold",
  danger:
    "bg-gradient-to-b from-rose-500 via-rose-600 to-rose-700 text-white border border-rose-600 border-b-2 border-b-rose-800 shadow-[0_3px_0_0_#9F1239,0_3px_8px_rgba(159,18,57,0.3)] hover:shadow-[0_4px_0_0_#9F1239,0_5px_12px_rgba(159,18,57,0.35)] hover:-translate-y-0.5 active:translate-y-[2px] active:shadow-[0_1px_0_0_#9F1239] transition-all duration-150 font-bold"
};

const sizes: Record<ButtonSize, string> = {
  xs: "min-h-8 px-2.5 py-1 text-xs font-medium rounded-lg gap-1.5",
  sm: "min-h-9 px-3.5 py-1.5 text-xs font-semibold rounded-xl gap-2",
  md: "min-h-11 px-5 py-2.5 text-sm font-semibold rounded-xl gap-2",
  lg: "min-h-12 px-7 py-3 text-base font-semibold rounded-2xl gap-2.5",
  "icon-sm": "h-8 w-8 p-0 rounded-lg shrink-0",
  icon: "h-10 w-10 p-0 rounded-xl shrink-0",
  "icon-lg": "h-12 w-12 p-0 rounded-2xl shrink-0"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    href,
    leftIcon,
    rightIcon,
    children,
    ...props
  },
  ref
) {
  const hasCustomRounding = className ? /\brounded-(?:none|sm|md|lg|xl|2xl|3xl|full)\b/.test(className) : false;
  const hasCustomDimensions = className ? /\b[hw]-/.test(className) : false;
  const rawSizeClass = sizes[size] || sizes.md;
  let sizeClass = rawSizeClass;
  if (hasCustomRounding) {
    sizeClass = sizeClass.replace(/\brounded-(?:sm|md|lg|xl|2xl|3xl|full)\b/g, "").trim();
  }
  if (hasCustomDimensions) {
    sizeClass = sizeClass.replace(/\b[hw]-\d+\b/g, "").replace(/\bmin-h-\d+\b/g, "").trim();
  }
  const variantClass = variants[variant] || variants.primary;

  const baseClasses = cn(
    "focus-ring inline-flex items-center justify-center font-medium transition-all duration-200 select-none active-press",
    "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
    variantClass,
    sizeClass,
    className
  );

  const content = (
    <>
      {loading ? (
        <IconLoader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0 leading-none">{leftIcon}</span>
      )}
      {children && (
        <span className="inline-flex items-center gap-1.5 leading-none whitespace-nowrap has-[.md\:hidden]:contents has-[.sm\:hidden]:contents">
          {children}
        </span>
      )}
      {!loading && rightIcon && <span className="shrink-0 leading-none">{rightIcon}</span>}
    </>
  );

  if (href && !disabled && !loading) {
    return (
      <Link href={href} className={baseClasses} {...(props as any)}>
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      className={baseClasses}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
});