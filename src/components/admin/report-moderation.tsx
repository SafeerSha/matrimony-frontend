'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  IconFlag,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconBan,
  IconShieldOff,
  IconLoader2,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconUser,
  IconClock,
  IconShieldCheck,
  IconEye,
  IconPencil,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { reportService, type AdminUserReportItem } from '@/services/report.service';
import { adminService } from '@/services/admin.service';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam or advertising',
  harassment: 'Harassment / Abuse',
  fake_profile: 'Fake profile / Impersonation',
  inappropriate_content: 'Inappropriate content',
  other: 'Other concern',
};

export interface ReportModerationProps {
  portal?: 'admin' | 'rm';
  onPendingCountChange?: (count: number) => void;
}

export function ReportModeration({ portal = 'admin', onPendingCountChange }: ReportModerationProps) {
  const [reports, setReports] = useState<AdminUserReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTION_TAKEN'>('PENDING');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Quick Ban user modal
  const [banConfirmReport, setBanConfirmReport] = useState<AdminUserReportItem | null>(null);
  const [isBanning, setIsBanning] = useState(false);

  // Quick Unban user modal
  const [unbanConfirmReport, setUnbanConfirmReport] = useState<AdminUserReportItem | null>(null);
  const [isUnbanning, setIsUnbanning] = useState(false);

  // Comprehensive Action & Resolution modal
  const [actionModalReport, setActionModalReport] = useState<AdminUserReportItem | null>(null);
  const [actionStatus, setActionStatus] = useState<'ACTION_TAKEN' | 'REVIEWED' | 'DISMISSED' | 'PENDING'>('ACTION_TAKEN');
  const [actionNotes, setActionNotes] = useState('');
  const [alsoBanUser, setAlsoBanUser] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const fetchReports = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const res = await reportService.getReportsAdmin(
        {
          status: statusFilter,
          page,
          limit: 15,
        },
        signal
      );
      setReports(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalCount(res.meta?.total || 0);

      if (statusFilter === 'PENDING') {
        onPendingCountChange?.(res.meta?.total || 0);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Failed to load reports:', err);
      toast.error('Failed to Load Reports', err?.message || 'Could not fetch moderation reports.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, onPendingCountChange]);

  useEffect(() => {
    const controller = new AbortController();
    fetchReports(controller.signal);
    return () => controller.abort();
  }, [fetchReports]);

  // Sync total pending count for parent badge
  useEffect(() => {
    if (!onPendingCountChange) return;
    const controller = new AbortController();
    reportService
      .getReportsAdmin({ status: 'PENDING', limit: 1 }, controller.signal)
      .then((res) => onPendingCountChange(res.meta?.total || 0))
      .catch(() => {});
    return () => controller.abort();
  }, [onPendingCountChange]);

  const handleUpdateStatus = async (
    reportId: string,
    nextStatus: 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTION_TAKEN',
    notes?: string
  ) => {
    try {
      setActionLoadingId(reportId);
      await reportService.updateReportAdmin(reportId, {
        status: nextStatus,
        adminNotes: notes,
      });
      toast.success('Report Updated', `Report marked as ${nextStatus.replace('_', ' ')}.`);
      fetchReports();
    } catch (err: any) {
      toast.error('Update Failed', err?.message || 'Could not update report status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBanReportedUser = async () => {
    if (!banConfirmReport) return;
    try {
      setIsBanning(true);
      await adminService.banUser(banConfirmReport.reportedId);
      await reportService.updateReportAdmin(banConfirmReport.id, {
        status: 'ACTION_TAKEN',
        adminNotes: `Reported member banned by ${portal === 'rm' ? 'Relationship Manager' : 'Administrator'}.`,
      });
      toast.success('User Banned', `${banConfirmReport.reported?.firstName || 'Reported user'} has been banned and report resolved.`);
      setBanConfirmReport(null);
      fetchReports();
    } catch (err: any) {
      toast.error('Ban Action Failed', err?.message || 'Could not ban user.');
    } finally {
      setIsBanning(false);
    }
  };

  const handleUnbanReportedUser = async () => {
    if (!unbanConfirmReport) return;
    try {
      setIsUnbanning(true);
      await adminService.unbanUser(unbanConfirmReport.reportedId);
      toast.success('User Unbanned', `${unbanConfirmReport.reported?.firstName || 'Reported user'} has been unbanned.`);
      setUnbanConfirmReport(null);
      fetchReports();
    } catch (err: any) {
      toast.error('Unban Failed', err?.message || 'Could not unban user.');
    } finally {
      setIsUnbanning(false);
    }
  };

  const openActionModal = (report: AdminUserReportItem) => {
    setActionModalReport(report);
    setActionStatus(report.status === 'PENDING' ? 'ACTION_TAKEN' : report.status);
    setActionNotes(report.adminNotes || '');
    setAlsoBanUser(false);
  };

  const handleSubmitActionModal = async () => {
    if (!actionModalReport) return;
    try {
      setIsSubmittingAction(true);
      if (alsoBanUser && !actionModalReport.reported?.isBanned) {
        await adminService.banUser(actionModalReport.reportedId);
      }
      await reportService.updateReportAdmin(actionModalReport.id, {
        status: actionStatus,
        adminNotes: actionNotes.trim() || undefined,
      });
      toast.success(
        'Action Recorded',
        `Report marked as ${actionStatus.replace('_', ' ')}${alsoBanUser ? ' & member banned' : ''}.`
      );
      setActionModalReport(null);
      fetchReports();
    } catch (err: any) {
      toast.error('Action Failed', err?.message || 'Could not record action.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
              User Reports &amp; Moderation
            </h1>
            <Badge tone="default" size="sm" className="bg-[#FAF3EC] text-[#80132E] border border-[#EAD8C7]">
              Trust &amp; Safety
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Review user-against-user abuse reports, harassment, fake profiles, and safety concerns.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge tone="default" size="md" className="px-3 py-1 font-semibold text-xs">
            {totalCount} {totalCount === 1 ? 'Report' : 'Reports'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchReports()}
            disabled={loading}
            className="text-xs h-9 cursor-pointer"
          >
            <IconRefresh className={cn('mr-1.5 h-3.5 w-3.5', loading && 'animate-spin text-[var(--primary)]')} />
            Refresh
          </Button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[var(--border)]">
        {(['PENDING', 'REVIEWED', 'ACTION_TAKEN', 'DISMISSED', 'ALL'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => {
              setStatusFilter(st);
              setPage(1);
            }}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer',
              statusFilter === st
                ? 'bg-[#80132E] text-white shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]'
            )}
          >
            {st === 'ALL'
              ? 'All Reports'
              : st === 'PENDING'
              ? 'Pending Review'
              : st === 'REVIEWED'
              ? 'Reviewed'
              : st === 'ACTION_TAKEN'
              ? 'Action Taken'
              : 'Dismissed'}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-center bg-white rounded-2xl border border-[var(--border)]">
          <IconLoader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
          <p className="text-xs text-[var(--muted)]">Loading moderation queue…</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-12 text-center shadow-xs">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 mb-3 border border-emerald-200">
            <IconShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-[var(--foreground)]">Moderation Queue Clear</h3>
          <p className="mt-1 text-xs sm:text-sm text-[var(--muted)] max-w-sm mx-auto">
            No user reports found in the {statusFilter.toLowerCase().replace('_', ' ')} queue.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const isLoadingThis = actionLoadingId === report.id;
            const reporterName = `${report.reporter?.firstName || ''} ${report.reporter?.lastName || ''}`.trim() || 'Reporter';
            const reportedName = `${report.reported?.firstName || ''} ${report.reported?.lastName || ''}`.trim() || 'Reported Member';

            return (
              <Card
                key={report.id}
                className="p-5 border border-[var(--border)] bg-white rounded-2xl shadow-xs transition-all hover:border-[var(--border-strong)]"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left: Report Content */}
                  <div className="space-y-3 flex-1 min-w-0">
                    {/* Header info */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <IconFlag className="h-3 w-3" />
                        {REASON_LABELS[report.reason] || report.reason}
                      </span>

                      <Badge
                        tone={
                          report.status === 'PENDING'
                            ? 'accent'
                            : report.status === 'ACTION_TAKEN'
                            ? 'danger'
                            : report.status === 'REVIEWED'
                            ? 'success'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {report.status.replace('_', ' ')}
                      </Badge>

                      <span className="text-[var(--muted)] flex items-center gap-1 ml-auto sm:ml-0">
                        <IconClock className="h-3.5 w-3.5" />
                        {new Date(report.createdAt).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Parties involved */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-[var(--surface-muted)] text-xs">
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Reported Member</span>
                          <Link
                            href={`/rm/users/${report.reportedId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#80132E] hover:underline"
                            title="Inspect full profile details in new tab"
                          >
                            <IconEye className="h-3 w-3" />
                            <span>View Profile</span>
                          </Link>
                        </div>
                        <div className="font-bold text-[var(--foreground)] mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>{reportedName}</span>
                          {report.reported?.profileId && (
                            <span className="text-[10px] text-[var(--muted)] font-normal">
                              ({report.reported.profileId})
                            </span>
                          )}
                          {report.reported?.isBanned && (
                            <Badge tone="danger" size="sm">Banned</Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-[var(--muted)]">{report.reported?.email}</span>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Reported By</span>
                          {report.reporterId && (
                            <Link
                              href={`/rm/users/${report.reporterId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--muted)] hover:text-[var(--foreground)] hover:underline"
                              title="Inspect reporter profile in new tab"
                            >
                              <IconEye className="h-3 w-3" />
                              <span>View Profile</span>
                            </Link>
                          )}
                        </div>
                        <div className="font-bold text-[var(--foreground)] mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>{reporterName}</span>
                          {report.reporter?.profileId && (
                            <span className="text-[10px] text-[var(--muted)] font-normal">
                              ({report.reporter.profileId})
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[var(--muted)]">{report.reporter?.email}</span>
                      </div>
                    </div>

                    {/* Report Description */}
                    {report.description && (
                      <div className="text-xs sm:text-sm text-[var(--foreground)] bg-white p-3 rounded-xl border border-[var(--border)] leading-relaxed">
                        <span className="font-bold text-[11px] text-[var(--muted)] block mb-1">Details provided:</span>
                        <p className="whitespace-pre-wrap">{report.description}</p>
                      </div>
                    )}

                    {/* Staff Moderation notes */}
                    {report.adminNotes && (
                      <div className="text-xs text-[var(--muted)] bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5">
                        <span className="font-bold text-[11px] text-amber-900 block mb-0.5">Moderation Note:</span>
                        <p className="italic text-amber-950 whitespace-pre-wrap">{report.adminNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap lg:flex-col items-center sm:justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--border)]">
                    {/* Primary Take Action Button */}
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={isLoadingThis}
                      onClick={() => openActionModal(report)}
                      className="text-xs h-8 bg-[#80132E] hover:bg-[#680F25] text-white cursor-pointer"
                    >
                      <IconPencil className="mr-1 h-3.5 w-3.5" />
                      Take Action
                    </Button>

                    {report.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isLoadingThis}
                          onClick={() => handleUpdateStatus(report.id, 'REVIEWED')}
                          className="text-xs h-8 text-blue-700 border-blue-200 hover:bg-blue-50 cursor-pointer"
                        >
                          <IconCheck className="mr-1 h-3.5 w-3.5" />
                          Mark Reviewed
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isLoadingThis}
                          onClick={() => handleUpdateStatus(report.id, 'DISMISSED')}
                          className="text-xs h-8 text-zinc-600 border-zinc-200 hover:bg-zinc-50 cursor-pointer"
                        >
                          <IconX className="mr-1 h-3.5 w-3.5" />
                          Dismiss
                        </Button>
                      </>
                    )}

                    {!report.reported?.isBanned ? (
                      <Button
                        size="sm"
                        disabled={isLoadingThis}
                        onClick={() => setBanConfirmReport(report)}
                        className="text-xs h-8 bg-rose-700 hover:bg-rose-800 text-white cursor-pointer"
                      >
                        <IconBan className="mr-1 h-3.5 w-3.5" />
                        Ban Member
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isLoadingThis}
                        onClick={() => setUnbanConfirmReport(report)}
                        className="text-xs h-8 text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                      >
                        <IconShieldCheck className="mr-1 h-3.5 w-3.5" />
                        Unban Member
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-xs text-[var(--muted)]">
                Page {page} of {totalPages} ({totalCount} total)
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 w-8 p-0 cursor-pointer"
                >
                  <IconChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 w-8 p-0 cursor-pointer"
                >
                  <IconChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comprehensive Action & Resolution Modal */}
      <Modal
        isOpen={Boolean(actionModalReport)}
        onClose={() => !isSubmittingAction && setActionModalReport(null)}
        size="md"
        title="Take Action on Report"
        description={`Record moderation resolution and action details for report against ${actionModalReport?.reported?.firstName || 'member'}.`}
      >
        <div className="space-y-4 pt-2">
          {/* Target Status Selection */}
          <div>
            <label className="text-xs font-bold text-[var(--foreground)] block mb-1.5">
              Set Resolution Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { value: 'ACTION_TAKEN', label: 'Action Taken', tone: 'text-rose-700 border-rose-200 bg-rose-50' },
                  { value: 'REVIEWED', label: 'Reviewed', tone: 'text-blue-700 border-blue-200 bg-blue-50' },
                  { value: 'DISMISSED', label: 'Dismissed', tone: 'text-zinc-700 border-zinc-200 bg-zinc-50' },
                  { value: 'PENDING', label: 'Pending', tone: 'text-amber-700 border-amber-200 bg-amber-50' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setActionStatus(opt.value)}
                  className={cn(
                    'px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer',
                    actionStatus === opt.value
                      ? 'border-[#80132E] bg-[#80132E] text-white shadow-xs'
                      : 'border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-[var(--surface-muted)]'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes textarea */}
          <div>
            <label className="text-xs font-bold text-[var(--foreground)] block mb-1">
              Moderation / Staff Note (Optional)
            </label>
            <textarea
              rows={3}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder="e.g. Spoke with member, issued formal warning, or removed inappropriate photos."
              className="w-full text-xs rounded-xl border border-[var(--border)] p-3 focus:outline-none focus:ring-2 focus:ring-[#80132E]/30 focus:border-[#80132E] resize-none"
            />
          </div>

          {/* Also Ban Checkbox */}
          {!actionModalReport?.reported?.isBanned && (
            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-200 bg-rose-50/50 cursor-pointer">
              <input
                type="checkbox"
                checked={alsoBanUser}
                onChange={(e) => setAlsoBanUser(e.target.checked)}
                className="mt-0.5 rounded border-rose-300 text-rose-700 focus:ring-rose-500 h-4 w-4"
              />
              <div className="text-xs">
                <span className="font-bold text-rose-900 block">
                  Also ban this reported member immediately
                </span>
                <span className="text-rose-700 text-[11px] block mt-0.5">
                  Terminates all active sessions and permanently blocks login and registration.
                </span>
              </div>
            </label>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmittingAction}
              onClick={() => setActionModalReport(null)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={isSubmittingAction}
              onClick={handleSubmitActionModal}
              className="bg-[#80132E] hover:bg-[#680F25] text-white gap-1.5 cursor-pointer"
            >
              {isSubmittingAction ? (
                <>
                  <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <IconCheck className="h-3.5 w-3.5" />
                  Save Action
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Ban Confirmation Modal */}
      <Modal
        isOpen={Boolean(banConfirmReport)}
        onClose={() => !isBanning && setBanConfirmReport(null)}
        size="sm"
        title="Ban Reported Member?"
        description={`Are you sure you want to ban ${banConfirmReport?.reported?.firstName || 'this member'}? This will immediately terminate their active sessions and permanently block them from login and new registration.`}
      >
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isBanning}
            onClick={() => setBanConfirmReport(null)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isBanning}
            onClick={handleBanReportedUser}
            className="bg-rose-700 hover:bg-rose-800 text-white gap-1.5 cursor-pointer"
          >
            {isBanning ? (
              <>
                <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                Banning…
              </>
            ) : (
              <>
                <IconBan className="h-3.5 w-3.5" />
                Confirm Ban
              </>
            )}
          </Button>
        </div>
      </Modal>

      {/* Unban Confirmation Modal */}
      <Modal
        isOpen={Boolean(unbanConfirmReport)}
        onClose={() => !isUnbanning && setUnbanConfirmReport(null)}
        size="sm"
        title="Unban Member?"
        description={`Are you sure you want to restore access for ${unbanConfirmReport?.reported?.firstName || 'this member'}? They will be able to log in and use the platform again.`}
      >
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUnbanning}
            onClick={() => setUnbanConfirmReport(null)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isUnbanning}
            onClick={handleUnbanReportedUser}
            className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5 cursor-pointer"
          >
            {isUnbanning ? (
              <>
                <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                Unbanning…
              </>
            ) : (
              <>
                <IconShieldCheck className="h-3.5 w-3.5" />
                Confirm Unban
              </>
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
