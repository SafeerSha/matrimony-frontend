import React from "react";
import { cn } from "@/lib/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-stone-200/70",
        shimmer && "animate-shimmer",
        className
      )}
      {...props}
    />
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--elevation-card)]">
      {/* Photo area */}
      <Skeleton className="h-64 w-full rounded-none" />
      {/* Details */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-10 flex-1 rounded-xl" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-xs">
      <Skeleton className="h-12 w-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-9 w-24 rounded-xl shrink-0" />
    </div>
  );
}

export function SwipeCardSkeleton() {
  return (
    <div className="relative h-full min-h-[350px] w-full max-w-2xl mx-auto rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-[var(--champagne-border)] bg-white shadow-[var(--elevation-floating)]">
      <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
      <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-5 md:p-8 flex flex-col gap-2.5 sm:gap-4 z-10">
        <Skeleton className="h-8 sm:h-10 w-2/3 rounded-xl bg-white/80" />
        <Skeleton className="h-4 sm:h-5 w-1/2 rounded-xl bg-white/60" />
        <div className="flex items-center justify-between gap-2 sm:gap-4 pt-2 sm:pt-4">
          <Skeleton className="h-11 w-11 sm:h-14 sm:w-14 rounded-full bg-white/80 shrink-0" />
          <div className="flex gap-2 sm:gap-4 flex-1 justify-center">
            <Skeleton className="h-10 sm:h-11 flex-1 rounded-full bg-white/60" />
            <Skeleton className="h-10 sm:h-11 flex-1 rounded-full bg-white/60" />
          </div>
          <Skeleton className="h-11 w-11 sm:h-14 sm:w-14 rounded-full bg-white/80 shrink-0" />
        </div>
      </div>
    </div>
  );
}
