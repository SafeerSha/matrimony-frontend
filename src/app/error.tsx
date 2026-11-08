"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import {
  IconAlertCircle,
  IconRefresh,
  IconHome,
  IconHeadset,
} from "@tabler/icons-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to browser console for developer/support diagnostics
    console.error("Unhandled client error caught by boundary:", error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-xl sm:p-10">
        {/* Brand Header */}
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>

        {/* Friendly Error Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] shadow-inner">
          <IconAlertCircle className="h-8 w-8 stroke-[1.8]" />
        </div>

        {/* User-Friendly Copy */}
        <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
          Something unexpected happened
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
          We encountered an unexpected hiccup while loading this page. Please try refreshing, or return to your dashboard.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:opacity-95 active:scale-[0.98]"
          >
            <IconRefresh className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/app"
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-3.5 text-sm font-semibold text-[var(--foreground)] shadow-sm transition-all hover:bg-[var(--surface-muted)] active:scale-[0.98]"
          >
            <IconHome className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </div>

        {/* Support Link */}
        <div className="mt-8 border-t border-[var(--border)] pt-5">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 text-xs font-medium text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
          >
            <IconHeadset className="h-4 w-4 text-[var(--accent)]" />
            <span>Need assistance? Contact our Support Team</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
