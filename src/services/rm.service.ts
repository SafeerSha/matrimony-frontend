import { apiFetch } from "@/lib/http/api-client";
import type {
  RmFeedbackListResponse,
  RmFeedbackQueryFilters,
  RmFeedbackStats,
  RmFeedbackItem,
  RmUserDetail,
  RmUserListItem,
  RmUserListResponse,
  RmUserQueryFilters,
  RmUserStats,
  UpdateRmFeedbackPayload,
  RmAssignedClientItem,
  RmDashboardMetrics,
  RmShortlistItem,
  RmInteractionItem,
  RmFollowUpItem,
} from "@/types/rm";

export const rmService = {
  // ==========================================
  // RM Dashboard & Assigned Clients Portfolio
  // ==========================================

  getDashboard: (signal?: AbortSignal) => {
    return apiFetch<RmDashboardMetrics>("/rm/dashboard", {
      method: "GET",
      signal,
    });
  },

  getMyClients: (
    filters: { page?: number; limit?: number; search?: string; stage?: string; tier?: string } = {},
    signal?: AbortSignal
  ) => {
    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.search) params.set("search", filters.search);
    if (filters.stage && filters.stage !== "ALL") params.set("stage", filters.stage);
    if (filters.tier && filters.tier !== "ALL") params.set("tier", filters.tier);
    const qs = params.toString();

    return apiFetch<{
      data: RmAssignedClientItem[];
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/rm/my-clients${qs ? `?${qs}` : ""}`, {
      method: "GET",
      signal,
    });
  },

  updateClientStage: (clientId: string, clientStage: string) => {
    return apiFetch<{ success: boolean; message: string; client: any }>(
      `/rm/clients/${encodeURIComponent(clientId)}/stage`,
      {
        method: "PATCH",
        body: JSON.stringify({ clientStage }),
      }
    );
  },

  // ==========================================
  // Shortlists on Behalf of Clients
  // ==========================================

  getShortlistsForClient: (clientId: string, signal?: AbortSignal) => {
    return apiFetch<RmShortlistItem[]>(`/rm/clients/${encodeURIComponent(clientId)}/shortlists`, {
      method: "GET",
      signal,
    });
  },

  createShortlist: (clientId: string, candidateId: string, notes?: string) => {
    return apiFetch<{ success: boolean; message: string; shortlist: RmShortlistItem }>(
      `/rm/clients/${encodeURIComponent(clientId)}/shortlists`,
      {
        method: "POST",
        body: JSON.stringify({ candidateId, notes }),
      }
    );
  },

  deleteShortlist: (clientId: string, candidateId: string) => {
    return apiFetch<{ success: boolean; message: string }>(
      `/rm/clients/${encodeURIComponent(clientId)}/shortlists/${encodeURIComponent(candidateId)}`,
      {
        method: "DELETE",
      }
    );
  },

  searchCandidates: (clientId: string, query: Record<string, any> = {}, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "" && v !== "ALL") {
        params.set(k, String(v));
      }
    });
    const qs = params.toString();

    return apiFetch<{
      data: Array<RmUserListItem & { isShortlisted?: boolean; shortlistNotes?: string | null; shortlistStatus?: string | null }>;
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>(`/rm/clients/${encodeURIComponent(clientId)}/candidates${qs ? `?${qs}` : ""}`, {
      method: "GET",
      signal,
    });
  },

  // ==========================================
  // Interaction Tracking
  // ==========================================

  getInteractions: (clientId: string, signal?: AbortSignal) => {
    return apiFetch<RmInteractionItem[]>(`/rm/clients/${encodeURIComponent(clientId)}/interactions`, {
      method: "GET",
      signal,
    });
  },

  createInteraction: (
    clientId: string,
    payload: {
      channel: string;
      status?: string;
      clientStage?: string;
      summary: string;
      details?: string;
      interactionAt?: string;
    }
  ) => {
    return apiFetch<{ success: boolean; message: string; interaction: RmInteractionItem }>(
      `/rm/clients/${encodeURIComponent(clientId)}/interactions`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  // ==========================================
  // Follow-Up Scheduling
  // ==========================================

  getFollowUps: (
    query: { filter?: 'today' | 'upcoming' | 'overdue' | 'all' | 'completed'; clientId?: string } = {},
    signal?: AbortSignal
  ) => {
    const params = new URLSearchParams();
    if (query.filter) params.set("filter", query.filter);
    if (query.clientId) params.set("clientId", query.clientId);
    const qs = params.toString();

    return apiFetch<RmFollowUpItem[]>(`/rm/follow-ups${qs ? `?${qs}` : ""}`, {
      method: "GET",
      signal,
    });
  },

  createFollowUp: (
    clientId: string,
    payload: {
      title: string;
      description?: string;
      scheduledAt: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    }
  ) => {
    return apiFetch<{ success: boolean; message: string; followUp: RmFollowUpItem }>(
      `/rm/clients/${encodeURIComponent(clientId)}/follow-ups`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
  },

  updateFollowUp: (
    followUpId: string,
    payload: {
      status?: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
      scheduledAt?: string;
      completionNotes?: string;
    }
  ) => {
    return apiFetch<{ success: boolean; message: string; followUp: RmFollowUpItem }>(
      `/rm/follow-ups/${encodeURIComponent(followUpId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );
  },
  getUsers: (filters: RmUserQueryFilters = {}, signal?: AbortSignal) => {
    const searchParams = new URLSearchParams();
    if (filters.page) searchParams.set("page", String(filters.page));
    if (filters.limit) searchParams.set("limit", String(filters.limit));
    if (filters.search) searchParams.set("search", filters.search);
    if (filters.location) searchParams.set("location", filters.location);
    if (filters.category && filters.category !== "ALL") searchParams.set("category", filters.category);
    if (filters.category === "Marriage" && filters.subCategories && filters.subCategories.length > 0) {
      searchParams.set("subCategories", filters.subCategories.join(","));
    }
    if (filters.plan && filters.plan !== "ALL") searchParams.set("plan", filters.plan);
    if (filters.status && filters.status !== "ALL") searchParams.set("status", filters.status);
    if (filters.verified && filters.verified !== "ALL") searchParams.set("verified", filters.verified);
    if (filters.gender && filters.gender !== "ALL") searchParams.set("gender", filters.gender);

    const query = searchParams.toString();
    return apiFetch<RmUserListResponse>(`/rm/users${query ? `?${query}` : ""}`, {
      method: "GET",
      signal,
    });
  },

  getUserStats: (signal?: AbortSignal) => {
    return apiFetch<RmUserStats>("/rm/users/stats", {
      method: "GET",
      signal,
    });
  },

  getUserDetail: (userId: string, signal?: AbortSignal) => {
    return apiFetch<RmUserDetail>(`/rm/users/${encodeURIComponent(userId)}`, {
      method: "GET",
      signal,
    });
  },

  getFeedback: (filters: RmFeedbackQueryFilters = {}, signal?: AbortSignal) => {
    const searchParams = new URLSearchParams();
    if (filters.page) searchParams.set("page", String(filters.page));
    if (filters.limit) searchParams.set("limit", String(filters.limit));
    if (filters.type && filters.type !== "ALL") searchParams.set("type", filters.type);
    if (filters.status && filters.status !== "ALL") searchParams.set("status", filters.status);
    if (filters.priority && filters.priority !== "ALL") searchParams.set("priority", filters.priority);
    if (filters.rating) searchParams.set("rating", String(filters.rating));
    if (filters.search) searchParams.set("search", filters.search);

    const query = searchParams.toString();
    return apiFetch<RmFeedbackListResponse>(`/rm/feedback${query ? `?${query}` : ""}`, {
      method: "GET",
      signal,
    });
  },

  getFeedbackStats: (signal?: AbortSignal) => {
    return apiFetch<RmFeedbackStats>("/rm/feedback/stats", {
      method: "GET",
      signal,
    });
  },

  updateFeedback: (feedbackId: string, payload: UpdateRmFeedbackPayload) => {
    return apiFetch<RmFeedbackItem>(`/rm/feedback/${encodeURIComponent(feedbackId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};

