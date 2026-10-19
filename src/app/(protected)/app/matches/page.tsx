'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconMessageCircle, IconArrowLeft, IconCompass, IconShieldCheck, IconUsers } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MutualMatchCard } from '@/components/ui/mutual-match-card';
import { EmptyState } from '@/components/ui/empty-state';
import { FeatureGate } from '@/components/ui/under-development';
import { matchesService, authService } from '@/services';
import type { Profile } from '@/lib/demo-data';

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Profile[]>([]);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    authService.getCurrentUser().then((u) => setCurrentUserData(u)).catch(() => {});
    matchesService
      .getConnections('matches')
      .then((res: any) => {
        const rawList = Array.isArray(res) ? res : res?.data || [];
        if (rawList.length > 0) {
          const mapped: Profile[] = rawList.map((u: any, idx: number) => {
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
              id: user.id || u.id || `user-${idx}`,
              profileId: user.profileId || prof.profileId || u.profileId,
              name: fullName,
              age,
              city: prof.city || user.city || 'Location not specified',
              state: prof.state || user.state || prof.country || user.country || '',
              profession: prof.occupation || prof.profession || user.occupation || user.profession || 'Career not specified',
              education: prof.education || user.education || 'Education not specified',
              image: avatar,
              compatibility: u.compatibility ?? user.compatibility ?? prof.compatibility ?? 88,
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
          setMatches(mapped);
        } else {
          setMatches([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching matches:', err);
        setMatches([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <FeatureGate page="matches" title="Mutual Matches">
      <div className="space-y-6 pb-14">
        {/* Top Header */}
        <div className="flex items-end justify-between gap-3 animate-content-appear stagger-1">
          <div className="min-w-0">
            <div className="mb-1 sm:mb-1.5 flex items-center gap-1.5 sm:gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shrink-0" aria-hidden="true" />
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)]">
                Connections
              </p>
            </div>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)] font-editorial-title leading-tight truncate">
              Mutual Matches
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

        {/* Mutual Matches Spotlight Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#FAF3EC] via-[#FFF9F6] to-[#FFF5F7] p-5 sm:p-4 border border-[#EAD8C7] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-content-appear stagger-2">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#7A1835] to-[#5C1027] text-white shadow-md shrink-0">
              <IconUsers className="h-6 w-6 text-[#D8B28C]" />
            </div>
            <div>
              <h3 className="font-editorial-title text-xl font-bold text-[#5C1027]">
                Mutual Connections
              </h3>
              <p className="text-xs text-[var(--muted-strong)]">
                Direct chat and communication channels are officially open between you both.
              </p>
            </div>
          </div>

          <span className="rounded-full bg-white px-3.5 py-1 text-xs font-bold text-[var(--primary)] border border-[#EAD8C7] shadow-2xs self-start sm:self-auto">
            {matches.length} Connected {matches.length === 1 ? 'Match' : 'Matches'}
          </span>
        </div>

        {/* Dedicated Dual-Profile Mutual Match Cards (Profile A + Profile B) */}
        {matches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-content-appear stagger-3">
            {matches.map((match) => (
              <MutualMatchCard
                key={match.id}
                match={match}
                currentUser={{
                  name: currentUserData?.name || `${currentUserData?.firstName || ''} ${currentUserData?.lastName || ''}`.trim() || 'You',
                  image: currentUserData?.avatarUrl || currentUserData?.photos?.[0]?.url || currentUserData?.profile?.photos?.[0]?.url || '',
                  verified: Boolean(currentUserData?.isVerified ?? true),
                  city: currentUserData?.profile?.city || currentUserData?.city || '',
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Your next connection could be waiting"
            description="Mutual matches occur when both members express interest in each other. When a mutual match happens, your connection card and conversation appear here."
            actionText="Discover Profiles"
            onAction={() => router.push('/app/discover')}
            tip="Responding promptly to incoming interest requests increases connection rates significantly."
          />
        )}
      </div>
    </FeatureGate>
  );
}
