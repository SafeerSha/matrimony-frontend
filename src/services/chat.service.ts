import { io, Socket } from "socket.io-client";
import { apiFetch } from "@/lib/http/api-client";
import type { UserProfile } from "./profile.service";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
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
  
  // Connect to websocket
  connect() {
    if (this.socket) return;
    
    // In production, you would attach the token if needed, or rely on cookie depending on backend config
    const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8080';
    
    this.socket = io(API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    this.socket.on('newMessage', (message: Message) => {
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
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

  // API Methods
  async getConversations(): Promise<Conversation[]> {
    return apiFetch<Conversation[]>("/chat/conversations", { method: "GET" });
  }

  async getMessages(conversationId: string, page = 1): Promise<Message[]> {
    return apiFetch<Message[]>(`/chat/conversations/${conversationId}/messages?page=${page}`, { method: "GET" });
  }

  async sendMessage(receiverId: string, content: string): Promise<Message> {
    return apiFetch<Message>(`/chat/messages`, {
      method: "POST",
      body: JSON.stringify({ receiverId, content }),
    });
  }

  async markAsRead(conversationId: string): Promise<void> {
    return apiFetch(`/chat/conversations/${conversationId}/read`, { method: "POST" });
  }
}

export const chatService = new ChatService();
