"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Heart, Home, MessageCircle, Search, Settings, UserRound } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/cn";
const nav = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/discover", label: "Discover", icon: Search },
  { href: "/app/interests", label: "Interests", icon: Heart },
  { href: "/app/messages", label: "Messages", icon: MessageCircle },
  { href: "/app/profile", label: "Profile", icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--border)]/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Logo href="/app" />
          <div className="flex items-center gap-2">
            <Link href="/app/notifications" className="focus-ring relative grid h-10 w-10 place-items-center rounded-xl text-[var(--muted-strong)] hover:bg-[var(--primary-lighter)]" aria-label="Notifications">
              <Bell className="h-5 w-5" aria-hidden />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            </Link>
            <Link href="/app/profile" className="focus-ring flex items-center gap-2 rounded-xl p-1.5 hover:bg-[var(--primary-lighter)]">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--primary-light)] text-sm font-bold text-[var(--primary)]">S</span>
              <span className="hidden text-sm font-semibold sm:block">My profile</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-24 space-y-1 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-2xl p-3 shadow-[0_8px_32px_rgba(16,185,129,0.12)]" aria-label="Application navigation">
            {nav.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link key={href} href={href} className={cn(
                  "focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-emerald-500/15 hover:text-emerald-800",
                  isActive ? "bg-emerald-500/20 text-emerald-900 shadow-sm font-semibold" : "text-[var(--muted-strong)]"
                )}>
                  <Icon className="h-5 w-5" aria-hidden />
                  {label}
                </Link>
              );
            })}
            <Link href="/app/settings" className={cn(
              "focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-emerald-500/15 hover:text-emerald-800",
              pathname === "/app/settings" ? "bg-emerald-500/20 text-emerald-900 shadow-sm font-semibold" : "text-[var(--muted-strong)]"
            )}>
              <Settings className="h-5 w-5" aria-hidden />
              Settings
            </Link>
            <Link href="/app/subscription" className={cn(
              "focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-emerald-500/15 hover:text-emerald-800",
              pathname === "/app/subscription" ? "bg-emerald-500/20 text-emerald-900 shadow-sm font-semibold" : "text-[var(--muted-strong)]"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              Subscription
            </Link>
            <Link href="/app/support" className={cn(
              "focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-emerald-500/15 hover:text-emerald-800",
              pathname === "/app/support" ? "bg-emerald-500/20 text-emerald-900 shadow-sm font-semibold" : "text-[var(--muted-strong)]"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
              Help & Support
            </Link>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pb-24">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-white/95 px-2 py-2 backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {nav.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href} className={cn(
                "focus-ring flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition-colors",
                isActive ? "text-[var(--primary)]" : "text-[var(--muted-strong)] hover:text-[var(--primary)]"
              )}>
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}