'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  IconSearch,
  IconMapPin,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconCrown,
  IconAlertCircle,
  IconMail,
  IconPhone,
  IconId,
  IconEye,
  IconUsers,
  IconHeartHandshake,
  IconHomeHeart,
  IconCheck,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { ModernSelect, type ModernSelectOption } from '@/components/ui/modern-select';
import { RmUserDetailModal } from '@/components/rm/rm-user-detail-modal';
import { rmService } from '@/services/rm.service';
import { chatService } from '@/services/chat.service';
import type {
  RmUserCategory,
  RmUserGender,
  RmUserListItem,
  RmUserPlan,
  RmUserStats,
  RmUserStatus,
  RmUserVerified,
} from '@/types/rm';

const PLAN_OPTIONS: ModernSelectOption[] = [
  { value: 'ALL', label: 'All Plans' },
  { value: 'PAID', label: 'Paid Permit' },
  { value: 'BASIC', label: 'Basic (Free)' },
];

const STATUS_OPTIONS: ModernSelectOption[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'DEACTIVATED', label: 'Deactivated' },
  { value: 'BLOCKED', label: 'Blocked' },
  { value: 'DELETED', label: 'Deleted' },
];

const VERIFIED_OPTIONS: ModernSelectOption[] = [
  { value: 'ALL', label: 'All Verification' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'UNVERIFIED', label: 'Unverified' },
];

const GENDER_OPTIONS: ModernSelectOption[] = [
  { value: 'ALL', label: 'All Genders' },
  { value: 'Female', label: 'Female' },
  { value: 'Male', label: 'Male' },
  { value: 'Other', label: 'Other' },
];

function renderStatusBadge(u: RmUserListItem) {
  if (u.isBanned) {
    return (
      <Badge tone="default" size="sm" className="bg-red-100 text-red-800 border-red-200 font-semibold">
        Blocked
      </Badge>
    );
  }
  if (u.status === 'ACTIVE') {
    return (
      <Badge tone="accent" size="sm" className="bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold">
        Active
      </Badge>
    );
  }
  if (u.status === 'DEACTIVATED') {
    return (
      <Badge tone="default" size="sm" className="bg-slate-100 text-slate-700 border-slate-200 font-semibold">
        Deactivated
      </Badge>
    );
  }
  if (u.status === 'DELETED') {
    return (
      <Badge tone="default" size="sm" className="bg-rose-100 text-rose-800 border-rose-200 font-semibold">
        Deleted
      </Badge>
    );
  }
  return (
    <Badge tone="default" size="sm" className="bg-amber-100 text-amber-800 border-amber-200 font-semibold">
      {u.status || 'Draft'}
    </Badge>
  );
}

export function RmUserDirectory() {
  const [users, setUsers] = useState<RmUserListItem[]>([]);
  const [stats, setStats] = useState<RmUserStats | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<RmUserCategory>('ALL');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [plan, setPlan] = useState<RmUserPlan>('ALL');
  const [status, setStatus] = useState<RmUserStatus>('ALL');
  const [verified, setVerified] = useState<RmUserVerified>('ALL');
  const [gender, setGender] = useState<RmUserGender>('ALL');
  const [page, setPage] = useState(1);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [livePresence, setLivePresence] = useState<Record<string, boolean>>({});

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const cleanup = chatService.onPresence((data) => {
      setLivePresence((prev) => ({
        ...prev,
        [data.userId]: Boolean(data.isOnline),
      }));
    });
    return cleanup;
  }, []);

  const fetchStats = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await rmService.getUserStats(signal);
      setStats(res);
    } catch {
      // Non-fatal: table still works without summary pills
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await rmService.getUsers(
        {
          page,
          limit: 15,
          search: search.trim() || undefined,
          location: location.trim() || undefined,
          category,
          plan,
          status,
          verified,
          gender,
        },
        controller.signal,
      );
      setUsers(res.data || []);
      setTotalCount(res.meta?.total ?? 0);
      setTotalPages(Math.max(1, res.meta?.totalPages ?? 1));
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      setError(err?.message || 'Unable to load RM user directory.');
    } finally {
      setLoading(false);
    }
  }, [page, search, location, category, plan, status, verified, gender]);

  useEffect(() => {
    const controller = new AbortController();
    fetchStats(controller.signal);
    return () => controller.abort();
  }, [fetchStats]);

  useEffect(() => {
    fetchUsers();
    return () => abortRef.current?.abort();
  }, [fetchUsers]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setPage(1), 400);
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    if (locationTimerRef.current) clearTimeout(locationTimerRef.current);
    locationTimerRef.current = setTimeout(() => setPage(1), 400);
  };

  const resetFilters = () => {
    setCategory('ALL');
    setSearch('');
    setLocation('');
    setPlan('ALL');
    setStatus('ALL');
    setVerified('ALL');
    setGender('ALL');
    setPage(1);
  };

  const hasActiveFilters =
    category !== 'ALL' ||
    search.trim() !== '' ||
    location.trim() !== '' ||
    plan !== 'ALL' ||
    status !== 'ALL' ||
    verified !== 'ALL' ||
    gender !== 'ALL';

  const categoryTabs: { id: RmUserCategory; label: string; count?: number; icon: any }[] = [
    { id: 'ALL', label: 'All Users', count: stats?.total, icon: IconUsers },
    { id: 'Marriage', label: 'Marriage', count: stats?.categories?.Marriage, icon: IconHeartHandshake },
    { id: 'Friendship', label: 'Friendship', count: stats?.categories?.Friendship, icon: IconUsers },
    { id: 'Live-In', label: 'Live-In', count: stats?.categories?.['Live-In'], icon: IconHomeHeart },
  ];

  return (
    <>
      <RmUserDetailModal
        userId={selectedUserId}
        isOpen={Boolean(selectedUserId)}
        onClose={() => setSelectedUserId(null)}
      />

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
              User Directory
            </h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Categorized member directory with read-only access to complete profiles and metadata.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="default" size="md" className="px-3 py-1 font-semibold text-xs">
              {totalCount} Matching
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchUsers();
                fetchStats();
              }}
              disabled={loading}
              aria-label="Refresh user directory"
              className="flex items-center gap-1.5"
            >
              <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon;
            const active = category === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setCategory(tab.id);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  active
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-sm'
                    : 'bg-[var(--surface)] text-[var(--muted-strong)] border-[var(--border)] hover:border-[var(--primary)]/50 hover:text-[var(--foreground)]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-[var(--surface-muted)] text-[var(--muted-strong)]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="relative z-10 p-4 sm:p-5 border border-[var(--border)] shadow-xs bg-[var(--surface)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <div className="relative xl:col-span-2">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
              <input
                type="search"
                placeholder="Search name, email, phone, ID…"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                maxLength={100}
                className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            <div className="relative">
              <IconMapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
              <input
                type="search"
                placeholder="City, state, country…"
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
                maxLength={100}
                className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--primary)] transition-colors"
              />
            </div>

            <ModernSelect
              value={plan}
              onChange={(val) => {
                setPlan(val as RmUserPlan);
                setPage(1);
              }}
              options={PLAN_OPTIONS}
              size="sm"
              ariaLabel="Filter by plan"
              triggerClassName="border-[var(--border)] bg-[var(--background)] text-xs sm:text-sm font-medium"
            />

            <ModernSelect
              value={status}
              onChange={(val) => {
                setStatus(val as RmUserStatus);
                setPage(1);
              }}
              options={STATUS_OPTIONS}
              size="sm"
              ariaLabel="Filter by status"
              triggerClassName="border-[var(--border)] bg-[var(--background)] text-xs sm:text-sm font-medium"
            />

            <div className="grid grid-cols-2 gap-2">
              <ModernSelect
                value={verified}
                onChange={(val) => {
                  setVerified(val as RmUserVerified);
                  setPage(1);
                }}
                options={VERIFIED_OPTIONS}
                size="sm"
                ariaLabel="Filter by verification"
                triggerClassName="border-[var(--border)] bg-[var(--background)] text-xs font-medium"
              />
              <ModernSelect
                value={gender}
                onChange={(val) => {
                  setGender(val as RmUserGender);
                  setPage(1);
                }}
                options={GENDER_OPTIONS}
                size="sm"
                ariaLabel="Filter by gender"
                triggerClassName="border-[var(--border)] bg-[var(--background)] text-xs font-medium"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
              <span className="text-[var(--muted)]">Filters active</span>
              <button
                type="button"
                onClick={resetFilters}
                className="text-[var(--primary)] font-semibold hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </Card>

        {/* Directory Table & Cards */}
        <Card className="border border-[var(--border)] overflow-hidden shadow-xs bg-[var(--surface)]">
          {error ? (
            <div className="p-8 text-center space-y-3" role="alert">
              <IconAlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
              <h3 className="text-sm font-bold text-[var(--foreground)]">Error loading users</h3>
              <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">{error}</p>
              <Button size="sm" variant="outline" onClick={fetchUsers}>
                Try Again
              </Button>
            </div>
          ) : loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="h-7 w-7 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[var(--muted)]">Loading member directory…</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <IconSearch className="h-10 w-10 text-[var(--muted)] mx-auto opacity-50" />
              <h3 className="text-base font-bold text-[var(--foreground)]">No users found</h3>
              <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                No accounts match the selected category and filter criteria.
              </p>
              {hasActiveFilters && (
                <Button size="sm" variant="outline" onClick={resetFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Cards (< md) */}
              <div className="block md:hidden divide-y divide-[var(--border)]">
                {users.map((u) => {
                  const displayName =
                    [u.firstName ?? u.profile?.firstName, u.lastName ?? u.profile?.lastName]
                      .filter(Boolean)
                      .join(' ')
                      .trim() ||
                    u.email?.split('@')[0] ||
                    u.phone ||
                    'Unnamed User';
                  const locationText =
                    [u.profile?.city, u.profile?.state, u.profile?.country]
                      .filter(Boolean)
                      .join(', ') || 'Not specified';
                  const isOnline = livePresence[u.id] ?? u.isOnline ?? false;
                  const catLabel = u.profile?.category || u.profile?.profileFor || 'Marriage';

                  return (
                    <div key={u.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar
                            src={u.photos?.[0]?.url ?? ''}
                            name={displayName}
                            size="md"
                            online={isOnline}
                            className="border border-[var(--border)] shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm text-[var(--foreground)] truncate">
                                {displayName}
                              </span>
                              <Badge tone="default" size="sm" className="bg-[#FAF3EC] text-[#80132E] border-[#EAD8C7] text-[10px] py-0 px-1.5">
                                {catLabel}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-[var(--muted)] mt-0.5 font-mono">
                              <IconId className="h-3 w-3 shrink-0" />
                              <span>{u.profileId ?? u.id.slice(0, 8)}</span>
                            </div>
                          </div>
                        </div>
                        {renderStatusBadge(u)}
                      </div>

                      <div className="space-y-1 text-xs bg-[var(--surface-muted)]/70 rounded-xl p-3 border border-[var(--border)]">
                        {u.email && (
                          <div className="flex items-center gap-1.5 text-[var(--foreground)] truncate">
                            <IconMail className="h-3.5 w-3.5 text-[var(--muted)] shrink-0" />
                            <span className="truncate">{u.email}</span>
                          </div>
                        )}
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-[var(--muted-strong)]">
                            <IconPhone className="h-3.5 w-3.5 text-[var(--muted)] shrink-0" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[var(--muted)] truncate">
                          <IconMapPin className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" />
                          <span className="truncate">{locationText}</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedUserId(u.id)}
                        className="w-full text-xs font-bold gap-1.5"
                      >
                        <IconEye className="h-3.5 w-3.5" />
                        View Full Profile
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted-strong)] font-semibold">
                      <th className="p-3.5 sm:p-4">User / Profile</th>
                      <th className="p-3.5 sm:p-4">Category</th>
                      <th className="p-3.5 sm:p-4">Contact</th>
                      <th className="p-3.5 sm:p-4">Location</th>
                      <th className="p-3.5 sm:p-4">Plan</th>
                      <th className="p-3.5 sm:p-4">Status</th>
                      <th className="p-3.5 sm:p-4 text-right">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {users.map((u) => {
                      const displayName =
                        [u.firstName ?? u.profile?.firstName, u.lastName ?? u.profile?.lastName]
                          .filter(Boolean)
                          .join(' ')
                          .trim() ||
                        u.email?.split('@')[0] ||
                        u.phone ||
                        'Unnamed User';
                      const locationText =
                        [u.profile?.city, u.profile?.state, u.profile?.country]
                          .filter(Boolean)
                          .join(', ') || 'Not specified';
                      const isOnline = livePresence[u.id] ?? u.isOnline ?? false;
                      const isPaid = u.subscriptionTier === 'PAID';
                      const catLabel = u.profile?.category || u.profile?.profileFor || 'Marriage';

                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-[var(--surface-muted)]/50 transition-colors"
                        >
                          <td className="p-3.5 sm:p-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={u.photos?.[0]?.url ?? ''}
                                name={displayName}
                                size="md"
                                online={isOnline}
                                className="border border-[var(--border)] shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-[var(--foreground)] truncate max-w-[160px]">
                                    {displayName}
                                  </span>
                                  {(u.isPhoneVerified || u.isEmailVerified) && (
                                    <span
                                      className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                                      title="Verified contact"
                                    >
                                      <IconCheck className="h-2.5 w-2.5 stroke-[3]" />
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] font-mono text-[var(--muted)] mt-0.5">
                                  {u.profileId ?? u.id.slice(0, 8)}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5 sm:p-4">
                            <div className="flex flex-col items-start gap-1">
                              <Badge
                                tone="default"
                                size="sm"
                                className="bg-[#FAF3EC] text-[#80132E] border-[#EAD8C7] font-semibold"
                              >
                                {catLabel}
                              </Badge>
                              {u.profile?.community && (
                                <span className="text-[11px] text-[var(--muted)]">
                                  {u.profile.community}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5 sm:p-4 text-xs">
                            <div className="space-y-0.5 max-w-[180px]">
                              {u.email && <div className="truncate text-[var(--foreground)]">{u.email}</div>}
                              {u.phone && <div className="text-[var(--muted-strong)]">{u.phone}</div>}
                              {!u.email && !u.phone && (
                                <span className="text-[var(--muted)] italic">None</span>
                              )}
                            </div>
                          </td>

                          <td className="p-3.5 sm:p-4 text-xs text-[var(--muted-strong)] max-w-[160px]">
                            <span className="truncate block">{locationText}</span>
                          </td>

                          <td className="p-3.5 sm:p-4">
                            <Badge
                              tone={isPaid ? 'accent' : 'default'}
                              size="sm"
                              className={
                                isPaid
                                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                                  : 'bg-slate-100 text-slate-700'
                              }
                            >
                              {isPaid && <IconCrown className="h-3 w-3 inline mr-1 text-amber-600" />}
                              {u.subscription?.tier || (isPaid ? 'PAID' : 'BASIC')}
                            </Badge>
                          </td>

                          <td className="p-3.5 sm:p-4">{renderStatusBadge(u)}</td>

                          <td className="p-3.5 sm:p-4 text-right">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => setSelectedUserId(u.id)}
                              className="inline-flex items-center gap-1.5 font-semibold"
                            >
                              <IconEye className="h-3.5 w-3.5" />
                              View Profile
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-[var(--border)] bg-[var(--surface-muted)]/40 text-xs">
                <span className="text-[var(--muted)]">
                  Page <strong className="text-[var(--foreground)]">{page}</strong> of{' '}
                  <strong className="text-[var(--foreground)]">{totalPages}</strong> ({totalCount} users)
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

