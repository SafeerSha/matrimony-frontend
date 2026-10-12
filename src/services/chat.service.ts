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
}

class ChatService {
  private socket: Socket | null = null;
  private messageHandlers: Set<(msg: Message) => void> = new Set();

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

  onMessage(handler: (msg: Message) => void) {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Fetch conversations. In this matrimony platform, active conversations are
   * established between mutual accepted connections (/connections?type=matches).
   */
  async getConversations(): Promise<Conversation[]> {
    // 1. Check if backend implements dedicated /chat/conversations
    try {
      const data = await apiFetch<Conversation[]>("/chat/conversations", { method: "GET" });
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      // Expected if /chat/conversations is not implemented on backend
    }

    // 2. Query mutual matches from /connections?type=matches
    try {
      const currentUserId = (await authService.getCurrentUser().catch(() => null))?.id;
      const res = await apiFetch<any>("/connections?type=matches", { method: "GET" });
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
      if (err?.status === 404) {
        const fallbackRes = await apiFetch<Message[]>(
          `/chat/conversations/${contactId}/messages`,
          { method: "GET" }
        ).catch(() => []);
        return Array.isArray(fallbackRes) ? fallbackRes : (fallbackRes as any)?.data || [];
      }
      throw err;
    }
  }

  /**
   * Send message via WebSocket gateway @SubscribeMessage('send_message') with REST fallback
   */
  async sendMessage(receiverId: string, content: string): Promise<Message> {
    // 1. If socket is connected, emit send_message
    if (this.socket && this.socket.connected) {
      return new Promise<Message>((resolve, reject) => {
        const timeout = setTimeout(() => {
          this.socket?.off("message_sent", onSent);
          reject(new Error("Timeout sending message via socket"));
        }, 6000);

        const onSent = (res: any) => {
          clearTimeout(timeout);
          const msg = res?.data || res;
          if (msg && (msg.id || msg.content)) {
            resolve(msg);
          }
        };

        this.socket?.once("message_sent", onSent);

        this.socket?.emit("send_message", { receiverId, content }, (res: any) => {
          clearTimeout(timeout);
          this.socket?.off("message_sent", onSent);
          if (res?.event === "error" || res?.error) {
            reject(new Error(res?.data || res?.error || "Failed to send message"));
          } else {
            resolve(res?.data || res);
          }
        });
      }).catch(async (socketErr) => {
        console.warn("[ChatService] WebSocket send failed, checking REST fallback:", socketErr);
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
   * Mark messages as read via PUT /chat/read/:contactId
   */
  async markAsRead(contactId: string): Promise<void> {
    try {
      await apiFetch(`/chat/read/${contactId}`, { method: "PUT" });
    } catch {
      await apiFetch(`/chat/conversations/${contactId}/read`, { method: "POST" }).catch(() => {});
    }
  }
}

export const chatService = new ChatService();
