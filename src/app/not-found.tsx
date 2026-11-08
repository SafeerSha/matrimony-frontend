import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { IconHome, IconCompass } from "@tabler/icons-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-xl sm:p-10">
        {/* Brand Header */}
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        {/* 404 Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] shadow-inner">
          <IconCompass className="h-8 w-8 stroke-[1.8]" />
        </div>

        {/* User-Friendly Copy */}
        <p className="text-xs font-bold tracking-widest uppercase text-[var(--primary)]">
          404 • Page Not Found
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          We couldn’t find that page
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          The link you followed may be broken, or the page may have been moved or removed.
        </p>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-95 active:scale-[0.98]"
          >
            <IconHome className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
