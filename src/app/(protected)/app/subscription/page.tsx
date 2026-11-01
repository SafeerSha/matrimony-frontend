'use client';

import { useState, useEffect } from 'react';
import {
  IconCheck,
  IconCrown,
  IconLoader2,
  IconStar,
  IconShieldCheck,
  IconPhone,
  IconHeart,
  IconAlertCircle,
  IconRefresh,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { FeatureGate } from '@/components/ui/under-development';
import { CONTACT_INFO } from '@/config/contact';
import { isFreeTrialMode } from '@/config/feature-flags';
import { useSubscription } from '@/context/subscription-context';
import { subscriptionService, type SubscriptionPlan } from '@/services/subscription.service';
import { cn } from '@/lib/cn';
import { toast } from '@/lib/toast';

export default function SubscriptionPage() {
  const { isSubscribed, tier, refreshSubscription } = useSubscription();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const isFreeTrial = isFreeTrialMode();

  const loadPlans = async () => {
    try {
      setLoadingPlans(true);
      setFetchError(null);
      const data = await subscriptionService.getPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load subscription plans:', err);
      setFetchError(err?.message || 'Failed to load membership plans. Please try again.');
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

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

  const getPlanVisuals = (plan: SubscriptionPlan, index: number) => {
    const code = plan.id.toUpperCase();
    if (plan.popular) {
      return {
        color: 'amber',
        icon: <IconCrown className="h-5 w-5 text-amber-600" />,
      };
    }
    if (code === 'ELITE' || code.includes('VIP') || plan.durationDays >= 365) {
      return {
        color: 'champagne',
        icon: <IconCrown className="h-5 w-5 text-[var(--accent)]" />,
      };
    }
    if (code === 'PLUS' || code.includes('PRO') || plan.durationDays >= 180) {
      return {
        color: 'primary',
        icon: <IconStar className="h-5 w-5 text-[var(--primary)]" />,
      };
    }
    if (index === 0 || code === 'BASIC') {
      return {
        color: 'slate',
        icon: <IconStar className="h-5 w-5 text-slate-500" />,
      };
    }
    return {
      color: 'primary',
      icon: <IconStar className="h-5 w-5 text-[var(--primary)]" />,
    };
  };

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

        {/* Loading Skeletons */}
        {loadingPlans && (
          <div className="w-full max-w-full min-w-0 grid gap-6 md:grid-cols-2 xl:grid-cols-4 max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm flex flex-col justify-between h-[460px] animate-pulse"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-11 w-11 rounded-xl bg-stone-200" />
                    <div className="h-5 w-16 rounded-full bg-stone-200" />
                  </div>
                  <div className="h-6 w-3/4 bg-stone-200 rounded mb-2" />
                  <div className="h-4 w-full bg-stone-100 rounded mb-4" />
                  <div className="h-10 w-1/2 bg-stone-200 rounded my-5" />
                  <div className="space-y-3 mb-6">
                    <div className="h-4 w-5/6 bg-stone-100 rounded" />
                    <div className="h-4 w-4/6 bg-stone-100 rounded" />
                    <div className="h-4 w-5/6 bg-stone-100 rounded" />
                  </div>
                </div>
                <div className="h-11 w-full bg-stone-200 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loadingPlans && fetchError && (
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 grid place-items-center mx-auto">
              <IconAlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-rose-900">Unable to load membership plans</h3>
            <p className="text-xs text-rose-700">{fetchError}</p>
            <Button
              onClick={loadPlans}
              variant="outline"
              size="sm"
              className="border-rose-300 text-rose-800 hover:bg-rose-100 text-xs"
            >
              <IconRefresh className="mr-1.5 h-3.5 w-3.5" /> Retry
            </Button>
          </div>
        )}

        {/* Dynamic Plans Grid */}
        {!loadingPlans && !fetchError && plans.length > 0 && (
          <div className="w-full max-w-full min-w-0 grid gap-6 md:grid-cols-2 xl:grid-cols-4 max-w-7xl mx-auto">
            {plans.map((plan, index) => {
              const isCurrent = isSubscribed && tier?.toUpperCase() === plan.id.toUpperCase();
              const visuals = getPlanVisuals(plan, index);

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    'relative p-6 flex flex-col justify-between rounded-2xl transition-all duration-300',
                    isCurrent
                      ? 'border-emerald-500 bg-gradient-to-b from-emerald-50/40 via-white to-white ring-2 ring-emerald-500/50 shadow-md'
                      : plan.popular
                        ? 'border-[var(--accent)] bg-gradient-to-b from-[#FFF9F6] via-white to-white shadow-[0_16px_40px_-15px_rgba(216,178,140,0.25)] ring-1 ring-[var(--accent)]/70'
                        : 'border-[var(--border)] bg-white shadow-sm hover:shadow-md hover:border-[var(--primary)]/30'
                  )}
                >
                  {isCurrent ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                      Current Plan
                    </div>
                  ) : (
                    plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-deep)] text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                        Most Popular
                      </div>
                    )
                  )}

                  <div>
                    {/* Header: Icon & Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={cn(
                          'h-11 w-11 rounded-xl flex items-center justify-center',
                          visuals.color === 'slate'
                            ? 'bg-slate-100'
                            : visuals.color === 'amber'
                              ? 'bg-[#FAF3EC]'
                              : visuals.color === 'champagne'
                                ? 'bg-[#FAF3EC]'
                                : 'bg-[var(--primary-light)]'
                        )}
                      >
                        {visuals.icon}
                      </div>
                      {plan.badge && (
                        <span
                          className={cn(
                            'text-[11px] font-bold px-2.5 py-0.5 rounded-full border',
                            plan.popular
                              ? 'bg-[#FAF3EC] text-[#8C5D30] border-[#EAD7C5]'
                              : 'bg-stone-100 text-stone-700 border-stone-200'
                          )}
                        >
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tight">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed min-h-[34px]">
                      {plan.description}
                    </p>

                    {/* Price */}
                    <div className="my-5 pb-5 border-b border-[var(--border)]">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-3xl sm:text-4xl font-editorial-title font-bold text-[var(--foreground)] tracking-tight">
                          {plan.formattedPrice || `₹${plan.price}`}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-[var(--muted)] whitespace-nowrap">
                          /{plan.period}
                        </span>
                      </div>
                    </div>

                    {/* Quotas Pill */}
                    {(plan.contactCredits > 0 || plan.dailyInterestsLimit > 0) && (
                      <div className="mb-5 p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] flex items-center justify-between gap-2 text-stone-700">
                        {plan.contactCredits > 0 ? (
                          <span className="flex items-center gap-1 font-semibold text-stone-800">
                            <IconPhone className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{plan.contactCredits} Contacts</span>
                          </span>
                        ) : (
                          <span className="text-stone-400">Standard Contacts</span>
                        )}
                        {plan.dailyInterestsLimit > 0 && (
                          <span className="flex items-center gap-1 font-semibold text-stone-800">
                            <IconHeart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                            <span>{plan.dailyInterestsLimit}/day</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Features List */}
                    <div className="space-y-3.5 mb-8">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <IconCheck
                            className={cn(
                              'h-4 w-4 shrink-0 mt-0.5',
                              visuals.color === 'slate'
                                ? 'text-stone-400'
                                : visuals.color === 'amber' || visuals.color === 'champagne'
                                  ? 'text-[var(--accent)]'
                                  : 'text-[var(--primary)]'
                            )}
                          />
                          <span className="text-xs sm:text-sm font-medium text-[var(--foreground)] leading-snug">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    disabled={isCurrent || processing !== null}
                    onClick={() => handleUpgrade(plan.id, plan.name)}
                    className={cn(
                      'w-full h-11 text-xs sm:text-sm font-bold shadow-sm transition-all mt-auto',
                      isCurrent
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                        : plan.popular
                          ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)] shadow-[0_4px_16px_var(--primary-shadow)]'
                          : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)] shadow-[0_4px_14px_var(--primary-shadow)]'
                    )}
                  >
                    {processing === plan.id ? (
                      <>
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> Activating...
                      </>
                    ) : isCurrent ? (
                      'Current Plan'
                    ) : isFreeTrial ? (
                      'Activate Free Pass'
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12 max-w-md mx-auto space-y-2">
          <p className="text-xs text-[var(--muted)]">
            Secure 256-bit SSL encrypted checkout. Membership plans activate immediately upon confirmation.
          </p>
          <p className="text-xs text-[var(--muted)]">
            Need customized plan assistance? Contact customer care at{' '}
            <a
              href={CONTACT_INFO.phoneTel}
              className="font-semibold text-[var(--primary)] hover:underline"
            >
              {CONTACT_INFO.phone}
            </a>{' '}
            or{' '}
            <a
              href={CONTACT_INFO.emailMailto}
              className="font-semibold text-[var(--primary)] hover:underline"
            >
              {CONTACT_INFO.email}
            </a>
          </p>
        </div>
      </div>
    </FeatureGate>
  );
}
