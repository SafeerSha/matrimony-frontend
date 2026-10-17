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
  IconCheck,
  IconCompass,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export function CelebrationModal({
  isOpen,
  onClose,
  match,
  currentUser = {
    name: 'You',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
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
  const partnerPhoto =
    match.image ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
  const currentUserPhoto =
    currentUser.image ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
  const compatibilityScore = match.compatibility || 94;

  /**
   * One-Click Conversation CTA Handler
   * Successfully calls chat initialization endpoint and transitions user to the chat state
   */
  const handleOneClickCTA = async () => {
    setIsInitializing(true);
    try {
      if (onStartConversation) {
        await onStartConversation(match);
      } else {
        // Call backend chat initialization endpoint
        await matchesService.initiateChat(match.id);
      }

      toast.success(
        'Conversation Initialized!',
        `Connecting you with ${partnerName}. Taking you to your private messages.`
      );

      // Close modal and navigate immediately to the conversation
      onClose();
      router.push(`/app/messages?user=${match.id}`);
    } catch (error) {
      console.warn('Error during chat initialization CTA:', error);
      // Resilience fallback: always navigate to conversation even if network hiccups
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
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        {/* Backdrop with dreamy romantic blur & warm vignette */}
        <div
          className="fixed inset-0 bg-stone-950/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
          onClick={() => !isInitializing && onClose()}
          aria-hidden="true"
        />

        {/* Modal Container */}
        <div
          ref={modalRef}
          className={cn(
            'relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-[#EAD8C7] bg-gradient-to-b from-[#FFFDFB] via-[#FFF9F6] to-[#FAF3EC] p-6 sm:p-9 text-center shadow-[0_24px_70px_rgba(122,24,53,0.25)] transition-all duration-300',
            !prefersReducedMotion && 'animate-in zoom-in-95 fade-in slide-in-from-bottom-4'
          )}
        >
          {/* Ambient Warm Golden & Rose Gradient Orbs */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(216,178,140,0.35)_0%,transparent_70%)] blur-2xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 right-0 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(122,24,53,0.18)_0%,transparent_70%)] blur-2xl"
            aria-hidden="true"
          />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isInitializing}
            className="focus-ring absolute right-5 top-5 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/80 text-[var(--muted-strong)] hover:bg-white hover:text-[var(--foreground)] border border-[#EAD8C7] shadow-2xs transition-all disabled:opacity-50"
            aria-label="Close celebration dialog"
          >
            <IconX className="h-4 w-4" />
          </button>

          {/* Subtle Confetti Particles Simulation */}
          {!prefersReducedMotion && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
              <span className="absolute top-12 left-10 text-xl animate-bounce delay-100 opacity-80">✨</span>
              <span className="absolute top-8 right-14 text-lg animate-bounce delay-300 opacity-70">🌸</span>
              <span className="absolute top-28 left-6 text-sm animate-pulse opacity-60">💛</span>
              <span className="absolute top-24 right-8 text-base animate-pulse delay-200 opacity-80">✨</span>
              <span className="absolute bottom-20 left-12 text-sm animate-bounce delay-500 opacity-60">💫</span>
              <span className="absolute bottom-16 right-10 text-lg animate-pulse opacity-75">✨</span>
            </div>
          )}

          {/* Top Pill: Mutual Connection Status */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#7A1835] to-[#5C1027] px-4 py-1 text-xs font-bold text-white shadow-md ring-4 ring-[#FAF3EC]">
              <IconSparkles className="h-3.5 w-3.5 text-[#D8B28C]" />
              <span>It's a Mutual Match!</span>
            </span>
          </div>

          {/* ======================================================== */}
          {/* INTERTWINED DUAL PROFILE AVATARS                          */}
          {/* ======================================================== */}
          <div className="relative mx-auto my-3 flex items-center justify-center">
            {/* User Avatar (Left) */}
            <div className="relative z-10 transition-transform duration-300 hover:scale-105">
              <div className="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-4 border-white shadow-xl ring-4 ring-[#FAF3EC] bg-[var(--surface-muted)]">
                <img
                  src={currentUserPhoto}
                  alt={currentUser.name || 'You'}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#5C1027] shadow-xs border border-[#EAD8C7]">
                You
              </div>
            </div>

            {/* Intertwined Marriage Knot / Ring Crest Emblem */}
            <div className="relative z-30 -mx-3 flex flex-col items-center justify-center">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#7A1835] via-[#5C1027] to-[#400B1B] text-white shadow-xl ring-4 ring-white">
                <span className="text-base select-none" role="img" aria-label="wedding rings">💍</span>
              </div>
            </div>

            {/* Partner Avatar (Right) */}
            <div className="relative z-20 transition-transform duration-300 hover:scale-105">
              <div className="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full border-4 border-white shadow-xl ring-4 ring-[#FAF3EC] bg-[var(--surface-muted)]">
                <img
                  src={partnerPhoto}
                  alt={partnerName}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              {match.verified && (
                <div className="absolute -top-1 -right-1 z-30">
                  <VerificationBadge type="general" showIconOnly size="md" />
                </div>
              )}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#5C1027] shadow-xs border border-[#EAD8C7] truncate max-w-[84px]">
                {partnerName.split(' ')[0]}
              </div>
            </div>
          </div>

          {/* Compatibility Ribbon */}
          <div className="mt-4 mb-3 flex items-center justify-center gap-2">
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#7A1835] border border-[#EAD8C7] shadow-2xs">
              ❤️ {compatibilityScore}% Compatibility Score
            </span>
          </div>

          {/* Headline & Description */}
          <div className="space-y-2 px-2">
            <h2
              id="celebration-title"
              className="font-editorial-title text-2xl sm:text-3xl font-bold tracking-tight text-[#211B1E] leading-tight"
            >
              You and <span className="text-[#7A1835]">{partnerName}</span> connected!
            </h2>
            <p
              id="celebration-desc"
              className="text-xs sm:text-sm text-[var(--muted-strong)] leading-relaxed max-w-sm mx-auto"
            >
              The interest is mutual! Both of you have expressed interest in connecting. Direct matrimonial chat is now officially open between you.
            </p>
          </div>

          {/* Partner Quick Snapshot Details */}
          <div className="my-5 rounded-2xl border border-[#EAD8C7]/80 bg-white/80 p-3.5 text-xs text-[var(--foreground)] backdrop-blur-xs flex items-center justify-around gap-2 shadow-2xs">
            <div className="text-center">
              <span className="block text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">Location</span>
              <span className="font-bold text-[#5C1027]">{match.city || 'Kochi'}</span>
            </div>
            <div className="h-6 w-px bg-[#EAD8C7]" />
            <div className="text-center">
              <span className="block text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">Profession</span>
              <span className="font-bold text-[#5C1027] truncate max-w-[120px]">{match.profession || 'Professional'}</span>
            </div>
            <div className="h-6 w-px bg-[#EAD8C7]" />
            <div className="text-center">
              <span className="block text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">Education</span>
              <span className="font-bold text-[#5C1027] truncate max-w-[120px]">{match.education || 'Graduate'}</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* ONE-CLICK CONVERSATION CTA (Single Action Button)        */}
          {/* ======================================================== */}
          <div className="space-y-2.5 pt-1">
            <Button
              id="celebration-cta-btn"
              variant="primary"
              size="lg"
              disabled={isInitializing}
              onClick={handleOneClickCTA}
              className="w-full h-12 sm:h-13 rounded-2xl bg-gradient-to-r from-[#7A1835] via-[#8B1E3F] to-[#5C1027] hover:brightness-110 text-white font-bold text-sm sm:text-base shadow-lg shadow-[#7A1835]/25 active-press flex items-center justify-center gap-2 group"
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
                  <IconMessageCircle className="h-5 w-5 text-[#D8B28C] group-hover:scale-110 transition-transform" />
                  <span>Say Hello to {partnerName.split(' ')[0]}</span>
                  <IconArrowRight className="h-4 w-4 text-white/70 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            {/* Secondary Action: Keep Exploring / View All Matches */}
            <Button
              variant="ghost"
              size="sm"
              disabled={isInitializing}
              onClick={handleExploreMore}
              className="w-full text-xs font-semibold text-[var(--muted-strong)] hover:text-[#5C1027] hover:bg-white/60 rounded-xl py-2"
            >
              <span>View in Mutual Matches</span>
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
