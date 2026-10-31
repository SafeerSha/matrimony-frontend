'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  IconUsers,
  IconUserPlus,
  IconCurrencyDollar,
  IconTrendingDown,
  IconRefresh,
  IconAlertCircle,
  IconChartBar,
  IconCrown,
  IconPercentage,
} from '@tabler/icons-react';
import { adminService } from '@/services/admin.service';
import type { AnalyticsOverview, AnalyticsPreset, DateRangeInput } from '@/types/analytics';
import { KpiCard } from './kpi-card';
import { DateRangePicker } from './date-range-picker';
import { AnalyticsChart } from './analytics-chart';
import { Card } from '@/components/ui/card';

export function PlatformOverview() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse range from URL search params with safe fallbacks
  const urlPreset = (searchParams.get('preset') as AnalyticsPreset) || '30d';
  const urlFrom = searchParams.get('from') || undefined;
  const urlTo = searchParams.get('to') || undefined;

  const validPresets: AnalyticsPreset[] = ['today', '7d', '30d', '90d', 'custom'];
  const safePreset: AnalyticsPreset = validPresets.includes(urlPreset) ? urlPreset : '30d';

  const [range, setRange] = useState<DateRangeInput>({
    preset: safePreset,
    from: urlFrom,
    to: urlTo,
    timezone: 'UTC',
  });

  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [activeChartTab, setActiveChartTab] = useState<'activeUsers' | 'newSignups'>('activeUsers');

  // Track active AbortController to guarantee race safety
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync state when URL params change externally (back/forward navigation)
  useEffect(() => {
    if (urlPreset !== range.preset || urlFrom !== range.from || urlTo !== range.to) {
      setRange({
        preset: safePreset,
        from: urlFrom,
        to: urlTo,
        timezone: 'UTC',
      });
    }
  }, [urlPreset, urlFrom, urlTo, safePreset]);

  const fetchData = useCallback(
    async (currentRange: DateRangeInput, isManualRefresh = false) => {
      // Abort any prior in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const result = await adminService.getAnalyticsOverview(currentRange, controller.signal);
        setData(result);
        setStatusMessage(
          `Analytics updated for ${result.range.preset} range at ${new Date(result.lastUpdated).toLocaleTimeString()}`
        );
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return; // Intentionally aborted by newer request
        }
        console.error('Failed to load analytics overview:', err);
        const isForbidden = err?.status === 403 || err?.statusCode === 403 || err?.message?.toLowerCase()?.includes('permission');
        if (isForbidden && typeof window !== 'undefined') { window.location.href = '/login?next=/admin&error=admin_required'; return; }
        setError(err?.message || 'Unable to load analytics metrics. Please retry.');
        setStatusMessage('Error updating analytics data.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(range);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [range, fetchData]);

  // Handle user range selection and synchronize with URL search params
  const handleRangeChange = (newRange: DateRangeInput) => {
    setRange(newRange);

    const params = new URLSearchParams(searchParams.toString());
    if (newRange.preset) {
      params.set('preset', newRange.preset);
    }
    if (newRange.preset === 'custom' && newRange.from && newRange.to) {
      params.set('from', newRange.from);
      params.set('to', newRange.to);
    } else {
      params.delete('from');
      params.delete('to');
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleManualRefresh = () => {
    fetchData(range, true);
  };

  const lastUpdatedFormatted = data?.lastUpdated
    ? new Date(data.lastUpdated).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Screen reader live region */}
      <div className="sr-only" aria-live="polite" role="status">
        {statusMessage}
      </div>

      {/* Top Header: Title, Subtitle, Date Controls, Refresh */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
            Platform Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Real-time aggregates computed from verified database records.
          </p>
        </div>

        {/* Date Range Control & Refresh Button */}
        <div className="flex items-center flex-wrap gap-2.5 self-start md:self-auto">
          <DateRangePicker
            currentRange={range}
            onChange={handleRangeChange}
            isLoading={isLoading || isRefreshing}
          />

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isLoading || isRefreshing}
            aria-label="Refresh platform analytics data"
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] active:scale-95 transition-all disabled:opacity-50"
          >
            <IconRefresh
              className={`h-3.5 w-3.5 text-[var(--primary)] ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            />
            <span>{isRefreshing ? 'Refreshing…' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      {/* Timestamp & Timezone Notice */}
      <div className="flex items-center justify-between text-[11px] text-[var(--muted)] px-1">
        <div>
          <span>Timezone: </span>
          <span className="font-semibold text-[var(--foreground)]">
            {data?.range.timezone || 'UTC'}
          </span>
          {data?.range.bucket && (
            <span className="ml-2">
              (Bucket: <span className="font-semibold">{data.range.bucket}</span>)
            </span>
          )}
        </div>
        {lastUpdatedFormatted && (
          <div>
            <span>Last updated: </span>
            <span className="font-medium text-[var(--foreground)]">{lastUpdatedFormatted}</span>
          </div>
        )}
      </div>

      {/* Global Error Banner (with retry) */}
      {error && !isLoading && (
        <div
          role="alert"
          className="flex items-center justify-between p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs shadow-xs"
        >
          <div className="flex items-center gap-2">
            <IconAlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchData(range)}
            className="px-3 py-1 bg-white border border-rose-300 font-semibold rounded-lg hover:bg-rose-100 transition-colors"
          >
            Retry Request
          </button>
        </div>
      )}

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* KPI 1: Active Users */}
        <KpiCard
          title="Active Users"
          metric={data?.metrics.activeUsers}
          icon={<IconUsers className="h-5 w-5" />}
          iconBg="bg-[var(--primary-light)] text-[var(--primary)]"
          definition="Distinct users with registered activity (login, refresh, socket connection) within the selected period. Excludes banned and suspended accounts."
          source={data?.metrics.activeUsers?.source}
          accentBorderColor="border-l-[var(--primary)]"
          isLoading={isLoading}
          error={error ? 'Failed to load active users' : null}
          onRetry={() => fetchData(range)}
        />

        {/* KPI 2: New Signups */}
        <KpiCard
          title="New Signups"
          metric={data?.metrics.newSignups}
          icon={<IconUserPlus className="h-5 w-5" />}
          iconBg="bg-blue-50 text-blue-600"
          definition="New user accounts registered within the period with role=USER. Computed from verified user creation timestamps."
          source={data?.metrics.newSignups?.source}
          accentBorderColor="border-l-blue-600"
          isLoading={isLoading}
          error={error ? 'Failed to load signups' : null}
          onRetry={() => fetchData(range)}
        />

        {/* KPI 3: Paid Members (Snapshot) */}
        <KpiCard
          title="Paid Members"
          metric={data?.metrics.paidMembers}
          icon={<IconCrown className="h-5 w-5" />}
          iconBg="bg-amber-50 text-amber-600"
          definition="Total members currently on a PAID subscription tier (status=ACTIVE, role=USER). Snapshot as of now."
          source={data?.metrics.paidMembers?.source}
          accentBorderColor="border-l-amber-500"
          isSnapshot={true}
          isLoading={isLoading}
          error={error ? 'Failed to load paid members' : null}
          onRetry={() => fetchData(range)}
        />

        {/* KPI 4: Premium Conversion (Snapshot) */}
        <KpiCard
          title="Premium Conversion"
          metric={data?.metrics.premiumConversion}
          icon={<IconPercentage className="h-5 w-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
          definition="Percentage of active, unbanned members holding a PAID subscription tier relative to total active members."
          source={data?.metrics.premiumConversion?.source}
          unit="%"
          accentBorderColor="border-l-emerald-500"
          isSnapshot={true}
          isLoading={isLoading}
          error={error ? 'Failed to load premium conversion' : null}
          onRetry={() => fetchData(range)}
        />

        {/* KPI 5: Churn Rate */}
        <KpiCard
          title="Member Churn Rate"
          metric={data?.metrics.churnRate}
          icon={<IconTrendingDown className="h-5 w-5" />}
          iconBg="bg-purple-50 text-purple-600"
          definition="Percentage of paying subscribers downgraded to BASIC during the period relative to paid members at period start."
          source={data?.metrics.churnRate?.source}
          unit="%"
          accentBorderColor="border-l-purple-500"
          isLoading={isLoading}
          error={error ? 'Failed to load churn rate' : null}
          onRetry={() => fetchData(range)}
        />

        {/* KPI 6: Subscription Revenue (Gated) */}
        <KpiCard
          title="Subscription Revenue"
          metric={data?.metrics.revenue}
          icon={<IconCurrencyDollar className="h-5 w-5" />}
          iconBg="bg-slate-100 text-slate-700"
          definition="Net recognized revenue across paid subscriptions. Unavailable until payment gateway webhooks are integrated."
          source="Stripe / Razorpay Webhooks (Pending Integration)"
          accentBorderColor="border-l-slate-400"
          isLoading={isLoading}
          error={error ? 'Failed to load revenue' : null}
          onRetry={() => fetchData(range)}
        />
      </div>

      {/* Trend Analysis Chart Card */}
      <Card className="p-5 sm:p-6 border-[var(--border)] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[var(--surface-muted)] flex items-center justify-center text-[var(--muted-strong)]">
              <IconChartBar className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)] tracking-tight">
                Activity Trends
              </h2>
              <p className="text-[11px] text-[var(--muted)]">
                {data?.range.bucket === 'week' ? 'Weekly' : 'Daily'} zero-filled continuous series
              </p>
            </div>
          </div>

          {/* Metric Trend Switcher */}
          <div className="inline-flex items-center rounded-xl bg-[var(--surface-muted)] p-1 border border-[var(--border)] gap-1">
            <button
              type="button"
              onClick={() => setActiveChartTab('activeUsers')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeChartTab === 'activeUsers'
                  ? 'bg-white text-[var(--primary)] shadow-xs font-bold'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              Active Users
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('newSignups')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeChartTab === 'newSignups'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              New Signups
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="pt-2">
          {isLoading ? (
            <div
              className="h-44 rounded-xl bg-[var(--surface-muted)] animate-pulse flex items-center justify-center text-xs text-[var(--muted)]"
              aria-busy="true"
            >
              Loading trend graph…
            </div>
          ) : activeChartTab === 'activeUsers' ? (
            <AnalyticsChart
              data={data?.timeseries.activeUsers || []}
              color="var(--primary)"
              gradientId="active-users-grad"
              metricName="Active Users"
              height={180}
            />
          ) : (
            <AnalyticsChart
              data={data?.timeseries.newSignups || []}
              color="#2563eb"
              gradientId="signups-grad"
              metricName="New Signups"
              height={180}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
