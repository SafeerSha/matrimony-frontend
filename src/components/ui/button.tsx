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
    "bg-gradient-to-r from-[#9E1D3B] via-[var(--primary)] to-[var(--primary-deep)] text-white hover:from-[#AD2344] hover:to-[var(--primary)] shadow-[0_4px_16px_var(--primary-shadow)] hover:shadow-[0_6px_22px_var(--primary-shadow-strong)] border border-white/20 active:scale-[0.985] transition-all duration-150 font-bold",
  secondary:
    "bg-white text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-muted)] hover:border-[var(--border-strong)] shadow-sm active:scale-[0.985] transition-all duration-150 font-bold",
  blush:
    "bg-gradient-to-r from-[#FDF2F4] to-[#FCE7EB] text-[var(--blush-deep)] border border-[#F7C6CE] hover:bg-[var(--blush)] hover:text-white shadow-xs active:scale-[0.985] transition-all duration-150 font-bold",
  champagne:
    "bg-gradient-to-r from-[#F7E7CE] via-[#EED7B5] to-[#E3C397] text-[#4A2600] border border-[#D8B28C] hover:from-[#FBEADA] hover:to-[#EAD0A9] shadow-xs active:scale-[0.985] transition-all duration-150 font-bold",
  outline:
    "bg-transparent text-[var(--foreground)] border border-[var(--border-strong)] hover:bg-[var(--surface-muted)] active:scale-[0.985] transition-all duration-150 font-bold",
  ghost:
    "bg-transparent text-[var(--muted-strong)] hover:bg-[var(--primary-lighter)] hover:text-[var(--primary)] active:scale-[0.985] transition-all duration-150 font-bold",
  danger:
    "bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700 text-white hover:from-rose-600 hover:to-rose-800 shadow-[0_4px_14px_rgba(225,29,72,0.3)] border border-rose-600/30 active:scale-[0.985] transition-all duration-150 font-bold"
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