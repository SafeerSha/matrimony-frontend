import type { ComponentType } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export interface TrustFeatureProps {
  label: string;
  description?: string;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  className?: string;
}

export function TrustFeature({
  label,
  description,
  icon: Icon = Check,
  className = "",
}: TrustFeatureProps) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-sm text-[var(--muted-strong)]", className)}>
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)]"
        aria-hidden="true"
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <span className="font-medium text-[var(--foreground)]">{label}</span>
      {description && <span className="text-xs text-[var(--muted)]">({description})</span>}
    </div>
  );
}
