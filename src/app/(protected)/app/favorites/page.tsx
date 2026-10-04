'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconBookmark, IconCompass } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { InterestCard } from '@/components/ui/interest-card';
import { EmptyState } from '@/components/ui/empty-state';
import { profiles as demoProfiles } from '@/lib/demo-data';
import type { Profile } from '@/lib/demo-data';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // Simulate fetching favorite profiles (just picking some from demo data)
    setTimeout(() => {
      setFavorites([demoProfiles[1], demoProfiles[3], demoProfiles[5]].filter(Boolean));
      setIsLoading(false);
    }, 600);
  }, []);

  return (
    <div className="space-y-6 pb-14">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-1 sm:mb-1.5 flex items-center gap-1.5 sm:gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shrink-0" aria-hidden="true" />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)]">
              Shortlist
            </p>
          </div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)] font-editorial-title leading-tight truncate">
            Favorites
          </h1>
          <p className="mt-1.5 text-sm text-[var(--muted-strong)]">
            Profiles you've bookmarked for later consideration.
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

      {/* Grid of Favorited Profiles */}
      {isLoading ? (
        <div className="space-y-4">
           {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 w-full animate-pulse rounded-3xl bg-[var(--surface-muted)]" />
           ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="space-y-4">
          {favorites.map((profile) => (
            <InterestCard
              key={profile.id}
              profile={profile as any}
              type="favorite"
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No favorites yet"
          description="You haven't bookmarked any profiles. When you see a profile you like but aren't ready to send an interest, tap the heart icon to save it here."
          actionText="Explore Profiles"
          onAction={() => router.push('/app/discover')}
          icon={<IconBookmark className="h-10 w-10 text-[var(--primary)]" />}
        />
      )}
    </div>
  );
}
