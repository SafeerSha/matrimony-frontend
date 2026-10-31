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

const AVATAR_GRADIENTS = [
  "from-[#5C1027] to-[#80132E] text-white",
  "from-[#80132E] to-[#A81E41] text-white",
  "from-[#4A0E1F] to-[#6B142D] text-white",
  "from-[#68132B] to-[#8E1C3C] text-white",
  "from-[#7B1834] to-[#A32347] text-white",
  "from-[#561226] to-[#781B37] text-white",
  "from-[#8C1D3B] to-[#B5274E] text-white",
];

function getAvatarGradient(name?: string): string {
  if (!name || !name.trim()) return AVATAR_GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

export function Avatar({
  src,
  name,
  size = "md",
  online,
  verified,
  bordered = false,
  className,
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [src]);

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
    : "IC";

  const showFallback = !src || imgError;

  return (
    <div className={cn("relative inline-flex shrink-0 select-none leading-none", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-full font-bold shadow-xs transition-transform duration-200 flex items-center justify-center shrink-0",
          showFallback
            ? cn("bg-gradient-to-br", getAvatarGradient(name))
            : "bg-gradient-to-br from-[var(--primary-light)] to-[#FCEFF2] text-[var(--primary)]",
          currentSize.container,
          bordered && "ring-2 ring-[var(--surface)] ring-offset-2 ring-offset-[var(--border)]"
        )}
      >
        {!showFallback ? (
          <img
            src={src}
            alt={`${name} profile picture`}
            className="h-full w-full object-cover object-center"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <span
            className={cn(
              "flex h-full w-full items-center justify-center text-center tracking-wider font-bold select-none text-white leading-none",
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
