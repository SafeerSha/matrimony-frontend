'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  IconBug,
  IconBulb,
  IconMessageCircle,
  IconStarFilled,
  IconSearch,
  IconRefresh,
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight,
  IconEdit,
  IconUser,
  IconLoader2,
  IconCheck,
  IconX,
  IconClock,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Avatar } from '@/components/ui/avatar';
import { ModernSelect, type ModernSelectOption } from '@/components/ui/modern-select';
import { rmService } from '@/services/rm.service';
import { toast } from '@/lib/toast';
import type {
  RmFeedbackItem,
  RmFeedbackPriority,
  RmFeedbackStats,
  RmFeedbackStatus,
  RmFeedbackType,
} from '@/types/rm';

interface RmFeedbackTrackerProps {
  onOpenCountChange?: (openCount: number) => void;
  onViewUserProfile?: (userId: string) => void;
}

const STATUS_FILTER_OPTIONS: ModernSelectOption[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'REVIEWED', label: 'Reviewed' },
  { value: 'PLANNED', label: 'Planned' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'ACTIONED', label: 'Actioned' },
  { value: 'DISMISSED', label: 'Dismissed' },
];

const TRIAGE_STATUS_OPTIONS: ModernSelectOption[] = STATUS_FILTER_OPTIONS.filter(
  (o) => o.value !== 'ALL',
);

const PRIORITY_FILTER_OPTIONS: ModernSelectOption[] = [
  { value: 'ALL', label: 'All Priorities' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const TRIAGE_PRIORITY_OPTIONS: ModernSelectOption[] = PRIORITY_FILTER_OPTIONS.filter(
  (o) => o.value !== 'ALL',
);

const RATING_FILTER_OPTIONS: ModernSelectOption[] = [
  { value: 'ALL', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' },
];

function renderTypeBadge(type: string) {
  if (type === 'bug') {
    return (
      <Badge tone="default" size="sm" className="bg-rose-100 text-rose-800 border-rose-200 font-semibold gap-1">
        <IconBug className="h-3 w-3" />
        Bug Report
      </Badge>
    );
  }
  if (type === 'feature') {
    return (
      <Badge tone="default" size="sm" className="bg-amber-100 text-amber-900 border-amber-200 font-semibold gap-1">
        <IconBulb className="h-3 w-3" />
        Feature Idea
      </Badge>
    );
  }
  return (
    <Badge tone="default" size="sm" className="bg-slate-100 text-slate-700 border-slate-200 font-semibold gap-1">
      <IconMessageCircle className="h-3 w-3" />
      General
    </Badge>
  );
}

function renderStatusBadge(status: string) {
  switch (status) {
    case 'RESOLVED':
    case 'ACTIONED':
      return (
        <Badge tone="accent" size="sm" className="bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold">
          {status}
        </Badge>
      );
    case 'IN_REVIEW':
    case 'REVIEWED':
    case 'PLANNED':
      return (
        <Badge tone="default" size="sm" className="bg-sky-100 text-sky-800 border-sky-200 font-semibold">
          {status.replace('_', ' ')}
        </Badge>
      );
    case 'DISMISSED':
      return (
        <Badge tone="default" size="sm" className="bg-slate-100 text-slate-600 border-slate-200 font-semibold">
          Dismissed
        </Badge>
      );
    default:
      return (
        <Badge tone="default" size="sm" className="bg-amber-100 text-amber-800 border-amber-200 font-semibold">
          Submitted
        </Badge>
      );
  }
}

function renderPriorityBadge(priority: string) {
  switch (priority) {
    case 'CRITICAL':
      return (
        <Badge tone="default" size="sm" className="bg-red-100 text-red-800 border-red-300 font-bold">
          Critical
        </Badge>
      );
    case 'HIGH':
      return (
        <Badge tone="default" size="sm" className="bg-orange-100 text-orange-800 border-orange-200 font-semibold">
          High
        </Badge>
      );
    case 'LOW':
      return (
        <Badge tone="default" size="sm" className="bg-slate-100 text-slate-600 border-slate-200">
          Low
        </Badge>
      );
    default:
      return (
        <Badge tone="default" size="sm" className="bg-[#FAF3EC] text-[#80132E] border-[#EAD8C7]">
          Medium
        </Badge>
      );
  }
}

export function RmFeedbackTracker({ onOpenCountChange, onViewUserProfile }: RmFeedbackTrackerProps) {
  const [items, setItems] = useState<RmFeedbackItem[]>([]);
  const [stats, setStats] = useState<RmFeedbackStats | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<RmFeedbackType>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | RmFeedbackStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | RmFeedbackPriority>('ALL');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [triageItem, setTriageItem] = useState<RmFeedbackItem | null>(null);
  const [draftStatus, setDraftStatus] = useState<RmFeedbackStatus>('SUBMITTED');
  const [draftPriority, setDraftPriority] = useState<RmFeedbackPriority>('MEDIUM');
  const [draftNotes, setDraftNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchStats = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const res = await rmService.getFeedbackStats(signal);
        setStats(res);
        onOpenCountChange?.(res.openCount);
      } catch {
        // Non-fatal
      }
    },
    [onOpenCountChange],
  );

  const fetchFeedback = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await rmService.getFeedback(
        {
          page,
          limit: 15,
          type: typeFilter,
          status: statusFilter,
          priority: priorityFilter,
          rating: ratingFilter !== 'ALL' ? Number(ratingFilter) : undefined,
          search: search.trim() || undefined,
        },
        controller.signal,
      );
      setItems(res.data || []);
      setTotalCount(res.meta?.total ?? 0);
      setTotalPages(Math.max(1, res.meta?.totalPages ?? 1));
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      setError(err?.message || 'Unable to load feedback and issue reports.');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, statusFilter, priorityFilter, ratingFilter, search]);

  useEffect(() => {
    const controller = new AbortController();
    fetchStats(controller.signal);
    return () => controller.abort();
  }, [fetchStats]);

  useEffect(() => {
    fetchFeedback();
    return () => abortRef.current?.abort();
  }, [fetchFeedback]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setPage(1), 400);
  };

  const openTriageModal = (item: RmFeedbackItem) => {
    setTriageItem(item);
    setDraftStatus((item.status as RmFeedbackStatus) || 'SUBMITTED');
    setDraftPriority((item.priority as RmFeedbackPriority) || 'MEDIUM');
    setDraftNotes(item.rmNotes || '');
  };

  const handleSaveTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!triageItem) return;

    setIsSaving(true);
    try {
      const updated = await rmService.updateFeedback(triageItem.id, {
        status: draftStatus,
        priority: draftPriority,
        rmNotes: draftNotes,
      });
      setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
      setTriageItem(null);
      toast.success('Feedback Updated', 'Issue status and RM triage notes saved.');
      fetchStats();
    } catch (err: any) {
      toast.error('Update Failed', err?.message || 'Could not update feedback record.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetFilters = () => {
    setTypeFilter('ALL');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setRatingFilter('ALL');
    setSearch('');
    setPage(1);
  };

  const hasActiveFilters =
    typeFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    ratingFilter !== 'ALL' ||
    search.trim() !== '';

  const typeTabs: { id: RmFeedbackType; label: string; count?: number; icon: any }[] = [
    { id: 'ALL', label: 'All Submissions', count: stats?.total, icon: IconMessageCircle },
    { id: 'bug', label: 'Bug Reports', count: stats?.byType?.bug, icon: IconBug },
    { id: 'feature', label: 'Feature Suggestions', count: stats?.byType?.feature, icon: IconBulb },
    { id: 'general', label: 'General Feedback', count: stats?.byType?.general, icon: IconStarFilled },
  ];

  return (
    <>
      {/* Triage Modal */}
      <Modal
        isOpen={Boolean(triageItem)}
        onClose={() => !isSaving && setTriageItem(null)}
        size="md"
        title="Triage Feedback / Issue"
        description="Update workflow status, priority, and internal RM resolution notes."
      >
        {triageItem && (
          <form onSubmit={handleSaveTriage} className="space-y-4">
            <div className="rounded-2xl bg-[var(--surface-muted)]/70 border border-[var(--border)] p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {renderTypeBadge(triageItem.type)}
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                  <IconStarFilled className="h-3.5 w-3.5" />
                  <span>{triageItem.rating} / 5</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
                {triageItem.message}
              </p>
              <div className="text-[11px] text-[var(--muted)] pt-1 border-t border-[var(--border)]">
                Submitted {new Date(triageItem.createdAt).toLocaleString()}
                {triageItem.user && (
                  <>
                    {' '}
                    by{' '}
                    <span className="font-semibold text-[var(--foreground)]">
                      {[triageItem.user.firstName, triageItem.user.lastName].filter(Boolean).join(' ') ||
                        triageItem.user.email ||
                        triageItem.user.profileId}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--muted-strong)] mb-1.5">
                  Status
                </label>
                <ModernSelect
                  value={draftStatus}
                  onChange={(val) => setDraftStatus(val as RmFeedbackStatus)}
                  options={TRIAGE_STATUS_OPTIONS}
                  size="sm"
                  ariaLabel="Triage status"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--muted-strong)] mb-1.5">
                  Priority
                </label>
                <ModernSelect
                  value={draftPriority}
                  onChange={(val) => setDraftPriority(val as RmFeedbackPriority)}
                  options={TRIAGE_PRIORITY_OPTIONS}
                  size="sm"
                  ariaLabel="Triage priority"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="rm-triage-notes"
                className="block text-xs font-bold text-[var(--muted-strong)] mb-1.5"
              >
                Internal RM Notes
              </label>
              <textarea
                id="rm-triage-notes"
                rows={4}
                maxLength={2000}
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                placeholder="Add follow-up context, reproduction details, or resolution summary…"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-xs sm:text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSaving}
                onClick={() => setTriageItem(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSaving} className="gap-1.5">
                {isSaving ? (
                  <>
                    <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <IconCheck className="h-3.5 w-3.5" />
                    Save Triage
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
              Feedback & Issue Tracking
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
              Monitor user feedback, feature suggestions, and bug reports across the platform.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchFeedback();
              fetchStats();
            }}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-1.5 shrink-0"
          >
            <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="text-left rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4 shadow-xs hover:border-[var(--primary)]/40 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="block text-xs font-semibold text-[var(--muted-strong)] truncate">
                  Total Submissions
                </span>
                <p className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tabular-nums mt-1">
                  {stats?.total ?? '—'}
                </p>
                <span className="block text-[11px] text-[var(--muted)] mt-0.5">All categories</span>
              </div>
              <span className="h-8 w-8 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] grid place-items-center shrink-0">
                <IconMessageCircle className="h-4 w-4" />
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setTypeFilter('bug');
              setStatusFilter('SUBMITTED');
              setPage(1);
            }}
            className="text-left rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4 shadow-xs hover:border-amber-400/70 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="block text-xs font-semibold text-[var(--muted-strong)] truncate">
                  Open / Pending Bugs
                </span>
                <p className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tabular-nums mt-1">
                  {stats?.openCount ?? '—'}
                </p>
                <span className="block text-[11px] text-[var(--muted)] mt-0.5">Submitted or in review</span>
              </div>
              <span className="h-8 w-8 rounded-xl bg-amber-100 text-amber-800 grid place-items-center shrink-0">
                <IconAlertCircle className="h-4 w-4" />
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setTypeFilter('bug');
              setStatusFilter('ALL');
              setPage(1);
            }}
            className="text-left rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4 shadow-xs hover:border-rose-300 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="block text-xs font-semibold text-[var(--muted-strong)] truncate">
                  Bug Reports
                </span>
                <p className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tabular-nums mt-1">
                  {stats?.byType?.bug ?? '—'}
                </p>
                <span className="block text-[11px] text-[var(--muted)] mt-0.5">All bug tickets</span>
              </div>
              <span className="h-8 w-8 rounded-xl bg-rose-100 text-rose-700 grid place-items-center shrink-0">
                <IconBug className="h-4 w-4" />
              </span>
            </div>
          </button>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3.5 sm:p-4 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="block text-xs font-semibold text-[var(--muted-strong)] truncate">
                  Average Rating
                </span>
                <p className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tabular-nums mt-1">
                  {stats ? (
                    <>
                      {stats.averageRating.toFixed(1)}
                      <span className="text-xs sm:text-sm font-semibold text-[var(--muted)] ml-1">/ 5</span>
                    </>
                  ) : (
                    '—'
                  )}
                </p>
                <span className="block text-[11px] text-[var(--muted)] mt-0.5">Across rated entries</span>
              </div>
              <span className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center shrink-0">
                <IconStarFilled className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Unified Category Tabs + Search & Filter Toolbar */}
        <Card className="relative z-10 border border-[var(--border)] shadow-xs bg-[var(--surface)] overflow-visible">
          <div className="px-3.5 py-2.5 sm:px-4 border-b border-[var(--border)] bg-[var(--surface-muted)]/35 flex flex-wrap items-center justify-between gap-2 rounded-t-2xl">
            <div className="flex flex-wrap items-center gap-1.5">
              {typeTabs.map((t) => {
                const Icon = t.icon;
                const active = typeFilter === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTypeFilter(t.id);
                      setPage(1);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                        : 'bg-[var(--surface)] text-[var(--muted-strong)] border-[var(--border)] hover:border-[var(--primary)]/50 hover:text-[var(--foreground)]'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{t.label}</span>
                    {typeof t.count === 'number' && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none tabular-nums ${
                          active ? 'bg-white/20 text-white' : 'bg-[var(--surface-muted)] text-[var(--muted-strong)]'
                        }`}
                      >
                        {t.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary-light)]/50 transition-colors cursor-pointer"
              >
                <IconX className="h-3.5 w-3.5" />
                Clear filters
              </button>
            )}
          </div>

          <div className="p-3.5 sm:p-4 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            <div className="relative md:col-span-6">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)] pointer-events-none" />
              <input
                type="search"
                placeholder="Search message, RM notes, user name, email, or profile ID…"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                maxLength={100}
                className="w-full h-10 pl-9 pr-8 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--primary)] transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer p-0.5"
                >
                  <IconX className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="md:col-span-2">
              <ModernSelect
                value={statusFilter}
                onChange={(val) => {
                  setStatusFilter(val as 'ALL' | RmFeedbackStatus);
                  setPage(1);
                }}
                options={STATUS_FILTER_OPTIONS}
                size="sm"
                ariaLabel="Filter by status"
              />
            </div>

            <div className="md:col-span-2">
              <ModernSelect
                value={priorityFilter}
                onChange={(val) => {
                  setPriorityFilter(val as 'ALL' | RmFeedbackPriority);
                  setPage(1);
                }}
                options={PRIORITY_FILTER_OPTIONS}
                size="sm"
                ariaLabel="Filter by priority"
              />
            </div>

            <div className="md:col-span-2">
              <ModernSelect
                value={ratingFilter}
                onChange={(val) => {
                  setRatingFilter(val);
                  setPage(1);
                }}
                options={RATING_FILTER_OPTIONS}
                size="sm"
                ariaLabel="Filter by rating"
              />
            </div>
          </div>
        </Card>

        {/* Feedback List */}
        <Card className="border border-[var(--border)] overflow-hidden shadow-xs bg-[var(--surface)]">
          {error ? (
            <div className="p-8 text-center space-y-3" role="alert">
              <IconAlertCircle className="h-9 w-9 text-rose-500 mx-auto" />
              <h3 className="text-sm font-bold text-[var(--foreground)]">Error loading feedback</h3>
              <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">{error}</p>
              <Button size="sm" variant="outline" onClick={fetchFeedback}>
                Try Again
              </Button>
            </div>
          ) : loading ? (
            <div className="p-10 text-center space-y-2.5">
              <div className="h-6 w-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[var(--muted)]">Loading submissions…</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center space-y-2.5">
              <IconMessageCircle className="h-9 w-9 text-[var(--muted)] mx-auto opacity-50" />
              <h3 className="text-sm sm:text-base font-bold text-[var(--foreground)]">No feedback records</h3>
              <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                No bug reports, feature ideas, or reviews match the selected filters.
              </p>
              {hasActiveFilters && (
                <Button size="sm" variant="outline" onClick={resetFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="px-4 py-2.5 sm:px-5 border-b border-[var(--border)] bg-[var(--surface-muted)]/30 flex items-center justify-between text-[11px] font-medium text-[var(--muted)]">
                <span>
                  Showing <strong className="text-[var(--foreground)]">{items.length}</strong> of{' '}
                  <strong className="text-[var(--foreground)]">{totalCount}</strong>{' '}
                  {totalCount === 1 ? 'submission' : 'submissions'}
                </span>
                <span>
                  Page <strong className="text-[var(--foreground)]">{page}</strong> / {totalPages}
                </span>
              </div>

              <div className="divide-y divide-[var(--border)]">
                {items.map((item) => {
                  const submitterName = item.user
                    ? [item.user.firstName, item.user.lastName].filter(Boolean).join(' ').trim() ||
                      item.user.email?.split('@')[0] ||
                      item.user.phone ||
                      'Member'
                    : 'Anonymous Visitor';

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:px-5 sm:py-4 hover:bg-[var(--surface-muted)]/35 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {renderTypeBadge(item.type)}
                          {renderStatusBadge(item.status)}
                          {renderPriorityBadge(item.priority)}
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full tabular-nums">
                            <IconStarFilled className="h-3 w-3 text-amber-500" />
                            {item.rating}/5
                          </span>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] tabular-nums">
                            <IconClock className="h-3 w-3 opacity-70" />
                            {new Date(item.createdAt).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => openTriageModal(item)}
                            className="font-semibold gap-1"
                          >
                            <IconEdit className="h-3.5 w-3.5" />
                            Triage
                          </Button>
                        </div>
                      </div>

                      <p className="mt-2.5 text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                        {item.message}
                      </p>

                      {item.rmNotes && (
                        <div className="mt-2.5 rounded-xl bg-[#FAF3EC] border border-[#EAD8C7] px-3 py-2 text-xs text-[#5C0D24]">
                          <span className="font-bold">Internal RM Notes: </span>
                          <span className="whitespace-pre-wrap">{item.rmNotes}</span>
                        </div>
                      )}

                      <div className="mt-3 pt-2.5 border-t border-[var(--border)]/60 flex flex-wrap items-center justify-between gap-2">
                        {item.user ? (
                          <>
                            <div className="flex items-center gap-2 min-w-0">
                              <Avatar
                                src={item.user.photos?.[0]?.url || ''}
                                name={submitterName}
                                size="sm"
                                className="border border-[var(--border)] shrink-0"
                              />
                              <span className="font-semibold text-xs text-[var(--foreground)] truncate">
                                {submitterName}
                              </span>
                              {item.user.profileId && (
                                <span className="px-1.5 py-0.5 rounded bg-[var(--surface-muted)] font-mono text-[11px] text-[var(--muted-strong)] shrink-0">
                                  {item.user.profileId}
                                </span>
                              )}
                            </div>

                            {onViewUserProfile ? (
                              <button
                                type="button"
                                onClick={() => onViewUserProfile(item.user!.id)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/50 hover:text-[var(--primary)] text-[11px] font-semibold text-[var(--foreground)] transition-colors cursor-pointer"
                              >
                                <IconUser className="h-3 w-3" />
                                View Profile
                              </button>
                            ) : (
                              <Link
                                href={`/rm/users/${item.user.id}`}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/50 hover:text-[var(--primary)] text-[11px] font-semibold text-[var(--foreground)] transition-colors"
                              >
                                <IconUser className="h-3 w-3" />
                                View Profile
                              </Link>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-[var(--muted)]">Anonymous submission</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-4 py-3 sm:px-5 border-t border-[var(--border)] bg-[var(--surface-muted)]/35 text-xs">
                <span className="text-[var(--muted)]">
                  Page <strong className="text-[var(--foreground)]">{page}</strong> of{' '}
                  <strong className="text-[var(--foreground)]">{totalPages}</strong> ({totalCount}{' '}
                  {totalCount === 1 ? 'item' : 'items'})
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <IconChevronLeft className="h-3.5 w-3.5" />
                    Prev
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={page >= totalPages || loading}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                    <IconChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}

