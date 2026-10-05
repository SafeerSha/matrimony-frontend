'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  IconMessageCircle,
  IconCrown,
  IconArrowRight,
  IconShieldCheck,
  IconCompass,
} from '@tabler/icons-react';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { ChatConversationList } from '@/components/chat/chat-conversation-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { ChatProfilePanel } from '@/components/chat/chat-profile-panel';
import { chatService, Conversation, Message } from '@/services/chat.service';
import { profiles as demoProfiles } from '@/lib/demo-data';
import { cn } from '@/lib/cn';
import type { Profile } from '@/lib/demo-data';

// Demo initial conversation fallback seed
const createDemoConversations = (): { conversations: Conversation[]; messageMap: Record<string, Message[]> } => {
  const c1Id = 'conv-ananya';
  const c2Id = 'conv-meera';
  const c3Id = 'conv-diya';

  const convs: Conversation[] = [
    {
      id: c1Id,
      participantId: demoProfiles[0].id,
      participant: {
        id: demoProfiles[0].id,
        name: demoProfiles[0].name,
        firstName: 'Ananya',
        lastName: 'Menon',
        city: demoProfiles[0].city,
        country: demoProfiles[0].state,
        occupation: demoProfiles[0].profession,
        education: demoProfiles[0].education,
        bio: demoProfiles[0].about,
        isVerified: true,
        photos: [{ url: demoProfiles[0].image }],
      } as any,
      lastMessage: {
        id: 'msg-1-3',
        conversationId: c1Id,
        senderId: demoProfiles[0].id,
        receiverId: 'me',
        content: 'That sounds lovely. I also enjoy quiet cafés. Have you been to the heritage spots in Fort Kochi recently?',
        createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        isRead: false,
      },
      unreadCount: 1,
      updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      id: c2Id,
      participantId: demoProfiles[1].id,
      participant: {
        id: demoProfiles[1].id,
        name: demoProfiles[1].name,
        firstName: 'Meera',
        lastName: 'Nair',
        city: demoProfiles[1].city,
        country: demoProfiles[1].state,
        occupation: demoProfiles[1].profession,
        education: demoProfiles[1].education,
        bio: demoProfiles[1].about,
        isVerified: true,
        photos: [{ url: demoProfiles[1].image }],
      } as any,
      lastMessage: {
        id: 'msg-2-2',
        conversationId: c2Id,
        senderId: 'me',
        receiverId: demoProfiles[1].id,
        content: 'Yes, definitely! Would around 7 PM work for you this evening?',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        isRead: true,
      },
      unreadCount: 0,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: c3Id,
      participantId: demoProfiles[2].id,
      participant: {
        id: demoProfiles[2].id,
        name: demoProfiles[2].name,
        firstName: 'Diya',
        lastName: 'Krishnan',
        city: demoProfiles[2].city,
        country: demoProfiles[2].state,
        occupation: demoProfiles[2].profession,
        education: demoProfiles[2].education,
        bio: demoProfiles[2].about,
        isVerified: true,
        photos: [{ url: demoProfiles[2].image }],
      } as any,
      lastMessage: {
        id: 'msg-3-1',
        conversationId: c3Id,
        senderId: demoProfiles[2].id,
        receiverId: 'me',
        content: 'Thank you for accepting my interest. How has your week been?',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        isRead: true,
      },
      unreadCount: 0,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
  ];

  const messageMap: Record<string, Message[]> = {
    [c1Id]: [
      {
        id: 'msg-1-1',
        conversationId: c1Id,
        senderId: demoProfiles[0].id,
        receiverId: 'me',
        content: 'Namaste! Thank you for accepting my interest. I was drawn to your profile and shared interest in design and travel.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        isRead: true,
      },
      {
        id: 'msg-1-2',
        conversationId: c1Id,
        senderId: 'me',
        receiverId: demoProfiles[0].id,
        content: 'Namaste Ananya! Very happy to connect with you. I love discovering quiet cafés and thoughtful architecture as well.',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        isRead: true,
      },
      {
        id: 'msg-1-3',
        conversationId: c1Id,
        senderId: demoProfiles[0].id,
        receiverId: 'me',
        content: 'That sounds lovely. I also enjoy quiet cafés. Have you been to the heritage spots in Fort Kochi recently?',
        createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        isRead: false,
      },
    ],
    [c2Id]: [
      {
        id: 'msg-2-1',
        conversationId: c2Id,
        senderId: demoProfiles[1].id,
        receiverId: 'me',
        content: 'Hello! Our families seem to have very similar values. Would you like to continue our conversation this evening?',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
        isRead: true,
      },
      {
        id: 'msg-2-2',
        conversationId: c2Id,
        senderId: 'me',
        receiverId: demoProfiles[1].id,
        content: 'Yes, definitely! Would around 7 PM work for you this evening?',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        isRead: true,
      },
    ],
    [c3Id]: [
      {
        id: 'msg-3-1',
        conversationId: c3Id,
        senderId: demoProfiles[2].id,
        receiverId: 'me',
        content: 'Thank you for accepting my interest. How has your week been?',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        isRead: true,
      },
    ],
  };

  return { conversations: convs, messageMap };
};

export default function MessagesPage() {
  const [isSubscribed, setIsSubscribed] = useState(true); // Default true for demo
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Mobile View Management: 'list' (shows conversations list) vs 'chat' (full-screen active chat)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);

  // Mock message cache for instant fallback
  const demoFallbackRef = useRef(createDemoConversations());

  // Initialize Chat Socket & Fetch Conversations
  useEffect(() => {
    setIsLoadingConversations(true);

    // Connect to websocket
    chatService.connect();

    // Fetch initial conversations from backend API
    chatService
      .getConversations()
      .then((res) => {
        const data = Array.isArray(res) ? res : ((res as any)?.data || []);
        if (data.length > 0) {
          setConversations(data);
          setSelected(data[0]);
        } else {
          // Use demo conversations
          const { conversations: initialConvs } = demoFallbackRef.current;
          setConversations(initialConvs);
          if (initialConvs.length > 0) {
            setSelected(initialConvs[0]);
          }
        }
      })
      .catch((err) => {
        console.error('ChatService getConversations error:', err);
        const { conversations: initialConvs } = demoFallbackRef.current;
        setConversations(initialConvs);
        if (initialConvs.length > 0) {
          setSelected(initialConvs[0]);
        }
      })
      .finally(() => setIsLoadingConversations(false));

    // Listen for incoming websocket messages
    const unsubscribe = chatService.onMessage((msg: Message) => {
      // Append if it belongs to selected conversation
      setMessages((prev) => {
        if (selected && msg.conversationId === selected.id) {
          if (!prev.find((m) => m.id === msg.id)) {
            return [...prev, msg];
          }
        }
        return prev;
      });

      // Update lastMessage in conversation list
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === msg.conversationId) {
            return {
              ...c,
              lastMessage: msg,
              unreadCount: selected?.id === c.id ? 0 : (c.unreadCount || 0) + 1,
            };
          }
          return c;
        })
      );
    });

    return () => {
      unsubscribe();
      chatService.disconnect();
    };
  }, []);

  // Fetch messages when selected conversation changes
  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    chatService
      .getMessages(selected.id)
      .then((res) => {
        const data = Array.isArray(res) ? res : ((res as any)?.data || []);
        if (data.length > 0) {
          setMessages(data.reverse());
        } else {
          // IconCheck local demo messages map
          const fallback = demoFallbackRef.current.messageMap[selected.id] || [];
          setMessages(fallback);
        }
        chatService.markAsRead(selected.id).catch(console.error);

        // Clear unread count locally
        setConversations((prev) =>
          prev.map((c) => (c.id === selected.id ? { ...c, unreadCount: 0 } : c))
        );
      })
      .catch((err) => {
        console.error('Failed to get messages:', err);
        const fallback = demoFallbackRef.current.messageMap[selected.id] || [];
        setMessages(fallback);
      })
      .finally(() => setIsLoadingMessages(false));
  }, [selected?.id]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelected(conv);
    setMobileView('chat');
  };

  const handleSendMessage = async (content: string) => {
    if (!selected) return;

    const participantId = selected.participantId || selected.participant?.id || 'demo-partner';
    const tempId = `temp-${Date.now()}`;
    const newMsg: Message = {
      id: tempId,
      conversationId: selected.id,
      senderId: 'me',
      receiverId: participantId,
      content,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    // Optimistic append
    setMessages((prev) => [...prev, newMsg]);

    // Update conversation list item lastMessage
    setConversations((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, lastMessage: newMsg } : c))
    );

    // Keep fallback map updated
    if (!demoFallbackRef.current.messageMap[selected.id]) {
      demoFallbackRef.current.messageMap[selected.id] = [];
    }
    demoFallbackRef.current.messageMap[selected.id].push(newMsg);

    try {
      const serverMsg = await chatService.sendMessage(participantId, content);
      if (serverMsg && serverMsg.id) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? serverMsg : m))
        );
      }
    } catch (e) {
      // In demo mode or if server is disconnected, optimistic msg remains valid
      console.warn('Sent message optimistically (backend API unreachable):', e);
    }
  };

  // Find demoProfile match for enrichment
  const currentDemoProfile = useMemo(() => {
    if (!selected) return demoProfiles[0];
    const match = demoProfiles.find(
      (p) =>
        p.id === selected.participantId ||
        p.id === selected.participant?.id ||
        p.name.toLowerCase() === selected.participant?.name?.toLowerCase()
    );
    return match || demoProfiles[0];
  }, [selected]);

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Top Section Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between animate-content-appear stagger-1">
        <div>
          <SectionHeader
            eyebrow="Connections & Chat"
            title="Messages"
            description="Private, verified matrimonial conversations with mutual matches."
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setIsSubscribed((prev) => !prev)}
            className="text-[11px] font-semibold text-[#766B6F] hover:text-[#7A1835] border border-[#E9DDE0] px-3 py-1.5 rounded-xl bg-white transition-colors"
          >
            {isSubscribed ? 'Demo: Subscribed' : 'Demo: Free Plan'}
          </button>

          <Link href="/app/discover">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-xl text-xs font-bold gap-1.5 border-[#E9DDE0]"
              leftIcon={<IconCompass className="h-3.5 w-3.5 text-[#7A1835]" />}
            >
              <span>Discover</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* TWO-COLUMN DESKTOP / FULL-SCREEN MOBILE CONTAINER */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-[#E9DDE0] bg-[#FFFDFB] shadow-xs overflow-hidden h-[calc(100dvh-135px)] md:h-[calc(100vh-185px)] min-h-[460px] md:min-h-[620px] max-h-[820px] flex animate-content-appear stagger-2">
        
        {/* COLUMN 1: LEFT CONVERSATION LIST */}
        <aside
          className={cn(
            'w-full lg:w-[320px] xl:w-[350px] shrink-0 border-r border-[#E9DDE0] bg-[#FFFDFB] flex flex-col transition-all',
            // On mobile: hidden if we're in active chat view
            mobileView === 'chat' ? 'hidden lg:flex' : 'flex'
          )}
        >
          <ChatConversationList
            conversations={conversations}
            selectedId={selected?.id || null}
            onSelect={handleSelectConversation}
            isLoading={isLoadingConversations}
          />
        </aside>

        {/* COLUMN 2: CENTER ACTIVE CHAT WINDOW */}
        <main
          className={cn(
            'flex-1 flex flex-col min-w-0 bg-[#FFFDFB] relative',
            // On mobile: hidden if we're in list view
            mobileView === 'list' ? 'hidden lg:flex' : 'flex'
          )}
        >
          {selected ? (
            <ChatWindow
              conversation={selected}
              messages={messages}
              demoProfile={currentDemoProfile}
              isLoadingMessages={isLoadingMessages}
              isSubscribed={isSubscribed}
              onSendMessage={handleSendMessage}
              onBack={() => setMobileView('list')}
              onOpenProfile={() => setIsMobileProfileOpen(true)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FFF9F6]/40">
              <div className="h-16 w-16 rounded-3xl bg-[#FAF3EC] border border-[#EAD8C7] flex items-center justify-center text-[#7A1835] mb-4">
                <IconMessageCircle className="h-8 w-8" />
              </div>
              <h3 className="font-editorial-title text-xl font-bold text-[#211B1E] mb-2">
                Your Matrimonial Conversations
              </h3>
              <p className="text-xs text-[#766B6F] max-w-sm leading-relaxed mb-6">
                Select a match from the conversation list to continue your connection, or explore
                new verified profiles in Discover.
              </p>
              <Link href="/app/discover">
                <Button
                  size="md"
                  className="rounded-2xl bg-[#7A1835] text-white hover:bg-[#5C1027] text-xs font-bold"
                >
                  Discover Matches
                </Button>
              </Link>
            </div>
          )}
        </main>


      </div>

      {/* MOBILE PROFILE BOTTOM SHEET */}
      {selected && (
        <BottomSheet
          isOpen={isMobileProfileOpen}
          onClose={() => setIsMobileProfileOpen(false)}
          title="Member Profile"
          description="Matrimonial connection overview"
        >
          <ChatProfilePanel
            participant={selected.participant}
            demoProfile={currentDemoProfile}
            onClose={() => setIsMobileProfileOpen(false)}
          />
        </BottomSheet>
      )}
    </div>
  );
}
