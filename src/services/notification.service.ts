import { apiFetch } from "@/lib/http/api-client";

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  content: string;
  referenceId?: string | null;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatarUrl: string | null;
    city?: string | null;
    occupation?: string | null;
  } | null;
}

export const notificationService = {
  getNotifications: () => {
    return apiFetch<NotificationItem[]>("/notifications", {
      method: "GET",
    });
  },

  markAllAsRead: () => {
    return apiFetch<{ success: boolean }>("/notifications/read-all", {
      method: "PUT",
    });
  },

  markAsRead: (id: string) => {
    return apiFetch<{ success: boolean }>('/notifications/' + id + '/read', {
      method: "PUT",
    });
  },
};
