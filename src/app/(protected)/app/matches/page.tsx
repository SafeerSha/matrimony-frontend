'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconMessageCircle, IconArrowLeft, IconCompass, IconShieldCheck, IconUsers } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MutualMatchCard } from '@/components/ui/mutual-match-card';
import { EmptyState } from '@/components/ui/empty-state';
import { matchesService } from '@/services';
import { profiles as demoProfiles } from '@/lib/demo-data';
import type { Profile } from '@/lib/demo-data';

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Profile[]>([
    demoProfiles[0],
    demoProfiles[1],
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    matchesService
      .getConnections('matches')
      .then((res: any) => {
        const rawList = Array.isArray(res) ? res : res?.data || [];
        if (rawList.length > 0) {
          const mapped: Profile[] = rawList.map((u: any, idx: number) => ({
            id: u.id || `user-${idx}`,
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
          }));
          setMatches(mapped);
        }
      })
      .catch((err) => {
        console.error('Error fetching matches:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 pb-14">
      {/* Top Header */}
      <div className="flex items-end justify-between gap-3">
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
      <div className="rounded-3xl bg-gradient-to-r from-[#FAF3EC] via-[#FFF9F6] to-[#FFF5F7] p-5 sm:p-6 border border-[#EAD8C7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {matches.map((match) => (
            <MutualMatchCard
              key={match.id}
              match={match}
              currentUser={{
                name: 'You',
                image:
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                verified: true,
                city: 'Kochi',
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
  );
}
