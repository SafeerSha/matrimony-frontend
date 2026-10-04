import React from "react";
import { IconCircleCheck } from '@tabler/icons-react';
import { cn } from "@/lib/cn";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  online?: boolean;
  verified?: boolean;
  bordered?: boolean;
  className?: string;
}

const sizes: Record<AvatarSize, { container: string; text: string; badge: string; dot: string }> = {
  xs: { container: "h-7 w-7", text: "text-[10px]", badge: "h-3 w-3", dot: "h-2 w-2" },
  sm: { container: "h-9 w-9", text: "text-xs", badge: "h-3.5 w-3.5", dot: "h-2.5 w-2.5" },
  md: { container: "h-11 w-11", text: "text-sm", badge: "h-4 w-4", dot: "h-3 w-3" },
  lg: { container: "h-14 w-14", text: "text-base", badge: "h-4.5 w-4.5", dot: "h-3.5 w-3.5" },
  xl: { container: "h-20 w-20", text: "text-xl", badge: "h-5 w-5", dot: "h-4 w-4" },
  "2xl": { container: "h-28 w-28", text: "text-2xl", badge: "h-6 w-6", dot: "h-5 w-5" },
};

export function Avatar({
  src,
  name,
  size = "md",
  online,
  verified,
  bordered = false,
  className,
}: AvatarProps) {
  const currentSize = sizes[size] || sizes.md;
  
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "LC";

  return (
    <div className={cn("relative inline-block shrink-0 select-none", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-full font-bold shadow-xs transition-transform duration-200",
          "bg-gradient-to-br from-[var(--primary-light)] to-[#FCEFF2] text-[var(--primary)]",
          currentSize.container,
          bordered && "ring-2 ring-[var(--surface)] ring-offset-2 ring-offset-[var(--border)]"
        )}
      >
        {src ? (
          <img
            src={src}
            alt={`${name} profile picture`}
            className="h-full w-full object-cover object-center"
            loading="lazy"
          />
        ) : (
          <span
            className={cn(
              "grid h-full w-full place-items-center tracking-wider font-semibold",
              currentSize.text
            )}
          >
            {initials}
          </span>
        )}
      </div>

      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-white ring-1 ring-black/5",
            online ? "bg-emerald-500" : "bg-stone-300",
            currentSize.dot
          )}
          title={online ? "Online now" : "Offline"}
          aria-label={online ? "Online" : "Offline"}
        />
      )}

      {verified && (
        <span
          className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-white text-[var(--accent)] shadow-xs"
          title="Verified Profile"
          aria-label="Verified Profile"
        >
          <IconCircleCheck className={cn("fill-current text-[var(--accent)] stroke-white", currentSize.badge)} />
        </span>
      )}
    </div>
  );
}
