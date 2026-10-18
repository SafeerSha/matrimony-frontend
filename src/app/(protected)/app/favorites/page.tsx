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
  IconStar,
  IconUsers,
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/input';
import { InterestCard } from '@/components/ui/interest-card';
import { EmptyState } from '@/components/ui/empty-state';
import { FeatureGate } from '@/components/ui/under-development';
import { matchesService } from '@/services';
import { toast } from '@/lib/toast';
import { profiles as demoProfiles, type Profile } from '@/lib/demo-data';

function FavoritesContent() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionError, setActionError] = useState<{
    message: string;
    profile: Profile;
  } | null>(null);

  // Fetch shortlisted profiles from live matchesService with resilient session sync
  const fetchShortlisted = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await matchesService.getShortlistedProfiles();
      let combined = Array.isArray(data) ? [...data] : [];

      // Merge any shortlisted profiles saved in the browser session
      if (typeof window !== 'undefined') {
        try {
          const localStored = JSON.parse(localStorage.getItem('ishtam_shortlisted_ids') || '[]');
          if (Array.isArray(localStored) && localStored.length > 0) {
            localStored.forEach((id: string) => {
              if (!combined.some((p) => p.id === id || p.profileId === id)) {
                const found = demoProfiles.find((p) => p.id === id || p.profileId === id);
                if (found) combined.push(found);
              }
            });
          }
        } catch {}
      }

      setFavorites(combined);
    } catch (err: any) {
      console.error('Error fetching shortlisted profiles:', err);

      // Gracefully recover via browser session shortlist if API was temporarily unreachable
      if (typeof window !== 'undefined') {
        try {
          const localStored = JSON.parse(localStorage.getItem('ishtam_shortlisted_ids') || '[]');
          if (Array.isArray(localStored) && localStored.length > 0) {
            const localProfiles = localStored
              .map((id: string) => demoProfiles.find((p) => p.id === id || p.profileId === id))
              .filter(Boolean) as Profile[];
            if (localProfiles.length > 0) {
              setFavorites(localProfiles);
              setIsLoading(false);
              return;
            }
          }
        } catch {}
      }

      setError(
        err?.message ||
          'Failed to load shortlisted profiles. Please check your internet connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShortlisted();
  }, [fetchShortlisted]);

  // Remove profile from shortlist with optimistic UI update and error rollback + retry
  const handleRemove = async (targetId: string) => {
    const profileToRemove = favorites.find((p) => p.id === targetId);
    if (!profileToRemove) return;

    // Save previous state for potential rollback
    const previousFavorites = [...favorites];

    // Optimistically update the UI immediately (AC-2)
    setFavorites((prev) => prev.filter((p) => p.id !== targetId));
    setRemovingId(targetId);
    setActionError(null);

    toast.info(
      'Removing from Shortlist',
      `Removing ${profileToRemove.name} from your shortlist...`
    );

    try {
      if (typeof window !== 'undefined') {
        try {
          const localStored = JSON.parse(localStorage.getItem('ishtam_shortlisted_ids') || '[]');
          localStorage.setItem(
            'ishtam_shortlisted_ids',
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

      // Roll back the optimistic update immediately (AC-2 & AC-3)
      setFavorites(previousFavorites);

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

  // Filter shortlisted profiles by search query
  const filteredFavorites = useMemo(() => {
    if (!searchQuery.trim()) return favorites;
    const q = searchQuery.toLowerCase();
    return favorites.filter((p) =>
      `${p.id} ${p.profileId || ''} ${p.name} ${p.city} ${p.profession} ${p.education || ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [favorites, searchQuery]);

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
              Shortlist
            </p>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)] font-editorial-title leading-tight truncate">
            Favorites & Shortlist
          </h1>
          <p className="mt-1.5 text-sm text-[var(--muted-strong)]">
            Verified matrimonial profiles you have bookmarked for careful consideration.
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

      {/* Shortlist Spotlight & Stats Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#FAF3EC] via-[#FFF9F6] to-[#FFF5F7] p-4 sm:p-5 border border-[#EAD8C7] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-content-appear stagger-2 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#7A1835] to-[#5C1027] text-white shadow-md shrink-0">
            <IconBookmark className="h-5 w-5 text-[#D8B28C] fill-current" />
          </div>
          <div>
            <h3 className="font-editorial-title text-lg sm:text-xl font-bold text-[#5C1027]">
              Curated Candidate Shortlist
            </h3>
            <p className="text-xs text-[var(--muted-strong)]">
              Review profiles at your own pace before taking the step to send an interest.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[var(--primary)] border border-[#EAD8C7] shadow-2xs">
            {isLoading
              ? '...'
              : `${favorites.length} Shortlisted ${favorites.length === 1 ? 'Profile' : 'Profiles'}`}
          </span>
        </div>
      </div>

      {/* Search Input Bar */}
      {favorites.length > 0 && !isLoading && (
        <Card className="p-3 sm:p-4 rounded-3xl border-[var(--border)] bg-white shadow-[var(--elevation-card)] animate-content-appear stagger-2">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="Search your shortlisted profiles by name, ID, profession, or city..."
          />
        </Card>
      )}

      {/* Action Error Banner (e.g. Removal Action Failed with Retry CTA) - AC-3 */}
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

      {/* Data Fetch Error State Banner - AC-3 */}
      {error && !isLoading && (
        <Card className="p-5 rounded-3xl border-rose-200 bg-rose-50/80 text-rose-900 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <IconAlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-rose-900">
                  Unable to load shortlisted profiles
                </p>
                <p className="text-xs text-rose-700">{error}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchShortlisted}
              className="self-start sm:self-auto rounded-xl text-xs font-bold gap-1.5 bg-white border-rose-300 hover:bg-rose-100 shadow-2xs"
              leftIcon={<IconRefresh className="h-3.5 w-3.5" />}
            >
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Grid of Favorited / Shortlisted Profiles */}
      {isLoading ? (
        <div className="space-y-4 animate-content-appear stagger-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-52 w-full skeleton-shimmer rounded-3xl bg-[var(--surface-muted)] border border-[var(--border)]"
            />
          ))}
        </div>
      ) : filteredFavorites.length > 0 ? (
        <div className="space-y-4 animate-content-appear stagger-3">
          {filteredFavorites.map((profile) => (
            <InterestCard
              key={profile.id}
              profile={profile as any}
              type="favorite"
              onRemove={handleRemove}
              isRemoving={removingId === profile.id}
            />
          ))}
        </div>
      ) : searchQuery ? (
        /* Search Query No-match State */
        <EmptyState
          title="No matching profiles found"
          description={`None of your shortlisted profiles matched "${searchQuery}". Clear your search query to see all bookmarked candidates.`}
          actionText="Clear Search"
          onAction={() => setSearchQuery('')}
          icon={<IconSearch className="h-10 w-10 text-[var(--primary)]" />}
        />
      ) : (
        /* Empty State */
        <EmptyState
          title="No favorites yet"
          description="You haven't bookmarked any profiles. When you see a profile you like but aren't ready to send an interest, tap the heart or bookmark icon to save it here."
          actionText="Explore Profiles"
          onAction={() => router.push('/app/discover')}
          icon={<IconBookmark className="h-10 w-10 text-[var(--primary)]" />}
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
