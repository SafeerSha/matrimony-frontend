'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  IconArrowLeft,
  IconUser,
  IconPhone,
  IconMail,
  IconMapPin,
  IconBriefcase,
  IconHeart,
  IconClock,
  IconCheck,
  IconX,
  IconPlus,
  IconSearch,
  IconLoader2,
  IconCalendarEvent,
  IconMessages,
  IconFileText,
  IconTrash,
  IconSparkles,
  IconAlertCircle,
  IconChevronRight,
  IconExternalLink,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { rmService } from '@/services/rm.service';
import type {
  RmAssignedClientItem,
  RmShortlistItem,
  RmInteractionItem,
  RmFollowUpItem,
  ClientStage,
} from '@/types/rm';
import { toast } from '@/lib/toast';

interface RmClientWorkspaceProps {
  clientId: string;
  onBack: () => void;
}

const STAGES: { value: ClientStage; label: string; color: string }[] = [
  { value: 'NEW_LEAD', label: 'New Lead', color: 'bg-slate-100 text-slate-800' },
  { value: 'ONBOARDED', label: 'Onboarded', color: 'bg-blue-100 text-blue-800' },
  { value: 'EXPLORING', label: 'Exploring Matches', color: 'bg-amber-100 text-amber-800' },
  { value: 'SHORTLISTS_SENT', label: 'Shortlists Sent', color: 'bg-purple-100 text-purple-800' },
  { value: 'MEETING_ARRANGED', label: 'Meeting Arranged', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'bg-pink-100 text-pink-800' },
  { value: 'MATCHED', label: 'Matched 🎉', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'INACTIVE', label: 'On Hold / Inactive', color: 'bg-stone-100 text-stone-600' },
];

export function RmClientWorkspace({ clientId, onBack }: RmClientWorkspaceProps) {
  const [client, setClient] = useState<any | null>(null);
  const [clientLoading, setClientLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'shortlists' | 'interactions' | 'follow-ups' | 'profile'>('shortlists');

  // Shortlists state
  const [shortlists, setShortlists] = useState<RmShortlistItem[]>([]);
  const [shortlistsLoading, setShortlistsLoading] = useState(false);
  const [findMatchesModal, setFindMatchesModal] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidateResults, setCandidateResults] = useState<any[]>([]);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [shortlistNoteCandidate, setShortlistNoteCandidate] = useState<any | null>(null);
  const [shortlistNote, setShortlistNote] = useState('');
  const [submittingShortlist, setSubmittingShortlist] = useState(false);

  // Interactions state
  const [interactions, setInteractions] = useState<RmInteractionItem[]>([]);
  const [interactionsLoading, setInteractionsLoading] = useState(false);
  const [logInteractionModal, setLogInteractionModal] = useState(false);
  const [channel, setChannel] = useState<'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING' | 'NOTE'>('CALL');
  const [interactionStatus, setInteractionStatus] = useState('CONNECTED');
  const [interactionSummary, setInteractionSummary] = useState('');
  const [interactionDetails, setInteractionDetails] = useState('');
  const [targetStage, setTargetStage] = useState<string>('');
  const [submittingInteraction, setSubmittingInteraction] = useState(false);

  // Follow-ups state
  const [followUps, setFollowUps] = useState<RmFollowUpItem[]>([]);
  const [followUpsLoading, setFollowUpsLoading] = useState(false);
  const [scheduleFollowUpModal, setScheduleFollowUpModal] = useState(false);
  const [followUpTitle, setFollowUpTitle] = useState('');
  const [followUpDesc, setFollowUpDesc] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpPriority, setFollowUpPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [submittingFollowUp, setSubmittingFollowUp] = useState(false);

  // Load client detail
  const loadClient = useCallback(async () => {
    try {
      setClientLoading(true);
      const data = await rmService.getUserDetail(clientId);
      setClient(data);
      setTargetStage(data.clientStage || 'NEW_LEAD');
    } catch (err: any) {
      toast.error('Failed to load client', err?.message || 'Could not fetch client data.');
    } finally {
      setClientLoading(false);
    }
  }, [clientId]);

  // Load shortlists
  const loadShortlists = useCallback(async () => {
    try {
      setShortlistsLoading(true);
      const data = await rmService.getShortlistsForClient(clientId);
      setShortlists(data || []);
    } catch (err: any) {
      toast.error('Failed to load shortlists', err?.message);
    } finally {
      setShortlistsLoading(false);
    }
  }, [clientId]);

  // Load interactions
  const loadInteractions = useCallback(async () => {
    try {
      setInteractionsLoading(true);
      const data = await rmService.getInteractions(clientId);
      setInteractions(data || []);
    } catch (err: any) {
      toast.error('Failed to load interactions', err?.message);
    } finally {
      setInteractionsLoading(false);
    }
  }, [clientId]);

  // Load follow-ups
  const loadFollowUps = useCallback(async () => {
    try {
      setFollowUpsLoading(true);
      const data = await rmService.getFollowUps({ clientId, filter: 'all' });
      setFollowUps(data || []);
    } catch (err: any) {
      toast.error('Failed to load follow-ups', err?.message);
    } finally {
      setFollowUpsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    loadClient();
    loadShortlists();
    loadInteractions();
    loadFollowUps();
  }, [loadClient, loadShortlists, loadInteractions, loadFollowUps]);

  // Handle stage change
  const handleStageChange = async (newStage: ClientStage) => {
    try {
      await rmService.updateClientStage(clientId, newStage);
      toast.success('Stage Updated', `Client stage set to ${newStage.replace(/_/g, ' ')}`);
      setClient((prev: any) => ({ ...prev, clientStage: newStage }));
      loadInteractions();
    } catch (err: any) {
      toast.error('Failed to update stage', err?.message);
    }
  };

  // Search candidate matches
  const handleSearchCandidates = async () => {
    try {
      setCandidateLoading(true);
      const res = await rmService.searchCandidates(clientId, {
        search: candidateSearch.trim() || undefined,
        limit: 12,
      });
      setCandidateResults(res.data || []);
    } catch (err: any) {
      toast.error('Search failed', err?.message);
    } finally {
      setCandidateLoading(false);
    }
  };

  // Shortlist action
  const handleConfirmShortlist = async () => {
    if (!shortlistNoteCandidate) return;
    try {
      setSubmittingShortlist(true);
      await rmService.createShortlist(clientId, shortlistNoteCandidate.id, shortlistNote.trim() || undefined);
      toast.success('Profile Shortlisted', `${shortlistNoteCandidate.firstName} shortlisted for this client.`);
      setShortlistNoteCandidate(null);
      setShortlistNote('');
      loadShortlists();
      loadInteractions();
      // Update candidate result status in view
      setCandidateResults((prev) =>
        prev.map((c) => (c.id === shortlistNoteCandidate.id ? { ...c, isShortlisted: true } : c))
      );
    } catch (err: any) {
      toast.error('Failed to shortlist', err?.message);
    } finally {
      setSubmittingShortlist(false);
    }
  };

  // Delete shortlist
  const handleDeleteShortlist = async (candidateId: string) => {
    try {
      await rmService.deleteShortlist(clientId, candidateId);
      toast.success('Shortlist Removed', 'Candidate removed from shortlist.');
      loadShortlists();
    } catch (err: any) {
      toast.error('Failed to remove shortlist', err?.message);
    }
  };

  // Log interaction
  const handleLogInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interactionSummary.trim()) {
      toast.error('Summary required', 'Please enter a summary of the interaction.');
      return;
    }

    try {
      setSubmittingInteraction(true);
      await rmService.createInteraction(clientId, {
        channel,
        status: interactionStatus,
        summary: interactionSummary.trim(),
        details: interactionDetails.trim() || undefined,
        clientStage: targetStage || undefined,
      });
      toast.success('Interaction Logged', 'Client interaction record saved.');
      setLogInteractionModal(false);
      setInteractionSummary('');
      setInteractionDetails('');
      loadInteractions();
      loadClient();
    } catch (err: any) {
      toast.error('Failed to log interaction', err?.message);
    } finally {
      setSubmittingInteraction(false);
    }
  };

  // Schedule follow-up
  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpTitle.trim() || !followUpDate) {
      toast.error('Required fields', 'Title and scheduled date/time are required.');
      return;
    }

    try {
      setSubmittingFollowUp(true);
      await rmService.createFollowUp(clientId, {
        title: followUpTitle.trim(),
        description: followUpDesc.trim() || undefined,
        scheduledAt: new Date(followUpDate).toISOString(),
        priority: followUpPriority,
      });
      toast.success('Follow-up Scheduled', 'Reminder saved to your RM agenda.');
      setScheduleFollowUpModal(false);
      setFollowUpTitle('');
      setFollowUpDesc('');
      setFollowUpDate('');
      loadFollowUps();
    } catch (err: any) {
      toast.error('Failed to schedule', err?.message);
    } finally {
      setSubmittingFollowUp(false);
    }
  };

  // Mark follow-up completed
  const handleCompleteFollowUp = async (followUpId: string) => {
    try {
      await rmService.updateFollowUp(followUpId, { status: 'COMPLETED' });
      toast.success('Follow-up Completed', 'Marked as done.');
      loadFollowUps();
    } catch (err: any) {
      toast.error('Action failed', err?.message);
    }
  };

  if (clientLoading) {
    return (
      <Card className="p-12 text-center bg-white border-[var(--border)]">
        <IconLoader2 className="h-7 w-7 animate-spin text-[var(--primary)] mx-auto mb-2" />
        <p className="text-xs text-[var(--muted)]">Loading client workspace…</p>
      </Card>
    );
  }

  if (!client) {
    return (
      <Card className="p-12 text-center bg-white border-[var(--border)]">
        <p className="text-sm font-semibold text-rose-600">Client profile could not be loaded.</p>
        <Button variant="secondary" size="sm" onClick={onBack} className="mt-3">
          <IconArrowLeft className="mr-1.5 h-4 w-4" /> Go Back
        </Button>
      </Card>
    );
  }

  const currentStageConfig =
    STAGES.find((s) => s.value === (client.clientStage || 'NEW_LEAD')) || STAGES[0];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Top Navigation & Client Banner */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={onBack}
            className="text-xs font-semibold cursor-pointer"
          >
            <IconArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to My Clients
          </Button>

          {/* Quick Stage Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-600">Current Stage:</span>
            <select
              value={client.clientStage || 'NEW_LEAD'}
              onChange={(e) => handleStageChange(e.target.value as ClientStage)}
              className="px-3 py-1.5 rounded-xl border border-stone-300 bg-stone-50 font-bold text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[var(--primary)] cursor-pointer"
            >
              {STAGES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Client Identity Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
              {client.photos?.[0]?.url ? (
                <img
                  src={client.photos[0].url}
                  alt={client.firstName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full grid place-items-center text-stone-400">
                  <IconUser className="h-8 w-8" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-[var(--foreground)]">
                  {client.firstName} {client.lastName || ''}
                </h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-stone-100 font-semibold text-stone-700">
                  {client.profileId || 'N/A'}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${currentStageConfig.color}`}
                >
                  {currentStageConfig.label}
                </span>
                <Badge tone={client.subscriptionTier === 'PAID' ? 'success' : 'default'}>
                  {client.subscriptionTier || 'BASIC'} PLAN
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                {client.phone && (
                  <span className="flex items-center gap-1 text-stone-700 font-medium">
                    <IconPhone className="h-3.5 w-3.5 text-emerald-600" /> {client.phone}
                  </span>
                )}
                {client.email && (
                  <span className="flex items-center gap-1">
                    <IconMail className="h-3.5 w-3.5" /> {client.email}
                  </span>
                )}
                {(client.profile?.city || client.profile?.state) && (
                  <span className="flex items-center gap-1">
                    <IconMapPin className="h-3.5 w-3.5" /> {client.profile.city || client.profile.state}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => {
                setLogInteractionModal(true);
                setTargetStage(client.clientStage || 'NEW_LEAD');
              }}
              className="bg-[var(--primary)] text-white hover:bg-[#5E142E] text-xs cursor-pointer"
            >
              <IconMessages className="mr-1.5 h-3.5 w-3.5" /> Log Interaction
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setScheduleFollowUpModal(true)}
              className="text-xs cursor-pointer"
            >
              <IconCalendarEvent className="mr-1.5 h-3.5 w-3.5" /> Schedule Follow-up
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setFindMatchesModal(true);
                handleSearchCandidates();
              }}
              className="bg-rose-50 text-[var(--primary)] border-rose-200 hover:bg-rose-100 text-xs font-semibold cursor-pointer"
            >
              <IconSparkles className="mr-1.5 h-3.5 w-3.5" /> Shortlist Match
            </Button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-t border-[var(--border)] pt-3 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('shortlists')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'shortlists'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <IconHeart className="h-4 w-4" />
            <span>Shortlisted Profiles ({shortlists.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('interactions')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'interactions'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <IconMessages className="h-4 w-4" />
            <span>Interaction History ({interactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('follow-ups')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'follow-ups'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <IconCalendarEvent className="h-4 w-4" />
            <span>Follow-up Reminders ({followUps.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-[var(--primary)] text-white shadow-xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <IconFileText className="h-4 w-4" />
            <span>Full Profile &amp; Preferences</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SHORTLISTS ON BEHALF OF CLIENT */}
      {activeTab === 'shortlists' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">
                Profiles Shortlisted for {client.firstName}
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Profiles you have curated and recommended for this client.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setFindMatchesModal(true);
                handleSearchCandidates();
              }}
              className="bg-[var(--primary)] text-white hover:bg-[#5E142E] text-xs cursor-pointer"
            >
              <IconPlus className="mr-1.5 h-3.5 w-3.5" /> Find &amp; Shortlist Matches
            </Button>
          </div>

          {shortlistsLoading ? (
            <Card className="p-8 text-center bg-white border-[var(--border)]">
              <IconLoader2 className="h-6 w-6 animate-spin text-[var(--primary)] mx-auto mb-1" />
              <p className="text-xs text-[var(--muted)]">Loading shortlist…</p>
            </Card>
          ) : shortlists.length === 0 ? (
            <Card className="p-12 text-center bg-white border-[var(--border)]">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 text-[var(--primary)] grid place-items-center mx-auto mb-3">
                <IconHeart className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-[var(--foreground)]">No Shortlists Yet</h4>
              <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
                Start discovering and shortlisting candidate profiles that match {client.firstName}&apos;s preferences.
              </p>
              <Button
                size="sm"
                onClick={() => {
                  setFindMatchesModal(true);
                  handleSearchCandidates();
                }}
                className="mt-4 bg-[var(--primary)] text-white"
              >
                <IconSparkles className="mr-1.5 h-3.5 w-3.5" /> Browse Candidate Profiles
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shortlists.map((item) => (
                <Card
                  key={item.id}
                  className="bg-white border-[var(--border)] p-4 flex flex-col justify-between hover:shadow-md transition-all space-y-3"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-14 w-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                        {item.candidate?.photos?.[0]?.url ? (
                          <img
                            src={item.candidate.photos[0].url}
                            alt="Candidate"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full grid place-items-center text-stone-400">
                            <IconUser className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-sm text-[var(--foreground)] truncate">
                            {item.candidate?.firstName} {item.candidate?.lastName || ''}
                          </h4>
                          <span className="text-[10px] font-mono text-[var(--muted)] shrink-0">
                            {item.candidate?.profileId || 'N/A'}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted)] truncate">
                          {item.candidate?.profile?.city || 'India'} •{' '}
                          {item.candidate?.profile?.occupation || 'Professional'}
                        </p>
                        <Badge tone="default" size="sm" className="mt-1">
                          Status: {item.status}
                        </Badge>
                      </div>
                    </div>

                    {item.notes && (
                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900">
                        <span className="font-semibold block mb-0.5">RM Recommendation Note:</span>
                        {item.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--muted)]">
                    <span>Added {new Date(item.createdAt).toLocaleDateString()}</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDeleteShortlist(item.candidateId)}
                      className="text-rose-700 hover:bg-rose-50 border-rose-200 text-xs h-7 cursor-pointer"
                    >
                      <IconTrash className="mr-1 h-3 w-3" /> Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERACTION TRACKING */}
      {activeTab === 'interactions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">Interaction History</h3>
              <p className="text-xs text-[var(--muted)]">
                Chronological log of calls, WhatsApp messages, meetings, and counseling notes.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setLogInteractionModal(true);
                setTargetStage(client.clientStage || 'NEW_LEAD');
              }}
              className="bg-[var(--primary)] text-white hover:bg-[#5E142E] text-xs cursor-pointer"
            >
              <IconPlus className="mr-1.5 h-3.5 w-3.5" /> Log Interaction
            </Button>
          </div>

          {interactionsLoading ? (
            <Card className="p-8 text-center bg-white border-[var(--border)]">
              <IconLoader2 className="h-6 w-6 animate-spin text-[var(--primary)] mx-auto mb-1" />
              <p className="text-xs text-[var(--muted)]">Loading interactions…</p>
            </Card>
          ) : interactions.length === 0 ? (
            <Card className="p-12 text-center bg-white border-[var(--border)]">
              <div className="h-12 w-12 rounded-2xl bg-stone-100 text-stone-500 grid place-items-center mx-auto mb-3">
                <IconMessages className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-[var(--foreground)]">No Interactions Logged Yet</h4>
              <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
                Record your conversations, candidate feedbacks, and consultation calls with this client.
              </p>
              <Button
                size="sm"
                onClick={() => setLogInteractionModal(true)}
                className="mt-4 bg-[var(--primary)] text-white"
              >
                <IconPlus className="mr-1.5 h-3.5 w-3.5" /> Log First Interaction
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {interactions.map((interaction) => (
                <Card
                  key={interaction.id}
                  className="p-4 bg-white border-[var(--border)] space-y-2 hover:border-stone-300 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-stone-100 font-bold text-stone-800">
                        {interaction.channel}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                        {interaction.status}
                      </span>
                      {interaction.clientStage && (
                        <span className="text-stone-500">
                          Stage: <strong>{interaction.clientStage}</strong>
                        </span>
                      )}
                    </div>
                    <span className="text-[var(--muted)] flex items-center gap-1">
                      <IconClock className="h-3.5 w-3.5" />
                      {new Date(interaction.interactionAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {interaction.summary}
                  </p>

                  {interaction.details && (
                    <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200/70 whitespace-pre-line">
                      {interaction.details}
                    </p>
                  )}

                  {interaction.rm && (
                    <p className="text-[10px] text-stone-400">
                      Logged by {interaction.rm.firstName} {interaction.rm.lastName || ''}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SCHEDULED FOLLOW-UPS */}
      {activeTab === 'follow-ups' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[var(--foreground)]">Scheduled Follow-ups</h3>
              <p className="text-xs text-[var(--muted)]">
                Planned calls, profile review meetings, and next steps for {client.firstName}.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setScheduleFollowUpModal(true)}
              className="bg-[var(--primary)] text-white hover:bg-[#5E142E] text-xs cursor-pointer"
            >
              <IconPlus className="mr-1.5 h-3.5 w-3.5" /> Schedule Follow-up
            </Button>
          </div>

          {followUpsLoading ? (
            <Card className="p-8 text-center bg-white border-[var(--border)]">
              <IconLoader2 className="h-6 w-6 animate-spin text-[var(--primary)] mx-auto mb-1" />
              <p className="text-xs text-[var(--muted)]">Loading follow-ups…</p>
            </Card>
          ) : followUps.length === 0 ? (
            <Card className="p-12 text-center bg-white border-[var(--border)]">
              <div className="h-12 w-12 rounded-2xl bg-stone-100 text-stone-500 grid place-items-center mx-auto mb-3">
                <IconCalendarEvent className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-[var(--foreground)]">No Follow-ups Scheduled</h4>
              <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
                Schedule a reminder to follow up with {client.firstName} on shortlisted profiles or meetings.
              </p>
              <Button
                size="sm"
                onClick={() => setScheduleFollowUpModal(true)}
                className="mt-4 bg-[var(--primary)] text-white"
              >
                <IconPlus className="mr-1.5 h-3.5 w-3.5" /> Schedule Follow-up
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {followUps.map((fu) => {
                const isPending = fu.status === 'PENDING';
                const isOverdue = isPending && new Date(fu.scheduledAt) < new Date();

                return (
                  <Card
                    key={fu.id}
                    className={`p-4 bg-white border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isOverdue ? 'border-amber-300 bg-amber-50/20' : 'border-[var(--border)]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            fu.priority === 'URGENT'
                              ? 'bg-rose-100 text-rose-800'
                              : fu.priority === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-800'
                          }`}
                        >
                          {fu.priority} PRIORITY
                        </span>
                        <Badge tone={fu.status === 'COMPLETED' ? 'success' : isOverdue ? 'danger' : 'champagne'}>
                          {isOverdue ? 'OVERDUE' : fu.status}
                        </Badge>
                        <span className="text-[var(--muted)] flex items-center gap-1">
                          <IconClock className="h-3.5 w-3.5" />
                          Due: {new Date(fu.scheduledAt).toLocaleString()}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-[var(--foreground)]">{fu.title}</h4>
                      {fu.description && <p className="text-xs text-stone-600">{fu.description}</p>}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {isPending && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteFollowUp(fu.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 cursor-pointer font-semibold"
                        >
                          <IconCheck className="mr-1 h-3.5 w-3.5" /> Mark Completed
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FULL PROFILE & PREFERENCES */}
      {activeTab === 'profile' && (
        <Card className="p-6 bg-white border-[var(--border)] space-y-6">
          <div>
            <h3 className="text-base font-bold text-[var(--foreground)]">Profile Details &amp; Bio</h3>
            <p className="text-xs text-[var(--muted)]">Comprehensive matchmaking data for {client.firstName}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl space-y-2">
              <h4 className="font-bold text-stone-800">Basic Information</h4>
              <p><strong>Full Name:</strong> {client.firstName} {client.lastName || ''}</p>
              <p><strong>Gender:</strong> {client.profile?.gender || 'N/A'}</p>
              <p><strong>Marital Status:</strong> {client.profile?.maritalStatus || 'N/A'}</p>
              <p><strong>Category:</strong> {client.profile?.category || 'Marriage'}</p>
              <p><strong>Community:</strong> {client.profile?.community || 'N/A'}</p>
              <p><strong>Religion / Caste:</strong> {client.profile?.religion || 'N/A'} {client.profile?.caste ? `(${client.profile.caste})` : ''}</p>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl space-y-2">
              <h4 className="font-bold text-stone-800">Career &amp; Location</h4>
              <p><strong>Education:</strong> {client.profile?.education || 'N/A'}</p>
              <p><strong>Occupation:</strong> {client.profile?.occupation || 'N/A'}</p>
              <p><strong>Annual Income:</strong> {client.profile?.annualIncome || 'N/A'}</p>
              <p><strong>Working Place:</strong> {client.profile?.workingPlace || 'N/A'}</p>
              <p><strong>Location:</strong> {client.profile?.city || 'N/A'}, {client.profile?.state || ''}</p>
            </div>
          </div>

          {client.profile?.bio && (
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-stone-800">About / Bio:</h4>
              <p className="p-3 bg-stone-50 rounded-xl text-stone-700 leading-relaxed whitespace-pre-line">
                {client.profile.bio}
              </p>
            </div>
          )}

          {client.preference && (
            <div className="space-y-2 text-xs pt-3 border-t border-[var(--border)]">
              <h4 className="font-bold text-stone-800">Match Preferences</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-stone-50 rounded-xl">
                <div>
                  <span className="text-[var(--muted)] block">Age Preference:</span>
                  <span className="font-semibold text-stone-800">
                    {client.preference.minAge || 18} - {client.preference.maxAge || 60} yrs
                  </span>
                </div>
                <div>
                  <span className="text-[var(--muted)] block">Religions:</span>
                  <span className="font-semibold text-stone-800">{client.preference.religions || 'Any'}</span>
                </div>
                <div>
                  <span className="text-[var(--muted)] block">Location Preference:</span>
                  <span className="font-semibold text-stone-800">{client.preference.location || 'Any'}</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* MODAL: FIND CANDIDATE MATCHES TO SHORTLIST */}
      {findMatchesModal && (
        <Modal
          isOpen={true}
          onClose={() => setFindMatchesModal(false)}
          title={`Find Matches for ${client.firstName}`}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
            {/* Search form */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                <input
                  type="text"
                  placeholder="Search by candidate name, city, profession…"
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchCandidates();
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[var(--border)] rounded-xl text-xs"
                />
              </div>
              <Button
                size="sm"
                onClick={handleSearchCandidates}
                disabled={candidateLoading}
                className="bg-[var(--primary)] text-white"
              >
                {candidateLoading ? <IconLoader2 className="h-4 w-4 animate-spin" /> : 'Search'}
              </Button>
            </div>

            {/* Candidate list */}
            {candidateLoading ? (
              <div className="p-8 text-center text-[var(--muted)]">
                <IconLoader2 className="h-6 w-6 animate-spin text-[var(--primary)] mx-auto mb-2" />
                Searching compatible profiles…
              </div>
            ) : candidateResults.length === 0 ? (
              <div className="p-8 text-center text-[var(--muted)] bg-stone-50 rounded-xl">
                No matching profiles found. Try broadening your search keyword.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {candidateResults.map((cand) => (
                  <Card
                    key={cand.id}
                    className="p-3 bg-white border border-[var(--border)] flex flex-col justify-between gap-3 hover:border-stone-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                        {cand.photos?.[0]?.url ? (
                          <img src={cand.photos[0].url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full grid place-items-center text-stone-400">
                            <IconUser className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-stone-900 truncate">
                          {cand.firstName} {cand.lastName || ''}
                        </h4>
                        <p className="text-[11px] text-[var(--muted)] truncate">
                          {cand.profile?.city || 'India'} • {cand.profile?.occupation || 'Member'}
                        </p>
                        <p className="text-[10px] text-stone-400">ID: {cand.profileId || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                      {cand.isShortlisted ? (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          ✓ Already Shortlisted
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => {
                            setShortlistNoteCandidate(cand);
                            setShortlistNote('');
                          }}
                          className="w-full bg-[var(--primary)] text-white hover:bg-[#5E142E] text-xs h-7"
                        >
                          <IconHeart className="mr-1 h-3 w-3" /> Shortlist for Client
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-[var(--border)]">
              <Button variant="secondary" onClick={() => setFindMatchesModal(false)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: ADD RECOMMENDATION NOTE BEFORE SHORTLISTING */}
      {shortlistNoteCandidate && (
        <Modal
          isOpen={true}
          onClose={() => setShortlistNoteCandidate(null)}
          title={`Shortlist ${shortlistNoteCandidate.firstName} for ${client.firstName}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-stone-700">
              Add an optional recommendation note for this match. You and the client can refer to this note during consultations:
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Excellent family compatibility, matching astrological nakshatra, and similar educational values…"
              value={shortlistNote}
              onChange={(e) => setShortlistNote(e.target.value)}
              className="w-full p-2.5 bg-white border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] focus:ring-1 focus:ring-[var(--primary)]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                disabled={submittingShortlist}
                onClick={() => setShortlistNoteCandidate(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmShortlist}
                disabled={submittingShortlist}
                className="bg-[var(--primary)] text-white"
              >
                {submittingShortlist ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Confirm & Shortlist'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: LOG INTERACTION */}
      {logInteractionModal && (
        <Modal
          isOpen={true}
          onClose={() => setLogInteractionModal(false)}
          title={`Log Interaction with ${client.firstName}`}
        >
          <form onSubmit={handleLogInteraction} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Communication Channel
                </label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-[var(--border)] rounded-xl text-xs font-medium"
                >
                  <option value="CALL">Phone Call</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="EMAIL">Email</option>
                  <option value="MEETING">In-Person Meeting</option>
                  <option value="NOTE">RM Internal Note</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Outcome / Status
                </label>
                <select
                  value={interactionStatus}
                  onChange={(e) => setInteractionStatus(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[var(--border)] rounded-xl text-xs font-medium"
                >
                  <option value="CONNECTED">Connected / Discussed</option>
                  <option value="ATTEMPTED">Attempted (No Answer)</option>
                  <option value="VOICEMAIL">Voicemail Left</option>
                  <option value="SCHEDULED">Meeting Scheduled</option>
                  <option value="RESOLVED">Query Resolved</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Update Client Stage
              </label>
              <select
                value={targetStage}
                onChange={(e) => setTargetStage(e.target.value)}
                className="w-full p-2.5 bg-white border border-[var(--border)] rounded-xl text-xs font-medium"
              >
                {STAGES.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Summary <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Call regarding interest in shortlisted profile IMC-004…"
                value={interactionSummary}
                onChange={(e) => setInteractionSummary(e.target.value)}
                className="w-full p-2.5 bg-white border border-[var(--border)] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Detailed Discussion Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Details of client requirements, family considerations, feedback on previous matches…"
                value={interactionDetails}
                onChange={(e) => setInteractionDetails(e.target.value)}
                className="w-full p-2.5 bg-white border border-[var(--border)] rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={submittingInteraction}
                onClick={() => setLogInteractionModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingInteraction}
                className="bg-[var(--primary)] text-white"
              >
                {submittingInteraction ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Save Interaction Log'
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: SCHEDULE FOLLOW-UP */}
      {scheduleFollowUpModal && (
        <Modal
          isOpen={true}
          onClose={() => setScheduleFollowUpModal(false)}
          title={`Schedule Follow-up with ${client.firstName}`}
        >
          <form onSubmit={handleScheduleFollowUp} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Follow-up Title / Purpose <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Follow up on shortlisted Bangalore profiles…"
                value={followUpTitle}
                onChange={(e) => setFollowUpTitle(e.target.value)}
                className="w-full p-2.5 bg-white border border-[var(--border)] rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Scheduled Date &amp; Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[var(--border)] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Priority</label>
                <select
                  value={followUpPriority}
                  onChange={(e) => setFollowUpPriority(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-[var(--border)] rounded-xl text-xs font-medium"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Description / Checklist (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="List candidate IDs to discuss or questions to ask the family…"
                value={followUpDesc}
                onChange={(e) => setFollowUpDesc(e.target.value)}
                className="w-full p-2.5 bg-white border border-[var(--border)] rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={submittingFollowUp}
                onClick={() => setScheduleFollowUpModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingFollowUp}
                className="bg-[var(--primary)] text-white"
              >
                {submittingFollowUp ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Schedule Reminder'
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
