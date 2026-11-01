'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
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
import { profileService } from '@/services/profile.service';
import { authService } from '@/services/auth.service';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import { FeatureGate } from '@/components/ui/under-development';
import { useSubscription } from '@/context/subscription-context';

function MessagesContent() {
  const searchParams = useSearchParams();
  const targetUserId = searchParams.get('user') || searchParams.get('userId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('me');

  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const { isSubscribed } = useSubscription();

  // Mobile View Management: 'list' (shows conversations list) vs 'chat' (full-screen active chat)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);

  // Synchronize mobile view with browser history so swiping back lands on the chat list instead of exiting
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    if (targetUserId) {
      // If directly navigated with a target user on mobile, ensure /app/messages (the list)
      // is the immediate previous history entry before the active chat view.
      if (window.history.state?.view !== 'chat') {
        window.history.replaceState({ view: 'list' }, '', '/app/messages');
        window.history.pushState(
          { view: 'chat', user: targetUserId },
          '',
          `/app/messages?user=${targetUserId}`
        );
      }
      setMobileView('chat');
    } else {
      if (!window.history.state?.view) {
        window.history.replaceState({ view: 'list' }, '', window.location.href);
      }
    }
  }, [targetUserId]);

  // Handle browser/OS popstate (swipe back gesture, hardware back button, browser back)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (typeof window === 'undefined') return;
      const isMobile = window.innerWidth < 768;
      if (!isMobile) return;

      const params = new URLSearchParams(window.location.search);
      const hasUser = params.has('user') || params.has('userId');

      if (e.state?.view === 'list' || (!hasUser && e.state?.view !== 'chat')) {
        setIsMobileProfileOpen(false);
        setMobileView('list');
      } else if (e.state?.view === 'chat' || hasUser) {
        setMobileView('chat');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Back handler for mobile chat header button and touch gestures
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      if (window.history.state?.view === 'chat') {
        window.history.back();
      } else {
        setMobileView('list');
        const url = new URL(window.location.href);
        url.searchParams.delete('user');
        url.searchParams.delete('userId');
        window.history.replaceState({ view: 'list' }, '', url.pathname);
      }
    } else {
      setMobileView('list');
    }
  };

  // In-app horizontal swipe-back gesture detector for mobile chat view
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (mobileView !== 'chat') return;
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      touchStartRef.current = null;
      return;
    }
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (mobileView !== 'chat' || !touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    const startX = touchStartRef.current.x;
    touchStartRef.current = null;

    // Detect deliberate rightward swipe starting from the left side of the screen:
    if (
      startX < window.innerWidth * 0.5 &&
      deltaX > 65 &&
      deltaX > Math.abs(deltaY) * 1.5 &&
      (deltaTime < 600 || deltaX > 110)
    ) {
      handleBack();
    }
  };

  const handleTouchCancel = () => {
    touchStartRef.current = null;
  };

  const selectedRef = useRef<Conversation | null>(null);
  selectedRef.current = selected;

  const mobileViewRef = useRef<'list' | 'chat'>('list');
  mobileViewRef.current = mobileView;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      const isChatVisible = !isMobile || mobileView === 'chat';
      if (isChatVisible && selected) {
        const ids = [
          selected.id,
          selected.participantId,
          selected.participant?.id,
          selected.participant?.userId,
        ].filter(Boolean) as string[];
        (window as any).__ACTIVE_CHAT_CONTACT_IDS__ = ids;
        (window as any).__ACTIVE_CHAT_CONTACT_ID__ = selected.participantId || selected.id;
      } else {
        (window as any).__ACTIVE_CHAT_CONTACT_IDS__ = [];
        (window as any).__ACTIVE_CHAT_CONTACT_ID__ = null;
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        (window as any).__ACTIVE_CHAT_CONTACT_IDS__ = [];
        (window as any).__ACTIVE_CHAT_CONTACT_ID__ = null;
      }
    };
  }, [selected, mobileView]);

  const isFocusedRef = useRef<boolean>(true);

  // Mark a conversation as read and synchronize unread counters
  const markConversationAsRead = (contactId: string) => {
    if (!contactId) return;

    chatService.markAsRead(contactId).catch(() => { });

    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === contactId || c.participantId === contactId
          ? { ...c, unreadCount: 0 }
          : c
      );
      const totalUnread = updated.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      if (typeof window !== 'undefined') {
        queueMicrotask(() => {
          window.dispatchEvent(
            new CustomEvent('chat:unread-changed', { detail: { totalUnread } })
          );
        });
      }
      return updated;
    });
  };

  // Check if currently active chat should be marked as read upon window focus or interaction
  const checkAndMarkActiveChat = () => {
    const active = selectedRef.current;
    if (!active) return;
    const contactId = active.participantId || active.id;
    if (!contactId) return;

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const isChatVisible = !isMobile || mobileViewRef.current === 'chat';
    const hasFocus =
      typeof document !== 'undefined' &&
      document.visibilityState === 'visible' &&
      document.hasFocus();

    if (isChatVisible && hasFocus && (active.unreadCount || 0) > 0) {
      markConversationAsRead(contactId);
    }
  };

  // Track window focus/blur so background windows do not consume read receipts
  useEffect(() => {
    const handleFocus = () => {
      isFocusedRef.current = true;
      checkAndMarkActiveChat();
    };
    const handleBlur = () => {
      isFocusedRef.current = false;
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  // 1. Fetch current logged in user & initialize chat websocket
  useEffect(() => {
    authService
      .getCurrentUser()
      .then((user) => {
        if (user?.id) {
          setCurrentUserId(user.id);
        }
      })
      .catch(() => { });

    setIsLoadingConversations(true);

    // Connect to backend WebSocket gateway
    chatService.connect();

    // Fetch live conversations (mutual matches from backend)
    chatService
      .getConversations()
      .then(async (data) => {
        const list = Array.isArray(data) ? [...data] : [];
        setConversations(list);

        const initialTotalUnread = list.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        if (typeof window !== 'undefined') {
          queueMicrotask(() => {
            window.dispatchEvent(
              new CustomEvent('chat:unread-changed', { detail: { totalUnread: initialTotalUnread } })
            );
          });
        }

        if (targetUserId) {
          // Check if target user is already in conversations list
          const existing = list.find(
            (c) =>
              c.participantId === targetUserId ||
              c.id === targetUserId ||
              c.participant?.userId === targetUserId ||
              c.participant?.id === targetUserId ||
              c.participant?.profileId === targetUserId
          );

          if (existing) {
            setSelected(existing);
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
            if (isMobile) {
              setMobileView('chat');
            }
            if (typeof document !== 'undefined' && document.hasFocus() && document.visibilityState === 'visible') {
              markConversationAsRead(targetUserId);
            }
          } else {
            // Target user not in list yet; load profile to initiate new chat
            try {
              const prof = await profileService.getProfile(targetUserId);
              const pUser = (prof as any)?.user;
              const participantId = pUser?.id || prof?.userId || prof?.id || targetUserId;

              // Check if conversation already exists under resolved participantId
              const existingResolved = list.find(
                (c) =>
                  c.participantId === participantId ||
                  c.id === participantId ||
                  c.participant?.userId === participantId ||
                  c.participant?.id === participantId ||
                  (prof?.profileId && c.participant?.profileId === prof.profileId)
              );

              if (existingResolved) {
                setSelected(existingResolved);
                const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                if (isMobile) {
                  setMobileView('chat');
                }
                if (typeof document !== 'undefined' && document.hasFocus() && document.visibilityState === 'visible') {
                  markConversationAsRead(participantId);
                }
                return;
              }

              const fullName =
                prof?.name ||
                `${prof?.firstName || pUser?.firstName || ''} ${prof?.lastName || pUser?.lastName || ''}`.trim() ||
                'Member';

              const photos = prof?.photos || (pUser?.photos ? pUser.photos : []);
              const avatarUrl = photos?.[0]?.url || (prof as any)?.image;
              const formattedPhotos = photos.length
                ? photos
                : avatarUrl
                  ? [{ id: 'p1', url: avatarUrl }]
                  : [];

              const provisionalConv: Conversation = {
                id: participantId,
                participantId,
                participant: {
                  id: participantId,
                  userId: participantId,
                  profileId: prof?.profileId || pUser?.profileId,
                  name: fullName,
                  firstName: prof?.firstName || pUser?.firstName || fullName.split(' ')[0],
                  lastName: prof?.lastName || pUser?.lastName || '',
                  city: prof?.city || '',
                  country: prof?.country || prof?.state || '',
                  occupation: prof?.occupation || prof?.profession || '',
                  education: prof?.education || '',
                  bio: prof?.bio || '',
                  isVerified: Boolean(prof?.isVerified ?? true),
                  photos: formattedPhotos,
                },
                unreadCount: 0,
                updatedAt: new Date().toISOString(),
                online: Boolean((prof as any).isOnline),
                isOnline: Boolean((prof as any).isOnline),
                lastActiveAt: (prof as any).lastActiveAt,
                isProvisional: true,
              } as any;

              setConversations([provisionalConv, ...list.filter((c) => c.participantId !== participantId)]);
              setSelected(provisionalConv);
              const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
              if (isMobile) {
                setMobileView('chat');
              }
            } catch (err) {
              console.warn('Could not fetch target profile, creating provisional conversation:', err);
              const fallbackConv: Conversation = {
                id: targetUserId,
                participantId: targetUserId,
                participant: {
                  id: targetUserId,
                  userId: targetUserId,
                  name: 'Member',
                  firstName: 'Member',
                  lastName: '',
                  photos: [],
                  isVerified: true,
                },
                unreadCount: 0,
                updatedAt: new Date().toISOString(),
                isProvisional: true,
              };
              setConversations([fallbackConv, ...list.filter((c) => c.participantId !== targetUserId)]);
              setSelected(fallbackConv);
              const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
              if (isMobile) {
                setMobileView('chat');
              }
            }
          }
        } else {
          // No target user query param; on desktop default-select first conversation
          if (list.length > 0) {
            setSelected(list[0]);
          } else {
            setSelected(null);
          }
        }
      })
      .catch((err) => {
        console.error('ChatService getConversations error:', err);
        setConversations([]);
        setSelected(null);
      })
      .finally(() => setIsLoadingConversations(false));

    // Listen for incoming live WebSocket messages
    const unsubscribe = chatService.onMessage((msg: Message) => {
      const activeSelected = selectedRef.current;
      const partnerId = activeSelected?.participantId || activeSelected?.id;

      const isForActiveConversation =
        Boolean(partnerId) &&
        (msg.senderId === partnerId ||
          msg.receiverId === partnerId ||
          msg.conversationId === activeSelected?.id);

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const isChatVisible = !isMobile || mobileViewRef.current === 'chat';
      const isFocused =
        typeof document !== 'undefined' &&
        document.visibilityState === 'visible' &&
        document.hasFocus();

      const isActivelyViewed = isForActiveConversation && isChatVisible && isFocused;

      // If message belongs to active open chat, append immediately
      if (isForActiveConversation) {
        setMessages((prev) => {
          if (!prev.find((m) => m.id === msg.id)) {
            return [...prev, msg];
          }
          return prev;
        });

        if (isActivelyViewed && partnerId) {
          chatService.markAsRead(partnerId).catch(() => { });
        }
      }

      // Update conversation list preview & unread count
      setConversations((prev) => {
        const updated = prev.map((c) => {
          const isThisConv =
            c.id === msg.conversationId ||
            c.participantId === msg.senderId ||
            c.participantId === msg.receiverId;

          if (isThisConv) {
            return {
              ...c,
              lastMessage: msg,
              unreadCount: isActivelyViewed ? 0 : (c.unreadCount || 0) + 1,
            };
          }
          return c;
        });

        const totalUnread = updated.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
        if (typeof window !== 'undefined') {
          queueMicrotask(() => {
            window.dispatchEvent(
              new CustomEvent('chat:unread-changed', { detail: { totalUnread } })
            );
          });
        }
        return updated;
      });
    });

    return () => {
      unsubscribe();
      chatService.disconnect();
    };
  }, [targetUserId]);

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
      })
      .catch((err) => {
        console.error('Failed to get chat messages:', err);
        setMessages([]);
      })
      .finally(() => setIsLoadingMessages(false));
  }, [selected?.id, selected?.participantId]);

  const handleSelectConversation = (conv: Conversation) => {
    setSelected(conv);
    setMobileView('chat');
    const contactId = conv.participantId || conv.id;
    markConversationAsRead(contactId);

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      const chatUrl = `/app/messages?user=${contactId}`;
      window.history.pushState({ view: 'chat', user: contactId }, '', chatUrl);
    }
  };

  // 3. Send message via ChatService
  const handleSendMessage = async (content: string) => {
    if (!selected) return;

    const participantId = selected.participantId || selected.id;
    markConversationAsRead(participantId);
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
      prev.map((c) =>
        c.id === selected.id || c.participantId === participantId
          ? { ...c, lastMessage: optimisticMsg }
          : c
      )
    );

    const previousLastMessage = selected.lastMessage;

    try {
      const serverMsg = await chatService.sendMessage(participantId, content);
      if (serverMsg && serverMsg.id) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, ...serverMsg } : m))
        );
      }
    } catch (err: any) {
      console.warn('Chat send message issue:', err);
      // Immediately remove failed optimistic message from chat history
      setMessages((prev) => prev.filter((m) => m.id !== tempId));

      // Revert conversation list preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selected.id || c.participantId === participantId
            ? { ...c, lastMessage: previousLastMessage }
            : c
        )
      );

      const errorMsg =
        err?.message && err.message !== 'Failed to send message' && !err.message.includes('object Object')
          ? err.message
          : 'You can only message profiles you have mutually connected with.';
      toast.error('Message delivery note', errorMsg);
    }
  };

  return (
    <div
      className={cn(
        'transition-all',
        mobileView === 'chat'
          ? 'fixed inset-0 z-[100] bg-[#FFFDFB] m-0 p-0 flex flex-col h-[100dvh] w-screen md:relative md:inset-auto md:z-auto md:h-auto md:w-auto md:space-y-6 md:pb-6 md:bg-transparent'
          : 'space-y-4 sm:space-y-6 pb-6'
      )}
    >
      {/* Global overrides for immersive mobile chat */}
      {mobileView === 'chat' && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media (max-width: 767px) {
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
          mobileView === 'chat' && 'hidden md:flex'
        )}
      >
        <div>
          <SectionHeader
            eyebrow="Connections & Chat"
            title="Messages"
          />
        </div>
      </div>

      {/* TWO-COLUMN DESKTOP / FULL-SCREEN MOBILE CONTAINER */}
      <div
        className={cn(
          'relative bg-[#FFFDFB] overflow-hidden flex transition-all',
          mobileView === 'chat'
            ? 'h-full w-full rounded-none border-0 shadow-none md:rounded-3xl md:border md:border-[#E9DDE0] md:h-[calc(100vh-185px)] md:min-h-[620px] md:max-h-[820px] md:shadow-xs'
            : 'border border-[#E9DDE0] rounded-2xl sm:rounded-3xl shadow-xs h-[calc(100dvh-135px)] md:h-[calc(100vh-185px)] min-h-[460px] md:min-h-[620px] max-h-[820px] animate-content-appear stagger-2'
        )}
      >
        {/* COLUMN 1: LEFT CONVERSATION LIST */}
        <aside
          className={cn(
            'w-full md:w-[300px] lg:w-[320px] xl:w-[350px] shrink-0 border-r border-[#E9DDE0] bg-[#FFFDFB] flex flex-col transition-all',
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
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
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
          className={cn(
            'flex-1 flex flex-col min-w-0 bg-[#FFFDFB] relative',
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          )}
        >
          {selected ? (
            <ChatWindow
              key={`${selected.participantId || selected.id}-${mobileView}`}
              conversation={selected}
              messages={messages}
              isLoadingMessages={isLoadingMessages}
              isSubscribed={isSubscribed}
              onSendMessage={handleSendMessage}
              onBack={handleBack}
              onOpenProfile={() => setIsMobileProfileOpen(true)}
              onMarkRead={() => markConversationAsRead(selected.participantId || selected.id)}
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
  );
}

export default function MessagesPage() {
  return (
    <FeatureGate page="messages" title="Messages & Chat">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-12 w-1/3 bg-[var(--surface-muted)] rounded-2xl skeleton-shimmer" />
            <div className="h-[600px] w-full bg-[var(--surface-muted)] rounded-3xl skeleton-shimmer" />
          </div>
        }
      >
        <MessagesContent />
      </Suspense>
    </FeatureGate>
  );
}
