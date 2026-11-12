import { apiFetch } from '@/lib/http/api-client';

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'fake_profile'
  | 'inappropriate_content'
  | 'other';

export interface BlockedUser {
  id: string;
  blockedId: string;
  profileId?: string | null;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  location: string;
  image?: string | null;
  reason?: string | null;
  createdAt: string;
}

export const reportService = {
  async blockUser(targetId: string, reason?: string): Promise<void> {
    await apiFetch(`/report/block/${encodeURIComponent(targetId)}`, {
      method: 'POST',
      body: JSON.stringify(reason ? { reason } : {}),
    });
  },

  async unblockUser(targetId: string): Promise<void> {
    await apiFetch(`/report/block/${encodeURIComponent(targetId)}`, {
      method: 'DELETE',
    });
  },

  async getBlockedUsers(): Promise<BlockedUser[]> {
    const res = await apiFetch<BlockedUser[]>('/report/blocked', {
      method: 'GET',
    });
    return Array.isArray(res) ? res : [];
  },

  async reportUser(
    targetId: string,
    reason: ReportReason | string,
    description?: string,
  ): Promise<void> {
    await apiFetch(`/report/${encodeURIComponent(targetId)}`, {
      method: 'POST',
      body: JSON.stringify({
        reason,
        ...(description?.trim() ? { description: description.trim() } : {}),
      }),
    });
  },
};

