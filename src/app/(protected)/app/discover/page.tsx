'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconSearch,
  IconAdjustments,
  IconHeart,
  IconX,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconMapPin,
  IconBriefcase,
  IconSchool,
  IconShieldCheck,
  IconRefresh,
  IconLayoutGrid,
  IconStack2 as IconLayers,
  IconArrowRight,
  IconFilter,
  IconUsers,
  IconMessageCircleFilled,
  IconStarFilled,
} from '@tabler/icons-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { SearchInput, Select } from '@/components/ui/input';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionHeader } from '@/components/ui/section-header';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { ProfileCardSkeleton } from '@/components/ui/skeleton';
import { matchesService } from '@/services';
import { profiles as demoProfiles } from '@/lib/demo-data';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import { SwipeCard } from '@/components/discovery/swipe-card';
import type { Profile } from '@/lib/demo-data';

export type DiscoveryViewMode = 'swipe' | 'grid';
export type SortOption = 'recommended' | 'recent' | 'new' | 'nearby';

export default function DiscoverPage() {
  const router = useRouter();
  // Discovery view mode: 'swipe' on mobile by default, 'grid' on desktop
  const [viewMode, setViewMode] = useState<DiscoveryViewMode>('swipe');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setViewMode('grid');
    }
  }, []);

  // Search & Sorting
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');

  // Featured Card View active index
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Filters State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [city, setCity] = useState('All locations');
  const [minAge, setMinAge] = useState(21);
  const [maxAge, setMaxAge] = useState(35);
  const [selectedGender, setSelectedGender] = useState<'any' | 'women' | 'men'>('any');
  const [selectedReligion, setSelectedReligion] = useState<string>('Any');
  const [selectedCaste, setSelectedCaste] = useState<string>('Any');
  const [selectedEducation, setSelectedEducation] = useState<string>('Any');
  const [selectedProfession, setSelectedProfession] = useState<string>('Any');
  const [selectedIncome, setSelectedIncome] = useState<string>('Any');
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState<string>('Any');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Any');
  const [selectedIntent, setSelectedIntent] = useState<string>('Any');

  // Shortlist and Interest tracking sets
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [sentInterestIds, setSentInterestIds] = useState<Set<string>>(new Set());

  // Profiles data & loading
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profiles based on filters
  useEffect(() => {
    setIsLoading(true);
    matchesService
      .searchProfiles({
        city: city === 'All locations' ? undefined : city,
        minAge,
        maxAge,
        religion: selectedReligion === 'Any' ? undefined : selectedReligion,
        maritalStatus: selectedMaritalStatus === 'Any' ? undefined : selectedMaritalStatus,
      })
      .then((res: any) => {
        const rawList = Array.isArray(res) ? res : res?.data || [];
        if (rawList.length > 0) {
          const mapped: Profile[] = rawList.map((u: any, idx: number) => ({
            id: u.id || `profile-${idx}`,
            name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Member',
            age: u.dateOfBirth
              ? Math.floor((new Date().getTime() - new Date(u.dateOfBirth).getTime()) / 31557600000)
              : minAge + (idx % (maxAge - minAge + 1)),
            city: u.city || 'Kochi',
            state: u.country || 'Kerala',
            profession: u.occupation || 'Professional',
            education: u.education || 'Graduate',
            image:
              (u.photos?.[0]?.url) ||
              (u.profile?.photos?.[0]?.url) ||
              `https://i.pravatar.cc/800?u=${encodeURIComponent(
                (u.firstName || u.lastName || u.email || u.id || `user-${idx}`).toString()
              )}`,
            compatibility: Math.floor(Math.random() * 18) + 82,
            verified: u.isVerified ?? true,
            online: idx % 2 === 0,
            about: u.bio || demoProfiles[idx % demoProfiles.length]?.about || '',
            height: u.height ? `${u.height}cm` : "5'5\"",
            maritalStatus: u.maritalStatus || 'Never married',
            religion: u.religion || 'Not specified',
            motherTongue: 'Malayalam',
            family: 'Close-knit family based in South India.',
            lifestyle: ['Non-smoker', 'Vegetarian'],
            interests: ['Design', 'Travel', 'Music', 'IconCoffee'],
            lookingFor: 'A kind, emotionally mature partner.',
          }));
          setProfiles(mapped);
        } else {
          // Graceful fallback to demoProfiles for rich visual testing
          setProfiles(demoProfiles);
        }
      })
      .catch((err) => {
        console.error('Error fetching profiles:', err);
        setProfiles(demoProfiles);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [city, minAge, maxAge, selectedReligion, selectedMaritalStatus]);

  // Filter & Sort computation
  const filteredProfiles = useMemo(() => {
    return profiles
      .filter((p) => {
        const matchesQuery = query.trim()
          ? `${p.id} ${p.name} ${p.city} ${p.profession} ${p.education}`
            .toLowerCase()
            .includes(query.toLowerCase())
          : true;

        const matchesCity = city === 'All locations' || p.city.toLowerCase() === city.toLowerCase();
        const matchesAge = p.age >= minAge && p.age <= maxAge;
        const matchesReligion =
          selectedReligion === 'Any' ||
          (p.religion && p.religion.toLowerCase() === selectedReligion.toLowerCase());
        const matchesMaritalStatus =
          selectedMaritalStatus === 'Any' ||
          (p.maritalStatus && p.maritalStatus.toLowerCase().includes(selectedMaritalStatus.toLowerCase()));
        const matchesProfession =
          selectedProfession === 'Any' ||
          p.profession.toLowerCase().includes(selectedProfession.toLowerCase());
        const matchesEducation =
          selectedEducation === 'Any' ||
          p.education.toLowerCase().includes(selectedEducation.toLowerCase());
        const matchesLanguage =
          selectedLanguage === 'Any' ||
          (p.motherTongue && p.motherTongue.toLowerCase() === selectedLanguage.toLowerCase());

        return (
          matchesQuery &&
          matchesCity &&
          matchesAge &&
          matchesReligion &&
          matchesMaritalStatus &&
          matchesProfession &&
          matchesEducation &&
          matchesLanguage
        );
      })
      .sort((a, b) => {
        if (sortBy === 'recommended') return (b.compatibility || 0) - (a.compatibility || 0);
        if (sortBy === 'recent') return (b.online ? 1 : 0) - (a.online ? 1 : 0);
        if (sortBy === 'new') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [
    profiles,
    query,
    city,
    minAge,
    maxAge,
    selectedReligion,
    selectedMaritalStatus,
    selectedProfession,
    selectedEducation,
    selectedLanguage,
    sortBy,
  ]);

  // Calculate active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (city !== 'All locations') count++;
    if (minAge !== 21 || maxAge !== 35) count++;
    if (selectedGender !== 'any') count++;
    if (selectedReligion !== 'Any') count++;
    if (selectedCaste !== 'Any') count++;
    if (selectedEducation !== 'Any') count++;
    if (selectedProfession !== 'Any') count++;
    if (selectedIncome !== 'Any') count++;
    if (selectedMaritalStatus !== 'Any') count++;
    if (selectedLanguage !== 'Any') count++;
    if (selectedIntent !== 'Any') count++;
    return count;
  }, [
    city,
    minAge,
    maxAge,
    selectedGender,
    selectedReligion,
    selectedCaste,
    selectedEducation,
    selectedProfession,
    selectedIncome,
    selectedMaritalStatus,
    selectedLanguage,
    selectedIntent,
  ]);

  const handleResetFilters = () => {
    setQuery('');
    setCity('All locations');
    setMinAge(21);
    setMaxAge(35);
    setSelectedGender('any');
    setSelectedReligion('Any');
    setSelectedCaste('Any');
    setSelectedEducation('Any');
    setSelectedProfession('Any');
    setSelectedIncome('Any');
    setSelectedMaritalStatus('Any');
    setSelectedLanguage('Any');
    setSelectedIntent('Any');
    setIsFilterOpen(false);
    toast.info('Filters Reset', 'Showing all available matrimonial recommendations.');
  };

  const handleSendInterest = async (id: string, name: string) => {
    try {
      await matchesService.sendInterest(id);
      setSentInterestIds((prev) => new Set(prev).add(id));
      toast.success('Interest Sent!', `We have notified ${name} of your interest.`);
    } catch {
      setSentInterestIds((prev) => new Set(prev).add(id));
      toast.success('Interest Sent!', `We have notified ${name} of your interest.`);
    }
  };

  const handleShortlist = async (id: string, name: string) => {
    const isShortlisted = shortlistedIds.has(id);
    try {
      await matchesService.shortlistProfile(id);
      setShortlistedIds((prev) => {
        const next = new Set(prev);
        if (isShortlisted) next.delete(id);
        else next.add(id);
        return next;
      });
      toast.success(
        isShortlisted ? 'Removed from Favorites' : 'Profile Favorited',
        `${name} has been ${isShortlisted ? 'removed from' : 'added to'} your favorites.`
      );
    } catch {
      setShortlistedIds((prev) => {
        const next = new Set(prev);
        if (isShortlisted) next.delete(id);
        else next.add(id);
        return next;
      });
      toast.success('Profile Favorited', `${name} added to your favorites.`);
    }
  };

  // Safe index for Featured View
  const safeFeaturedProfile =
    filteredProfiles.length > 0
      ? filteredProfiles[Math.min(featuredIndex, filteredProfiles.length - 1)]
      : null;

  const renderCardOverlay = (profile: Profile, triggerSwipe?: (dir: 'left' | 'right') => void) => (
    <>
      {/* Top Badges */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10 pointer-events-auto">
        {profile.online && (
          <Badge
            tone="neutral"
            size="sm"
            dot
            dotColor="bg-emerald-500"
            className="bg-white/90 backdrop-blur-md text-[var(--foreground)] border-white/80"
          >
            Online
          </Badge>
        )}
      </div>

      {/* Identity & Action Overlay on Photo */}
      <div 
        className="absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8 text-white z-10 space-y-2 pointer-events-auto cursor-pointer"
        onClick={() => router.push(`/app/profile?user=${profile.id}`)}
      >
        <div className="group/name flex items-center gap-2.5">
          <h2 className="font-editorial-title text-3xl sm:text-4xl font-bold tracking-tight text-white drop-shadow-sm group-hover/name:text-[var(--accent-light)] transition-colors">
            {profile.name}, {profile.age}
          </h2>
          {profile.verified && (
            <VerificationBadge type="general" showIconOnly size="md" />
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-white/90">
          <span>{profile.education}</span>
          <span>•</span>
          <span>{profile.profession}</span>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-white/90 font-medium">
          <IconMapPin className="h-4 w-4 text-[var(--accent)] shrink-0" />
          <span>
            {profile.city}, {profile.state}
          </span>
        </p>

        {/* Matrimonial Discovery Actions Floating in Overlay */}
        <div 
          className="w-full pt-3 flex items-center justify-between gap-2 sm:gap-3"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Pass button: Highlighted 360° circle */}
          <Button
            variant="secondary"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              if (triggerSwipe) {
                triggerSwipe('left');
              } else {
                setFeaturedIndex((prev) =>
                  prev < filteredProfiles.length - 1 ? prev + 1 : 0
                );
              }
            }}
            className="rounded-full aspect-square h-12 w-12 sm:h-14 sm:w-14 shrink-0 p-0 flex items-center justify-center bg-white/95 backdrop-blur-md text-rose-600 border border-white/70 hover:bg-white hover:scale-110 active-press shadow-lg hover:shadow-xl transition-all"
            title="Pass"
          >
            <IconX className="h-6 w-6 sm:h-6.5 sm:w-6.5 stroke-[2.3]" />
          </Button>

          {/* Chat button: flex-1 end-to-end */}
          <Link
            href={`/app/messages?user=${profile.id}`}
            className="flex-1 min-w-0 focus-ring rounded-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="secondary"
              size="md"
              className="w-full h-10 sm:h-11 rounded-full bg-white/95 backdrop-blur-md text-[var(--foreground)] border border-white/60 shadow-md hover:bg-white hover:scale-[1.02] active-press flex items-center justify-center gap-1.5 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold"
              leftIcon={<IconMessageCircleFilled className="h-4 w-4 text-[var(--primary)] shrink-0" />}
            >
              <span className="whitespace-nowrap">Chat</span>
            </Button>
          </Link>

          {/* Favorite button: flex-1 end-to-end */}
          <Button
            variant={
              shortlistedIds.has(profile.id) ? 'primary' : 'outline'
            }
            size="md"
            onClick={(e) => {
              e.stopPropagation();
              handleShortlist(profile.id, profile.name);
            }}
            className={cn(
              'flex-1 min-w-0 h-10 sm:h-11 rounded-full border shadow-md active-press transition-all flex items-center justify-center gap-1.5 px-2.5 sm:px-3 text-xs sm:text-sm font-semibold',
              shortlistedIds.has(profile.id)
                ? 'bg-[var(--primary)] text-white border-transparent hover:brightness-110'
                : 'bg-white/95 backdrop-blur-md text-[var(--foreground)] border border-white/60 hover:bg-white hover:scale-[1.02]'
            )}
            leftIcon={
              <IconStarFilled
                className={cn(
                  'h-4 w-4 shrink-0',
                  shortlistedIds.has(profile.id)
                    ? 'text-white'
                    : 'text-[var(--primary)]'
                )}
              />
            }
          >
            <span className="whitespace-nowrap">
              {shortlistedIds.has(profile.id) ? 'Favorited' : 'Favorite'}
            </span>
          </Button>

          {/* Send Interest button: Highlighted 360° circle */}
          <Button
            variant="secondary"
            size="icon"
            disabled={sentInterestIds.has(profile.id)}
            onClick={(e) => {
              e.stopPropagation();
              if (triggerSwipe) {
                triggerSwipe('right');
              } else {
                handleSendInterest(profile.id, profile.name);
                setFeaturedIndex((prev) =>
                  prev < filteredProfiles.length - 1 ? prev + 1 : 0
                );
              }
            }}
            className="rounded-full aspect-square h-12 w-12 sm:h-14 sm:w-14 shrink-0 p-0 flex items-center justify-center bg-white/95 backdrop-blur-md text-rose-600 border border-white/70 hover:bg-white hover:scale-110 active-press shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
            title="Send Interest"
          >
            <IconHeart className="h-6 w-6 sm:h-6.5 sm:w-6.5 fill-rose-600" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-3.5 sm:space-y-6 pb-3 sm:pb-12">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & VIEW MODE CONTROLS                       */}
      {/* ======================================================== */}
      <div className="flex flex-col gap-2.5 sm:gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="Discovery"
          title="Explore verified profiles"
        />

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
          {/* View Switcher: Mobile only (Desktop defaults to grid, no featured layout) */}
          <div className="md:hidden flex items-center bg-[var(--surface-muted)] p-1 rounded-2xl border border-[var(--border)]">
            <button
              type="button"
               onClick={() => setViewMode('swipe')}
               aria-pressed={viewMode === 'swipe'}
               className={cn(
                 'focus-ring flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active-press select-none',
                 viewMode === 'swipe'
                  ? 'bg-white text-[var(--primary)] shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              )}
            >
              <IconLayers className="h-4 w-4" />
              <span>Swipe</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              className={cn(
                'focus-ring flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active-press select-none',
                viewMode === 'grid'
                  ? 'bg-white text-[var(--primary)] shadow-xs'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              )}
            >
              <IconLayoutGrid className="h-4 w-4" />
              <span>Grid</span>
            </button>
          </div>

          {/* Search & Filters Trigger Button */}
          <Button
            variant={activeFiltersCount > 0 || query ? 'primary' : 'secondary'}
            onClick={() => setIsFilterOpen(true)}
            className="h-[36px] px-4 rounded-xl text-xs font-bold gap-2 active-press shadow-[var(--elevation-card)]"
            leftIcon={<IconAdjustments className="h-3.5 w-3.5" />}
          >
            <span>Search & Filters</span>
            {(activeFiltersCount > 0 || query) && (
              <span className="grid h-4 w-4 place-items-center rounded-full bg-white text-[var(--primary)] text-[9px] font-bold">
                {activeFiltersCount + (query ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Active Filter Chips Summary bar (Moved up from old card) */}
      {(activeFiltersCount > 0 || query) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-[var(--muted)]">Active:</span>
          {query && (
            <Chip size="sm" onRemove={() => setQuery('')}>
              Search: "{query}"
            </Chip>
          )}
          {city !== 'All locations' && (
            <Chip size="sm" onRemove={() => setCity('All locations')}>
              {city}
            </Chip>
          )}
          {(minAge !== 21 || maxAge !== 35) && (
            <Chip size="sm" onRemove={() => { setMinAge(21); setMaxAge(35); }}>
              {minAge}–{maxAge} yrs
            </Chip>
          )}
          {selectedReligion !== 'Any' && (
            <Chip size="sm" onRemove={() => setSelectedReligion('Any')}>
              {selectedReligion}
            </Chip>
          )}
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[11px] font-bold text-[var(--primary)] hover:underline ml-2"
          >
            Reset all
          </button>
        </div>
      )}

      {/* Profile Counts Status */}
      {/* <div className="flex items-center justify-between px-1 text-xs text-[var(--muted)] font-medium">
        <p>
          Showing <span className="font-bold text-[var(--foreground)]">{filteredProfiles.length}</span>{' '}
          profiles matching your search
        </p>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-full px-2.5 py-0.5 font-semibold text-[11px]">
          <IconShieldCheck className="h-3.5 w-3.5" /> 100% Privacy Protected
        </span>
      </div> */}

      {/* ======================================================== */}
      {/* 3. DISCOVERY MODES                                       */}
      {/* ======================================================== */}

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProfileCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProfiles.length === 0 ? (
        /* Empty State */
        <EmptyState
          title="No profiles match those criteria"
          description="We couldn't find anyone matching your exact combination of filters. Try widening your age range or clearing location filters to discover more people."
          actionText="Reset Filters"
          onAction={handleResetFilters}
          tip="Expanding your age preference by 2 years can reveal up to 40% more compatible matches."
        />
      ) : (
        <>
          {/* ======================================================== */}
          {/* FEATURED / CARD VIEW MODE (Mobile only)                  */}
          {/* ======================================================== */}
          {viewMode === 'swipe' && safeFeaturedProfile && (
            <div className="block md:hidden max-w-2xl mx-auto space-y-2 sm:space-y-4">
            {/* Top Navigation Bar: Previous / Next & Counter */}
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold tracking-wider uppercase text-[var(--muted)]">
                {/* Profile {featuredIndex + 1} of {filteredProfiles.length} */}
              </span>

              <div className="flex items-center gap-2 hidden">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={featuredIndex === 0}
                  onClick={() => setFeaturedIndex((prev) => Math.max(0, prev - 1))}
                  className="rounded-full px-3 text-xs"
                  leftIcon={<IconChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={featuredIndex >= filteredProfiles.length - 1}
                  onClick={() =>
                    setFeaturedIndex((prev) => Math.min(filteredProfiles.length - 1, prev + 1))
                  }
                  className="rounded-full px-3 text-xs"
                  rightIcon={<IconChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Stack of SwipeCards */}
            <div className="relative h-[640px] w-full">
              {[
                featuredIndex < filteredProfiles.length - 1 ? filteredProfiles[featuredIndex + 1] : null,
                safeFeaturedProfile,
              ]
                .filter(Boolean)
                .map((profile, i, arr) => {
                  const isNext = arr.length === 2 && i === 0;
                  // @ts-ignore
                  const p = profile as Profile;
                  return (
                    <SwipeCard
                      key={p.id}
                      profile={p}
                      isNext={isNext}
                      onCardClick={() => {
                        if (!isNext) {
                          router.push(`/app/profile?user=${p.id}`);
                        }
                      }}
                      onSwipeLeft={() => {
                        if (!isNext) {
                          setFeaturedIndex((prev) =>
                            prev < filteredProfiles.length - 1 ? prev + 1 : 0
                          );
                        }
                      }}
                      onSwipeRight={() => {
                        if (!isNext) {
                          handleSendInterest(p.id, p.name);
                          setFeaturedIndex((prev) =>
                            prev < filteredProfiles.length - 1 ? prev + 1 : 0
                          );
                        }
                      }}
                    >
                      {({ triggerSwipe }) => renderCardOverlay(p, triggerSwipe)}
                    </SwipeCard>
                  );
                })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* GRID VIEW MODE (Default on desktop, mobile when chosen)   */}
        {/* ======================================================== */}
        <div
          className={cn(
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6',
            viewMode === 'swipe' ? 'hidden md:grid' : 'grid'
          )}
        >
          {filteredProfiles.map((profile) => {
            const isShortlisted = shortlistedIds.has(profile.id);
            const isInterestSent = sentInterestIds.has(profile.id);

            return (
              <Card
                key={profile.id}
                variant="interactive"
                role="link"
                tabIndex={0}
                aria-label={`View ${profile.name}'s profile`}
                onClick={() => router.push(`/app/profile?user=${profile.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push(`/app/profile?user=${profile.id}`);
                  }
                }}
                className="group relative overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-white p-0 shadow-[var(--elevation-card)] hover:shadow-[var(--elevation-floating)] transition-all duration-300 cursor-pointer"
              >
                {/* 3:4 Portrait Photography with Overlay */}
                <div className="relative h-[460px] sm:h-[490px] w-full overflow-hidden bg-[var(--surface-muted)]">
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />

                  {/* Ambient Warm Gradient Overlay */}
                  <div className="absolute inset-0 photo-overlay-warm" aria-hidden="true" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 z-10">
                    <div className="flex items-center gap-1.5">
                      {profile.online && (
                        <Badge
                          tone="neutral"
                          size="sm"
                          dot
                          dotColor="bg-emerald-500"
                          className="bg-white/90 backdrop-blur-md text-[var(--foreground)] border-white/80"
                        >
                          Online
                        </Badge>
                      )}
                    </div>

                    <span className="inline-block rounded-full bg-white/85 backdrop-blur-md text-[var(--primary-deep)] px-2.5 py-0.5 text-[10px] font-semibold border border-white/60 shadow-xs">
                      ✓ Matches
                    </span>
                  </div>

                  {/* Identity & Action Overlay on Photo */}
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white z-10 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-editorial-title text-xl font-bold tracking-tight text-white drop-shadow-sm truncate group-hover:text-[var(--accent-light)] transition-colors">
                        {profile.name}, {profile.age}
                      </h3>
                      {profile.verified && <VerificationBadge type="general" showIconOnly size="sm" />}
                    </div>

                    <p className="text-xs font-semibold text-white/90 truncate">
                      {profile.profession} · {profile.education}
                    </p>

                    <p className="flex items-center gap-1 text-xs text-white/85 truncate">
                      <IconMapPin className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
                      <span>
                        {profile.city}, {profile.state}
                      </span>
                    </p>

                    {/* Matrimonial Discovery Actions Floating in Overlay */}
                    <div className="w-full pt-2.5 flex items-center justify-between md:justify-center gap-2 sm:gap-2.5 lg:gap-4 md:px-2">
                      {/* Pass button: Highlighted 360° circle */}
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFeaturedIndex((prev) =>
                            prev < filteredProfiles.length - 1 ? prev + 1 : 0
                          );
                        }}
                        className="rounded-full aspect-square h-10 w-10 md:h-12 md:w-12 shrink-0 p-0 flex items-center justify-center bg-white/95 backdrop-blur-md text-rose-600 border border-white/70 hover:bg-white hover:scale-110 active-press shadow-lg hover:shadow-xl transition-all"
                        title="Pass"
                      >
                        <IconX className="h-5 w-5 md:h-6 md:w-6 stroke-[2.3]" />
                      </Button>

                      {/* Chat button: Pill on mobile, small circle on desktop */}
                      <Link
                        href={`/app/messages?user=${profile.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 min-w-0 focus-ring rounded-full md:flex-none md:shrink-0"
                        title={`Chat with ${profile.name}`}
                      >
                        <Button
                          variant="secondary"
                          className="w-full h-10 md:h-9 md:w-9 rounded-full md:aspect-square bg-white/95 backdrop-blur-md text-[var(--foreground)] border border-white/60 shadow-md hover:bg-white hover:scale-110 active-press flex items-center justify-center gap-1.5 md:gap-0 px-2.5 md:p-0 text-xs font-semibold transition-all"
                          leftIcon={<IconMessageCircleFilled className="h-4.5 w-4.5 md:h-4 md:w-4 text-[var(--primary)] shrink-0 md:-ml-0" />}
                          title={`Chat with ${profile.name}`}
                          aria-label="Chat"
                        >
                          <span className="md:hidden truncate">Chat</span>
                        </Button>
                      </Link>

                      {/* Favorite button: Pill on mobile, small circle on desktop */}
                      <Button
                        variant={isShortlisted ? 'primary' : 'outline'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShortlist(profile.id, profile.name);
                        }}
                        className={cn(
                          'flex-1 min-w-0 h-10 md:h-9 md:w-9 rounded-full md:aspect-square border shadow-md active-press transition-all flex items-center justify-center gap-1.5 md:gap-0 px-2.5 md:p-0 text-xs font-semibold md:shrink-0',
                          isShortlisted
                            ? 'bg-[var(--primary)] text-white border-transparent hover:brightness-110 md:hover:scale-110'
                            : 'bg-white/95 backdrop-blur-md text-[var(--foreground)] border border-white/60 hover:bg-white md:hover:scale-110'
                        )}
                        leftIcon={
                          <IconStarFilled
                            className={cn(
                              'h-4.5 w-4.5 md:h-4 md:w-4 shrink-0 md:-ml-0',
                              isShortlisted ? 'text-white' : 'text-[var(--primary)]'
                            )}
                          />
                        }
                        title={isShortlisted ? 'Favorited' : `Add ${profile.name} to favorites`}
                        aria-label={isShortlisted ? 'Favorited' : 'Favorite'}
                      >
                        <span className="md:hidden truncate">{isShortlisted ? 'Favorited' : 'Favorite'}</span>
                      </Button>

                      {/* Send Interest button: Highlighted 360° circle */}
                      <Button
                        variant="secondary"
                        size="icon"
                        disabled={isInterestSent}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendInterest(profile.id, profile.name);
                        }}
                        className="rounded-full aspect-square h-10 w-10 md:h-12 md:w-12 shrink-0 p-0 flex items-center justify-center bg-white/95 backdrop-blur-md text-rose-600 border border-white/70 hover:bg-white hover:scale-110 active-press shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
                        title="Send Interest"
                      >
                        <IconHeart className="h-5 w-5 md:h-6 md:w-6 fill-rose-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </>
    )}

      {/* ======================================================== */}
      {/* 4. COMPACT FILTERS DRAWER / BOTTOM SHEET                 */}
      {/* ======================================================== */}
      <BottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Refine Partner Preferences"
        description="Filter verified matrimonial profiles based on your values and criteria."
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            <Button
              variant="outline"
              size="md"
              onClick={handleResetFilters}
              className="text-xs font-bold"
              leftIcon={<IconRefresh className="h-3.5 w-3.5" />}
            >
              Reset
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setIsFilterOpen(false);
                toast.success('Filters Applied', `Showing ${filteredProfiles.length} matching profiles.`);
              }}
              className="text-xs font-bold flex-1 max-w-xs shadow-md"
            >
              Apply Filters
            </Button>
          </div>
        }
      >
        <div className="space-y-6 pb-4">
          {/* Match counter banner inside drawer */}
          <div className="rounded-2xl bg-gradient-to-br from-[#FAF3EC] to-[#FFF9F6] p-4 border border-[#EAD8C7] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <IconUsers className="h-5 w-5 text-[var(--accent)]" />
              <div>
                <p className="text-xs font-bold text-[#5C1027]">Partner Matches</p>
                <p className="text-[12px] font-semibold text-[var(--foreground)]">
                  {filteredProfiles.length} profiles match your preferences
                </p>
              </div>
            </div>
            <span className="font-editorial-title text-xl font-bold text-[#5C1027]">
              {filteredProfiles.length}
            </span>
          </div>

          {/* 0. Search & Sort */}
          <div className="space-y-4 pb-5 mb-5 border-b border-[var(--border)]">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-strong)]">
                Search Profiles
              </label>
              <SearchInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onClear={() => setQuery('')}
                placeholder="Search by ID, name, or profession..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted-strong)]">
                Sort By
              </label>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-11 rounded-xl text-sm font-semibold w-full bg-[var(--surface)] border border-[var(--border)]"
              >
                <option value="recommended">Recommended Matches</option>
                <option value="recent">Recently Active</option>
                <option value="new">New Profiles</option>
                <option value="nearby">Nearby Location</option>
              </Select>
            </div>
          </div>

          {/* 1. Age Range Slider / Inputs */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                Age Range
              </label>
              <span className="text-xs font-bold text-[var(--primary)]">
                {minAge} – {maxAge} years
              </span>
            </div>
            {/* Dual Range slider representation */}
            <input
              type="range"
              min={18}
              max={65}
              value={maxAge}
              onChange={(e) => setMaxAge(Math.max(minAge + 1, Number(e.target.value)))}
              className="w-full accent-[var(--primary)] cursor-pointer"
            />
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] text-[var(--muted)]">Min Age</label>
                <input
                  type="number"
                  min={18}
                  max={60}
                  value={minAge}
                  onChange={(e) => setMinAge(Number(e.target.value))}
                  className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold outline-none focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[var(--muted)]">Max Age</label>
                <input
                  type="number"
                  min={18}
                  max={70}
                  value={maxAge}
                  onChange={(e) => setMaxAge(Number(e.target.value))}
                  className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>
          </div>

          {/* 2. Gender Preference */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              Looking for
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'any', label: 'All Profiles' },
                { value: 'women', label: 'Seeking Brides (Women)' },
                { value: 'men', label: 'Seeking Grooms (Men)' },
              ].map((g) => (
                <Chip
                  key={g.value}
                  size="sm"
                  selected={selectedGender === g.value}
                  onClick={() => setSelectedGender(g.value as any)}
                  interactive
                >
                  {g.label}
                </Chip>
              ))}
            </div>
          </div>

          {/* 3. Location / City Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              Location / City
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'All locations',
                'Kochi',
                'Thrissur',
                'Bengaluru',
                'Calicut',
                'Kottayam',
                'Chennai',
                'Trivandrum',
                'Dubai/UAE',
              ].map((c) => (
                <Chip
                  key={c}
                  size="sm"
                  selected={city === c}
                  onClick={() => setCity(c)}
                  interactive
                >
                  {c}
                </Chip>
              ))}
            </div>
          </div>

          {/* 4. Religion */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              Religion
            </label>
            <div className="flex flex-wrap gap-2">
              {['Any', 'Hindu', 'Muslim', 'Christian', 'Inter-faith', 'Jain', 'Sikh'].map((r) => (
                <Chip
                  key={r}
                  size="sm"
                  selected={selectedReligion === r}
                  onClick={() => setSelectedReligion(r)}
                  interactive
                >
                  {r}
                </Chip>
              ))}
            </div>
          </div>

          {/* 5. Caste / Community */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              Caste & Community
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'Any',
                'No Caste Bar',
                'Nair',
                'Ezhava',
                'Brahmin',
                'Sunni',
                'Latin Catholic',
                'Syrian Catholic',
                'Viswakarma',
              ].map((caste) => (
                <Chip
                  key={caste}
                  size="sm"
                  selected={selectedCaste === caste}
                  onClick={() => setSelectedCaste(caste)}
                  interactive
                >
                  {caste}
                </Chip>
              ))}
            </div>
          </div>

          {/* 6. Education Level */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              Education
            </label>
            <div className="flex flex-wrap gap-2">
              {["Any", "Doctorate", "Master's Degree", "Bachelor's Degree", 'Professional Degree (MBBS/CA/LLB)'].map(
                (edu) => (
                  <Chip
                    key={edu}
                    size="sm"
                    selected={selectedEducation === edu}
                    onClick={() => setSelectedEducation(edu)}
                    interactive
                  >
                    {edu}
                  </Chip>
                )
              )}
            </div>
          </div>

          {/* 7. Profession */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              Profession
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'Any',
                'Software / IT',
                'Doctor / Healthcare',
                'Designer / Creative',
                'Civil Services / Govt',
                'Finance & Banking',
                'Entrepreneur / Business',
              ].map((prof) => (
                <Chip
                  key={prof}
                  size="sm"
                  selected={selectedProfession === prof}
                  onClick={() => setSelectedProfession(prof)}
                  interactive
                >
                  {prof}
                </Chip>
              ))}
            </div>
          </div>

          {/* 8. Annual Income */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              Annual Income
            </label>
            <div className="flex flex-wrap gap-2">
              {['Any', '₹5L - ₹10L PA', '₹10L - ₹25L PA', '₹25L - ₹50L PA', '₹50L+ PA'].map((inc) => (
                <Chip
                  key={inc}
                  size="sm"
                  selected={selectedIncome === inc}
                  onClick={() => setSelectedIncome(inc)}
                  interactive
                >
                  {inc}
                </Chip>
              ))}
            </div>
          </div>

          {/* 9. Marital Status */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              Marital Status
            </label>
            <div className="flex flex-wrap gap-2">
              {['Any', 'Never married', 'Divorced', 'Widowed', 'Awaiting divorce'].map((status) => (
                <Chip
                  key={status}
                  size="sm"
                  selected={selectedMaritalStatus === status}
                  onClick={() => setSelectedMaritalStatus(status)}
                  interactive
                >
                  {status}
                </Chip>
              ))}
            </div>
          </div>

          {/* 10. Mother Tongue / Language */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              Language / Mother Tongue
            </label>
            <div className="flex flex-wrap gap-2">
              {['Any', 'Malayalam', 'Tamil', 'Telugu', 'Hindi', 'English', 'Kannada'].map((lang) => (
                <Chip
                  key={lang}
                  size="sm"
                  selected={selectedLanguage === lang}
                  onClick={() => setSelectedLanguage(lang)}
                  interactive
                >
                  {lang}
                </Chip>
              ))}
            </div>
          </div>

          {/* 11. Partner Intent */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              Partner Intent
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'Any',
                'Ready to marry soon (<6 mo)',
                'Looking to marry within 1 year',
                'Exploring compatibility first',
              ].map((intent) => (
                <Chip
                  key={intent}
                  size="sm"
                  selected={selectedIntent === intent}
                  onClick={() => setSelectedIntent(intent)}
                  interactive
                >
                  {intent}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
