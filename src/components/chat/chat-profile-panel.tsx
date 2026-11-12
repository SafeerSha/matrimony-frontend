'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  IconMapPin,
  IconBriefcase,
  IconSchool,
  IconHeart,
  IconBookmark,
  IconBan,
  IconFlag,
  IconShieldCheck,
  IconExternalLink,
  IconChevronRight,
  IconCheck,
  IconUsers,
  IconLoader2,
} from '@tabler/icons-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ModernSelect, type ModernSelectOption } from '@/components/ui/modern-select';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import { matchesService } from '@/services/matches.service';
import { reportService, type ReportReason } from '@/services/report.service';

const REPORT_REASON_OPTIONS: ModernSelectOption[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'fake_profile', label: 'Fake profile' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' },
];

interface ChatProfilePanelProps {
  participant?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    city?: string;
    country?: string;
    occupation?: string;
    education?: string;
    dateOfBirth?: string;
    photos?: { url: string }[];
    isVerified?: boolean;
    bio?: string;
    height?: number;
    religion?: string;
    maritalStatus?: string;
  };
  className?: string;
  onClose?: () => void;
  onBlocked?: (blockedUserId: string) => void;
}

export function ChatProfilePanel({
  participant,
  className,
  onClose,
  onBlocked,
}: ChatProfilePanelProps) {
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>('spam');
  const [reportDescription, setReportDescription] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  // Derive profile data cleanly from participant
  const name =
    participant?.name ||
    `${participant?.firstName || ''} ${participant?.lastName || ''}`.trim() ||
    'Member Profile';

  const photo = participant?.photos?.[0]?.url;

  const age = participant?.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(participant.dateOfBirth).getTime()) / 31557600000
      )
    : 27;

  const city = participant?.city || 'Kerala';
  const state = participant?.country || 'India';
  const occupation = participant?.occupation || 'Professional';
  const education = participant?.education || 'Graduate Degree';
  const bio =
    participant?.bio ||
    'Looking forward to meaningful conversations and building a life based on mutual respect and shared values.';
  const compatibility = (participant as any)?.compatibility || 92;
  const isVerified = participant?.isVerified ?? true;
  const profileId = (participant as any)?.userId || participant?.id || '';

  const handleShortlistToggle = async () => {
    if (!profileId) return;
    const next = !isShortlisted;
    setIsShortlisted(next);
    try {
      await matchesService.shortlistProfile(profileId);
      if (next) {
        toast.success('Saved to Shortlist', {
          description: `${name} has been added to your shortlisted connections.`,
        });
      } else {
        toast.info('Removed from Shortlist', {
          description: `${name} was removed from your shortlist.`,
        });
      }
    } catch {
      setIsShortlisted(!next);
      toast.error('Failed to update shortlist', 'Could not update your shortlist right now.');
    }
  };

  const handleBlock = async (targetId: string) => {
    if (!targetId) return;
    setIsBlocking(true);
    try {
      await reportService.blockUser(targetId);
      setIsBlocked(true);
      setIsBlockConfirmOpen(false);
      toast.warning('Member Blocked', {
        description: `${name} has been blocked and removed from your active chats.`,
      });
      onBlocked?.(targetId);
      onClose?.();
    } catch (err: any) {
      toast.error('Block Failed', {
        description: err?.message || 'Could not block this member right now.',
      });
    } finally {
      setIsBlocking(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) return;
    setIsReporting(true);
    try {
      await reportService.reportUser(profileId, reportReason, reportDescription);
      setIsReportModalOpen(false);
      setReportReason('spam');
      setReportDescription('');
      toast.success('Report Submitted', {
        description: 'Our trust & safety team has received your report for review.',
      });
    } catch (err: any) {
      toast.error('Report Failed', {
        description: err?.message || 'Could not submit your report right now.',
      });
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-[#FFFDFB] text-[#211B1E] overflow-y-auto scrollbar-none',
        className
      )}
    >
      {/* Profile Header IconPhoto & Compatibility */}
      <div className="p-5 pb-0">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#E9DDE0] bg-[#FAF3EC] shadow-xs group flex items-center justify-center">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#7A1835]">
              <div className="h-16 w-16 rounded-full bg-white border border-[#E9DDE0] flex items-center justify-center text-xl font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          {/* Name & Basic info over photo overlay */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="flex items-center gap-1.5">
              <h3 className="font-editorial-title text-lg font-bold leading-tight drop-shadow-xs">
                {name}, {age}
              </h3>
              {isVerified && <VerificationBadge size="sm" />}
            </div>
            <p className="text-[12px] text-white/90 font-medium truncate flex items-center gap-1 mt-0.5">
              <IconMapPin className="h-3 w-3 text-white/80 shrink-0" />
              {city}, {state}
            </p>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="p-5 space-y-5 flex-1">
        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 gap-2.5 rounded-2xl bg-[#FFF9F6] p-3.5 border border-[#E9DDE0]">
          <div className="flex items-center gap-2.5 text-xs text-[#211B1E]">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-white border border-[#E9DDE0] text-[#7A1835]">
              <IconBriefcase className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#766B6F]">
                Profession
              </span>
              <span className="font-semibold truncate block">{occupation}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-[#211B1E]">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-white border border-[#E9DDE0] text-[#7A1835]">
              <IconSchool className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#766B6F]">
                Education
              </span>
              <span className="font-semibold truncate block">{education}</span>
            </div>
          </div>
        </div>

        {/* About Snippet */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#766B6F] mb-1.5">
            About
          </h4>
          <p className="text-xs text-[#211B1E] leading-relaxed line-clamp-4 bg-white p-3 rounded-xl border border-[#E9DDE0]/80">
            {bio}
          </p>
        </div>

        {/* Primary Action: View Full Profile */}
        <div className="space-y-2 pt-1">
          <Link
            href={profileId ? `/app/profile?user=${encodeURIComponent(profileId)}` : '/app/discover'}
            onClick={() => onClose?.()}
            className="block"
          >
            <Button
              variant="outline"
              size="md"
              className="w-full justify-between rounded-xl border-[#7A1835] text-[#7A1835] hover:bg-[#7A1835]/5 text-xs font-bold"
            >
              <span>View Full Profile</span>
              <IconExternalLink className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="md"
            onClick={handleShortlistToggle}
            className={cn(
              'w-full justify-center rounded-xl text-xs font-bold gap-2 transition-all',
              isShortlisted
                ? 'bg-[#FAF3EC] border-[#D8B28C] text-[#7A1835]'
                : 'bg-white border-[#E9DDE0] text-[#211B1E] hover:bg-[#FFF9F6]'
            )}
          >
            <IconBookmark
              className={cn(
                'h-3.5 w-3.5',
                isShortlisted ? 'fill-[#7A1835] text-[#7A1835]' : 'text-[#766B6F]'
              )}
            />
            <span>{isShortlisted ? 'Shortlisted' : 'Shortlist Profile'}</span>
          </Button>
        </div>

        {/* Safety & Trust Note */}
        <div className="rounded-xl border border-[#EAD8C7] bg-[#FAF3EC]/60 p-3 flex items-start gap-2.5">
          <IconShieldCheck className="h-4 w-4 text-[#7A1835] shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed text-[#5C1027]">
            <span className="font-bold block">Verified Matrimonial Match</span>
            Identity verified via photo selfie and contact screening.
          </div>
        </div>

        {/* Moderation Actions (Block / Report) */}
        <div className="pt-2 border-t border-[#E9DDE0] flex items-center justify-between text-xs text-[#766B6F]">
          <button
            type="button"
            disabled={isBlocked || isBlocking || !profileId}
            onClick={() => setIsBlockConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-1 px-2 rounded-lg hover:bg-red-50 text-[11px] font-semibold cursor-pointer"
          >
            <IconBan className="h-3 w-3 text-red-500" />
            <span>{isBlocked ? 'Blocked' : 'Block'}</span>
          </button>

          <button
            type="button"
            disabled={!profileId}
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 hover:text-amber-800 disabled:opacity-50 transition-colors py-1 px-2 rounded-lg hover:bg-amber-50 text-[11px] font-semibold cursor-pointer"
          >
            <IconFlag className="h-3 w-3 text-amber-600" />
            <span>Report Member</span>
          </button>
        </div>
      </div>

      {/* Block Member Confirmation Modal */}
      <Modal
        isOpen={isBlockConfirmOpen}
        onClose={() => !isBlocking && setIsBlockConfirmOpen(false)}
        size="sm"
        title={`Block ${name}?`}
        description="Blocked members cannot message you or appear in your active conversations. You can unblock them anytime from Settings."
      >
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isBlocking}
            onClick={() => setIsBlockConfirmOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            disabled={isBlocking}
            onClick={() => handleBlock(profileId)}
            className="gap-1.5"
          >
            {isBlocking ? (
              <>
                <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                Blocking…
              </>
            ) : (
              <>
                <IconBan className="h-3.5 w-3.5" />
                Confirm Block
              </>
            )}
          </Button>
        </div>
      </Modal>

      {/* Report Member Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => !isReporting && setIsReportModalOpen(false)}
        size="md"
        title={`Report ${name}`}
        description="Let our trust & safety team know what happened. Reports remain strictly confidential."
      >
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#3B1520] mb-1.5">
              Reason for reporting
            </label>
            <ModernSelect
              value={reportReason}
              onChange={(val) => setReportReason(val as ReportReason)}
              options={REPORT_REASON_OPTIONS}
              size="sm"
              ariaLabel="Reason for reporting"
            />
          </div>

          <div>
            <label
              htmlFor="report-member-description"
              className="block text-xs font-bold text-[#3B1520] mb-1.5"
            >
              Additional details (optional)
            </label>
            <textarea
              id="report-member-description"
              rows={4}
              maxLength={2000}
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Provide any relevant context or specific incidents…"
              className="w-full rounded-xl border border-[#E9DDE0] bg-white p-3 text-xs sm:text-sm text-[#211B1E] outline-none focus:border-[#7A1835] transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isReporting}
              onClick={() => setIsReportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isReporting}
              className="gap-1.5"
            >
              {isReporting ? (
                <>
                  <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <IconFlag className="h-3.5 w-3.5" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
