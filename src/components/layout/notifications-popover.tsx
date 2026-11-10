"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  IconBell,
  IconCheck,
  IconHeart,
  IconMessageCircle,
  IconShieldCheck,
  IconArrowRight,
  IconUsers,
  IconCrown,
} from "@tabler/icons-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";
import { notificationService, parseNotificationText, NotificationItem } from "@/services";
import { toast } from "@/lib/toast";

export interface NotificationsPopoverProps {
  className?: string;
}

export function getNotificationLink(n: {
  type?: string;
  content?: string;
  referenceId?: string | null;
  sender?: { id?: string } | null;
}): string {
  const t = (n.type || "").toUpperCase();
  const c = (n.content || "").toLowerCase();

  // 1. Mutual Matches & Match confirmations -> Matches tab
  if (
    t.includes("MATCH") ||
    t.includes("ACCEPTED") ||
    c.includes("mutual match") ||
    c.includes("interest was accepted")
  ) {
    return "/app/matches";
  }

  // 2. Payment & Subscription updates -> Subscription Transactions tab
  if (
    t.includes("PAYMENT") ||
    t.includes("SUBSCRIPTION") ||
    c.includes("permit") ||
    c.includes("subscription")
  ) {
    return "/app/subscription?tab=transactions";
  }

  // 2. Direct Messages -> Chat with the sender/reference user
  if (t.includes("MESSAGE") || c.includes("message")) {
    const targetUserId = n.referenceId || n.sender?.id;
    return targetUserId ? `/app/messages?user=${targetUserId}` : "/app/messages";
  }

  // 3. New Interests Received -> Interests tab
  if (t.includes("INTEREST") || c.includes("interest")) {
    return "/app/interests?tab=received";
  }

  // 4. Favorites / Shortlists
  if (t.includes("FAVORITE") || t.includes("SHORTLIST") || c.includes("shortlist")) {
    return "/app/favorites";
  }

  // 5. System, Profile Active & Welcome notifications -> Discover profiles
  if (
    c.includes("active") ||
    c.includes("live") ||
    c.includes("welcome") ||
    c.includes("start connecting")
  ) {
    return "/app/discover";
  }

  // Fallback to full notifications center
  return "/app/notifications";
}

export function NotificationsPopover({ className }: NotificationsPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    notificationService
      .getNotifications()
      .then((data) => {
        if (data && data.length > 0) {
          setItems(
            data.slice(0, 6).map((n) => {
              const link = getNotificationLink(n);
              const sender = n.sender;
              let title = "Notification";
              if (n.type === "PAYMENT_SUCCESS") {
                title = "Payment Successful 🎉";
              } else if (n.type === "PAYMENT_FAILED") {
                title = "Payment Failed";
              } else if (n.type === "PAYMENT_PENDING") {
                title = "Payment Confirmation Pending";
              } else if (n.type === "NEW_INTEREST") {
                title = sender?.name ? `${sender.name} sent you an interest` : "New interest received";
              } else if (n.type === "MATCH_ACCEPTED") {
                title = sender?.name ? `Match accepted with ${sender.name}!` : "Match accepted!";
              } else if (n.type === "NEW_MESSAGE") {
                title = sender?.name ? `Message from ${sender.name}` : "New message";
              }

              return {
                id: n.id,
                type: n.type,
                title,
                text: (() => {
                  let text = n.content;
                  const colonIdx = text.indexOf(': ');
                  if (colonIdx > -1 && colonIdx < 35) {
                    text = text.slice(colonIdx + 2).trim();
                  }
                  return parseNotificationText(text);
                })(),
                unread: !n.isRead,
                link,
                profile: sender
                  ? {
                      name: sender.name,
                      image: sender.avatarUrl || "",
                    }
                  : undefined,
              };
            })
          );
        } else {
          setItems([]);
        }
      })
      .catch(() => {
        setItems([]);
      });
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
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

  const unreadCount = items.filter((i) => i.unread).length;

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch {}
    setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
    toast.success("All read", "Notifications marked as read.");
  };

  const handleItemClick = (item: any) => {
    if (item.unread) {
      notificationService.markAsRead(item.id).catch(() => {});
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, unread: false } : i))
      );
    }
    setIsOpen(false);
  };

  const getIcon = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes("payment") || t.includes("subscription"))
      return <IconCrown className="h-3 w-3 text-amber-600" />;
    if (t.includes("interest"))
      return <IconHeart className="h-3 w-3 text-[var(--primary)] fill-[var(--primary)]" />;
    if (t.includes("match")) return <IconUsers className="h-3 w-3 text-[var(--accent)]" />;
    if (t.includes("message")) return <IconMessageCircle className="h-3 w-3 text-emerald-600" />;
    return <IconShieldCheck className="h-3 w-3 text-[var(--muted)]" />;
  };

  return (
    <div ref={popoverRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Notifications"
        className={cn(
          "focus-ring relative grid h-10 w-10 place-items-center rounded-2xl transition-all duration-200 select-none active-press",
          isOpen
            ? "bg-[var(--primary-lighter)] text-[var(--primary)] shadow-xs"
            : "text-[var(--muted-strong)] hover:bg-[var(--primary-lighter)] hover:text-[var(--primary)]"
        )}
      >
        <IconBell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--primary)] ring-2 ring-white" />
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          className={cn(
            "absolute -right-14 sm:right-0 top-full mt-2.5 w-80 sm:w-96 origin-top-right rounded-3xl border border-[var(--border)] bg-white p-3 shadow-[var(--elevation-floating)] z-50",
            "animate-in fade-in zoom-in-95 duration-150 ease-out"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-2 pt-1 pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <h4 className="font-editorial-title text-base font-bold text-[var(--foreground)]">
                Updates
              </h4>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[var(--primary-light)] text-[var(--primary)] px-2 py-0.5 text-[10px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
              >
                <IconCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="divide-y divide-[var(--border)]/60 my-1 max-h-72 overflow-y-auto scrollbar-none">
            {items.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--muted)]">
                No recent notifications
              </div>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  href={item.link}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "flex items-start gap-3 p-2.5 rounded-2xl transition-all duration-150 group cursor-pointer select-none",
                    item.unread
                      ? "bg-rose-50/50 hover:bg-rose-50/90"
                      : "hover:bg-[var(--surface-muted)]"
                  )}
                >
                  <div className="relative mt-0.5 shrink-0">
                    <Avatar
                      src={item.profile?.image}
                      name={item.profile?.name || "IshtamChat"}
                      size="sm"
                    />
                    <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-white shadow-xs border border-[var(--border)]">
                      {getIcon(item.type)}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-tight truncate">
                        {item.title}
                      </p>
                      {item.unread && (
                        <span className="h-2 w-2 rounded-full bg-[var(--primary)] shrink-0" />
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-[var(--muted)] leading-snug">
                      {item.text}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer View All Link */}
          <div className="pt-2 border-t border-[var(--border)]">
            <Link
              href="/app/notifications"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-[var(--primary)] hover:text-[var(--primary-deep)] rounded-xl hover:bg-[var(--primary-lighter)] transition-colors"
            >
              <span>View all notifications</span>
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
