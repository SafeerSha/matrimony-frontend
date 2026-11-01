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
import type { AdminUserListResponse, AdminUserQueryFilters } from "@/types/admin-user";
import { analyticsOverviewSchema, analyticsTimeSeriesResponseSchema } from "@/lib/validation/analytics";

export const adminService = {
  getUsers: (filters: AdminUserQueryFilters = {}, signal?: AbortSignal) => {
    const searchParams = new URLSearchParams();
    if (filters.page) searchParams.set("page", String(filters.page));
    if (filters.limit) searchParams.set("limit", String(filters.limit));
    if (filters.search) searchParams.set("search", filters.search);
    if (filters.location) searchParams.set("location", filters.location);
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

  updateSubscriptionTier: (userId: string, tier: "BASIC" | "PAID") => {
    return apiFetch<{ id: string; email: string; subscriptionTier: string }>(`/admin/users/${userId}/tier`, {
      method: "PATCH",
      body: JSON.stringify({ tier }),
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
};
