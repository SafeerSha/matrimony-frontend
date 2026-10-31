'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  IconCrown,
  IconSparkles,
  IconMessages,
  IconArrowRight,
  IconShieldCheck,
  IconTrendingUp,
  IconX,
  IconLoader2,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { useSubscription } from '@/context/subscription-context';
import { subscriptionService } from '@/services/subscription.service';
import { toast } from '@/lib/toast';
import { isFreeTrialMode } from '@/config/feature-flags';

export interface SubscriptionFeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface SubscriptionPromptSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPlans?: () => void;
  title?: string;
  description?: string;
  features?: (string | SubscriptionFeatureItem)[];
  ctaText?: string;
}

export function SubscriptionPromptSheet({
  isOpen,
  onClose,
  onViewPlans,
  title: customTitle,
  description: customDescription,
  features: customFeatures,
  ctaText: customCtaText,
}: SubscriptionPromptSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const { refreshSubscription } = useSubscription();
  const isFreeTrial = isFreeTrialMode();

  const title = customTitle || (isFreeTrial ? 'Enjoy Free Full Access' : 'Unlock More Meaningful Connections');
  const description = customDescription || (isFreeTrial
    ? 'To celebrate our launch, enjoy unlimited messaging, verified contacts, and priority connections with zero payment required.'
    : 'Upgrade your membership to enjoy exclusive communication and connection features.');
  const ctaText = customCtaText || (isFreeTrial ? 'Claim Free Trial 🎉' : 'Explore Membership Plans');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalTouchAction = document.body.style.touchAction;

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.touchAction = originalTouchAction;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !mounted) return null;

  const handleClaimTrial = async () => {
    setIsActivating(true);
    try {
      await subscriptionService.activatePermit('BASIC');
      await refreshSubscription();
      toast.success('🎉 Free Trial Activated!', {
        description: 'You now have complimentary full messaging & match access. Enjoy connecting!',
      });
      onClose();
    } catch (err: any) {
      toast.error('Activation Failed', {
        description: err?.message || 'Could not activate free trial. Please try again.',
      });
    } finally {
      setIsActivating(false);
    }
  };

  const handlePrimaryAction = () => {
    if (isFreeTrial) {
      handleClaimTrial();
    } else {
      if (onViewPlans) {
        onViewPlans();
      } else {
        window.location.href = '/app/subscription';
      }
    }
  };

  const defaultFeatures: SubscriptionFeatureItem[] = [
    {
      icon: <IconMessages className="h-4.5 w-4.5 text-[#801835]" />,
      title: 'Unlimited Direct Conversations',
      description: 'Initiate and receive private 1-on-1 messages with matches',
    },
    {
      icon: <IconSparkles className="h-4.5 w-4.5 text-[#801835]" />,
      title: 'Expanded Daily Requests',
      description: 'Send up to 200 daily interests with zero artificial barriers',
    },
    {
      icon: <IconShieldCheck className="h-4.5 w-4.5 text-emerald-600" />,
      title: 'Verified Profiles & Contact Access',
      description: 'Connect safely with authenticated matrimonial candidates',
    },
    {
      icon: <IconTrendingUp className="h-4.5 w-4.5 text-[var(--accent)]" />,
      title: 'Priority Profile Visibility',
      description: 'Get highlighted at the top of partner search recommendations',
    },
  ];

  const features: SubscriptionFeatureItem[] = customFeatures && customFeatures.length > 0
    ? customFeatures.map((item, idx) => {
        if (typeof item === 'string') {
          return {
            icon: defaultFeatures[idx % defaultFeatures.length].icon,
            title: item,
            description: '',
          };
        }
        return item;
      })
    : defaultFeatures;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscription-sheet-title"
      className="fixed inset-0 z-50 flex flex-col justify-end touch-none overscroll-none select-none"
    >
      {/* Dimmed backdrop with subtle blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in touch-none overscroll-none"
        onClick={onClose}
        onTouchMove={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onWheel={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        aria-hidden="true"
      />

      {/* Slide-up Bottom Sheet Canvas */}
      <div
        className={cn(
          "relative z-10 mx-auto w-full max-w-[460px] sm:max-w-md max-h-[92vh] flex flex-col rounded-t-[2.25rem] bg-gradient-to-b from-[#FFFDFB] via-[#FCF8F5] to-[#FDF4F6] border-t border-[var(--champagne-border)] shadow-[0_-12px_44px_rgba(26,12,18,0.22)] overflow-hidden overscroll-contain",
          "animate-in slide-in-from-bottom duration-300 ease-out"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Champagne Gold Luxury Shimmer Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--accent)]/60 to-transparent shrink-0" />

        {/* Drag Handle & Close Bar */}
        <div 
          className="relative pt-3 pb-1 px-5 flex items-center justify-between shrink-0 touch-none"
          onTouchMove={(e) => e.stopPropagation()}
        >
          <div className="w-8" aria-hidden="true" />
          {/* Centered Drag Pill */}
          <div
            className="h-1.5 w-11 rounded-full bg-[#DECFC4]/80 cursor-grab active:cursor-grabbing hover:bg-[#DECFC4] transition-colors"
            onClick={onClose}
            title="Drag or tap to dismiss"
          />
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="focus-ring grid h-8 w-8 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--muted)] hover:bg-[#EEDCC8]/60 hover:text-[var(--foreground)] transition-colors cursor-pointer shrink-0"
            aria-label="Close"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Sheet Content with overscroll-contain & touch-pan-y */}
        <div 
          className="flex-1 overflow-y-auto px-5 sm:px-6 pt-1 pb-4 scrollbar-none overscroll-contain touch-pan-y select-text"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center text-center">
            {/* Jewelry-Grade Membership Emblem */}
            <div className="relative my-2 flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-[var(--primary)]/15 blur-lg" />
              <div className="relative h-13 w-13 rounded-2xl bg-gradient-to-br from-[#9E1D3B] via-[#801835] to-[#5E0E24] text-white flex items-center justify-center shadow-md shadow-rose-950/25 border border-white/30">
                <IconCrown className="h-7 w-7 text-[#F3E1C8] drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.35)]" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-5.5 w-5.5 rounded-full bg-[#FFF9F6] border border-[#EEDCC8] shadow-xs flex items-center justify-center">
                <IconSparkles className="h-3 w-3 text-[var(--accent)]" />
              </div>
            </div>

            {/* Launch Free Trial Tag or Premium Tag */}
            {isFreeTrial ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold tracking-wide border border-emerald-200 shadow-2xs mt-1">
                🎉 Launch Celebration • Free Trial
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#FAF3EC] text-[#8C5D30] text-[10.5px] font-bold tracking-wider uppercase border border-[#EAD7C5] shadow-2xs mt-1">
                Premium Matchmaking
              </span>
            )}

            {/* Compelling Benefit-Oriented Heading */}
            <h2
              id="subscription-sheet-title"
              className="font-editorial-title text-xl sm:text-[1.45rem] font-bold text-[var(--foreground)] tracking-tight text-center mt-2.5 leading-snug"
            >
              {title}
            </h2>

            {/* Supporting Emotionally-Engaging Subtitle */}
            <p className="mt-1.5 text-xs sm:text-[13px] text-[var(--muted)] text-center leading-relaxed max-w-[340px] mx-auto">
              {description}
            </p>

            {/* Value Highlights Showcase Card */}
            <div className="w-full bg-white/95 backdrop-blur-sm border border-[#EEDCC8]/90 rounded-2xl p-3 sm:p-3.5 my-4 divide-y divide-[#EEDCC8]/40 shadow-xs text-left">
              {features.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 py-2.5 first:pt-1 last:pb-1"
                >
                  <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-br from-[#FAF8F5] to-[#FDF4F6] border border-[#EEDCC8]/70 flex items-center justify-center shrink-0 shadow-2xs">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[var(--foreground)] tracking-tight">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-[var(--muted)] leading-tight truncate sm:text-wrap mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Fixed Action Panel */}
        <div 
          className="px-5 sm:px-6 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-[#EEDCC8]/60 bg-white/80 backdrop-blur-md shrink-0 space-y-2 touch-none overscroll-none"
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* Primary CTA Button */}
          <Button
            variant="primary"
            size="lg"
            disabled={isActivating}
            onClick={handlePrimaryAction}
            className="w-full h-12 rounded-full font-bold text-sm bg-gradient-to-b from-[#9E1D3B] via-[#801835] to-[#5E0E24] text-white border-t border-t-white/35 border-x border-x-[#72122B]/60 border-b-[3.5px] border-b-[#420816] shadow-[0_6px_20px_rgba(94,14,36,0.35)] flex items-center justify-center gap-2 hover:brightness-105 active:translate-y-[2px] active:border-b-[1px] active:scale-100 transition-all select-none cursor-pointer disabled:opacity-80"
          >
            {isActivating ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin text-white" />
                <span>Activating Your Free Trial...</span>
              </>
            ) : (
              <>
                <span>{ctaText}</span>
                <IconArrowRight className="h-4 w-4 stroke-[2.5]" />
              </>
            )}
          </Button>

          {/* Micro Trust Guarantee Note */}
          <p className="text-[10.5px] text-[var(--subtle-foreground)] text-center tracking-normal font-medium">
            {isFreeTrial
              ? '🎉 100% Free Launch Gift • No credit card required • Instant 1-click activation'
              : 'Plans start from ₹500/month • Instant activation • No hidden auto-renewals'}
          </p>

          <div className="flex items-center justify-center gap-3 pt-0.5">
            {isFreeTrial && onViewPlans && (
              <>
                <button
                  type="button"
                  onClick={onViewPlans}
                  className="text-xs font-semibold text-[#801835] hover:underline cursor-pointer"
                >
                  View all plans
                </button>
                <span className="text-stone-300">•</span>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
