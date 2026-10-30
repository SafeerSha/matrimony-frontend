'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  IconSearch,
  IconMapPin,
  IconBan,
  IconUserCheck,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconCrown,
  IconAlertCircle,
  IconMail,
  IconPhone,
  IconId,
  IconAlertTriangle,
  IconX,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { adminService } from '@/services/admin.service';
import type { AdminUserListItem, AdminUserQueryFilters } from '@/types/admin-user';
import { toast } from '@/lib/toast';

// ─── Confirmation Dialog ───────────────────────────────────────────────────────

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  variant,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl p-6 animate-in zoom-in-95 fade-in duration-150">
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`flex-shrink-0 rounded-full p-2 ${
              variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
            }`}
          >
            <IconAlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="confirm-dialog-title" className="font-bold text-[var(--foreground)] text-base leading-snug">
              {title}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{message}</p>
          </div>
          <button
            onClick={onCancel}
            aria-label="Dismiss dialog"
            className="ml-auto flex-shrink-0 rounded-lg p-1 hover:bg-[var(--surface-muted)] text-[var(--muted)] transition-colors"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            className={
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white border-none'
                : 'bg-amber-600 hover:bg-amber-700 text-white border-none'
            }
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface PendingConfirm {
  user: AdminUserListItem;
  action: 'block' | 'unblock';
}

const PAGE_SIZE = 15;

export function UserManagement() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [plan, setPlan] = useState<'ALL' | 'BASIC' | 'PAID'>('ALL');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'BLOCKED' | 'SUSPENDED'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Action state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);

  // Debounce refs for text inputs (avoid fetching on every keystroke)
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locationRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived state
  const hasActiveFilters = useMemo(
    () => Boolean(search || location || plan !== 'ALL' || status !== 'ALL'),
    [search, location, plan, status],
  );

  // ── Data Fetching ────────────────────────────────────────────────────────────

  const fetchUsers = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const filters: AdminUserQueryFilters = {
          page,
          limit: PAGE_SIZE,
          search: search.trim() || undefined,
          location: location.trim() || undefined,
          plan,
          status,
        };
        const res = await adminService.getUsers(filters, signal);
        if (signal?.aborted) return;
        setUsers(res.data ?? []);
        setTotalPages(res.meta?.totalPages ?? 1);
        setTotalCount(res.meta?.total ?? 0);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Failed to fetch users';
        setError(message);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [page, search, location, plan, status],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller.signal);
    return () => controller.abort();
  }, [fetchUsers]);

  // ── Block / Unblock ──────────────────────────────────────────────────────────

  const confirmBlock = (user: AdminUserListItem) => {
    setPendingConfirm({ user, action: user.isBanned ? 'unblock' : 'block' });
  };

  const handleConfirmAction = async () => {
    if (!pendingConfirm) return;
    const { user, action } = pendingConfirm;
    setPendingConfirm(null);
    setActionLoadingId(user.id);

    try {
      if (action === 'unblock') {
        await adminService.unbanUser(user.id);
        toast.success('User Unblocked', `${user.firstName ?? user.email ?? 'User'} can now access the platform.`);
      } else {
        await adminService.banUser(user.id);
        toast.warning('User Blocked', `${user.firstName ?? user.email ?? 'User'} has been restricted.`);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isBanned: action === 'block' } : u)),
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : `Could not ${action} user`;
      toast.error('Action Failed', message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Toggle Plan Tier ─────────────────────────────────────────────────────────

  const handleToggleTier = async (user: AdminUserListItem) => {
    const nextTier: 'BASIC' | 'PAID' = user.subscriptionTier === 'PAID' ? 'BASIC' : 'PAID';
    setActionLoadingId(user.id);
    try {
      await adminService.updateSubscriptionTier(user.id, nextTier);
      toast.success('Plan Updated', `Plan changed to ${nextTier} for ${user.firstName ?? user.email}.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, subscriptionTier: nextTier } : u)),
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error updating subscription tier';
      toast.error('Failed to update plan', message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Filters ──────────────────────────────────────────────────────────────────

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => setPage(1), 400);
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    if (locationRef.current) clearTimeout(locationRef.current);
    locationRef.current = setTimeout(() => setPage(1), 400);
  };

  const resetFilters = () => {
    setSearch('');
    setLocation('');
    setPlan('ALL');
    setStatus('ALL');
    setPage(1);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Accessible confirm dialog — no blocking window.confirm */}
      <ConfirmDialog
        isOpen={Boolean(pendingConfirm)}
        title={pendingConfirm?.action === 'block' ? 'Block User?' : 'Unblock User?'}
        message={
          pendingConfirm?.action === 'block'
            ? `${pendingConfirm?.user.firstName ?? pendingConfirm?.user.email ?? 'This user'} will lose access to the platform.`
            : `${pendingConfirm?.user.firstName ?? pendingConfirm?.user.email ?? 'This user'} will regain full access.`
        }
        confirmLabel={pendingConfirm?.action === 'block' ? 'Block User' : 'Unblock User'}
        variant={pendingConfirm?.action === 'block' ? 'danger' : 'warning'}
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingConfirm(null)}
      />

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">User Management</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Browse registered profiles, filter by location or plan, and manage access restrictions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="default" size="md" className="px-3 py-1 font-semibold text-xs">
              {totalCount} Total
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUsers()}
              disabled={loading}
              aria-label="Refresh user list"
              className="flex items-center gap-1.5"
            >
              <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              Refresh
            </Button>
          </div>
        </div>

        {/* ── Filters ── */}
        <Card className="p-4 sm:p-5 border border-[var(--border)] shadow-xs bg-[var(--surface)]">
          <fieldset>
            <legend className="sr-only">Filter users</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <label htmlFor="um-search" className="sr-only">
                  Search users
                </label>
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" aria-hidden="true" />
                <input
                  id="um-search"
                  type="search"
                  placeholder="Search name, email, ID…"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  maxLength={100}
                  className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              {/* Location */}
              <div className="relative">
                <label htmlFor="um-location" className="sr-only">
                  Filter by location
                </label>
                <IconMapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" aria-hidden="true" />
                <input
                  id="um-location"
                  type="search"
                  placeholder="City, state, country…"
                  value={location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  maxLength={100}
                  className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              {/* Plan */}
              <div>
                <label htmlFor="um-plan" className="sr-only">
                  Filter by plan
                </label>
                <select
                  id="um-plan"
                  value={plan}
                  onChange={(e) => {
                    setPlan(e.target.value as 'ALL' | 'BASIC' | 'PAID');
                    setPage(1);
                  }}
                  className="w-full h-10 px-3 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--primary)] font-medium"
                >
                  <option value="ALL">All Plans</option>
                  <option value="PAID">Paid / Premium</option>
                  <option value="BASIC">Basic / Free</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="um-status" className="sr-only">
                  Filter by status
                </label>
                <select
                  id="um-status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as 'ALL' | 'ACTIVE' | 'BLOCKED' | 'SUSPENDED');
                    setPage(1);
                  }}
                  className="w-full h-10 px-3 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] outline-none focus:border-[var(--primary)] font-medium"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <span className="text-[var(--muted)]">Filters active</span>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[var(--primary)] font-semibold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </fieldset>
        </Card>

        {/* ── Table ── */}
        <Card className="border border-[var(--border)] overflow-hidden shadow-xs bg-[var(--surface)]">
          {error ? (
            <div className="p-8 text-center space-y-3" role="alert">
              <IconAlertCircle className="h-10 w-10 text-red-500 mx-auto" aria-hidden="true" />
              <h3 className="text-sm font-bold text-[var(--foreground)]">Error loading users</h3>
              <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">{error}</p>
              <Button size="sm" variant="outline" onClick={() => fetchUsers()}>
                Try Again
              </Button>
            </div>
          ) : loading ? (
            <div className="p-12 text-center space-y-3" aria-live="polite" aria-busy="true">
              <div
                className="h-7 w-7 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"
                role="status"
                aria-label="Loading users"
              />
              <p className="text-xs text-[var(--muted)]">Loading users…</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <IconSearch className="h-10 w-10 text-[var(--muted)] mx-auto opacity-50" aria-hidden="true" />
              <h3 className="text-base font-bold text-[var(--foreground)]">No users found</h3>
              <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                No accounts match the applied search and filter criteria.
              </p>
              {hasActiveFilters && (
                <Button size="sm" variant="outline" onClick={resetFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto" role="region" aria-label="User list">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted-strong)] font-semibold">
                    <th scope="col" className="p-3.5 sm:p-4">User / Profile</th>
                    <th scope="col" className="p-3.5 sm:p-4">Contact</th>
                    <th scope="col" className="p-3.5 sm:p-4">Location</th>
                    <th scope="col" className="p-3.5 sm:p-4">Plan</th>
                    <th scope="col" className="p-3.5 sm:p-4">Status</th>
                    <th scope="col" className="p-3.5 sm:p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {users.map((u) => {
                    const displayName =
                      u.firstName ??
                      u.profile?.firstName ??
                      u.email?.split('@')[0] ??
                      u.phone ??
                      'Unnamed User';
                    const locationText =
                      [u.profile?.city, u.profile?.state, u.profile?.country]
                        .filter(Boolean)
                        .join(', ') || 'Not specified';
                    const isPaid = u.subscriptionTier === 'PAID';
                    const isBlocked = u.isBanned;
                    const isActing = actionLoadingId === u.id;

                    return (
                      <tr
                        key={u.id}
                        className={`hover:bg-[var(--surface-muted)]/50 transition-colors ${
                          isBlocked ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                        }`}
                      >
                        {/* Name & Avatar */}
                        <td className="p-3.5 sm:p-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={u.photos?.[0]?.url ?? ''}
                              name={displayName}
                              size="md"
                              className="border border-[var(--border)] shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-[var(--foreground)] truncate">
                                  {displayName}
                                </span>
                                {u.role === 'ADMIN' && (
                                  <Badge tone="accent" size="sm" className="text-[10px] py-0 px-1">
                                    Admin
                                  </Badge>
                                )}
                                {u.role === 'RM' && (
                                  <Badge tone="default" size="sm" className="bg-amber-100 text-amber-800 text-[10px] py-0 px-1">
                                    RM
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-[var(--muted)] mt-0.5">
                                <IconId className="h-3 w-3 shrink-0" aria-hidden="true" />
                                <span>{u.profileId ?? u.id.slice(0, 8)}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="p-3.5 sm:p-4">
                          <div className="space-y-0.5 text-xs">
                            {u.email && (
                              <div className="flex items-center gap-1 text-[var(--foreground)]">
                                <IconMail className="h-3 w-3 text-[var(--muted)] shrink-0" aria-hidden="true" />
                                <span className="truncate max-w-[180px]">{u.email}</span>
                              </div>
                            )}
                            {u.phone && (
                              <div className="flex items-center gap-1 text-[var(--muted-strong)]">
                                <IconPhone className="h-3 w-3 text-[var(--muted)] shrink-0" aria-hidden="true" />
                                <span>{u.phone}</span>
                              </div>
                            )}
                            {!u.email && !u.phone && (
                              <span className="text-[var(--muted)] italic">No contact info</span>
                            )}
                          </div>
                        </td>

                        {/* Location */}
                        <td className="p-3.5 sm:p-4 text-xs">
                          <div className="flex items-center gap-1.5 text-[var(--foreground)]">
                            <IconMapPin className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" aria-hidden="true" />
                            <span className="truncate max-w-[160px]">{locationText}</span>
                          </div>
                        </td>

                        {/* Plan toggle */}
                        <td className="p-3.5 sm:p-4">
                          <button
                            type="button"
                            onClick={() => handleToggleTier(u)}
                            disabled={isActing}
                            aria-label={`Toggle plan for ${displayName} — currently ${isPaid ? 'Paid' : 'Basic'}`}
                            title="Click to toggle between Paid and Basic"
                            className="group inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded"
                          >
                            <Badge
                              tone={isPaid ? 'accent' : 'default'}
                              className={`cursor-pointer transition-all group-hover:scale-105 ${
                                isPaid
                                  ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                                  : 'bg-slate-100 text-slate-700 font-medium'
                              }`}
                            >
                              {isPaid && <IconCrown className="h-3 w-3 text-amber-600 inline mr-1" aria-hidden="true" />}
                              {isPaid ? 'Paid' : 'Basic'}
                            </Badge>
                          </button>
                        </td>

                        {/* Status badge */}
                        <td className="p-3.5 sm:p-4">
                          {isBlocked ? (
                            <Badge tone="default" className="bg-red-100 text-red-800 border-red-200 font-semibold">
                              Blocked
                            </Badge>
                          ) : u.status === 'ACTIVE' ? (
                            <Badge tone="success" className="font-semibold">Active</Badge>
                          ) : (
                            <Badge tone="default" className="bg-amber-50 text-amber-700 border-amber-200">
                              {u.status}
                            </Badge>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 sm:p-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isActing}
                            onClick={() => confirmBlock(u)}
                            aria-label={isBlocked ? `Unblock ${displayName}` : `Block ${displayName}`}
                            className={
                              isBlocked
                                ? 'text-emerald-700 hover:text-emerald-800 border-emerald-300 hover:bg-emerald-50 text-xs h-8 px-2.5 flex items-center gap-1'
                                : 'text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 text-xs h-8 px-2.5 flex items-center gap-1'
                            }
                          >
                            {isActing ? (
                              <span
                                className="h-3.5 w-3.5 border border-current border-t-transparent rounded-full animate-spin"
                                aria-hidden="true"
                              />
                            ) : isBlocked ? (
                              <IconUserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            ) : (
                              <IconBan className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                            {isBlocked ? 'Unblock' : 'Block'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <nav
              aria-label="User list pagination"
              className="p-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted-strong)]"
            >
              <span>
                Page {page} of {totalPages} ({totalCount} users)
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="h-8 w-8 p-0"
                >
                  <IconChevronLeft className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                  className="h-8 w-8 p-0"
                >
                  <IconChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </nav>
          )}
        </Card>
      </div>
    </>
  );
}
