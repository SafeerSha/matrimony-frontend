'use client';

import React from 'react';
import Link from 'next/link';
import {
  IconTools,
  IconArrowLeft,
  IconSparkles,
  IconSearch,
  IconAdjustments,
  IconArrowRight,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { isPageEnabled, type FeatureFlags } from '@/config/feature-flags';

export interface UnderDevelopmentProps {
  pageTitle?: string;
  description?: string;
  className?: string;
}

export function UnderDevelopment({
  pageTitle,
  description,
  className,
}: UnderDevelopmentProps) {
  return (
    <div
      className={cn(
        'mx-auto my-6 sm:my-10 max-w-2xl text-center animate-content-appear',
        className
      )}
    >
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-white/90 p-8 sm:p-12 shadow-[var(--elevation-card)] backdrop-blur-md">
        {/* Ambient Decorative Accents */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(122,24,53,0.06)_0%,transparent_70%)] blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(216,178,140,0.08)_0%,transparent_70%)] blur-2xl"
          aria-hidden="true"
        />

        {/* Status Badge */}
        <div className="mb-6 flex justify-center">
          <Badge tone="champagne" size="md" dot dotColor="bg-amber-500">
            Sprint 1 Demo Scope
          </Badge>
        </div>

        {/* Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary-lighter)] text-[var(--primary)] shadow-[0_8px_20px_var(--primary-glow)]">
          <IconTools className="h-8 w-8 stroke-[1.8]" />
        </div>

        {/* Heading */}
        <h2 className="font-editorial-title text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
          {pageTitle ? `${pageTitle} • Under Development` : 'Under Development'}
        </h2>

        {/* Description */}
        <p className="mx-auto mt-3 max-w-lg text-sm sm:text-base leading-relaxed text-[var(--muted-strong)]">
          {description ||
            `This section is currently under development and scheduled for Sprint 2. Please explore our active Sprint 1 demo modules below.`}
        </p>

        {/* Sprint 1 Quick Shortcuts */}
        <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-4 sm:p-5 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary)] mb-3 flex items-center gap-1.5">
            <IconSparkles className="h-3.5 w-3.5" />
            Active Sprint 1 Features to Review:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link
              href="/app/discover"
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-xs font-medium text-[var(--foreground)] shadow-2xs transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-xs group"
            >
              <span className="flex items-center gap-2">
                <IconSearch className="h-4 w-4 text-[var(--primary)]" />
                <span>Discover Matches</span>
              </span>
              <IconArrowRight className="h-3.5 w-3.5 text-[var(--muted)] group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/app/preferences"
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-xs font-medium text-[var(--foreground)] shadow-2xs transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-xs group"
            >
              <span className="flex items-center gap-2">
                <IconAdjustments className="h-4 w-4 text-[var(--primary)]" />
                <span>Partner Preferences</span>
              </span>
              <IconArrowRight className="h-3.5 w-3.5 text-[var(--muted)] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Primary Back Action */}
        <div className="mt-6 flex justify-center">
          <Button href="/app" variant="secondary" size="md" className="gap-2">
            <IconArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

export interface FeatureGateProps {
  page: keyof FeatureFlags['pages'];
  title?: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Gatekeeper component that checks the feature flag for a page.
 * If page is disabled, renders the UnderDevelopment placeholder.
 * If page is enabled, renders its children seamlessly.
 */
export function FeatureGate({
  page,
  title,
  description,
  children,
}: FeatureGateProps) {
  const enabled = isPageEnabled(page);

  if (!enabled) {
    return <UnderDevelopment pageTitle={title} description={description} />;
  }

  return <>{children}</>;
}
