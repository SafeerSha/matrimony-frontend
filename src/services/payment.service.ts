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

export interface PaymentTransactionItem {
  id: string;
  orderId: string;
  cfOrderId?: string;
  cfPaymentId?: string;
  planCode: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'USER_DROPPED';
  paymentMethod?: string;
  paymentMessage?: string;
  createdAt: string;
  updatedAt: string;
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

  getUserTransactions: () => {
    return apiFetch<PaymentTransactionItem[]>('/payments/transactions', {
      method: 'GET',
    });
  },
};

