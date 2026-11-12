import { apiFetch } from "@/lib/http/api-client";
import type {
  RmFeedbackListResponse,
  RmFeedbackQueryFilters,
  RmFeedbackStats,
  RmFeedbackItem,
  RmUserDetail,
  RmUserListResponse,
  RmUserQueryFilters,
  RmUserStats,
  UpdateRmFeedbackPayload,
} from "@/types/rm";

export const rmService = {
  getUsers: (filters: RmUserQueryFilters = {}, signal?: AbortSignal) => {
    const searchParams = new URLSearchParams();
    if (filters.page) searchParams.set("page", String(filters.page));
    if (filters.limit) searchParams.set("limit", String(filters.limit));
    if (filters.search) searchParams.set("search", filters.search);
    if (filters.location) searchParams.set("location", filters.location);
    if (filters.category && filters.category !== "ALL") searchParams.set("category", filters.category);
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

