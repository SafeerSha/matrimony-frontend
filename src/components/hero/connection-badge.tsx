import type { ReactNode } from "react";
import { IconHeart } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

export interface ConnectionBadgeProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  iconBoxClassName?: string;
  activeCategoryIndex?: number;
  totalCategories?: number;
  onSelectCategory?: (index: number) => void;
  onClick?: () => void;
  className?: string;
}

export function ConnectionBadge({
  title = "Meaningful Connections",
  subtitle = "Built on mutual values & trust",
  icon,
  iconBoxClassName = "",
  activeCategoryIndex,
  totalCategories,
  onSelectCategory,
  onClick,
  className = "",
}: ConnectionBadgeProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-2.5 sm:p-3 shadow-[0_14px_32px_var(--card-shadow)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_18px_40px_var(--hero-shadow)] select-none",
        onClick && "cursor-pointer group hover:scale-[1.015] hover:border-[var(--primary)]/35",
        className
      )}
    >
      <div
        key={`icon-${title}`}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-all duration-300 animate-badge-fade",
          iconBoxClassName || "bg-[var(--primary-light)] text-[var(--primary)] ring-[var(--primary-light)]/50"
        )}
      >
        {icon || <IconHeart className="h-5 w-5 fill-current" aria-hidden="true" />}
      </div>

      <div key={`text-${title}`} className="min-w-0 pr-1 animate-badge-fade">
        <p className="text-xs sm:text-sm font-bold tracking-tight text-[var(--foreground)]">
          {title}
        </p>
        <p className="text-[11px] text-[var(--muted)] leading-tight mt-0.5">
          {subtitle}
        </p>
      </div>

      {typeof totalCategories === "number" && totalCategories > 1 && (
        <div
          className="flex items-center gap-1.5 pl-2.5 ml-0.5 border-l border-[var(--border)]"
          aria-label="Category slides"
        >
          {Array.from({ length: totalCategories }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectCategory?.(idx);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                idx === activeCategoryIndex
                  ? "w-4 bg-[var(--primary)] shadow-[0_0_6px_var(--primary-shadow)]"
                  : "w-1.5 bg-neutral-300 hover:bg-neutral-400"
              )}
              aria-label={`Switch to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

