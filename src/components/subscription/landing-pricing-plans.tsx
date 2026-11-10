'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconCheck, IconCrown, IconStar } from '@tabler/icons-react';
import { subscriptionService, type SubscriptionPlan } from '@/services/subscription.service';

export interface LandingPlanItem {
  id: string;
  name: string;
  badge: string;
  price: string;
  currency: string;
  period: string;
  description: string;
  popular: boolean;
  features: string[];
}

export const DEFAULT_LANDING_PLANS: LandingPlanItem[] = [
  {
    id: 'BASIC',
    name: '1 Month Chat Permit',
    badge: 'Basic',
    price: '₹500',
    currency: 'INR',
    period: '30 Days Validity',
    description: 'Active Premium for 30 days with verified contacts and daily interest quota.',
    popular: false,
    features: [
      'Active Premium for 30 days',
      'Send up to 20 Interests per day',
      'Unlimited messaging with mutual matches',
      'Standard Profile Visibility in search',
      '20 Verified Contact Numbers unlocked',
    ],
  },
  {
    id: 'STANDARD',
    name: '3 Months Chat Permit',
    badge: 'Standard',
    price: '₹1,250',
    currency: 'INR',
    period: '90 Days Validity',
    description: 'Our most popular plan. Active matchmaking with verified connections.',
    popular: true,
    features: [
      'Active Premium for 90 days',
      'Send up to 40 Interests per day',
      'Unlimited messaging with mutual matches',
      'Priority Profile Visibility in search',
      '60 Verified Contact Numbers unlocked',
    ],
  },
  {
    id: 'PLUS',
    name: '6 Months Permit',
    badge: 'Plus',
    price: '₹2,500',
    currency: 'INR',
    period: '180 Days Validity',
    description: 'Extended connection time with higher contact quota and high visibility.',
    popular: false,
    features: [
      'Active Premium for 180 days',
      'Send Unlimited Interests',
      'Unlimited messaging with mutual matches',
      'High Profile Visibility & recommendation boost',
      '120 Verified Contact Numbers unlocked',
    ],
  },
  {
    id: 'ELITE',
    name: 'One Year Chat Permit',
    badge: 'Elite',
    price: '₹5,000',
    currency: 'INR',
    period: '365 Days Validity',
    description: 'Complete peace of mind with 1 full year of unlimited matchmaking access.',
    popular: false,
    features: [
      'Active Premium for 365 days (1 Year)',
      'Send Unlimited Interests',
      'Unlimited messaging with mutual matches',
      'Maximum VIP Profile Visibility',
      'Unlimited Verified Contact Numbers',
    ],
  },
];

export function LandingPricingPlans({
  initialPlans = DEFAULT_LANDING_PLANS,
  ctaText = 'Get Started',
  ctaHref = '/login?redirect=/app/subscription',
  className = '',
}: {
  initialPlans?: LandingPlanItem[];
  ctaText?: string;
  ctaHref?: string;
  className?: string;
}) {
  const [plans, setPlans] = useState<LandingPlanItem[]>(initialPlans);

  useEffect(() => {
    let isMounted = true;

    async function fetchLivePlans() {
      try {
        const livePlans = await subscriptionService.getPlans();
        if (!isMounted || !Array.isArray(livePlans) || livePlans.length === 0) return;

        const mapped: LandingPlanItem[] = livePlans.map((p, idx) => {
          const code = (p.id || (p as any).code || '').toUpperCase();
          const isPop = Boolean(p.popular);

          // Clean up and standardize validity period
          let periodStr = (p.period || '').trim();
          if (!periodStr || periodStr === 'per month') {
            periodStr = p.durationDays ? `${p.durationDays} Days Validity` : '30 Days Validity';
          } else if (periodStr.startsWith('for ')) {
            periodStr = periodStr.replace(/^for\s+/i, '');
            if (!periodStr.toLowerCase().includes('validity') && !periodStr.toLowerCase().includes('days') && !periodStr.toLowerCase().includes('year')) {
              periodStr = `${periodStr} Validity`;
            } else if (!periodStr.toLowerCase().includes('validity')) {
              periodStr = `${periodStr} Validity`;
            }
          }

          // Format price string in INR
          const priceStr =
            p.formattedPrice ||
            (typeof p.price === 'number' ? `₹${p.price.toLocaleString('en-IN')}` : `₹${p.price}`);

          // Features from database, with fallback
          const featuresList =
            Array.isArray(p.features) && p.features.length > 0
              ? p.features
              : [
                  `Active Premium for ${p.durationDays || 30} days`,
                  p.dailyInterestsLimit >= 9000
                    ? 'Send Unlimited Interests'
                    : `Send up to ${p.dailyInterestsLimit || 20} Interests per day`,
                  'Unlimited messaging with mutual matches',
                  p.durationDays >= 365
                    ? 'Maximum VIP Profile Visibility'
                    : p.durationDays >= 180
                      ? 'High Profile Visibility & recommendation boost'
                      : 'Standard Profile Visibility in search',
                  p.contactCredits >= 9000
                    ? 'Unlimited Verified Contact Numbers'
                    : `${p.contactCredits || 20} Verified Contact Numbers unlocked`,
                ];

          // Badge label
          const badgeStr =
            p.badge ||
            (isPop
              ? 'Standard'
              : code === 'ELITE'
                ? 'Elite'
                : code === 'PLUS'
                  ? 'Plus'
                  : code === 'STANDARD'
                    ? 'Standard'
                    : 'Basic');

          return {
            id: p.id || `PLAN_${idx}`,
            name: p.name || 'Chat Permit',
            badge: badgeStr,
            price: priceStr,
            currency: 'INR',
            period: periodStr,
            description: p.description || 'Active matchmaking with verified connections.',
            popular: isPop,
            features: featuresList,
          };
        });

        setPlans(mapped);
      } catch (err) {
        console.error('Could not load live plans from API, keeping default fallback plans:', err);
      }
    }

    fetchLivePlans();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={`grid grid-cols-1 gap-6 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between border transition-all duration-300 ${
            plan.popular
              ? 'bg-[#FFFDFB] border-[var(--primary)] shadow-lg shadow-rose-950/10 ring-2 ring-[var(--primary)]/20'
              : 'bg-white border-[#EEDCC8]/90 shadow-xs hover:shadow-md hover:-translate-y-1'
          }`}
        >
          {plan.popular && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
              <IconStar className="h-3 w-3 fill-white" /> Most Popular
            </span>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                {plan.badge}
              </span>
              {plan.popular ? (
                <IconCrown className="h-5 w-5 text-[var(--primary)]" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-stone-300" />
              )}
            </div>
            <h3 className="text-lg font-bold text-[#211B1E]">{plan.name}</h3>
            <p className="text-xs text-[#766B6F] mt-1 min-h-[32px]">{plan.description}</p>

            {/* Price */}
            <div className="my-5 pb-5 border-b border-[#EEDCC8]/60">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#211B1E] tracking-tight">
                  {plan.price}
                </span>
                <span className="text-xs font-bold text-stone-500 uppercase">{plan.currency}</span>
              </div>
              <p className="text-xs text-[#8C5D30] font-semibold mt-1">{plan.period}</p>
            </div>

            {/* Features */}
            <ul className="space-y-2.5 text-xs text-[#766B6F]">
              {plan.features.map((feature, fIdx) => (
                <li key={fIdx} className="flex items-start gap-2">
                  <IconCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-tight text-[#211B1E] font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-[#EEDCC8]/60">
            <Link
              href={ctaHref}
              className={`inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl font-bold text-xs transition ${
                plan.popular
                  ? 'bg-[var(--primary)] hover:bg-[var(--primary-deep)] text-white shadow-sm'
                  : 'bg-stone-900 hover:bg-black text-white'
              }`}
            >
              {ctaText}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
