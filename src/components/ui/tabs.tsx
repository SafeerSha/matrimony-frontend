"use client";

import React from "react";
import { cn } from "@/lib/cn";

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  variant?: "pill" | "underline" | "bubble";
  size?: "sm" | "md";
  className?: string;
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  variant = "pill",
  size = "md",
  className,
}: TabsProps<T>) {
  if (variant === "underline") {
    return (
      <div className={cn("border-b border-[var(--border)] overflow-x-auto scrollbar-none", className)}>
        <nav className="flex gap-6 -mb-px" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange(tab.id)}
                className={cn(
                  "focus-ring inline-flex items-center gap-2 py-3.5 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors duration-200 select-none",
                  isActive
                    ? "border-[var(--primary)] text-[var(--primary-deep)]"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:border-stone-300"
                )}
              >
                {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-bold",
                      isActive
                        ? "bg-[var(--primary-light)] text-[var(--primary)]"
                        : "bg-[var(--surface-muted)] text-[var(--muted)]"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  // Segmented Pill tabs (default, Arike / modern matchmaking style)
  return (
    <div
      className={cn(
        "inline-flex gap-1.5 overflow-x-auto rounded-2xl bg-[var(--surface-muted)] p-1.5 scrollbar-none max-w-full border border-[var(--border)]/60 shadow-xs",
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "focus-ring relative inline-flex items-center gap-2 rounded-xl font-semibold capitalize whitespace-nowrap transition-all duration-200 select-none active-press",
              size === "sm" ? "px-3.5 py-1.5 text-xs" : "px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm",
              isActive
                ? "bg-[var(--surface)] text-[var(--foreground)] shadow-xs border border-[var(--border)]/70 font-bold"
                : "text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:bg-white/40"
            )}
          >
            {tab.icon && <span className="shrink-0 leading-none">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none transition-colors",
                  isActive
                    ? "bg-[var(--primary)] text-white"
                    : "bg-black/5 text-[var(--muted-strong)]"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
