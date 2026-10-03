'use client';

import { useState } from 'react';
import { Check, Crown, Loader2, Sparkles, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { cn } from '@/lib/cn';

export default function SubscriptionPage() {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleUpgrade = (plan: string) => {
    setProcessing(plan);
    // Mock Payment Gateway Integration
    setTimeout(() => {
      setProcessing(null);
      alert(`Success! Mock payment completed. You are now subscribed to the ${plan} plan.`);
      window.location.href = '/app';
    }, 2000);
  };

  const plans = [
    {
      name: '1 Month Permit',
      badge: 'Starter',
      price: '₹500',
      period: 'per month',
      icon: <Star className="h-5 w-5 text-slate-500" />,
      description: 'Ideal for trying out the platform and exploring matches.',
      features: [
        'Active Chat Permit for 30 days',
        'Send & accept chat requests',
        'Unlimited messaging with matches',
        'Standard profile visibility'
      ],
      buttonText: 'Buy 1 Month Permit',
      isCurrent: false,
      color: 'slate'
    },
    {
      name: '3 Months Permit',
      badge: 'Save ₹200',
      price: '₹1,300',
      period: 'for 90 days',
      icon: <Sparkles className="h-5 w-5 text-amber-600" />,
      description: 'Our most popular plan. Best value for active matchmaking.',
      features: [
        'Active Chat Permit for 90 days',
        'Send & accept chat requests',
        'Unlimited messaging with matches',
        'Priority profile visibility'
      ],
      buttonText: 'Buy 3 Months Permit',
      isCurrent: false,
      popular: true,
      color: 'amber'
    },
    {
      name: '6 Months Permit',
      badge: 'Save ₹500',
      price: '₹2,500',
      period: 'for 180 days',
      icon: <Crown className="h-5 w-5 text-[var(--primary)]" />,
      description: 'Serious about finding a match with extended connection time.',
      features: [
        'Active Chat Permit for 180 days',
        'Send & accept chat requests',
        'Unlimited messaging with matches',
        'Priority profile visibility'
      ],
      buttonText: 'Buy 6 Months Permit',
      isCurrent: false,
      color: 'primary'
    },
    {
      name: '1 Year Permit',
      badge: 'Save ₹1,000',
      price: '₹5,000',
      period: 'for 365 days',
      icon: <Crown className="h-5 w-5 text-[var(--accent)]" />,
      description: 'Complete peace of mind with 365 days of full unlimited access.',
      features: [
        'Active Chat Permit for 365 days',
        'Send & accept chat requests',
        'Unlimited messaging with matches',
        'Highest priority profile visibility'
      ],
      buttonText: 'Buy 1 Year Permit',
      isCurrent: false,
      color: 'champagne'
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader 
        eyebrow="Chat Permits" 
        title="Unlock Member Interactions" 
        description="An active Chat Permit is required to send chat requests and converse with other members." 
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={cn(
              "relative p-6 flex flex-col justify-between rounded-2xl transition-all duration-300",
              plan.popular 
                ? "border-[var(--accent)] bg-gradient-to-b from-[#FFF9F6] via-white to-white shadow-[0_16px_40px_-15px_rgba(216,178,140,0.25)] ring-1 ring-[var(--accent)]/70" 
                : "border-[var(--border)] bg-white shadow-sm hover:shadow-md hover:border-[var(--primary)]/30"
            )}
          >
            {plan.popular && (
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
                    <Check className={cn(
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
              disabled={plan.isCurrent || processing !== null}
              onClick={() => handleUpgrade(plan.name)}
              className={cn(
                "w-full h-11 text-xs sm:text-sm font-bold shadow-sm transition-all mt-auto",
                plan.isCurrent ? "bg-[var(--surface-muted)] text-[var(--muted-strong)] border border-[var(--border)]" :
                plan.popular ? "bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)] shadow-[0_4px_16px_var(--primary-shadow)]" :
                "bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)] shadow-[0_4px_14px_var(--primary-shadow)]"
              )}
            >
              {processing === plan.name ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              ) : (
                plan.buttonText
              )}
            </Button>
          </Card>
        ))}
      </div>
      
      <div className="text-center mt-12 max-w-md mx-auto">
        <p className="text-xs text-[var(--muted)]">
          Mock Payment Gateway Integration: Clicking "Upgrade" will simulate a secure checkout process and instantly provision the selected tier to your account.
        </p>
      </div>
    </div>
  );
}
