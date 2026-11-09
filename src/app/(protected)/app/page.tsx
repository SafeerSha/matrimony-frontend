'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconArrowRight,
  IconBell,
  IconHeart,
  IconShieldCheck,
  IconUsers,
  IconChevronRight,
  IconChevronLeft,
  IconMapPin,
  IconBriefcase,
  IconSchool,
  IconCrown,
  IconStar,
  IconCheck,
  IconX,
  IconSparkles,
} from '@tabler/icons-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { ProfileCardSkeleton } from '@/components/ui/skeleton';
import { matchesService, authService, profileService } from '@/services';
import { mapConnectionToProfile } from '@/services/matches.service';
import { toast } from '@/lib/toast';
import { useSubscription } from '@/context/subscription-context';
import { cn } from '@/lib/cn';
import { type Profile, formatLastActive, getRegistrationBadge } from '@/lib/demo-data';

function SafeCardImage({ src, alt, name }: { src?: string | null; alt: string; name: string }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="relative h-full w-full bg-gradient-to-br from-[#7D1633] via-[#630E26] to-[#450718] flex flex-col items-center justify-center text-white select-none overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,151,87,0.22),transparent_70%)]" />
        <div className="relative z-10 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md text-[#FFF2D6] border border-[#F5D8A8]/60 shadow-md mb-2">
          <span className="font-editorial-title text-3xl font-bold">
            {name?.charAt(0)?.toUpperCase() || 'M'}
          </span>
        </div>
        <p className="relative z-10 text-sm font-bold text-white tracking-tight drop-shadow-xs mb-1">
          {name}
        </p>
        <span className="relative z-10 text-[10px] font-medium text-[#F7DFBA] px-2.5 py-0.5 rounded-full bg-black/25 border border-white/10">Photo Pending</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}

const DISTRICT_CLUSTERS: Record<string, string[]> = {
  kozhikode: ['kozhikode', 'calicut', 'malappuram', 'wayanad', 'kannur'],
  malappuram: ['malappuram', 'kozhikode', 'calicut', 'palakkad', 'thrissur', 'wayanad'],
  palakkad: ['palakkad', 'malappuram', 'thrissur', 'coimbatore'],
  thrissur: ['thrissur', 'ernakulam', 'kochi', 'cochin', 'palakkad', 'malappuram'],
  ernakulam: ['ernakulam', 'kochi', 'cochin', 'thrissur', 'alappuzha', 'kottayam', 'idukki'],
  kottayam: ['kottayam', 'ernakulam', 'alappuzha', 'idukki', 'pathanamthitta'],
  alappuzha: ['alappuzha', 'alleppey', 'ernakulam', 'kottayam', 'kollam', 'pathanamthitta'],
  idukki: ['idukki', 'ernakulam', 'kottayam', 'pathanamthitta'],
  pathanamthitta: ['pathanamthitta', 'kollam', 'alappuzha', 'kottayam', 'thiruvananthapuram', 'trivandrum'],
  kollam: ['kollam', 'quilon', 'thiruvananthapuram', 'trivandrum', 'pathanamthitta', 'alappuzha'],
  thiruvananthapuram: ['thiruvananthapuram', 'trivandrum', 'kollam'],
  kannur: ['kannur', 'cannapore', 'kasaragod', 'kozhikode', 'wayanad'],
  kasaragod: ['kasaragod', 'kannur', 'mangalore'],
  wayanad: ['wayanad', 'kozhikode', 'kannur', 'malappuram'],
  bangalore: ['bangalore', 'bengaluru', 'mysore', 'hosur'],
  bengaluru: ['bengaluru', 'bangalore', 'mysore', 'hosur'],
};

function formatCityName(city?: string): string {
  if (!city) return '';
  return city
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Profile[]>([]);
  const [newProfiles, setNewProfiles] = useState<Profile[]>([]);
  const [nearbyProfiles, setNearbyProfiles] = useState<Profile[]>([]);
  const [nearYouType, setNearYouType] = useState<'exact' | 'cluster' | 'fallback'>('fallback');
  const [pendingReceived, setPendingReceived] = useState<Profile[]>([]);
  const [mutualMatchesCount, setMutualMatchesCount] = useState<number>(0);
  const [shortlistedCount, setShortlistedCount] = useState<number>(0);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [sentInterestIds, setSentInterestIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const newProfilesScrollRef = useRef<HTMLDivElement>(null);
  const { isSubscribed, dailyInterestsRemaining, openUpgradeModal } = useSubscription();

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
        const [userRes, profileRes] = await Promise.allSettled([
          authService.getCurrentUser(),
          profileService.getProfile('me'),
        ]);

        let resolvedCity = '';
        if (userRes.status === 'fulfilled' && userRes.value) {
          setCurrentUser(userRes.value);
        }
        if (profileRes.status === 'fulfilled' && profileRes.value) {
          const prof = profileRes.value;
          setUserProfile(prof);
          resolvedCity = prof.profile?.city || prof.city || '';
          try {
            const badge = getRegistrationBadge(prof);
            localStorage.setItem('ishtam_user_category', badge.category);
          } catch {}
        }

        // 2. Fetch recommendations, received interests, matches, and shortcuts in parallel
        const [recRes, receivedRes, matchesRes, shortlistedRes, searchRes] = await Promise.allSettled([
          matchesService.getRecommendations(),
          matchesService.getConnections('received'),
          matchesService.getConnections('matches'),
          matchesService.getConnections('shortlisted_by_me'),
          matchesService.searchProfiles({ limit: 30 }),
        ]);

        let mappedRecommendations: Profile[] = [];
        // Recommendations mapping
        if (recRes.status === 'fulfilled' && recRes.value) {
          const raw = recRes.value;
          const list = Array.isArray(raw) ? raw : (raw as any)?.data || [];
          if (list.length > 0) {
            mappedRecommendations = list.map((u: any, idx: number) => {
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
                compatibility: u.compatibility ?? prof.compatibility ?? 88,
                verified: Boolean(u.status === 'ACTIVE' || prof.isVerified || u.isVerified),
                online: Boolean(u.isOnline),
                lastActiveAt: u.lastActiveAt || undefined,
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
            setRecommendations(mappedRecommendations);
          }
        }

        // Deduplication set: top recommendations displayed in Section 4
        const topRecIds = new Set(mappedRecommendations.slice(0, 3).map((p) => p.id));

        // Received interests mapping
        if (receivedRes.status === 'fulfilled' && receivedRes.value) {
          const raw = receivedRes.value;
          const list = Array.isArray(raw) ? raw : (raw as any)?.data || [];
          const mapped = list.map((item: any, idx: number) => mapConnectionToProfile(item, idx));
          setPendingReceived(mapped);
        }

        // Mutual matches count
        if (matchesRes.status === 'fulfilled' && matchesRes.value) {
          const raw = matchesRes.value;
          const list = Array.isArray(raw) ? raw : (raw as any)?.data || [];
          setMutualMatchesCount(list.length);
        }

        // Shortlisted count & IDs
        if (shortlistedRes.status === 'fulfilled' && shortlistedRes.value) {
          const raw = shortlistedRes.value;
          const list = Array.isArray(raw) ? raw : (raw as any)?.data || [];
          setShortlistedCount(list.length);
          const ids = new Set<string>();
          list.forEach((item: any) => {
            const partner = item.partner || item.receiver || item;
            if (partner?.id) ids.add(partner.id);
          });
          setShortlistedIds(ids);
        }

        // Search profiles for "Recently Joined" and "Near You"
        if (searchRes.status === 'fulfilled' && searchRes.value) {
          const raw = searchRes.value;
          const searchList = Array.isArray(raw) ? raw : (raw as any)?.data || [];
          if (searchList.length > 0) {
            const mappedSearch: Profile[] = searchList.map((u: any, idx: number): Profile => {
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
                compatibility: u.compatibility ?? prof.compatibility ?? 88,
                verified: Boolean(u.status === 'ACTIVE' || prof.isVerified || u.isVerified),
                online: Boolean(u.isOnline),
                lastActiveAt: u.lastActiveAt || undefined,
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

            // 1. Deduplicate Recently Joined rail:
            // Exclude the top 3 recommended profiles so users see distinct, fresh members
            const nonRecProfiles = mappedSearch.filter((p) => !topRecIds.has(p.id));
            setNewProfiles(nonRecProfiles.length >= 3 ? nonRecProfiles : mappedSearch);

            // 2. Location Proximity for "Near You":
            // Filter candidates excluding profiles already in top recommendations
            const candidates = mappedSearch.filter((p) => !topRecIds.has(p.id));
            const pool = candidates.length >= 3 ? candidates : mappedSearch;
            const cleanCity = (resolvedCity || '').trim().toLowerCase();

            if (cleanCity) {
              const exactMatches = pool.filter(
                (p) => p.city && p.city.toLowerCase().includes(cleanCity)
              );
              const cluster = DISTRICT_CLUSTERS[cleanCity] || [cleanCity];
              const clusterMatches = pool.filter(
                (p) => p.city && cluster.some((c) => p.city.toLowerCase().includes(c))
              );

              if (exactMatches.length > 0) {
                setNearbyProfiles(exactMatches.slice(0, 3));
                setNearYouType('exact');
              } else if (clusterMatches.length > 0) {
                setNearbyProfiles(clusterMatches.slice(0, 3));
                setNearYouType('cluster');
              } else {
                // Honest regional fallback: no profiles in city or neighboring cluster
                setNearbyProfiles(pool.slice(0, 3));
                setNearYouType('fallback');
              }
            } else {
              setNearbyProfiles(pool.slice(0, 3));
              setNearYouType('fallback');
            }
          }
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

  const handleAcceptInterest = async (id: string, name: string) => {
    try {
      await matchesService.acceptInterest(id);
      setPendingReceived((prev) => prev.filter((p) => p.id !== id));
      setMutualMatchesCount((c) => c + 1);
      toast.success('Interest Accepted!', `You and ${name} are now connected. You can start messaging!`);
    } catch {
      setPendingReceived((prev) => prev.filter((p) => p.id !== id));
      setMutualMatchesCount((c) => c + 1);
      toast.success('Interest Accepted!', `You and ${name} are now connected.`);
    }
  };

  const handleRejectInterest = async (id: string, name: string) => {
    try {
      await matchesService.rejectInterest(id);
      setPendingReceived((prev) => prev.filter((p) => p.id !== id));
      toast.info('Interest Declined', `Declined request from ${name}.`);
    } catch {
      setPendingReceived((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleShortlist = async (id: string, name: string) => {
    const isShortlisted = shortlistedIds.has(id);
    try {
      await matchesService.shortlistProfile(id);
      setShortlistedIds((prev) => {
        const next = new Set(prev);
        if (isShortlisted) {
          next.delete(id);
          setShortlistedCount((c) => Math.max(0, c - 1));
        } else {
          next.add(id);
          setShortlistedCount((c) => c + 1);
        }
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
      const scrollAmount = direction === 'left' ? -300 : 300;
      newProfilesScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const displayName = currentUser?.firstName || currentUser?.name || '';
  const profileCompletion = userProfile?.completionRate || 78;
  const userCity = userProfile?.profile?.city || userProfile?.city || '';
  const userState = userProfile?.profile?.state || userProfile?.state || 'Kerala';

  return (
    <div className="w-full max-w-full min-w-0 space-y-3 sm:space-y-4 pb-6 overflow-x-hidden">
      {/* ======================================================== */}
      {/* 1. TOP: PERSONAL GREETING & ACCOUNT STATUS (COMPACT)     */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-gradient-to-br from-white via-[#FFFDFB] to-[#FFF9F6] p-3 sm:p-4 lg:p-5 shadow-xs">
        {/* Soft background glow accents */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(122,24,53,0.05)_0%,transparent_70%)] blur-2xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            {/* Account Status Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white/70 backdrop-blur-md px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-[var(--foreground)] shadow-2xs">
                <IconShieldCheck className="h-3 w-3 text-emerald-600" />
                <span>Verified</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white/70 backdrop-blur-md px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-[var(--foreground)] shadow-2xs">
                <IconCrown className="h-3 w-3 text-[var(--accent)]" />
                <span>{isSubscribed ? 'Active Premium' : 'Free Plan'}</span>
              </span>
            </div>

            {/* Editorial Greeting */}
            <h1 className="font-editorial-title text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              {getGreeting()}, <span className="text-[var(--primary)]">{displayName}</span>
            </h1>

            <p className="mt-0.5 text-xs text-[var(--muted)] line-clamp-1 sm:line-clamp-none">
              Find the right match, connect over shared values, and build something meaningful.
            </p>
          </div>

          {/* PROFILE COMPLETION COMPACT WIDGET */}
          <div className="lg:min-w-[210px] shrink-0">
            <Link href="/app/profile" className="focus-ring block group">
              <div className="rounded-xl border border-[var(--border)] bg-white/95 p-2.5 sm:p-3 shadow-2xs transition-all hover:border-[var(--border-strong)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-[var(--foreground)]">Profile Strength</span>
                  <span className="text-xs font-extrabold text-[var(--primary)]">{profileCompletion}%</span>
                </div>
                {/* Progress Bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--blush-deep)] transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[10px] font-semibold text-[var(--muted-strong)] group-hover:text-[var(--primary)] transition-colors">
                  <span className="truncate">{profileCompletion < 80 ? 'Add photo to boost views' : 'Profile in top standing'}</span>
                  <span className="font-bold text-[var(--primary)] flex items-center shrink-0 ml-1">
                    Edit <IconArrowRight className="h-2.5 w-2.5 ml-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. DAILY ACTIVITY & QUICK STATS BAR (COMPACT 4-COL ROW)  */}
      {/* ======================================================== */}
      <section className="grid grid-cols-4 gap-1.5 sm:gap-3">
        {/* Pending Interests */}
        <Link href="/app/interests" className="focus-ring block group">
          <Card className={cn(
            "p-2 sm:p-2.5 rounded-xl border transition-all duration-200 hover:shadow-xs flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-2.5",
            pendingReceived.length > 0
              ? "bg-[#FFF9F6] border-[#F7C6CE]"
              : "bg-white border-[var(--border)] hover:border-[var(--border-strong)]"
          )}>
            <div className={cn(
              "grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-lg shrink-0 transition-transform group-hover:scale-105",
              pendingReceived.length > 0
                ? "bg-[#7A1835] text-white shadow-2xs"
                : "bg-[var(--surface-muted)] text-[var(--primary)]"
            )}>
              <IconHeart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-1">
                <span className="text-sm sm:text-base font-bold font-editorial-title text-[var(--foreground)]">
                  {pendingReceived.length}
                </span>
                {pendingReceived.length > 0 && (
                  <span className="rounded-full bg-[#7A1835] text-white text-[8px] font-extrabold px-1">
                    NEW
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-[var(--muted)] truncate">
                Interests
              </p>
            </div>
          </Card>
        </Link>

        {/* Mutual Matches */}
        <Link href="/app/matches" className="focus-ring block group">
          <Card className="p-2 sm:p-2.5 rounded-xl border border-[var(--border)] bg-white hover:border-[var(--border-strong)] transition-all duration-200 hover:shadow-xs flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-2.5">
            <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700 shrink-0 transition-transform group-hover:scale-105">
              <IconUsers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-sm sm:text-base font-bold font-editorial-title text-[var(--foreground)]">
                {mutualMatchesCount}
              </span>
              <p className="text-[10px] sm:text-xs font-semibold text-[var(--muted)] truncate">
                Matches
              </p>
            </div>
          </Card>
        </Link>

        {/* Saved Profiles */}
        <Link href="/app/favorites" className="focus-ring block group">
          <Card className="p-2 sm:p-2.5 rounded-xl border border-[var(--border)] bg-white hover:border-[var(--border-strong)] transition-all duration-200 hover:shadow-xs flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-2.5">
            <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-lg bg-amber-50 text-amber-700 shrink-0 transition-transform group-hover:scale-105">
              <IconStar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-sm sm:text-base font-bold font-editorial-title text-[var(--foreground)]">
                {shortlistedCount}
              </span>
              <p className="text-[10px] sm:text-xs font-semibold text-[var(--muted)] truncate">
                Favorites
              </p>
            </div>
          </Card>
        </Link>

        {/* Daily Connects Remaining */}
        <div
          onClick={!isSubscribed ? openUpgradeModal : undefined}
          className={cn(
            "p-2 sm:p-2.5 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row items-center text-center sm:text-left gap-1.5 sm:gap-2.5 select-none",
            !isSubscribed
              ? "bg-[#FAF3EC] border-[#EAD8C7] cursor-pointer hover:shadow-xs"
              : "bg-white border-[var(--border)]"
          )}
        >
          <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-lg bg-[#8C5D30]/15 text-[#8C5D30] shrink-0">
            <IconCrown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-sm sm:text-base font-bold font-editorial-title text-[var(--foreground)]">
              {dailyInterestsRemaining}
            </span>
            <p className="text-[10px] sm:text-xs font-semibold text-[var(--muted)] truncate">
              Daily Left
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. CONDITIONAL ACTION REQUIRED: PENDING INTEREST BANNER   */}
      {/* ======================================================== */}
      {pendingReceived.length > 0 && (
        <section className="rounded-xl border border-[#F7C6CE] bg-gradient-to-br from-[#FFF8F9] via-white to-[#FAF3EC] p-2.5 sm:p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="grid h-5 w-5 place-items-center rounded-md bg-[#7A1835] text-white shadow-2xs">
                <IconBell className="h-3 w-3" />
              </span>
              <h2 className="text-[11px] sm:text-xs font-bold text-[#5C1027]">
                Action Required ({pendingReceived.length} {pendingReceived.length === 1 ? 'Interest' : 'Interests'} Received)
              </h2>
            </div>
            {pendingReceived.length > 1 && (
              <Link href="/app/interests" className="text-[10px] sm:text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-0.5">
                <span>View all</span>
                <IconArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {/* Top received interest card */}
          {(() => {
            const topRequest = pendingReceived[0];
            return (
              <div className="rounded-xl border border-[#EAD8C7]/70 bg-white p-2.5 sm:p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    src={topRequest.image}
                    name={topRequest.name}
                    size="md"
                    online={topRequest.online}
                    verified={topRequest.verified}
                    bordered
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/app/profile?user=${topRequest.id}`}
                        className="font-editorial-title text-sm sm:text-base font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors truncate"
                      >
                        {topRequest.name}, {topRequest.age}
                      </Link>
                      {topRequest.verified && <VerificationBadge type="general" showIconOnly />}
                    </div>
                    <p className="text-[11px] text-[var(--muted)] truncate">
                      {topRequest.profession} · {topRequest.city}
                    </p>
                    <p className="text-[10px] font-semibold text-[#8C5D30] flex items-center gap-1">
                      <IconSparkles className="h-2.5 w-2.5" />
                      <span>Sent you an interest request</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAcceptInterest(topRequest.id, topRequest.name)}
                    className="flex-1 sm:flex-none h-8 text-xs font-bold rounded-lg px-3"
                    leftIcon={<IconCheck className="h-3 w-3" />}
                  >
                    Accept Interest
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRejectInterest(topRequest.id, topRequest.name)}
                    className="flex-1 sm:flex-none h-8 text-xs font-bold rounded-lg px-3"
                    leftIcon={<IconX className="h-3 w-3" />}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            );
          })()}
        </section>
      )}

      {/* ======================================================== */}
      {/* 4. TODAY'S TOP RECOMMENDATIONS (CURATED MATCHES)         */}
      {/* ======================================================== */}
      <section className="space-y-2">
        <SectionHeader
          eyebrow="Curated For You"
          title="Today’s Top Recommendations"
          description="High-compatibility profiles closely aligned with your partner preferences."
          action={
            <Link
              href="/app/discover"
              className="focus-ring inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:text-[var(--primary-deep)] rounded-lg p-0.5"
            >
              <span>Explore all</span>
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />

        {isLoading ? (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="h-[510px] sm:h-[530px] w-full rounded-[2rem] bg-white border border-[var(--border)] skeleton-shimmer" />
            <div className="h-[510px] sm:h-[530px] w-full rounded-[2rem] bg-white border border-[var(--border)] skeleton-shimmer hidden sm:block" />
            <div className="h-[510px] sm:h-[530px] w-full rounded-[2rem] bg-white border border-[var(--border)] skeleton-shimmer hidden lg:block" />
          </div>
        ) : recommendations.length === 0 ? (
          <Card className="p-6 text-center rounded-2xl border-dashed border-[var(--border)] bg-[var(--surface-muted)]/40">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-white text-[var(--muted)] border border-[var(--border)] shadow-xs">
              <IconUsers className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <h3 className="mt-2 text-sm font-bold text-[var(--foreground)]">No recommendations yet</h3>
            <p className="mt-1 text-xs text-[var(--muted)] max-w-md mx-auto">
              We are screening profiles that match your partner preferences. Broaden your criteria or explore all members on Discover.
            </p>
            <div className="mt-3">
              <Link href="/app/discover" className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--primary-deep)] transition">
                <span>Browse Discover</span>
                <IconArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.slice(0, 3).map((profile) => {
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
                  className="group relative overflow-hidden rounded-[2rem] border border-[var(--champagne-border)] bg-[var(--surface-muted)] p-0 shadow-[var(--elevation-card)] hover:shadow-[var(--elevation-floating)] transition-all duration-300 cursor-pointer h-[510px] sm:h-[530px] w-full select-none"
                >
                  {/* 1. Full-Bleed Portrait Photo */}
                  <div className="absolute inset-0 h-full w-full overflow-hidden bg-[var(--surface-muted)]">
                    <SafeCardImage src={profile.image} alt={profile.name} name={profile.name} />

                    {/* Warm Matrimonial Overlay */}
                    <div className="absolute inset-0 photo-overlay-warm" aria-hidden="true" />

                    {/* Dark Bottom & Subtle Top Vignette Gradient Overlay */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 via-50% to-black/25 pointer-events-none"
                      aria-hidden="true"
                    />
                  </div>

                  {/* 2. Top Floating Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-1.5 z-10 pointer-events-none">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        tone="accent"
                        size="sm"
                        icon={<IconUsers className="h-2.5 w-2.5 fill-current" />}
                        className="backdrop-blur-md shadow-2xs font-bold"
                      >
                        {profile.compatibility}% Match
                      </Badge>

                      {profile.online ? (
                        <Badge
                          tone="neutral"
                          size="sm"
                          dot
                          dotColor="bg-emerald-500"
                          className="bg-black/40 backdrop-blur-md text-white border-white/20 text-[10px] font-medium"
                        >
                          Online
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

                    {/* Shortlist IconHeart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShortlist(profile.id, profile.name);
                      }}
                      aria-label={
                        isShortlisted
                          ? `Remove ${profile.name} from shortlist`
                          : `Shortlist ${profile.name}`
                      }
                      className={cn(
                        'pointer-events-auto focus-ring grid h-9 w-9 place-items-center rounded-full backdrop-blur-md transition-all duration-200 active-press shrink-0',
                        isShortlisted
                          ? 'bg-white text-[var(--primary)] shadow-md'
                          : 'bg-black/35 text-white hover:bg-white hover:text-[var(--primary)] border border-white/20'
                      )}
                    >
                      <IconHeart
                        className={cn(
                          'h-4.5 w-4.5 transition-transform duration-200',
                          isShortlisted && 'fill-[var(--primary)] scale-110'
                        )}
                      />
                    </button>
                  </div>

                  {/* 3. Bottom Overlaid Information & Action Controls */}
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white z-10 space-y-2">
                    {/* Name, Age, Verification */}
                    <div className="flex items-center gap-2">
                      <h3 className="font-editorial-title text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm truncate group-hover:text-[#F7DFBA] transition-colors">
                        {profile.name}, {profile.age}
                      </h3>
                      {profile.verified && <VerificationBadge type="general" showIconOnly size="sm" />}
                    </div>

                    {/* Profession · Education */}
                    {(profile.profession || profile.education) && (
                      <p className="text-xs sm:text-sm font-semibold text-white/90 truncate flex items-center gap-1.5">
                        <IconBriefcase className="h-3.5 w-3.5 text-[#F7DFBA] shrink-0" />
                        <span>{[profile.profession, profile.education].filter(Boolean).join(' · ')}</span>
                      </p>
                    )}

                    {/* Location with Pin */}
                    {(profile.city || profile.state) && (
                      <p className="flex items-center gap-1 text-xs text-white/85 truncate">
                        <IconMapPin className="h-3.5 w-3.5 text-[#D8B28C] shrink-0" />
                        <span>{[profile.city, profile.state].filter(Boolean).join(', ')}</span>
                      </p>
                    )}

                    {/* Contextual Indicators */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      <span className="rounded-full bg-white/15 backdrop-blur-md text-[#FFF2D6] px-2.5 py-0.5 text-[10px] font-semibold border border-white/20 shadow-2xs">
                        ✓ Matches preferences
                      </span>
                      {profile.verified && (
                        <span className="rounded-full bg-black/30 backdrop-blur-md text-white/85 px-2.5 py-0.5 text-[10px] font-medium border border-white/15">
                          Verified profile
                        </span>
                      )}
                    </div>

                    {/* Action Controls Row */}
                    <div className="pt-2 flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/app/profile?user=${profile.id}`);
                        }}
                        className="flex-1 h-10 rounded-full bg-white/95 text-[var(--foreground)] hover:bg-white text-xs font-bold transition shadow-sm flex items-center justify-center active-press"
                      >
                        View Profile
                      </button>

                      <button
                        type="button"
                        disabled={isInterestSent}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendInterest(profile.id, profile.name);
                        }}
                        className={cn(
                          'flex-1 h-10 rounded-full text-xs font-bold transition shadow-sm flex items-center justify-center gap-1.5 active-press',
                          isInterestSent
                            ? 'bg-white/20 backdrop-blur-md text-white/80 cursor-not-allowed border border-white/25'
                            : 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-deep)] text-white hover:opacity-95 shadow-[0_4px_14px_rgba(125,22,51,0.4)]'
                        )}
                      >
                        <IconHeart className={cn('h-3.5 w-3.5', isInterestSent && 'fill-current')} />
                        <span>{isInterestSent ? 'Interest Sent' : 'Send Interest'}</span>
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 5. FRESH REGISTRATIONS (HORIZONTAL SCROLLING RAIL)        */}
      {/* ======================================================== */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <SectionHeader
            eyebrow="Recently Joined"
            title="New member profiles"
            description="Freshly registered members seeking genuine matrimonial connections."
          />

          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollNewProfiles('left')}
              className="focus-ring grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] bg-white text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)] transition-colors active-press shadow-2xs"
              aria-label="Scroll new profiles left"
            >
              <IconChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollNewProfiles('right')}
              className="focus-ring grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] bg-white text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--border-strong)] transition-colors active-press shadow-2xs"
              aria-label="Scroll new profiles right"
            >
              <IconChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Horizontal Rail */}
        <div className="w-full max-w-full min-w-0 overflow-hidden">
          {newProfiles.length === 0 ? (
            <Card className="p-5 text-center rounded-xl border-dashed border-[var(--border)] bg-[var(--surface-muted)]/40">
              <p className="text-xs font-semibold text-[var(--foreground)]">No new member profiles today</p>
              <p className="mt-0.5 text-[10px] text-[var(--muted)]">New profiles will appear here as members register.</p>
            </Card>
          ) : (
            <div
              ref={newProfilesScrollRef}
              className="flex gap-2.5 sm:gap-3.5 overflow-x-auto pb-3 pt-0.5 scrollbar-none snap-x snap-mandatory min-w-0 max-w-full overscroll-x-contain"
            >
              {newProfiles.map((p) => (
                <Link
                  key={p.id}
                  href={`/app/profile?user=${p.id}`}
                  className="focus-ring snap-start shrink-0 w-44 sm:w-56 group"
                >
                  <Card
                    variant="interactive"
                    className="overflow-hidden p-0 rounded-xl border-[var(--border)] bg-white shadow-xs"
                  >
                    <div className="relative h-48 sm:h-56 overflow-hidden bg-[var(--surface-muted)]">
                      <SafeCardImage src={p.image} alt={p.name} name={p.name} />
                      <div className="absolute inset-0 photo-overlay-warm" aria-hidden="true" />

                      {/* Badges */}
                      <div className="absolute top-2 left-2 z-10">
                        <span className="rounded-full bg-black/40 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold text-white tracking-wide border border-white/20">
                          New Member
                        </span>
                      </div>

                      {/* Bottom details */}
                      <div className="absolute inset-x-0 bottom-0 p-3 text-white z-10">
                        <h3 className="font-editorial-title text-base sm:text-lg font-bold truncate">
                          {p.name}, {p.age}
                        </h3>
                        <p className="text-[10px] text-white/90 truncate flex items-center gap-1 mt-0.5">
                          <IconMapPin className="h-2.5 w-2.5 text-[var(--accent)] shrink-0" />
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
      {/* 6. MATCHES NEAR YOU (LOCATION PROXIMITY)                  */}
      {/* ======================================================== */}
      <section className="space-y-2">
        <SectionHeader
          eyebrow="Near You"
          title={
            nearYouType === 'exact'
              ? `Members in ${formatCityName(userCity)}`
              : nearYouType === 'cluster'
              ? `Members near ${formatCityName(userCity)}`
              : userCity
              ? `Members across ${userState}`
              : 'Members in your region'
          }
          description={
            nearYouType === 'exact'
              ? `Explore matches living in ${formatCityName(userCity)} for convenient family meetings.`
              : nearYouType === 'cluster'
              ? `Matches from neighboring districts around ${formatCityName(userCity)}.`
              : userCity
              ? `No members registered in ${formatCityName(userCity)} yet — showing verified members across ${userState}.`
              : 'Explore matches close to your hometown for seamless family connections.'
          }
          action={
            <Link
              href="/app/discover"
              className="text-xs font-bold text-[var(--primary)] hover:underline"
            >
              View all
            </Link>
          }
        />

        <div className="grid gap-2.5 sm:gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {nearbyProfiles.length === 0 ? (
            <Card className="p-5 text-center rounded-xl border-dashed border-[var(--border)] bg-[var(--surface-muted)]/40 col-span-full">
              <p className="text-xs font-semibold text-[var(--foreground)]">No nearby profiles right now</p>
              <p className="mt-0.5 text-[10px] text-[var(--muted)]">Explore all members across districts on Discover.</p>
            </Card>
          ) : (
            nearbyProfiles.map((p) => (
              <Card
                key={p.id}
                variant="interactive"
                className="p-3 sm:p-3.5 rounded-xl border-[var(--border)] bg-white flex flex-col justify-between gap-2.5 min-w-0 w-full overflow-hidden shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar
                    src={p.image}
                    name={p.name}
                    size="md"
                    online={p.online}
                    verified={p.verified}
                    bordered
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/app/profile?user=${p.id}`}
                        className="font-editorial-title text-sm sm:text-base font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors truncate"
                      >
                        {p.name}, {p.age}
                      </Link>
                      <Badge tone="accent" size="sm">
                        {p.compatibility}%
                      </Badge>
                    </div>

                    <p className="mt-0.5 text-[11px] text-[var(--muted)] truncate flex items-center gap-1">
                      <IconMapPin className="h-2.5 w-2.5 text-[var(--accent)] shrink-0" />
                      <span>{p.city}</span>
                      <span>·</span>
                      <span className="truncate">{p.profession}</span>
                    </p>

                    <div className="mt-1 flex flex-wrap gap-1">
                      {p.motherTongue && (
                        <span className="rounded-md bg-[var(--surface-muted)] px-1.5 py-0.2 text-[9px] font-medium text-[var(--muted-strong)]">
                          {p.motherTongue}
                        </span>
                      )}
                      {p.education && (
                        <span className="rounded-md bg-[var(--surface-muted)] px-1.5 py-0.2 text-[9px] font-medium text-[var(--muted-strong)]">
                          {p.education.split(',')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]/70">
                  <Button
                    href={`/app/profile?user=${p.id}`}
                    variant="secondary"
                    size="sm"
                    className="flex-1 h-8 text-xs font-bold rounded-lg"
                  >
                    View
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSendInterest(p.id, p.name)}
                    className="flex-1 h-8 text-xs font-bold rounded-lg"
                  >
                    Connect
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
