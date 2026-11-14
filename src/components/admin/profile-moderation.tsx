'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  IconUserCheck,
  IconUserX,
  IconCheck,
  IconX,
  IconLoader2,
  IconRefresh,
  IconSearch,
  IconEye,
  IconAlertTriangle,
  IconChevronLeft,
  IconChevronRight,
  IconMapPin,
  IconBriefcase,
  IconSchool,
  IconHeart,
  IconUser,
  IconPhone,
  IconMail,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { adminService } from '@/services/admin.service';
import type { AdminUserListItem } from '@/types/admin-user';
import { toast } from '@/lib/toast';

const PRESET_REJECTION_REASONS = [
  'Inappropriate or offensive bio content',
  'Incomplete mandatory profile information',
  'Suspicious or invalid profile details',
  'Duplicate account detected',
  'Photos do not match profile identity',
  'Violates IshtamChat Community Standards',
];

export function ProfileModeration() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'PENDING_VERIFICATION' | 'REJECTED' | 'ALL'>('PENDING_VERIFICATION');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Inspection modal
  const [inspectUser, setInspectUser] = useState<AdminUserListItem | null>(null);

  // Reject dialog
  const [rejectDialogUser, setRejectDialogUser] = useState<AdminUserListItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState(PRESET_REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const fetchProfiles = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const res = await adminService.getPendingProfiles(
        {
          status: statusFilter,
          page,
          limit: 15,
          search: search || undefined,
        },
        signal
      );
      setUsers(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalCount(res.meta?.total || 0);
      setPendingCount(res.meta?.pendingCount || 0);
      setRejectedCount(res.meta?.rejectedCount || 0);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      toast.error('Failed to load profiles', err?.message || 'Could not fetch profile approval queue.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, search]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProfiles(controller.signal);
    return () => controller.abort();
  }, [fetchProfiles]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleApprove = async (userId: string) => {
    try {
      setActionLoadingId(userId);
      await adminService.approveProfile(userId);
      toast.success('Profile Approved', 'Member profile has been approved and marked ACTIVE.');
      if (inspectUser?.id === userId) setInspectUser(null);
      fetchProfiles();
    } catch (err: any) {
      toast.error('Approval Failed', err?.message || 'Could not approve profile.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectDialogUser) return;
    const finalReason = customReason.trim() ? `${rejectionReason}: ${customReason.trim()}` : rejectionReason;

    try {
      setIsSubmittingReject(true);
      await adminService.rejectProfile(rejectDialogUser.id, finalReason);
      toast.success('Profile Rejected', 'Profile status updated to REJECTED with feedback.');
      setRejectDialogUser(null);
      setCustomReason('');
      if (inspectUser?.id === rejectDialogUser.id) setInspectUser(null);
      fetchProfiles();
    } catch (err: any) {
      toast.error('Rejection Failed', err?.message || 'Could not reject profile.');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const calculateAge = (dobString?: string | null) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
              Profile Approvals
            </h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                {pendingCount} Awaiting Review
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Review submitted matrimony profiles. Verify details, approve for active discovery, or reject with feedback.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => fetchProfiles()}
          disabled={loading}
          className="self-start sm:self-auto cursor-pointer"
        >
          <IconRefresh className={`mr-1.5 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </header>

      {/* Control Bar: Filter Tabs & Search */}
      <Card className="p-4 bg-white border-[var(--border)] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => {
                setStatusFilter('PENDING_VERIFICATION');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'PENDING_VERIFICATION'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Awaiting Approval
              {pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setStatusFilter('REJECTED');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'REJECTED'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Rejected Profiles
              {rejectedCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                  {rejectedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setStatusFilter('ALL');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Profiles ({totalCount})
            </button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search member name, ID, phone…"
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

      {/* Profile List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-[var(--surface-muted)] animate-pulse border border-[var(--border)]" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center bg-white border-[var(--border)]">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 grid place-items-center mx-auto mb-3">
            <IconUserCheck className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-[var(--foreground)]">No Profiles Awaiting Review</h3>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
            {statusFilter === 'PENDING_VERIFICATION'
              ? 'All new registrations and submitted profiles have been reviewed.'
              : 'No profiles match the chosen status criteria.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {users.map((user) => {
            const age = calculateAge(user.profile?.dateOfBirth);
            const isBusy = actionLoadingId === user.id;

            return (
              <Card
                key={user.id}
                className="p-4 sm:p-5 bg-white border-[var(--border)] hover:border-stone-300 transition-all shadow-xs"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Avatar & Identity */}
                  <div className="flex items-start gap-4">
                    <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                      {user.photos?.[0]?.url ? (
                        <img
                          src={user.photos[0].url}
                          alt={user.firstName || 'Profile'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-stone-400">
                          <IconUser className="h-8 w-8" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-sm sm:text-base text-[var(--foreground)]">
                          {user.firstName} {user.lastName || ''}
                        </h3>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                          {user.profileId || 'N/A'}
                        </span>
                        <Badge
                          tone={
                            user.status === 'ACTIVE'
                              ? 'success'
                              : user.status === 'REJECTED'
                              ? 'danger'
                              : 'champagne'
                          }
                          size="sm"
                        >
                          {user.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
                        {user.profile?.gender && <span>{user.profile.gender}</span>}
                        {age && <span>• {age} yrs</span>}
                        {user.profile?.maritalStatus && <span>• {user.profile.maritalStatus}</span>}
                        {(user.profile?.city || user.profile?.state) && (
                          <span className="flex items-center gap-1">
                            • <IconMapPin className="h-3 w-3" /> {user.profile.city || user.profile.state}
                          </span>
                        )}
                        {user.profile?.occupation && (
                          <span className="flex items-center gap-1">
                            • <IconBriefcase className="h-3 w-3" /> {user.profile.occupation}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <IconMail className="h-3 w-3" /> {user.email || 'No email'}
                        </span>
                        {user.phone && (
                          <span className="flex items-center gap-1">
                            <IconPhone className="h-3 w-3" /> {user.phone}
                          </span>
                        )}
                        <span>• Registered {new Date(user.createdAt).toLocaleDateString()}</span>
                      </div>

                      {user.profileRejectionReason && (
                        <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                          <strong>Rejection reason:</strong> {user.profileRejectionReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 md:self-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setInspectUser(user)}
                      className="text-xs h-8 cursor-pointer"
                    >
                      <IconEye className="mr-1 h-3.5 w-3.5" /> View Details
                    </Button>

                    {user.status !== 'ACTIVE' && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(user.id)}
                        disabled={isBusy}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 cursor-pointer font-semibold"
                      >
                        {isBusy ? (
                          <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <IconCheck className="mr-1 h-3.5 w-3.5" /> Approve Profile
                          </>
                        )}
                      </Button>
                    )}

                    {user.status !== 'REJECTED' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setRejectDialogUser(user);
                          setRejectionReason(PRESET_REJECTION_REASONS[0]);
                          setCustomReason('');
                        }}
                        disabled={isBusy}
                        className="text-rose-700 hover:bg-rose-50 border-rose-200 text-xs h-8 cursor-pointer"
                      >
                        <IconUserX className="mr-1 h-3.5 w-3.5" /> Reject
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-[var(--border)] text-xs">
          <span className="text-[var(--muted)]">
            Page <strong className="text-[var(--foreground)]">{page}</strong> of{' '}
            <strong className="text-[var(--foreground)]">{totalPages}</strong> ({totalCount} profiles)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="cursor-pointer"
            >
              <IconChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="cursor-pointer"
            >
              Next <IconChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Reject Profile Dialog */}
      {rejectDialogUser && (
        <Modal
          isOpen={true}
          onClose={() => setRejectDialogUser(null)}
          title={`Reject Profile: ${rejectDialogUser.firstName} (${rejectDialogUser.profileId || 'N/A'})`}
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs sm:text-sm">
            <p className="text-stone-700">
              Please specify the reason for rejecting this profile. The member will receive this feedback to correct their profile.
            </p>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Primary Reason
              </label>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2.5 bg-white border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] focus:ring-1 focus:ring-[var(--primary)]"
              >
                {PRESET_REJECTION_REASONS.map((r, i) => (
                  <option key={i} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Additional Notes / Instructions (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Provide specific details on what needs to be changed…"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full p-2.5 bg-white border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                disabled={isSubmittingReject}
                onClick={() => setRejectDialogUser(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingReject}
                className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                {isSubmittingReject ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Confirm Rejection'
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Inspect User Full Profile Modal */}
      {inspectUser && (
        <Modal
          isOpen={true}
          onClose={() => setInspectUser(null)}
          title={`Member Profile: ${inspectUser.firstName} ${inspectUser.lastName || ''} (${inspectUser.profileId || 'N/A'})`}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
            {/* Header info */}
            <div className="flex items-center gap-3.5 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <div className="h-14 w-14 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                {inspectUser.photos?.[0]?.url ? (
                  <img src={inspectUser.photos[0].url} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-stone-400">
                    <IconUser className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="space-y-0.5">
                <p className="font-bold text-sm text-[var(--foreground)]">
                  {inspectUser.firstName} {inspectUser.lastName}
                </p>
                <p className="text-[var(--muted)]">{inspectUser.email} • {inspectUser.phone || 'No phone'}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <Badge tone={inspectUser.status === 'ACTIVE' ? 'success' : 'champagne'}>
                    {inspectUser.status}
                  </Badge>
                  <Badge tone="default">Step {inspectUser.profile?.onboardingStep || 1} of 5</Badge>
                </div>
              </div>
            </div>

            {/* Profile Fields Breakdown */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-[var(--border)]">
              <div>
                <span className="text-[var(--muted)] block">Gender:</span>
                <span className="font-semibold text-stone-900">{inspectUser.profile?.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[var(--muted)] block">Marital Status:</span>
                <span className="font-semibold text-stone-900">{inspectUser.profile?.maritalStatus || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[var(--muted)] block">Date of Birth:</span>
                <span className="font-semibold text-stone-900">
                  {inspectUser.profile?.dateOfBirth ? new Date(inspectUser.profile.dateOfBirth).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted)] block">Location:</span>
                <span className="font-semibold text-stone-900">
                  {inspectUser.profile?.city || 'N/A'}, {inspectUser.profile?.state || ''}
                </span>
              </div>
              <div>
                <span className="text-[var(--muted)] block">Education:</span>
                <span className="font-semibold text-stone-900">{inspectUser.profile?.education || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[var(--muted)] block">Occupation:</span>
                <span className="font-semibold text-stone-900">{inspectUser.profile?.occupation || 'N/A'}</span>
              </div>
            </div>

            {/* Quick Actions in Modal */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <Button variant="secondary" onClick={() => setInspectUser(null)}>
                Close
              </Button>
              {inspectUser.status !== 'ACTIVE' && (
                <Button
                  onClick={() => handleApprove(inspectUser.id)}
                  disabled={actionLoadingId === inspectUser.id}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  <IconCheck className="mr-1.5 h-4 w-4" /> Approve Profile
                </Button>
              )}
              {inspectUser.status !== 'REJECTED' && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    const u = inspectUser;
                    setInspectUser(null);
                    setRejectDialogUser(u);
                  }}
                  className="text-rose-700 hover:bg-rose-50 border-rose-200"
                >
                  <IconUserX className="mr-1.5 h-4 w-4" /> Reject Profile
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
