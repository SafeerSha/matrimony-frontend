import { apiFetch } from "@/lib/http/api-client";
import type { UserProfile } from "./profile.service";

export interface SearchFilters {
  minAge?: number;
  maxAge?: number;
  religion?: string;
  city?: string;
  maritalStatus?: string;
  page?: number;
  limit?: number;
}

export const matchesService = {
  getRecommendations: () => {
    return apiFetch<UserProfile[]>("/discovery/recommendations", {
      method: "GET",
    });
  },

  searchProfiles: (filters: SearchFilters) => {
    const params = new URLSearchParams(filters as Record<string, string>).toString();
    return apiFetch<{ data: UserProfile[]; total: number }>(`/discovery/search?${params}`, {
      method: "GET",
    });
  },

  sendInterest: (userId: string) => {
    return apiFetch(`/connections/interest/${userId}`, {
      method: "POST",
    });
  },

  acceptInterest: (userId: string) => {
    return apiFetch(`/connections/accept/${userId}`, {
      method: "POST",
    });
  },

  rejectInterest: (userId: string) => {
    return apiFetch(`/connections/reject/${userId}`, {
      method: "POST",
    });
  },

  shortlistProfile: (userId: string) => {
    return apiFetch(`/connections/shortlist/${userId}`, {
      method: "POST",
    });
  },
  
  getConnections: (type: "received" | "sent" | "matches" | "shortlisted") => {
    return apiFetch<UserProfile[]>(`/connections?type=${type}`, {
      method: "GET",
    });
  }
};
