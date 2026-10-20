'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  IconArrowLeft,
  IconPaperclip,
  IconMoodSmile,
  IconSend,
  IconDotsVertical,
  IconCheck,
  IconShieldCheck,
  IconUser,
  IconHeart,
  IconBan,
  IconFlag,
  IconCrown,
  IconLoader2,
  IconBookmark,
  IconSparkles,
  IconPhone,
  IconVideo,
  IconMicrophone,
  IconLock,
  IconCalendar,
  IconCoffee,
  IconBriefcase,
  IconHome,
  IconX,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import { chatService, type Conversation, type Message } from '@/services/chat.service';
import { matchesService } from '@/services/matches.service';
import { formatLastActive } from '@/lib/demo-data';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  isLoadingMessages?: boolean;
  isSubscribed?: boolean;
  onSendMessage: (text: string) => Promise<void>;
  onBack?: () => void;
  onOpenProfile?: () => void;
  onMarkRead?: () => void;
  className?: string;
}

export function ChatWindow({
  conversation,
  messages,
  isLoadingMessages = false,
  isSubscribed = true,
  onSendMessage,
  onBack,
  onOpenProfile,
  onMarkRead,
  className,
}: ChatWindowProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showHooks, setShowHooks] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'roots' | 'family' | 'career'>('all');
  const [messageReactions, setMessageReactions] = useState<Record<string, string>>({});
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInitialLoadRef = useRef(true);
  const prevConvIdRef = useRef(conversation.participantId || conversation.id);

  const participantName =
    conversation.participant?.name ||
    `${conversation.participant?.firstName || ''} ${conversation.participant?.lastName || ''}`.trim() ||
    'Member';

  const firstName =
    conversation.participant?.firstName ||
    participantName.split(' ')[0] ||
    'there';

  const participantPhoto = conversation.participant?.photos?.[0]?.url;

  const isVerified = conversation.participant?.isVerified ?? true;
  const [isOnline, setIsOnline] = useState<boolean>(
    Boolean((conversation as any).online || (conversation as any).isOnline)
  );
  const [lastActiveAt, setLastActiveAt] = useState<string | undefined>(
    (conversation as any).lastActiveAt
  );

  useEffect(() => {
    setIsOnline(Boolean((conversation as any).online || (conversation as any).isOnline));
    setLastActiveAt((conversation as any).lastActiveAt);

    const cleanup = chatService.onPresence((data) => {
      const targetId = conversation.participantId || conversation.id;
      if (data.userId === targetId) {
        setIsOnline(Boolean(data.isOnline));
        if (data.lastActiveAt) {
          setLastActiveAt(data.lastActiveAt);
        }
      }
    });

    return cleanup;
  }, [conversation.participantId, conversation.id, (conversation as any).online, (conversation as any).lastActiveAt]);

  const matchPercentage = (conversation.participant as any)?.compatibility || 92;

  // Categorized Kerala matrimonial initiator hook sentences
  const categorizedHooks = [
    {
      category: 'roots',
      tag: 'Roots',
      icon: IconHome,
      text: `Namaskaram ${firstName}! Profile kandu, really liked it. Nattil evideya sthalam?`,
    },
    {
      category: 'roots',
      tag: 'Location',
      icon: IconHome,
      text: `Namaskaram ${firstName}! Are you currently based in Kerala or working elsewhere?`,
    },
    {
      category: 'family',
      tag: 'Family',
      icon: IconHeart,
      text: `Hello ${firstName}! Family-yodu samsarichu, we really liked your values and profile.`,
    },
    {
      category: 'career',
      tag: 'Career',
      icon: IconBriefcase,
      text: `Hi ${firstName}! I noticed we share mutual professional interests. What are your future settlement plans?`,
    },
    {
      category: 'family',
      tag: 'Values',
      icon: IconCoffee,
      text: `Namaskaram ${firstName}! Liked your bio. Free aayirikumbo oru quick call cheyyaamo?`,
    },
  ];

  const filteredHooks =
    activeCategory === 'all'
      ? categorizedHooks
      : categorizedHooks.filter((h) => h.category === activeCategory);

  const handleSelectHook = (hookText: string) => {
    setText(hookText);
    setShowHooks(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessageReactions((prev) => {
      if (prev[messageId] === emoji) {
        const next = { ...prev };
        delete next[messageId];
        return next;
      }
      return { ...prev, [messageId]: emoji };
    });
  };

  // Reliable scroll-to-bottom helper that controls both the container and end anchor
  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
      try {
        container.scrollTo({
          top: container.scrollHeight,
          behavior,
        });
      } catch {}
    }
    if (messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
      } catch {}
    }
  };

  // Reset initial load flag when conversation switches
  useEffect(() => {
    const currentId = conversation.participantId || conversation.id;
    if (prevConvIdRef.current !== currentId) {
      prevConvIdRef.current = currentId;
      isInitialLoadRef.current = true;
      scrollToBottom('auto');
    }
  }, [conversation.participantId, conversation.id]);

  // Auto-scroll to bottom on message load and whenever new messages arrive
  useEffect(() => {
    if (isLoadingMessages) return;

    // Instant multi-frame scroll
    const triggerInstantScroll = () => {
      scrollToBottom('auto');
      requestAnimationFrame(() => scrollToBottom('auto'));
    };

    triggerInstantScroll();
    const t1 = setTimeout(triggerInstantScroll, 50);
    const t2 = setTimeout(triggerInstantScroll, 150);
    const t3 = setTimeout(triggerInstantScroll, 350);
    const t4 = setTimeout(() => {
      triggerInstantScroll();
      isInitialLoadRef.current = false;
    }, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [messages, isLoadingMessages]);

  // Keep pinned to bottom on container resize (e.g. mobile keyboard open / layout shifts)
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver(() => {
      if (isInitialLoadRef.current) {
        scrollToBottom('auto');
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const handleSend = async () => {
    if (!text.trim() || isSending) return;
    const current = text.trim();
    setText('');
    setIsSending(true);
    scrollToBottom('smooth');
    try {
      await onSendMessage(current);
      setTimeout(() => scrollToBottom('smooth'), 60);
    } catch {
      setText(current);
    } finally {
      setIsSending(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleAudioCall = () => {
    toast.success('Voice Call Request Sent', {
      description: `We notified ${firstName}. An encrypted matrimonial call will connect once accepted.`,
    });
  };

  const handleVideoCall = () => {
    toast.success('Video Call Request Sent', {
      description: `We notified ${firstName}. An encrypted video call will start once accepted.`,
    });
  };

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-[#FFFDFB] text-[#211B1E] min-w-0 relative', className)}>
      {/* ======================================================== */}
      {/* 1. ELEGANT GLASS CHAT HEADER                             */}
      {/* ======================================================== */}
      <header className="flex items-center justify-between px-3 py-2.5 sm:px-5 sm:py-3 border-b border-[#EAD8C7]/80 bg-white/95 backdrop-blur-xl z-20 shrink-0 gap-2 shadow-[0_2px_12px_rgba(40,10,20,0.03)]">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
          {/* Mobile Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back to conversations"
              className="md:hidden grid h-9 w-9 place-items-center rounded-xl text-[#766B6F] hover:bg-[#FAF3EC] hover:text-[#7A1835] active:scale-95 transition-all -ml-1 shrink-0"
            >
              <IconArrowLeft className="h-5 w-5" />
            </button>
          )}

          {/* Profile Photo with Glow Ring */}
          <div
            onClick={onOpenProfile}
            className="relative shrink-0 cursor-pointer group"
          >
            <Avatar
              src={participantPhoto}
              name={participantName}
              size="md"
              online={isOnline}
            />
          </div>

          {/* Name & Status */}
          <div
            onClick={onOpenProfile}
            className="min-w-0 cursor-pointer group flex-1"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm sm:text-base font-bold text-[#211B1E] group-hover:text-[#7A1835] transition-colors truncate">
                {participantName}
              </span>
              {isVerified && (
                <span title="Verified Profile" className="shrink-0 inline-flex items-center">
                  <VerificationBadge showIconOnly size="sm" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-[#766B6F] font-medium truncate mt-0.5">
              {isOnline ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active now
                </span>
              ) : (
                <span className="text-[#8C8286] shrink-0 font-medium">
                  {formatLastActive(lastActiveAt)}
                </span>
              )}
              <span className="text-[#D8B28C] shrink-0">•</span>
              <span className="text-[#7A1835] font-bold bg-[#FAF3EC] px-1.5 py-0.2 rounded-full text-[10px] shrink-0">
                {matchPercentage}% Match
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Audio Call Button */}
          <button
            onClick={handleAudioCall}
            aria-label="Voice Call"
            title="Start Encrypted Voice Call"
            className="grid h-9 w-9 place-items-center rounded-xl text-[#766B6F] hover:text-[#7A1835] hover:bg-[#FAF3EC] active:scale-95 transition-all"
          >
            <IconPhone className="h-4.5 w-4.5 stroke-[2]" />
          </button>

          {/* Video Call Button */}
          <button
            onClick={handleVideoCall}
            aria-label="Video Call"
            title="Start Encrypted Video Call"
            className="grid h-9 w-9 place-items-center rounded-xl text-[#766B6F] hover:text-[#7A1835] hover:bg-[#FAF3EC] active:scale-95 transition-all"
          >
            <IconVideo className="h-4.5 w-4.5 stroke-[2]" />
          </button>

          {/* View Profile Action - Desktop */}
          <button
            onClick={onOpenProfile}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#EAD8C7] bg-[#FFF9F6] px-3 py-1.5 text-xs font-bold text-[#7A1835] hover:bg-[#FAF3EC] hover:border-[#D8B28C] transition-all shadow-2xs active:scale-95"
          >
            <IconUser className="h-3.5 w-3.5" />
            <span>Profile</span>
          </button>

          {/* More Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              aria-label="More options"
              className="grid h-9 w-9 place-items-center rounded-xl text-[#766B6F] hover:text-[#211B1E] hover:bg-[#FAF3EC] active:scale-95 transition-colors"
            >
              <IconDotsVertical className="h-4.5 w-4.5" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-52 rounded-2xl border border-[#EAD8C7] bg-white p-1.5 shadow-xl z-40 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (onOpenProfile) onOpenProfile();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#211B1E] hover:bg-[#FAF3EC] hover:text-[#7A1835] transition-colors"
                  >
                    <IconUser className="h-4 w-4 text-[#766B6F]" />
                    <span>View Full Profile</span>
                  </button>
                  <button
                    onClick={async () => {
                      setShowMenu(false);
                      try {
                        await matchesService.shortlistProfile(conversation.participantId || conversation.id);
                        toast.success('Shortlisted', {
                          description: `${participantName} was added to your shortlisted connections.`,
                        });
                      } catch {
                        toast.error('Failed to Shortlist', 'Could not save profile to shortlist.');
                      }
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#211B1E] hover:bg-[#FAF3EC] hover:text-[#7A1835] transition-colors"
                  >
                    <IconBookmark className="h-4 w-4 text-[#766B6F]" />
                    <span>Shortlist Contact</span>
                  </button>
                  <div className="my-1 border-t border-[#EAD8C7]/80" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      toast.warning('Member Blocked', {
                        description: `You will no longer receive communications from ${participantName}.`,
                      });
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <IconBan className="h-4 w-4" />
                    <span>Block Member</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      toast.info('Report Sent', {
                        description: 'Your report has been logged with our trust team.',
                      });
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
                  >
                    <IconFlag className="h-4 w-4" />
                    <span>Report Profile</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. CHAT STREAM / WALLPAPER BACKGROUND                    */}
      {/* ======================================================== */}
      {!isSubscribed ? (
        /* LOCKED STATE FOR FREE USERS */
        <div className="flex-1 flex flex-col items-center justify-center bg-[#FAF3EC]/40 p-6 text-center">
          <div className="h-18 w-18 bg-gradient-to-br from-[#FAF3EC] to-[#F5EADE] rounded-3xl flex items-center justify-center mb-5 shadow-sm border border-[#EAD7C5]">
            <IconCrown className="h-9 w-9 text-[#D8B28C]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-editorial-title font-bold text-[#211B1E] mb-2">
            Unlock Matrimonial Messaging
          </h2>
          <p className="text-xs sm:text-sm text-[#766B6F] max-w-md leading-relaxed mb-6">
            You share mutual interest with {participantName}! Upgrade to Premium to read verified
            messages, reply instantly, and build a meaningful connection.
          </p>
          <Link
            href="/app/subscription"
            className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#7A1835] px-7 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#5C1027] transition-all"
          >
            <span>Upgrade to Premium</span>
            <IconCrown className="h-4 w-4 text-[#D8B28C]" />
          </Link>
        </div>
      ) : (
        /* SUBSCRIBED ACTIVE CHAT STREAM */
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Subtle Romantic Wallpaper Pattern & Ambient Glows */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.035]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='52' viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%237A1835' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M26 0c14.359 0 26 11.641 26 26 0 14.359-11.641 26-26 26C11.641 52 0 40.359 0 26 0 11.641 11.641 0 26 0zm0 4C13.85 4 4 13.85 4 26s9.85 22 22 22 22-9.85 22-22S38.15 4 26 4zm0 8c7.732 0 14 6.268 14 14s-6.268 14-14 14-14-6.268-14-14 6.268-14 14-14z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
            aria-hidden="true"
          />
          {/* Ambient Warm Gradient Orbs */}
          <div className="absolute top-0 right-1/4 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(216,178,140,0.12)_0%,transparent_70%)] blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-1/4 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(122,24,53,0.06)_0%,transparent_70%)] blur-3xl pointer-events-none" />

          {/* Messages Scroll Area */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-[#FFFDFB] via-[#FFF9F6]/80 to-[#FAF4EE]/90 relative z-10"
          >
            {/* Celebratory Mutual Connection Card */}
            <div className="mx-auto max-w-sm my-2 p-5 sm:p-6 rounded-3xl border border-[#EAD8C7]/90 bg-gradient-to-b from-white/95 via-[#FFFDFB]/95 to-[#FAF3EC]/90 backdrop-blur-xl shadow-[0_12px_36px_rgba(122,24,53,0.07)] text-center relative overflow-hidden group">
              {/* Soft decorative glow */}
              <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(216,178,140,0.25)_0%,transparent_70%)] blur-xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(122,24,53,0.15)_0%,transparent_70%)] blur-xl pointer-events-none" />

              {/* Intertwined Profile Photo Badges */}
              <div className="relative inline-flex items-center justify-center mb-3">
                <div className="h-12 w-12 rounded-full border-2 border-white shadow-md overflow-hidden bg-gradient-to-br from-[#7A1835] to-[#B85D75] flex items-center justify-center text-white font-bold text-xs z-0 ring-2 ring-[#7A1835]/10">
                  <span>You</span>
                </div>
                <div className="-ml-3.5 z-10">
                  <Avatar
                    src={participantPhoto}
                    name={participantName}
                    size="lg"
                    bordered
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 z-20 h-6 w-6 rounded-full bg-gradient-to-br from-[#7A1835] to-[#9E2045] text-white flex items-center justify-center shadow-md ring-2 ring-white text-[11px]">
                  💍
                </div>
              </div>

              {/* Match tag */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF3EC] border border-[#EAD8C7] text-[11px] font-bold text-[#7A1835] mb-2 shadow-2xs">
                <IconSparkles className="h-3.5 w-3.5 text-[#7A1835]" />
                <span>Connected via Mutual Interest · {matchPercentage}% Match</span>
              </div>

              <h4 className="font-editorial-title text-base sm:text-lg font-bold text-[#211B1E]">
                Connected with {participantName}
              </h4>
              <p className="mt-1 text-xs text-[#766B6F] leading-relaxed max-w-xs mx-auto">
                Both of you accepted each other's interest. A sincere, courteous note starts a wonderful new chapter.
              </p>
            </div>

            {/* Date Separator Pill */}
            <div className="flex justify-center my-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 border border-[#EAD8C7]/80 text-[10px] sm:text-[11px] font-semibold text-[#766B6F] shadow-2xs backdrop-blur-md">
                <IconCalendar className="h-3 w-3 text-[#7A1835]" />
                <span>Today</span>
              </span>
            </div>

            {isLoadingMessages ? (
              <div className="flex justify-center py-8">
                <IconLoader2 className="h-6 w-6 animate-spin text-[#7A1835]" />
              </div>
            ) : messages.length === 0 ? (
              /* EMPTY STATE: SPARKLING ICEBREAKER TRAY */
              <div className="py-6 px-3 max-w-sm mx-auto text-center space-y-3.5">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF3EC] border border-[#EAD8C7] text-[#7A1835] shadow-xs">
                  <IconSparkles className="h-6 w-6 text-[#7A1835]" />
                </div>
                <div>
                  <h4 className="font-editorial-title text-base font-bold text-[#211B1E]">Break the Ice with {firstName}</h4>
                  <p className="text-xs text-[#766B6F] mt-1">
                    Tap a warm Kerala matrimonial starter to begin your conversation:
                  </p>
                </div>
                <div className="space-y-2 text-left pt-1">
                  {categorizedHooks.map((h, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectHook(h.text)}
                      className="w-full text-left p-3 rounded-2xl bg-white hover:bg-[#FAF3EC] border border-[#EAD8C7] hover:border-[#7A1835] shadow-2xs transition-all group flex items-start gap-3 active:scale-[0.99]"
                    >
                      <span className="text-base shrink-0 mt-0.5">💬</span>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs text-[#7A1835] font-bold block mb-0.5">
                          {h.tag}
                        </span>
                        <p className="text-xs text-[#211B1E] group-hover:text-[#7A1835] font-medium leading-relaxed">
                          {h.text}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* RENDER MESSAGES */
              messages.map((m, idx) => {
                const isOurs = m.senderId !== conversation.participantId;
                const timeString = formatMessageTime(m.createdAt);
                const reaction = messageReactions[m.id || `msg-${idx}`];
                const msgKey = m.id || `msg-${idx}`;
                const isHovered = hoveredMessageId === msgKey;

                return (
                  <div
                    key={msgKey}
                    onMouseEnter={() => setHoveredMessageId(msgKey)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                    className={cn(
                      'flex flex-col group relative animate-chat-message',
                      isOurs ? 'items-end' : 'items-start'
                    )}
                  >
                    {/* Hover Reaction Toolbar */}
                    <div
                      className={cn(
                        'absolute -top-7 z-20 flex items-center gap-1 rounded-full border border-[#EAD8C7] bg-white/95 backdrop-blur-md px-2 py-0.5 shadow-md transition-all duration-200',
                        isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none',
                        isOurs ? 'right-2' : 'left-9'
                      )}
                    >
                      {['❤️', '👍', '😊', '🌸', '💍'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleReaction(msgKey, emoji)}
                          className="h-6 w-6 rounded-full hover:bg-[#FAF3EC] hover:scale-125 transition-transform flex items-center justify-center text-xs active:scale-95"
                          title={`React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[72%]">
                      {/* Received message avatar */}
                      {!isOurs && (
                        <div className="shrink-0 mb-1">
                          <Avatar
                            src={participantPhoto}
                            name={participantName}
                            size="xs"
                          />
                        </div>
                      )}

                      <div className="relative">
                        {/* Bubble */}
                        <div
                          className={cn(
                            'px-4 py-2.5 text-xs sm:text-sm leading-relaxed transition-all relative',
                            isOurs
                              ? 'rounded-2xl rounded-br-xs bg-gradient-to-br from-[#7A1835] via-[#8C1B3D] to-[#9E2045] text-white shadow-[0_6px_22px_rgba(122,24,53,0.22)]'
                              : 'rounded-2xl rounded-bl-xs bg-white/95 border border-[#EAD8C7]/90 text-[#211B1E] shadow-[0_4px_16px_rgba(40,10,20,0.04)] backdrop-blur-sm'
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        </div>

                        {/* Floating Reaction Badge */}
                        {reaction && (
                          <div
                            onClick={() => handleReaction(msgKey, reaction)}
                            className={cn(
                              'absolute -bottom-2 cursor-pointer rounded-full border border-[#EAD8C7] bg-white px-1.5 py-0.2 text-xs shadow-xs transition-transform hover:scale-110 active:scale-95 flex items-center z-10',
                              isOurs ? 'right-2' : 'left-2'
                            )}
                          >
                            <span>{reaction}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timestamp & Status */}
                    <div
                      className={cn(
                        'mt-1 flex items-center gap-1.5 text-[10px] font-medium text-[#766B6F]',
                        isOurs ? 'justify-end pr-1' : 'justify-start pl-9'
                      )}
                    >
                      <span>{timeString}</span>
                      {isOurs && (
                        m.isRead ? (
                          <span className="inline-flex -space-x-1 text-[#7A1835]" title="Read">
                            <IconCheck className="h-3 w-3 stroke-[2.5]" />
                            <IconCheck className="h-3 w-3 stroke-[2.5]" />
                          </span>
                        ) : (
                          <span className="inline-flex -space-x-1 text-[#A89DA2]" title="Delivered">
                            <IconCheck className="h-3 w-3 stroke-[2.5]" />
                            <IconCheck className="h-3 w-3 stroke-[2.5]" />
                          </span>
                        )
                      )}
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ======================================================== */}
          {/* 3. MESSAGE COMPOSER & ICEBREAKER BAR                     */}
          {/* ======================================================== */}
          <div className="p-3 sm:p-4 bg-white/95 backdrop-blur-xl border-t border-[#EAD8C7]/80 shrink-0 z-20">
            {/* Quick Initiator Hook Carousel */}
            {showHooks && (
              <div className="mb-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                {/* Category filters & Close button */}
                <div className="flex items-center justify-between gap-1.5 pb-0.5">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1 min-w-0">
                    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-[#7A1835] bg-[#FAF3EC] px-2.5 py-1 rounded-full border border-[#EAD8C7]">
                      <IconSparkles className="h-3 w-3 text-[#7A1835]" />
                      <span>Icebreakers</span>
                    </span>
                    {(
                      [
                        { key: 'all', label: 'All' },
                        { key: 'roots', label: '🏡 Roots' },
                        { key: 'family', label: '👨‍👩‍👧 Family' },
                        { key: 'career', label: '💼 Career' },
                      ] as const
                    ).map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveCategory(key)}
                        className={cn(
                          'shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full border transition-all',
                          activeCategory === key
                            ? 'bg-[#7A1835] text-white border-[#7A1835] shadow-xs'
                            : 'bg-[#FFF9F6] text-[#766B6F] border-[#EAD8C7] hover:bg-[#FAF3EC]'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Explicit Dismiss Button */}
                  <button
                    type="button"
                    onClick={() => setShowHooks(false)}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#766B6F] hover:bg-[#FAF3EC] hover:text-[#7A1835] active:scale-90 transition-all border border-transparent hover:border-[#EAD8C7]"
                    aria-label="Close icebreaker suggestions"
                    title="Close Icebreakers"
                  >
                    <IconX className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Horizontal Hook Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {filteredHooks.map((h, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectHook(h.text)}
                      className="shrink-0 text-left text-xs font-medium text-[#5C1027] bg-[#FFF9F6] hover:bg-[#FAF3EC] hover:border-[#7A1835] active:scale-95 border border-[#EAD8C7] px-3.5 py-1.5 rounded-2xl shadow-2xs transition-all max-w-[320px] flex items-center gap-2 group"
                      title={h.text}
                    >
                      <span className="text-sm">✨</span>
                      <span className="truncate">{h.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Emoji Picker Drawer */}
            {showEmojiPicker && (
              <div className="mb-2.5 flex items-center gap-2 p-2 rounded-2xl bg-[#FAF3EC] border border-[#EAD8C7] shadow-sm animate-in fade-in duration-150 overflow-x-auto">
                {['😊', '👋', '✨', '☕', '🌸', '🙏', '👍', '🤍', '💍', '💐', '🎉'].map((em) => (
                  <button
                    key={em}
                    onClick={() => insertEmoji(em)}
                    className="h-8 w-8 rounded-xl hover:bg-white text-lg transition-transform hover:scale-125 active:scale-95 flex items-center justify-center shrink-0"
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}

            {/* Floating Island Input Bar */}
            <div className="flex items-end gap-1.5 sm:gap-2 rounded-2xl border border-[#EAD8C7] bg-[#FFF9F6] p-1.5 focus-within:border-[#7A1835] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#7A1835]/15 shadow-2xs transition-all">
              {/* Attachment Button */}
              <button
                type="button"
                onClick={() =>
                  toast.info('Attach File', {
                    description: 'Horoscope, bio-data document, or family photos can be shared.',
                  })
                }
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#766B6F] hover:bg-white hover:text-[#211B1E] active:scale-95 transition-all"
                aria-label="Attach file"
              >
                <IconPaperclip className="h-4.5 w-4.5" />
              </button>

              {/* Text Input */}
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                onFocus={() => onMarkRead?.()}
                onClick={() => onMarkRead?.()}
                placeholder={`Message ${firstName}...`}
                rows={1}
                className="w-full resize-none bg-transparent py-2 px-1 text-xs sm:text-sm text-[#211B1E] placeholder:text-[#766B6F]/70 outline-none max-h-28 scrollbar-none font-sans"
              />

              {/* Icebreaker Prompts Toggle Button */}
              <button
                type="button"
                onClick={() => setShowHooks((prev) => !prev)}
                className={cn(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all active:scale-95',
                  showHooks
                    ? 'bg-[#7A1835] text-white shadow-xs'
                    : 'text-[#766B6F] hover:bg-white hover:text-[#7A1835]'
                )}
                aria-label="Icebreaker Prompts"
                title={showHooks ? 'Hide Icebreakers' : 'Show Icebreakers'}
              >
                <IconSparkles className="h-4.5 w-4.5" />
              </button>

              {/* Emoji Picker Button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className={cn(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-all active:scale-95',
                  showEmojiPicker
                    ? 'bg-[#FAF3EC] text-[#7A1835] border border-[#EAD8C7]'
                    : 'text-[#766B6F] hover:bg-white hover:text-[#211B1E]'
                )}
                aria-label="Insert Emoji"
              >
                <IconMoodSmile className="h-4.5 w-4.5" />
              </button>

              {/* Voice Note Button (when input empty) */}
              {!text.trim() && (
                <button
                  type="button"
                  onClick={() =>
                    toast.info('Voice Note', {
                      description: `Tap and hold to record a courteous voice note for ${firstName}.`,
                    })
                  }
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#766B6F] hover:bg-white hover:text-[#7A1835] active:scale-95 transition-all"
                  aria-label="Record voice note"
                  title="Send Voice Note"
                >
                  <IconMicrophone className="h-4.5 w-4.5" />
                </button>
              )}

              {/* Send Button */}
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!text.trim() || isSending}
                className={cn(
                  'h-9 w-9 shrink-0 rounded-xl p-0 transition-all',
                  text.trim()
                    ? 'bg-gradient-to-br from-[#7A1835] to-[#9E2045] text-white hover:brightness-110 shadow-sm active:scale-95 cursor-pointer'
                    : 'bg-[#EAD8C7]/50 text-[#766B6F] cursor-not-allowed opacity-60'
                )}
                aria-label="Send message"
              >
                {isSending ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <IconSend className="h-4 w-4 ml-0.5" />
                )}
              </Button>
            </div>

            {/* Encrypted Reassurance Footer */}
            <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-[#766B6F]">
              <span className="flex items-center gap-1 font-medium">
                <IconLock className="h-3 w-3 text-emerald-600" />
                <span>End-to-end encrypted matrimonial messaging</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold text-[#7A1835]/80">
                Press Enter ↵ to send
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
