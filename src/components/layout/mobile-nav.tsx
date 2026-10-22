"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  IconHome,
  IconSearch,
  IconHeart,
  IconUsers,
  IconStar,
  IconMessageCircle,
  IconBell,
  IconUser,
  IconAdjustments,
  IconSettings,
  IconLayoutGrid,
  IconX,
  IconLogout,
  IconCrown,
} from '@tabler/icons-react';
import { cn } from "@/lib/cn";
import { authService } from "@/services";
import { toast } from "@/lib/toast";

export interface MobileNavProps {
  unreadMessagesCount?: number;
  unreadNotificationsCount?: number;
  className?: string;
}

export function MobileNav({
  unreadMessagesCount = 0,
  unreadNotificationsCount = 0,
  className
}: MobileNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get("tab") : null;
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    }
    if (isMoreMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMoreMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMoreMenuOpen(false);
  }, [pathname, currentTab]);

  const handleSignOut = async () => {
    setIsMoreMenuOpen(false);
    toast.info("Signing Out", "You have been signed out. Redirecting to home...");
    try {
      await authService.logout();
    } catch {
      // Continue optimistic redirection
    }
    setTimeout(() => {
      window.location.href = "/";
    }, 600);
  };

  const dockItems = [
    {
      label: "Home",
      href: "/app",
      icon: IconHome,
      isActive: pathname === "/app",
    },
    {
      label: "Discover",
      href: "/app/discover",
      icon: IconSearch,
      isActive: pathname.startsWith("/app/discover"),
    },
    {
      label: "Interests",
      href: "/app/interests",
      icon: IconHeart,
      isActive: pathname === "/app/interests" && (!currentTab || currentTab === "pending" || currentTab === "received"),
    },
    {
      label: "Matches",
      href: "/app/matches",
      icon: IconUsers,
      isActive: pathname.startsWith("/app/matches"),
    },
    {
      label: "Favorites",
      href: "/app/favorites",
      icon: IconStar,
      isActive: pathname.startsWith("/app/favorites"),
    }
  ];

  const moreItems = [
    {
      label: "Messages",
      href: "/app/messages",
      icon: IconMessageCircle,
      badge: unreadMessagesCount,
      isActive: pathname.startsWith("/app/messages"),
    },
    {
      label: "Notifications",
      href: "/app/notifications",
      icon: IconBell,
      badge: unreadNotificationsCount,
      isActive: pathname.startsWith("/app/notifications"),
    },
    {
      label: "Profile",
      href: "/app/profile",
      icon: IconUser,
      isActive: pathname.startsWith("/app/profile"),
    },
    {
      label: "Preferences",
      href: "/app/preferences",
      icon: IconAdjustments,
      isActive: pathname.startsWith("/app/preferences"),
    },
    {
      label: "Subscription",
      href: "/app/subscription",
      icon: IconCrown,
      isActive: pathname.startsWith("/app/subscription"),
    },
    {
      label: "Settings",
      href: "/app/settings",
      icon: IconSettings,
      isActive: pathname.startsWith("/app/settings"),
    },
  ];

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 md:hidden flex flex-col items-center pointer-events-none",
        className
      )}
      aria-label="Mobile navigation"
    >
      <div
        className={cn(
          "relative flex flex-col items-end pointer-events-auto w-full max-w-[420px] px-4 pb-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
        )}
        ref={popupRef}
      >

        {/* POPUP MENU */}
        <div
          className={cn(
            "absolute bottom-full mb-3 right-0 w-60 rounded-2xl border border-[var(--border)]/80 bg-white/95 backdrop-blur-2xl shadow-[0_16px_40px_rgba(20,10,15,0.18)] p-2 transition-all duration-200 origin-bottom-right z-50",
            isMoreMenuOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-3 pointer-events-none"
          )}
        >
          <div className="flex flex-col gap-1">
            {moreItems.map(({ label, href, icon: Icon, badge, isActive }) => (
              <Link
                key={label}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm",
                  isActive
                    ? "bg-[var(--primary)] text-white font-semibold shadow-xs"
                    : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-5 w-5", isActive ? "stroke-[2.5] text-white" : "stroke-2 text-[var(--muted-strong)]")} />
                  {badge !== undefined && badge > 0 && (
                    <span className={cn(
                      "absolute -top-1 -right-1 grid h-4 min-w-[16px] place-items-center rounded-full text-[9px] font-bold ring-2",
                      isActive
                        ? "bg-white text-[var(--primary)] ring-[var(--primary)]"
                        : "bg-[var(--primary)] text-white ring-white"
                    )}>
                      {badge > 9 ? "9+" : badge}
                    </span>
                  )}
                </div>
                <span className="flex-1 font-medium">{label}</span>
              </Link>
            ))}

            {/* Divider & Log Out */}
            <div className="border-t border-[var(--border)]/80 pt-1 mt-1">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium text-rose-600 hover:bg-rose-50 active:bg-rose-100"
              >
                <div className="relative">
                  <IconLogout className="h-5 w-5 stroke-2 text-rose-600" />
                </div>
                <span className="flex-1 font-medium text-left">Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* DOCK */}
        <nav
          className={cn(
            "flex w-full items-center justify-between rounded-[2rem] border border-[var(--champagne-border)]/80 bg-white/90 backdrop-blur-2xl shadow-[0_12px_36px_rgba(26,12,18,0.12)] px-3 py-2"
          )}
        >
          {dockItems.map(({ label, href, icon: Icon, isActive }) => (
            <Link
              key={label}
              href={href}
              aria-label={label}
              className={cn(
                "focus-ring group relative flex items-center justify-center rounded-2xl w-[44px] h-[44px] transition-all duration-200 select-none active-press shrink-0",
                isActive
                  ? "bg-gradient-to-br from-[var(--primary)] to-[var(--primary-deep)] text-white shadow-[0_4px_14px_rgba(128,24,53,0.35)] font-semibold"
                  : "text-[var(--muted-strong)] hover:bg-black/5 hover:text-[var(--foreground)] border border-transparent"
              )}
            >
              <div className="relative grid place-items-center">
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive ? "stroke-[2.5] text-white" : "stroke-2 group-hover:-translate-y-0.5"
                  )}
                  aria-hidden="true"
                />
              </div>
            </Link>
          ))}

          {/* MORE / APPS MENU BUTTON */}
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={cn(
              "focus-ring group relative flex items-center justify-center rounded-2xl w-[44px] h-[44px] transition-all duration-200 select-none active-press shrink-0",
              isMoreMenuOpen
                ? "bg-[var(--foreground)]/10 text-[var(--foreground)] border border-[var(--foreground)]/15 shadow-xs"
                : "text-[var(--muted-strong)] hover:bg-black/5 hover:text-[var(--foreground)] border border-transparent"
            )}
            aria-label={isMoreMenuOpen ? "Close options menu" : "More options"}
            aria-expanded={isMoreMenuOpen}
          >
            <div className="relative grid place-items-center">
              {isMoreMenuOpen ? (
                <IconX
                  className="h-5 w-5 stroke-[2.5] transition-transform duration-200"
                  aria-hidden="true"
                />
              ) : (
                <IconLayoutGrid
                  className="h-5 w-5 stroke-2 transition-transform duration-200 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              )}
              {!isMoreMenuOpen && moreItems.some((i) => i.badge && i.badge > 0) && (
                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[var(--primary)] ring-2 ring-white" />
              )}
            </div>
          </button>
        </nav>
      </div>
    </div>
  );
}
