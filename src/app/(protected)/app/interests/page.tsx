'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  IconHeart,
  IconCheck,
  IconX,
  IconSearch,
  IconMessageCircle,
  IconClock,
  IconArrowRight,
  IconShieldCheck,
  IconCompass,
  IconInbox,
  IconSend,
  IconUserCheck,
  IconBan,
  IconRefresh,
} from '@tabler/icons-react';
import { SectionHeader } from '@/components/ui/section-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/input';
import { InterestCard } from '@/components/ui/interest-card';
import { EmptyState } from '@/components/ui/empty-state';
import { FeatureGate } from '@/components/ui/under-development';
import { matchesService, profileService } from '@/services';
import {
  profiles as demoProfiles,
  receivedInterests as demoReceived,
  sentInterests as demoSent,
} from '@/lib/demo-data';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import type { Profile } from '@/lib/demo-data';

export type InterestsTab = 'received' | 'sent' | 'declined';

// Helper to map backend UserProfile to Profile UI model
const mapProfile = (u: any, idx = 0): Profile => ({
  id: u.id || `user-${idx}`,
  profileId: u.profileId || u.user?.profileId,
  name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Member',
  age: u.dateOfBirth
    ? Math.floor((new Date().getTime() - new Date(u.dateOfBirth).getTime()) / 31557600000)
    : 26 + (idx % 6),
  city: u.city || 'Kochi',
  state: u.country || 'Kerala',
  profession: u.occupation || 'Professional',
  education: u.education || 'Graduate Degree',
  image:
    u.photos?.[0]?.url ||
    demoProfiles[idx % demoProfiles.length]?.image ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85',
  compatibility: Math.floor(Math.random() * 15) + 84,
  verified: u.isVerified ?? true,
  online: idx % 2 === 0,
  about: u.bio || demoProfiles[idx % demoProfiles.length]?.about || '',
  height: u.height ? `${u.height}cm` : "5'5\"",
  maritalStatus: u.maritalStatus || 'Never married',
  religion: u.religion || 'Not specified',
  motherTongue: 'Malayalam',
  family: 'Respectable, close-knit family based in South India.',
  lifestyle: ['Non-smoker', 'Vegetarian'],
  interests: ['Design', 'Travel', 'Music', 'Reading'],
  lookingFor: 'A kind, emotionally mature partner.',
});

function InterestsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Normalize initial tab from query param
  const initialTabParam = searchParams.get('tab');
  const initialTab: InterestsTab = useMemo(() => {
    if (initialTabParam === 'pending' || initialTabParam === 'received') return 'received';
    if (initialTabParam === 'sent' || initialTabParam === 'shortlisted') return 'sent';
    if (initialTabParam === 'declined') return 'declined';
    return 'received';
  }, [initialTabParam]);

  const [tab, setTab] = useState<InterestsTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');

  // Tab Data States
  const [receivedItems, setReceivedItems] = useState<Profile[]>(demoReceived);
  const [sentItems, setSentItems] = useState<Profile[]>(demoSent);
  const [declinedItems, setDeclinedItems] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state if URL param changes
  useEffect(() => {
    if (initialTab !== tab) {
      setTab(initialTab);
    }
  }, [initialTab]);

  // Tab change handler with URL sync
  const handleTabChange = (newTab: InterestsTab) => {
    setTab(newTab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    router.replace(`/app/interests?${params.toString()}`);
  };

  // Fetch data on tab change
  useEffect(() => {
    setIsLoading(true);
    let type: 'received' | 'sent' | 'shortlisted' = 'received';

    if (tab === 'received') type = 'received';
    else if (tab === 'sent') type = 'sent';
    else {
      // Declined is maintained in client session
      setIsLoading(false);
      return;
    }

    matchesService
      .getConnections(type as any)
      .then((res: any) => {
        const rawList = Array.isArray(res) ? res : res?.data || [];
        if (rawList.length > 0) {
          const mapped = rawList.map(mapProfile);
          if (tab === 'received') setReceivedItems(mapped);
          else if (tab === 'sent') setSentItems(mapped);
        } else {
          // Keep rich demo fallbacks if empty
          if (tab === 'received' && receivedItems.length === 0) setReceivedItems(demoReceived);
          if (tab === 'sent' && sentItems.length === 0) setSentItems(demoSent);
        }
      })
      .catch((err) => {
        console.error('Error fetching connections:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [tab]);

  // Filter items by search query
  const filterList = (items: Profile[]) => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter((p) =>
      `${p.id} ${p.profileId || ''} ${p.name} ${p.city} ${p.profession} ${p.education}`.toLowerCase().includes(q)
    );
  };

  // Accept incoming interest
  const handleAccept = async (id: string) => {
    const item = receivedItems.find((p) => p.id === id);
    try {
      await matchesService.acceptInterest(id);
      setReceivedItems((prev) => prev.filter((p) => p.id !== id));
      if (item) {
        toast.success(
          'Interest Accepted!',
          `You and ${item.name} are now connected. You can view them in Mutual Matches anytime.`
        );
      }
    } catch {
      setReceivedItems((prev) => prev.filter((p) => p.id !== id));
      if (item) {
        toast.success(
          'Interest Accepted!',
          `You and ${item.name} are now connected. You can view them in Mutual Matches anytime.`
        );
      }
    }
  };

  // Decline incoming interest
  const handleDecline = async (id: string) => {
    const item = receivedItems.find((p) => p.id === id);
    try {
      await matchesService.rejectInterest(id);
      setReceivedItems((prev) => prev.filter((p) => p.id !== id));
      if (item) {
        setDeclinedItems((prev) => [item, ...prev]);
        toast.info(
          'Interest Declined',
          `You have respectfully declined the request from ${item.name}.`
        );
      }
    } catch {
      setReceivedItems((prev) => prev.filter((p) => p.id !== id));
      if (item) {
        setDeclinedItems((prev) => [item, ...prev]);
        toast.info(
          'Interest Declined',
          `You have respectfully declined the request from ${item.name}.`
        );
      }
    }
  };

  const filteredReceived = filterList(receivedItems);
  const filteredSent = filterList(sentItems);
  const filteredDeclined = filterList(declinedItems);

  return (
    <div className="space-y-6 pb-14">
      {/* ======================================================== */}
      {/* 1. HEADER & INTERACTION CENTER CONTEXT                   */}
      {/* ======================================================== */}
      <div className="flex items-end justify-between gap-3 animate-content-appear stagger-1">
        <div className="min-w-0">
          <div className="mb-1 sm:mb-1.5 flex items-center gap-1.5 sm:gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shrink-0" aria-hidden="true" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)]">
              Connections
            </p>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)] font-editorial-title leading-tight truncate">
            Interests
          </h1>
        </div>

        {/* Quick Discovery CTA pill in same row at right end */}
        <Link href="/app/discover" className="focus-ring shrink-0">
          <Button
            variant="secondary"
            size="md"
            className="rounded-2xl text-xs font-bold gap-1 active-press h-9 sm:h-10 px-3 sm:px-4"
            leftIcon={<IconCompass className="h-4 w-4 text-[var(--primary)] shrink-0" />}
          >
            <span className="whitespace-nowrap">Discover Profiles</span>
          </Button>
        </Link>
      </div>

      {/* ======================================================== */}
      {/* 2. TABS CONTROLS & SEARCH BAR                            */}
      {/* ======================================================== */}
      <Card className="p-3 sm:p-4 rounded-3xl border-[var(--border)] bg-white shadow-[var(--elevation-card)] animate-content-appear stagger-2">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* Segmented Tabs: Received | Sent | Accepted (Matches) | Declined */}
          <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-muted)] rounded-2xl border border-[var(--border)] overflow-x-auto scrollbar-none">
            {/* Received Tab */}
            <button
              type="button"
              onClick={() => handleTabChange('received')}
              className={cn(
                'focus-ring flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active-press select-none whitespace-nowrap',
                tab === 'received'
                  ? 'bg-white text-[var(--primary)] shadow-xs'
                  : 'text-[var(--muted-strong)] hover:text-[var(--foreground)]'
              )}
            >
              <IconInbox className="h-4 w-4" />
              <span>Received</span>
              {receivedItems.length > 0 && (
                <span
                  className={cn(
                    'grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-bold leading-none',
                    tab === 'received'
                      ? 'bg-[var(--primary)] text-white'
                      : 'bg-stone-200 text-stone-700'
                  )}
                >
                  {receivedItems.length}
                </span>
              )}
            </button>

            {/* Sent Tab */}
            <button
              type="button"
              onClick={() => handleTabChange('sent')}
              className={cn(
                'focus-ring flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active-press select-none whitespace-nowrap',
                tab === 'sent'
                  ? 'bg-white text-[var(--primary)] shadow-xs'
                  : 'text-[var(--muted-strong)] hover:text-[var(--foreground)]'
              )}
            >
              <IconSend className="h-3.5 w-3.5" />
              <span>Sent</span>
              {sentItems.length > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-stone-200 px-1.5 text-[10px] font-bold text-stone-700 leading-none">
                  {sentItems.length}
                </span>
              )}
            </button>

            {/* Declined Tab */}
            <button
              type="button"
              onClick={() => handleTabChange('declined')}
              className={cn(
                'focus-ring flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active-press select-none whitespace-nowrap',
                tab === 'declined'
                  ? 'bg-white text-[var(--primary)] shadow-xs'
                  : 'text-[var(--muted-strong)] hover:text-[var(--foreground)]'
              )}
            >
              <IconBan className="h-3.5 w-3.5" />
              <span>Declined</span>
              {declinedItems.length > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-stone-200 px-1.5 text-[10px] font-bold text-stone-700 leading-none">
                  {declinedItems.length}
                </span>
              )}
            </button>
          </div>

          {/* Quick Search across connections */}
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              placeholder={`Search ${tab} connections by name, ID, or city...`}
            />
          </div>
        </div>
      </Card>

      {/* ======================================================== */}
      {/* 3. TAB CONTENT VIEWS                                     */}
      {/* ======================================================== */}

      {/* -------------------------------------------------------- */}
      {/* TAB A: RECEIVED INTERESTS                                */}
      {/* -------------------------------------------------------- */}
      {tab === 'received' && (
        <div className="space-y-4 animate-content-appear stagger-3">
          {filteredReceived.length > 0 ? (
            <div className="space-y-4">
              {filteredReceived.map((profile) => (
                <InterestCard
                  key={profile.id}
                  profile={profile}
                  type="received"
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title={
                searchQuery
                  ? 'No matching requests found'
                  : 'Your next connection could be waiting'
              }
              description={
                searchQuery
                  ? `No received requests matched "${searchQuery}". Clear your search query to see all pending interests.`
                  : 'When someone discovers your profile and expresses interest in connecting, their request will appear here with their complete photo and bio.'
              }
              actionText="Discover Profiles"
              onAction={() => router.push('/app/discover')}
              tip="Profiles with a completed bio and partner preferences receive up to 3x more interest requests."
            />
          )}
        </div>
      )}

      {/* -------------------------------------------------------- */}
      {/* TAB B: SENT INTERESTS                                    */}
      {/* -------------------------------------------------------- */}
      {tab === 'sent' && (
        <div className="space-y-4 animate-content-appear stagger-3">
          {filteredSent.length > 0 ? (
            <div className="space-y-4">
              {filteredSent.map((profile) => (
                <InterestCard
                  key={profile.id}
                  profile={profile}
                  type="sent"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="You haven't sent any interests yet"
              description="Browse through verified matrimonial profiles aligned with your partner preferences and take the first step."
              actionText="Discover Profiles"
              onAction={() => router.push('/app/discover')}
              tip="Expressing interest sends a respectful notification allowing the other member to view your profile and respond."
            />
          )}
        </div>
      )}



      {/* -------------------------------------------------------- */}
      {/* TAB D: DECLINED REQUESTS                                 */}
      {/* -------------------------------------------------------- */}
      {tab === 'declined' && (
        <div className="space-y-4 animate-content-appear stagger-3">
          {filteredDeclined.length > 0 ? (
            <div className="space-y-4">
              {filteredDeclined.map((profile) => (
                <InterestCard
                  key={profile.id}
                  profile={profile}
                  type="declined"
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No declined requests"
              description="Requests that you respectfully pass or decline will be archived here for your privacy and records."
              actionText="Discover Profiles"
              onAction={() => router.push('/app/discover')}
              tip="Declined profiles will never be notified with negative feedback; discretion is maintained at all times."
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function InterestsPage() {
  return (
    <FeatureGate page="interests" title="Interests & Requests">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-16 w-1/3 bg-[var(--surface-muted)] rounded-2xl skeleton-shimmer" />
            <div className="h-12 w-full bg-[var(--surface-muted)] rounded-2xl skeleton-shimmer" />
            <div className="space-y-4">
              <div className="h-56 w-full bg-[var(--surface-muted)] rounded-3xl skeleton-shimmer" />
              <div className="h-56 w-full bg-[var(--surface-muted)] rounded-3xl skeleton-shimmer" />
            </div>
          </div>
        }
      >
        <InterestsContent />
      </Suspense>
    </FeatureGate>
  );
}
