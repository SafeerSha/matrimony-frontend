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
  IconHeartFilled,
  IconRotateClockwise,
} from '@tabler/icons-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { SearchInput } from '@/components/ui/input';
import { ModernSelect } from '@/components/ui/modern-select';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionHeader } from '@/components/ui/section-header';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { ProfileCardSkeleton, SwipeCardSkeleton } from '@/components/ui/skeleton';
import { matchesService, profileService, isDraftUser } from '@/services';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import { SwipeCard } from '@/components/discovery/swipe-card';
import { type Profile, formatLastActive } from '@/lib/demo-data';

export type DiscoveryViewMode = 'swipe' | 'grid';
export type SortOption = 'recommended' | 'recent' | 'new' | 'nearby';

export const HEIGHT_OPTIONS = [
  "4'10\"", "4'11\"", "5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"",
  "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"",
  "6'2\"", "6'3\"", "6'4\""
];

export const HEIGHT_SELECT_OPTIONS = HEIGHT_OPTIONS.map((h) => ({ value: h, label: h }));

export function heightToInches(h?: string): number {
  if (!h) return 0;
  const match = h.match(/(\d+)'(\d+)/);
  if (match) {
    return parseInt(match[1], 10) * 12 + parseInt(match[2], 10);
  }
  const cmMatch = h.match(/(\d+)\s*cm/i);
  if (cmMatch) {
    return Math.round(parseInt(cmMatch[1], 10) / 2.54);
  }
  return 0;
}

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


  // Filters State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [city, setCity] = useState('All locations');
  const [minAge, setMinAge] = useState(21);
  const [maxAge, setMaxAge] = useState(35);
  const [minHeight, setMinHeight] = useState<string>("4'10\"");
  const [maxHeight, setMaxHeight] = useState<string>("6'4\"");
  const [selectedGender, setSelectedGender] = useState<'any' | 'women' | 'men'>('any');
  const [myGender, setMyGender] = useState<string>('');
  const [selectedReligion, setSelectedReligion] = useState<string>('Any');
  const [selectedCaste, setSelectedCaste] = useState<string>('Any');
  const [selectedEducation, setSelectedEducation] = useState<string>('Any');
  const [selectedProfession, setSelectedProfession] = useState<string>('Any');
  const [selectedIncome, setSelectedIncome] = useState<string>('Any');
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState<string>('Any');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Any');
  const [selectedIntent, setSelectedIntent] = useState<string>('Any');
  const [selectedDiet, setSelectedDiet] = useState<string>("Doesn't Matter");

  // Shortlist and Interest tracking sets
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [sentInterestIds, setSentInterestIds] = useState<Set<string>>(new Set());
  const [receivedInterestIds, setReceivedInterestIds] = useState<Set<string>>(new Set());
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());

  // Profiles data & loading
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenSwipeHint, setHasSeenSwipeHint] = useState(true);

  useEffect(() => {
    try {
      const seen =
        localStorage.getItem('matrimony_swipe_hint_seen') === 'true' ||
        sessionStorage.getItem('matrimony_swipe_hint_seen') === 'true';
      setHasSeenSwipeHint(seen);

      const savedPassed = sessionStorage.getItem('matrimony_passed_ids');
      if (savedPassed) {
        setPassedIds(new Set(JSON.parse(savedPassed)));
      }
    } catch {
      setHasSeenSwipeHint(false);
    }
  }, []);

  // Guard: Incomplete / Draft profiles are not allowed on Discover & load user gender
  useEffect(() => {
    profileService
      .getProfile('me')
      .then((profile: any) => {
        if (!profile) return;
        if (isDraftUser(profile)) {
          toast.warning(
            'Complete Profile Required',
            'Please complete your profile details to unlock discovery.'
          );
          router.replace('/onboarding');
          return;
        }
        const g = (profile.profile?.gender || profile.gender || '').toLowerCase().trim();
        setMyGender(g);
        if (g === 'male' || g === 'man') {
          setSelectedGender('women');
        } else if (g === 'female' || g === 'woman') {
          setSelectedGender('men');
        }
      })
      .catch(() => {});
  }, [router]);

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
        gender: selectedGender !== 'any' ? selectedGender : undefined,
      })
      .then((res: any) => {
        const rawList = (Array.isArray(res) ? res : res?.data || []).filter(
          (u: any) =>
            u.id !== 'meera' &&
            u.id !== 'ananya' &&
            !u.email?.includes('demo.ishtamchat.com')
        );
        if (rawList.length > 0) {
          const initialSent = new Set<string>();
          const initialReceived = new Set<string>();
          const initialShortlisted = new Set<string>();
          const initialPassed = new Set<string>();

          const mapped: Profile[] = rawList.map((u: any, idx: number) => {
            if (u.isInterestSent || u.connectionStatus === 'SENT' || u.connectionStatus === 'MATCHED') {
              initialSent.add(u.id);
            }
            if (u.isInterestReceived || u.connectionStatus === 'RECEIVED') {
              initialReceived.add(u.id);
            }
            if (u.isShortlisted || u.connectionStatus === 'SHORTLISTED') {
              initialShortlisted.add(u.id);
            }
            if (u.isPassed || u.connectionStatus === 'REJECTED') {
              initialPassed.add(u.id);
            }

            const prof = u.profile || {};
            const photos = u.photos || prof.photos || [];
            const firstName = u.firstName || prof.firstName || '';
            const lastName = u.lastName || prof.lastName || '';
            const fullName = u.name || `${firstName} ${lastName}`.trim() || 'Member';

            const birthDate = prof.dateOfBirth || u.dateOfBirth;
            const age = birthDate
              ? Math.floor((new Date().getTime() - new Date(birthDate).getTime()) / 31557600000)
              : prof.age || u.age || 26;

            const cityVal = prof.city || u.city || '';
            const stateVal = prof.state || prof.country || u.state || u.country || '';
            const profVal = prof.occupation || prof.profession || u.occupation || u.profession || '';
            const eduVal = prof.education || u.education || '';

            const rawAvatar = photos?.[0]?.url || prof.image || u.image || '';
            const avatar =
              rawAvatar.includes('pravatar') || rawAvatar.includes('unsplash')
                ? ''
                : rawAvatar;

            return {
              id: u.id || `profile-${idx}`,
              profileId: u.profileId || prof.profileId,
              name: fullName,
              age,
              city: cityVal,
              state: stateVal,
              profession: profVal,
              education: eduVal,
              image: avatar,
              compatibility: u.compatibility ?? prof.compatibility ?? 88,
              verified: Boolean(u.status === 'ACTIVE' || prof.isVerified || u.isVerified),
              online: Boolean(u.isOnline),
              lastActiveAt: u.lastActiveAt || undefined,
              about: prof.bio || u.bio || '',
              height: prof.height ? `${prof.height}cm` : '',
              gender: prof.gender || u.gender || '',
              caste: prof.caste || u.caste || '',
              diet: prof.diet || u.diet || '',
              income: prof.annualIncome || prof.income || u.income || '',
              intent: prof.lookingFor || prof.intent || u.intent || '',
              maritalStatus: prof.maritalStatus || u.maritalStatus || '',
              religion: prof.religion || u.religion || '',
              motherTongue: prof.motherTongue || '',
              family: prof.family || '',
              lifestyle: Array.isArray(prof.lifestyle) ? prof.lifestyle : [],
              interests: Array.isArray(prof.interests) ? prof.interests : [],
              lookingFor: prof.lookingFor || '',
            };
          });
          setSentInterestIds((prev) => {
            const next = new Set(prev);
            initialSent.forEach((id) => next.add(id));
            return next;
          });
          setReceivedInterestIds((prev) => {
            const next = new Set(prev);
            initialReceived.forEach((id) => next.add(id));
            return next;
          });
          setShortlistedIds((prev) => {
            const next = new Set(prev);
            initialShortlisted.forEach((id) => next.add(id));
            return next;
          });
          setPassedIds((prev) => {
            const next = new Set(prev);
            initialPassed.forEach((id) => next.add(id));
            return next;
          });
          setProfiles(mapped);
        } else {
          setProfiles([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching profiles:', err);
        setProfiles([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [city, minAge, maxAge, selectedReligion, selectedMaritalStatus, selectedGender]);

  // Filter & Sort computation
  const filteredProfiles = useMemo(() => {
    return profiles
      .filter((p) => {
        const matchesQuery = query.trim()
          ? `${p.id} ${p.name} ${p.city} ${p.profession} ${p.education} ${p.about || ''}`
            .toLowerCase()
            .includes(query.toLowerCase())
          : true;

        const matchesCity = city === 'All locations' || p.city.toLowerCase() === city.toLowerCase();
        const matchesAge = p.age >= minAge && p.age <= maxAge;

        // Foundation Matchmaking Gender match
        const pGender = (p.gender || (p as any).sex || '').toLowerCase();
        const effectiveGender =
          selectedGender !== 'any'
            ? selectedGender
            : myGender === 'male' || myGender === 'man'
            ? 'women'
            : myGender === 'female' || myGender === 'woman'
            ? 'men'
            : 'any';

        const matchesGender =
          effectiveGender === 'any' ||
          (effectiveGender === 'women' && (pGender.includes('female') || pGender.includes('woman') || pGender.includes('women'))) ||
          (effectiveGender === 'men' && (pGender.includes('male') || pGender.includes('man') || pGender.includes('men')));

        const matchesReligion =
          selectedReligion === 'Any' ||
          (p.religion && p.religion.toLowerCase() === selectedReligion.toLowerCase());

        // Caste / Community match
        const pCaste = ((p as any).caste || (p as any).community || '').toLowerCase();
        const matchesCaste =
          selectedCaste === 'Any' ||
          selectedCaste === 'No Caste Bar' ||
          pCaste.includes(selectedCaste.toLowerCase());

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

        // Income match
        const pIncome = ((p as any).income || (p as any).annualIncome || '').toLowerCase();
        const matchesIncome =
          selectedIncome === 'Any' ||
          !pIncome ||
          pIncome.includes(selectedIncome.toLowerCase());

        // Intent match
        const pIntent = ((p as any).intent || (p as any).partnerIntent || (p as any).category || '').toLowerCase();
        const matchesIntent =
          selectedIntent === 'Any' ||
          !pIntent ||
          pIntent.includes(selectedIntent.toLowerCase());

        // Height match
        const pHeightInches = heightToInches(p.height);
        const minHeightInches = heightToInches(minHeight);
        const maxHeightInches = heightToInches(maxHeight);
        const matchesHeight =
          !pHeightInches ||
          ((!minHeightInches || pHeightInches >= minHeightInches) &&
           (!maxHeightInches || pHeightInches <= maxHeightInches));

        // Diet match
        const pDiet = ((p as any).diet || (p as any).dietaryHabits || (Array.isArray(p.lifestyle) ? p.lifestyle.join(' ') : '')).toLowerCase();
        const matchesDiet =
          selectedDiet === "Doesn't Matter" ||
          selectedDiet === "Any" ||
          pDiet.includes(selectedDiet.toLowerCase());

        return (
          matchesQuery &&
          matchesCity &&
          matchesAge &&
          matchesGender &&
          matchesReligion &&
          matchesCaste &&
          matchesEducation &&
          matchesProfession &&
          matchesIncome &&
          matchesMaritalStatus &&
          matchesLanguage &&
          matchesIntent &&
          matchesHeight &&
          matchesDiet
        );
      })
      .sort((a, b) => {
        const isInteractedA = sentInterestIds.has(a.id) || passedIds.has(a.id) || receivedInterestIds.has(a.id);
        const isInteractedB = sentInterestIds.has(b.id) || passedIds.has(b.id) || receivedInterestIds.has(b.id);

        // Priority 1: Fresh / Uncontacted profiles always appear FIRST at the top
        if (!isInteractedA && isInteractedB) return -1;
        if (isInteractedA && !isInteractedB) return 1;

        // Priority 2: Within each group, apply user's chosen sorting criteria
        if (sortBy === 'recommended') return (b.compatibility || 0) - (a.compatibility || 0);
        if (sortBy === 'recent') {
          const timeA = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
          const timeB = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
          if (timeA !== timeB) return timeB - timeA;
          return (b.online ? 1 : 0) - (a.online ? 1 : 0);
        }
        if (sortBy === 'new') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [
    profiles,
    sentInterestIds,
    receivedInterestIds,
    passedIds,
    query,
    city,
    minAge,
    maxAge,
    selectedGender,
    myGender,
    selectedReligion,
    selectedCaste,
    selectedMaritalStatus,
    selectedProfession,
    selectedEducation,
    selectedLanguage,
    selectedIncome,
    selectedIntent,
    minHeight,
    maxHeight,
    selectedDiet,
    sortBy,
  ]);

  // Calculate active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (city !== 'All locations') count++;
    if (minAge !== 21 || maxAge !== 35) count++;
    if (minHeight !== "4'10\"" || maxHeight !== "6'4\"") count++;
    const defaultOppositeGender =
      myGender === 'male' || myGender === 'man'
        ? 'women'
        : myGender === 'female' || myGender === 'woman'
        ? 'men'
        : 'any';
    if (selectedGender !== defaultOppositeGender && selectedGender !== 'any') count++;
    if (selectedReligion !== 'Any') count++;
    if (selectedCaste !== 'Any') count++;
    if (selectedEducation !== 'Any') count++;
    if (selectedProfession !== 'Any') count++;
    if (selectedIncome !== 'Any') count++;
    if (selectedMaritalStatus !== 'Any') count++;
    if (selectedLanguage !== 'Any') count++;
    if (selectedIntent !== 'Any') count++;
    if (selectedDiet !== "Doesn't Matter") count++;
    return count;
  }, [
    city,
    minAge,
    maxAge,
    minHeight,
    maxHeight,
    selectedGender,
    myGender,
    selectedReligion,
    selectedCaste,
    selectedEducation,
    selectedProfession,
    selectedIncome,
    selectedMaritalStatus,
    selectedLanguage,
    selectedIntent,
    selectedDiet,
  ]);

  const handleResetFilters = () => {
    setQuery('');
    setCity('All locations');
    setMinAge(21);
    setMaxAge(35);
    setMinHeight("4'10\"");
    setMaxHeight("6'4\"");
    const defaultOppositeGender =
      myGender === 'male' || myGender === 'man'
        ? 'women'
        : myGender === 'female' || myGender === 'woman'
        ? 'men'
        : 'any';
    setSelectedGender(defaultOppositeGender);
    setSelectedReligion('Any');
    setSelectedCaste('Any');
    setSelectedEducation('Any');
    setSelectedProfession('Any');
    setSelectedIncome('Any');
    setSelectedMaritalStatus('Any');
    setSelectedLanguage('Any');
    setSelectedIntent('Any');
    setSelectedDiet("Doesn't Matter");
    setIsFilterOpen(false);
    toast.info('Filters Reset', 'Showing all available matrimonial recommendations.');
  };

  const handleApplyFilters = async () => {
    setIsFilterOpen(false);
    toast.success('Filters Applied', `Showing ${filteredProfiles.length} matching profiles.`);

    // Persist to backend preferences so user's partner preferences are safely saved
    try {
      const preferencesPayload: any = {
        minAge,
        maxAge,
        minHeight,
        maxHeight,
        gender: selectedGender,
        religions: selectedReligion !== 'Any' ? [selectedReligion] : ['Open to all communities'],
        maritalStatus: selectedMaritalStatus !== 'Any' ? [selectedMaritalStatus] : ['Never Married'],
        locations: city !== 'All locations' ? [city] : ['Any location'],
        education: selectedEducation !== 'Any' ? [selectedEducation] : ['Any qualification'],
        professions: selectedProfession !== 'Any' ? [selectedProfession] : ['Any profession'],
        diet: selectedDiet !== "Doesn't Matter" ? [selectedDiet] : ["Doesn't Matter"],
        caste: selectedCaste !== 'Any' ? selectedCaste : undefined,
        income: selectedIncome !== 'Any' ? selectedIncome : undefined,
        intent: selectedIntent !== 'Any' ? selectedIntent : undefined,
        language: selectedLanguage !== 'Any' ? selectedLanguage : undefined,
      };
      await profileService.updatePreferences('me', preferencesPayload);
    } catch (err) {
      console.warn('Failed auto-saving preferences in background:', err);
    }
  };

  const handleSendInterest = async (
    id: string,
    name: string,
    options?: { silentToast?: boolean }
  ) => {
    const isMobileSwipe = viewMode === 'swipe' || options?.silentToast;
    const isIncoming = receivedInterestIds.has(id);
    try {
      if (isIncoming) {
        await matchesService.acceptInterest(id);
        setReceivedInterestIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setSentInterestIds((prev) => new Set(prev).add(id));
        toast.success('Connected & Matched! 🎉', `You and ${name} liked each other! Start chatting now.`);
      } else {
        await matchesService.sendInterest(id);
        setSentInterestIds((prev) => new Set(prev).add(id));
        if (!isMobileSwipe) {
          toast.success('Interest Sent!', `We have notified ${name} of your interest.`);
        }
      }
    } catch {
      setSentInterestIds((prev) => new Set(prev).add(id));
      if (!isMobileSwipe) {
        toast.success('Interest Sent!', `We have notified ${name} of your interest.`);
      }
    }
  };

  const handlePass = (id: string) => {
    setPassedIds((prev) => {
      const next = new Set(prev).add(id);
      try {
        sessionStorage.setItem('matrimony_passed_ids', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
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

  // Swipe mode profiles: Only show profiles that have NOT had interest sent, NOT received interest, and NOT passed
  const swipeProfiles = useMemo(() => {
    return filteredProfiles.filter(
      (p) => !sentInterestIds.has(p.id) && !passedIds.has(p.id) && !receivedInterestIds.has(p.id)
    );
  }, [filteredProfiles, sentInterestIds, passedIds, receivedInterestIds]);

  const sentInterestCount = useMemo(() => {
    return filteredProfiles.filter((p) => sentInterestIds.has(p.id)).length;
  }, [filteredProfiles, sentInterestIds]);

  const passedCount = useMemo(() => {
    return filteredProfiles.filter((p) => passedIds.has(p.id)).length;
  }, [filteredProfiles, passedIds]);

  const handleResetPassed = () => {
    setPassedIds(new Set());
    try {
      sessionStorage.removeItem('matrimony_passed_ids');
    } catch {}
    toast.info('Passes Cleared', 'Previously passed profiles are now back in your discovery feed.');
  };

  const renderCardOverlay = (profile: Profile, triggerSwipe?: (dir: 'left' | 'right') => void) => (
    <>
      {/* Top Badges */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10 pointer-events-auto">
        {sentInterestIds.has(profile.id) ? (
          <Badge
            tone="accent"
            size="sm"
            className="bg-emerald-600/90 text-white font-bold backdrop-blur-md border-emerald-400/50 shadow-sm"
          >
            ✓ Interest Sent
          </Badge>
        ) : receivedInterestIds.has(profile.id) ? (
          <Badge
            tone="accent"
            size="sm"
            className="bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold backdrop-blur-md border-rose-400/50 shadow-sm"
          >
            ♥ Sent You an Interest
          </Badge>
        ) : profile.online ? (
          <Badge
            tone="neutral"
            size="sm"
            dot
            dotColor="bg-emerald-500"
            className="bg-white/90 backdrop-blur-md text-[var(--foreground)] border-white/80 font-medium"
          >
            Online now
          </Badge>
        ) : profile.lastActiveAt ? (
          <Badge
            tone="neutral"
            size="sm"
            className="bg-black/50 text-white/95 backdrop-blur-md border-white/20 text-[10px] font-medium"
          >
            {formatLastActive(profile.lastActiveAt)}
          </Badge>
        ) : null}
      </div>

      {/* Identity & Action Overlay on Photo */}
      <div 
        className="absolute inset-x-0 bottom-0 p-3.5 sm:p-5 md:p-8 text-white z-10 space-y-1 sm:space-y-2 pointer-events-auto cursor-pointer"
        onClick={() => router.push(`/app/profile?user=${profile.id}`)}
      >
        <div className="group/name flex items-center gap-2">
          <h2 className="font-editorial-title text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm group-hover/name:text-[var(--accent-light)] transition-colors">
            {profile.name}, {profile.age}
          </h2>
          {profile.verified && (
            <VerificationBadge type="general" showIconOnly size="sm" />
          )}
        </div>

        {(profile.education || profile.profession) && (
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-white/90">
            {[profile.profession, profile.education].filter(Boolean).join(' • ')}
          </div>
        )}

        {(profile.city || profile.state) && (
          <p className="flex items-center gap-1.5 text-xs sm:text-sm text-white/90 font-medium">
            <IconMapPin className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
            <span>
              {[profile.city, profile.state].filter(Boolean).join(', ')}
            </span>
          </p>
        )}

        {/* Matrimonial Discovery Actions Floating in Overlay */}
        <div 
          className="w-full pt-1.5 sm:pt-3 flex items-center justify-between gap-2 sm:gap-3"
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
                handlePass(profile.id);
              }
            }}
            className="rounded-full aspect-square h-11 w-11 sm:h-14 sm:w-14 shrink-0 p-0 flex items-center justify-center bg-white/95 backdrop-blur-md text-rose-600 border border-white/70 hover:bg-white hover:scale-110 active-press shadow-lg hover:shadow-xl transition-all"
            title="Pass"
          >
            <IconX className="h-5 w-5 sm:h-6.5 sm:w-6.5 stroke-[2.3]" />
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
              if (sentInterestIds.has(profile.id)) return;
              if (triggerSwipe) {
                triggerSwipe('right');
              } else {
                handleSendInterest(profile.id, profile.name, { silentToast: true });
              }
            }}
            className={cn(
              "rounded-full aspect-square h-11 w-11 sm:h-14 sm:w-14 shrink-0 p-0 flex items-center justify-center backdrop-blur-md transition-all",
              sentInterestIds.has(profile.id)
                ? "bg-rose-50 border border-rose-200 text-rose-300 opacity-60 cursor-default"
                : "bg-white/95 text-rose-600 border border-white/70 hover:bg-white hover:scale-110 active-press shadow-lg hover:shadow-xl"
            )}
            title={sentInterestIds.has(profile.id) ? "Interest already sent" : "Send Interest"}
          >
            <IconHeart className={cn("h-5.5 w-5.5 sm:h-6.5 sm:w-6.5 fill-rose-600", sentInterestIds.has(profile.id) && "opacity-50")} />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className={cn(
      "transition-all",
      viewMode === 'swipe'
        ? "h-[calc(100dvh-132px)] flex flex-col gap-2.5 sm:gap-3 overflow-hidden pb-0 md:h-auto md:overflow-visible md:pb-8 md:space-y-4 md:gap-0"
        : "space-y-2.5 sm:space-y-4 pb-2 sm:pb-8"
    )}>
      {/* Mobile layout spacing & Swipe mode lock */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 767px) {
          div:has(> #main-content) {
            padding-top: 0.4rem !important;
            gap: 0 !important;
          }
          ${viewMode === 'swipe' ? `
            html, body {
              overflow: hidden !important;
              overscroll-behavior: none !important;
              height: 100% !important;
            }
            #main-content { 
              padding-bottom: 0 !important; 
              overflow: hidden !important;
            }
            div:has(> #main-content) {
              padding-bottom: 0 !important;
            }
          ` : ''}
        }
      `}} />

      {/* ======================================================== */}
      {/* 1. TOP HEADER & VIEW MODE CONTROLS                       */}
      {/* ======================================================== */}
      <div className="flex flex-col gap-2 sm:gap-3 animate-content-appear stagger-1 shrink-0">
        {/* <SectionHeader
          eyebrow="Discovery jj"
        /> */}

        <div className="flex items-center justify-between w-full gap-2 shrink-0">
          {/* View Switcher: Mobile & Desktop */}
          <div className="flex items-center bg-[var(--surface-muted)] p-1 rounded-2xl border border-[var(--border)]">
            <button
              type="button"
               onClick={() => setViewMode('swipe')}
               aria-pressed={viewMode === 'swipe'}
               className={cn(
                 'focus-ring flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active-press select-none sm:hidden',
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
                'focus-ring flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active-press select-none sm:hidden',
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
        viewMode === 'swipe' ? (
          <div className="relative max-w-2xl mx-auto w-full flex-1 min-h-0 flex flex-col animate-content-appear stagger-2">
            <SwipeCardSkeleton />
            {/* Peek of next card underneath */}
            <div className="absolute top-6 inset-x-4 -z-10 h-[calc(100%-1.5rem)] rounded-[2rem] sm:rounded-[2.5rem] bg-stone-200/50 scale-[0.95]" />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-content-appear stagger-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProfileCardSkeleton key={i} />
            ))}
          </div>
        )
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
          {viewMode === 'swipe' && (
            <div className="block md:hidden max-w-2xl mx-auto w-full flex-1 min-h-0 flex flex-col animate-content-appear stagger-2">
              {swipeProfiles.length > 0 ? (
                /* Stack of SwipeCards - Dynamically sized to fill available viewport */
                <div className="relative flex-1 min-h-[400px] max-h-[640px] w-full">
                  {[
                    swipeProfiles.length > 1 ? swipeProfiles[1] : null,
                    swipeProfiles[0],
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
                          showOnboardingHint={!hasSeenSwipeHint}
                          onCardClick={() => {
                            if (!isNext) {
                              router.push(`/app/profile?user=${p.id}`);
                            }
                          }}
                          onSwipeLeft={() => {
                            if (!isNext) {
                              handlePass(p.id);
                            }
                          }}
                          onSwipeRight={() => {
                            if (!isNext) {
                              handleSendInterest(p.id, p.name, { silentToast: true });
                            }
                          }}
                        >
                          {({ triggerSwipe }) => renderCardOverlay(p, triggerSwipe)}
                        </SwipeCard>
                      );
                    })}
                </div>
              ) : (
                /* All Profiles Covered Completion View */
                <div className="relative flex-1 min-h-[400px] max-h-[640px] w-full flex flex-col items-center justify-center p-3 sm:p-4">
                  <div className="relative w-full rounded-[2.5rem] border border-[var(--border)] bg-gradient-to-b from-white via-white to-rose-50/40 p-6 sm:p-8 shadow-[var(--elevation-floating)] text-center flex flex-col items-center justify-center space-y-4">
                    {/* Glowing Celebration Icon */}
                    <div className="relative flex items-center justify-center pt-2">
                      <div className="absolute -inset-3 rounded-full bg-rose-500/15 blur-xl animate-pulse" />
                      <div className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] text-white shadow-xl shadow-[var(--primary)]/25">
                        <IconHeartFilled className="h-10 w-10 text-white" />
                      </div>
                    </div>

                    {/* Header */}
                    <div className="space-y-1.5 px-2">
                      <h2 className="font-editorial-title text-2xl font-bold tracking-tight text-[var(--foreground)]">
                        You've Covered All Profiles!
                      </h2>
                      <p className="text-xs sm:text-sm text-[var(--muted)] max-w-xs mx-auto leading-relaxed">
                        You've reviewed all available profiles for your current search criteria.
                      </p>
                    </div>

                    {/* Stats Summary Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <IconHeart className="h-3.5 w-3.5 fill-emerald-600 text-emerald-600" />
                        {sentInterestCount} {sentInterestCount === 1 ? 'Interest' : 'Interests'} Sent
                      </span>
                      {passedCount > 0 && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                          <IconX className="h-3.5 w-3.5 text-stone-500" />
                          {passedCount} Passed
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="w-full pt-2 space-y-2 max-w-xs">
                      <Button
                        variant="primary"
                        className="w-full h-11 rounded-full font-bold text-sm shadow-md flex items-center justify-center gap-2 active-press"
                        onClick={() => setViewMode('grid')}
                        leftIcon={<IconLayoutGrid className="h-4 w-4" />}
                      >
                        <span>Explore in Grid View</span>
                      </Button>

                      {passedCount > 0 && (
                        <Button
                          variant="outline"
                          className="w-full h-10 rounded-full font-semibold text-xs border-[var(--border)] bg-white hover:bg-stone-50 flex items-center justify-center gap-1.5 active-press"
                          onClick={handleResetPassed}
                          leftIcon={<IconRotateClockwise className="h-3.5 w-3.5 text-[var(--primary)]" />}
                        >
                          <span>Review Passed Profiles ({passedCount})</span>
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        className="w-full h-9 rounded-full text-xs text-[var(--muted)] hover:text-[var(--foreground)] flex items-center justify-center gap-1.5"
                        onClick={() => setIsFilterOpen(true)}
                        leftIcon={<IconAdjustments className="h-3.5 w-3.5" />}
                      >
                        <span>Adjust Search Filters</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        {/* ======================================================== */}
        {/* GRID VIEW MODE (Default on desktop, mobile when chosen)   */}
        {/* ======================================================== */}
        <div
          className={cn(
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-3 animate-content-appear stagger-3',
            viewMode === 'swipe' ? 'hidden md:grid' : 'grid'
          )}
        >
          {filteredProfiles.map((profile) => {
            const isShortlisted = shortlistedIds.has(profile.id);
            const isInterestSent = sentInterestIds.has(profile.id);
            const isInterestReceived = receivedInterestIds.has(profile.id);

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
                className="group relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-white p-0 shadow-[var(--elevation-card)] hover:shadow-[var(--elevation-floating)] transition-all duration-300 cursor-pointer"
              >
                {/* 3:4 Portrait Photography with Overlay */}
                <div className="relative h-[570px] sm:h-[530px] w-full overflow-hidden bg-[var(--surface-muted)]">
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2D121B] via-[#4A1828] to-[#1F0B13] p-6 text-center select-none">
                      <div className="grid h-28 w-28 place-items-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-2xl">
                        <span className="font-editorial-title text-5xl font-bold">
                          {profile.name?.charAt(0)?.toUpperCase() || 'M'}
                        </span>
                      </div>
                      <p className="mt-4 text-base font-bold text-white/90">
                        {profile.name}
                      </p>
                      <p className="text-xs text-white/60 mt-0.5">
                        Photo not uploaded
                      </p>
                    </div>
                  )}

                  {/* Ambient Warm Gradient Overlay */}
                  {profile.image && <div className="absolute inset-0 photo-overlay-warm" aria-hidden="true" />}

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1.5 z-10">
                    <div className="flex items-center gap-1.5">
                      {isInterestSent ? (
                        <Badge
                          tone="accent"
                          size="sm"
                          className="bg-emerald-600/95 text-white font-bold backdrop-blur-md border-emerald-400/50 shadow-xs"
                        >
                          ✓ Interest Sent
                        </Badge>
                      ) : isInterestReceived ? (
                        <Badge
                          tone="accent"
                          size="sm"
                          className="bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold backdrop-blur-md border-rose-400/50 shadow-xs"
                        >
                          ♥ Sent You an Interest
                        </Badge>
                      ) : profile.online ? (
                        <Badge
                          tone="neutral"
                          size="sm"
                          dot
                          dotColor="bg-emerald-500"
                          className="bg-white/90 backdrop-blur-md text-[var(--foreground)] border-white/80 font-medium"
                        >
                          Online now
                        </Badge>
                      ) : profile.lastActiveAt ? (
                        <Badge
                          tone="neutral"
                          size="sm"
                          className="bg-black/50 text-white/95 backdrop-blur-md border-white/20 text-[10px] font-medium"
                        >
                          {formatLastActive(profile.lastActiveAt)}
                        </Badge>
                      ) : null}
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

                    {(profile.profession || profile.education) && (
                      <p className="text-xs font-semibold text-white/90 truncate">
                        {[profile.profession, profile.education].filter(Boolean).join(' · ')}
                      </p>
                    )}

                    {(profile.city || profile.state) && (
                      <p className="flex items-center gap-1 text-xs text-white/85 truncate">
                        <IconMapPin className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
                        <span>
                          {[profile.city, profile.state].filter(Boolean).join(', ')}
                        </span>
                      </p>
                    )}

                    {/* Matrimonial Discovery Actions Floating in Overlay */}
                    <div className="w-full pt-2.5 flex items-center justify-between md:justify-center gap-2 sm:gap-2.5 lg:gap-4 md:px-2">
                      {/* Pass button: Highlighted 360° circle */}
                      <Button
                        variant="secondary"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePass(profile.id);
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
                          if (isInterestSent) return;
                          handleSendInterest(profile.id, profile.name);
                        }}
                        className={cn(
                          "rounded-full aspect-square h-10 w-10 md:h-12 md:w-12 shrink-0 p-0 flex items-center justify-center backdrop-blur-md transition-all",
                          isInterestSent
                            ? "bg-rose-50 border border-rose-200 text-rose-300 opacity-60 cursor-default"
                            : isInterestReceived
                            ? "bg-gradient-to-tr from-rose-500 to-pink-600 text-white border border-rose-300 hover:scale-110 active-press shadow-lg hover:shadow-xl"
                            : "bg-white/95 text-rose-600 border border-white/70 hover:bg-white hover:scale-110 active-press shadow-lg hover:shadow-xl"
                        )}
                        title={
                          isInterestSent
                            ? "Interest already sent"
                            : isInterestReceived
                            ? "Accept Interest & Connect"
                            : "Send Interest"
                        }
                      >
                        <IconHeart
                          className={cn(
                            "h-5 w-5 md:h-6 md:w-6",
                            isInterestSent
                              ? "fill-rose-600 opacity-50"
                              : isInterestReceived
                              ? "fill-white text-white"
                              : "fill-rose-600"
                          )}
                        />
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
              onClick={handleApplyFilters}
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

            <div>
              <ModernSelect
                label="Sort By"
                value={sortBy}
                onChange={(val) => setSortBy(val as SortOption)}
                options={[
                  { value: "recommended", label: "Recommended Matches" },
                  { value: "recent", label: "Recently Active" },
                  { value: "new", label: "New Profiles" },
                  { value: "nearby", label: "Nearby Location" },
                ]}
                size="sm"
              />
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

          {/* 1.5 Height Range */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                Height Range
              </label>
              <span className="text-xs font-bold text-[var(--primary)]">
                {minHeight} – {maxHeight}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <ModernSelect
                  label="Min Height"
                  value={minHeight}
                  onChange={(val) => setMinHeight(val)}
                  options={HEIGHT_SELECT_OPTIONS}
                  size="sm"
                />
              </div>
              <div>
                <ModernSelect
                  label="Max Height"
                  value={maxHeight}
                  onChange={(val) => setMaxHeight(val)}
                  options={HEIGHT_SELECT_OPTIONS}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* 2. Gender Preference */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                Looking for
              </label>
              <span className="text-[10px] font-semibold text-[var(--accent)] bg-[var(--accent-light)]/20 px-2 py-0.5 rounded-full">
                Foundation Matchmaking
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(myGender === 'male' || myGender === 'man'
                ? [{ value: 'women', label: 'Seeking Brides (Women)' }]
                : myGender === 'female' || myGender === 'woman'
                ? [{ value: 'men', label: 'Seeking Grooms (Men)' }]
                : [
                    { value: 'women', label: 'Seeking Brides (Women)' },
                    { value: 'men', label: 'Seeking Grooms (Men)' },
                  ]
              ).map((g) => (
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

          {/* 12. Diet Habits */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
              Diet Habits
            </label>
            <div className="flex flex-wrap gap-2">
              {["Doesn't Matter", 'Vegetarian', 'Eggetarian', 'Non-Vegetarian'].map((diet) => (
                <Chip
                  key={diet}
                  size="sm"
                  selected={selectedDiet === diet}
                  onClick={() => setSelectedDiet(diet)}
                  interactive
                >
                  {diet}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
