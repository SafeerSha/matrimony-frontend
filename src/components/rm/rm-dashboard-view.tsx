'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  IconUsers,
  IconCalendarEvent,
  IconHeart,
  IconClock,
  IconSearch,
  IconRefresh,
  IconChevronRight,
  IconLoader2,
  IconMessages,
  IconPhone,
  IconMail,
  IconMapPin,
  IconAlertTriangle,
  IconArrowUpRight,
  IconCheck,
  IconUser,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { rmService } from '@/services/rm.service';
import type { RmAssignedClientItem, RmDashboardMetrics, ClientStage } from '@/types/rm';
import { toast } from '@/lib/toast';

interface RmDashboardViewProps {
  onSelectClient: (clientId: string) => void;
}

const STAGES: { value: ClientStage | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Stages' },
  { value: 'NEW_LEAD', label: 'New Lead' },
  { value: 'ONBOARDED', label: 'Onboarded' },
  { value: 'EXPLORING', label: 'Exploring Matches' },
  { value: 'SHORTLISTS_SENT', label: 'Shortlists Sent' },
  { value: 'MEETING_ARRANGED', label: 'Meeting Arranged' },
  { value: 'PROPOSAL_SENT', label: 'Proposal Sent' },
  { value: 'MATCHED', label: 'Matched 🎉' },
  { value: 'INACTIVE', label: 'On Hold' },
];

export function RmDashboardView({ onSelectClient }: RmDashboardViewProps) {
  const [metrics, setMetrics] = useState<RmDashboardMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Client roster state
  const [clients, setClients] = useState<RmAssignedClientItem[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);

  const fetchMetrics = useCallback(async (signal?: AbortSignal) => {
    try {
      setMetricsLoading(true);
      const data = await rmService.getDashboard(signal);
      setMetrics(data);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Failed to load RM dashboard metrics:', err);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  const fetchClients = useCallback(async (signal?: AbortSignal) => {
    try {
      setClientsLoading(true);
      const res = await rmService.getMyClients(
        {
          page,
          limit: 15,
          stage: stageFilter !== 'ALL' ? stageFilter : undefined,
          search: search || undefined,
        },
        signal
      );
      setClients(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalClients(res.meta?.total || 0);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      toast.error('Failed to load clients', err?.message || 'Could not fetch client portfolio.');
    } finally {
      setClientsLoading(false);
    }
  }, [page, stageFilter, search]);

  useEffect(() => {
    const controller = new AbortController();
    fetchMetrics(controller.signal);
    fetchClients(controller.signal);
    return () => controller.abort();
  }, [fetchMetrics, fetchClients]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
            Relationship Manager Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Track your assigned client portfolio, shortlist prospective matches, and manage follow-ups.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            fetchMetrics();
            fetchClients();
          }}
          disabled={clientsLoading || metricsLoading}
          className="self-start sm:self-auto cursor-pointer"
        >
          <IconRefresh className={`mr-1.5 h-4 w-4 ${clientsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-5 bg-white border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--muted)]">Assigned Clients</span>
            <div className="h-9 w-9 rounded-xl bg-rose-50 text-[var(--primary)] flex items-center justify-center">
              <IconUsers className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mt-2">
            {metrics?.totalAssignedClients ?? '0'}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {metrics?.activeClientsCount ?? 0} active in platform
          </p>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--muted)]">Follow-ups Today</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <IconCalendarEvent className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mt-2">
            {metrics?.pendingFollowUpsToday ?? '0'}
          </p>
          <p className="text-[11px] text-[var(--muted)] mt-1">
            {metrics?.overdueFollowUpsCount ? (
              <span className="text-rose-600 font-semibold">
                {metrics.overdueFollowUpsCount} overdue
              </span>
            ) : (
              'All on schedule'
            )}
          </p>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--muted)]">Shortlists Sent</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <IconHeart className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mt-2">
            {metrics?.totalShortlistsCount ?? '0'}
          </p>
          <p className="text-[11px] text-purple-600 font-medium mt-1">Curated match proposals</p>
        </Card>

        <Card className="p-4 sm:p-5 bg-white border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--muted)]">Interactions Logged</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <IconMessages className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mt-2">
            {metrics?.totalInteractionsCount ?? '0'}
          </p>
          <p className="text-[11px] text-blue-600 font-medium mt-1">Calls, meetings &amp; notes</p>
        </Card>
      </div>

      {/* Stage Progression Quick Pills */}
      {metrics?.stageBreakdown && (
        <Card className="p-4 bg-white border-[var(--border)] shadow-xs space-y-2">
          <span className="text-xs font-bold text-stone-700 block">
            Client Progression Stages (Click to filter):
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {STAGES.map((st) => {
              const count =
                st.value === 'ALL'
                  ? metrics.totalAssignedClients
                  : metrics.stageBreakdown[st.value] ?? 0;
              const isSelected = stageFilter === st.value;

              return (
                <button
                  key={st.value}
                  onClick={() => {
                    setStageFilter(st.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[var(--primary)] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <span>{st.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-800'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Client Roster Search & Filter Controls */}
      <Card className="p-4 bg-white border-[var(--border)] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-sm sm:text-base text-[var(--foreground)]">
            My Assigned Clients ({totalClients})
          </h3>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search name, phone, email, profile ID…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--primary)] text-[var(--foreground)]"
              />
            </div>
            <Button type="submit" size="sm" variant="secondary" className="text-xs">
              Search
            </Button>
          </form>
        </div>
      </Card>

      {/* Client Roster Cards / Table */}
      {clientsLoading ? (
        <Card className="p-12 text-center bg-white border-[var(--border)]">
          <IconLoader2 className="h-6 w-6 animate-spin text-[var(--primary)] mx-auto mb-2" />
          <p className="text-xs text-[var(--muted)]">Loading client roster…</p>
        </Card>
      ) : clients.length === 0 ? (
        <Card className="p-12 text-center bg-white border-[var(--border)]">
          <div className="h-12 w-12 rounded-2xl bg-stone-100 text-stone-500 grid place-items-center mx-auto mb-3">
            <IconUsers className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-[var(--foreground)]">No Clients Found</h3>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
            {stageFilter !== 'ALL'
              ? `No clients currently in stage "${stageFilter.replace(/_/g, ' ')}".`
              : 'You do not have any assigned clients in your portfolio yet. An administrator can assign VIP clients to you in the Admin Portal.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {clients.map((client) => {
            const nextFollowUpDate = client.nextFollowUp?.scheduledAt
              ? new Date(client.nextFollowUp.scheduledAt)
              : null;
            const isFollowUpOverdue = nextFollowUpDate ? nextFollowUpDate < new Date() : false;

            return (
              <Card
                key={client.id}
                className="p-4 sm:p-5 bg-white border-[var(--border)] hover:border-stone-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Avatar & Identity */}
                <div className="flex items-start gap-4">
                  <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    {client.photos?.[0]?.url ? (
                      <img
                        src={client.photos[0].url}
                        alt="Client avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-stone-400">
                        <IconUser className="h-7 w-7" />
                      </div>
                    )}
                    {client.isOnline && (
                      <span
                        className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white"
                        title="Active now"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-[var(--foreground)]">
                        {client.firstName} {client.lastName || ''}
                      </h4>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-stone-100 font-semibold text-stone-700">
                        {client.profileId || 'N/A'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-100">
                        {client.clientStage || 'NEW_LEAD'}
                      </span>
                      <Badge tone={client.subscriptionTier === 'PAID' ? 'success' : 'default'} size="sm">
                        {client.subscriptionTier || 'BASIC'}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[var(--muted)]">
                      {client.phone && (
                        <span className="flex items-center gap-1 text-stone-800 font-medium">
                          <IconPhone className="h-3 w-3 text-emerald-600" /> {client.phone}
                        </span>
                      )}
                      {client.email && (
                        <span className="flex items-center gap-1">
                          <IconMail className="h-3 w-3" /> {client.email}
                        </span>
                      )}
                      {(client.profile?.city || client.profile?.state) && (
                        <span className="flex items-center gap-1">
                          <IconMapPin className="h-3 w-3" /> {client.profile.city || client.profile.state}
                        </span>
                      )}
                    </div>

                    {/* Quick activity stats */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs">
                      <span className="text-stone-600">
                        Shortlisted: <strong>{client.shortlistCount ?? 0} matches</strong>
                      </span>
                      {client.lastInteraction ? (
                        <span className="text-stone-500">
                          Last talk: {new Date(client.lastInteraction.interactionAt).toLocaleDateString()} (
                          {client.lastInteraction.channel})
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">No interaction logged yet</span>
                      )}
                      {client.nextFollowUp && (
                        <span
                          className={`flex items-center gap-1 font-semibold ${
                            isFollowUpOverdue ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          <IconClock className="h-3 w-3" />
                          Follow-up: {nextFollowUpDate?.toLocaleDateString()}
                          {isFollowUpOverdue && ' (Overdue)'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Workspace Access Button */}
                <div className="shrink-0 self-end md:self-center">
                  <Button
                    onClick={() => onSelectClient(client.id)}
                    className="bg-[var(--primary)] text-white hover:bg-[#5E142E] text-xs font-semibold cursor-pointer"
                  >
                    Open Workspace <IconArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
