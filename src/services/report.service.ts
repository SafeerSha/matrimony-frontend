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

export interface AdminUserReportItem {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: string;
  description?: string | null;
  status: 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTION_TAKEN';
  actionTaken?: string | null;
  adminNotes?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: string;
    profileId?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
  };
  reported: {
    id: string;
    profileId?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    status: string;
    isBanned: boolean;
  };
}

export interface AdminReportsResponse {
  data: AdminUserReportItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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

  async getReportsAdmin(
    query: { status?: string; page?: number; limit?: number } = {},
    signal?: AbortSignal
  ): Promise<AdminReportsResponse> {
    const params = new URLSearchParams();
    if (query.status && query.status !== 'ALL') params.set('status', query.status);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    const qs = params.toString();
    return apiFetch<AdminReportsResponse>(`/report${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      signal,
    });
  },

  async updateReportAdmin(
    id: string,
    data: { status?: 'PENDING' | 'REVIEWED' | 'DISMISSED' | 'ACTION_TAKEN'; adminNotes?: string },
  ): Promise<any> {
    return apiFetch(`/report/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

