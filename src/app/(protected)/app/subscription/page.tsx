'use client';

import { useState } from 'react';
import { IconCheck, IconCrown, IconLoader2, IconStar, IconShieldCheck } from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { FeatureGate } from '@/components/ui/under-development';
import { CONTACT_INFO } from '@/config/contact';
import { isFreeTrialMode } from '@/config/feature-flags';
import { useSubscription } from '@/context/subscription-context';
import { subscriptionService } from '@/services/subscription.service';
import { cn } from '@/lib/cn';
import { toast } from '@/lib/toast';

export default function SubscriptionPage() {
  const { isSubscribed, tier, refreshSubscription } = useSubscription();
  const [processing, setProcessing] = useState<string | null>(null);
  const isFreeTrial = isFreeTrialMode();

  const handleUpgrade = async (tierId: string, planName: string) => {
    setProcessing(tierId);
    try {
      await subscriptionService.activatePermit(tierId);
      await refreshSubscription();
      toast.success(`Subscription Activated`, {
        description: `You are now subscribed to the ${planName}.`,
      });
      setTimeout(() => {
        window.location.href = '/app';
      }, 900);
    } catch (err: any) {
      toast.error('Activation Failed', {
        description: err?.message || 'Could not process subscription. Please try again.',
      });
    } finally {
      setProcessing(null);
    }
  };

  const plans = [
    {
      id: 'BASIC',
      name: '1 Month Permit',
      badge: 'Basic',
      price: '₹500',
      period: 'per month',
      icon: <IconStar className="h-5 w-5 text-slate-500" />,
      description: 'Ideal for trying out the platform and exploring matches.',
      features: [
        'Active Premium full access',
        'Send & accept chat requests',
        'Unlimited messaging with matches',
        'Standard profile visibility'
      ],
      buttonText: isFreeTrial ? 'Activate Free Pass' : 'Subscribe Now',
      color: 'slate'
    },
    {
      id: 'STANDARD',
      name: '3 Months Permit',
      badge: 'Standard',
      price: '₹1,300',
      period: 'Quarterly',
      icon: <IconStar className="h-5 w-5 text-amber-600" />,
      description: 'Our most popular plan. Best value for active matchmaking.',
      features: [
        'Active Premium full access',
        'Send & accept chat requests',
        'Unlimited messaging with matches',
        'Priority profile visibility'
      ],
      buttonText: isFreeTrial ? 'Activate Free Pass' : 'Subscribe Now',
      popular: true,
      color: 'amber'
    },
    {
      id: 'PLUS',
      name: '6 Months Permit',
      badge: 'Plus',
      price: '₹2,500',
      period: 'Half-Yearly',
      icon: <IconCrown className="h-5 w-5 text-[var(--primary)]" />,
      description: 'Serious about finding a match with extended connection time.',
      features: [
        'Active Premium full access',
        'Send & accept chat requests',
        'Unlimited messaging with matches',
        'Priority profile visibility'
      ],
      buttonText: isFreeTrial ? 'Activate Free Pass' : 'Subscribe Now',
      color: 'primary'
    },
    {
      id: 'ELITE',
      name: '1 Year Permit',
      badge: 'Elite',
      price: '₹5,000',
      period: 'Annual',
      icon: <IconCrown className="h-5 w-5 text-[var(--accent)]" />,
      description: 'Complete peace of mind with VIP priority and unlimited access.',
      features: [
        'Active Premium full access',
        'Send & accept chat requests',
        'Unlimited messaging with matches',
        'Highest priority profile visibility'
      ],
      buttonText: isFreeTrial ? 'Activate Free Pass' : 'Subscribe Now',
      color: 'champagne'
    }
  ];

  return (
    <FeatureGate page="subscription" title="Membership & Subscription">
      <div className="w-full max-w-full min-w-0 space-y-8 pb-10">
        <SectionHeader
          eyebrow={isFreeTrial ? 'Launch Celebration' : 'Chat Permits'}
          title={isFreeTrial ? 'Complimentary Member Interactions' : 'Unlock Member Interactions'}
          description={
            isFreeTrial
              ? 'Enjoy full complimentary access during our launch release with zero payment required.'
              : 'An active Premium is required to send chat requests and converse with other members.'
          }
        />

        {/* Current Active Plan Status Banner */}
        {isSubscribed && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200/80 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
                <IconShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold">Active Chat Permit: {tier}</p>
                <p className="text-xs text-emerald-700">
                  Full messaging & match interactions active.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-emerald-700 border border-emerald-200 shadow-2xs">
              Active Member
            </span>
          </div>
        )}

        <div className="w-full max-w-full min-w-0 grid gap-6 md:grid-cols-2 xl:grid-cols-4 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const isCurrent = isSubscribed && tier === plan.id;

            return (
              <Card
                key={plan.name}
                className={cn(
                  "relative p-6 flex flex-col justify-between rounded-2xl transition-all duration-300",
                  isCurrent
                    ? "border-emerald-500 bg-gradient-to-b from-emerald-50/40 via-white to-white ring-2 ring-emerald-500/50 shadow-md"
                    : plan.popular
                      ? "border-[var(--accent)] bg-gradient-to-b from-[#FFF9F6] via-white to-white shadow-[0_16px_40px_-15px_rgba(216,178,140,0.25)] ring-1 ring-[var(--accent)]/70"
                      : "border-[var(--border)] bg-white shadow-sm hover:shadow-md hover:border-[var(--primary)]/30"
                )}
              >
                {isCurrent ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                    Current Plan
                  </div>
                ) : plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-deep)] text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                    Most Popular
                  </div>
                )}

                <div>
                  {/* Header: Icon & Savings Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                      "h-11 w-11 rounded-xl flex items-center justify-center",
                      plan.color === 'slate' ? 'bg-slate-100' :
                        plan.color === 'amber' ? 'bg-[#FAF3EC]' :
                          plan.color === 'champagne' ? 'bg-[#FAF3EC]' : 'bg-[var(--primary-light)]'
                    )}>
                      {plan.icon}
                    </div>
                    {plan.badge && (
                      <span className={cn(
                        "text-[11px] font-bold px-2.5 py-0.5 rounded-full border",
                        plan.popular
                          ? "bg-[#FAF3EC] text-[#8C5D30] border-[#EAD7C5]"
                          : "bg-stone-100 text-stone-700 border-stone-200"
                      )}>
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tight">{plan.name}</h3>
                  <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed min-h-[34px]">{plan.description}</p>

                  {/* Price */}
                  <div className="my-5 pb-5 border-b border-[var(--border)]">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-3xl sm:text-4xl font-editorial-title font-bold text-[var(--foreground)] tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-[var(--muted)] whitespace-nowrap">
                        /{plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3.5 mb-8">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <IconCheck className={cn(
                          "h-4 w-4 shrink-0 mt-0.5",
                          plan.color === 'slate' ? "text-stone-400" :
                            plan.color === 'amber' || plan.color === 'champagne' ? "text-[var(--accent)]" : "text-[var(--primary)]"
                        )} />
                        <span className="text-xs sm:text-sm font-medium text-[var(--foreground)] leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  disabled={isCurrent || processing !== null}
                  onClick={() => handleUpgrade(plan.id, plan.name)}
                  className={cn(
                    "w-full h-11 text-xs sm:text-sm font-bold shadow-sm transition-all mt-auto",
                    isCurrent ? "bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default" :
                      plan.popular ? "bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)] shadow-[0_4px_16px_var(--primary-shadow)]" :
                        "bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)] shadow-[0_4px_14px_var(--primary-shadow)]"
                  )}
                >
                  {processing === plan.id ? (
                    <><IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> Activating...</>
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12 max-w-md mx-auto space-y-2">
          <p className="text-xs text-[var(--muted)]">
            Secure 256-bit SSL encrypted checkout. Membership plans activate immediately upon confirmation.
          </p>
          <p className="text-xs text-[var(--muted)]">
            Need customized plan assistance? Contact customer care at{" "}
            <a href={CONTACT_INFO.phoneTel} className="font-semibold text-[var(--primary)] hover:underline">
              {CONTACT_INFO.phone}
            </a>{" "}
            or{" "}
            <a href={CONTACT_INFO.emailMailto} className="font-semibold text-[var(--primary)] hover:underline">
              {CONTACT_INFO.email}
            </a>
          </p>
        </div>
      </div>
    </FeatureGate>
  );
}
