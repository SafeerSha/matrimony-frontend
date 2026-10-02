import { apiFetch } from "@/lib/http/api-client";
import type { UserProfile } from "./profile.service";

export const adminService = {
  getUsers: () => {
    return apiFetch<UserProfile[]>("/admin/users", {
      method: "GET",
    });
  },

  getDashboardStats: () => {
    return apiFetch("/admin/stats", {
      method: "GET",
    });
  },

  banUser: (userId: string) => {
    return apiFetch(`/admin/users/${userId}/ban`, {
      method: "POST",
    });
  },

  verifyPhoto: (photoId: string, status: "approved" | "rejected") => {
    return apiFetch(`/admin/photos/${photoId}/verify`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });
  },
};
