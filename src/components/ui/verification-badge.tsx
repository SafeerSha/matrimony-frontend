import React from "react";
import { IconCircleCheck, IconShieldCheck, IconUsers } from '@tabler/icons-react';
import { cn } from "@/lib/cn";

export type VerificationType = "id" | "photo" | "community" | "general";

export interface VerificationBadgeProps {
  type?: VerificationType;
  label?: string;
  showIconOnly?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function VerificationBadge({
  type = "general",
  label,
  showIconOnly = false,
  size = "md",
  className,
}: VerificationBadgeProps) {
  const configs: Record<VerificationType, { defaultLabel: string; icon: React.ReactNode; tone: string }> = {
    general: {
      defaultLabel: "Verified Profile",
      icon: <IconCircleCheck className="h-3.5 w-3.5 fill-[var(--accent)] text-white stroke-[2.5]" aria-hidden="true" />,
      tone: "bg-[var(--champagne-light)] text-[var(--primary-deep)] border border-[var(--champagne-border)] font-bold shadow-2xs",
    },
    id: {
      defaultLabel: "ID Verified",
      icon: <IconShieldCheck className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />,
      tone: "bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold shadow-2xs",
    },
    photo: {
      defaultLabel: "Photo Verified",
      icon: <IconCircleCheck className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden="true" />,
      tone: "bg-[var(--primary-light)] text-[var(--primary-deep)] border border-[var(--primary)]/20 font-bold shadow-2xs",
    },
    community: {
      defaultLabel: "Curated Match",
      icon: <IconUsers className="h-3 w-3 text-[#B87A28]" aria-hidden="true" />,
      tone: "bg-[var(--champagne-light)] text-[#8F591E] border border-[var(--champagne-border)] font-bold shadow-2xs",
    },
  };

  const config = configs[type] || configs.general;
  const displayLabel = label || config.defaultLabel;

  if (showIconOnly) {
    return (
      <span
        title={displayLabel}
        className={cn(
          "inline-flex items-center justify-center rounded-full p-0.5 shadow-xs",
          className
        )}
      >
        {config.icon}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold select-none shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
        config.tone,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      {config.icon}
      <span>{displayLabel}</span>
    </span>
  );
}
