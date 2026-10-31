'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscriptionService, type UserSubscriptionStatus } from '@/services/subscription.service';

export interface SubscriptionPromptOptions {
  title?: string;
  description?: string;
  features?: string[];
  ctaText?: string;
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
  refreshSubscription: () => Promise<void>;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  openChatPrompt: (options?: SubscriptionPromptOptions) => void;
  closeChatPrompt: () => void;
  openSubscriptionPrompt: (options?: SubscriptionPromptOptions) => void;
  closeSubscriptionPrompt: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<UserSubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [isChatPromptOpen, setIsChatPromptOpen] = useState<boolean>(false);
  const [promptOptions, setPromptOptions] = useState<SubscriptionPromptOptions | null>(null);

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
        refreshSubscription,
        openUpgradeModal,
        closeUpgradeModal,
        openChatPrompt,
        closeChatPrompt,
        openSubscriptionPrompt,
        closeSubscriptionPrompt,
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
      refreshSubscription: async () => {},
      openUpgradeModal: () => {},
      closeUpgradeModal: () => {},
      openChatPrompt: () => {},
      closeChatPrompt: () => {},
      openSubscriptionPrompt: () => {},
      closeSubscriptionPrompt: () => {},
    };
  }
  return context;
}

