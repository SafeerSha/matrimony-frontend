'use client';

import React, { useState } from 'react';
import {
  IconCrown,
  IconCheck,
  IconStar,
  IconLoader2,
  IconX,
  IconShieldCheck,
  IconSparkles,
} from '@tabler/icons-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSubscription } from '@/context/subscription-context';
import { subscriptionService } from '@/services/subscription.service';
import { CONTACT_INFO } from '@/config/contact';
import { isFreeTrialMode } from '@/config/feature-flags';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  title: customTitle,
  description: customDescription,
}: UpgradeModalProps) {
  const { refreshSubscription } = useSubscription();
  const [processingTier, setProcessingTier] = useState<string | null>(null);
  const isFreeTrial = isFreeTrialMode();

  const title = customTitle || (isFreeTrial
    ? '🎉 Early Member Launch: Activate Free Pass'
    : 'Upgrade Your Membership');

  const description = customDescription || (isFreeTrial
    ? 'Enjoy complimentary VIP access during our early member release. Select any plan below to activate with zero payment required.'
    : 'Select a membership plan to unlock unlimited conversations, verified contact details, and priority matchmaking.');

  React.useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      try {
        const nprogress = (window as any).NProgress;
        if (nprogress) {
          nprogress.done?.(true);
          nprogress.remove?.();
        }
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  const plans = [
    {
      id: 'BASIC',
      name: isFreeTrial ? 'Basic Free Trial' : '1 Month Permit',
      badge: isFreeTrial ? 'Launch Special' : 'Basic',
      originalPrice: '₹500',
      price: isFreeTrial ? 'FREE' : '₹500',
      period: isFreeTrial ? 'Trial Pass' : 'month',
      description: 'Ideal for trying out the platform and exploring matches with full access.',
      popular: false,
    },
    {
      id: 'STANDARD',
      name: isFreeTrial ? 'Standard Free Trial' : '3 Months Permit',
      badge: isFreeTrial ? 'Most Popular' : 'Standard',
      originalPrice: '₹1,300',
      price: isFreeTrial ? 'FREE' : '₹1,300',
      period: 'Quarterly',
      description: 'Our most popular plan. Complimentary active matchmaking with verified connections.',
      popular: true,
    },
    {
      id: 'PLUS',
      name: isFreeTrial ? 'Plus Pass' : '6 Months Permit',
      badge: isFreeTrial ? 'Extended Access' : 'Plus',
      originalPrice: '₹2,500',
      price: isFreeTrial ? 'FREE' : '₹2,500',
      period: 'Half-Yearly',
      description: 'Serious about finding a match with extended priority connection time.',
      popular: false,
    },
    {
      id: 'ELITE',
      name: isFreeTrial ? 'Elite Full Pass' : '1 Year Permit',
      badge: isFreeTrial ? 'VIP Elite' : 'Elite',
      originalPrice: '₹5,000',
      price: isFreeTrial ? 'FREE' : '₹5,000',
      period: 'Annual',
      description: 'Complete peace of mind with VIP priority and unlimited access.',
      popular: false,
    },
  ];

  const handleActivate = async (tierId: string, planName: string) => {
    setProcessingTier(tierId);
    try {
      if (isFreeTrial) {
        await subscriptionService.activatePermit(tierId);
        await refreshSubscription();
        toast.success('🎉 Free Pass Activated!', {
          description: `You now have full messaging & match access with the ${planName}.`,
        });
        onClose();
      } else {
        // In paid mode, route to subscription checkout
        onClose();
        window.location.href = `/app/subscription?plan=${tierId}`;
      }
    } catch (err: any) {
      toast.error('Activation Failed', {
        description: err?.message || 'Could not activate permit at this time. Please try again.',
      });
    } finally {
      setProcessingTier(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="xl"
    >
      <div className="space-y-6 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {plans.map((p) => (
            <Card
              key={p.id}
              className={cn(
                'relative p-4 rounded-2xl flex flex-col justify-between transition-all duration-200 border',
                p.popular
                  ? 'border-[var(--accent)] bg-gradient-to-b from-[#FFF9F6] to-white ring-1 ring-[var(--accent)]/60 shadow-sm'
                  : 'border-[var(--border)] bg-white hover:border-[var(--primary)]/30'
              )}
            >
              {p.popular && (
                <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-deep)] text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-sm text-[var(--foreground)]">{p.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF3EC] text-[#8C5D30] border border-[#EAD7C5]">
                    {p.badge}
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5 my-2">
                  {isFreeTrial && (
                    <span className="line-through text-xs text-stone-400 font-semibold">{p.originalPrice}</span>
                  )}
                  <span className={cn(
                    "text-2xl font-editorial-title font-black",
                    isFreeTrial ? "text-emerald-700" : "text-[#801835]"
                  )}>
                    {p.price}
                  </span>
                  <span className="text-xs text-[var(--muted)]">/{p.period}</span>
                </div>

                <p className="text-xs text-[var(--muted-strong)] leading-relaxed mb-3">
                  {p.description}
                </p>

                <div className="space-y-1.5 text-[11px] text-[var(--muted-strong)] mb-4">
                  <div className="flex items-center gap-1.5">
                    <IconCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Send & receive direct messages</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Priority member visibility & contact access</span>
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                disabled={processingTier !== null}
                onClick={() => handleActivate(p.id, p.name)}
                className={cn(
                  'w-full text-xs font-bold rounded-xl h-10',
                  p.popular
                    ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)] shadow-xs'
                    : 'bg-stone-900 text-white hover:bg-black'
                )}
              >
                {processingTier === p.id ? (
                  <>
                    <IconLoader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    {isFreeTrial ? 'Activating Free Pass...' : 'Processing...'}
                  </>
                ) : (
                  isFreeTrial ? `Claim ${p.name}` : `Select ${p.name}`
                )}
              </Button>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] text-[var(--muted)] pt-2 border-t border-[var(--border)] text-center">
          <div className="flex items-center gap-1.5">
            <IconShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              {isFreeTrial
                ? '🎉 Launch Celebration • 100% Free Access • No Payment Required'
                : '🔒 Secure 256-bit Encrypted Checkout • Instant Activation'}
            </span>
          </div>
          <span className="hidden sm:inline">•</span>
          <span>
            Need help? Call{' '}
            <a href={CONTACT_INFO.phoneTel} className="font-semibold text-[var(--primary)] hover:underline">
              {CONTACT_INFO.phone}
            </a>
          </span>
        </div>
      </div>
    </Modal>
  );
}
