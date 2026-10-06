"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  IconUser,
  IconSettings,
  IconCreditCard,
  IconHelp,
  IconLogout,
  IconChevronDown,
  IconShieldCheck,
  IconCrown,
  IconAdjustments,
} from '@tabler/icons-react';
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import { authService } from "@/services";
import { toast } from "@/lib/toast";

export interface UserMenuProps {
  user?: {
    id?: string;
    profileId?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    isVerified?: boolean;
    photos?: { url: string }[];
    image?: string;
  } | null;
  className?: string;
}

export function UserMenu({ user, className }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const displayName =
    user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`.trim()
      : user?.name || "Member";

  const userImage = user?.photos?.[0]?.url || user?.image;
  const rawId = user?.profileId || (user?.id ? String(user.id).replace(/[^a-zA-Z0-9]/g, "").substring(0, 8).toUpperCase() : "LT-A0001");

  const handleSignOut = async () => {
    setIsOpen(false);
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

  return (
    <div ref={menuRef} className={cn("relative inline-block", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={cn(
          "focus-ring flex items-center gap-2 rounded-2xl p-1.5 transition-all duration-200 select-none active-press",
          isOpen ? "bg-[var(--primary-lighter)] ring-2 ring-[var(--primary)]/20" : "hover:bg-[var(--primary-lighter)]/70"
        )}
      >
        <Avatar
          src={userImage}
          name={displayName}
          size="sm"
          online={true}
          bordered
        />
        <div className="hidden text-left xl:block pr-1">
          <p className="text-xs font-bold text-[var(--foreground)] leading-tight truncate max-w-[110px]">
            {displayName}
          </p>
          <p className="text-[10px] font-medium text-[var(--muted)] leading-tight">
            ID: {rawId}
          </p>
        </div>
        <IconChevronDown
          className={cn(
            "h-4 w-4 text-[var(--muted)] transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-[var(--primary)]"
          )}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown IconMenu */}
      {isOpen && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 top-full mt-2.5 w-72 origin-top-right rounded-3xl border border-[var(--border)] bg-white p-2 shadow-[var(--elevation-floating)] z-50",
            "animate-in fade-in zoom-in-95 duration-150 ease-out"
          )}
        >
          {/* IconMenu Header with User Identity */}
          <div className="rounded-2xl bg-gradient-to-br from-[#FFF9F6] to-white p-3.5 border border-[var(--border)]/70 mb-1.5">
            <div className="flex items-center gap-3">
              <Avatar src={userImage} name={displayName} size="md" online={true} bordered />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-[var(--foreground)] truncate">
                    {displayName}
                  </p>
                  {user?.isVerified && (
                    <span title="Verified Member" className="inline-flex items-center">
                      <IconShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-label="Verified" />
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="rounded-md bg-[var(--primary-light)] px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-[var(--primary)] uppercase">
                    ID: {rawId}
                  </span>
                  <Badge tone="success" size="sm" className="text-[9px] py-0 px-1.5">
                    Active
                  </Badge>
                </div>
              </div>
            </div>

            {/* Premium Quick Spotlight */}
            <div className="mt-3 pt-2.5 border-t border-[var(--border)]/70 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted-strong)] font-medium">
                <IconCrown className="h-3 w-3 text-[var(--accent)]" />
                <span>Premium</span>
              </div>
              <Link
                href="/app/subscription"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-bold text-[#8C5D30] bg-[#FAF3EC] border border-[#EAD8C7] rounded-full px-2 py-0.5 hover:bg-[#F5EADE] transition-colors"
              >
                Upgrade
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5 py-1">
            <Link
              href="/app/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--primary-lighter)] hover:text-[var(--primary)] transition-colors"
              role="menuitem"
            >
              <IconUser className="h-4 w-4 text-[var(--muted)]" />
              <span>My Profile & Photos</span>
            </Link>

            <Link
              href="/app/preferences"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--primary-lighter)] hover:text-[var(--primary)] transition-colors"
              role="menuitem"
            >
              <IconAdjustments className="h-4 w-4 text-[var(--primary)]" />
              <span>Partner Preferences</span>
            </Link>

            <Link
              href="/app/subscription"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--primary-lighter)] hover:text-[var(--primary)] transition-colors"
              role="menuitem"
            >
              <IconCreditCard className="h-4 w-4 text-[var(--muted)]" />
              <span>Premium Plans</span>
            </Link>

            <Link
              href="/app/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--primary-lighter)] hover:text-[var(--primary)] transition-colors"
              role="menuitem"
            >
              <IconSettings className="h-4 w-4 text-[var(--muted)]" />
              <span>Account & Privacy</span>
            </Link>

            <Link
              href="/app/support"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--primary-lighter)] hover:text-[var(--primary)] transition-colors"
              role="menuitem"
            >
              <IconHelp className="h-4 w-4 text-[var(--muted)]" />
              <span>Help & Support</span>
            </Link>
          </div>

          {/* Divider & Sign Out */}
          <div className="border-t border-[var(--border)] pt-1.5 mt-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              role="menuitem"
            >
              <IconLogout className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
