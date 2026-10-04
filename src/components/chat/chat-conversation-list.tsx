'use client';

import React, { useState } from 'react';
import { IconSearch, IconLoader2, IconCheck } from '@tabler/icons-react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';
import type { Conversation } from '@/services/chat.service';

interface ChatConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (conv: Conversation) => void;
  isLoading?: boolean;
  className?: string;
}

export function ChatConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading = false,
  className,
}: ChatConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const filtered = conversations.filter((c) => {
    const name =
      c.participant?.name ||
      `${c.participant?.firstName || ''} ${c.participant?.lastName || ''}`.trim() ||
      'Member';
    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === 'unread') {
      return (c.unreadCount || 0) > 0;
    }
    return true;
  });

  return (
    <div className={cn('flex flex-col h-full bg-[#FFFDFB] text-[#211B1E]', className)}>
      {/* Search Header */}
      <div className="p-4 border-b border-[#E9DDE0] bg-[#FFFDFB] space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-[#211B1E]">
              Conversations
            </h2>
            <span className="inline-flex items-center justify-center rounded-full bg-[#FAF3EC] px-2 py-0.5 text-[11px] font-semibold text-[#7A1835] border border-[#EAD8C7]">
              {conversations.length}
            </span>
          </div>

          {/* Quick tab filter */}
          <div className="flex items-center bg-[#FAF3EC] p-0.5 rounded-lg border border-[#EAD8C7]/70 text-[11px] font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-colors',
                filterType === 'all'
                  ? 'bg-white text-[#7A1835] shadow-2xs font-bold'
                  : 'text-[#766B6F] hover:text-[#211B1E]'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('unread')}
              className={cn(
                'px-2.5 py-1 rounded-md transition-colors',
                filterType === 'unread'
                  ? 'bg-white text-[#7A1835] shadow-2xs font-bold'
                  : 'text-[#766B6F] hover:text-[#211B1E]'
              )}
            >
              Unread
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <IconSearch className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#766B6F]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search connections..."
            className="w-full rounded-xl bg-[#FFF9F6] border border-[#E9DDE0] pl-9 pr-3.5 py-2 text-xs text-[#211B1E] placeholder:text-[#766B6F]/70 outline-none focus:border-[#7A1835] focus:ring-2 focus:ring-[#7A1835]/10 transition-all"
          />
        </div>
      </div>

      {/* Conversations Stream */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#E9DDE0]/60 scrollbar-thin">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#766B6F] gap-2">
            <IconLoader2 className="h-6 w-6 animate-spin text-[#7A1835]" />
            <span className="text-xs font-medium">Loading conversations...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-[#766B6F]">
            <p className="text-xs font-medium">
              {searchQuery ? 'No matching conversations' : 'No active conversations yet'}
            </p>
            <p className="text-[11px] text-[#766B6F]/80 mt-1 max-w-[200px]">
              {searchQuery
                ? 'Try a different search query'
                : 'Connect with mutual matches to begin conversation'}
            </p>
          </div>
        ) : (
          filtered.map((c) => {
            const isSelected = selectedId === c.id;
            const pName =
              c.participant?.name ||
              `${c.participant?.firstName || ''} ${c.participant?.lastName || ''}`.trim() ||
              'Member';
            const pPhoto =
              c.participant?.photos?.[0]?.url ||
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85';
            const unread = c.unreadCount || 0;
            const timeStr = formatTime(c.lastMessage?.createdAt || c.updatedAt);
            const isOnline = (c as any).online ?? true;

            return (
              <button
                key={c.id}
                onClick={() => onSelect(c)}
                className={cn(
                  'w-full text-left p-3.5 sm:p-4 flex items-center gap-3 transition-all relative border-l-4',
                  isSelected
                    ? 'bg-[#7A1835]/5 border-l-[#7A1835]'
                    : 'border-l-transparent hover:bg-[#FFF9F6]'
                )}
              >
                {/* Avatar with subtle online indicator */}
                <div className="relative shrink-0">
                  <div className="h-11 w-11 rounded-2xl overflow-hidden border border-[#E9DDE0] bg-[#FAF3EC] shadow-2xs">
                    <img
                      src={pPhoto}
                      alt={pName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {isOnline && (
                    <span
                      title="Online"
                      className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-2xs"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={cn(
                        'truncate text-xs font-semibold leading-tight',
                        isSelected ? 'text-[#7A1835]' : 'text-[#211B1E]'
                      )}
                    >
                      {pName}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] shrink-0 font-normal',
                        unread > 0 ? 'text-[#7A1835] font-semibold' : 'text-[#766B6F]'
                      )}
                    >
                      {timeStr}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        'truncate text-[11px] leading-relaxed',
                        unread > 0
                          ? 'font-medium text-[#211B1E]'
                          : 'font-normal text-[#766B6F]'
                      )}
                    >
                      {c.lastMessage?.content || 'Started a matrimonial match conversation'}
                    </p>

                    {unread > 0 && (
                      <span className="grid h-4.5 min-w-4.5 shrink-0 place-items-center rounded-full bg-[#7A1835] px-1.5 text-[10px] font-bold text-white shadow-xs">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
