import type { SVGProps } from "react";
import { cn } from "@/lib/cn";

export interface BotanicalLeafProps extends SVGProps<SVGSVGElement> {
  size?: number;
  tone?: "primary" | "deep" | "sage" | "soft";
  depth?: "foreground" | "middle" | "background";
  angle?: number;
  className?: string;
}

export function BotanicalLeaf({
  size = 28,
  tone = "primary",
  depth = "middle",
  angle = 0,
  className = "",
  style,
  ...props
}: BotanicalLeafProps) {
  // Theme-aware color fills using centralized CSS variables
  const toneFills = {
    primary: "var(--botanical-primary)",
    deep: "var(--botanical-deep)",
    sage: "var(--botanical-sage)",
    soft: "var(--botanical-soft)",
  };

  const depthStyles = {
    foreground: "opacity-45 filter blur-[1px]",
    middle: "opacity-75 filter-none",
    background: "opacity-35 filter blur-[2px]",
  };

  const transformStyle = angle ? `rotate(${angle}deg)` : undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("pointer-events-none shrink-0 transition-opacity", depthStyles[depth], className)}
      style={{
        transform: transformStyle,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id={`leaf-grad-${tone}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={toneFills[tone]} stopOpacity="0.85" />
          <stop offset="100%" stopColor={toneFills.deep} stopOpacity="0.65" />
        </linearGradient>
      </defs>
      {/* Organic curved leaf blade */}
      <path
        d="M20 2 C28 9, 36 21, 20 38 C4 21, 12 9, 20 2 Z"
        fill={`url(#leaf-grad-${tone})`}
      />
      {/* Subtle leaf central vein midrib */}
      <path
        d="M20 5 Q20.5 20 20 35"
        stroke="var(--primary-light)"
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
