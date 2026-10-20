import React from "react";
import { IconHeart } from '@tabler/icons-react';
import { Button } from "./button";
import { cn } from "@/lib/cn";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  secondaryActionHref?: string;
  tip?: string;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionHref,
  secondaryActionText,
  onSecondaryAction,
  secondaryActionHref,
  tip,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl bg-white border border-[#EAD8C7]/90 p-8 sm:p-14 text-center shadow-[0_1px_3px_rgba(45,15,25,0.04),0_8px_24px_-4px_rgba(122,24,53,0.08),0_20px_40px_-8px_rgba(40,10,20,0.06)] transition-all duration-300",
        className
      )}
    >
      <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-lighter)] text-[var(--primary)] shadow-[0_4px_20px_var(--primary-glow)]">
        {icon || <IconHeart className="h-8 w-8 stroke-[1.8]" />}
      </div>

      <h3 className="font-editorial-title text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
        {title}
      </h3>

      <p className="mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-[var(--muted)]">
        {description}
      </p>

      {(actionText || secondaryActionText) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionText && (
            <Button
              href={actionHref}
              onClick={onAction}
              variant="primary"
              size="md"
              className="font-bold"
            >
              {actionText}
            </Button>
          )}

          {secondaryActionText && (
            <Button
              href={secondaryActionHref}
              onClick={onSecondaryAction}
              variant="secondary"
              size="md"
            >
              {secondaryActionText}
            </Button>
          )}
        </div>
      )}

      {tip && (
        <div className="mt-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] px-4 py-2.5 text-xs text-[var(--muted-strong)] max-w-sm flex items-center gap-2 shadow-xs">
          <span className="font-bold text-[var(--primary)]">Tip:</span>
          <span>{tip}</span>
        </div>
      )}
    </div>
  );
}
