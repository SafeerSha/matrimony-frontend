'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconBookmark, IconCompass } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { InterestCard } from '@/components/ui/interest-card';
import { EmptyState } from '@/components/ui/empty-state';
import { FeatureGate } from '@/components/ui/under-development';
import { matchesService } from '@/services';
import type { Profile } from '@/lib/demo-data';

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    matchesService
      .getConnections('shortlisted')
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        const mapped: Profile[] = list.map((u: any, idx: number) => {
          const user = u.partner || u.receiver || u.sender || u;
          const prof = user.profile || u.profile || {};
          const photos = user.photos || prof.photos || u.photos || [];

          const firstName = user.firstName || prof.firstName || '';
          const lastName = user.lastName || prof.lastName || '';
          const fullName = user.name || `${firstName} ${lastName}`.trim() || 'Verified Member';

          const birthDate = prof.dateOfBirth || user.dateOfBirth || u.dateOfBirth;
          const age = birthDate
            ? Math.floor((new Date().getTime() - new Date(birthDate).getTime()) / 31557600000)
            : prof.age || user.age || 26;

          const avatar = photos?.[0]?.url || prof.image || user.image || '';

          return {
            id: user.id || u.id || `fav-${idx}`,
            profileId: user.profileId || prof.profileId || u.profileId,
            name: fullName,
            age,
            city: prof.city || user.city || 'Location not specified',
            state: prof.state || user.state || prof.country || user.country || '',
            profession: prof.occupation || prof.profession || user.occupation || user.profession || 'Career not specified',
            education: prof.education || user.education || 'Education not specified',
            image: avatar,
            compatibility: prof.compatibility || 88,
            verified: Boolean(user.status === 'ACTIVE' || prof.isVerified || user.isVerified),
            online: false,
            about: prof.bio || prof.about || '',
            height: prof.height ? `${prof.height}cm` : '',
            maritalStatus: prof.maritalStatus || '',
            religion: prof.religion || '',
            motherTongue: prof.motherTongue || '',
            family: prof.family || '',
            lifestyle: Array.isArray(prof.lifestyle) ? prof.lifestyle : [],
            interests: Array.isArray(prof.interests) ? prof.interests : [],
            lookingFor: prof.lookingFor || '',
          };
        });
        setFavorites(mapped);
      })
      .catch((err) => {
        console.error('Error fetching favorites:', err);
        setFavorites([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <FeatureGate page="favorites" title="Favorites & Shortlist">
      <div className="space-y-6 pb-14">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-content-appear stagger-1">
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
        <div className="space-y-4 animate-content-appear stagger-2">
           {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 w-full skeleton-shimmer rounded-3xl bg-[var(--surface-muted)]" />
           ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="space-y-4 animate-content-appear stagger-2">
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
    </FeatureGate>
  );
}
