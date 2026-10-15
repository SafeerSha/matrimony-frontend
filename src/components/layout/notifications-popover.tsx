"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { IconBell, IconCheck, IconHeart, IconMessageCircle, IconShieldCheck, IconArrowRight, IconUsers } from '@tabler/icons-react';
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";
import { notificationService, NotificationItem } from "@/services";
import { notifications as demoNotifications } from "@/lib/demo-data";
import { toast } from "@/lib/toast";

export interface NotificationsPopoverProps {
  className?: string;
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
            data.slice(0, 4).map((n) => ({
              id: n.id,
              type: n.type,
              title:
                n.type === "NEW_INTEREST"
                  ? "New interest received"
                  : n.type === "MATCH_ACCEPTED"
                  ? "Match accepted!"
                  : n.type === "NEW_MESSAGE"
                  ? "New message"
                  : "Notification",
              text: n.content,
              unread: !n.isRead,
            }))
          );
        } else {
          setItems(
            demoNotifications.slice(0, 4).map((d) => ({
              id: d.id,
              type: d.type,
              title: d.title,
              text: d.text,
              unread: d.unread,
              profile: d.profile,
            }))
          );
        }
      })
      .catch(() => {
        setItems(
          demoNotifications.slice(0, 4).map((d) => ({
            id: d.id,
            type: d.type,
            title: d.title,
            text: d.text,
            unread: d.unread,
            profile: d.profile,
          }))
        );
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

  const getIcon = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes("interest")) return <IconHeart className="h-3 w-3 text-[var(--primary)] fill-[var(--primary)]" />;
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
                <div
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 p-2.5 rounded-xl transition-colors hover:bg-[var(--surface-muted)]",
                    item.unread && "bg-[var(--primary)]/[0.03]"
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
                    <p className="text-xs font-bold text-[var(--foreground)] leading-tight truncate">
                      {item.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-[var(--muted)] leading-snug">
                      {item.text}
                    </p>
                  </div>

                  {item.unread && (
                    <span className="h-2 w-2 rounded-full bg-[var(--primary)] shrink-0 mt-1" />
                  )}
                </div>
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
