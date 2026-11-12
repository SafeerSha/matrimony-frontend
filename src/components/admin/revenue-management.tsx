'use client';

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  IconCurrencyRupee,
  IconTrendingUp,
  IconTrendingDown,
  IconRefresh,
  IconDownload,
  IconSearch,
  IconFilter,
  IconCheck,
  IconX,
  IconClock,
  IconAlertCircle,
  IconCopy,
  IconChevronLeft,
  IconChevronRight,
  IconCreditCard,
  IconWallet,
  IconDeviceMobile,
  IconBuildingBank,
  IconUsers,
  IconReceipt,
  IconHelpCircle,
  IconLoader2,
} from '@tabler/icons-react';
import { revenueService } from '@/services/revenue.service';
import type {
  RevenueOverviewResponse,
  RevenueTimeSeriesPoint,
  RevenuePlanBreakdownItem,
  RevenueMethodBreakdownItem,
  RevenueTransactionItem,
  RevenuePreset,
} from '@/types/revenue';
import { toast } from '@/lib/toast';

function formatINR(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
}

function formatINRDecimals(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val || 0);
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function RevenueManagement() {
  // Preset filter state
  const [preset, setPreset] = useState<RevenuePreset>('30d');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  // Overview and breakdown data states
  const [overview, setOverview] = useState<RevenueOverviewResponse | null>(null);
  const [timeSeries, setTimeSeries] = useState<RevenueTimeSeriesPoint[]>([]);
  const [plans, setPlans] = useState<RevenuePlanBreakdownItem[]>([]);
  const [methods, setMethods] = useState<RevenueMethodBreakdownItem[]>([]);

  // Chart toggle
  const [chartMetric, setChartMetric] = useState<'revenue' | 'transactions'>('revenue');

  // Ledger state
  const [transactions, setTransactions] = useState<RevenueTransactionItem[]>([]);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Loading states
  const [isLoadingMetrics, setIsLoadingMetrics] = useState<boolean>(true);
  const [isLoadingLedger, setIsLoadingLedger] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const ledgerAbortRef = useRef<AbortController | null>(null);

  // Fetch top metrics, chart and breakdowns
  const fetchRevenueMetrics = useCallback(
    async (currentPreset: RevenuePreset, from?: string, to?: string) => {
      if (abortRef.current) abortRef.current.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setIsLoadingMetrics(true);
      setError(null);

      try {
        const queryParams = {
          preset: currentPreset,
          from: currentPreset === 'custom' ? from : undefined,
          to: currentPreset === 'custom' ? to : undefined,
        };

        const [ovData, tsData, planData, methodData] = await Promise.all([
          revenueService.getOverview(queryParams, ac.signal),
          revenueService.getTimeSeries(queryParams, ac.signal),
          revenueService.getByPlan(queryParams, ac.signal),
          revenueService.getByMethod(queryParams, ac.signal),
        ]);

        setOverview(ovData);
        setTimeSeries(tsData.points || []);
        setPlans(planData.plans || []);
        setMethods(methodData.methods || []);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Failed to load revenue analytics.');
      } finally {
        setIsLoadingMetrics(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  // Fetch ledger transactions
  const fetchTransactions = useCallback(
    async (targetPage: number) => {
      if (ledgerAbortRef.current) ledgerAbortRef.current.abort();
      const ac = new AbortController();
      ledgerAbortRef.current = ac;

      setIsLoadingLedger(true);

      try {
        const res = await revenueService.getTransactions(
          {
            page: targetPage,
            limit: 15,
            status: statusFilter,
            plan: planFilter,
            search: searchQuery,
            from: preset === 'custom' ? customFrom : undefined,
            to: preset === 'custom' ? customTo : undefined,
          },
          ac.signal,
        );

        setTransactions(res.items || []);
        setTotalTransactions(res.pagination.total);
        setTotalPages(res.pagination.totalPages || 1);
        setPage(res.pagination.page);
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      } finally {
        setIsLoadingLedger(false);
      }
    },
    [statusFilter, planFilter, searchQuery, preset, customFrom, customTo],
  );

  // Load metrics when preset changes
  useEffect(() => {
    fetchRevenueMetrics(preset, customFrom, customTo);
  }, [preset, customFrom, customTo, fetchRevenueMetrics]);

  // Load transactions when page, filters or search change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions(page);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchTransactions, page]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRevenueMetrics(preset, customFrom, customTo);
    fetchTransactions(page);
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      await revenueService.exportCsv({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        plan: planFilter !== 'ALL' ? planFilter : undefined,
        search: searchQuery.trim() || undefined,
        from: preset === 'custom' ? customFrom : undefined,
        to: preset === 'custom' ? customTo : undefined,
      });
      toast.flash('success', 'Export Complete', 'The transaction ledger has been downloaded as CSV.');
    } catch (err: any) {
      toast.flash('error', 'Export Failed', err.message || 'Could not download CSV ledger.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.flash('info', 'Copied to Clipboard', text);
    }
  };

  // Preset Buttons Config
  const presets: { id: RevenuePreset; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
    { id: 'ytd', label: 'Year to Date' },
    { id: 'all', label: 'All Time' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* 1. TOP HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
              Revenue &amp; Financial Operations
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Cashfree Gateway
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Real-time platform earnings, recurring subscriptions, ticket sizes, and payment ledger.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* Preset Buttons */}
          <div className="flex items-center bg-[var(--surface-muted)] p-1 rounded-xl border border-[var(--border)] text-xs font-semibold overflow-x-auto max-w-full">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setPreset(p.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  preset === p.id
                    ? 'bg-white text-[var(--foreground)] shadow-xs font-bold'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingMetrics}
            title="Refresh revenue metrics"
            className="p-2 rounded-xl bg-white border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <IconRefresh className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-[var(--primary)]' : ''}`} />
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#80132E] hover:bg-[#600E22] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <IconDownload className="h-3.5 w-3.5" />
            )}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ERROR NOTICE IF ANY */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex items-center gap-3 text-rose-800 text-xs sm:text-sm">
          <IconAlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <div className="flex-1">
            <span className="font-bold">Error loading revenue metrics:</span> {error}
          </div>
          <button
            onClick={handleRefresh}
            className="px-2.5 py-1 rounded-lg bg-rose-200/60 hover:bg-rose-200 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* 2. EXECUTIVE KPI SCORECARD (5 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* CARD 1: GROSS REVENUE */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[var(--border)] shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Gross Revenue
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <IconCurrencyRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
              {isLoadingMetrics ? (
                <div className="h-8 w-28 bg-[var(--surface-muted)] rounded-md animate-pulse" />
              ) : (
                formatINR(overview?.grossRevenue.current || 0)
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {overview?.grossRevenue.deltaPct !== null && overview?.grossRevenue.deltaPct !== undefined && (
                <span
                  className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded ${
                    overview.grossRevenue.deltaPct >= 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {overview.grossRevenue.deltaPct >= 0 ? (
                    <IconTrendingUp className="h-3 w-3" />
                  ) : (
                    <IconTrendingDown className="h-3 w-3" />
                  )}
                  {overview.grossRevenue.deltaPct >= 0 ? '+' : ''}
                  {overview.grossRevenue.deltaPct}%
                </span>
              )}
              <span className="text-[11px] text-[var(--muted)]">
                {overview?.transactions.successfulCount || 0} successful orders
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: MONTHLY RUN RATE (MRR) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[var(--border)] shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Monthly Run-Rate
            </span>
            <div className="h-7 w-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
              <IconReceipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
              {isLoadingMetrics ? (
                <div className="h-8 w-24 bg-[var(--surface-muted)] rounded-md animate-pulse" />
              ) : (
                `${formatINR(overview?.mrr.current || 0)}`
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[var(--muted)]">
              <span>Normalized 30-day recurring run rate</span>
            </div>
          </div>
        </div>

        {/* CARD 3: ARPPU */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[var(--border)] shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Avg. Per Paying User
            </span>
            <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <IconUsers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
              {isLoadingMetrics ? (
                <div className="h-8 w-24 bg-[var(--surface-muted)] rounded-md animate-pulse" />
              ) : (
                formatINR(overview?.arppu.current || 0)
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {overview?.arppu.deltaPct !== null && overview?.arppu.deltaPct !== undefined && (
                <span
                  className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded ${
                    overview.arppu.deltaPct >= 0
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {overview.arppu.deltaPct >= 0 ? '+' : ''}
                  {overview.arppu.deltaPct}%
                </span>
              )}
              <span className="text-[11px] text-[var(--muted)]">
                {overview?.arppu.payingUsersCount || 0} paying members
              </span>
            </div>
          </div>
        </div>

        {/* CARD 4: ACTIVE PAID SUBSCRIBERS */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[var(--border)] shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Active Paid Members
            </span>
            <div className="h-7 w-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
              <IconCreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
              {isLoadingMetrics ? (
                <div className="h-8 w-20 bg-[var(--surface-muted)] rounded-md animate-pulse" />
              ) : (
                overview?.paidSubscribers.activePaidCount ?? 0
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[var(--muted)]">
              <span className="font-semibold text-emerald-600">
                +{overview?.paidSubscribers.newPaidInPeriod ?? 0}
              </span>
              <span>new upgrades in this period</span>
            </div>
          </div>
        </div>

        {/* CARD 5: SUCCESS RATE */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[var(--border)] shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
              Checkout Success
            </span>
            <div className="h-7 w-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <IconCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
              {isLoadingMetrics ? (
                <div className="h-8 w-20 bg-[var(--surface-muted)] rounded-md animate-pulse" />
              ) : (
                `${overview?.successRate.ratePct ?? 100}%`
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-[var(--muted)]">
              <span>{overview?.successRate.successCount ?? 0} success</span>
              <span>•</span>
              <span className="text-rose-600">{overview?.successRate.failedCount ?? 0} fail</span>
              <span>•</span>
              <span>{overview?.successRate.droppedCount ?? 0} drop</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. VISUAL CHARTS & BREAKDOWNS (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUMN 1 & 2: EARNINGS TREND AREA CHART */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[var(--border)] shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">Revenue Trajectory</h2>
              <p className="text-xs text-[var(--muted)]">
                Daily collection trends and transaction volume across the selected timeframe.
              </p>
            </div>
            {/* Metric Toggle */}
            <div className="flex items-center bg-[var(--surface-muted)] p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setChartMetric('revenue')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartMetric === 'revenue'
                    ? 'bg-[#80132E] text-white shadow-2xs font-bold'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                Revenue (₹)
              </button>
              <button
                onClick={() => setChartMetric('transactions')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartMetric === 'transactions'
                    ? 'bg-[#80132E] text-white shadow-2xs font-bold'
                    : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                Transactions Count
              </button>
            </div>
          </div>

          {/* SVG Chart Render */}
          <div className="mt-4 flex-1 min-h-[220px] flex items-center justify-center">
            {isLoadingMetrics ? (
              <div className="h-52 w-full bg-[var(--surface-muted)] rounded-xl animate-pulse" />
            ) : timeSeries.length === 0 ? (
              <div className="text-xs text-[var(--muted)] flex flex-col items-center gap-2 py-10">
                <IconReceipt className="h-8 w-8 text-slate-300" />
                <span>No revenue recorded during this period.</span>
              </div>
            ) : (
              <RevenueInteractiveChart data={timeSeries} metric={chartMetric} />
            )}
          </div>
        </div>

        {/* COLUMN 3: PLAN DISTRIBUTION & PAYMENT METHODS */}
        <div className="space-y-6">
          {/* PLAN DISTRIBUTION */}
          <div className="bg-white rounded-2xl p-5 border border-[var(--border)] shadow-xs">
            <h2 className="text-sm font-bold text-[var(--foreground)]">Revenue by Subscription Plan</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Breakdown of earnings generated per subscription tier.
            </p>

            <div className="mt-4 space-y-3.5">
              {isLoadingMetrics ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 bg-[var(--surface-muted)] rounded-xl animate-pulse" />
                ))
              ) : plans.length === 0 ? (
                <div className="text-xs text-[var(--muted)] py-4 text-center">
                  No plan sales recorded yet.
                </div>
              ) : (
                plans.map((p) => (
                  <div key={p.planCode} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-semibold text-[var(--foreground)]">
                        <span>{p.planName}</span>
                        <span className="text-[10px] text-[var(--muted)]">({p.count} sold)</span>
                      </div>
                      <div className="font-bold text-[var(--foreground)]">
                        {formatINR(p.revenue)}{' '}
                        <span className="text-[10px] font-normal text-[var(--muted)]">
                          ({p.percentage}%)
                        </span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-[var(--surface-muted)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#80132E] to-[#C23B60] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(2, p.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PAYMENT METHODS BREAKDOWN */}
          <div className="bg-white rounded-2xl p-5 border border-[var(--border)] shadow-xs">
            <h2 className="text-sm font-bold text-[var(--foreground)]">Payment Modes Used</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Gateway settlement channels chosen by members.
            </p>

            <div className="mt-3.5 grid grid-cols-2 gap-2.5">
              {isLoadingMetrics ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 bg-[var(--surface-muted)] rounded-xl animate-pulse" />
                ))
              ) : methods.length === 0 ? (
                <div className="col-span-2 text-xs text-[var(--muted)] py-4 text-center">
                  No payment methods logged.
                </div>
              ) : (
                methods.map((m) => (
                  <div
                    key={m.method}
                    className="p-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-[var(--foreground)]">
                      <span>{m.method}</span>
                      <span className="text-[10px] text-[var(--muted)]">{m.percentage}%</span>
                    </div>
                    <div className="mt-1 text-xs font-extrabold text-[var(--foreground)]">
                      {formatINR(m.revenue)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. LIVE TRANSACTIONS LEDGER (CORE AUDIT TABLE) */}
      <div className="bg-white rounded-2xl border border-[var(--border)] shadow-xs overflow-hidden">
        {/* Table Header and Filter Controls */}
        <div className="p-4 sm:p-5 border-b border-[var(--border)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">
                Live Transactions Ledger
              </h2>
              <p className="text-xs text-[var(--muted)]">
                Comprehensive audit trail of checkout orders, Cashfree gateway references, and subscription events.
              </p>
            </div>
            <div className="text-xs text-[var(--muted)] font-semibold">
              Total Records: <span className="text-[var(--foreground)] font-bold">{totalTransactions}</span>
            </div>
          </div>

          {/* Search and Dropdowns Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search Order ID, Cashfree Ref, IMC ID, Email, Customer Name..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[#80132E]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl text-xs bg-[var(--surface-muted)] border border-[var(--border)] font-medium text-[var(--foreground)] focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
              <option value="USER_DROPPED">User Dropped</option>
            </select>

            {/* Plan Filter */}
            <select
              value={planFilter}
              onChange={(e) => {
                setPlanFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl text-xs bg-[var(--surface-muted)] border border-[var(--border)] font-medium text-[var(--foreground)] focus:outline-none"
            >
              <option value="ALL">All Plans</option>
              {plans.map((p) => (
                <option key={p.planCode} value={p.planCode}>
                  {p.planName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-[#FAF3EC] border-b border-[#E9DDE0] text-[#7A1835] font-bold">
              <tr>
                <th className="p-3.5">Date &amp; Time</th>
                <th className="p-3.5">Customer / Member</th>
                <th className="p-3.5">Plan</th>
                <th className="p-3.5">Amount (INR)</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5">Gateway References</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {isLoadingLedger ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="p-4">
                      <div className="h-5 bg-[var(--surface-muted)] rounded-md animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-[var(--muted)]">
                    <div className="flex flex-col items-center gap-2">
                      <IconReceipt className="h-8 w-8 text-slate-300" />
                      <span className="font-bold text-sm text-[var(--foreground)]">No transactions found</span>
                      <span className="text-xs">No records matched your search filters or selected date range.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isSuccess = tx.status === 'SUCCESS';
                  const isFailed = tx.status === 'FAILED';
                  const isPending = tx.status === 'PENDING';

                  return (
                    <tr key={tx.id} className="hover:bg-[var(--surface-muted)] transition-colors">
                      {/* Date */}
                      <td className="p-3.5 text-[var(--foreground)] font-medium whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>

                      {/* Customer / Member */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-[var(--surface-muted)] border border-[var(--border)] flex items-center justify-center font-bold text-[#80132E] shrink-0 overflow-hidden">
                            {tx.user.avatarUrl ? (
                              <img
                                src={tx.user.avatarUrl}
                                alt={tx.user.customerName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              tx.user.customerName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-[var(--foreground)] leading-tight">
                              {tx.user.customerName}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">
                                {tx.user.profileId}
                              </span>
                              <span className="text-[11px] text-[var(--muted)]">
                                {tx.user.email !== 'N/A' ? tx.user.email : tx.user.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-semibold text-[var(--foreground)]">{tx.planName}</div>
                        <span className="font-mono text-[10px] text-[var(--muted)]">{tx.planCode}</span>
                      </td>

                      {/* Amount */}
                      <td className="p-3.5 font-extrabold text-[var(--foreground)] whitespace-nowrap">
                        {formatINRDecimals(tx.amount)}
                      </td>

                      {/* Method */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] text-[11px] font-bold text-[var(--foreground)]">
                          {tx.paymentMethod}
                        </span>
                      </td>

                      {/* Gateway References */}
                      <td className="p-3.5 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[11px] text-[var(--muted)] max-w-[130px] truncate" title={tx.orderId}>
                            {tx.orderId}
                          </span>
                          <button
                            onClick={() => handleCopy(tx.orderId, `order-${tx.id}`)}
                            title="Copy Order ID"
                            className="p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
                          >
                            {copiedId === `order-${tx.id}` ? (
                              <IconCheck className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <IconCopy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        {tx.cfPaymentId && (
                          <div className="text-[10px] font-mono text-[var(--muted)] mt-0.5 flex items-center gap-1">
                            <span className="max-w-[130px] truncate" title={tx.cfPaymentId}>
                              cf: {tx.cfPaymentId}
                            </span>
                            <button
                              onClick={() => handleCopy(tx.cfPaymentId!, `cf-${tx.id}`)}
                              title="Copy Cashfree ID"
                              className="p-0.5 text-[var(--muted)] hover:text-[var(--foreground)]"
                            >
                              {copiedId === `cf-${tx.id}` ? (
                                <IconCheck className="h-2.5 w-2.5 text-emerald-600" />
                              ) : (
                                <IconCopy className="h-2.5 w-2.5" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5 whitespace-nowrap">
                        {isSuccess && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <IconCheck className="h-3 w-3" />
                            Success
                          </span>
                        )}
                        {isFailed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <IconX className="h-3 w-3" />
                            Failed
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <IconClock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                        {!isSuccess && !isFailed && !isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {tx.status}
                          </span>
                        )}
                      </td>

                      {/* Message */}
                      <td className="p-3.5 text-[11px] text-[var(--muted)] max-w-[150px] truncate" title={tx.paymentMessage || ''}>
                        {tx.paymentMessage || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <div>
            Showing{' '}
            <span className="font-bold text-[var(--foreground)]">
              {totalTransactions === 0 ? 0 : (page - 1) * 15 + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-[var(--foreground)]">
              {Math.min(page * 15, totalTransactions)}
            </span>{' '}
            of <span className="font-bold text-[var(--foreground)]">{totalTransactions}</span> entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoadingLedger}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-[var(--foreground)] font-semibold disabled:opacity-40 hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
            >
              <IconChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <span className="px-2 font-bold text-[var(--foreground)]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoadingLedger}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-[var(--foreground)] font-semibold disabled:opacity-40 hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
            >
              <span>Next</span>
              <IconChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Interactive SVG Chart for Revenue and Transactions.
 */
function RevenueInteractiveChart({
  data,
  metric,
}: {
  data: RevenueTimeSeriesPoint[];
  metric: 'revenue' | 'transactions';
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const chartId = useId().replace(/:/g, '');

  const values = data.map((d) => (metric === 'revenue' ? d.revenue : d.transactions));
  const maxVal = Math.max(...values, 1);
  const minVal = 0;
  const range = maxVal - minVal || 1;

  const width = 680;
  const height = 210;
  const paddingX = 45;
  const paddingY = 25;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = data.map((d, i) => {
    const val = metric === 'revenue' ? d.revenue : d.transactions;
    const x = paddingX + (i / Math.max(1, data.length - 1)) * chartW;
    const y = paddingY + chartH - ((val - minVal) / range) * chartH;
    return { x, y, date: d.date, value: val, transactions: d.transactions, revenue: d.revenue };
  });

  const pathLine = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpX = (prev.x + p.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
  }, '');

  const pathArea = `${pathLine} L ${points[points.length - 1].x} ${paddingY + chartH} L ${points[0].x} ${
    paddingY + chartH
  } Z`;

  const activePoint = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="w-full relative select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={`revGrad-${chartId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#80132E" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#80132E" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = paddingY + chartH * (1 - ratio);
          const gridVal = minVal + range * ratio;
          return (
            <g key={ratio}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#F1E8E5"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingX - 8}
                y={y + 3}
                textAnchor="end"
                className="text-[9px] fill-[#8A7A78] font-mono"
              >
                {metric === 'revenue'
                  ? gridVal >= 1000
                    ? `₹${(gridVal / 1000).toFixed(0)}k`
                    : `₹${gridVal.toFixed(0)}`
                  : gridVal.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Filled Area */}
        <path d={pathArea} fill={`url(#revGrad-${chartId})`} />

        {/* Outline Stroke */}
        <path d={pathLine} fill="none" stroke="#80132E" strokeWidth="2.5" strokeLinecap="round" />

        {/* Hover trigger areas */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="12"
            fill="transparent"
            className="cursor-pointer"
            onMouseEnter={() => setHoverIndex(i)}
          />
        ))}

        {/* Active Point Highlight */}
        {activePoint && (
          <g>
            <line
              x1={activePoint.x}
              y1={paddingY}
              x2={activePoint.x}
              y2={paddingY + chartH}
              stroke="#80132E"
              strokeDasharray="3 3"
              strokeWidth="1.5"
            />
            <circle cx={activePoint.x} cy={activePoint.y} r="5" fill="#80132E" stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>

      {/* Floating Glass Tooltip */}
      {activePoint && (
        <div
          className="absolute pointer-events-none bg-slate-900/90 backdrop-blur-xs text-white p-2.5 rounded-xl text-xs shadow-xl z-20 transition-all duration-75"
          style={{
            left: `${(activePoint.x / width) * 100}%`,
            top: '0px',
            transform: 'translate(-50%, -10px)',
          }}
        >
          <div className="font-semibold text-slate-300 text-[10px]">{activePoint.date}</div>
          <div className="font-bold text-white mt-0.5">
            Revenue: <span className="text-emerald-400">{formatINR(activePoint.revenue)}</span>
          </div>
          <div className="text-[11px] text-slate-300">
            Orders: <span className="font-bold text-white">{activePoint.transactions}</span>
          </div>
        </div>
      )}
    </div>
  );
}
