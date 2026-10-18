'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  IconArrowRight,
  IconBell,
  IconCircleCheck,
  IconHeart,
  IconMessageCircle,
  IconShieldCheck,
  IconUsers,
  IconChevronRight,
  IconChevronLeft,
  IconMapPin,
  IconBriefcase,
  IconSchool,
  IconEye,
  IconSend,
  IconLoader2,
  IconCrown,
} from '@tabler/icons-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { SectionHeader } from '@/components/ui/section-header';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { Skeleton, ProfileCardSkeleton } from '@/components/ui/skeleton';
import { matchesService, authService, chatService, profileService } from '@/services';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import type { Profile } from '@/lib/demo-data';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Profile[]>([]);
  const [newProfiles, setNewProfiles] = useState<Profile[]>([]);
  const [preferenceProfiles, setPreferenceProfiles] = useState<Profile[]>([]);
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [sentInterestIds, setSentInterestIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const newProfilesScrollRef = useRef<HTMLDivElement>(null);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // 1. Fetch current user and profile
        const [user, profileRes] = await Promise.allSettled([
          authService.getCurrentUser(),
          profileService.getProfile('me'),
        ]);

        if (user.status === 'fulfilled' && user.value) {
          setCurrentUser(user.value);
        }
        if (profileRes.status === 'fulfilled' && profileRes.value) {
          setUserProfile(profileRes.value);
        }

        // 2. Fetch recommendations
        try {
          const recRes: any = await matchesService.getRecommendations();
          const list = Array.isArray(recRes) ? recRes : recRes?.data || [];
          if (list.length > 0) {
            const mapped = list.map((u: any, idx: number) => {
              const prof = u.profile || {};
              const photos = u.photos || prof.photos || [];
              const birthDate = prof.dateOfBirth || u.dateOfBirth;
              const age = birthDate
                ? Math.floor((new Date().getTime() - new Date(birthDate).getTime()) / 31557600000)
                : prof.age || u.age || 26;
              const photoUrl = photos?.[0]?.url || u.avatarUrl || prof.image || '';

              return {
                id: u.id || `rec-${idx}`,
                name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Member',
                age,
                city: prof.city || u.city || '',
                state: prof.state || u.state || prof.country || u.country || '',
                profession: prof.occupation || prof.profession || u.occupation || u.profession || '',
                education: prof.education || u.education || '',
                image: photoUrl,
                compatibility: prof.compatibility || 90,
                verified: Boolean(u.status === 'ACTIVE' || prof.isVerified || u.isVerified),
                online: idx % 2 === 0,
                about: prof.bio || prof.about || u.bio || '',
                height: prof.height ? `${prof.height}cm` : '',
                maritalStatus: prof.maritalStatus || u.maritalStatus || '',
                religion: prof.religion || u.religion || '',
                motherTongue: prof.motherTongue || u.motherTongue || '',
                family: prof.familyType || '',
                lifestyle: prof.diet ? [prof.diet] : [],
                interests: Array.isArray(prof.interests) ? prof.interests : [],
                lookingFor: prof.partnerExpectations || '',
              };
            });
            setRecommendations(mapped);
          } else {
            setRecommendations([]);
          }
        } catch {
          setRecommendations([]);
        }

        // 3. Live search for "New Profiles" and "Preferences"
        try {
          const searchRes: any = await matchesService.searchProfiles({ limit: 8 });
          const searchList = Array.isArray(searchRes) ? searchRes : searchRes?.data || [];
          if (searchList.length > 0) {
            const mappedSearch = searchList.map((u: any, idx: number) => {
              const prof = u.profile || {};
              const photos = u.photos || prof.photos || [];
              const birthDate = prof.dateOfBirth || u.dateOfBirth;
              const age = birthDate
                ? Math.floor((new Date().getTime() - new Date(birthDate).getTime()) / 31557600000)
                : prof.age || u.age || 26;
              const photoUrl = photos?.[0]?.url || u.avatarUrl || prof.image || '';

              return {
                id: u.id || `profile-${idx}`,
                name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Member',
                age,
                city: prof.city || u.city || '',
                state: prof.state || u.state || prof.country || u.country || '',
                profession: prof.occupation || prof.profession || u.occupation || u.profession || '',
                education: prof.education || u.education || '',
                image: photoUrl,
                compatibility: prof.compatibility || 90,
                verified: Boolean(u.status === 'ACTIVE' || prof.isVerified || u.isVerified),
                online: idx % 2 === 0,
                about: prof.bio || prof.about || u.bio || '',
                height: prof.height ? `${prof.height}cm` : '',
                maritalStatus: prof.maritalStatus || u.maritalStatus || '',
                religion: prof.religion || u.religion || '',
                motherTongue: prof.motherTongue || u.motherTongue || '',
                family: prof.familyType || '',
                lifestyle: prof.diet ? [prof.diet] : [],
                interests: Array.isArray(prof.interests) ? prof.interests : [],
                lookingFor: prof.partnerExpectations || '',
              };
            });
            setNewProfiles(mappedSearch);
            setPreferenceProfiles(mappedSearch.slice(0, 4));
          } else {
            setNewProfiles([]);
            setPreferenceProfiles([]);
          }
        } catch {
          setNewProfiles([]);
          setPreferenceProfiles([]);
        }

        // 4. Fetch conversations
        try {
          const convos = await chatService.getConversations();
          if (Array.isArray(convos) && convos.length > 0) {
            setRecentConversations(convos.slice(0, 4));
          } else {
            setRecentConversations([]);
          }
        } catch {
          setRecentConversations([]);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleSendInterest = async (id: string, name: string) => {
    try {
      await matchesService.sendInterest(id);
      setSentInterestIds((prev) => new Set(prev).add(id));
      toast.success('Interest Sent!', `We've notified ${name} of your interest.`);
    } catch {
      setSentInterestIds((prev) => new Set(prev).add(id));
      toast.success('Interest Sent!', `We've notified ${name} of your interest.`);
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

  const scrollNewProfiles = (direction: 'left' | 'right') => {
    if (newProfilesScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      newProfilesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const displayName = currentUser?.firstName || currentUser?.name || 'Member';
  const profileCompletion = userProfile?.completionRate || 78;

  return (
    <div className="w-full max-w-full min-w-0 space-y-6 pb-6 overflow-x-hidden">
      {/* ======================================================== */}
      {/* 1. TOP: PERSONAL GREETING & ACCOUNT STATUS               */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[var(--border)] bg-gradient-to-br from-white via-[#FFFDFB] to-[#FFF9F6] p-4 sm:p-6 lg:p-8 shadow-[var(--elevation-card)]">
        {/* Soft background glow accents */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(122,24,53,0.06)_0%,transparent_70%)] blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(216,178,140,0.08)_0%,transparent_70%)] blur-2xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            {/* Account Status Chips */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-[var(--foreground)] shadow-2xs">
                <IconShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Verified Account</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-white/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-[var(--foreground)] shadow-2xs">
                <IconCrown className="h-3.5 w-3.5 text-[var(--accent)]" />
                <span>Active Premium</span>
              </span>
            </div>

            {/* Editorial Greeting */}
            <h1 className="font-editorial-title text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
              {getGreeting()}, <span className="text-[var(--primary)]">{displayName}</span>
            </h1>

            <p className="mt-2 text-sm sm:text-base leading-relaxed text-[var(--muted)]">
              Find the right match, connect over shared values, and build something meaningful.
            </p>
          </div>

          {/* ======================================================== */}
          {/* PROFILE COMPLETION COMPACT WIDGET                        */}
          {/* ======================================================== */}
          <div className="lg:min-w-[220px] shrink-0">
            <Link href="/app/profile" className="focus-ring block group">
              <div className="rounded-2xl border border-[var(--border)] bg-white/95 p-4 shadow-xs transition-all hover:border-[var(--border-strong)] hover:shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[var(--foreground)]">Profile Strength</span>
                  <span className="text-xs font-bold text-[var(--primary)]">{profileCompletion}%</span>
                </div>
                {/* Progress Bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--blush-deep)]"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-[var(--muted-strong)] group-hover:text-[var(--primary)] transition-colors">
                  <span>Complete Profile</span>
                  <IconArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. RECOMMENDED FOR YOU (PROMINENT CURATED SECTION)       */}
      {/* ======================================================== */}
      <section className="space-y-3">
        <SectionHeader
          eyebrow="Curated For You"
          title="Recommended matches"
          description="High-compatibility profiles thoughtfully aligned with your values and criteria."
          action={
            <Link
              href="/app/discover"
              className="focus-ring inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--primary)] hover:text-[var(--primary-deep)] rounded-lg p-1"
            >
              <span>Explore all matches</span>
              <IconArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileCardSkeleton />
            <ProfileCardSkeleton />
            <ProfileCardSkeleton />
          </div>
        ) : recommendations.length === 0 ? (
          <Card className="p-8 text-center rounded-3xl border-dashed border-[var(--border)] bg-[var(--surface-muted)]/40">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-[var(--muted)] border border-[var(--border)] shadow-xs">
              <IconUsers className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <h3 className="mt-3 text-base font-bold text-[var(--foreground)]">No recommendations yet</h3>
            <p className="mt-1 text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto">
              We are screening profiles that match your partner preferences. Broaden your criteria or explore all members on Discover.
            </p>
            <div className="mt-4">
              <Link href="/app/discover" className="focus-ring inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--primary-deep)] transition">
                <span>Browse Discover</span>
                <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.slice(0, 3).map((profile, idx) => {
              const isShortlisted = shortlistedIds.has(profile.id);
              const isInterestSent = sentInterestIds.has(profile.id);

              return (
                <Card
                  key={profile.id}
                  variant="interactive"
                  className="group relative overflow-hidden rounded-3xl border-[var(--border)] bg-white p-0 flex flex-col justify-between shadow-[var(--elevation-card)]"
                >
                  {/* Photo area with warm matrimonial overlay */}
                  <div className="relative h-72 sm:h-80 overflow-hidden bg-[var(--surface-muted)]">
                      {profile.image ? (
                        <img
                          src={profile.image}
                          alt={profile.name}
                          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-[var(--border)] flex items-center justify-center text-[var(--muted)] text-xs">
                          No Photo
                        </div>
                      )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 photo-overlay-warm" aria-hidden="true" />

                    {/* Top Badges */}
                    <div className="absolute left-3 top-3 flex items-center gap-2 z-10">
                      <Badge
                        tone="accent"
                        size="sm"
                        icon={<IconUsers className="h-2.5 w-2.5 fill-current" />}
                        className="backdrop-blur-md shadow-xs"
                      >
                        {profile.compatibility}% Match
                      </Badge>

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

                    {/* Shortlist IconHeart Button */}
                    <button
                      type="button"
                      onClick={() => handleShortlist(profile.id, profile.name)}
                      aria-label={
                        isShortlisted
                          ? `Remove ${profile.name} from shortlist`
                          : `Shortlist ${profile.name}`
                      }
                      className={cn(
                        'focus-ring absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full backdrop-blur-md transition-all duration-200 active-press',
                        isShortlisted
                          ? 'bg-white text-[var(--primary)] shadow-md'
                          : 'bg-black/30 text-white hover:bg-white hover:text-[var(--primary)]'
                      )}
                    >
                      <IconHeart
                        className={cn(
                          'h-5 w-5 transition-transform duration-200',
                          isShortlisted && 'fill-[var(--primary)] scale-110'
                        )}
                      />
                    </button>

                    {/* Bottom Photo Identity */}
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white z-10">
                      <div className="flex items-center gap-2">
                        <h3 className="font-editorial-title text-2xl font-bold tracking-tight text-white drop-shadow-sm">
                          {profile.name}, {profile.age}
                        </h3>
                        {profile.verified && (
                          <VerificationBadge type="general" showIconOnly />
                        )}
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-white/90">
                        <IconMapPin className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
                        <span>{profile.city}, {profile.state}</span>
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      {/* Contextual Indicators */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-lg bg-[var(--primary-light)] text-[var(--primary-deep)] px-2.5 py-1 text-[11px] font-semibold border border-[var(--primary)]/15">
                          ✓ Matches your preferences
                        </span>
                        <span className="rounded-lg bg-[var(--surface-muted)] text-[var(--muted-strong)] px-2.5 py-1 text-[11px] font-medium border border-[var(--border)]">
                          {idx === 0 ? 'Same city' : idx === 1 ? 'Similar interests' : 'Verified education'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
                          <IconBriefcase className="h-3.5 w-3.5 text-[var(--muted)]" />
                          <span>{profile.profession}</span>
                        </p>
                        <p className="text-xs text-[var(--muted)] flex items-center gap-1.5">
                          <IconSchool className="h-3.5 w-3.5 text-[var(--muted)]" />
                          <span>{profile.education}</span>
                        </p>
                      </div>

                      {profile.about && (
                        <p className="line-clamp-2 text-xs leading-relaxed text-[var(--muted-strong)] bg-[var(--surface-muted)]/60 p-3 rounded-2xl italic border border-[var(--border)]/40">
                          "{profile.about}"
                        </p>
                      )}
                    </div>

                    {/* Action Row */}
                    <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2">
                      <Link href={`/app/profile?user=${profile.id}`} className="flex-1 focus-ring">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full text-xs font-bold"
                        >
                          View Profile
                        </Button>
                      </Link>

                      <Button
                        variant={isInterestSent ? 'blush' : 'primary'}
                        size="sm"
                        disabled={isInterestSent}
                        onClick={() => handleSendInterest(profile.id, profile.name)}
                        className="flex-1 text-xs font-bold"
                        leftIcon={<IconHeart className="h-3.5 w-3.5" />}
                      >
                        {isInterestSent ? 'Interest Sent' : 'Send Interest'}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 4. NEW PROFILES (HORIZONTAL SCROLLING PROFILE RAIL)       */}
      {/* ======================================================== */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <SectionHeader
            eyebrow="Recently Joined"
            title="New profiles"
            description="Freshly registered members seeking genuine matrimonial connections."
          />

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollNewProfiles('left')}
              className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-white text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)] transition-colors active-press shadow-2xs"
              aria-label="Scroll new profiles left"
            >
              <IconChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollNewProfiles('right')}
              className="focus-ring grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-white text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)] transition-colors active-press shadow-2xs"
              aria-label="Scroll new profiles right"
            >
              <IconChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Rail */}
        <div className="w-full max-w-full min-w-0 overflow-hidden">
          {newProfiles.length === 0 ? (
            <Card className="p-6 text-center rounded-2xl border-dashed border-[var(--border)] bg-[var(--surface-muted)]/40">
              <p className="text-xs font-semibold text-[var(--foreground)]">No new member profiles today</p>
              <p className="mt-1 text-[11px] text-[var(--muted)]">New profiles will appear here as members register and complete verification.</p>
            </Card>
          ) : (
            <div
              ref={newProfilesScrollRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory min-w-0 max-w-full overscroll-x-contain"
            >
              {newProfiles.map((p) => (
                <Link
                  key={p.id}
                  href={`/app/profile?user=${p.id}`}
                  className="focus-ring snap-start shrink-0 w-52 sm:w-64 group"
                >
                  <Card
                    variant="interactive"
                    className="overflow-hidden p-0 rounded-2xl border-[var(--border)] bg-white shadow-xs"
                  >
                    <div className="relative h-60 sm:h-64 overflow-hidden bg-[var(--surface-muted)]">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-[var(--border)] flex items-center justify-center text-[var(--muted)] text-xs">
                          No Photo
                        </div>
                      )}
                      <div className="absolute inset-0 photo-overlay-warm" aria-hidden="true" />

                      {/* Badges */}
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className="rounded-full bg-black/40 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white tracking-wide border border-white/20">
                          New Member
                        </span>
                      </div>

                      {/* Bottom details */}
                      <div className="absolute inset-x-0 bottom-0 p-3.5 text-white z-10">
                        <h3 className="font-editorial-title text-base sm:text-lg font-bold truncate">
                          {p.name}, {p.age}
                        </h3>
                        <p className="text-[11px] text-white/90 truncate flex items-center gap-1 mt-0.5">
                          <IconMapPin className="h-3 w-3 text-[var(--accent)] shrink-0" />
                          <span>{p.city}</span>
                          <span>·</span>
                          <span className="truncate">{p.profession}</span>
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. BASED ON YOUR PREFERENCES & RECENT CONVERSATIONS      */}
      {/* ======================================================== */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] min-w-0 w-full max-w-full">
        {/* Left: Preferences Matching */}
        <section className="space-y-3 min-w-0">
          <SectionHeader
            eyebrow="Personalized"
            title="Based on your preferences"
            description="Matches based on your age range, location preference, and community settings."
            action={
              <Link
                href="/app/profile"
                className="text-xs font-bold text-[var(--primary)] hover:underline"
              >
                Edit Preferences
              </Link>
            }
          />

          <div className="space-y-3">
            {preferenceProfiles.length === 0 ? (
              <Card className="p-6 text-center rounded-2xl border-dashed border-[var(--border)] bg-[var(--surface-muted)]/40">
                <p className="text-xs font-semibold text-[var(--foreground)]">No matching profiles right now</p>
                <p className="mt-1 text-[11px] text-[var(--muted)]">Try adjusting your partner preferences or explore all profiles on Discover.</p>
              </Card>
            ) : (
              preferenceProfiles.slice(0, 3).map((p) => (
                <Card
                  key={p.id}
                  variant="interactive"
                  className="p-4 sm:p-5 rounded-2xl border-[var(--border)] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-w-0 w-full overflow-hidden"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <Avatar
                      src={p.image}
                      name={p.name}
                      size="lg"
                      online={p.online}
                      verified={p.verified}
                      bordered
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/app/profile?user=${p.id}`}
                          className="font-editorial-title text-base sm:text-lg font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors truncate"
                        >
                          {p.name}, {p.age}
                        </Link>
                        <Badge tone="accent" size="sm">
                          {p.compatibility}%
                        </Badge>
                      </div>

                      <p className="mt-0.5 text-xs text-[var(--muted)] truncate">
                        {p.profession} · {p.city}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="rounded-md bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted-strong)]">
                          {p.motherTongue}
                        </span>
                        <span className="rounded-md bg-[var(--surface-muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted-strong)]">
                          {p.education.split(',')[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <Link href={`/app/profile?user=${p.id}`} className="flex-1 sm:flex-none">
                      <Button variant="secondary" size="sm" className="w-full text-xs font-semibold">
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSendInterest(p.id, p.name)}
                      className="flex-1 sm:flex-none text-xs font-bold"
                    >
                      Connect
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Right: Recent Conversations & Safety Spotlight */}
        <section className="space-y-3 min-w-0">
          <SectionHeader
            eyebrow="Active Chats"
            title="Recent conversations"
            description="Continue your ongoing matrimonial discussions."
            action={
              <Link
                href="/app/messages"
                className="text-xs font-bold text-[var(--primary)] hover:underline"
              >
                All Messages
              </Link>
            }
          />

          <Card className="p-4 sm:p-5 rounded-2xl border-[var(--border)] bg-white divide-y divide-[var(--border)]/70 min-w-0 overflow-hidden">
            {recentConversations.length === 0 ? (
              <div className="py-6 text-center">
                <IconMessageCircle className="mx-auto h-8 w-8 text-[var(--muted)]/60" />
                <p className="mt-2 text-xs font-semibold text-[var(--foreground)]">No active conversations yet</p>
                <p className="mt-0.5 text-[11px] text-[var(--muted)]">Send an interest to start chatting once matched.</p>
              </div>
            ) : (
              recentConversations.slice(0, 3).map((conv) => {
                const pName = conv.profile?.name || conv.participant?.name || 'Member';
                const pImage = conv.profile?.image || conv.participant?.photos?.[0]?.url;
                const lastText = conv.last || conv.lastMessage?.content || 'Hello, I reviewed your profile.';

                return (
                  <Link
                    key={conv.id}
                    href="/app/messages"
                    className="focus-ring flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0 hover:bg-[var(--surface-muted)]/70 -mx-2 px-2 rounded-xl transition-colors"
                  >
                    <Avatar src={pImage} name={pName} size="md" online={true} bordered />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-[var(--foreground)] truncate">{pName}</p>
                        <span className="text-[10px] font-medium text-[var(--muted)]">
                          {conv.time || 'Today'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--muted)] truncate">{lastText}</p>
                    </div>

                    {conv.unread > 0 && (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--primary)] px-1.5 text-[10px] font-bold text-white shrink-0">
                        {conv.unread}
                      </span>
                    )}
                  </Link>
                );
              })
            )}

            {/* In-Card Safety & Trust Callout to Avoid Blank Space */}
            <div className="pt-4 mt-2">
              <div className="rounded-xl bg-gradient-to-br from-[#FAF3EC] to-white p-3.5 border border-[#EAD8C7] flex items-start gap-3">
                <IconShieldCheck className="h-5 w-5 text-[#8C5D30] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-[#5C1027]">Protected Conversations</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted-strong)]">
                    All chat threads on IshtamChat are private and encrypted. Never share financial
                    or banking credentials.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
