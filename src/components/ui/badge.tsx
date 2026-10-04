import React from "react";
import { cn } from "@/lib/cn";

export type BadgeTone =
  | "primary"
  | "burgundy"
  | "blush"
  | "champagne"
  | "accent"
  | "success"
  | "neutral"
  | "default"
  | "danger"
  | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  tone?: BadgeTone;
  size?: "sm" | "md";
  dot?: boolean;
  dotColor?: string;
  icon?: React.ReactNode;
}

export function Badge({
  children,
  tone = "neutral",
  size = "md",
  dot = false,
  dotColor,
  icon,
  className,
  ...props
}: BadgeProps) {
  const tones: Record<BadgeTone, string> = {
    primary:
      "bg-[var(--primary)] text-white font-semibold shadow-xs border border-transparent",
    burgundy:
      "bg-[var(--primary-light)] text-[var(--primary-deep)] border border-[var(--border)] font-semibold",
    blush:
      "bg-[var(--blush-light)] text-[var(--blush-deep)] border border-[var(--border)] font-semibold",
    champagne:
      "bg-[var(--champagne-light)] text-[var(--accent-foreground)] border border-[var(--champagne-border)] font-semibold",
    accent:
      "bg-[var(--champagne-light)] text-[var(--accent-foreground)] border border-[var(--champagne-border)] font-semibold",
    success:
      "bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-semibold",
    danger:
      "bg-rose-50 text-[var(--danger)] border border-rose-200 font-semibold",
    neutral:
      "bg-[var(--surface-muted)] text-[var(--muted-strong)] border border-[var(--border)] font-medium",
    default:
      "bg-[var(--surface-muted)] text-[var(--muted-strong)] border border-[var(--border)] font-medium",
    outline:
      "bg-transparent text-[var(--muted-strong)] border border-[var(--border)] font-medium"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] leading-tight gap-1",
    md: "px-2.5 py-0.5 text-xs tracking-tight gap-1.5"
  };

  const defaultDotColors: Record<BadgeTone, string> = {
    primary: "bg-white",
    burgundy: "bg-[var(--primary)]",
    blush: "bg-[var(--blush)]",
    champagne: "bg-[var(--accent)]",
    accent: "bg-[var(--accent)]",
    success: "bg-emerald-500",
    danger: "bg-[var(--danger)]",
    neutral: "bg-[var(--muted)]",
    default: "bg-[var(--muted)]",
    outline: "bg-[var(--muted)]"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium shadow-[0_1px_2px_rgba(0,0,0,0.02)] select-none",
        tones[tone] || tones.neutral,
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            dotColor || defaultDotColors[tone] || "bg-current"
          )}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0 leading-none">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
