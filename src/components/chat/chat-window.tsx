'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  IconArrowLeft,
  IconPaperclip,
  IconMoodSmile,
  IconSend,
  IconDots,
  IconDotsVertical,
  IconCheck,
  IconShieldCheck,
  IconUser,
  IconHeart,
  IconBan,
  IconFlag,
  IconInfoCircle,
  IconCrown,
  IconLock,
  IconLoader2,
  IconBookmark,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import type { Conversation, Message } from '@/services/chat.service';
import type { Profile } from '@/lib/demo-data';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  demoProfile?: Profile;
  isLoadingMessages?: boolean;
  isSubscribed?: boolean;
  onSendMessage: (text: string) => Promise<void>;
  onBack?: () => void;
  onOpenProfile?: () => void;
  className?: string;
}

export function ChatWindow({
  conversation,
  messages,
  demoProfile,
  isLoadingMessages = false,
  isSubscribed = true,
  onSendMessage,
  onBack,
  onOpenProfile,
  className,
}: ChatWindowProps) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const participantName =
    conversation.participant?.name ||
    `${conversation.participant?.firstName || ''} ${conversation.participant?.lastName || ''}`.trim() ||
    demoProfile?.name ||
    'Match';

  const participantPhoto =
    conversation.participant?.photos?.[0]?.url ||
    demoProfile?.image ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85';

  const isVerified = conversation.participant?.isVerified ?? demoProfile?.verified ?? true;
  const isOnline = (conversation as any).online ?? true;
  const matchPercentage = demoProfile?.compatibility || 92;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoadingMessages]);

  const handleSend = async () => {
    if (!text.trim() || isSending) return;
    const current = text.trim();
    setText('');
    setIsSending(true);
    try {
      await onSendMessage(current);
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
      {/* 1. CHAT HEADER */}
      <header className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-[#E9DDE0] bg-white/90 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Back to conversations"
              className="lg:hidden grid h-9 w-9 place-items-center rounded-xl text-[#766B6F] hover:bg-[#FAF3EC] hover:text-[#7A1835] transition-colors -ml-1 shrink-0"
            >
              <IconArrowLeft className="h-5 w-5" />
            </button>
          )}

          {/* Profile Photo */}
          <div
            onClick={onOpenProfile}
            className="relative shrink-0 cursor-pointer group"
          >
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl overflow-hidden border border-[#E9DDE0] bg-[#FAF3EC] shadow-2xs group-hover:border-[#7A1835] transition-colors">
              <img
                src={participantPhoto}
                alt={participantName}
                className="h-full w-full object-cover"
              />
            </div>
            {isOnline && (
              <span
                title="Online"
                className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-2xs"
              />
            )}
          </div>

          {/* Name & Status */}
          <div
            onClick={onOpenProfile}
            className="min-w-0 cursor-pointer group"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm sm:text-base font-semibold text-[#211B1E] group-hover:text-[#7A1835] transition-colors truncate">
                {participantName}
              </span>
              {isVerified && <VerificationBadge size="sm" />}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#766B6F] font-medium">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active now
              </span>
              <span className="text-[#E9DDE0]">•</span>
              <span className="text-[#7A1835] font-semibold">{matchPercentage}% Match</span>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* View Profile Action */}
          <button
            onClick={onOpenProfile}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-[#E9DDE0] bg-[#FFF9F6] px-3 py-1.5 text-xs font-bold text-[#7A1835] hover:bg-[#FAF3EC] hover:border-[#D8B28C] transition-all"
          >
            <IconUser className="h-3.5 w-3.5" />
            <span>View Profile</span>
          </button>

          {/* Mobile Profile Trigger */}
          <button
            onClick={onOpenProfile}
            className="sm:hidden grid h-9 w-9 place-items-center rounded-xl text-[#7A1835] bg-[#FAF3EC] border border-[#EAD8C7]"
            aria-label="Profile"
          >
            <IconUser className="h-4 w-4" />
          </button>

          {/* More Options Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu((prev) => !prev)}
              aria-label="More options"
              className="grid h-9 w-9 place-items-center rounded-xl text-[#766B6F] hover:bg-[#FAF3EC] hover:text-[#211B1E] transition-colors"
            >
              <IconDotsVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-48 rounded-2xl border border-[#E9DDE0] bg-white p-1.5 shadow-lg z-30 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (onOpenProfile) onOpenProfile();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#211B1E] hover:bg-[#FAF3EC] hover:text-[#7A1835] transition-colors"
                  >
                    <IconUser className="h-3.5 w-3.5 text-[#766B6F]" />
                    <span>View Full Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      toast.success('Shortlisted', {
                        description: `${participantName} was added to your shortlisted connections.`,
                      });
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#211B1E] hover:bg-[#FAF3EC] hover:text-[#7A1835] transition-colors"
                  >
                    <IconBookmark className="h-3.5 w-3.5 text-[#766B6F]" />
                    <span>Shortlist Contact</span>
                  </button>
                  <div className="my-1 border-t border-[#E9DDE0]" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      toast.warning('Member Blocked', {
                        description: `You will no longer receive communications from ${participantName}.`,
                      });
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <IconBan className="h-3.5 w-3.5" />
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
                    <IconFlag className="h-3.5 w-3.5" />
                    <span>Report Profile</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. MATRIMONIAL CONTEXT / LOCK STATE */}
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
        /* SUBSCRIBED CHAT STREAM */
        <>
          {/* Matrimonial Trust Banner */}
          <div className="bg-gradient-to-r from-[#FAF3EC]/90 via-[#FFF9F6] to-[#FAF3EC]/90 border-b border-[#E9DDE0] px-4 py-2 text-center shrink-0">
            <p className="text-[11px] font-medium text-[#766B6F] flex items-center justify-center gap-1.5 flex-wrap">
              <IconShieldCheck className="h-3.5 w-3.5 text-[#7A1835]" />
              <span>Verified Matrimonial Match</span>
              <span className="text-[#E9DDE0] hidden sm:inline">•</span>
              <span className="hidden sm:inline">Keep conversations courteous, authentic & sincere</span>
            </p>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FFF9F6]/40">
            {/* Conversation Starter Card */}
            <div className="mx-auto max-w-sm text-center py-4 space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-[#E9DDE0] shadow-2xs">
                <IconCrown className="h-6 w-6 text-[#7A1835]" />
              </div>
              <h4 className="font-editorial-title text-sm font-bold text-[#211B1E]">
                Connected with {participantName}
              </h4>
              <p className="text-[11px] text-[#766B6F] leading-relaxed">
                Both of you expressed mutual interest. Break the ice with a thoughtful note about
                shared interests, family, or personal goals.
              </p>
            </div>

            {isLoadingMessages ? (
              <div className="flex justify-center py-8">
                <IconLoader2 className="h-6 w-6 animate-spin text-[#7A1835]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-xs text-[#766B6F] py-8">
                No messages yet. Send a warm hello to begin!
              </div>
            ) : (
              messages.map((m, idx) => {
                const isOurs = m.senderId !== conversation.participantId;
                const timeString = formatMessageTime(m.createdAt);

                return (
                  <div
                    key={m.id || idx}
                    className={cn('flex flex-col animate-chat-message', isOurs ? 'items-end' : 'items-start')}
                  >
                    <div className="max-w-[85%] sm:max-w-[70%]">
                      {/* Message Bubble */}
                      <div
                        className={cn(
                          'px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs',
                          isOurs
                            ? 'rounded-2xl rounded-tr-xs bg-gradient-to-r from-[#7A1835] to-[#8C1E3F] text-white'
                            : 'rounded-2xl rounded-tl-xs bg-white border border-[#E9DDE0] text-[#211B1E]'
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      </div>

                      {/* Timestamp & Status */}
                      <div
                        className={cn(
                          'mt-1 flex items-center gap-1 text-[10px] font-medium text-[#766B6F]',
                          isOurs ? 'justify-end pr-1' : 'justify-start pl-1'
                        )}
                      >
                        <span>{timeString}</span>
                        {isOurs && (
                          <IconCheck className="h-3 w-3 text-[#7A1835]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 3. MESSAGE COMPOSER */}
          <div className="p-3 sm:p-4 bg-white border-t border-[#E9DDE0] shrink-0">
            {/* Quick Emoji suggestions bar if open */}
            {showEmojiPicker && (
              <div className="mb-2 flex items-center gap-2 p-2 rounded-xl bg-[#FAF3EC] border border-[#EAD8C7] animate-in fade-in duration-150">
                {['😊', '👋', '✨', '☕', '🌸', '🙏', '👍', '🤍'].map((em) => (
                  <button
                    key={em}
                    onClick={() => insertEmoji(em)}
                    className="h-8 w-8 rounded-lg hover:bg-white text-base transition-colors flex items-center justify-center"
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2 rounded-2xl border border-[#E9DDE0] bg-[#FFF9F6] p-1.5 focus-within:border-[#7A1835] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#7A1835]/10 transition-all">
              {/* Attachment Button */}
              <button
                type="button"
                onClick={() =>
                  toast.info('Attach Document', {
                    description: 'Photo and document sharing will open your camera/gallery.',
                  })
                }
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#766B6F] hover:bg-white hover:text-[#211B1E] transition-colors"
                aria-label="Attach file"
              >
                <IconPaperclip className="h-4 w-4" />
              </button>

              {/* Text Input */}
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${participantName}...`}
                rows={1}
                className="w-full resize-none bg-transparent py-2 px-1 text-xs sm:text-sm text-[#211B1E] placeholder:text-[#766B6F]/70 outline-none max-h-28 scrollbar-none"
              />

              {/* Emoji Picker Button */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className={cn(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors',
                  showEmojiPicker
                    ? 'bg-[#FAF3EC] text-[#7A1835]'
                    : 'text-[#766B6F] hover:bg-white hover:text-[#211B1E]'
                )}
                aria-label="Insert Emoji"
              >
                <IconMoodSmile className="h-4 w-4" />
              </button>

              {/* Send Button */}
              <Button
                size="sm"
                onClick={handleSend}
                disabled={!text.trim() || isSending}
                className={cn(
                  'h-9 w-9 shrink-0 rounded-xl p-0 transition-all',
                  text.trim()
                    ? 'bg-[#7A1835] text-white hover:bg-[#5C1027] shadow-xs active-press'
                    : 'bg-[#E9DDE0] text-[#766B6F] cursor-not-allowed'
                )}
                aria-label="Send message"
              >
                {isSending ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <IconSend className="h-3.5 w-3.5 ml-0.5" />
                )}
              </Button>
            </div>

            {/* Reassurance Footer */}
            <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-[#766B6F]">
              <span className="flex items-center gap-1">
                <IconLock className="h-2.5 w-2.5 text-emerald-600" />
                <span>End-to-end encrypted matrimonial messaging</span>
              </span>
              <span className="text-[10px] font-semibold text-[#7A1835]">
                Press Enter to send
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
