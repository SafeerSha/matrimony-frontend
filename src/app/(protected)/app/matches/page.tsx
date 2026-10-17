'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  IconMessageCircle,
  IconArrowLeft,
  IconCompass,
  IconShieldCheck,
  IconUsers,
  IconSparkles,
  IconRefresh,
  IconAlertCircle,
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MutualMatchCard } from '@/components/ui/mutual-match-card';
import { EmptyState } from '@/components/ui/empty-state';
import { FeatureGate } from '@/components/ui/under-development';
import { ProfileCardSkeleton } from '@/components/ui/skeleton';
import { matchesService } from '@/services';
import { useCelebration } from '@/context/celebration-context';
import type { Profile } from '@/lib/demo-data';

function MatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { celebrateMatch } = useCelebration();

  const [matches, setMatches] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const liveMatches = await matchesService.getMutualMatches();
      setMatches(liveMatches);

      // Auto-trigger celebration if ?celebrate=ID query param is present
      const celebrateId = searchParams.get('celebrate');
      if (celebrateId) {
        const target = liveMatches.find((m) => m.id === celebrateId);
        if (target) {
          celebrateMatch({ match: target });
        }
      }
    } catch (err: any) {
      console.error('Error fetching live mutual matches:', err);
      setError(err?.message || 'Failed to load mutual matches. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, celebrateMatch]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleCelebrate = (match: Profile) => {
    celebrateMatch({ match });
  };

  return (
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
        <div className="flex items-center gap-2 shrink-0">
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
      </div>

      {/* Mutual Matches Spotlight Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#FAF3EC] via-[#FFF9F6] to-[#FFF5F7] p-5 sm:p-5 border border-[#EAD8C7] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-content-appear stagger-2 shadow-2xs">
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

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {matches.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleCelebrate(matches[0])}
              className="rounded-full text-xs font-bold bg-white text-[#7A1835] border-[#EAD8C7] hover:bg-[#FAF3EC] shadow-2xs gap-1.5"
              leftIcon={<IconSparkles className="h-3.5 w-3.5 text-[#7A1835]" />}
            >
              Celebrate Latest
            </Button>
          )}

          <span className="rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[var(--primary)] border border-[#EAD8C7] shadow-2xs">
            {isLoading ? '...' : `${matches.length} Connected ${matches.length === 1 ? 'Match' : 'Matches'}`}
          </span>
        </div>
      </div>

      {/* Error State Banner */}
      {error && !isLoading && (
        <Card className="p-5 rounded-3xl border-rose-200 bg-rose-50/70 text-rose-900 shadow-sm animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <IconAlertCircle className="h-6 w-6 text-rose-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-rose-900">Unable to load live mutual matches</p>
                <p className="text-xs text-rose-700">{error}</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchMatches}
              className="self-start sm:self-auto rounded-xl text-xs font-bold gap-1.5 bg-white border-rose-300 hover:bg-rose-100"
              leftIcon={<IconRefresh className="h-3.5 w-3.5" />}
            >
              Retry
            </Button>
          </div>
        </Card>
      )}

      {/* Loading Skeletons State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-content-appear stagger-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-96 rounded-3xl bg-white border border-[#EAD8C7] p-5 space-y-4 skeleton-shimmer">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-stone-200 rounded-full" />
                <div className="h-4 w-16 bg-stone-200 rounded-full" />
              </div>
              <div className="flex justify-center items-center gap-3 py-6">
                <div className="h-16 w-16 rounded-full bg-stone-200" />
                <div className="h-8 w-8 rounded-full bg-stone-200" />
                <div className="h-16 w-16 rounded-full bg-stone-200" />
              </div>
              <div className="h-4 w-3/4 mx-auto bg-stone-200 rounded-full" />
              <div className="h-3 w-1/2 mx-auto bg-stone-200 rounded-full" />
              <div className="pt-4 space-y-2">
                <div className="h-10 w-full bg-stone-200 rounded-2xl" />
                <div className="h-10 w-full bg-stone-200 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : matches.length > 0 ? (
        /* Dedicated Dual-Profile Mutual Match Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-content-appear stagger-3">
          {matches.map((match) => (
            <MutualMatchCard
              key={match.id}
              match={match}
              onCelebrate={handleCelebrate}
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
        /* Empty State */
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

export default function MatchesPage() {
  return (
    <FeatureGate page="matches" title="Mutual Matches">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-12 w-1/3 bg-stone-200 rounded-2xl skeleton-shimmer" />
            <div className="h-24 w-full bg-stone-200 rounded-3xl skeleton-shimmer" />
          </div>
        }
      >
        <MatchesContent />
      </Suspense>
    </FeatureGate>
  );
}
