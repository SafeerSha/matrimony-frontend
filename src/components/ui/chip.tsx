"use client";

import React from "react";
import { IconX, IconCheck } from '@tabler/icons-react';
import { cn } from "@/lib/cn";

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  selected?: boolean;
  onRemove?: () => void;
  icon?: React.ReactNode;
  size?: "sm" | "md";
  interactive?: boolean;
  tone?: "primary" | "blush" | "champagne" | "neutral";
}

export function Chip({
  children,
  selected = false,
  onRemove,
  icon,
  size = "md",
  interactive = false,
  tone = "neutral",
  onClick,
  className,
  ...props
}: ChipProps) {
  const isClickable = interactive || Boolean(onClick);

  const tones = {
    neutral: selected
      ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs"
      : "bg-[var(--surface)] text-[var(--muted-strong)] border-[var(--border)] hover:border-[var(--primary)]/40 hover:bg-[var(--surface-muted)]",
    primary: selected
      ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs"
      : "bg-[var(--primary-light)] text-[var(--primary-deep)] border-[var(--primary)]/20 hover:bg-[var(--primary)] hover:text-white",
    blush: selected
      ? "bg-[var(--blush-deep)] text-white border-[var(--blush-deep)]"
      : "bg-[var(--blush-light)] text-[var(--blush-deep)] border-[var(--border)] hover:bg-[var(--blush)] hover:text-white",
    champagne: selected
      ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-xs"
      : "bg-[#FAF3EC] text-[#5C1027] border-[#EAD8C7] hover:bg-[#F5EADE]",
  };

  const sizes = {
    sm: "px-2.5 py-1 text-xs gap-1.5 rounded-lg",
    md: "px-3.5 py-1.5 text-xs sm:text-sm gap-2 rounded-xl",
  };

  return (
    <span
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isClickable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.(e as any);
        }
      }}
      className={cn(
        "inline-flex items-center font-medium border select-none transition-all duration-200",
        sizes[size],
        tones[tone],
        isClickable && "cursor-pointer focus-ring active-press",
        className
      )}
      {...props}
    >
      {selected ? (
        <IconCheck className="h-3.5 w-3.5 shrink-0 stroke-[2.5]" aria-hidden="true" />
      ) : (
        icon && <span className="shrink-0 text-current leading-none">{icon}</span>
      )}

      <span>{children}</span>

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 -mr-1 grid h-4 w-4 place-items-center rounded-full hover:bg-black/10 text-current transition-colors focus-ring"
          aria-label="Remove tag"
        >
          <IconX className="h-3 w-3 stroke-[2.5]" />
        </button>
      )}
    </span>
  );
}
