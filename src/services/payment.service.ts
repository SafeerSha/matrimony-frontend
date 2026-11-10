import { apiFetch } from '@/lib/http/api-client';
import { UserSubscriptionStatus } from './subscription.service';

export interface CreateOrderResponse {
  cfOrderId: string | number;
  orderId: string;
  paymentSessionId: string;
  orderStatus: string;
  amount: number;
  currency: string;
  planCode: string;
}

export interface VerifyOrderResponse {
  orderId: string;
  paymentStatus: 'SUCCESS' | 'PENDING' | 'FAILED' | 'USER_DROPPED';
  paymentId?: string;
  subscription?: UserSubscriptionStatus;
  message?: string;
}

export const paymentService = {
  createOrder: (planCode: string) => {
    return apiFetch<CreateOrderResponse>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ planCode }),
    });
  },

  verifyOrder: (orderId: string) => {
    return apiFetch<VerifyOrderResponse>(`/payments/verify/${encodeURIComponent(orderId)}`, {
      method: 'GET',
    });
  },
};

