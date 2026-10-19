"use client";

import React, { useState, useEffect } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { usePathname } from "next/navigation";
import { authService, profileService, notificationService, chatService, isDraftUser } from "@/services";

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Load user data and counters
  useEffect(() => {
    // 1. Current user & draft completeness check
    authService
      .getCurrentUser()
      .then((user: any) => {
        if (!user) return;
        setCurrentUser(user);

        if (isDraftUser({ user })) {
          window.location.href = "/onboarding";
          return;
        }
      })
      .catch(() => {});

    profileService
      .getProfile("me")
      .then((profile: any) => {
        if (!profile) return;
        if (isDraftUser(profile)) {
          window.location.href = "/onboarding";
        }
      })
      .catch(() => {});

    // 2. Notifications count
    notificationService
      .getNotifications()
      .then((data) => {
        if (Array.isArray(data)) {
          const unread = data.filter((n) => !n.isRead).length;
          setUnreadNotificationsCount(unread);
        }
      })
      .catch(() => {});

    // 3. Messages count initial load
    chatService
      .getConversations()
      .then((convos) => {
        if (Array.isArray(convos)) {
          const totalUnread = convos.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          setUnreadMessagesCount(totalUnread);
        }
      })
      .catch(() => {});

    // Listen to real-time chat unread changes from messages page
    const handleUnreadChanged = (e: any) => {
      if (typeof e.detail?.totalUnread === "number") {
        setUnreadMessagesCount(e.detail.totalUnread);
      }
    };
    window.addEventListener("chat:unread-changed", handleUnreadChanged);

    // Listen to incoming messages across any page
    const unsubscribeChat = chatService.onMessage(() => {
      if (!pathname.startsWith("/app/messages")) {
        setUnreadMessagesCount((prev) => prev + 1);
      }
    });

    // 4. Live Presence Heartbeat (Every 60s & when tab becomes visible)
    authService.heartbeat();
    const heartbeatInterval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        authService.heartbeat();
      }
    }, 60000);

    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        authService.heartbeat();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("chat:unread-changed", handleUnreadChanged);
      unsubscribeChat();
      clearInterval(heartbeatInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [pathname]);

  return (
    <div className="relative min-h-screen bg-transparent flex flex-col antialiased selection:bg-[var(--primary-light)] selection:text-[var(--primary-deep)]">
      {/* Ambient Romantic Background Glows (Warm Ivory + Subtle Burgundy Accents) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 right-0 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(122,24,53,0.045)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(216,178,140,0.05)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(199,122,139,0.035)_0%,transparent_70%)] blur-3xl" />
      </div>

      {/* Top Application Header */}
      <Header user={currentUser} />

      {/* Main Responsive Layout */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        {/* Desktop & Tablet Sidebar */}
        <Sidebar
          unreadMessagesCount={unreadMessagesCount}
          unreadNotificationsCount={unreadNotificationsCount}
        />

        {/* Dynamic Page Container */}
        <main
          key={pathname}
          id="main-content"
          className="min-w-0 flex-1 pb-24 md:pb-12 animate-page-enter"
        >
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Dock */}
      <MobileNav 
        unreadMessagesCount={unreadMessagesCount}
        unreadNotificationsCount={unreadNotificationsCount} 
      />
    </div>
  );
}