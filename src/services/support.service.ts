import { apiFetch } from '@/lib/http/api-client';

export interface SubmitInquiryPayload {
  name: string;
  email: string;
  topic: string;
  message: string;
}

export interface SubmitFeedbackPayload {
  rating: number;
  type: 'general' | 'feature' | 'bug';
  message: string;
}

export const supportService = {
  submitInquiry: async (payload: SubmitInquiryPayload) => {
    return apiFetch<{ success: boolean; message: string; inquiryId?: string }>('/support/inquiry', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  submitFeedback: async (payload: SubmitFeedbackPayload) => {
    return apiFetch<{ success: boolean; message: string; feedbackId?: string }>('/support/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

