'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';
import { cn } from '@/lib/cn';

interface SwipeCardProps {
  profile: any;
  isNext?: boolean;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  onCardClick?: () => void;
  children?: React.ReactNode | ((props: { triggerSwipe: (direction: 'left' | 'right') => void }) => React.ReactNode);
}

export function SwipeCard({
  profile,
  isNext = false,
  onSwipeRight,
  onSwipeLeft,
  onCardClick,
  children
}: SwipeCardProps) {
  const lastClickRef = React.useRef(0);
  const handleCardClick = React.useCallback(() => {
    if (isNext) return;
    const now = performance.now();
    if (now - lastClickRef.current < 400) return;
    lastClickRef.current = now;
    onCardClick?.();
  }, [isNext, onCardClick]);

  const {
    handlers,
    dragOffset,
    isDragging,
    isAnimatingOut,
    swipeDirection,
    triggerSwipe,
  } = useSwipeGesture({
    onSwipeRight,
    onSwipeLeft,
    onTap: handleCardClick,
    threshold: 120,
    velocityThreshold: 0.5,
    enabled: !isNext, // Only the top card is swipeable
  });

  const isSwipingRight = dragOffset.x > 0;
  const swipeProgress = Math.min(1, Math.abs(dragOffset.x) / 120);
  const rotation = (dragOffset.x / window.innerWidth) * 18; // Max 18 deg tilt

  // Under-card scaling logic
  const underCardScale = isNext ? 0.94 + (0.06 * swipeProgress) : 1;
  const underCardTranslateY = isNext ? 12 * (1 - swipeProgress) : 0;

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
          "group relative w-full h-full overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-white shadow-[var(--elevation-floating)] touch-pan-y select-none",
          !isNext && "cursor-pointer"
        )}
      >
        {/* Profile Image & Overlays */}
        <div className="relative h-full w-full bg-[var(--surface-muted)] overflow-hidden">
          <img
            src={profile.image}
            alt={profile.name}
            className="h-full w-full object-cover object-center pointer-events-none"
            draggable={false}
          />
          <div className="absolute inset-0 photo-overlay-warm pointer-events-none" aria-hidden="true" />

          {/* Stamps for Like/Pass */}
          {!isNext && (
            <>
              {/* LIKE Stamp */}
              <div 
                className="absolute top-10 left-8 z-20 pointer-events-none transition-opacity duration-150"
                style={{ opacity: isSwipingRight ? Math.min(1, swipeProgress * 2) : 0 }}
              >
                <div className="border-4 border-emerald-500 rounded-xl px-4 py-1 text-emerald-500 font-bold text-3xl tracking-widest uppercase rotate-[-15deg] bg-white/10 backdrop-blur-sm shadow-sm">
                  Interest
                </div>
              </div>

              {/* NOPE Stamp */}
              <div 
                className="absolute top-10 right-8 z-20 pointer-events-none transition-opacity duration-150"
                style={{ opacity: !isSwipingRight && dragOffset.x < 0 ? Math.min(1, swipeProgress * 2) : 0 }}
              >
                <div className="border-4 border-rose-500 rounded-xl px-4 py-1 text-rose-500 font-bold text-3xl tracking-widest uppercase rotate-[15deg] bg-white/10 backdrop-blur-sm shadow-sm">
                  Pass
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
