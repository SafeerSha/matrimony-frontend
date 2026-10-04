"use client";

import React, { forwardRef, useState } from "react";
import { IconSearch, IconX, IconChevronDown, IconEye, IconEyeOff } from '@tabler/icons-react';
import { cn } from "@/lib/cn";

// 1. Text Input
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    isPassword = false,
    type = "text",
    id,
    disabled,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-[var(--muted-strong)] tracking-normal"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3.5 flex items-center text-[var(--muted)]">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          disabled={disabled}
          className={cn(
            "h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--foreground)] outline-none transition-all duration-200",
            "placeholder:text-[var(--subtle-foreground)]",
            "focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10",
            leftIcon ? "pl-10" : "px-4",
            isPassword || rightIcon ? "pr-11" : "pr-4",
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10",
            disabled && "cursor-not-allowed opacity-60 bg-[var(--surface-muted)]",
            className
          )}
          {...props}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3 grid h-8 w-8 place-items-center rounded-lg text-[var(--muted)] hover:text-[var(--foreground)] transition-colors focus-ring"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
          </button>
        ) : (
          rightIcon && (
            <div className="absolute right-3.5 flex items-center text-[var(--muted)]">
              {rightIcon}
            </div>
          )
        )}
      </div>

      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
});

// 2. Search Input for Profiles / Matches
export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  { className, value, onClear, onChange, placeholder = "Search by ID, name, location or profession...", ...props },
  ref
) {
  const hasValue = Boolean(value);

  return (
    <div className="relative w-full">
      <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          "h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] pl-10 pr-10 text-sm text-[var(--foreground)] outline-none transition-all duration-200",
          "placeholder:text-[var(--subtle-foreground)]",
          "focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 focus:bg-white",
          className
        )}
        {...props}
      />
      {hasValue && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-colors"
          aria-label="Clear search"
        >
          <IconX className="h-3 w-3" />
        </button>
      )}
    </div>
  );
});

// 3. Styled Select
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, label, error, children, id, ...props },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "h-12 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 pr-10 text-sm font-medium text-[var(--foreground)] outline-none transition-all duration-200",
            "focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10",
            error && "border-rose-400 focus:border-rose-500",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <IconChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" />
      </div>
      {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
});

// 4. Styled Textarea
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, label, error, hint, id, rows = 4, ...props },
  ref
) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)]"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          "w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm leading-relaxed text-[var(--foreground)] outline-none transition-all duration-200 resize-none",
          "placeholder:text-[var(--subtle-foreground)]",
          "focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10",
          error && "border-rose-400 focus:border-rose-500",
          className
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-rose-600 font-medium">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
});

// 5. Modern Toggle Switch
export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className,
}: ToggleProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {(label || description) && (
        <div className="flex-1">
          {label && <p className="text-sm font-semibold text-[var(--foreground)]">{label}</p>}
          {description && <p className="mt-0.5 text-xs text-[var(--muted)] leading-normal">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "focus-ring relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
          checked ? "bg-[var(--primary)]" : "bg-stone-300",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
