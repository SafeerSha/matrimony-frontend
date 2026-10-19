"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  IconHome,
  IconSearch,
  IconHeart,
  IconUsers,
  IconStar,
  IconBookmark,
  IconMessageCircle,
  IconBell,
  IconUser,
  IconSettings,
  IconCrown,
  IconAdjustments,
} from '@tabler/icons-react';
import { cn } from "@/lib/cn";

export interface SidebarProps {
  unreadMessagesCount?: number;
  unreadNotificationsCount?: number;
  className?: string;
}

interface NavItemDef {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  isActive: (pathname: string, tab: string | null) => boolean;
}

export function Sidebar(props: SidebarProps) {
  return (
    <Suspense fallback={<SidebarSkeleton />}>
      <SidebarContent {...props} />
    </Suspense>
  );
}

function SidebarSkeleton() {
  return (
    <aside className="hidden md:block md:w-20 lg:w-56 xl:w-60 shrink-0">
      <div className="sticky top-20 rounded-3xl border border-[var(--border)] bg-white p-3 shadow-[var(--elevation-card)] h-[600px] animate-pulse" />
    </aside>
  );
}

function SidebarContent({
  unreadMessagesCount = 0,
  unreadNotificationsCount = 0,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get("tab") : null;

  const topNav: NavItemDef[] = [
    {
      label: "Home",
      href: "/app",
      icon: IconHome,
      isActive: (path) => path === "/app",
    },
    {
      label: "Discover",
      href: "/app/discover",
      icon: IconSearch,
      isActive: (path) => path.startsWith("/app/discover"),
    },
    {
      label: "Interests",
      href: "/app/interests",
      icon: IconHeart,
      isActive: (path, tab) =>
        path === "/app/interests" && (!tab || tab === "pending" || tab === "received"),
    },
    {
      label: "Matches",
      href: "/app/matches",
      icon: IconUsers,
      isActive: (path) => path.startsWith("/app/matches"),
    },
    {
      label: "Favorites",
      href: "/app/favorites",
      icon: IconStar,
      isActive: (path) => path.startsWith("/app/favorites"),
    },
    {
      label: "Messages",
      href: "/app/messages",
      icon: IconMessageCircle,
      badge: unreadMessagesCount,
      isActive: (path) => path.startsWith("/app/messages"),
    },
    {
      label: "Notifications",
      href: "/app/notifications",
      icon: IconBell,
      badge: unreadNotificationsCount,
      isActive: (path) => path.startsWith("/app/notifications"),
    },
  ];

  const bottomNav: NavItemDef[] = [
    {
      label: "Profile",
      href: "/app/profile",
      icon: IconUser,
      isActive: (path) => path.startsWith("/app/profile"),
    },
    {
      label: "Preferences",
      href: "/app/preferences",
      icon: IconAdjustments,
      isActive: (path) => path.startsWith("/app/preferences"),
    },
    {
      label: "Settings",
      href: "/app/settings",
      icon: IconSettings,
      isActive: (path) => path.startsWith("/app/settings"),
    },
  ];

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col md:w-20 lg:w-56 xl:w-60 shrink-0",
        className
      )}
    >
      <div className="sticky top-20 flex flex-col justify-between rounded-3xl border border-[var(--border)] bg-white p-2.5 sm:p-3 shadow-[var(--elevation-card)] min-h-[calc(100vh-6.5rem)]">
        {/* Top Navigation Group */}
        <div className="space-y-1">
          <div className="hidden lg:block px-3 py-1.5 mb-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Matchmaking
            </p>
          </div>

          <nav className="space-y-1" aria-label="Main matchmaking navigation">
            {topNav.map(({ label, href, icon: Icon, badge, isActive }) => {
              const active = isActive(pathname, currentTab);

              return (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "focus-ring relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-xs lg:text-sm transition-all duration-200 select-none active-press group",
                    // Tablet icon rail centering vs Desktop expanded layout
                    "justify-center lg:justify-start",
                    active
                      ? "bg-[var(--primary)] text-white shadow-[0_4px_14px_var(--primary-shadow)] font-semibold"
                      : "text-[var(--muted-strong)] font-medium hover:bg-[var(--primary-lighter)] hover:text-[var(--primary)]"
                  )}
                  title={label}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                      active ? "text-white" : "text-[var(--muted)] group-hover:text-[var(--primary)]"
                    )}
                    aria-hidden="true"
                  />

                  {/* Desktop Label */}
                  <span className="hidden lg:inline-block truncate">{label}</span>

                  {/* Tablet Tiny Label */}
                  <span className="lg:hidden text-[9px] font-bold tracking-tight block text-center mt-0.5 leading-none absolute -bottom-1">
                    {/* kept visually in title, displayed cleanly on tablet */}
                  </span>

                  {/* Badge Counter */}
                  {badge !== undefined && badge > 0 && (
                    <span
                      className={cn(
                        "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold shrink-0 md:absolute md:top-1.5 md:right-2 lg:static lg:ml-auto leading-none shadow-2xs",
                        active
                          ? "bg-white text-[var(--primary)]"
                          : "bg-[var(--primary)] text-white"
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Premium + Profile & IconSettings */}
        <div className="space-y-3 pt-3 border-t border-[var(--border)]/70">
          {/* Subtle Premium Spotlight Card on Desktop */}
          <div className="hidden lg:block rounded-2xl bg-gradient-to-br from-[#FAF3EC] to-[#FFF9F6] p-3 border border-[#EAD8C7] shadow-2xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#EAD8C7]/50 text-[#8C5D30]">
                <IconCrown className="h-3.5 w-3.5" />
              </span>
              <p className="text-xs font-bold text-[#5C1027]">Premium</p>
            </div>
            <p className="text-[11px] text-[var(--muted-strong)] leading-snug">
              Connect with best matches
            </p>
            <Link
              href="/app/subscription"
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--primary)] hover:underline"
            >
              <span>Explore Plans</span>
              <span>→</span>
            </Link>
          </div>

          {/* Profile & IconSettings Navigation */}
          <nav className="space-y-1" aria-label="Account navigation">
            {bottomNav.map(({ label, href, icon: Icon, isActive }) => {
              const active = isActive(pathname, currentTab);

              return (
                <Link
                  key={label}
                  href={href}
                  className={cn(
                    "focus-ring flex items-center gap-3 rounded-2xl px-3 py-2 text-xs lg:text-sm transition-all duration-200 select-none active-press group",
                    "justify-center lg:justify-start",
                    active
                      ? "bg-[var(--primary)] text-white shadow-[0_4px_12px_var(--primary-shadow)] font-semibold"
                      : "text-[var(--muted-strong)] font-medium hover:bg-[var(--primary-lighter)] hover:text-[var(--primary)]"
                  )}
                  title={label}
                >
                  <Icon
                    className={cn(
                      "h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                      active ? "text-white" : "text-[var(--muted)] group-hover:text-[var(--primary)]"
                    )}
                    aria-hidden="true"
                  />
                  <span className="hidden lg:inline-block truncate">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
