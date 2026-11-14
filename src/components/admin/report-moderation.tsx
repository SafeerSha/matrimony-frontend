'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  IconFlag,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconBan,
  IconLoader2,
  IconRefresh,
  IconFilter,
  IconChevronLeft,
  IconChevronRight,
  IconUser,
  IconClock,
  IconShieldCheck,
  IconMessage,
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

export function ReportModeration() {
  const [reports, setReports] = useState<AdminUserReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTION_TAKEN'>('PENDING');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Ban user confirmation modal
  const [banConfirmReport, setBanConfirmReport] = useState<AdminUserReportItem | null>(null);
  const [isBanning, setIsBanning] = useState(false);

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
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Failed to load reports:', err);
      toast.error('Failed to Load Reports', err?.message || 'Could not fetch moderation reports.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    const controller = new AbortController();
    fetchReports(controller.signal);
    return () => controller.abort();
  }, [fetchReports]);

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
        adminNotes: 'Reported user has been banned by administrator.',
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
            className="text-xs h-9"
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
                        <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Reported Member</span>
                        <div className="font-bold text-[var(--foreground)] mt-0.5 flex items-center gap-1.5">
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
                        <span className="text-[10px] uppercase font-bold text-[var(--muted)] block">Reported By</span>
                        <div className="font-bold text-[var(--foreground)] mt-0.5 flex items-center gap-1.5">
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

                    {/* Admin notes */}
                    {report.adminNotes && (
                      <p className="text-xs text-[var(--muted)] italic">
                        <strong>Admin Note:</strong> {report.adminNotes}
                      </p>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex sm:flex-row lg:flex-col items-center sm:justify-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--border)]">
                    {report.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isLoadingThis}
                          onClick={() => handleUpdateStatus(report.id, 'REVIEWED')}
                          className="text-xs h-8 text-blue-700 border-blue-200 hover:bg-blue-50"
                        >
                          <IconCheck className="mr-1 h-3.5 w-3.5" />
                          Mark Reviewed
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isLoadingThis}
                          onClick={() => handleUpdateStatus(report.id, 'DISMISSED')}
                          className="text-xs h-8 text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                        >
                          <IconX className="mr-1 h-3.5 w-3.5" />
                          Dismiss
                        </Button>
                      </>
                    )}

                    {!report.reported?.isBanned && (
                      <Button
                        size="sm"
                        disabled={isLoadingThis}
                        onClick={() => setBanConfirmReport(report)}
                        className="text-xs h-8 bg-rose-700 hover:bg-rose-800 text-white"
                      >
                        <IconBan className="mr-1 h-3.5 w-3.5" />
                        Ban Member
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
                  className="h-8 w-8 p-0"
                >
                  <IconChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 w-8 p-0"
                >
                  <IconChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

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
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={isBanning}
            onClick={handleBanReportedUser}
            className="bg-rose-700 hover:bg-rose-800 text-white gap-1.5"
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
    </div>
  );
}
