import { apiFetch } from '@/lib/http/api-client';

export interface SubscriptionPlan {
  id: string;
  code?: string;
  dbId?: string;
  name: string;
  badge?: string;
  price: number;
  formattedPrice: string;
  period: string;
  durationDays: number;
  description: string;
  features: string[];
  contactCredits: number;
  dailyInterestsLimit: number;
  popular?: boolean;
}

export interface UserSubscriptionStatus {
  userId: string;
  tier: string;
  tierName?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
  isSubscribed: boolean;
  canChat: boolean;
  expiresAt: string | null;
  daysRemaining: number;
  contactCredits: number;
  unlockedContactsCount?: number;
  dailyInterestsLimit: number;
  dailyInterestsSentToday: number;
  dailyInterestsRemaining: number;
  usage?: {
    messaging: {
      allowed: boolean;
      unlimited: boolean;
    };
    interests: {
      dailyLimit: number;
      sentToday: number;
      remainingToday: number;
      isUnlimited: boolean;
    };
    contacts: {
      creditsRemaining: number;
      unlockedCount: number;
      isUnlimited: boolean;
    };
    visibility: {
      level: string;
      boost: number;
    };
  };
}

export const subscriptionService = {
  getPlans: () => {
    return apiFetch<SubscriptionPlan[]>('/subscription/plans', {
      method: 'GET',
    });
  },

  getStatus: () => {
    return apiFetch<UserSubscriptionStatus>('/subscription/status', {
      method: 'GET',
    });
  },

  getUsage: () => {
    return apiFetch<UserSubscriptionStatus>('/subscription/usage', {
      method: 'GET',
    });
  },

  getContactStatus: (targetUserId: string) => {
    return apiFetch<{
      isUnlocked: boolean;
      phone: string | null;
      isSelf: boolean;
      canUnlock: boolean;
      creditsRemaining: number;
      isUnlimited: boolean;
      isSubscribed: boolean;
    }>(`/subscription/contacts/status/${targetUserId}`, {
      method: 'GET',
    });
  },

  unlockContact: (targetUserId: string) => {
    return apiFetch<{
      success: boolean;
      phone: string | null;
      alreadyUnlocked: boolean;
      creditsRemaining: number;
      isUnlimited: boolean;
    }>(`/subscription/contacts/unlock/${targetUserId}`, {
      method: 'POST',
    });
  },

  getMyUnlockedContacts: () => {
    return apiFetch<any[]>('/subscription/contacts/my-unlocked', {
      method: 'GET',
    });
  },

  activatePermit: (tier: string, paymentId?: string) => {
    return apiFetch<{ success: boolean; message: string; subscription: any }>(
      '/subscription/activate',
      {
        method: 'POST',
        body: JSON.stringify({ tier, paymentId }),
      }
    );
  },
};

