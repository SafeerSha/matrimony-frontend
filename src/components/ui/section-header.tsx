import React from "react";
import { cn } from "@/lib/cn";

export interface SectionHeaderProps {
  eyebrow?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  editorial?: boolean;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  editorial = true,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && (
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shrink-0" aria-hidden="true" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)]">
              {eyebrow}
            </p>
          </div>
        )}
        {title && (
          <h2
            className={cn(
              "text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)] leading-[1.2]",
              editorial && "font-editorial-title"
            )}
          >
            {title}
          </h2>
        )}
        {description && (
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)] font-normal">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
