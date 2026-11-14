'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  IconCalendarEvent,
  IconClock,
  IconCheck,
  IconRefresh,
  IconLoader2,
  IconPhone,
  IconUser,
  IconArrowUpRight,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { rmService } from '@/services/rm.service';
import type { RmFollowUpItem } from '@/types/rm';
import { toast } from '@/lib/toast';

interface RmFollowUpAgendaProps {
  onSelectClient: (clientId: string) => void;
}

export function RmFollowUpAgenda({ onSelectClient }: RmFollowUpAgendaProps) {
  const [filter, setFilter] = useState<'today' | 'upcoming' | 'overdue' | 'completed'>('today');
  const [followUps, setFollowUps] = useState<RmFollowUpItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Complete follow-up dialog
  const [completingFollowUp, setCompletingFollowUp] = useState<RmFollowUpItem | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [submittingComplete, setSubmittingComplete] = useState(false);

  const fetchFollowUps = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const data = await rmService.getFollowUps({ filter }, signal);
      setFollowUps(data || []);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      toast.error('Failed to load agenda', err?.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    const controller = new AbortController();
    fetchFollowUps(controller.signal);
    return () => controller.abort();
  }, [fetchFollowUps]);

  const handleConfirmComplete = async () => {
    if (!completingFollowUp) return;
    try {
      setSubmittingComplete(true);
      await rmService.updateFollowUp(completingFollowUp.id, {
        status: 'COMPLETED',
        completionNotes: completionNotes.trim() || undefined,
      });
      toast.success('Follow-up Completed', 'Marked as completed.');
      setCompletingFollowUp(null);
      setCompletionNotes('');
      fetchFollowUps();
    } catch (err: any) {
      toast.error('Action failed', err?.message);
    } finally {
      setSubmittingComplete(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
            Follow-Up Reminders &amp; Agenda
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Stay on top of scheduled client calls, match consultations, and upcoming touchpoints.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => fetchFollowUps()}
          disabled={loading}
          className="self-start sm:self-auto cursor-pointer"
        >
          <IconRefresh className={`mr-1.5 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </header>

      {/* Filter Tabs */}
      <Card className="p-3 bg-white border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setFilter('today')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'today'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Today&apos;s Agenda
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'overdue'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Overdue Reminders
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'upcoming'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            All Upcoming
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'completed'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Completed History
          </button>
        </div>
      </Card>

      {/* List */}
      {loading ? (
        <Card className="p-12 text-center bg-white border-[var(--border)]">
          <IconLoader2 className="h-6 w-6 animate-spin text-[var(--primary)] mx-auto mb-2" />
          <p className="text-xs text-[var(--muted)]">Loading agenda…</p>
        </Card>
      ) : followUps.length === 0 ? (
        <Card className="p-12 text-center bg-white border-[var(--border)]">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center mx-auto mb-3">
            <IconCheck className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-[var(--foreground)]">All Caught Up!</h3>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
            No follow-ups found in &ldquo;{filter}&rdquo;. You can schedule new follow-ups from any client&apos;s workspace.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {followUps.map((fu) => {
            const isOverdue = fu.status === 'PENDING' && new Date(fu.scheduledAt) < new Date();

            return (
              <Card
                key={fu.id}
                className={`p-4 sm:p-5 bg-white border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs ${
                  isOverdue ? 'border-amber-300 bg-amber-50/15' : 'border-[var(--border)]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    {fu.client?.photos?.[0]?.url ? (
                      <img
                        src={fu.client.photos[0].url}
                        alt="Client"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-stone-400">
                        <IconUser className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-sm text-[var(--foreground)]">
                        {fu.client?.firstName} {fu.client?.lastName || ''}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--muted)]">
                        {fu.client?.profileId || 'N/A'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          fu.priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-800'
                            : fu.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {fu.priority}
                      </span>
                      <Badge tone={fu.status === 'COMPLETED' ? 'success' : isOverdue ? 'danger' : 'champagne'}>
                        {isOverdue ? 'OVERDUE' : fu.status}
                      </Badge>
                    </div>

                    <h4 className="font-semibold text-xs sm:text-sm text-stone-800">{fu.title}</h4>
                    {fu.description && <p className="text-xs text-stone-600">{fu.description}</p>}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)] pt-1">
                      <span className="flex items-center gap-1 font-medium text-stone-700">
                        <IconClock className="h-3 w-3" />
                        {new Date(fu.scheduledAt).toLocaleString()}
                      </span>
                      {fu.client?.phone && (
                        <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <IconPhone className="h-3 w-3" />
                          {fu.client.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {fu.clientId && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onSelectClient(fu.clientId)}
                      className="text-xs h-8 cursor-pointer"
                    >
                      Workspace <IconArrowUpRight className="ml-1 h-3 w-3" />
                    </Button>
                  )}

                  {fu.status === 'PENDING' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setCompletingFollowUp(fu);
                        setCompletionNotes('');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 cursor-pointer font-semibold"
                    >
                      <IconCheck className="mr-1 h-3 w-3" /> Mark Done
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Complete Follow-up Modal */}
      {completingFollowUp && (
        <Modal
          isOpen={true}
          onClose={() => setCompletingFollowUp(null)}
          title={`Complete Follow-up: ${completingFollowUp.title}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-stone-700">
              Add optional completion notes regarding what was discussed with{' '}
              <strong>{completingFollowUp.client?.firstName || 'the client'}</strong>:
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Client agreed to meet with candidate IMC-041 this Saturday…"
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              className="w-full p-2.5 bg-white border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                disabled={submittingComplete}
                onClick={() => setCompletingFollowUp(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmComplete}
                disabled={submittingComplete}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {submittingComplete ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Mark as Completed'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
