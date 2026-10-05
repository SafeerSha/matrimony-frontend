'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  IconBell,
  IconHeart,
  IconMessageCircle,
  IconShieldCheck,
  IconCheck,
  IconLoader2,
  IconEye,
  IconCompass,
  IconArrowRight,
  IconFilter,
  IconClock,
  IconExternalLink,
  IconUsers,
} from '@tabler/icons-react';
import { PageLoader } from '@/components/ui/page-loader';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/section-header';
import { notificationService, NotificationItem } from '@/services';
import { profiles as demoProfiles } from '@/lib/demo-data';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';

export interface NotificationDisplayItem {
  id: string;
  type: 'INTEREST' | 'ACCEPTED' | 'MESSAGE' | 'VIEW' | 'MATCH' | 'SYSTEM';
  title: string;
  text: string;
  time: string;
  timestamp: number; // for grouping
  group: 'today' | 'yesterday' | 'earlier';
  unread: boolean;
  profile?: { id: string; name: string; image: string; age?: number; city?: string };
  link?: string;
  actionLabel?: string;
}

const DEMO_ENRICHED_NOTIFICATIONS: NotificationDisplayItem[] = [
  {
    id: 'notif-1',
    type: 'INTEREST',
    title: 'New Interest Received',
    text: 'Meera Nair expressed interest in your profile. Your profiles have 89% compatibility.',
    time: '15 min ago',
    timestamp: Date.now() - 1000 * 60 * 15,
    group: 'today',
    unread: true,
    profile: {
      id: demoProfiles[1].id,
      name: demoProfiles[1].name,
      image: demoProfiles[1].image,
      age: demoProfiles[1].age,
      city: demoProfiles[1].city,
    },
    link: '/app/interests?tab=received',
    actionLabel: 'Respond to Interest',
  },
  {
    id: 'notif-2',
    type: 'ACCEPTED',
    title: 'Mutual Match Confirmed!',
    text: 'Ananya Menon accepted your interest. You can now begin a private conversation.',
    time: '2 hours ago',
    timestamp: Date.now() - 1000 * 60 * 120,
    group: 'today',
    unread: true,
    profile: {
      id: demoProfiles[0].id,
      name: demoProfiles[0].name,
      image: demoProfiles[0].image,
      age: demoProfiles[0].age,
      city: demoProfiles[0].city,
    },
    link: '/app/messages',
    actionLabel: 'Open Chat',
  },
  {
    id: 'notif-3',
    type: 'MESSAGE',
    title: 'New Message from Ananya',
    text: '“That sounds lovely. I also enjoy quiet cafés. Have you been to Fort Kochi?”',
    time: '3 hours ago',
    timestamp: Date.now() - 1000 * 60 * 180,
    group: 'today',
    unread: false,
    profile: {
      id: demoProfiles[0].id,
      name: demoProfiles[0].name,
      image: demoProfiles[0].image,
      age: demoProfiles[0].age,
      city: demoProfiles[0].city,
    },
    link: '/app/messages',
    actionLabel: 'Reply',
  },
  {
    id: 'notif-4',
    type: 'VIEW',
    title: 'Profile Viewed',
    text: 'Diya Krishnan (Finance Manager, Bengaluru) recently viewed your matrimonial profile.',
    time: 'Yesterday at 4:30 PM',
    timestamp: Date.now() - 1000 * 60 * 60 * 22,
    group: 'yesterday',
    unread: false,
    profile: {
      id: demoProfiles[2].id,
      name: demoProfiles[2].name,
      image: demoProfiles[2].image,
      age: demoProfiles[2].age,
      city: demoProfiles[2].city,
    },
    link: '/app/discover?view=diya',
    actionLabel: 'View Profile',
  },
  {
    id: 'notif-5',
    type: 'MATCH',
    title: 'New Recommended Match',
    text: 'Farah Rahman matches 94% of your preferred partner criteria in Calicut.',
    time: 'Yesterday at 11:15 AM',
    timestamp: Date.now() - 1000 * 60 * 60 * 28,
    group: 'yesterday',
    unread: false,
    profile: {
      id: demoProfiles[3].id,
      name: demoProfiles[3].name,
      image: demoProfiles[3].image,
      age: demoProfiles[3].age,
      city: demoProfiles[3].city,
    },
    link: '/app/discover?view=farah',
    actionLabel: 'IconCheck Match',
  },
  {
    id: 'notif-6',
    type: 'SYSTEM',
    title: 'Profile Verification Complete',
    text: 'Your phone number and government ID verification were confirmed by our Trust Team.',
    time: '3 days ago',
    timestamp: Date.now() - 1000 * 60 * 60 * 72,
    group: 'earlier',
    unread: false,
    link: '/app/settings',
    actionLabel: 'Security Settings',
  },
];

function getCategoryIcon(type: NotificationDisplayItem['type']) {
  switch (type) {
    case 'INTEREST':
      return { icon: IconHeart, color: 'text-[#7A1835] bg-[#FAF3EC] border-[#EAD8C7]' };
    case 'ACCEPTED':
      return { icon: IconUsers, color: 'text-amber-700 bg-amber-50 border-amber-200' };
    case 'MESSAGE':
      return { icon: IconMessageCircle, color: 'text-[#7A1835] bg-[#FAF3EC] border-[#EAD8C7]' };
    case 'VIEW':
      return { icon: IconEye, color: 'text-stone-700 bg-stone-100 border-stone-200' };
    case 'MATCH':
      return { icon: IconCompass, color: 'text-[#8C5D30] bg-[#FAF3EC] border-[#EAD8C7]' };
    default:
      return { icon: IconShieldCheck, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  }
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationDisplayItem[]>(DEMO_ENRICHED_NOTIFICATIONS);
  const [loading, setLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'interests' | 'matches'>('all');

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await notificationService.getNotifications();
        if (data && data.length > 0) {
          const mapped: NotificationDisplayItem[] = data.map((n, idx) => {
            const createdTime = new Date(n.createdAt).getTime();
            const now = Date.now();
            const diffHours = (now - createdTime) / (1000 * 60 * 60);

            let group: 'today' | 'yesterday' | 'earlier' = 'earlier';
            if (diffHours < 24) group = 'today';
            else if (diffHours < 48) group = 'yesterday';

            const demoMatch = demoProfiles[idx % demoProfiles.length];

            let type: NotificationDisplayItem['type'] = 'SYSTEM';
            let title = 'System Notification';
            let link = '/app';
            let actionLabel = 'View';

            if (n.type.includes('INTEREST')) {
              type = 'INTEREST';
              title = 'New Interest Received';
              link = '/app/interests?tab=received';
              actionLabel = 'Respond to Interest';
            } else if (n.type.includes('MATCH') || n.type.includes('ACCEPTED')) {
              type = 'ACCEPTED';
              title = 'Match Confirmed!';
              link = '/app/matches';
              actionLabel = 'View Match';
            } else if (n.type.includes('MESSAGE')) {
              type = 'MESSAGE';
              title = 'New Message';
              link = '/app/messages';
              actionLabel = 'Open Chat';
            }

            return {
              id: n.id,
              type,
              title,
              text: n.content,
              time: diffHours < 1 ? 'Just now' : `${Math.floor(diffHours)}h ago`,
              timestamp: createdTime,
              group,
              unread: !n.isRead,
              profile: {
                id: demoMatch.id,
                name: demoMatch.name,
                image: demoMatch.image,
                age: demoMatch.age,
                city: demoMatch.city,
              },
              link,
              actionLabel,
            };
          });
          setItems(mapped);
        } else {
          setItems(DEMO_ENRICHED_NOTIFICATIONS);
        }
      } catch {
        setItems(DEMO_ENRICHED_NOTIFICATIONS);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  const unreadCount = useMemo(() => items.filter((n) => n.unread).length, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filter === 'unread') return item.unread;
      if (filter === 'interests') return item.type === 'INTEREST';
      if (filter === 'matches') return item.type === 'ACCEPTED' || item.type === 'MATCH' || item.type === 'MESSAGE';
      return true;
    });
  }, [items, filter]);

  const grouped = useMemo(() => {
    return {
      today: filteredItems.filter((i) => i.group === 'today'),
      yesterday: filteredItems.filter((i) => i.group === 'yesterday'),
      earlier: filteredItems.filter((i) => i.group === 'earlier'),
    };
  }, [filteredItems]);

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
    } catch {
      // optimistic
    } finally {
      setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
      setIsMarkingAll(false);
      toast.success('All Marked as Read', {
        description: 'Your notifications have been updated.',
      });
    }
  };

  const handleMarkSingleAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
    } catch {
      // optimistic
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item))
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionHeader
            eyebrow="IconActivity & Updates"
            title="Notification Center"
            description="Real-time alerts for mutual interests, direct messages, and profile interactions."
          />
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <Button
            variant="secondary"
            size="md"
            disabled={isMarkingAll || unreadCount === 0}
            onClick={handleMarkAllAsRead}
            className="rounded-2xl border-[#E9DDE0] text-xs font-bold gap-1.5 min-h-10 px-4 active-press inline-flex items-center justify-center"
          >
            {isMarkingAll ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin text-[#7A1835]" />
                <span>Marking all read...</span>
              </>
            ) : unreadCount === 0 ? (
              <>
                <IconCheck className="h-4 w-4 text-emerald-600" />
                <span>All Caught Up</span>
              </>
            ) : (
              <>
                <IconCheck className="h-4 w-4 text-[#7A1835]" />
                <span>Mark all as read ({unreadCount})</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E9DDE0] pb-3 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {[
          { key: 'all', label: 'All Updates', count: items.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'interests', label: 'Interests' },
          { key: 'matches', label: 'Matches & Chats' },
        ].map((tab) => {
          const isActive = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={cn(
                'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all shrink-0 whitespace-nowrap select-none active-press',
                isActive
                  ? 'bg-[#7A1835] text-white shadow-xs'
                  : 'bg-white text-[#766B6F] border border-[#E9DDE0] hover:bg-[#FAF3EC] hover:text-[#211B1E]'
              )}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.2 text-[10px] font-bold',
                    isActive ? 'bg-white/20 text-white' : 'bg-[#FAF3EC] text-[#7A1835]'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <PageLoader text="Loading notifications..." />
      ) : filteredItems.length === 0 ? (
        <Card className="rounded-3xl border border-[#E9DDE0] bg-white p-12 text-center shadow-xs">
          <div className="h-14 w-14 rounded-2xl bg-[#FAF3EC] border border-[#EAD8C7] flex items-center justify-center mx-auto text-[#7A1835] mb-3">
            <IconBell className="h-7 w-7" />
          </div>
          <h3 className="font-editorial-title text-base font-bold text-[#211B1E]">
            No Notifications Found
          </h3>
          <p className="text-xs text-[#766B6F] mt-1 max-w-sm mx-auto">
            You are all caught up! New interests and connection requests will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* GROUP: TODAY */}
          {grouped.today.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A1835]">
                  Today
                </span>
                <span className="h-px flex-1 bg-[#E9DDE0]" />
              </div>

              <div className="space-y-2">
                {grouped.today.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    onMarkRead={handleMarkSingleAsRead}
                  />
                ))}
              </div>
            </div>
          )}

          {/* GROUP: YESTERDAY */}
          {grouped.yesterday.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#766B6F]">
                  Yesterday
                </span>
                <span className="h-px flex-1 bg-[#E9DDE0]" />
              </div>

              <div className="space-y-2">
                {grouped.yesterday.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    onMarkRead={handleMarkSingleAsRead}
                  />
                ))}
              </div>
            </div>
          )}

          {/* GROUP: EARLIER */}
          {grouped.earlier.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#766B6F]">
                  Earlier
                </span>
                <span className="h-px flex-1 bg-[#E9DDE0]" />
              </div>

              <div className="space-y-2">
                {grouped.earlier.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    onMarkRead={handleMarkSingleAsRead}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trust & Privacy Notice */}
      <Card className="rounded-3xl border border-[#EAD8C7] bg-gradient-to-r from-[#FAF3EC] via-[#FFF9F6] to-[#FFF5F7] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white border border-[#EAD8C7] text-[#7A1835]">
            <IconShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-editorial-title text-sm font-bold text-[#211B1E]">
              Notifications are 100% Private & Discretionary
            </h4>
            <p className="text-xs text-[#766B6F] mt-0.5 leading-relaxed">
              We only alert you to genuine matrimonial interactions. You can adjust your delivery
              preferences in Settings at any time.
            </p>
          </div>
        </div>

        <Link href="/app/settings" className="shrink-0 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-[#7A1835] text-[#7A1835] hover:bg-[#7A1835]/5 text-xs font-bold"
          >
            Manage Alerts
          </Button>
        </Link>
      </Card>
    </div>
  );
}

function NotificationRow({
  item,
  onMarkRead,
}: {
  item: NotificationDisplayItem;
  onMarkRead: (id: string) => void;
}) {
  const { icon: Icon, color } = getCategoryIcon(item.type);

  return (
    <Card
      onClick={() => item.unread && onMarkRead(item.id)}
      className={cn(
        'group relative rounded-2xl border transition-all duration-200 p-4 sm:p-4.5',
        item.unread
          ? 'bg-[#FAF3EC]/60 border-[#EAD8C7] hover:bg-[#FAF3EC] shadow-xs'
          : 'bg-white border-[#E9DDE0] hover:bg-[#FFF9F6]'
      )}
    >
      <div className="flex items-start gap-3.5">
        {/* Profile Avatar or Type Icon */}
        <div className="relative shrink-0">
          {item.profile ? (
            <div className="relative">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl overflow-hidden border border-[#E9DDE0] bg-[#FAF3EC] shadow-2xs">
                <img
                  src={item.profile.image}
                  alt={item.profile.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span
                className={cn(
                  'absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-white shadow-2xs text-[10px]',
                  color
                )}
              >
                <Icon className="h-2.5 w-2.5" />
              </span>
            </div>
          ) : (
            <div
              className={cn(
                'grid h-11 w-11 place-items-center rounded-2xl border shadow-2xs',
                color
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h4
                  className={cn(
                    'text-xs sm:text-sm font-bold leading-tight',
                    item.unread ? 'text-[#7A1835]' : 'text-[#211B1E]'
                  )}
                >
                  {item.title}
                </h4>
                {item.unread && (
                  <span className="h-2 w-2 rounded-full bg-[#7A1835] ring-2 ring-[#7A1835]/20 animate-pulse" />
                )}
              </div>
              <p className="mt-1 text-xs text-[#211B1E] leading-relaxed">
                {item.text}
              </p>
            </div>

            <span className="text-[10px] font-semibold text-[#766B6F] shrink-0 mt-0.5 whitespace-nowrap">
              {item.time}
            </span>
          </div>

          {/* Action Row */}
          {item.link && (
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#E9DDE0]/50">
              <Link
                href={item.link}
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.unread) onMarkRead(item.id);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A1835] hover:text-[#5C1027] hover:underline"
              >
                <span>{item.actionLabel || 'View Details'}</span>
                <IconArrowRight className="h-3.5 w-3.5" />
              </Link>

              {item.unread && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkRead(item.id);
                  }}
                  className="text-[11px] font-semibold text-[#766B6F] hover:text-[#211B1E]"
                >
                  Mark as read
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
