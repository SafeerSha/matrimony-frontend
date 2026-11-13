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
    category?: string | null;
    profileFor?: string | null;
    state?: string | null;
    motherTongue?: string | null;
  } | null;
}

export interface NotificationPreferences {
  notifyInterests: boolean;
  notifyMessages: boolean;
  notifyMatches: boolean;
  notifyMarketing: boolean;
}

/**
 * Parses notification text: extracts the pure incoming message content and strips any reply JSON metadata.
 */
export function parseNotificationText(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let text = raw.trim();

  // If prefixed with "SenderName: ", isolate the payload
  const colonIdx = text.indexOf(': ');
  if (colonIdx > -1 && colonIdx < 35 && (text.slice(colonIdx + 2).startsWith('{') || text.includes('{"replyTo":') || text.slice(colonIdx + 2).startsWith('Replied to '))) {
    text = text.slice(colonIdx + 2).trim();
  }

  // Full JSON parse - extract strictly the incoming message text
  if (text.startsWith('{"replyTo":') || text.startsWith('{"text":')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.text === 'string' && parsed.text.trim()) {
        return parsed.text.trim();
      }
    } catch {}
  }

  // Handle truncated or embedded JSON like: {"replyTo":{"id":"...","name":"...","text":"..."},"text":"incoming message"
  if (text.includes('{"replyTo":')) {
    const textMatches = [...text.matchAll(/"text"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"?/g)];
    if (textMatches.length >= 2) {
      const replyMsg = textMatches[textMatches.length - 1][1]?.trim();
      if (replyMsg) return replyMsg;
    }
    return 'New message';
  }

  // If legacy formatted as "Replied to <name>: <msg>" or "Replied to <name>"
  const repliedMatch = text.match(/^Replied to [^:]+(?::\s*(.*))?$/i);
  if (repliedMatch) {
    const after = repliedMatch[1]?.trim();
    return after || 'New message';
  }

  return raw;
}

export const notificationService = {
  getNotifications: async (params?: { cursor?: string; limit?: number; direction?: "before" | "after" }) => {
    const query = new URLSearchParams();
    if (params?.cursor) query.set("cursor", params.cursor);
    if (params?.limit !== undefined) query.set("limit", String(params.limit));
    if (params?.direction) query.set("direction", params.direction);
    const qs = query.toString();
    const res = await apiFetch<NotificationItem[] | { data?: NotificationItem[] }>(
      qs ? `/notifications?${qs}` : "/notifications",
      { method: "GET" }
    );
    return Array.isArray(res) ? res : res?.data || [];
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

  getPreferences: () => {
    return apiFetch<NotificationPreferences>("/notifications/preferences", {
      method: "GET",
    });
  },

  updatePreferences: (data: Partial<NotificationPreferences>) => {
    return apiFetch<NotificationPreferences>("/notifications/preferences", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
