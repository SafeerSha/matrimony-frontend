'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Heart,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  CheckCheck,
  Loader2,
} from 'lucide-react';
import { notifications as demoNotifications } from '@/lib/demo-data';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { notificationService, NotificationItem } from '@/services';
import { toast } from '@/lib/toast';

interface NotificationDisplayItem {
  id: string;
  type: string;
  title: string;
  text: string;
  time: string;
  unread: boolean;
  profile?: { id: string; name?: string; image?: string };
  link?: string;
}

function formatTimeAgo(dateStr: string) {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return diffMin + ' min ago';
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return diffHour + (diffHour > 1 ? ' hrs ago' : ' hr ago');
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return diffDay + ' days ago';
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

function mapBackendNotification(n: NotificationItem): NotificationDisplayItem {
  let title = 'Notification';
  let link = undefined;

  if (n.type === 'NEW_INTEREST') {
    title = 'New interest received';
    if (n.referenceId) link = '/app/profile?user=' + n.referenceId;
  } else if (n.type === 'MATCH_ACCEPTED') {
    title = 'Match accepted!';
    if (n.referenceId) link = '/app/profile?user=' + n.referenceId;
  } else if (n.type === 'NEW_MESSAGE') {
    title = 'New message';
    link = '/app/messages';
  } else if (n.type === 'SYSTEM') {
    title = 'System notification';
  }

  return {
    id: n.id,
    type: n.type,
    title,
    text: n.content,
    time: formatTimeAgo(n.createdAt),
    unread: !n.isRead,
    link,
  };
}

const iconFor = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('interest')) return Heart;
  if (t.includes('match')) return Sparkles;
  if (t.includes('message')) return MessageCircle;
  return ShieldCheck;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await notificationService.getNotifications();
        if (data && data.length > 0) {
          setItems(data.map(mapBackendNotification));
        } else {
          // Fallback to demo items if database has no records yet
          setItems(
            demoNotifications.map((d) => ({
              id: d.id,
              type: d.type,
              title: d.title,
              text: d.text,
              time: d.time,
              unread: d.unread,
              profile: d.profile,
              link: d.profile ? '/app/profile?user=' + d.profile.id : undefined,
            }))
          );
        }
      } catch {
        // Fallback to demo items on error / offline
        setItems(
          demoNotifications.map((d) => ({
            id: d.id,
            type: d.type,
            title: d.title,
            text: d.text,
            time: d.time,
            unread: d.unread,
            profile: d.profile,
            link: d.profile ? '/app/profile?user=' + d.profile.id : undefined,
          }))
        );
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();
  }, []);

  const unreadCount = items.filter((n) => n.unread).length;

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;

    setIsMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
    } catch {
      // Continue optimistic update
    } finally {
      setItems((prev) => prev.map((item) => ({ ...item, unread: false })));
      setIsMarkingAll(false);
      toast.success('All notifications marked as read');
    }
  };

  const handleMarkSingleAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
    } catch {
      // ignore
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item))
    );
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Updates"
        title="Notifications"
        description="Stay up to date with matches, interests and account activity."
        action={
          <Button
            variant="secondary"
            disabled={isMarkingAll || unreadCount === 0}
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5"
          >
            {isMarkingAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Marking as read...</span>
              </>
            ) : unreadCount === 0 ? (
              <>
                <CheckCheck className="h-4 w-4 text-primary" />
                <span>All read</span>
              </>
            ) : (
              <span>Mark all as read</span>
            )}
          </Button>
        }
      />

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center">
          <Bell className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-sm font-semibold">No notifications yet</p>
          <p className="mt-1 text-xs text-muted">You are all caught up!</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const Icon = iconFor(n.type);
            return (
              <Card
                key={n.id}
                onClick={() => n.unread && handleMarkSingleAsRead(n.id)}
                className={'p-4 transition-colors ' + (n.unread ? 'border-primary-light bg-primary-light/25 cursor-pointer' : 'bg-white')}
              >
                <div className="flex gap-4">
                  <div className="relative">
                    <Avatar
                      src={n.profile?.image}
                      name={n.profile?.name ?? 'LetsChat'}
                      size="md"
                    />
                    <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-surface bg-primary text-white">
                      <Icon className="h-3 w-3" />
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold">{n.title}</p>
                        <p className="mt-1 text-sm leading-6 text-muted">
                          {n.text}
                        </p>
                      </div>
                      {n.unread && (
                        <span
                          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary"
                          title="Unread"
                        />
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-xs text-subtle-foreground">
                        {n.time}
                      </span>
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => n.unread && handleMarkSingleAsRead(n.id)}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          {n.type.toLowerCase().includes('message')
                            ? 'View conversation'
                            : 'View profile'}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="p-6 text-center">
        <Bell className="mx-auto h-7 w-7 text-primary" />
        <h3 className="mt-3 font-bold">Notifications are private</h3>
        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted">
          We’ll only surface useful activity. You can control notification
          categories from Settings.
        </p>
      </Card>
    </div>
  );
}
