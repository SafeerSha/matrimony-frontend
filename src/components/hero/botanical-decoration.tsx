import { BotanicalBranch, type BotanicalBranchProps } from "./botanical-branch";
import { cn } from "@/lib/cn";

export interface BotanicalDecorationProps {
  position: "top-left" | "top-right" | "bottom-left" | "left-middle" | "bottom-center";
  variant?: BotanicalBranchProps["variant"];
  depth?: "foreground" | "middle" | "background";
  animation?: "sway-1" | "sway-2" | "sway-3" | "none";
  className?: string;
}

export function BotanicalDecoration({
  position,
  variant,
  depth = "middle",
  animation = "none",
  className = "",
}: BotanicalDecorationProps) {
  // Default variant based on position
  const resolvedVariant =
    variant ||
    (position === "top-left"
      ? "curved-left"
      : position === "top-right"
      ? "curved-right"
      : position === "bottom-left"
      ? "upward-left"
      : position === "left-middle"
      ? "spray-small"
      : "foreground-cluster");

  // Positioning classes (always pointer-events-none and absolute)
  const positionClasses = {
    "top-left": "-top-12 -left-10 sm:-top-16 sm:-left-12 lg:-top-20 lg:-left-14 w-52 sm:w-64 lg:w-80 xl:w-92",
    "top-right": "-top-6 -right-6 sm:-top-8 sm:-right-8 lg:-top-10 lg:-right-10 w-56 sm:w-72 lg:w-92 xl:w-[26rem]",
    "bottom-left": "bottom-0 -left-4 sm:bottom-4 sm:-left-6 lg:bottom-6 lg:-left-8 w-40 sm:w-52 lg:w-64",
    "left-middle": "top-[54%] -left-3 sm:-left-4 -translate-y-1/2 w-28 sm:w-36 lg:w-44",
    "bottom-center": "bottom-2 right-4 sm:bottom-4 sm:right-12 lg:right-24 w-40 sm:w-52 lg:w-64",
  };

  const animationClasses = {
    "sway-1": "animate-botanical-sway-1",
    "sway-2": "animate-botanical-sway-2",
    "sway-3": "animate-botanical-sway-3",
    none: "",
  };

  return (
    <div
      className={cn(
        "pointer-events-none absolute select-none z-[1]",
        positionClasses[position],
        animationClasses[animation],
        className
      )}
      aria-hidden="true"
    >
      <BotanicalBranch variant={resolvedVariant} depth={depth} className="w-full h-auto" />
    </div>
  );
}
