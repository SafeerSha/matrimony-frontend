'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscriptionService, type UserSubscriptionStatus } from '@/services/subscription.service';
import { paymentService } from '@/services/payment.service';
import type { PaymentModalStatus } from '@/components/subscription/payment-status-modal';
import { toast } from '@/lib/toast';

export interface SubscriptionPromptOptions {
  title?: string;
  description?: string;
  features?: string[];
  ctaText?: string;
}

export interface PaymentStatusModalState {
  isOpen: boolean;
  status: PaymentModalStatus;
  orderId?: string;
  planName?: string;
  amount?: number;
  message?: string;
  tierId?: string;
  autoCloseDuration?: number;
  onRetry?: () => void;
  onCheckStatus?: () => Promise<void> | void;
  onContinue?: () => void;
  onClose?: () => void;
}

interface SubscriptionContextType {
  subscription: UserSubscriptionStatus | null;
  isSubscribed: boolean;
  tier: string;
  daysRemaining: number;
  dailyInterestsRemaining: number;
  isLoading: boolean;
  isUpgradeModalOpen: boolean;
  isChatPromptOpen: boolean;
  promptOptions: SubscriptionPromptOptions | null;
  paymentStatusModal: PaymentStatusModalState;
  refreshSubscription: () => Promise<void>;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  openChatPrompt: (options?: SubscriptionPromptOptions) => void;
  closeChatPrompt: () => void;
  openSubscriptionPrompt: (options?: SubscriptionPromptOptions) => void;
  closeSubscriptionPrompt: () => void;
  openPaymentStatusModal: (options: Omit<PaymentStatusModalState, 'isOpen'>) => void;
  closePaymentStatusModal: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<UserSubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [isChatPromptOpen, setIsChatPromptOpen] = useState<boolean>(false);
  const [promptOptions, setPromptOptions] = useState<SubscriptionPromptOptions | null>(null);
  const [paymentStatusModal, setPaymentStatusModal] = useState<PaymentStatusModalState>({
    isOpen: false,
    status: null,
  });

  const openPaymentStatusModal = useCallback((options: Omit<PaymentStatusModalState, 'isOpen'>) => {
    setPaymentStatusModal({
      isOpen: true,
      ...options,
    });
  }, []);

  const closePaymentStatusModal = useCallback(() => {
    setPaymentStatusModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const refreshSubscription = useCallback(async () => {
    try {
      const data = await subscriptionService.getStatus();
      if (data) {
        setSubscription(data);
      }
    } catch (err) {
      // In offline / unauthenticated states, default safely to free non-subscribed
      setSubscription({
        userId: '',
        tier: 'FREE',
        status: 'INACTIVE',
        isSubscribed: false,
        canChat: false,
        expiresAt: null,
        daysRemaining: 0,
        contactCredits: 0,
        dailyInterestsLimit: 10,
        dailyInterestsSentToday: 0,
        dailyInterestsRemaining: 10,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  // Global listener for return redirect ?order_id=... from Cashfree
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const returnOrderId = urlParams.get('order_id');

    if (returnOrderId) {
      console.log('[SubscriptionContext] Global Cashfree return redirect detected for order:', returnOrderId);
      // Clean query parameter from browser address bar while preserving the pathname
      window.history.replaceState({}, '', window.location.pathname);

      (async () => {
        try {
          toast.info('Verifying Payment', {
            description: 'Checking order status with payment gateway...',
          });
          const verification = await paymentService.verifyOrder(returnOrderId);
          console.log('[SubscriptionContext] Return verification outcome:', verification);

          if (verification.paymentStatus === 'SUCCESS') {
            await refreshSubscription();
            openPaymentStatusModal({
              status: 'SUCCESS',
              orderId: returnOrderId,
              planName: 'Chat Permit',
              onContinue: () => {
                closePaymentStatusModal();
                if (window.location.pathname !== '/app') {
                  window.location.href = '/app';
                }
              },
            });
          } else if (verification.paymentStatus === 'USER_DROPPED') {
            openPaymentStatusModal({
              status: 'USER_DROPPED',
              orderId: returnOrderId,
              planName: 'Chat Permit',
            });
          } else if (verification.paymentStatus === 'PENDING') {
            openPaymentStatusModal({
              status: 'PENDING',
              orderId: returnOrderId,
              planName: 'Chat Permit',
              message: verification.message,
              onCheckStatus: async () => {
                const recheck = await paymentService.verifyOrder(returnOrderId);
                if (recheck.paymentStatus === 'SUCCESS') {
                  await refreshSubscription();
                  openPaymentStatusModal({
                    status: 'SUCCESS',
                    orderId: returnOrderId,
                    planName: 'Chat Permit',
                    onContinue: () => {
                      closePaymentStatusModal();
                      window.location.href = '/app';
                    },
                  });
                } else if (recheck.paymentStatus === 'FAILED') {
                  openPaymentStatusModal({
                    status: 'FAILED',
                    orderId: returnOrderId,
                    planName: 'Chat Permit',
                    message: recheck.message,
                  });
                } else {
                  toast.info('Still Processing', {
                    description: 'Your bank has not completed processing yet. Please check back in a couple of minutes.',
                  });
                }
              },
            });
          } else {
            openPaymentStatusModal({
              status: 'FAILED',
              orderId: returnOrderId,
              planName: 'Chat Permit',
              message: verification.message,
            });
          }
        } catch (e: any) {
          console.error('[SubscriptionContext] Failed to verify return order:', e);
        }
      })();
    }
  }, [refreshSubscription, openPaymentStatusModal, closePaymentStatusModal]);

  const openUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(true);
    if (typeof window !== 'undefined') {
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
  }, []);
  const closeUpgradeModal = useCallback(() => setIsUpgradeModalOpen(false), []);

  const openSubscriptionPrompt = useCallback((opts?: SubscriptionPromptOptions) => {
    setPromptOptions(opts || null);
    setIsChatPromptOpen(true);
    if (typeof window !== 'undefined') {
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
  }, []);
  const closeSubscriptionPrompt = useCallback(() => {
    setIsChatPromptOpen(false);
    setPromptOptions(null);
  }, []);

  const openChatPrompt = openSubscriptionPrompt;
  const closeChatPrompt = closeSubscriptionPrompt;

  const isSubscribed = Boolean(subscription?.isSubscribed);
  const tier = subscription?.tier || 'FREE';
  const daysRemaining = subscription?.daysRemaining || 0;
  const dailyInterestsRemaining = subscription?.dailyInterestsRemaining ?? 10;

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isSubscribed,
        tier,
        daysRemaining,
        dailyInterestsRemaining,
        isLoading,
        isUpgradeModalOpen,
        isChatPromptOpen,
        promptOptions,
        paymentStatusModal,
        refreshSubscription,
        openUpgradeModal,
        closeUpgradeModal,
        openChatPrompt,
        closeChatPrompt,
        openSubscriptionPrompt,
        closeSubscriptionPrompt,
        openPaymentStatusModal,
        closePaymentStatusModal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    // Return a safe fallback if used outside provider so components never crash
    return {
      subscription: null,
      isSubscribed: false,
      tier: 'FREE',
      daysRemaining: 0,
      dailyInterestsRemaining: 10,
      isLoading: false,
      isUpgradeModalOpen: false,
      isChatPromptOpen: false,
      promptOptions: null,
      paymentStatusModal: { isOpen: false, status: null } as PaymentStatusModalState,
      refreshSubscription: async () => {},
      openUpgradeModal: () => {},
      closeUpgradeModal: () => {},
      openChatPrompt: () => {},
      closeChatPrompt: () => {},
      openSubscriptionPrompt: () => {},
      closeSubscriptionPrompt: () => {},
      openPaymentStatusModal: () => {},
      closePaymentStatusModal: () => {},
    };
  }
  return context;
}

