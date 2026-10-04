import type { ReactNode } from "react";
import { IconHeart } from '@tabler/icons-react';
import { cn } from "@/lib/cn";

export interface TrustBadgeProps {
  label?: string;
  icon?: ReactNode;
  className?: string;
}

export function TrustBadge({
  label = "Thoughtfully designed for lifelong partnerships",
  icon = <IconHeart className="h-3.5 w-3.5" aria-hidden="true" />,
  className = "",
}: TrustBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[var(--primary-light)] bg-[var(--surface)]/90 px-3.5 py-1.5 text-xs font-semibold text-[var(--primary)] shadow-sm backdrop-blur-xs transition hover:border-[var(--primary)]/30",
        className
      )}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}
