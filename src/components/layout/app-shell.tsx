import Link from "next/link";
import { Bell, Heart, Home, MessageCircle, Search, Settings, UserRound } from "lucide-react";
import { Logo } from "./logo";

const nav = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/discover", label: "Discover", icon: Search },
  { href: "/app/interests", label: "Interests", icon: Heart },
  { href: "/app/messages", label: "Messages", icon: MessageCircle },
  { href: "/app/profile", label: "Profile", icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
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
          <nav className="sticky top-24 space-y-1" aria-label="Application navigation">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--muted-strong)] hover:bg-[var(--primary-lighter)] hover:text-[var(--primary)]">
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </Link>
            ))}
            <Link href="/app/settings" className="focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--muted-strong)] hover:bg-[var(--primary-lighter)]">
              <Settings className="h-5 w-5" aria-hidden />
              Settings
            </Link>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 pb-24">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-white/95 px-2 py-2 backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="focus-ring flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium text-[var(--muted-strong)]">
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}