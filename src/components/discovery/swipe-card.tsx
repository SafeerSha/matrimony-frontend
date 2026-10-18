'use client';

import React, { useState, useEffect } from 'react';
import { IconHeart, IconX } from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';
import { cn } from '@/lib/cn';

interface SwipeCardProps {
  profile: any;
  isNext?: boolean;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  onCardClick?: () => void;
  showOnboardingHint?: boolean;
  children?: React.ReactNode | ((props: { triggerSwipe: (direction: 'left' | 'right') => void }) => React.ReactNode);
}



export function SwipeCard({
  profile,
  isNext = false,
  onSwipeRight,
  onSwipeLeft,
  onCardClick,
  showOnboardingHint = false,
  children
}: SwipeCardProps) {
  const lastClickRef = React.useRef(0);
  const [showHint, setShowHint] = useState(false);

  // Check both localStorage and sessionStorage
  const checkHintSeen = React.useCallback(() => {
    try {
      if (typeof window === 'undefined') return true;
      return (
        localStorage.getItem('matrimony_swipe_hint_seen') === 'true' ||
        sessionStorage.getItem('matrimony_swipe_hint_seen') === 'true'
      );
    } catch {
      return false;
    }
  }, []);

  const markHintSeen = React.useCallback(() => {
    setShowHint(false);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('matrimony_swipe_hint_seen', 'true');
        sessionStorage.setItem('matrimony_swipe_hint_seen', 'true');
      }
    } catch {}
  }, []);

  // Show swipe hint only if this is designated as the first card (showOnboardingHint)
  // and the user has not already seen or dismissed it
  useEffect(() => {
    if (isNext || !showOnboardingHint) return;
    if (checkHintSeen()) return;

    setShowHint(true);
    const timer = setTimeout(() => {
      markHintSeen();
    }, 4500);
    return () => clearTimeout(timer);
  }, [isNext, showOnboardingHint, checkHintSeen, markHintSeen]);

  const handleCardClick = React.useCallback(() => {
    if (isNext) return;
    const now = performance.now();
    if (now - lastClickRef.current < 400) return;
    lastClickRef.current = now;
    // Dismiss hint on interaction and persist seen flag
    if (showHint) markHintSeen();
    onCardClick?.();
  }, [isNext, onCardClick, showHint, markHintSeen]);

  const {
    handlers,
    dragOffset,
    isDragging,
    isAnimatingOut,
    swipeDirection,
    triggerSwipe,
  } = useSwipeGesture({
    onSwipeRight: () => {
      if (showHint) markHintSeen();
      onSwipeRight();
    },
    onSwipeLeft: () => {
      if (showHint) markHintSeen();
      onSwipeLeft();
    },
    onTap: handleCardClick,
    threshold: 120,
    velocityThreshold: 0.5,
    enabled: !isNext,
  });

  // If user starts dragging, immediately dismiss and mark hint as seen
  useEffect(() => {
    if (isDragging && showHint) {
      markHintSeen();
    }
  }, [isDragging, showHint, markHintSeen]);

  const isSwipingRight = dragOffset.x > 0;
  const isSwipingLeft = dragOffset.x < 0;
  const swipeProgress = Math.min(1, Math.abs(dragOffset.x) / 120);
  const rotation = (dragOffset.x / (typeof window !== 'undefined' ? window.innerWidth : 400)) * 18;

  // Under-card scaling logic
  const underCardScale = isNext ? 0.94 + (0.06 * swipeProgress) : 1;
  const underCardTranslateY = isNext ? 12 * (1 - swipeProgress) : 0;

  // Overlay intensities tied to drag progress
  const overlayOpacity = Math.min(0.45, swipeProgress * 0.55);
  const stampOpacity = Math.min(1, swipeProgress * 2.2);
  const iconScale = 0.5 + swipeProgress * 0.5;

  // Check prefers-reduced-motion
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    : false;

  return (
    <div
      className={cn(
        "absolute inset-0 w-full h-full",
        isNext ? "pointer-events-none" : "z-10"
      )}
      style={isNext ? {
        transform: `scale(${underCardScale}) translateY(${underCardTranslateY}px)`,
        filter: 'blur(12px) brightness(0.85)',
        transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.4s ease-out'
      } : {
        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y * 0.2}px, 0) rotate(${rotation}deg)`,
        filter: 'blur(0px) brightness(1)',
        transition: isDragging ? 'none' :
                    isAnimatingOut ? 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.25s ease-out' :
                    'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.4s ease-out',
        opacity: isAnimatingOut ? 0 : 1,
      }}
      {...handlers}
    >
      <Card
        variant="default"
        role="button"
        tabIndex={isNext ? -1 : 0}
        aria-label={`View ${profile.name}'s profile`}
        onClick={(e) => {
          if (!isNext && !isDragging && !isAnimatingOut) {
            handleCardClick();
          }
        }}
        onKeyDown={(e) => {
          if (!isNext && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleCardClick();
          }
        }}
        className={cn(
          "group relative w-full h-full overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--border)] bg-white shadow-[var(--elevation-floating)] touch-pan-y select-none",
          !isNext && "cursor-pointer",
          !isNext && showHint && !isDragging && !prefersReducedMotion && "animate-card-wiggle"
        )}
      >
        {/* Profile Image & Overlays */}
        <div className="relative h-full w-full bg-[var(--surface-muted)] overflow-hidden">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="h-full w-full object-cover object-center pointer-events-none"
              draggable={false}
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2D121B] via-[#4A1828] to-[#1F0B13] p-8 text-center select-none">
              <div className="grid h-32 w-32 place-items-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-2xl mb-4">
                <span className="font-editorial-title text-6xl font-bold">
                  {profile.name?.charAt(0)?.toUpperCase() || 'M'}
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                Photo not uploaded
              </p>
            </div>
          )}
          <div className="absolute inset-0 photo-overlay-warm pointer-events-none" aria-hidden="true" />

          {/* ===== SWIPE ACTION OVERLAYS ===== */}
          {!isNext && (
            <>
              {/* Hint Seen "Got it" Button */}
              {showHint && (
                <div className="absolute top-4 right-4 z-40 animate-in fade-in zoom-in duration-200">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markHintSeen();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/90 text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-md active:scale-95 transition-all select-none"
                    aria-label="Dismiss hint"
                    title="Got it, don't show again"
                  >
                    <span>Got it</span>
                    <span className="text-emerald-400 font-extrabold">✓</span>
                  </button>
                </div>
              )}
              {/* INTEREST / LIKE — Green wash overlay */}
              <div
                className={cn(
                  "absolute inset-0 z-20 pointer-events-none bg-gradient-to-br from-emerald-500/40 to-emerald-700/40 transition-opacity duration-100",
                  !isNext && showHint && !isDragging && !prefersReducedMotion && "animate-hint-right"
                )}
                style={{
                  opacity: (showHint && !isDragging && !prefersReducedMotion) ? undefined : (isSwipingRight ? overlayOpacity * 2 : 0),
                }}
                aria-hidden="true"
              />

              {/* PASS / NOPE — Slate wash overlay */}
              <div
                className={cn(
                  "absolute inset-0 z-20 pointer-events-none bg-gradient-to-br from-slate-600/40 to-slate-900/40 transition-opacity duration-100",
                  !isNext && showHint && !isDragging && !prefersReducedMotion && "animate-hint-left"
                )}
                style={{
                  opacity: (showHint && !isDragging && !prefersReducedMotion) ? undefined : (isSwipingLeft ? overlayOpacity * 2 : 0),
                }}
                aria-hidden="true"
              />

              {/* LIKE Stamp + Icon */}
              <div
                className={cn(
                  "absolute inset-0 z-30 pointer-events-none flex items-center justify-center transition-opacity duration-100",
                  !isNext && showHint && !isDragging && !prefersReducedMotion && "animate-hint-right"
                )}
                style={{ opacity: (showHint && !isDragging && !prefersReducedMotion) ? undefined : (isSwipingRight ? stampOpacity : 0) }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="rounded-full bg-white/20 backdrop-blur-md p-5 shadow-lg"
                    style={{ transform: `scale(${(showHint && !isDragging) ? 1 : iconScale})`, transition: isDragging ? 'none' : 'transform 0.2s ease-out' }}
                  >
                    <IconHeart className="h-12 w-12 text-white fill-white drop-shadow-md" />
                  </div>
                  <div
                    className="border-[3px] border-white rounded-2xl px-5 py-1.5 text-white font-bold text-2xl tracking-[0.2em] uppercase select-none drop-shadow-lg"
                    style={{ transform: 'rotate(-12deg)' }}
                  >
                    Interest
                  </div>
                </div>
              </div>

              {/* PASS Stamp + Icon */}
              <div
                className={cn(
                  "absolute inset-0 z-30 pointer-events-none flex items-center justify-center transition-opacity duration-100",
                  !isNext && showHint && !isDragging && !prefersReducedMotion && "animate-hint-left"
                )}
                style={{ opacity: (showHint && !isDragging && !prefersReducedMotion) ? undefined : (isSwipingLeft ? stampOpacity : 0) }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="rounded-full bg-white/20 backdrop-blur-md p-5 shadow-lg"
                    style={{ transform: `scale(${(showHint && !isDragging) ? 1 : iconScale})`, transition: isDragging ? 'none' : 'transform 0.2s ease-out' }}
                  >
                    <IconX className="h-12 w-12 text-white drop-shadow-md" />
                  </div>
                  <div
                    className="border-[3px] border-white rounded-2xl px-5 py-1.5 text-white font-bold text-2xl tracking-[0.2em] uppercase select-none drop-shadow-lg"
                    style={{ transform: 'rotate(12deg)' }}
                  >
                    Pass
                  </div>
                </div>
              </div>
            </>
          )}



          {/* User Custom Content (Profile info, buttons, badges) */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 md:p-8 z-10">
            {typeof children === 'function' ? children({ triggerSwipe }) : children}
          </div>
        </div>
      </Card>
    </div>
  );
}
