import Link from "next/link";
import { IconHeart } from '@tabler/icons-react';
import { cn } from "@/lib/cn";

export function Logo({
  href = "/",
  lightOnMobile = false,
  className = "",
  showTagline = true,
  blurredBg = true,
}: {
  href?: string;
  lightOnMobile?: boolean;
  className?: string;
  showTagline?: boolean;
  blurredBg?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group focus-ring inline-flex items-center gap-2.5 transition-all duration-200 active:scale-[0.98]",
        blurredBg && cn(
          "px-3 py-1.5 rounded-2xl backdrop-blur-xl transition-all",
          lightOnMobile
            ? "bg-black/40 border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.3)] lg:bg-white/85 lg:border-white/80 lg:shadow-[0_4px_20px_rgba(92,16,39,0.06)]"
            : "bg-white/85 border border-white/80 shadow-[0_4px_20px_rgba(92,16,39,0.06)]"
        ),
        className
      )}
      aria-label="ShaadiChat home"
    >
      {/* Brand Icon Emblem */}
      <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-gradient-to-br from-[#931B39] via-[#741129] to-[#450716] text-white shadow-[0_4px_14px_rgba(116,17,41,0.28)] border border-[#EAD8C7]/35 ring-1 ring-inset ring-white/25 group-hover:shadow-[0_6px_20px_rgba(116,17,41,0.38)] group-hover:scale-105 transition-all duration-300 overflow-hidden">
        {/* Subtle glass reflection highlight */}
        <span className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

        {/* Central Heart with Champagne Sparkle */}
        <div className="relative">
          <IconHeart className="h-5 w-5 fill-white text-white drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-110" aria-hidden />
          <span
            className="absolute -top-1 -right-1 text-[10px] text-[#F9E2B2] font-black leading-none drop-shadow-[0_0_6px_rgba(249,226,178,0.9)] animate-pulse"
            aria-hidden="true"
          >
            ✦
          </span>
        </div>
      </span>

      {/* Brand Name & Wordmark */}
      <div className="flex flex-col select-none justify-center">
        <div className="flex items-baseline leading-none tracking-tight">
          <span
            className={cn(
              "text-[1.32rem] font-black tracking-[-0.035em] transition-colors",
              lightOnMobile
                ? "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] lg:drop-shadow-none lg:text-[#5C1027]"
                : "text-[#5C1027]"
            )}
          >
            Shaadi
          </span>
          <span
            className={cn(
              "text-[1.32rem] font-extrabold tracking-[-0.025em] transition-colors ml-[1px]",
              lightOnMobile
                ? "text-amber-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)] lg:drop-shadow-none lg:bg-gradient-to-r lg:from-[#C58F5A] lg:via-[#D89B65] lg:to-[#A8723C] lg:bg-clip-text lg:text-transparent"
                : "bg-gradient-to-r from-[#C58F5A] via-[#D89B65] to-[#A8723C] bg-clip-text text-transparent"
            )}
          >
            Chat
          </span>
        </div>

        {showTagline && (
          <span
            className={cn(
              "text-[8.5px] font-bold uppercase tracking-[0.26em] leading-none mt-1 transition-colors",
              lightOnMobile
                ? "text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] lg:drop-shadow-none lg:text-[#A97C52]"
                : "text-[#A97C52]"
            )}
          >
            Matrimony
          </span>
        )}
      </div>
    </Link>
  );
}