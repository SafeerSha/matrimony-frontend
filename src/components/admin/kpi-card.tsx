'use client';

import React from 'react';
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconInfoCircle,
  IconAlertCircle,
  IconRefresh,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MetricValue } from '@/types/analytics';

interface KpiCardProps {
  title: string;
  metric: MetricValue | undefined;
  icon: React.ReactNode;
  iconBg?: string;
  definition: string;
  source?: string;
  unit?: string;
  isSnapshot?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  accentBorderColor?: string;
}

export function KpiCard({
  title,
  metric,
  icon,
  iconBg = 'bg-[var(--primary-light)] text-[var(--primary)]',
  definition,
  source,
  unit,
  isSnapshot = false,
  isLoading = false,
  error = null,
  onRetry,
  accentBorderColor,
}: KpiCardProps) {
  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <Card
        className="p-5 border-[var(--border)] shadow-xs relative overflow-hidden animate-pulse"
        aria-busy="true"
        aria-label={`Loading ${title} metric`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--surface-muted)]" />
            <div className="h-4 w-28 bg-[var(--surface-muted)] rounded" />
          </div>
          <div className="h-4 w-4 bg-[var(--surface-muted)] rounded-full" />
        </div>
        <div className="h-8 w-24 bg-[var(--surface-muted)] rounded mb-2" />
        <div className="h-3 w-36 bg-[var(--surface-muted)] rounded" />
      </Card>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <Card className="p-5 border-rose-200 bg-rose-50/50 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-rose-800">{title}</span>
          <IconAlertCircle className="h-4 w-4 text-rose-500" />
        </div>
        <p className="text-xs text-rose-600 mb-3">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-white px-2.5 py-1 rounded-md border border-rose-200 transition-colors"
          >
            <IconRefresh className="h-3 w-3" /> Retry
          </button>
        )}
      </Card>
    );
  }

  const isAvailable = metric?.availability === 'available';
  const val = metric?.value;
  const delta = metric?.deltaPct;

  return (
    <Card
      className={`p-5 border-[var(--border)] shadow-xs hover:shadow-md transition-shadow relative group ${
        accentBorderColor ? `border-l-4 ${accentBorderColor}` : ''
      }`}
    >
      {/* Top Header: Icon + Title + Tooltip */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
          >
            {icon}
          </div>
          <h2 className="text-xs font-bold text-[var(--muted-strong)] truncate">{title}</h2>
        </div>

        {/* Definition Tooltip Trigger */}
        <div className="relative group/tooltip shrink-0">
          <button
            type="button"
            aria-label={`Definition for ${title}`}
            className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-1"
          >
            <IconInfoCircle className="h-4 w-4" />
          </button>
          <div className="pointer-events-none absolute right-0 top-full mt-1.5 w-64 rounded-xl bg-[#2A0711] p-3 text-xs text-white opacity-0 shadow-xl border border-[#5E142E] transition-opacity duration-200 group-hover/tooltip:opacity-100 z-50">
            <p className="font-semibold text-white/95 mb-1">{title}</p>
            <p className="text-white/80 leading-relaxed text-[11px]">{definition}</p>
            {source && (
              <p className="text-[10px] text-[var(--primary-light)] mt-2 pt-1.5 border-t border-white/10 font-mono">
                Source: {source}
              </p>
            )}
            {!isAvailable && metric?.reason && (
              <p className="text-[10px] text-amber-300 mt-1 font-medium">
                Note: {metric.reason}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Metric Value */}
      <div className="min-w-0">
        {isAvailable ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
              {val !== null && val !== undefined ? val.toLocaleString() : 'N/A'}
            </span>
            {unit && <span className="text-xs font-medium text-[var(--muted)]">{unit}</span>}
          </div>
        ) : (
          <div className="py-1">
            <Badge tone="default" size="sm" className="bg-amber-50 text-amber-800 border-amber-200">
              Not Available
            </Badge>
            <p className="text-[11px] text-[var(--muted)] mt-1.5 line-clamp-2">
              {metric?.reason || 'Billing integration required'}
            </p>
          </div>
        )}

        {/* Delta Comparison or Snapshot Label */}
        {isAvailable && (
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {isSnapshot ? (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[var(--muted)] bg-[var(--surface-muted)] px-2 py-0.5 rounded">
                Current Snapshot (As of now)
              </span>
            ) : delta !== null && delta !== undefined ? (
              delta > 0 ? (
                <>
                  <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    <IconTrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>+{delta}%</span>
                    <span className="sr-only">increased by {delta}% vs previous period</span>
                  </span>
                  <span className="text-[11px] text-[var(--muted)] truncate">vs preceding period</span>
                </>
              ) : delta < 0 ? (
                <>
                  <span className="inline-flex items-center gap-0.5 font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                    <IconTrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{delta}%</span>
                    <span className="sr-only">decreased by {Math.abs(delta)}% vs previous period</span>
                  </span>
                  <span className="text-[11px] text-[var(--muted)] truncate">vs preceding period</span>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-0.5 font-medium text-[var(--muted)] bg-[var(--surface-muted)] px-1.5 py-0.5 rounded">
                    <IconMinus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>0%</span>
                    <span className="sr-only">no change vs previous period</span>
                  </span>
                  <span className="text-[11px] text-[var(--muted)] truncate">vs preceding period</span>
                </>
              )
            ) : (
              <>
                <span className="text-[11px] font-semibold text-[var(--muted)] bg-[var(--surface-muted)] px-1.5 py-0.5 rounded">
                  New Period
                </span>
                <span className="text-[11px] text-[var(--muted)] truncate">vs preceding period</span>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
