'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  IconMessageCircle,
  IconCompass,
} from '@tabler/icons-react';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { ChatConversationList } from '@/components/chat/chat-conversation-list';
import { ChatWindow } from '@/components/chat/chat-window';
import { ChatProfilePanel } from '@/components/chat/chat-profile-panel';
import { chatService, Conversation, Message } from '@/services/chat.service';
import { authService } from '@/services/auth.service';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import { FeatureGate } from '@/components/ui/under-development';

function MessagesPageContent() {
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('user');

  const [isSubscribed, setIsSubscribed] = useState(true); // Default true for demo
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('me');

  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Mobile View Management: 'list' (shows conversations list) vs 'chat' (full-screen active chat)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);

  const selectedRef = useRef<Conversation | null>(null);
  selectedRef.current = selected;

  // 1. Fetch current logged in user & initialize chat websocket
  useEffect(() => {
    authService
      .getCurrentUser()
      .then((user) => {
        if (user?.id) {
          setCurrentUserId(user.id);
        }
      })
      .catch(() => {});

    setIsLoadingConversations(true);

    // Connect to backend WebSocket gateway
    chatService.connect();

    // Fetch live conversations (mutual matches from backend)
    chatService
      .getConversations()
      .then((res) => {
        const data = Array.isArray(res) ? res : ((res as any)?.data || []);
        let activeList = data.length > 0 ? data : demoFallbackRef.current.conversations;

        // If targetUserId query param is passed, ensure it is selected
        if (targetUserId) {
          const existing = activeList.find(
            (c: any) => c.participantId === targetUserId || c.participant?.id === targetUserId
          );
          if (existing) {
            setConversations(activeList);
            setSelected(existing);
            setMobileView('chat');
            return;
          }

          // Not in active list yet: create a conversation entry for this matched partner
          const matchedDemo = demoProfiles.find((p) => p.id === targetUserId);
          const newConv: Conversation = {
            id: `conv-${targetUserId}`,
            participantId: targetUserId,
            participant: matchedDemo
              ? ({
                  id: matchedDemo.id,
                  name: matchedDemo.name,
                  firstName: matchedDemo.name.split(' ')[0],
                  lastName: matchedDemo.name.split(' ').slice(1).join(' '),
                  city: matchedDemo.city,
                  country: matchedDemo.state,
                  occupation: matchedDemo.profession,
                  education: matchedDemo.education,
                  bio: matchedDemo.about,
                  isVerified: true,
                  photos: [{ url: matchedDemo.image }],
                } as any)
              : ({
                  id: targetUserId,
                  name: 'Mutual Match',
                  isVerified: true,
                } as any),
            unreadCount: 0,
            updatedAt: new Date().toISOString(),
          };

          activeList = [newConv, ...activeList.filter((c: any) => c.id !== newConv.id)];
          setConversations(activeList);
          setSelected(newConv);
          setMobileView('chat');
          return;
        }

        setConversations(activeList);
        if (activeList.length > 0) {
          setSelected(activeList[0]);
        }
      })
      .catch((err) => {
        console.error('ChatService getConversations error:', err);
        const { conversations: initialConvs } = demoFallbackRef.current;
        let activeList = initialConvs;

        if (targetUserId) {
          const matchedDemo = demoProfiles.find((p) => p.id === targetUserId);
          const newConv: Conversation = {
            id: `conv-${targetUserId}`,
            participantId: targetUserId,
            participant: matchedDemo
              ? ({
                  id: matchedDemo.id,
                  name: matchedDemo.name,
                  firstName: matchedDemo.name.split(' ')[0],
                  lastName: matchedDemo.name.split(' ').slice(1).join(' '),
                  city: matchedDemo.city,
                  country: matchedDemo.state,
                  occupation: matchedDemo.profession,
                  education: matchedDemo.education,
                  bio: matchedDemo.about,
                  isVerified: true,
                  photos: [{ url: matchedDemo.image }],
                } as any)
              : ({
                  id: targetUserId,
                  name: 'Mutual Match',
                  isVerified: true,
                } as any),
            unreadCount: 0,
            updatedAt: new Date().toISOString(),
          };
          activeList = [newConv, ...activeList];
          setConversations(activeList);
          setSelected(newConv);
          setMobileView('chat');
          return;
        }

        setConversations(activeList);
        if (activeList.length > 0) {
          setSelected(activeList[0]);
        }
      })
      .finally(() => setIsLoadingConversations(false));

    // Listen for incoming live WebSocket messages
    const unsubscribe = chatService.onMessage((msg: Message) => {
      const activeSelected = selectedRef.current;
      const partnerId = activeSelected?.participantId || activeSelected?.id;

      // If message belongs to active open chat, append immediately
      if (
        partnerId &&
        (msg.senderId === partnerId ||
          msg.receiverId === partnerId ||
          msg.conversationId === activeSelected?.id)
      ) {
        setMessages((prev) => {
          if (!prev.find((m) => m.id === msg.id)) {
            return [...prev, msg];
          }
          return prev;
        });

        // Mark as read in backend
        chatService.markAsRead(partnerId).catch(() => {});
      }

      // Update conversation list preview & unread count
      setConversations((prev) =>
        prev.map((c) => {
          const isThisConv =
            c.id === msg.conversationId ||
            c.participantId === msg.senderId ||
            c.participantId === msg.receiverId;

          if (isThisConv) {
            const isCurrentlyActive = partnerId === c.participantId;
            return {
              ...c,
              lastMessage: msg,
              unreadCount: isCurrentlyActive ? 0 : (c.unreadCount || 0) + 1,
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

  // 2. Fetch chat history when selected conversation changes
  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }

    const contactId = selected.participantId || selected.id;
    setIsLoadingMessages(true);

    chatService
      .getMessages(contactId)
      .then((data) => {
        const sorted = Array.isArray(data)
          ? [...data].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
          : [];
        setMessages(sorted);

        // Mark as read in backend
        chatService.markAsRead(contactId).catch(() => {});

        // Clear unread count locally for this conversation
        setConversations((prev) =>
          prev.map((c) => (c.id === selected.id ? { ...c, unreadCount: 0 } : c))
        );
      })
      .catch((err) => {
        console.error('Failed to get chat messages:', err);
        setMessages([]);
      })
      .finally(() => setIsLoadingMessages(false));
  }, [selected?.id]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelected(conv);
    setMobileView('chat');
  };

  // 3. Send message via ChatService
  const handleSendMessage = async (content: string) => {
    if (!selected) return;

    const participantId = selected.participantId || selected.id;
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      conversationId: selected.id,
      senderId: currentUserId,
      receiverId: participantId,
      content,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    // Optimistic UI append
    setMessages((prev) => [...prev, optimisticMsg]);

    // Update conversation list preview
    setConversations((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, lastMessage: optimisticMsg } : c))
    );

    try {
      const serverMsg = await chatService.sendMessage(participantId, content);
      if (serverMsg && serverMsg.id) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, ...serverMsg } : m))
        );
      }
    } catch (err: any) {
      console.warn('Chat send message issue:', err);
      toast.error('Message delivery note', err?.message || 'Could not verify delivery to server.');
    }
  };

  return (
    <FeatureGate page="messages" title="Messages & Chat">
      <div
        className={cn(
          'transition-all',
          mobileView === 'chat'
            ? 'fixed inset-0 z-[100] bg-[#FFFDFB] m-0 p-0 flex flex-col h-[100dvh] w-screen lg:relative lg:inset-auto lg:z-auto lg:h-auto lg:w-auto lg:space-y-6 lg:pb-6 lg:bg-transparent'
            : 'space-y-4 sm:space-y-6 pb-6'
        )}
      >
        {/* Global overrides for immersive mobile chat */}
        {mobileView === 'chat' && (
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @media (max-width: 1023px) {
              [aria-label="Mobile navigation"] { 
                display: none !important; 
              }
              header.sticky { 
                display: none !important; 
              }
              #main-content { 
                transform: none !important; 
                animation: none !important; 
                filter: none !important;
                perspective: none !important;
                contain: none !important;
                padding: 0 !important; 
                margin: 0 !important; 
              }
              div:has(> #main-content) {
                padding: 0 !important;
                margin: 0 !important;
                gap: 0 !important;
                max-width: 100% !important;
              }
            }
          `,
            }}
          />
        )}

        {/* Top Section Header */}
        <div
          className={cn(
            'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between animate-content-appear stagger-1',
            mobileView === 'chat' && 'hidden lg:flex'
          )}
        >
          <div>
            <SectionHeader
              eyebrow="Connections & Chat"
              title="Messages"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Link href="/app/discover">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-xl text-xs font-bold gap-1.5 border-[#E9DDE0]"
                leftIcon={<IconCompass className="h-3.5 w-3.5 text-[#7A1835]" />}
              >
                <span>Discover Profiles</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* TWO-COLUMN DESKTOP / FULL-SCREEN MOBILE CONTAINER */}
        <div
          className={cn(
            'relative bg-[#FFFDFB] overflow-hidden flex transition-all',
            mobileView === 'chat'
              ? 'h-full w-full rounded-none border-0 shadow-none lg:rounded-3xl lg:border lg:border-[#E9DDE0] lg:h-[calc(100vh-185px)] lg:min-h-[620px] lg:max-h-[820px] lg:shadow-xs'
              : 'border border-[#E9DDE0] rounded-2xl sm:rounded-3xl shadow-xs h-[calc(100dvh-135px)] md:h-[calc(100vh-185px)] min-h-[460px] md:min-h-[620px] max-h-[820px] animate-content-appear stagger-2'
          )}
        >
          {/* COLUMN 1: LEFT CONVERSATION LIST */}
          <aside
            className={cn(
              'w-full lg:w-[320px] xl:w-[350px] shrink-0 border-r border-[#E9DDE0] bg-[#FFFDFB] flex flex-col transition-all',
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
              mobileView === 'list' ? 'hidden lg:flex' : 'flex'
            )}
          >
            {selected ? (
              <ChatWindow
                conversation={selected}
                messages={messages}
                isLoadingMessages={isLoadingMessages}
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
                  When you connect with mutual matches, you can start meaningful, private
                  conversations with verified members right here.
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
              onClose={() => setIsMobileProfileOpen(false)}
            />
          </BottomSheet>
        )}
      </div>
    </FeatureGate>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4 p-4 animate-pulse">
          <div className="h-10 w-48 bg-stone-200 rounded-xl" />
          <div className="h-[500px] w-full bg-stone-200 rounded-3xl" />
        </div>
      }
    >
      <MessagesPageContent />
    </Suspense>
  );
}

