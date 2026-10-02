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
      price: '₹500',
      period: 'per month',
      icon: <Star className="h-6 w-6 text-slate-400" />,
      description: 'Perfect for trying out the platform and making initial connections.',
      features: [
        'Active Chat Permit for 30 days',
        'Send & accept chat requests',
        'Unlimited messaging with matches',
        'Priority profile visibility'
      ],
      disabled: [],
      buttonText: 'Buy 1 Month Permit',
      isCurrent: false,
      color: 'slate'
    },
    {
      name: '3 Months Permit',
      price: '₹1,300',
      period: 'for 90 days',
      icon: <Sparkles className="h-6 w-6 text-amber-500" />,
      description: 'Our most popular plan. Save ₹200 compared to monthly billing.',
      features: [
        'Active Chat Permit for 90 days',
        'Send & accept chat requests',
        'Unlimited messaging with matches',
        'Priority profile visibility'
      ],
      disabled: [],
      buttonText: 'Buy 3 Months Permit',
      isCurrent: false,
      popular: true,
      color: 'amber'
    },
    {
      name: '6 Months Permit',
      price: '₹2,500',
      period: 'for 180 days',
      icon: <Crown className="h-6 w-6 text-[var(--primary)]" />,
      description: 'Serious about finding a match? Save ₹500 with this plan.',
      features: [
        'Active Chat Permit for 180 days',
        'Send & accept chat requests',
        'Unlimited messaging with matches',
        'Priority profile visibility'
      ],
      disabled: [],
      buttonText: 'Buy 6 Months Permit',
      isCurrent: false,
      color: 'primary'
    },
    {
      name: '1 Year Permit',
      price: '₹5,000',
      period: 'for 365 days',
      icon: <Crown className="h-6 w-6 text-[var(--primary)]" />,
      description: 'Complete peace of mind. Save ₹1,000 with annual billing.',
      features: [
        'Active Chat Permit for 365 days',
        'Send & accept chat requests',
        'Unlimited messaging with matches',
        'Priority profile visibility'
      ],
      disabled: [],
      buttonText: 'Buy 1 Year Permit',
      isCurrent: false,
      color: 'primary'
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader 
        eyebrow="Chat Permits" 
        title="Unlock Member Interactions" 
        description="An active Chat Permit is required to send chat requests and converse with other members." 
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={cn(
              "relative p-6 sm:p-8 flex flex-col transition-all duration-300",
              plan.popular ? "border-amber-400 shadow-[0_16px_40px_-15px_rgba(245,158,11,0.2)] scale-[1.02] lg:scale-105 z-10 bg-white" : "border-[var(--border)] shadow-sm hover:shadow-md"
            )}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                Most Popular
              </div>
            )}
            
            <div className="mb-6 flex items-center gap-3">
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center bg-opacity-10",
                plan.color === 'slate' ? 'bg-slate-100' : 
                plan.color === 'amber' ? 'bg-amber-100' : 'bg-[var(--primary-light)]'
              )}>
                {plan.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)]">{plan.name}</h3>
                <p className="text-xs text-[var(--muted)]">{plan.description}</p>
              </div>
            </div>

            <div className="mb-6 pb-6 border-b border-[var(--border)]">
              <div className="flex items-end gap-1.5">
                <span className="text-4xl font-editorial-title text-[var(--foreground)] tracking-tight">{plan.price}</span>
                <span className="text-sm font-medium text-[var(--muted)] mb-1.5">/{plan.period}</span>
              </div>
            </div>

            <div className="flex-1 space-y-4 mb-8">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className={cn(
                    "h-5 w-5 shrink-0",
                    plan.color === 'slate' ? "text-slate-400" :
                    plan.color === 'amber' ? "text-amber-500" : "text-[var(--primary)]"
                  )} />
                  <span className="text-sm font-medium text-[var(--foreground)]">{feature}</span>
                </div>
              ))}
              {plan.disabled.map((feature, i) => (
                <div key={i} className="flex items-start gap-3 opacity-40">
                  <Check className="h-5 w-5 shrink-0 text-[var(--muted-light)]" />
                  <span className="text-sm font-medium text-[var(--muted-strong)] line-through">{feature}</span>
                </div>
              ))}
            </div>

            <Button 
              disabled={plan.isCurrent || processing !== null}
              onClick={() => handleUpgrade(plan.name)}
              className={cn(
                "w-full h-12 text-sm font-bold shadow-sm transition-all",
                plan.isCurrent ? "bg-[var(--surface-muted)] text-[var(--muted-strong)] border border-[var(--border)]" :
                plan.color === 'amber' ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 hover:shadow-md" :
                "bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)] hover:shadow-md"
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
