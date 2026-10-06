import type { ReactNode } from "react";
import { IconHeart } from '@tabler/icons-react';
import { cn } from "@/lib/cn";

export interface ConnectionBadgeProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  className?: string;
}

export function ConnectionBadge({
  title = "Meaningful Connections",
  subtitle = "Built on mutual values & trust",
  icon,
  className = "",
}: ConnectionBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-2.5 sm:p-3 shadow-[0_12px_28px_var(--card-shadow)] backdrop-blur-md transition-all hover:shadow-[0_16px_36px_var(--hero-shadow)]",
        className
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)] ring-1 ring-[var(--primary-light)]/50">
        {icon || <IconHeart className="h-5 w-5 fill-current" aria-hidden="true" />}
      </div>
      <div className="min-w-0 pr-1">
        <p className="text-xs sm:text-sm font-semibold tracking-tight text-[var(--foreground)]">{title}</p>
        <p className="text-[11px] text-[var(--muted)] leading-tight">{subtitle}</p>
      </div>
    </div>
  );
}
