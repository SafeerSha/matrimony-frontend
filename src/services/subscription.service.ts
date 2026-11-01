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
  dailyInterestsLimit: number;
  dailyInterestsSentToday: number;
  dailyInterestsRemaining: number;
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

