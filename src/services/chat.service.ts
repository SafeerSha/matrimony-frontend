function extractErrorMessage(res: any): string {
  if (!res) return "You can only message profiles you have mutually connected with.";
  if (typeof res === "string" && res.trim()) return res.trim();
  if (typeof res?.data === "string" && res.data.trim()) return res.data.trim();
  if (typeof res?.data?.message === "string" && res.data.message.trim()) return res.data.message.trim();
  if (typeof res?.message === "string" && res.message.trim()) return res.message.trim();
  if (typeof res?.error === "string" && res.error.trim()) return res.error.trim();
  if (typeof res?.data?.error === "string" && res.data.error.trim()) return res.data.error.trim();
  return "You can only message profiles you have mutually connected with.";
}

import { io, Socket } from "socket.io-client";
import { apiFetch } from "@/lib/http/api-client";
import type { UserProfile } from "./profile.service";
import { authService } from "./auth.service";

export interface Message {
  id: string;
  conversationId?: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participant?: UserProfile;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  isProvisional?: boolean;
}

class ChatService {
  private socket: Socket | null = null;
  private messageHandlers: Set<(msg: Message) => void> = new Set();
  private readReceiptHandlers: Set<(data: { readerId: string; contactId: string }) => void> = new Set();

  /**
   * Connect to backend WebSocket gateway
   */
  connect() {
    if (this.socket?.connected) return;

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const API_URL =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") ||
      (typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:4000"
        : "https://matrimony-backend-taupe.vercel.app");

    const token = authService.getAccessToken();

    this.socket = io(API_URL, {
      auth: token ? { token } : undefined,
      extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("[ChatService] Connected to chat websocket server");
    });

    // Backend ChatGateway emits 'receive_message' on new incoming message
    this.socket.on("receive_message", (message: Message) => {
      this.messageHandlers.forEach((handler) => handler(message));
    });

    // Alternate event name fallback for forward compatibility
    this.socket.on("newMessage", (message: Message) => {
      this.messageHandlers.forEach((handler) => handler(message));
    });

    // Backend ChatGateway emits 'messages_read' when recipient opens messages
    this.socket.on("messages_read", (data: any) => {
      this.readReceiptHandlers.forEach((handler) => handler(data));
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[ChatService] Disconnected from chat server:", reason);
    });

    this.socket.on("connect_error", (err) => {
      console.warn("[ChatService] WebSocket connection error:", err.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    if (!this.socket) {
      this.connect();
    }
    return this.socket;
  }

  onPresence(handler: (data: { userId: string; isOnline: boolean; lastActiveAt?: string }) => void) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on("user_presence", handler);
    return () => {
      this.socket?.off("user_presence", handler);
    };
  }

  onMessage(handler: (msg: Message) => void) {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  onMessagesRead(handler: (data: { readerId: string; contactId: string }) => void) {
    this.readReceiptHandlers.add(handler);
    return () => {
      this.readReceiptHandlers.delete(handler);
    };
  }

  onMatchCelebration(handler: (data: { notificationId?: string; partner: any }) => void) {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.on("match_celebration", handler);
    return () => {
      this.socket?.off("match_celebration", handler);
    };
  }

  /**
   * Fetch conversations. In this matrimony platform, active conversations are
   * established between mutual accepted connections (/connections?type=matches).
   */
  async getConversations(): Promise<Conversation[]> {
    // 1. Primary: dedicated backend /chat/conversations endpoint
    try {
      const data = await apiFetch<Conversation[]>("/chat/conversations", { method: "GET" });
      if (Array.isArray(data)) {
        return data.map((conv: any) => {
          const p = conv.participant || {};
          const fullName =
            p.name ||
            `${p.firstName || ''} ${p.lastName || ''}`.trim() ||
            conv.name ||
            'Member';
          const photo =
            p.avatarUrl ||
            p.photos?.[0]?.url ||
            p.image ||
            conv.avatarUrl ||
            conv.image ||
            null;
          return {
            ...conv,
            participant: {
              ...p,
              name: fullName,
              avatarUrl: photo,
              photos: p.photos || (photo ? [{ id: 'p1', url: photo }] : []),
            },
          };
        });
      }
    } catch (err: any) {
      console.warn("[ChatService] /chat/conversations fallback to matches:", err?.message || err);
    }

    // 2. Fallback: query mutual matches from /connections?type=matches
    try {
      const currentUserId = (await authService.getCurrentUser().catch(() => null))?.id;
      const res = await apiFetch<any>("/connections?type=matches", { method: "GET" }).catch(() => []);
      const rawList = Array.isArray(res) ? res : res?.data || [];

      if (!Array.isArray(rawList) || rawList.length === 0) {
        return [];
      }

      const conversations: Conversation[] = rawList.map((item: any, index: number) => {
        const isConnection = Boolean(item.sender && item.receiver);
        const partner = isConnection
          ? item.senderId === currentUserId
            ? item.receiver
            : item.sender
          : item;

        const profile = partner.profile || partner;
        const participantId = partner.id || partner.userId || profile.id || `contact-${index}`;
        const name =
          profile.name ||
          `${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
          partner.email ||
          "Member";

        const participant: UserProfile = {
          id: participantId,
          userId: partner.id || participantId,
          name,
          firstName: profile.firstName || name.split(" ")[0],
          lastName: profile.lastName || "",
          city: profile.city || "Kochi",
          country: profile.country || profile.state || "Kerala",
          occupation: profile.occupation || profile.profession || "Professional",
          education: profile.education || "Graduate Degree",
          bio: profile.bio || profile.about || "",
          isVerified: profile.isVerified ?? true,
          photos: profile.photos?.length
            ? profile.photos
            : profile.image
            ? [{ id: "p1", url: profile.image }]
            : [],
        };

        return {
          id: participantId,
          participantId,
          participant,
          unreadCount: 0,
          updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
        };
      });

      return conversations;
    } catch (err) {
      console.error("[ChatService] Failed to load conversations:", err);
      return [];
    }
  }

  /**
   * Fetch chat history for contact via GET /chat/history/:contactId
   */
  async getMessages(contactId: string): Promise<Message[]> {
    try {
      const res = await apiFetch<Message[]>(`/chat/history/${contactId}`, { method: "GET" });
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      return list.map((m: any) => ({
        ...m,
        conversationId: m.conversationId || contactId,
      }));
    } catch (err: any) {
      if (err?.status === 404 || err?.status === 403) {
        const fallbackRes = await apiFetch<Message[]>(
          `/chat/conversations/${contactId}/messages`,
          { method: "GET" }
        ).catch(() => []);
        return Array.isArray(fallbackRes) ? fallbackRes : (fallbackRes as any)?.data || [];
      }
      return [];
    }
  }

  /**
   * Send message via WebSocket gateway @SubscribeMessage('send_message') with REST fallback
   */
  async sendMessage(receiverId: string, content: string): Promise<Message> {
    // 1. If socket is connected, emit send_message
    if (this.socket && this.socket.connected) {
      return new Promise<Message>((resolve, reject) => {
        const cleanup = () => {
          clearTimeout(timeout);
          this.socket?.off("message_sent", onSent);
          this.socket?.off("error", onError);
          this.socket?.off("subscription_required", onSubscription);
        };

        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error("Timeout sending message via socket"));
        }, 2500);

        const onSent = (res: any) => {
          cleanup();
          const msg = res?.data || res;
          if (msg && (msg.id || msg.content)) {
            resolve(msg);
          }
        };

        const onError = (res: any) => {
          cleanup();
          const errorMsg = extractErrorMessage(res);
          const err: any = new Error(errorMsg);
          err.isBackendError = true;
          reject(err);
        };

        const onSubscription = (res: any) => {
          cleanup();
          const errorMsg = extractErrorMessage(res) || "An active Chat Permit is required to send messages.";
          const err: any = new Error(errorMsg);
          err.isBackendError = true;
          reject(err);
        };

        this.socket?.once("message_sent", onSent);
        this.socket?.once("error", onError);
        this.socket?.once("subscription_required", onSubscription);

        this.socket?.emit("send_message", { receiverId, content }, (res: any) => {
          cleanup();
          if (res?.event === "error" || res?.error) {
            const err: any = new Error(extractErrorMessage(res));
            err.isBackendError = true;
            reject(err);
          } else if (res?.event === "subscription_required") {
            const err: any = new Error(extractErrorMessage(res) || "Subscription required");
            err.isBackendError = true;
            reject(err);
          } else {
            resolve(res?.data || res);
          }
        });
      }).catch(async (socketErr: any) => {
        // If the backend socket explicitly rejected with a policy/business rule (e.g. CONNECTION_REQUIRED),
        // rethrow immediately. Do NOT delay or trigger a redundant REST fallback that will fail with the exact same error.
        if (socketErr?.isBackendError) {
          throw socketErr;
        }

        console.warn("[ChatService] WebSocket send failed, checking REST fallback:", socketErr?.message || socketErr);
        return await apiFetch<Message>("/chat/messages", {
          method: "POST",
          body: JSON.stringify({ receiverId, content }),
        });
      });
    }

    // 2. If socket not currently connected, trigger connection and try REST fallback
    this.connect();
    return await apiFetch<Message>("/chat/messages", {
      method: "POST",
      body: JSON.stringify({ receiverId, content }),
    });
  }

  /**
   * Mark messages as read via WebSocket + PUT /chat/read/:contactId
   */
  async markAsRead(contactId: string): Promise<void> {
    if (this.socket && this.socket.connected) {
      this.socket.emit("mark_read", { contactId });
    }
    try {
      await apiFetch(`/chat/read/${contactId}`, { method: "PUT" });
    } catch {
      await apiFetch(`/chat/conversations/${contactId}/read`, { method: "POST" }).catch(() => {});
    }
  }

  async initiateChat(contactId: string): Promise<{ success: boolean; conversationId: string; contactId: string; partner?: any }> {
    return apiFetch(`/chat/initiate/${contactId}`, {
      method: "POST",
    });
  }
}

export const chatService = new ChatService();
