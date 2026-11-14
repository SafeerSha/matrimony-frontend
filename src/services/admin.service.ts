export interface AdminPlanItem {
  id: string;
  code: string;
  name: string;
  badge?: string | null;
  price: number;
  formattedPrice?: string | null;
  period: string;
  durationDays: number;
  description?: string | null;
  features: string[];
  contactCredits: number;
  dailyInterestsLimit: number;
  popular: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanFormInput {
  name: string;
  code?: string;
  badge?: string;
  price: number;
  period: string;
  durationDays: number;
  description?: string;
  features?: string[];
  contactCredits?: number;
  dailyInterestsLimit?: number;
  popular?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}
import { apiFetch } from "@/lib/http/api-client";
import type { UserProfile } from "./profile.service";
import type { AnalyticsOverview, DateRangeInput } from "@/types/analytics";
import type { AdminUserListItem, AdminUserListResponse, AdminUserQueryFilters } from "@/types/admin-user";
import { analyticsOverviewSchema, analyticsTimeSeriesResponseSchema } from "@/lib/validation/analytics";

export interface CoolingPeriodSetting {
  enabled: boolean;
  days: number;
  updatedAt: string;
  updatedBy: string | null;
  message?: string;
  success?: boolean;
}

export interface PhotoModerationItem {
  id: string;
  url: string;
  isPrimary: boolean;
  isVerified: boolean;
  createdAt: string;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    profileId: string | null;
    status: string;
    role: string;
  };
}

export interface PhotoModerationResponse {
  data: PhotoModerationItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unverifiedCount: number;
  };
}

export interface PendingProfilesResponse {
  data: AdminUserListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    pendingCount: number;
    rejectedCount: number;
  };
}

export interface RelationshipManagerItem {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  profileId: string | null;
  status: string;
  isBanned: boolean;
  lastActiveAt: string;
  createdAt: string;
  isOnline?: boolean;
  assignedClientsCount: number;
  interactionsCount: number;
  followUpsCount: number;
  shortlistsCount: number;
}

export interface RmClientsResponse {
  rm: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
  clients: AdminUserListItem[];
}

export interface CreateAdminUserInput {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role: 'USER' | 'RM';
  phone?: string;
}

export const adminService = {
  createUser: (data: CreateAdminUserInput) => {
    return apiFetch<AdminUserListItem>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getUsers: (filters: AdminUserQueryFilters = {}, signal?: AbortSignal) => {
    const searchParams = new URLSearchParams();
    if (filters.page) searchParams.set("page", String(filters.page));
    if (filters.limit) searchParams.set("limit", String(filters.limit));
    if (filters.search) searchParams.set("search", filters.search);
    if (filters.location) searchParams.set("location", filters.location);
    if (filters.role && filters.role !== "ALL") searchParams.set("role", filters.role);
    if (filters.plan && filters.plan !== "ALL") searchParams.set("plan", filters.plan);
    if (filters.status && filters.status !== "ALL") searchParams.set("status", filters.status);

    const query = searchParams.toString();
    return apiFetch<AdminUserListResponse>(`/admin/users${query ? `?${query}` : ""}`, {
      method: "GET",
      signal,
    });
  },

  getDashboardStats: () => {
    return apiFetch("/admin/stats", {
      method: "GET",
    });
  },

  reactivateUser: (userId: string) => {
    return apiFetch<{ id: string; email: string; status: string; deactivatedAt: string | null }>(
      `/admin/users/${userId}/reactivate`,
      { method: "POST" }
    );
  },

  restoreUser: (userId: string) => {
    return apiFetch<{ id: string; email: string; status: string; deletedAt: string | null }>(
      `/admin/users/${userId}/restore`,
      { method: "POST" }
    );
  },

  purgeUser: (userId: string) => {
    return apiFetch<{ success: boolean; message: string }>(
      `/admin/users/${userId}/purge`,
      { method: "POST" }
    );
  },

  deleteUser: (userId: string) => {
    return apiFetch<{ success: boolean; message: string }>(
      `/admin/users/${userId}`,
      { method: "DELETE" }
    );
  },

  resetPassword: (userId: string, password: string) => {
    return apiFetch<{ success: boolean; message: string }>(
      `/admin/users/${userId}/reset-password`,
      {
        method: "POST",
        body: JSON.stringify({ password }),
      }
    );
  },

  updateUserDetails: (
    userId: string,
    data: { firstName?: string; lastName?: string; email?: string; phone?: string }
  ) => {
    return apiFetch<{ success: boolean; message: string; user: any }>(
      `/admin/users/${userId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  },

  banUser: (userId: string) => {
    return apiFetch<{ id: string; email: string; isBanned: boolean }>(`/admin/users/${userId}/ban`, {
      method: "POST",
    });
  },

  unbanUser: (userId: string) => {
    return apiFetch<{ id: string; email: string; isBanned: boolean }>(`/admin/users/${userId}/unban`, {
      method: "POST",
    });
  },

  updateUserStatus: (
    userId: string,
    status: 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'DEACTIVATED'
  ) => {
    return apiFetch<{ id: string; email: string; status: string; isBanned: boolean }>(
      `/admin/users/${userId}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );
  },

  updateSubscriptionTier: (userId: string, tier: string) => {
    return apiFetch<{ id: string; email: string; subscriptionTier: string }>(`/admin/users/${userId}/tier`, {
      method: "PATCH",
      body: JSON.stringify({ tier }),
    });
  },

  assignUserPlan: (
    userId: string,
    data: {
      planId?: string;
      planCode?: string;
      customDurationDays?: number;
      action?: 'apply' | 'revoke';
    }
  ) => {
    return apiFetch<{
      success: boolean;
      message: string;
      user: AdminUserListItem;
      subscription?: any;
    }>(`/admin/users/${userId}/assign-plan`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyPhoto: (photoId: string, status: "approved" | "rejected") => {
    return apiFetch(`/admin/photos/${photoId}/verify`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
  },

  // Plan Configuration Management
  getPlans: () => {
    return apiFetch<AdminPlanItem[]>('/admin/plans', {
      method: 'GET',
    });
  },

  createPlan: (data: PlanFormInput) => {
    return apiFetch<AdminPlanItem>('/admin/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePlan: (id: string, data: Partial<PlanFormInput>) => {
    return apiFetch<AdminPlanItem>(`/admin/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  togglePlanActive: (id: string) => {
    return apiFetch<AdminPlanItem>(`/admin/plans/${id}/toggle-active`, {
      method: 'PATCH',
    });
  },

  togglePlanPopular: (id: string) => {
    return apiFetch<AdminPlanItem>(`/admin/plans/${id}/toggle-popular`, {
      method: 'PATCH',
    });
  },

  deletePlan: (id: string) => {
    return apiFetch<{ id: string }>(`/admin/plans/${id}`, {
      method: 'DELETE',
    });
  },

  getAnalyticsOverview: async (
    params?: DateRangeInput,
    signal?: AbortSignal
  ): Promise<AnalyticsOverview> => {
    const searchParams = new URLSearchParams();
    if (params?.preset) searchParams.set("preset", params.preset);
    if (params?.from) searchParams.set("from", params.from);
    if (params?.to) searchParams.set("to", params.to);
    if (params?.timezone) searchParams.set("timezone", params.timezone);

    const queryString = searchParams.toString();
    const endpoint = `/admin/analytics/overview${queryString ? `?${queryString}` : ""}`;

    const res = await apiFetch<unknown>(endpoint, {
      method: "GET",
      signal,
    });

    const parsed = analyticsOverviewSchema.safeParse(res);
    if (!parsed.success) {
      console.error("Analytics overview schema validation failed:", parsed.error);
      throw new Error("Contract validation error: invalid analytics response from server");
    }

    return parsed.data;
  },

  getAnalyticsTimeSeries: async (
    params: { metric: "active_users" | "new_signups" | "revenue" | "churn_rate" } & DateRangeInput,
    signal?: AbortSignal
  ) => {
    const searchParams = new URLSearchParams();
    searchParams.set("metric", params.metric);
    if (params.preset) searchParams.set("preset", params.preset);
    if (params.from) searchParams.set("from", params.from);
    if (params.to) searchParams.set("to", params.to);
    if (params.timezone) searchParams.set("timezone", params.timezone);

    const queryString = searchParams.toString();
    const endpoint = `/admin/analytics/timeseries${queryString ? `?${queryString}` : ""}`;

    const res = await apiFetch<unknown>(endpoint, {
      method: "GET",
      signal,
    });

    const parsed = analyticsTimeSeriesResponseSchema.safeParse(res);
    if (!parsed.success) {
      console.error("Analytics timeseries schema validation failed:", parsed.error);
      throw new Error("Contract validation error: invalid timeseries response from server");
    }

    return parsed.data;
  },

  getCoolingPeriodSetting: (signal?: AbortSignal) => {
    return apiFetch<CoolingPeriodSetting>('/admin/settings/cooling-period', {
      method: 'GET',
      signal,
    });
  },

  updateCoolingPeriodSetting: (data: { enabled: boolean; days?: number }) => {
    return apiFetch<CoolingPeriodSetting>('/admin/settings/cooling-period', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Photo Moderation
  getPhotosForModeration: (
    query: { status?: 'unverified' | 'verified' | 'all'; page?: number; limit?: number; search?: string } = {},
    signal?: AbortSignal
  ) => {
    const params = new URLSearchParams();
    if (query.status) params.set('status', query.status);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.search) params.set('search', query.search);
    const qs = params.toString();
    return apiFetch<PhotoModerationResponse>(`/admin/photos/moderation${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      signal,
    });
  },

  batchVerifyPhotos: (photoIds: string[], status: 'approved' | 'rejected') => {
    return apiFetch<{ success: boolean; message: string; count: number }>('/admin/photos/batch-verify', {
      method: 'POST',
      body: JSON.stringify({ photoIds, status }),
    });
  },

  // Profile Approval & Rejection
  getPendingProfiles: (
    query: { status?: string; page?: number; limit?: number; search?: string } = {},
    signal?: AbortSignal
  ) => {
    const params = new URLSearchParams();
    if (query.status) params.set('status', query.status);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.search) params.set('search', query.search);
    const qs = params.toString();
    return apiFetch<PendingProfilesResponse>(`/admin/profiles/pending${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      signal,
    });
  },

  approveProfile: (userId: string) => {
    return apiFetch<{ success: boolean; message: string; user: AdminUserListItem }>(`/admin/profiles/${userId}/approve`, {
      method: 'POST',
    });
  },

  rejectProfile: (userId: string, reason: string) => {
    return apiFetch<{ success: boolean; message: string; user: AdminUserListItem }>(`/admin/profiles/${userId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Relationship Manager Management
  getRelationshipManagers: (signal?: AbortSignal) => {
    return apiFetch<RelationshipManagerItem[]>('/admin/rms', {
      method: 'GET',
      signal,
    });
  },

  getRmClients: (rmId: string, signal?: AbortSignal) => {
    return apiFetch<RmClientsResponse>(`/admin/rms/${rmId}/clients`, {
      method: 'GET',
      signal,
    });
  },

  assignClientsToRm: (rmId: string, clientUserIds: string[]) => {
    return apiFetch<{ success: boolean; message: string; assignedCount: number }>('/admin/rms/assign', {
      method: 'POST',
      body: JSON.stringify({ rmId, clientUserIds }),
    });
  },

  unassignClientsFromRm: (clientUserIds: string[]) => {
    return apiFetch<{ success: boolean; message: string; unassignedCount: number }>('/admin/rms/unassign', {
      method: 'POST',
      body: JSON.stringify({ clientUserIds }),
    });
  },
};
