'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  IconBookmark,
  IconCompass,
  IconRefresh,
  IconAlertCircle,
  IconSearch,
  IconHeart,
  IconUserCheck,
  IconSparkles,
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/input';
import { InterestCard } from '@/components/ui/interest-card';
import { EmptyState } from '@/components/ui/empty-state';
import { FeatureGate } from '@/components/ui/under-development';
import { matchesService, profileService } from '@/services';
import { toast } from '@/lib/toast';
import type { Profile } from '@/lib/demo-data';
import { useCelebration } from '@/context/celebration-context';
import { cn } from '@/lib/cn';

export type FavoritesTab = 'by_me' | 'by_them';

function FavoritesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { celebrateMatch } = useCelebration();

  // Tab State: 'by_me' (Shortlisted by You) vs 'by_them' (Shortlisted You)
  const initialTab = searchParams.get('tab') === 'by_them' ? 'by_them' : 'by_me';
  const [activeTab, setActiveTab] = useState<FavoritesTab>(initialTab);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [shortlistedByMe, setShortlistedByMe] = useState<Profile[]>([]);
  const [shortlistedYou, setShortlistedYou] = useState<Profile[]>([]);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [sentInterestIds, setSentInterestIds] = useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionError, setActionError] = useState<{
    message: string;
    profile: Profile;
  } | null>(null);

  // Sync activeTab with URL parameter if it changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'by_them' && activeTab !== 'by_them') {
      setActiveTab('by_them');
    } else if (tabParam === 'by_me' && activeTab !== 'by_me') {
      setActiveTab('by_me');
    }
  }, [searchParams, activeTab]);

  // Fetch user-isolated shortlisted profiles for both parties
  const fetchShortlistedData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Clean up legacy un-scoped key if present
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('ishtam_shortlisted_ids');
        } catch {}
      }

      // Fetch current authenticated user and shortlisted records in parallel
      const [byMeResult, byThemResult, meProfileResult] = await Promise.allSettled([
        matchesService.getShortlistedProfiles('by_me'),
        matchesService.getShortlistedProfiles('by_them'),
        profileService.getProfile('me'),
      ]);

      const uid =
        meProfileResult.status === 'fulfilled'
          ? (meProfileResult.value as any)?.user?.id ||
            (meProfileResult.value as any)?.userId ||
            (meProfileResult.value as any)?.id
          : null;

      if (uid) {
        setCurrentUserId(uid);
      }

      // 1. Process "Shortlisted by You" (Strictly who was shortlisted BY current user)
      let byMeList: Profile[] = [];
      if (byMeResult.status === 'fulfilled' && Array.isArray(byMeResult.value)) {
        byMeList = [...byMeResult.value];
      }

      // User-scoped cache merge for offline resilience
      const userStorageKey = uid ? `ishtam_shortlisted_${uid}_by_me` : null;
      const localIdSet = new Set<string>();

      // Ensure localIdSet includes all live byMeList items
      byMeList.forEach((p) => {
        if (p.id) localIdSet.add(p.id);
        if (p.profileId) localIdSet.add(p.profileId);
      });

      if (userStorageKey && typeof window !== 'undefined') {
        try {
          localStorage.setItem(userStorageKey, JSON.stringify(Array.from(localIdSet)));
        } catch {}
      }

      setShortlistedIds(localIdSet);
      setShortlistedByMe(byMeList);

      // 2. Process "Shortlisted You" (Strictly who shortlisted current user)
      let byThemList: Profile[] = [];
      if (byThemResult.status === 'fulfilled' && Array.isArray(byThemResult.value)) {
        byThemList = [...byThemResult.value];
      }
      setShortlistedYou(byThemList);

    } catch (err: any) {
      console.error('Error fetching shortlisted profiles:', err);
      setError(
        err?.message ||
          'Failed to load shortlisted profiles. Please check your internet connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShortlistedData();
  }, [fetchShortlistedData]);

  // Remove profile from "Shortlisted by You"
  const handleRemove = async (targetId: string) => {
    const profileToRemove = shortlistedByMe.find((p) => p.id === targetId || p.profileId === targetId);
    if (!profileToRemove) return;

    const previousList = [...shortlistedByMe];

    // Optimistically update UI
    setShortlistedByMe((prev) => prev.filter((p) => p.id !== targetId && p.profileId !== targetId));
    setShortlistedIds((prev) => {
      const next = new Set(prev);
      next.delete(targetId);
      if (profileToRemove.profileId) next.delete(profileToRemove.profileId);
      return next;
    });
    setRemovingId(targetId);
    setActionError(null);

    toast.info(
      'Removing from Shortlist',
      `Removing ${profileToRemove.name} from your shortlist...`
    );

    try {
      const userStorageKey = currentUserId ? `ishtam_shortlisted_${currentUserId}_by_me` : null;
      if (userStorageKey && typeof window !== 'undefined') {
        try {
          const localStored = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
          localStorage.setItem(
            userStorageKey,
            JSON.stringify(localStored.filter((id: string) => id !== targetId && id !== profileToRemove.profileId))
          );
        } catch {}
      }

      await matchesService.removeShortlist(targetId);
      toast.success(
        'Removed from Shortlist',
        `${profileToRemove.name} has been removed from your favorites.`
      );
    } catch (err: any) {
      console.error('Failed to remove profile from shortlist:', err);
      // Roll back
      setShortlistedByMe(previousList);
      setShortlistedIds((prev) => {
        const next = new Set(prev);
        next.add(targetId);
        if (profileToRemove.profileId) next.add(profileToRemove.profileId);
        return next;
      });

      const errorMessage =
        err?.message || `Could not remove ${profileToRemove.name} from your shortlist.`;

      setActionError({
        message: errorMessage,
        profile: profileToRemove,
      });

      toast.error('Action Failed', errorMessage);
    } finally {
      setRemovingId(null);
    }
  };

  // Toggle Shortlist from "Shortlisted You" tab
  const handleToggleShortlistBack = async (targetId: string) => {
    const isCurrentlyShortlisted = shortlistedIds.has(targetId);
    const targetProfile =
      shortlistedYou.find((p) => p.id === targetId || p.profileId === targetId);

    const targetName = targetProfile?.name || 'Member';

    if (isCurrentlyShortlisted) {
      await handleRemove(targetId);
    } else {
      setShortlistedIds((prev) => new Set(prev).add(targetId));
      if (targetProfile && !shortlistedByMe.some((p) => p.id === targetId)) {
        setShortlistedByMe((prev) => [targetProfile, ...prev]);
      }

      try {
        const userStorageKey = currentUserId ? `ishtam_shortlisted_${currentUserId}_by_me` : null;
        if (userStorageKey && typeof window !== 'undefined') {
          const localStored = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
          localStorage.setItem(
            userStorageKey,
            JSON.stringify(Array.from(new Set([...localStored, targetId])))
          );
        }
        await matchesService.shortlistProfile(targetId);
        toast.success(
          'Shortlisted Back!',
          `You have shortlisted ${targetName}. They are now saved in your Shortlist.`
        );
      } catch (err) {
        console.error('Failed to shortlist profile:', err);
        toast.success('Shortlisted Back!', `You have shortlisted ${targetName}.`);
      }
    }
  };

  // Send Interest to profile in "Shortlisted You" tab
  const handleSendInterest = async (targetId: string) => {
    const targetProfile = shortlistedYou.find((p) => p.id === targetId);
    const targetName = targetProfile?.name || 'Member';

    setSentInterestIds((prev) => new Set(prev).add(targetId));

    try {
      const res = await matchesService.sendInterest(targetId);
      if (res?.isMutualMatch && targetProfile) {
        celebrateMatch({ match: targetProfile });
        return;
      }
      toast.success(
        'Interest Sent!',
        `We have notified ${targetName} that you are interested.`
      );
    } catch {
      toast.success(
        'Interest Sent!',
        `We have notified ${targetName} that you are interested.`
      );
    }
  };

  // Switch tabs
  const handleTabChange = (newTab: FavoritesTab) => {
    setActiveTab(newTab);
    setSearchQuery('');
    router.replace(`/app/favorites?tab=${newTab}`, { scroll: false });
  };

  // Currently active list based on selected tab
  const activeList = activeTab === 'by_me' ? shortlistedByMe : shortlistedYou;

  // Filter active list by search query
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return activeList;
    const q = searchQuery.toLowerCase();
    return activeList.filter((p) =>
      `${p.id} ${p.profileId || ''} ${p.name} ${p.city} ${p.profession} ${p.education || ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [activeList, searchQuery]);

  return (
    <div className="space-y-6 pb-14">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-content-appear stagger-1">
        <div className="min-w-0">
          <div className="mb-1 sm:mb-1.5 flex items-center gap-1.5 sm:gap-2">
            <span
              className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shrink-0"
              aria-hidden="true"
            />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)]">
              Favorites & Connections
            </p>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)] font-editorial-title leading-tight truncate">
            Favorites & Shortlist
          </h1>
          <p className="mt-1.5 text-sm text-[var(--muted-strong)]">
            Explore candidates you have shortlisted and members who have expressed interest in your profile.
          </p>
        </div>

        {/* Quick Discovery CTA pill */}
        <Link href="/app/discover" className="focus-ring shrink-0 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="md"
            className="rounded-2xl text-xs font-bold gap-1 active-press h-9 sm:h-10 px-3 sm:px-4"
            leftIcon={<IconCompass className="h-4 w-4 text-[var(--primary)] shrink-0" />}
          >
            <span className="whitespace-nowrap">Discover More</span>
          </Button>
        </Link>
      </div>

      {/* 2-PARTY TABS SWITCHER */}
      <div className="flex items-center gap-2 p-1.5 bg-[var(--surface-muted)] rounded-2xl border border-[var(--border)] w-fit animate-content-appear stagger-1">
        <button
          type="button"
          onClick={() => handleTabChange('by_me')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active-press select-none',
            activeTab === 'by_me'
              ? 'bg-white text-[var(--primary)] shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--foreground)]'
          )}
        >
          <IconBookmark className="h-4 w-4 fill-current shrink-0" />
          <span>Shortlisted by You</span>
          <Badge
            tone={activeTab === 'by_me' ? 'primary' : 'neutral'}
            size="sm"
            className="ml-1 px-1.5 py-0 text-[10px]"
          >
            {shortlistedByMe.length}
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('by_them')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active-press select-none',
            activeTab === 'by_them'
              ? 'bg-white text-[var(--primary)] shadow-sm'
              : 'text-[var(--muted)] hover:text-[var(--foreground)]'
          )}
        >
          <IconSparkles className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Shortlisted You</span>
          <Badge
            tone={activeTab === 'by_them' ? 'accent' : 'neutral'}
            size="sm"
            className="ml-1 px-1.5 py-0 text-[10px]"
          >
            {shortlistedYou.length}
          </Badge>
        </button>
      </div>

      {/* Contextual Spotlight Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#FAF3EC] via-[#FFF9F6] to-[#FFF5F7] p-4 sm:p-5 border border-[#EAD8C7] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-content-appear stagger-2 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#7A1835] to-[#5C1027] text-white shadow-md shrink-0">
            {activeTab === 'by_me' ? (
              <IconBookmark className="h-5 w-5 text-[#D8B28C] fill-current" />
            ) : (
              <IconSparkles className="h-5 w-5 text-[#D8B28C]" />
            )}
          </div>
          <div>
            <h3 className="font-editorial-title text-lg sm:text-xl font-bold text-[#5C1027]">
              {activeTab === 'by_me'
                ? 'Your Curated Candidate Shortlist'
                : 'Members Who Shortlisted Your Profile'}
            </h3>
            <p className="text-xs text-[var(--muted-strong)]">
              {activeTab === 'by_me'
                ? 'Review candidates at your own pace before taking the step to send an interest.'
                : 'These verified members have saved your profile and are interested in your matrimonial journey.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[var(--primary)] border border-[#EAD8C7] shadow-2xs">
            {isLoading
              ? '...'
              : `${activeList.length} ${
                  activeTab === 'by_me' ? 'Profiles Saved' : 'Members Interested'
                }`}
          </span>
        </div>
      </div>

      {/* Search Input Bar */}
      {activeList.length > 0 && !isLoading && (
        <Card className="p-3 sm:p-4 rounded-3xl border-[var(--border)] bg-white shadow-[var(--elevation-card)] animate-content-appear stagger-2">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder={
              activeTab === 'by_me'
                ? 'Search candidates you shortlisted by name, ID, city, or profession...'
                : 'Search members who shortlisted you by name, ID, city, or profession...'
            }
          />
        </Card>
      )}

      {/* Action Error Banner */}
      {actionError && (
        <Card className="p-4 rounded-2xl border-amber-200 bg-amber-50/90 text-amber-950 shadow-sm animate-in fade-in flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <IconAlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-bold">{actionError.message}</p>
              <p className="text-[11px] text-amber-800">
                The profile was preserved in your list. You can retry the removal now.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleRemove(actionError.profile.id)}
              className="rounded-xl text-xs font-bold bg-white border-amber-300 hover:bg-amber-100 shadow-2xs gap-1"
              leftIcon={<IconRefresh className="h-3.5 w-3.5 text-amber-700" />}
            >
              Retry Removal
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActionError(null)}
              className="rounded-xl text-xs text-amber-800 hover:bg-amber-200/50"
            >
              Dismiss
            </Button>
          </div>
        </Card>
      )}

      {/* Error State Banner */}
      {error && !isLoading && (
        <Card className="p-5 rounded-3xl border-rose-200 bg-rose-50/80 text-rose-900 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <IconAlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-rose-900">Unable to load shortlisted profiles</p>
                <p className="text-xs text-rose-700">{error}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchShortlistedData}
              className="self-start sm:self-auto rounded-xl text-xs font-bold gap-1.5 bg-white border-rose-300 hover:bg-rose-100 shadow-2xs"
              leftIcon={<IconRefresh className="h-3.5 w-3.5" />}
            >
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Profiles List */}
      {isLoading ? (
        <div className="space-y-4 animate-content-appear stagger-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-52 w-full skeleton-shimmer rounded-3xl bg-[var(--surface-muted)] border border-[var(--border)]"
            />
          ))}
        </div>
      ) : filteredList.length > 0 ? (
        <div className="space-y-4 animate-content-appear stagger-3">
          {filteredList.map((profile) => (
            <InterestCard
              key={profile.id}
              profile={profile as any}
              type={activeTab === 'by_me' ? 'favorite' : 'shortlisted_you'}
              onRemove={activeTab === 'by_me' ? handleRemove : undefined}
              isRemoving={removingId === profile.id}
              onShortlist={activeTab === 'by_them' ? handleToggleShortlistBack : undefined}
              isShortlisted={shortlistedIds.has(profile.id) || (profile.profileId ? shortlistedIds.has(profile.profileId) : false)}
              onSendInterest={activeTab === 'by_them' ? handleSendInterest : undefined}
              isInterestSent={sentInterestIds.has(profile.id)}
            />
          ))}
        </div>
      ) : searchQuery ? (
        <EmptyState
          title="No matching profiles found"
          description={`None of the profiles in "${
            activeTab === 'by_me' ? 'Shortlisted by You' : 'Shortlisted You'
          }" matched "${searchQuery}".`}
          actionText="Clear Search"
          onAction={() => setSearchQuery('')}
          icon={<IconSearch className="h-10 w-10 text-[var(--primary)]" />}
        />
      ) : activeTab === 'by_me' ? (
        <EmptyState
          title="No shortlisted candidates yet"
          description="You haven't bookmarked any profiles. When browsing matches on Discover, tap the Favorite or Star button on a profile card to shortlist them here."
          actionText="Explore Discover Matches"
          onAction={() => router.push('/app/discover')}
          icon={<IconBookmark className="h-10 w-10 text-[var(--primary)]" />}
        />
      ) : (
        <EmptyState
          title="No one has shortlisted you yet"
          description="Keep your matrimonial profile complete with updated photos and partner preferences to stand out and attract compatible recommendations."
          actionText="Edit Your Profile"
          onAction={() => router.push('/app/profile')}
          icon={<IconUserCheck className="h-10 w-10 text-[var(--primary)]" />}
        />
      )}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <FeatureGate page="favorites" title="Favorites & Shortlist">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-12 w-1/3 bg-stone-200 rounded-2xl skeleton-shimmer" />
            <div className="h-24 w-full bg-stone-200 rounded-3xl skeleton-shimmer" />
            <div className="space-y-4">
              <div className="h-52 w-full bg-stone-200 rounded-3xl skeleton-shimmer" />
              <div className="h-52 w-full bg-stone-200 rounded-3xl skeleton-shimmer" />
            </div>
          </div>
        }
      >
        <FavoritesContent />
      </Suspense>
    </FeatureGate>
  );
}
