'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  IconMessageCircle,
  IconSparkles,
  IconX,
  IconArrowRight,
  IconHeartFilled,
  IconMapPin,
  IconBriefcase,
  IconSchool,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { matchesService } from '@/services/matches.service';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import type { Profile } from '@/lib/demo-data';

export interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Profile | null;
  currentUser?: {
    name?: string;
    image?: string;
    verified?: boolean;
    city?: string;
  };
  onStartConversation?: (match: Profile) => Promise<void> | void;
  autoInitializeChat?: boolean;
}

function getInitials(name?: string) {
  if (!name) return 'LC';
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function UserAvatar({
  src,
  name,
  isYou = false,
  verified = false,
}: {
  src?: string;
  name?: string;
  isYou?: boolean;
  verified?: boolean;
}) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name || (isYou ? 'You' : 'Match'));

  return (
    <div className="relative group">
      {/* Outer ambient glow ring */}
      <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#D8B28C] via-[#F4D9C0] to-[#7A1835]/30 opacity-70 blur-xs transition-opacity duration-300 group-hover:opacity-100" />

      {/* Avatar Container */}
      <div className="relative h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-full border-[3.5px] border-white shadow-[0_12px_32px_rgba(122,24,53,0.18)] bg-gradient-to-br from-[#FFF5F2] via-[#FCEFF2] to-[#FAF2EF]">
        {src && !imgError ? (
          <img
            src={src}
            alt={name || 'Profile'}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#7A1835]/10 via-[#FDF2F4] to-[#FAF3EC] text-[#7A1835]">
            <span className="text-xl sm:text-2xl font-black tracking-widest font-heading">{initials}</span>
          </div>
        )}
      </div>

      {/* Verified Badge */}
      {verified && (
        <div className="absolute -top-1 -right-1 z-20 drop-shadow-sm">
          <VerificationBadge type="general" showIconOnly size="md" />
        </div>
      )}

      {/* Identification Pill */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 rounded-full bg-white/95 px-3 py-0.5 text-[11px] font-bold text-[#5C1027] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#EAD8C7] truncate max-w-[96px] backdrop-blur-xs">
        {isYou ? 'You' : (name?.split(' ')[0] || 'Match')}
      </div>
    </div>
  );
}

export function CelebrationModal({
  isOpen,
  onClose,
  match,
  currentUser = {
    name: 'You',
    image: '',
    verified: true,
    city: 'Kochi',
  },
  onStartConversation,
}: CelebrationModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mq.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mq.addEventListener('change', listener);
      return () => mq.removeEventListener('change', listener);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isInitializing) {
        onClose();
      }
    },
    [onClose, isInitializing]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !mounted || !match) return null;

  const partnerName = match.name || 'Your Match';
  const partnerPhoto = match.image || '';
  const currentUserPhoto = currentUser.image || '';
  const compatibilityScore = match.compatibility || 94;

  const handleOneClickCTA = async () => {
    setIsInitializing(true);
    try {
      if (onStartConversation) {
        await onStartConversation(match);
      } else {
        await matchesService.initiateChat(match.id);
      }

      toast.success(
        'Conversation Initialized!',
        `Connecting you with ${partnerName}. Taking you to your private messages.`
      );

      onClose();
      router.push(`/app/messages?user=${match.id}`);
    } catch (error) {
      console.warn('Error during chat initialization CTA:', error);
      toast.info('Opening Messages', `Connecting with ${partnerName}...`);
      onClose();
      router.push(`/app/messages?user=${match.id}`);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleExploreMore = () => {
    onClose();
    router.push('/app/matches');
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
      aria-describedby="celebration-desc"
      className="fixed inset-0 z-[150] overflow-y-auto"
    >
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        {/* Backdrop with elegant cinematic darkness and blur */}
        <div
          className="fixed inset-0 bg-stone-950/75 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
          onClick={() => !isInitializing && onClose()}
          aria-hidden="true"
        />

        {/* Modal Card */}
        <div
          ref={modalRef}
          className={cn(
            'relative w-full max-w-[490px] overflow-hidden rounded-[2.5rem] border border-[#EEDFCE] bg-[#FFFDFC] text-center shadow-[0_32px_80px_rgba(92,16,39,0.3)] transition-all duration-300',
            !prefersReducedMotion && 'animate-in zoom-in-95 fade-in slide-in-from-bottom-5 duration-300'
          )}
        >
          {/* Subtle Decorative Background Layer */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-64 w-72 rounded-full bg-gradient-to-b from-[#FAF0E6] via-[#FDF5EE] to-transparent blur-3xl opacity-80" />
            <div className="absolute top-1/3 -left-12 h-44 w-44 rounded-full bg-[#7A1835]/5 blur-2xl" />
            <div className="absolute bottom-10 -right-12 h-44 w-44 rounded-full bg-[#D8B28C]/15 blur-2xl" />
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isInitializing}
            className="focus-ring absolute right-5 top-5 z-30 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#766B6F] hover:bg-white hover:text-[#211B1E] border border-[#EAD8C7] shadow-xs transition-all active:scale-95 disabled:opacity-50"
            aria-label="Close celebration dialog"
          >
            <IconX className="h-4 w-4" />
          </button>

          {/* Content Body */}
          <div className="relative z-10 px-6 pt-8 pb-7 sm:px-9 sm:pt-9 sm:pb-8">
            {/* Header Badge Pill */}
            <div className="mb-6 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#7A1835] via-[#8B1E3F] to-[#5C1027] px-4 py-1.5 text-xs font-semibold tracking-wide text-white shadow-md shadow-[#7A1835]/20 ring-4 ring-[#FAF3EC]/80">
                <IconSparkles className="h-3.5 w-3.5 text-[#F4D9C0] animate-pulse" />
                <span>It&apos;s a Mutual Match!</span>
              </span>
            </div>

            {/* AVATARS CONNECTION STAGE */}
            <div className="relative mx-auto my-3 flex items-center justify-center">
              {/* Left Avatar (You) */}
              <div className="relative z-10">
                <UserAvatar
                  src={currentUserPhoto}
                  name={currentUser.name || 'You'}
                  isYou={true}
                  verified={currentUser.verified}
                />
              </div>

              {/* Center Heart / Connection Knot */}
              <div className="relative z-30 -mx-3 flex flex-col items-center justify-center">
                <div className="relative grid h-12 w-12 sm:h-13 sm:w-13 place-items-center rounded-full bg-gradient-to-br from-[#7A1835] via-[#5C1027] to-[#3B0715] text-white shadow-[0_8px_20px_rgba(122,24,53,0.35)] ring-4 ring-white">
                  <IconHeartFilled className="h-5 w-5 sm:h-6 sm:w-6 text-[#F9E2CD] drop-shadow-xs" />
                </div>
              </div>

              {/* Right Avatar (Partner) */}
              <div className="relative z-20">
                <UserAvatar
                  src={partnerPhoto}
                  name={partnerName}
                  isYou={false}
                  verified={match.verified}
                />
              </div>
            </div>

            {/* Compatibility Ribbon */}
            <div className="mt-5 mb-4 flex justify-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF3EC] px-3.5 py-1 text-xs font-bold text-[#7A1835] border border-[#E5D2C0]">
                <IconHeartFilled className="h-3.5 w-3.5 text-[#7A1835]" />
                <span>{compatibilityScore}% Compatibility Match</span>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-2 mb-5">
              <h2
                id="celebration-title"
                className="font-editorial-title text-2xl sm:text-[1.75rem] font-extrabold tracking-tight text-[#211B1E] leading-snug"
              >
                <span className="text-[#7A1835]">{partnerName}</span> accepted your interest!
              </h2>
              <p
                id="celebration-desc"
                className="text-xs sm:text-sm text-[#5C5357] leading-relaxed max-w-sm mx-auto"
              >
                Great news! {partnerName} has accepted your interest. Direct matrimonial conversation is now open between you both.
              </p>
            </div>

            {/* Partner Snapshot Details Pill Grid */}
            <div className="mb-6 rounded-2xl border border-[#EEDFCE] bg-white/90 p-3 sm:p-3.5 shadow-2xs backdrop-blur-xs grid grid-cols-3 divide-x divide-[#EEDFCE] text-center">
              <div className="px-1 flex flex-col items-center justify-center">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-[#8C7D82] uppercase tracking-wider mb-0.5">
                  <IconMapPin className="h-3 w-3 text-[#A97C52]" />
                  <span>City</span>
                </span>
                <span className="font-bold text-xs sm:text-sm text-[#211B1E] truncate max-w-full">
                  {match.city || 'Kochi'}
                </span>
              </div>

              <div className="px-1 flex flex-col items-center justify-center">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-[#8C7D82] uppercase tracking-wider mb-0.5">
                  <IconBriefcase className="h-3 w-3 text-[#A97C52]" />
                  <span>Role</span>
                </span>
                <span className="font-bold text-xs sm:text-sm text-[#211B1E] truncate max-w-full">
                  {match.profession || 'Professional'}
                </span>
              </div>

              <div className="px-1 flex flex-col items-center justify-center">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-[#8C7D82] uppercase tracking-wider mb-0.5">
                  <IconSchool className="h-3 w-3 text-[#A97C52]" />
                  <span>Degree</span>
                </span>
                <span className="font-bold text-xs sm:text-sm text-[#211B1E] truncate max-w-full">
                  {match.education || 'Graduate'}
                </span>
              </div>
            </div>

            {/* CTA Actions */}
            <div className="space-y-2">
              <Button
                id="celebration-cta-btn"
                variant="primary"
                size="lg"
                disabled={isInitializing}
                onClick={handleOneClickCTA}
                className="w-full h-12 sm:h-13 rounded-2xl bg-gradient-to-r from-[#7A1835] via-[#8B1E3F] to-[#5C1027] hover:brightness-110 active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-[0_8px_24px_rgba(122,24,53,0.3)] transition-all flex items-center justify-center gap-2 group"
              >
                {isInitializing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Connecting Chat...</span>
                  </>
                ) : (
                  <>
                    <IconMessageCircle className="h-5 w-5 text-[#F4D9C0] group-hover:scale-110 transition-transform" />
                    <span>Say Hello to {partnerName.split(' ')[0]}</span>
                    <IconArrowRight className="h-4 w-4 text-white/70 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                disabled={isInitializing}
                onClick={handleExploreMore}
                className="w-full text-xs font-semibold text-[#766B6F] hover:text-[#5C1027] hover:bg-[#FAF3EC] rounded-xl py-2 transition-colors"
              >
                <span>View in Mutual Matches</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
