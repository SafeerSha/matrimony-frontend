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

export interface NotificationPreferences {
  notifyInterests: boolean;
  notifyMessages: boolean;
  notifyMatches: boolean;
  notifyMarketing: boolean;
}

/**
 * Parses notification text, formatting reply payloads and handling truncated JSON cleanly.
 */
export function parseNotificationText(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let text = raw.trim();

  // If prefixed with "SenderName: ", isolate the payload while keeping track of sender
  let senderPrefix = '';
  const colonIdx = text.indexOf(': ');
  if (colonIdx > -1 && colonIdx < 35 && (text.slice(colonIdx + 2).startsWith('{') || text.includes('{"replyTo":'))) {
    senderPrefix = text.slice(0, colonIdx).trim();
    text = text.slice(colonIdx + 2).trim();
  }

  // Full JSON parse
  if (text.startsWith('{"replyTo":') || text.startsWith('{"text":')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed.text === 'string') {
        const replyName = parsed.replyTo?.name;
        const msg = replyName ? `Replied to ${replyName}: ${parsed.text}` : parsed.text;
        return senderPrefix ? `${senderPrefix}: ${msg}` : msg;
      }
    } catch {}
  }

  // Handle truncated or embedded JSON like: {"replyTo":{"id":"...","name":"safeer","text...
  if (text.includes('{"replyTo":')) {
    const nameMatch = text.match(/"name"\s*:\s*"([^"]+)"/);
    const replyName = nameMatch ? nameMatch[1] : '';

    // Check if the final text field was reached
    const textMatches = [...text.matchAll(/"text"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"?/g)];
    if (textMatches.length >= 2) {
      const replyMsg = textMatches[textMatches.length - 1][1];
      const msg = replyName ? `Replied to ${replyName}: ${replyMsg}` : replyMsg;
      return senderPrefix ? `${senderPrefix}: ${msg}` : msg;
    }

    // If it truncated before reaching the message text:
    const msg = replyName ? `Replied to ${replyName}` : 'Sent a reply';
    return senderPrefix ? `${senderPrefix}: ${msg}` : msg;
  }

  return raw;
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
