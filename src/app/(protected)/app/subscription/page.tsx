'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
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
  IconMessageCircle,
  IconSparkles,
  IconLock,
  IconClock,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { FeatureGate } from '@/components/ui/under-development';
import { PaymentStatusModal, type PaymentModalStatus } from '@/components/subscription/payment-status-modal';
import { CONTACT_INFO } from '@/config/contact';
import { isFreeTrialMode } from '@/config/feature-flags';
import { useSubscription } from '@/context/subscription-context';
import { subscriptionService, type SubscriptionPlan } from '@/services/subscription.service';
import { paymentService } from '@/services/payment.service';
import { triggerCashfreeCheckout } from '@/lib/cashfree';
import { cn } from '@/lib/cn';
import { toast } from '@/lib/toast';

export default function SubscriptionPage() {
  const router = useRouter();
  const { isSubscribed, tier, subscription, refreshSubscription } = useSubscription();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  const currentPlan = plans.find(
    (p) =>
      p.id?.toUpperCase() === tier?.toUpperCase() ||
      p.code?.toUpperCase() === tier?.toUpperCase() ||
      p.dbId === tier ||
      p.name?.toLowerCase() === tier?.toLowerCase()
  );

  const displayTierName =
    currentPlan?.name ||
    subscription?.tierName ||
    (tier && tier !== 'FREE' ? tier : 'Basic Permit');
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<{ orderId: string } | null>(null);
  const [isCheckingPending, setIsCheckingPending] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    status: PaymentModalStatus;
    orderId?: string;
    planName?: string;
    amount?: number;
    message?: string;
    tierId?: string;
  }>({
    isOpen: false,
    status: null,
  });
  const isFreeTrial = isFreeTrialMode();

  const checkPendingStatus = async (orderId: string) => {
    setIsCheckingPending(true);
    console.log('[SubscriptionPage] Checking pending status for order:', orderId);
    try {
      const verification = await paymentService.verifyOrder(orderId);
      console.log('[SubscriptionPage] Pending status check result:', verification);
      if (verification.paymentStatus === 'SUCCESS') {
        await refreshSubscription();
        setPendingPayment(null);
        setStatusModal({
          isOpen: true,
          status: 'SUCCESS',
          orderId,
          planName: displayTierName,
        });
      } else if (verification.paymentStatus === 'USER_DROPPED') {
        setPendingPayment(null);
        setStatusModal({
          isOpen: true,
          status: 'USER_DROPPED',
          orderId,
          planName: displayTierName,
        });
      } else if (verification.paymentStatus === 'FAILED') {
        setPendingPayment(null);
        setStatusModal({
          isOpen: true,
          status: 'FAILED',
          orderId,
          planName: displayTierName,
          message: verification.message,
        });
      } else {
        toast.info('Still Processing', {
          description: 'Your bank has not completed processing yet. Please check back in a couple of minutes.',
        });
      }
    } catch (err: any) {
      console.error('[SubscriptionPage] Error during pending status check:', err);
      toast.error('Check Status Failed', {
        description: err?.message || 'Could not verify status with payment gateway.',
      });
    } finally {
      setIsCheckingPending(false);
    }
  };

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

  // Listen for return redirect URL with ?order_id=... from Cashfree
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const returnOrderId = urlParams.get('order_id');

    if (returnOrderId) {
      console.log('[SubscriptionPage] Return redirect detected from Cashfree for order:', returnOrderId);
      window.history.replaceState({}, '', window.location.pathname);

      (async () => {
        try {
          toast.info('Verifying Payment', {
            description: 'Checking order status with payment gateway...',
          });
          const verification = await paymentService.verifyOrder(returnOrderId);
          console.log('[SubscriptionPage] Return order verification outcome:', verification);
          if (verification.paymentStatus === 'SUCCESS') {
            await refreshSubscription();
            setPendingPayment(null);
            setStatusModal({
              isOpen: true,
              status: 'SUCCESS',
              orderId: returnOrderId,
              planName: displayTierName,
              amount: currentPlan?.price,
            });
          } else if (verification.paymentStatus === 'USER_DROPPED') {
            setPendingPayment(null);
            setStatusModal({
              isOpen: true,
              status: 'USER_DROPPED',
              orderId: returnOrderId,
              planName: displayTierName,
            });
          } else if (verification.paymentStatus === 'PENDING') {
            setPendingPayment({ orderId: returnOrderId });
            setStatusModal({
              isOpen: true,
              status: 'PENDING',
              orderId: returnOrderId,
              planName: displayTierName,
              message: verification.message,
            });
          } else {
            setPendingPayment(null);
            setStatusModal({
              isOpen: true,
              status: 'FAILED',
              orderId: returnOrderId,
              planName: displayTierName,
              message: verification.message,
            });
          }
        } catch (e: any) {
          console.error('[SubscriptionPage] Failed to verify return order:', e);
        }
      })();
    }
  }, [refreshSubscription]);

  const handleUpgrade = async (tierId: string, planName: string) => {
    setProcessing(tierId);
    console.log('[SubscriptionPage] Initiating upgrade for tier:', tierId, planName);
    try {
      if (isFreeTrial) {
        // 1-Click Free Trial Mode
        await subscriptionService.activatePermit(tierId);
        await refreshSubscription();
        toast.success(`Subscription Activated`, {
          description: `You are now subscribed to the ${planName}.`,
        });
        setTimeout(() => {
          window.location.href = '/app';
        }, 900);
        return;
      }

      // Live / Sandbox Cashfree Checkout Flow
      toast.info('Preparing Checkout', {
        description: `Initializing secure order for ${planName}...`,
      });

      const order = await paymentService.createOrder(tierId);
      console.log('[SubscriptionPage] Cashfree order created:', { orderId: order.orderId, amount: order.amount, planCode: order.planCode });

      // In local development simulation if credentials are not yet configured on server
      if (order.paymentSessionId.startsWith('session_simulated_')) {
        await subscriptionService.activatePermit(tierId, order.orderId);
        await refreshSubscription();
        toast.success('🎉 Test Order Activated', {
          description: `Simulated development order ${order.orderId} processed for ${planName}.`,
        });
        setTimeout(() => {
          window.location.href = '/app';
        }, 900);
        return;
      }

      // Open Cashfree Checkout (auto-selects _self on mobile for native UPI, _modal on desktop)
      const result = await triggerCashfreeCheckout(order.paymentSessionId);
      console.log('[SubscriptionPage] Cashfree checkout SDK result:', result);

      if (result?.error) {
        const errorMsg = (result.error.message || '').toLowerCase();
        const errorCode = (result.error.code || '').toUpperCase();
        const isUserDrop =
          errorCode === 'USER_DROPPED' ||
          errorMsg.includes('drop') ||
          errorMsg.includes('closed') ||
          errorMsg.includes('cancel');

        if (isUserDrop) {
          setStatusModal({
            isOpen: true,
            status: 'USER_DROPPED',
            orderId: order.orderId,
            planName,
            amount: order.amount,
          });
        } else {
          setStatusModal({
            isOpen: true,
            status: 'FAILED',
            orderId: order.orderId,
            planName,
            amount: order.amount,
            message: result.error.message,
            tierId,
          });
        }
        return;
      }

      if (result?.redirect) {
        toast.info('Redirecting', {
          description: 'Redirecting to complete payment...',
        });
        return;
      }

      // Reconcile and confirm payment with backend
      toast.info('Verifying Payment', {
        description: 'Confirming transaction...',
      });
      const verification = await paymentService.verifyOrder(order.orderId);
      console.log('[SubscriptionPage] Modal checkout verification outcome:', verification);

      if (verification.paymentStatus === 'SUCCESS') {
        await refreshSubscription();
        setPendingPayment(null);
        setStatusModal({
          isOpen: true,
          status: 'SUCCESS',
          orderId: order.orderId,
          planName,
          amount: order.amount,
        });
      } else if (verification.paymentStatus === 'USER_DROPPED') {
        setPendingPayment(null);
        setStatusModal({
          isOpen: true,
          status: 'USER_DROPPED',
          orderId: order.orderId,
          planName,
          amount: order.amount,
        });
      } else if (verification.paymentStatus === 'PENDING') {
        setPendingPayment({ orderId: order.orderId });
        setStatusModal({
          isOpen: true,
          status: 'PENDING',
          orderId: order.orderId,
          planName,
          amount: order.amount,
          message: verification.message,
        });
      } else {
        setPendingPayment(null);
        setStatusModal({
          isOpen: true,
          status: 'FAILED',
          orderId: order.orderId,
          planName,
          amount: order.amount,
          message: verification.message,
          tierId,
        });
      }
    } catch (err: any) {
      toast.error('Payment Failed', {
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

  const getPlanTierRank = (codeOrId?: string, durationDays: number = 0, price: number = 0): number => {
    const norm = (codeOrId || '').toUpperCase();
    if (norm === 'ELITE' || norm.includes('YEAR') || durationDays >= 365 || price >= 4000) return 4;
    if (norm === 'PLUS' || norm.includes('6') || durationDays >= 180 || price >= 2000) return 3;
    if (norm === 'STANDARD' || norm.includes('3') || durationDays >= 90 || price >= 1000) return 2;
    if (norm === 'BASIC' || norm.includes('1') || durationDays >= 30 || price >= 400) return 1;
    return 0;
  };

  return (
    <FeatureGate page="subscription" title="Membership & Subscription">
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="afterInteractive"
      />
      <div className="w-full max-w-full min-w-0 space-y-8 pb-10">
        <SectionHeader
          eyebrow={
            isFreeTrial
              ? 'Launch Celebration'
              : isSubscribed
              ? 'Active Membership'
              : 'Chat Permits'
          }
          title={
            isFreeTrial
              ? 'Complimentary Member Access'
              : isSubscribed
              ? 'Your Chat Permit & Privileges'
              : 'Connect Directly with Matches'
          }
          description={
            isFreeTrial
              ? 'Enjoy full complimentary access during our launch release with zero payment required.'
              : isSubscribed
              ? 'Track your permit validity, remaining contact credits, and daily interest quotas.'
              : 'An active Chat Permit unlocks unlimited direct messaging and verified contact numbers.'
          }
        />

        {/* Pending Payment Alert Banner */}
        {pendingPayment && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/90 dark:bg-amber-950/40 p-4 sm:p-5 text-amber-900 dark:text-amber-200 shadow-sm max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 shrink-0">
                <IconClock className="h-5 w-5 animate-pulse" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                  Payment Confirmation In Progress
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                  Order <span className="font-mono font-semibold">{pendingPayment.orderId}</span> is awaiting confirmation from your bank. If amount was debited, your permit will activate automatically.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                disabled={isCheckingPending}
                onClick={() => checkPendingStatus(pendingPayment.orderId)}
              >
                {isCheckingPending ? (
                  <>
                    <IconLoader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Checking...
                  </>
                ) : (
                  <>
                    <IconRefresh className="mr-1.5 h-3.5 w-3.5" /> Check Status
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-amber-800 hover:bg-amber-200/50"
                onClick={() => setPendingPayment(null)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Current Active Plan Status & Usage Dashboard */}
        {isSubscribed ? (
          <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 via-white to-white p-6 shadow-sm max-w-7xl mx-auto space-y-6">
            {/* Header: Plan & Expiry */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-emerald-100">
              <div className="flex items-center gap-3.5">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shrink-0">
                  <IconShieldCheck className="h-6 w-6" />
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-stone-900">{displayTierName}</h2>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Active Chat Permit
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                    <IconClock className="h-3.5 w-3.5 text-emerald-600" />
                    <span>
                      {subscription?.daysRemaining !== undefined && subscription.daysRemaining > 0
                        ? `${subscription.daysRemaining} days remaining`
                        : 'Permit active'}
                      {subscription?.expiresAt &&
                        ` · Valid until ${new Date(subscription.expiresAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}`}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshSubscription()}
                  className="border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs h-9 rounded-xl"
                >
                  <IconRefresh className="mr-1.5 h-3.5 w-3.5" /> Refresh Quotas
                </Button>
              </div>
            </div>

            {/* Quota & Feature Utilization Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Feature 1: Messaging */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center">
                      <IconMessageCircle className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-stone-600">Messaging</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Unlimited
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-bold text-stone-900">Active Chat Access</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Unlimited direct messaging with all your accepted matches
                  </p>
                </div>
              </div>

              {/* Feature 2: Daily Interests */}
              {(() => {
                const limit = subscription?.dailyInterestsLimit ?? 20;
                const sent = subscription?.dailyInterestsSentToday ?? 0;
                const isUnlimited = limit >= 9000;
                const remaining = subscription?.dailyInterestsRemaining ?? Math.max(0, limit - sent);
                const percent = isUnlimited ? 100 : Math.min(100, Math.round((sent / limit) * 100));

                return (
                  <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 grid place-items-center">
                          <IconHeart className="h-4 w-4 fill-rose-500" />
                        </div>
                        <span className="text-xs font-semibold text-stone-600">Daily Interests</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        {isUnlimited ? 'Unlimited' : `${remaining} left`}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-baseline justify-between">
                        <p className="text-sm font-bold text-stone-900">
                          {isUnlimited ? 'Unlimited / day' : `${sent} / ${limit} sent`}
                        </p>
                        {!isUnlimited && (
                          <span className="text-[10px] text-stone-400 font-medium">{percent}%</span>
                        )}
                      </div>
                      {!isUnlimited && (
                        <div className="w-full bg-stone-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-300',
                              percent >= 90 ? 'bg-rose-500' : 'bg-emerald-500'
                            )}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      )}
                      <p className="text-[11px] text-stone-500 mt-1">
                        {isUnlimited
                          ? 'Send unlimited interest requests daily'
                          : 'Daily quota resets every night at 12:00 AM IST'}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Feature 3: Verified Contacts */}
              {(() => {
                const credits = subscription?.contactCredits ?? 0;
                const unlocked = subscription?.unlockedContactsCount ?? 0;
                const isUnlimited = credits >= 9000;

                return (
                  <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
                          <IconPhone className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-semibold text-stone-600">Verified Contacts</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {isUnlimited ? 'Unlimited' : `${credits} available`}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-bold text-stone-900">
                        {isUnlimited ? 'Unlimited Numbers' : `${credits} Contact Credits`}
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {unlocked > 0
                          ? `${unlocked} verified profile contact${unlocked > 1 ? 's' : ''} unlocked`
                          : 'Unlock phone numbers on member profiles'}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Feature 4: Search & Discovery Boost */}
              {(() => {
                const tierCode = tier?.toUpperCase() || '';
                const isElite = tierCode === 'ELITE' || tierCode.includes('YEAR');
                const isPlus = tierCode === 'PLUS' || tierCode.includes('6');
                const isStandard = tierCode === 'STANDARD' || tierCode.includes('3');

                const levelText = isElite
                  ? 'VIP High Visibility'
                  : isPlus
                    ? 'High Visibility'
                    : isStandard
                      ? 'Priority Visibility'
                      : 'Standard Visibility';

                const boostBadge = isElite
                  ? '+30 Ranking Boost'
                  : isPlus
                    ? '+20 Ranking Boost'
                    : isStandard
                      ? '+10 Ranking Boost'
                      : 'Standard';

                return (
                  <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 grid place-items-center">
                          <IconSparkles className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-semibold text-stone-600">Profile Visibility</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        {boostBadge}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-bold text-stone-900">{levelText}</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Higher placement in search results and daily recommendations
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-stone-50 via-white to-stone-50 border border-stone-200 text-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs max-w-7xl mx-auto">
            <div className="flex items-start sm:items-center gap-3.5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-stone-200 text-stone-700 shrink-0">
                <IconLock className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold">Current Membership: Free Member</p>
                <p className="text-xs text-stone-500">
                  Chat messaging and verified contact numbers are locked. Select a Chat Permit plan below to unlock all member features.
                </p>
              </div>
            </div>
            <div className="text-xs font-semibold text-stone-600 shrink-0 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
              Free Tier: 10 interests/day · 0 Contacts
            </div>
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
              const currentTierRank = isSubscribed
                ? getPlanTierRank(tier, subscription?.daysRemaining, 0)
                : 0;
              const planRank = getPlanTierRank(plan.id || plan.code, plan.durationDays, plan.price);

              const isCurrent =
                isSubscribed &&
                (tier?.toUpperCase() === plan.id?.toUpperCase() ||
                  tier?.toUpperCase() === plan.code?.toUpperCase() ||
                  tier === plan.dbId);

              const isHigherTier = isSubscribed && planRank > currentTierRank;
              const isLowerTier = isSubscribed && !isCurrent && planRank < currentTierRank;
              const daysRemaining = subscription?.daysRemaining ?? 0;
              const canRenewCurrent = isCurrent && daysRemaining <= 15;

              const visuals = getPlanVisuals(plan, index);

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    'relative p-6 flex flex-col justify-between rounded-2xl transition-all duration-300',
                    isCurrent
                      ? 'border-emerald-500 bg-gradient-to-b from-emerald-50/40 via-white to-white ring-2 ring-emerald-500/50 shadow-md'
                      : isHigherTier
                        ? 'border-amber-400/80 bg-gradient-to-b from-amber-50/20 via-white to-white shadow-md hover:border-amber-500'
                        : isLowerTier
                          ? 'border-stone-200 bg-stone-50/50 opacity-80'
                          : plan.popular
                            ? 'border-[var(--accent)] bg-gradient-to-b from-[#FFF9F6] via-white to-white shadow-[0_16px_40px_-15px_rgba(216,178,140,0.25)] ring-1 ring-[var(--accent)]/70'
                            : 'border-[var(--border)] bg-white shadow-sm hover:shadow-md hover:border-[var(--primary)]/30'
                  )}
                >
                  {isCurrent ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <IconShieldCheck className="h-3 w-3" />
                      <span>Current Plan</span>
                    </div>
                  ) : isHigherTier ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                      <IconCrown className="h-3 w-3" />
                      <span>Upgrade Tier</span>
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

                  {/* CTA Button & Smart Contextual Subtext */}
                  <div className="mt-auto pt-2 space-y-2">
                    <Button
                      disabled={
                        processing !== null ||
                        (isCurrent && !canRenewCurrent) ||
                        isLowerTier
                      }
                      onClick={() => handleUpgrade(plan.id, plan.name)}
                      className={cn(
                        'w-full h-11 text-xs sm:text-sm font-bold shadow-sm transition-all',
                        isCurrent
                          ? canRenewCurrent
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-300 cursor-default opacity-95'
                          : isHigherTier
                            ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-deep)] text-white hover:opacity-95 shadow-[0_4px_16px_var(--primary-shadow)]'
                            : isLowerTier
                              ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed opacity-75'
                              : plan.popular
                                ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)] shadow-[0_4px_16px_var(--primary-shadow)]'
                                : 'bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)] shadow-[0_4px_14px_var(--primary-shadow)]'
                      )}
                    >
                      {processing === plan.id ? (
                        <>
                          <IconLoader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                        </>
                      ) : isCurrent ? (
                        canRenewCurrent ? (
                          `Extend Validity (+${plan.durationDays}d)`
                        ) : (
                          `Active Plan (${daysRemaining}d left)`
                        )
                      ) : isHigherTier ? (
                        `Upgrade to ${plan.badge || plan.name.split(' ')[0]}`
                      ) : isLowerTier ? (
                        'Included in Your Plan'
                      ) : isFreeTrial ? (
                        'Activate Free Pass'
                      ) : (
                        'Subscribe Now'
                      )}
                    </Button>

                    {/* Helper subtext for subscribed members */}
                    {isSubscribed && (
                      <p className="text-[11px] text-center text-stone-500 leading-snug min-h-[16px]">
                        {isCurrent && canRenewCurrent && (
                          <span className="text-emerald-700 font-medium">Early renewal adds {plan.durationDays} days</span>
                        )}
                        {isCurrent && !canRenewCurrent && (
                          <span>Valid until {subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'renewal'}</span>
                        )}
                        {isHigherTier && (
                          <span className="text-[var(--primary)] font-medium">+ Adds {plan.contactCredits} contacts & extends validity</span>
                        )}
                        {isLowerTier && (
                          <span className="text-stone-400">Included in your active {displayTierName}</span>
                        )}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Payment Terms & Conditions Notice */}
        <div className="rounded-2xl border border-stone-200 bg-[#FFFDFB] p-5 sm:p-6 shadow-2xs max-w-4xl mx-auto space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <IconShieldCheck className="h-4 w-4 text-[var(--primary)]" /> Payment Terms & Conditions
            </h4>
            <a
              href="/terms"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-[var(--primary)] hover:underline"
            >
              View Full Terms →
            </a>
          </div>
          <ol className="list-decimal list-inside text-xs text-stone-600 space-y-1.5 leading-relaxed">
            <li>Chat Permit is valid for the selected subscription period from activation.</li>
            <li>Premium features, interest limits, and contact access depend on the selected plan.</li>
            <li>Unlimited messaging is available only with mutual matches.</li>
            <li>All Chat Permits are non-transferable and non-refundable after activation, except as required by law.</li>
            <li>
              By proceeding with payment, you agree to our{' '}
              <a href="/terms" target="_blank" rel="noreferrer" className="underline font-medium text-stone-800">
                Terms & Conditions
              </a>{' '}
              and{' '}
              <a href="/privacy" target="_blank" rel="noreferrer" className="underline font-medium text-stone-800">
                Privacy Policy
              </a>
              .
            </li>
          </ol>
        </div>

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

        {/* Dynamic Payment Status Feedback Modal */}
        <PaymentStatusModal
          isOpen={statusModal.isOpen}
          status={statusModal.status}
          orderId={statusModal.orderId}
          planName={statusModal.planName || displayTierName}
          amount={statusModal.amount}
          message={statusModal.message}
          onRetry={
            statusModal.tierId
              ? () => {
                  const targetTier = statusModal.tierId!;
                  const targetPlan = statusModal.planName || 'Permit';
                  setStatusModal((prev) => ({ ...prev, isOpen: false }));
                  handleUpgrade(targetTier, targetPlan);
                }
              : undefined
          }
          onCheckStatus={
            statusModal.orderId ? () => checkPendingStatus(statusModal.orderId!) : undefined
          }
          onContinue={() => {
            setStatusModal((prev) => ({ ...prev, isOpen: false }));
            router.push('/app');
          }}
          onClose={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
        />
      </div>
    </FeatureGate>
  );
}
