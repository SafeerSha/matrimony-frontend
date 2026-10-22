"use client";

import React, { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export interface ModernOtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  length?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export function ModernOtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  autoFocus = true,
  disabled = false,
  error = false,
  className,
}: ModernOtpInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-focus on mount if enabled
  useEffect(() => {
    if (autoFocus && !disabled) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, length);
    onChange(rawVal);

    // Subtle mobile haptic feedback
    if (typeof window !== "undefined" && "vibrate" in navigator && rawVal.length > value.length) {
      try {
        navigator.vibrate(12);
      } catch {
        // Safe fallback
      }
    }

    if (rawVal.length === length && onComplete) {
      onComplete(rawVal);
    }
  };

  const digits = value.split("");

  return (
    <div
      onClick={() => {
        if (!disabled) {
          inputRef.current?.focus();
        }
      }}
      className={cn("relative flex items-center justify-center py-2 select-none cursor-pointer group", className)}
    >
      {/* Hidden Master Native Input for zero-lag mobile keyboards, 1-tap SMS autofill, and paste */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={length}
        value={value}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={handleChange}
        className="absolute inset-0 h-full w-full opacity-0 pointer-events-none -z-10"
        aria-label="6-digit verification code"
      />

      {/* 6 Visual Segmented Boxes with 3-3 grouping divider */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {Array.from({ length }).map((_, idx) => {
          const char = digits[idx] || "";
          const isFilled = Boolean(char);
          const isCurrentSlot = isFocused && idx === digits.length && digits.length < length;
          const showMiddleDivider = idx === Math.floor(length / 2);

          return (
            <React.Fragment key={idx}>
              {showMiddleDivider && (
                <div
                  className="mx-1 sm:mx-1.5 flex items-center justify-center text-slate-300 select-none"
                  aria-hidden="true"
                >
                  <span className="h-1 w-3 sm:w-3.5 rounded-full bg-slate-300/80 transition-colors group-hover:bg-slate-400/80" />
                </div>
              )}

              <div
                className={cn(
                  "relative flex h-13 w-10.5 sm:h-14 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl",
                  "text-xl sm:text-2xl font-bold font-mono transition-all duration-200",
                  "border shadow-xs",
                  // Default empty slot
                  !isFilled && !isCurrentSlot && !error &&
                    "border-slate-200/90 bg-slate-50/70 text-slate-400 group-hover:border-slate-300",
                  // Active/Current cursor slot
                  isCurrentSlot && !error &&
                    "border-[#80132E] bg-white ring-4 ring-[#80132E]/10 shadow-sm scale-[1.04]",
                  // Filled slot
                  isFilled && !error &&
                    "border-slate-300/90 bg-white text-slate-900 shadow-xs",
                  // Error state
                  error &&
                    "border-red-400 bg-red-50/50 text-red-600 ring-4 ring-red-500/10",
                  // Disabled state
                  disabled && "opacity-50 cursor-not-allowed bg-slate-100 border-slate-200"
                )}
              >
                {char ? (
                  <span className="animate-in zoom-in-75 duration-150 inline-block">
                    {char}
                  </span>
                ) : isCurrentSlot ? (
                  <span className="h-6 w-0.5 rounded-full bg-[#80132E] animate-pulse" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-300/90" />
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
