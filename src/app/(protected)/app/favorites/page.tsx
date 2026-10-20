'use client';

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconBookmark,
  IconCompass,
  IconRefresh,
  IconAlertCircle,
  IconSearch,
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SearchInput } from '@/components/ui/input';
import { InterestCard } from '@/components/ui/interest-card';
import { EmptyState } from '@/components/ui/empty-state';
import { FeatureGate } from '@/components/ui/under-development';
import { matchesService, profileService } from '@/services';
import { toast } from '@/lib/toast';
import type { Profile } from '@/lib/demo-data';

function FavoritesContent() {
  const router = useRouter();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [shortlistedByMe, setShortlistedByMe] = useState<Profile[]>([]);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionError, setActionError] = useState<{
    message: string;
    profile: Profile;
  } | null>(null);

  // Fetch user's shortlisted profiles
  const fetchShortlistedData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('ishtam_shortlisted_ids');
        } catch {}
      }

      const [byMeResult, meProfileResult] = await Promise.allSettled([
        matchesService.getShortlistedProfiles('by_me'),
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

      let byMeList: Profile[] = [];
      if (byMeResult.status === 'fulfilled' && Array.isArray(byMeResult.value)) {
        byMeList = [...byMeResult.value];
      }

      const userStorageKey = uid ? `ishtam_shortlisted_${uid}_by_me` : null;
      const localIdSet = new Set<string>();

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

  // Remove profile from shortlist
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
        `${profileToRemove.name} has been removed from your shortlist.`
      );
    } catch (err: any) {
      console.error('Error removing shortlisted profile:', err);

      // Revert optimistic update
      setShortlistedByMe(previousList);
      setShortlistedIds((prev) => {
        const next = new Set(prev);
        next.add(targetId);
        if (profileToRemove.profileId) next.add(profileToRemove.profileId);
        return next;
      });

      const errorMessage =
        err?.message ||
        'Could not remove from shortlist. Please verify your connection and try again.';

      setActionError({
        message: errorMessage,
        profile: profileToRemove,
      });

      toast.error('Action Failed', errorMessage);
    } finally {
      setRemovingId(null);
    }
  };

  // Filter list by search query
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return shortlistedByMe;
    const q = searchQuery.toLowerCase();
    return shortlistedByMe.filter((p) =>
      `${p.id} ${p.profileId || ''} ${p.name} ${p.city} ${p.profession} ${p.education || ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [shortlistedByMe, searchQuery]);

  return (
    <div className="space-y-5 pb-14">
      {/* Minimal Top Header */}
      <div className="flex items-center justify-between gap-3 animate-content-appear stagger-1">
        <div className="min-w-0">
          <div className="mb-1 sm:mb-1.5 flex items-center gap-1.5 sm:gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shrink-0" aria-hidden="true" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)]">
              Connections
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[var(--foreground)] font-editorial-title">
              Favorites
            </h1>
            {!isLoading && shortlistedByMe.length > 0 && (
              <span className="grid h-6 min-w-6 place-items-center rounded-full bg-[var(--primary)] px-2 text-xs font-bold text-white shadow-2xs">
                {shortlistedByMe.length}
              </span>
            )}
          </div>
        </div>

        {/* Discovery Action Button */}
        <Link href="/app/discover" className="focus-ring shrink-0">
          <Button
            variant="secondary"
            size="md"
            className="rounded-2xl text-xs font-bold gap-1.5 active-press h-9 sm:h-10 px-3.5 sm:px-4"
            leftIcon={<IconCompass className="h-4 w-4 text-[var(--primary)] shrink-0" />}
          >
            <span>Discover Profiles</span>
          </Button>
        </Link>
      </div>

      {/* Minimal Search Input */}
      {shortlistedByMe.length > 0 && !isLoading && (
        <div className="animate-content-appear stagger-2">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="Search favorites by name, city, or profession..."
          />
        </div>
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
              type="favorite"
              onRemove={handleRemove}
              isRemoving={removingId === profile.id}
              isShortlisted={true}
            />
          ))}
        </div>
      ) : searchQuery ? (
        <EmptyState
          title="No matching profiles found"
          description={`No favorite profiles matched "${searchQuery}".`}
          actionText="Clear Search"
          onAction={() => setSearchQuery('')}
          icon={<IconSearch className="h-10 w-10 text-[var(--primary)]" />}
        />
      ) : (
        <EmptyState
          title="No favorites saved yet"
          description="Browse profiles on Discover and tap the bookmark or star button to save profiles here for easy review."
          actionText="Explore Discover Matches"
          onAction={() => router.push('/app/discover')}
          icon={<IconBookmark className="h-10 w-10 text-[var(--primary)]" />}
        />
      )}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <FeatureGate page="favorites" title="Favorites">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-10 w-40 bg-stone-200 rounded-2xl skeleton-shimmer" />
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
