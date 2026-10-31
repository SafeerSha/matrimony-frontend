'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import {
  IconArrowLeft,
  IconCircleCheck,
  IconHeart,
  IconLock,
  IconMapPin,
  IconMessageCircle,
  IconBookmark,
  IconStar,
  IconStarFilled,
  IconShieldCheck,
  IconBriefcase,
  IconSchool,
  IconUsers,
  IconHome,
  IconCompass,
  IconCalendar,
  IconRuler,
  IconBook2 as IconBookOpen,
  IconShare as IconShare2,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconFlag,
  IconCoffee,
  IconCheck,
  IconMoodSmile as IconSmile,
  IconShield,
  IconClock,
  IconAward,
  IconBan,
} from '@tabler/icons-react';
import { getProfileUniqueId, formatLastActive } from '@/lib/demo-data';
import { PageLoader } from '@/components/ui/page-loader';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { ProfileCard } from '@/components/profile/profile-card';
import { matchesService, profileService } from '@/services';
import { toast } from '@/lib/toast';
import { useSubscription } from '@/context/subscription-context';
import { cn } from '@/lib/cn';
import type { Profile } from '@/lib/demo-data';

export function ProfileDetail({ id }: { id?: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [relatedProfiles, setRelatedProfiles] = useState<Profile[]>([]);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [brokenPhotos, setBrokenPhotos] = useState<Record<number, boolean>>({});
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isInterestSent, setIsInterestSent] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  const [isInterestReceived, setIsInterestReceived] = useState(false);
  const [isDeclined, setIsDeclined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showFloatingDock, setShowFloatingDock] = useState(false);
  const inlineActionsRef = useRef<HTMLDivElement>(null);
  const { isSubscribed, openChatPrompt } = useSubscription();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChatClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!profile) return;
    if (!isSubscribed) {
      openChatPrompt();
      return;
    }
    router.push(`/app/messages?user=${profile.id}`);
  };

  // Show floating dock only once the inline buttons section has scrolled past view
  useEffect(() => {
    const handleScroll = () => {
      if (!inlineActionsRef.current) return;
      const rect = inlineActionsRef.current.getBoundingClientRect();
      setShowFloatingDock(rect.bottom < 60);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync state if id changes
  useEffect(() => {
    setIsLoading(true);
    setActivePhotoIdx(0);
    setBrokenPhotos({});
    setIsInterestSent(false);
    setIsMatched(false);
    setIsInterestReceived(false);
    setIsShortlisted(false);
    setIsDeclined(false);

    const targetId = id || 'me';
    profileService
      .getProfile(targetId)
      .then((res: any) => {
        if (res) {
          const calculatedAge =
            res.age !== undefined && res.age !== null
              ? res.age
              : res.dateOfBirth
                ? Math.floor((new Date().getTime() - new Date(res.dateOfBirth).getTime()) / 31557600000)
                : 26;

          const primaryImg =
            res.photos?.find((p: any) => p.isPrimary)?.url ||
            res.photos?.[0]?.url ||
            res.avatarUrl ||
            '';

          const isMutual = Boolean(res.isMatched || res.connectionStatus === 'MATCHED');
          const isDeclinedStatus = Boolean(
            res.isDeclined ||
            res.isDeclinedByThem ||
            res.connectionStatus === 'REJECTED'
          );

          setIsMatched(isMutual);
          setIsDeclined(isDeclinedStatus);
          setIsInterestSent(Boolean(!isDeclinedStatus && (res.isInterestSent || isMutual || res.connectionStatus === 'SENT')));
          setIsInterestReceived(Boolean(!isDeclinedStatus && (res.isInterestReceived || res.connectionStatus === 'RECEIVED')));
          setIsShortlisted(Boolean(!isDeclinedStatus && (res.isShortlisted || res.connectionStatus === 'SHORTLISTED')));

          setProfile({
            id: res.id || targetId,
            profileId: res.profileId,
            name: res.name || `${res.firstName || ''} ${res.lastName || ''}`.trim() || 'Member',
            age: calculatedAge,
            city: res.city || '',
            state: res.state || '',
            motherTongue: res.motherTongue || '',
            verified: res.isVerified ?? true,
            profession: res.occupation || res.profession || '',
            education: res.education || '',
            employmentStatus: res.employmentStatus || '',
            annualIncome: res.annualIncome || '',
            about: res.bio || '',
            family: res.family || '',
            fatherName: res.fatherName || '',
            fatherAlive: res.fatherAlive,
            motherAlive: res.motherAlive,
            brothersCount: res.brothersCount ?? 0,
            brothersMarried: res.brothersMarried ?? 0,
            sistersCount: res.sistersCount ?? 0,
            sistersMarried: res.sistersMarried ?? 0,
            lookingFor: res.lookingFor || '',
            lifestyle: Array.isArray(res.lifestyle) ? res.lifestyle : [],
            interests: Array.isArray(res.interests) ? res.interests : [],
            image: primaryImg,
            photos: res.photos || [],
            compatibility: (res as any).compatibility ?? 88,
            compatibilityHighlights: (res as any).compatibilityHighlights || [],
            preferences: res.preferences || {},
            height: res.height ? (String(res.height).includes('cm') ? String(res.height) : `${res.height}cm`) : '',
            maritalStatus: res.maritalStatus || '',
            religion: res.religion || '',
            caste: res.caste || '',
            gender: res.gender || '',
            profileFor: res.profileFor || 'Self',
            nationality: res.nationality || 'Indian',
            country: res.country || 'India',
            diet: res.diet || '',
          });
        } else {
          setProfile(null);
        }
      })
      .catch((err) => {
        console.error('Error fetching profile:', err);
        setProfile(null);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Also cross-verify against mutual matches list
    matchesService
      .getConnections('matches')
      .then((matchesRes: any) => {
        const matchesList = Array.isArray(matchesRes) ? matchesRes : matchesRes?.data || [];
        const isMutual = matchesList.some((m: any) => {
          const partnerId = m.partner?.id || m.receiverId || m.senderId || m.id || m.participantId || m.profile?.userId;
          const partnerProfId = m.profileId || m.partner?.profileId || m.receiver?.profileId || m.sender?.profileId;
          return partnerId === targetId || partnerProfId === targetId;
        });
        if (isMutual) {
          setIsMatched(true);
          setIsInterestSent(true);
        }
      })
      .catch(() => {});

    matchesService
      .getRecommendations()
      .then((recs: any) => {
        const list = Array.isArray(recs) ? recs : recs?.data || [];
        const mapped: Profile[] = list
          .filter((u: any) => u.id !== targetId)
          .map((u: any, idx: number) => {
            const prof = u.profile || {};
            const photos = u.photos || prof.photos || [];
            return {
              id: u.id || `rec-${idx}`,
              name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Member',
              age: u.dateOfBirth
                ? Math.floor((new Date().getTime() - new Date(u.dateOfBirth).getTime()) / 31557600000)
                : prof.age || u.age || 26,
              city: prof.city || u.city || '',
              state: prof.state || u.state || '',
              profession: prof.occupation || prof.profession || u.occupation || u.profession || '',
              education: prof.education || u.education || '',
              image: photos?.[0]?.url || u.avatarUrl || prof.image || '',
              compatibility: u.compatibility ?? prof.compatibility ?? 88,
              verified: Boolean(u.status === 'ACTIVE' || prof.isVerified || u.isVerified),
              online: Boolean(u.isOnline),
              lastActiveAt: u.lastActiveAt || undefined,
              about: prof.bio || prof.about || u.bio || '',
              height: prof.height ? `${prof.height}cm` : '',
              maritalStatus: prof.maritalStatus || u.maritalStatus || '',
              religion: prof.religion || u.religion || '',
              motherTongue: prof.motherTongue || u.motherTongue || '',
              family: '',
              lifestyle: Array.isArray(prof.lifestyle) ? prof.lifestyle : [],
              interests: Array.isArray(prof.interests) ? prof.interests : [],
              lookingFor: prof.lookingFor || '',
            };
          });
        setRelatedProfiles(mapped);
      })
      .catch(() => setRelatedProfiles([]));
  }, [id]);

  // Gallery Photos (Multi-angle photos from backend with fallback)
  const galleryPhotos = useMemo(() => {
    if (!profile) return [];
    if (profile.photos && profile.photos.length > 0) {
      return profile.photos.map((p: any) => p.url).filter(Boolean);
    }
    return profile.image ? [profile.image] : [];
  }, [profile]);

  // Shortlist handler
  const handleToggleShortlist = async () => {
    if (!profile || isDeclined) return;
    try {
      await matchesService.shortlistProfile(profile.id);
      setIsShortlisted(!isShortlisted);
      toast.success(
        isShortlisted ? 'Removed from Favorites' : 'Profile Favorited',
        `${profile.name} has been ${isShortlisted ? 'removed from' : 'added to'} your shortlisted profiles.`
      );
    } catch {
      setIsShortlisted(!isShortlisted);
      toast.success(
        isShortlisted ? 'Removed from Favorites' : 'Profile Favorited',
        `${profile.name} has been ${isShortlisted ? 'removed from' : 'added to'} your favorites.`
      );
    }
  };

  // Interest handler
  const handleSendInterest = async () => {
    if (!profile || isInterestSent || isMatched || isDeclined) return;
    try {
      const res: any = await matchesService.sendInterest(profile.id);
      setIsInterestSent(true);
      if (res?.isMatch || res?.status === 'ACCEPTED') {
        setIsMatched(true);
        toast.success("It's a Match!", `You and ${profile.name} are now mutually connected!`);
      } else {
        toast.success('Interest Sent!', `We have notified ${profile.name} of your interest.`);
      }
    } catch (err: any) {
      if (err?.message?.includes('already exists') || err?.status === 400) {
        setIsInterestSent(true);
      }
      toast.info('Interest updated', `Your interest with ${profile.name} has been processed.`);
    }
  };

  // Accept interest handler
  const handleAcceptInterest = async () => {
    if (!profile) return;
    try {
      await matchesService.acceptInterest(profile.id);
      setIsMatched(true);
      setIsInterestSent(true);
      setIsInterestReceived(false);
      toast.success("Interest Accepted!", `You and ${profile.name} are now mutually connected!`);
    } catch {
      setIsMatched(true);
      toast.success("Connected!", `You and ${profile.name} are now connected.`);
    }
  };

  // Share profile
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Link Copied', 'Profile link copied to clipboard.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-4 sm:py-8">
        <PageLoader
          text="Loading profile details..."
          subtitle="Just a moment while we get everything ready"
          showBackgroundDecor
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--surface-muted)] text-[var(--muted)] mx-auto mb-4 border border-[var(--border)]">
          <IconShield className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-[var(--foreground)] font-editorial-title">Profile Not Found</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">This profile may have been removed or is temporarily unavailable.</p>
        <div className="mt-6">
          <Link href="/app/discover">
            <Button variant="primary">Return to Discover</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-40 md:pb-12">
      {/* ======================================================== */}
      {/* 1. TOP BREADCRUMB & UTILITY BAR                          */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/app/discover"
          className="focus-ring inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[var(--muted)] hover:text-[var(--primary)] transition-colors active-press"
        >
          <IconArrowLeft className="h-4 w-4" />
          <span>Back to Discover</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share profile"
            className="focus-ring grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] bg-white text-[var(--muted)] hover:text-[var(--foreground)] hover:border-[var(--primary)] transition"
          >
            <IconShare2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. PROFILE HERO & PHOTOGRAPHY GALLERY HEADER             */}
      {/* ======================================================== */}
      <Card
        variant="default"
        className="overflow-hidden rounded-[2.5rem] border border-[var(--border)] bg-white p-0 shadow-[var(--elevation-floating)]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Main Visual Gallery Showcase (Desktop: 7 cols) */}
          <div className="lg:col-span-7 relative flex flex-col bg-[var(--surface-muted)]">
            {/* Active Hero Portrait Photo */}
            <div className="relative h-[420px] sm:h-[520px] lg:h-[580px] w-full overflow-hidden bg-stone-900">
              {galleryPhotos.length > 0 && !brokenPhotos[activePhotoIdx] ? (
                <img
                  src={galleryPhotos[activePhotoIdx]}
                  alt={`${profile.name} - Photo ${activePhotoIdx + 1}`}
                  className="h-full w-full object-cover object-center transition-all duration-500 ease-out"
                  onError={() => setBrokenPhotos((prev) => ({ ...prev, [activePhotoIdx]: true }))}
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2D121B] via-[#4A1828] to-[#1F0B13] p-8 text-center select-none">
                  <div className="grid h-36 w-36 place-items-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-2xl mb-4">
                    <span className="font-editorial-title text-7xl font-bold">
                      {profile.name?.charAt(0)?.toUpperCase() || 'M'}
                    </span>
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-white/60">
                    Photo not uploaded
                  </p>
                </div>
              )}

              {/* Ambient Warm Gradient Overlay */}
              <div className="absolute inset-0 photo-overlay-warm" aria-hidden="true" />

              {/* Top Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
                <Badge
                  tone="accent"
                  size="md"
                  icon={<IconUsers className="h-3 w-3 fill-current" />}
                  className="backdrop-blur-md shadow-xs text-xs font-bold"
                >
                  {profile.compatibility}% Matches
                </Badge>

                {profile.online ? (
                  <Badge
                    tone="neutral"
                    size="sm"
                    dot
                    dotColor="bg-emerald-500"
                    className="bg-white/95 backdrop-blur-md text-[var(--foreground)] border-white/80 font-semibold"
                  >
                    Active Now
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

              {/* Gallery Counter Badge */}
              {galleryPhotos.length > 1 && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1">
                    Photo {activePhotoIdx + 1} of {galleryPhotos.length}
                  </span>
                </div>
              )}

              {/* Photo Navigation Chevrons */}
              {galleryPhotos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActivePhotoIdx((prev) =>
                        prev > 0 ? prev - 1 : galleryPhotos.length - 1
                      )
                    }
                    aria-label="Previous photo"
                    className="focus-ring absolute left-3 top-1/2 -translate-y-1/2 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md hover:bg-black/60 transition active-press"
                  >
                    <IconChevronLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActivePhotoIdx((prev) =>
                        prev < galleryPhotos.length - 1 ? prev + 1 : 0
                      )
                    }
                    aria-label="Next photo"
                    className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 z-10 grid h-10 w-10 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md hover:bg-black/60 transition active-press"
                  >
                    <IconChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Photo Overlay IconInfo for Mobile/Hero */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white z-10 lg:hidden">
                <div className="flex items-center gap-2">
                  <h1 className="font-editorial-title text-3xl font-bold tracking-tight text-white drop-shadow-md">
                    {profile.name}, {profile.age}
                  </h1>
                  {profile.verified && <VerificationBadge type="general" showIconOnly size="md" />}
                </div>
                {(profile.city || profile.state) && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
                    <IconMapPin className="h-4 w-4 text-[var(--accent)] shrink-0" />
                    <span>
                      {[profile.city, profile.state].filter(Boolean).join(', ')}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Gallery Thumbnails Strip */}
            {galleryPhotos.length > 1 && (
              <div className="p-3 bg-white border-t border-[var(--border)] flex items-center gap-2.5 overflow-x-auto scrollbar-none">
                {galleryPhotos.map((photo: string, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    aria-label={`View photo ${idx + 1}`}
                    className={cn(
                      'relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all active-press focus-ring',
                      activePhotoIdx === idx
                        ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-sm'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    )}
                  >
                    <img
                      src={photo}
                      alt=""
                      className="h-full w-full object-cover object-center"
                    />
                    {activePhotoIdx === idx && (
                      <div className="absolute inset-0 bg-[var(--primary)]/10" />
                    )}
                  </button>
                ))}
                <div className="ml-auto pr-2 text-xs font-semibold text-[var(--muted)] hidden sm:block">
                  Click photo to change view
                </div>
              </div>
            )}
          </div>

          {/* Profile Identity & Primary Actions (Desktop: 5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-5">
              {/* Header Title & Verification */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {profile.verified && <VerificationBadge type="general" size="md" />}
                  {isDeclined && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                      Declined
                    </span>
                  )}
                  <span className="text-xs font-semibold text-[var(--muted)]">
                    Profile ID: {getProfileUniqueId(profile)}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center gap-2.5">
                  <h1 className="font-editorial-title text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
                    {profile.name}, {profile.age}
                  </h1>
                </div>

                <div className="mt-2 flex flex-col gap-1.5 text-sm text-[var(--muted-strong)]">
                  <p className="flex items-center gap-2">
                    <IconBriefcase className="h-4 w-4 text-[var(--primary)] shrink-0" />
                    <span className="font-medium text-[var(--foreground)]">
                      {profile.profession}
                    </span>
                    <span>·</span>
                    <span className="truncate">{profile.education}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <IconMapPin className="h-4 w-4 text-[var(--accent)] shrink-0" />
                    <span>
                      {[profile.city, profile.state, 'India'].filter(Boolean).join(', ')}
                    </span>
                  </p>
                </div>
              </div>

              {/* Quick Key Attributes Grid */}
              <div className="grid grid-cols-[0.9fr_1.25fr_0.9fr] divide-x divide-[var(--border)]/80 rounded-2xl bg-[var(--surface-muted)]/70 p-3 sm:p-3.5 border border-[var(--border)]/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div className="flex flex-col items-center justify-center px-1.5 text-center">
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] whitespace-nowrap">
                    Height
                  </p>
                  <p className="mt-1 text-xs sm:text-sm font-bold text-[var(--foreground)] whitespace-nowrap">
                    {profile.height}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center px-1.5 text-center">
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] whitespace-nowrap">
                    Marital Status
                  </p>
                  <p className="mt-1 text-xs sm:text-sm font-bold text-[var(--foreground)] whitespace-nowrap">
                    {profile.maritalStatus}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center px-1.5 text-center">
                  <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] whitespace-nowrap">
                    Language
                  </p>
                  <p className="mt-1 text-xs sm:text-sm font-bold text-[var(--foreground)] truncate max-w-full">
                    {profile.motherTongue}
                  </p>
                </div>
              </div>

              {/* Introduction Excerpt */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                  About {profile.name.split(' ')[0]}
                </p>
                <p className="text-sm leading-relaxed text-[var(--muted-strong)] italic bg-[#FFFDFB] p-4 rounded-2xl border border-[var(--border)]/70">
                  "{profile.about}"
                </p>
              </div>

              {/* Quick Passions Chips */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Key Interests
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests.map((interest) => (
                    <Chip key={interest} size="sm">
                      {interest}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            {/* Primary Matrimonial Actions */}
            <div ref={inlineActionsRef} className="space-y-3 pt-4 border-t border-[var(--border)]">
              {isMatched ? (
                <>
                  {/* Mutual Connection Celebratory Banner */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50/70 border border-emerald-200/80 text-emerald-900 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-600 text-white shadow-xs">
                        <IconUsers className="h-4.5 w-4.5" />
                      </span>
                      <div>
                        <p className="text-xs font-bold leading-tight text-emerald-950">Mutual Match Connected</p>
                        <p className="text-[11px] text-emerald-700">You and {profile.name.split(' ')[0]} share mutual interest</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white text-emerald-700 border border-emerald-200/80 shadow-2xs">
                      <IconCheck className="h-3 w-3 stroke-[2.5]" /> Connected
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {/* Chat action is the primary prominent button! */}
                    <Link
                      href={`/app/messages?user=${profile.id}`}
                      onClick={handleChatClick}
                      className="focus-ring flex-1 min-w-0"
                    >
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full font-bold shadow-md rounded-2xl text-xs sm:text-sm h-12 sm:h-13 active-press bg-gradient-to-r from-[var(--primary)] to-[#8E1B3E] hover:brightness-105 px-3 sm:px-6"
                        leftIcon={<IconMessageCircle className="h-4.5 w-4.5 shrink-0" />}
                      >
                        <span className="truncate">Chat with {profile.name.split(' ')[0]}</span>
                      </Button>
                    </Link>

                    {/* Favorite Button */}
                    <Button
                      variant={isShortlisted ? 'primary' : 'outline'}
                      size="lg"
                      onClick={handleToggleShortlist}
                      aria-label={isShortlisted ? 'Favorited' : 'Favorite'}
                      title={isShortlisted ? 'Favorited' : `Add ${profile.name} to favorites`}
                      className={cn(
                        'h-12 sm:h-13 w-12 sm:w-auto p-0 sm:px-5 rounded-2xl shrink-0 active-press transition-all font-bold text-sm flex items-center justify-center gap-1.5',
                        isShortlisted
                          ? 'bg-[var(--primary)] text-white border-transparent'
                          : 'border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                      )}
                      leftIcon={
                        isShortlisted ? (
                          <IconStarFilled className="h-4.5 w-4.5 text-white shrink-0" />
                        ) : (
                          <IconStar className="h-4.5 w-4.5 text-[var(--primary)] shrink-0" />
                        )
                      }
                    >
                      <span className="hidden sm:inline">{isShortlisted ? 'Favorited' : 'Favorite'}</span>
                    </Button>
                  </div>
                </>
              ) : isInterestReceived ? (
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleAcceptInterest}
                    className="flex-1 min-w-0 font-bold shadow-md rounded-2xl text-xs sm:text-sm h-12 sm:h-13 active-press bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-6"
                    leftIcon={<IconCheck className="h-4 w-4 shrink-0" />}
                  >
                    <span className="truncate">Accept Interest</span>
                  </Button>
                  <Button
                    variant={isShortlisted ? 'primary' : 'outline'}
                    size="lg"
                    onClick={handleToggleShortlist}
                    aria-label={isShortlisted ? 'Favorited' : 'Favorite'}
                    title={isShortlisted ? 'Favorited' : `Add ${profile.name} to favorites`}
                    className={cn(
                      'h-12 sm:h-13 w-12 sm:w-auto p-0 sm:px-5 rounded-2xl shrink-0 active-press transition-all font-bold text-sm flex items-center justify-center gap-1.5',
                      isShortlisted
                        ? 'bg-[var(--primary)] text-white border-transparent'
                        : 'border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                    )}
                    leftIcon={
                      isShortlisted ? (
                        <IconStarFilled className="h-4.5 w-4.5 text-white shrink-0" />
                      ) : (
                        <IconStar className="h-4.5 w-4.5 text-[var(--primary)] shrink-0" />
                      )
                    }
                  >
                    <span className="hidden sm:inline">{isShortlisted ? 'Favorited' : 'Favorite'}</span>
                  </Button>
                </div>
              ) : isDeclined ? (
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Button
                      variant="secondary"
                      size="lg"
                      disabled
                      className="w-full font-bold rounded-2xl text-xs sm:text-sm h-12 sm:h-13 opacity-75 bg-stone-100 text-stone-500 border border-stone-200 cursor-not-allowed select-none shadow-none"
                      leftIcon={<IconBan className="h-4.5 w-4.5 text-stone-400 shrink-0" />}
                    >
                      <span>Declined</span>
                    </Button>
                  </div>
                  <p className="text-center text-[11px] text-[var(--muted)] font-medium">
                    This connection request was declined.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {/* Send Interest (Burgundy primary) */}
                    <Button
                      variant={isInterestSent ? 'blush' : 'primary'}
                      size="lg"
                      disabled={isInterestSent}
                      onClick={handleSendInterest}
                      className="flex-1 min-w-0 font-bold shadow-md rounded-2xl text-xs sm:text-sm h-12 sm:h-13 active-press px-3 sm:px-6"
                      leftIcon={
                        isInterestSent ? (
                          <IconCheck className="h-4 w-4 shrink-0" />
                        ) : (
                          <IconHeart className="h-4 w-4 fill-white shrink-0" />
                        )
                      }
                    >
                      <span className="truncate">{isInterestSent ? 'Interest Sent' : 'Send Interest'}</span>
                    </Button>

                    {/* Favorite Button */}
                    <Button
                      variant={isShortlisted ? 'primary' : 'outline'}
                      size="lg"
                      onClick={handleToggleShortlist}
                      aria-label={isShortlisted ? 'Favorited' : 'Favorite'}
                      title={isShortlisted ? 'Favorited' : `Add ${profile.name} to favorites`}
                      className={cn(
                        'h-12 sm:h-13 w-12 sm:w-auto p-0 sm:px-5 rounded-2xl shrink-0 active-press transition-all font-bold text-sm flex items-center justify-center gap-1.5',
                        isShortlisted
                          ? 'bg-[var(--primary)] text-white border-transparent'
                          : 'border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                      )}
                      leftIcon={
                        isShortlisted ? (
                          <IconStarFilled className="h-4.5 w-4.5 text-white shrink-0" />
                        ) : (
                          <IconStar className="h-4.5 w-4.5 text-[var(--primary)] shrink-0" />
                        )
                      }
                    >
                      <span className="hidden sm:inline">{isShortlisted ? 'Favorited' : 'Favorite'}</span>
                    </Button>
                  </div>

                  {/* Chat action with Premium link */}
                  <Link
                    href={`/app/messages?user=${profile.id}`}
                    onClick={handleChatClick}
                    className="focus-ring block w-full"
                  >
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full rounded-2xl text-xs sm:text-sm font-bold h-11 sm:h-12 text-[var(--foreground)] hover:border-[var(--primary)]"
                      leftIcon={<IconMessageCircle className="h-4 w-4 text-[var(--primary)] shrink-0" />}
                    >
                      <span className="truncate">Chat with {profile.name.split(' ')[0]}</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ======================================================== */}
      {/* 3. CONTEXTUAL PROFILE INSIGHTS: "Why You May Connect"     */}
      {/* ======================================================== */}
      {profile.compatibilityHighlights && profile.compatibilityHighlights.length > 0 && (
        <Card
          variant="champagne"
          className="rounded-3xl border border-[#EAD8C7] bg-gradient-to-br from-[#FAF3EC] via-[#FFF9F6] to-[#FFF5F7] p-6 sm:p-7 shadow-[var(--elevation-card)]"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--primary)] text-white shadow-xs">
              <IconShieldCheck className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h2 className="font-editorial-title text-xl sm:text-2xl font-bold text-[#5C1027]">
                Why you may connect with {profile.name.split(' ')[0]}
              </h2>
              <p className="text-xs text-[var(--muted-strong)]">
                Contextual profile alignment based on your partner preferences and lifestyle criteria.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {profile.compatibilityHighlights.map((hl: any, idx: number) => (
              <div key={idx} className="rounded-2xl bg-white/90 p-4 border border-[#EAD8C7]/70 backdrop-blur-xs flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--primary)] flex items-center gap-1.5">
                    <span>✓ {hl.title}</span>
                  </p>
                  <p className="mt-1 text-xs text-[var(--foreground)] font-semibold truncate">
                    {hl.value}
                  </p>
                </div>
                <p className="mt-1.5 text-[11px] text-[var(--muted)] leading-relaxed">
                  {hl.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* 4. STRUCTURED PROFILE SECTIONS (NO GIANT BIODATA CARD)   */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Deep Biographical & Matrimonial Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Personal Details */}
          <Card className="p-5 sm:p-6 rounded-3xl">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--border)]">
              <IconCalendar className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="font-editorial-title text-xl font-bold text-[var(--foreground)]">
                Personal Details
              </h2>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Age
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
                  {profile.age} years
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Gender
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
                  {profile.gender || 'Not specified'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Profile Created By
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
                  {profile.profileFor || 'Self'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Current City
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
                  {profile.city || 'Not specified'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  State / Country
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
                  {[profile.state, profile.country || 'India'].filter(Boolean).join(', ')}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Citizenship
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
                  {profile.nationality || 'Indian'}
                </p>
              </div>

              {profile.diet && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    Diet
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
                    {profile.diet}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Section 2: Education & Career */}
          <Card className="p-5 sm:p-6 rounded-3xl">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--border)]">
              <IconSchool className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="font-editorial-title text-xl font-bold text-[var(--foreground)]">
                Education & Career
              </h2>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--surface-muted)]/70 border border-[var(--border)]/70">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Highest Qualification
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--foreground)]">
                  {profile.education || 'Graduate'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-muted)]/70 border border-[var(--border)]/70">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Current Occupation
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--foreground)]">
                  {profile.profession || 'Professional'}
                </p>
                {profile.employmentStatus && (
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    {profile.employmentStatus}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-muted)]/70 border border-[var(--border)]/70">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Working Location
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--foreground)]">
                  {[profile.city, profile.state].filter(Boolean).join(', ') || 'Not specified'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-muted)]/70 border border-[var(--border)]/70">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Annual Income
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--primary)]">
                  {profile.annualIncome || 'Available on request'}
                </p>
              </div>
            </div>
          </Card>

          {/* Section 3: Family Details */}
          <Card className="p-5 sm:p-6 rounded-3xl">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--border)]">
              <IconHome className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="font-editorial-title text-xl font-bold text-[var(--foreground)]">
                Family Background
              </h2>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-sm leading-relaxed text-[var(--muted-strong)] bg-[#FFFDFB] p-4 rounded-2xl border border-[var(--border)]">
                {profile.family || 'Family background shared with mutual matches.'}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[var(--surface-muted)] text-center">
                  <p className="text-[11px] font-semibold text-[var(--muted)]">Father</p>
                  <p className="text-xs font-bold text-[var(--foreground)] mt-0.5 truncate" title={profile.fatherName || undefined}>
                    {profile.fatherName
                      ? `${profile.fatherName} (${profile.fatherAlive !== false ? 'Alive' : 'Late'})`
                      : profile.fatherAlive !== false ? 'Father alive' : 'Father late'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-muted)] text-center">
                  <p className="text-[11px] font-semibold text-[var(--muted)]">Mother</p>
                  <p className="text-xs font-bold text-[var(--foreground)] mt-0.5">
                    {profile.motherAlive !== false ? 'Mother alive' : 'Mother late'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-muted)] text-center">
                  <p className="text-[11px] font-semibold text-[var(--muted)]">Brothers</p>
                  <p className="text-xs font-bold text-[var(--foreground)] mt-0.5">
                    {profile.brothersCount !== undefined
                      ? `${profile.brothersCount} (${profile.brothersMarried || 0} m)`
                      : '0'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-muted)] text-center">
                  <p className="text-[11px] font-semibold text-[var(--muted)]">Sisters</p>
                  <p className="text-xs font-bold text-[var(--foreground)] mt-0.5">
                    {profile.sistersCount !== undefined
                      ? `${profile.sistersCount} (${profile.sistersMarried || 0} m)`
                      : '0'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 4: Religion & Community */}
          <Card className="p-5 sm:p-6 rounded-3xl">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--border)]">
              <IconCompass className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="font-editorial-title text-xl font-bold text-[var(--foreground)]">
                Religion & Community
              </h2>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Religion
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
                  {profile.religion || 'Not specified'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Caste / Community
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
                  {profile.caste || 'Open to all communities'}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Mother Tongue
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
                  {profile.motherTongue || 'Not specified'}
                </p>
              </div>
            </div>
          </Card>

          {/* Section 5: Lifestyle & Interests */}
          <Card className="p-5 sm:p-6 rounded-3xl">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--border)]">
              <IconCoffee className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="font-editorial-title text-xl font-bold text-[var(--foreground)]">
                Lifestyle & Interests
              </h2>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Lifestyle Habits
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.lifestyle.map((item) => (
                    <span
                      key={item}
                      className="rounded-xl bg-[var(--surface-muted)] text-[var(--foreground)] px-3 py-1.5 text-xs font-semibold border border-[var(--border)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
                  Passions & Hobbies
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <Chip key={interest} size="sm">
                      {interest}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Partner Preferences & Privacy Callout */}
        <div className="lg:col-span-4 space-y-6">
          {/* Partner Preferences Card */}
          <Card className="p-5 sm:p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--border)]">
              <IconHeart className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="font-editorial-title text-xl font-bold text-[var(--foreground)]">
                Partner Preferences
              </h2>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-[#FAF3EC] to-[#FFF9F6] p-4 border border-[#EAD8C7]">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                What I'm Looking For
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--foreground)] italic">
                "{profile.lookingFor}"
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--border)]">
                <span className="text-[var(--muted)] font-medium">Preferred Age</span>
                <span className="font-bold text-[var(--foreground)]">
                  {profile.preferences?.minAge && profile.preferences?.maxAge
                    ? `${profile.preferences.minAge} – ${profile.preferences.maxAge} years`
                    : profile.preferences?.minAge
                      ? `${profile.preferences.minAge}+ years`
                      : 'Open to all'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--border)]">
                <span className="text-[var(--muted)] font-medium">Preferred Height</span>
                <span className="font-bold text-[var(--foreground)]">
                  {profile.preferences?.minHeight && profile.preferences?.maxHeight
                    ? `${profile.preferences.minHeight} – ${profile.preferences.maxHeight}`
                    : 'Open to all'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--border)]">
                <span className="text-[var(--muted)] font-medium">Education</span>
                <span className="font-bold text-[var(--foreground)] truncate max-w-[180px] text-right" title={Array.isArray(profile.preferences?.education) ? profile.preferences.education.join(', ') : undefined}>
                  {Array.isArray(profile.preferences?.education) && profile.preferences.education.length > 0
                    ? profile.preferences.education.join(', ')
                    : 'Open to all'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--border)]">
                <span className="text-[var(--muted)] font-medium">Profession</span>
                <span className="font-bold text-[var(--foreground)] truncate max-w-[180px] text-right" title={Array.isArray(profile.preferences?.professions) ? profile.preferences.professions.join(', ') : undefined}>
                  {Array.isArray(profile.preferences?.professions) && profile.preferences.professions.length > 0
                    ? profile.preferences.professions.join(', ')
                    : 'Open to all'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-[var(--muted)] font-medium">Preferred Locations</span>
                <span className="font-bold text-[var(--foreground)] truncate max-w-[180px] text-right" title={Array.isArray(profile.preferences?.locations) ? profile.preferences.locations.join(', ') : undefined}>
                  {Array.isArray(profile.preferences?.locations) && profile.preferences.locations.length > 0
                    ? profile.preferences.locations.join(', ')
                    : 'Open to any location'}
                </span>
              </div>
            </div>
          </Card>

          {/* Privacy & Confidentiality Card */}
          <Card className="p-5 sm:p-6 rounded-3xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                <IconShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--foreground)]">
                  100% Privacy Protected
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Private information is protected under matrimonial privacy standards.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <div className="rounded-xl bg-[var(--surface-muted)] p-3 border border-[var(--border)] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[var(--muted)]">Verified Contact & Phone</p>
                  <p className="text-xs font-semibold text-[var(--foreground)]">
                    Protected by Matrimonial Privacy
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-200/60 px-2 py-0.5 text-[10px] font-bold text-stone-600">
                  <IconLock className="h-3 w-3" /> Private
                </span>
              </div>

              <div className="rounded-xl bg-[var(--surface-muted)] p-3 border border-[var(--border)] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[var(--muted)]">
                    Permanent Residential Address
                  </p>
                  <p className="text-xs font-semibold text-[var(--foreground)]">
                    {[profile.city, profile.state].filter(Boolean).join(', ') || 'Protected'}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-200/60 px-2 py-0.5 text-[10px] font-bold text-stone-600">
                  <IconLock className="h-3 w-3" /> Private
                </span>
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-[var(--muted)] italic pt-1">
              Contact numbers and complete family addresses are revealed exclusively when both
              members accept a mutual matrimonial connection.
            </p>
          </Card>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. "YOU MAY ALSO LIKE" RELATED PROFILES RAIL             */}
      {/* ======================================================== */}
      {relatedProfiles.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[var(--border)]">
          <div className="flex items-end justify-between px-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
                Recommendations
              </p>
              <h2 className="font-editorial-title text-2xl font-bold text-[var(--foreground)] mt-0.5">
                You may also like
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Similar verified profiles aligned with your partner preferences.
              </p>
            </div>

            <Link
              href="/app/discover"
              className="text-xs font-bold text-[var(--primary)] hover:underline hidden sm:inline-block"
            >
              Explore all profiles →
            </Link>
          </div>

          {/* Horizontal Profile Rail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {relatedProfiles.slice(0, 4).map((relProfile: Profile) => (
              <ProfileCard key={relProfile.id} profile={relProfile} compact />
            ))}
          </div>
        </div>
      )}

      {/* MOBILE STICKY BOTTOM ACTION DOCK (Portaled to document.body to remain strictly anchored to viewport above MobileNav) */}
      {isMounted && createPortal(
        <div
          className={cn(
            "fixed bottom-[calc(4.875rem+env(safe-area-inset-bottom,0px))] inset-x-0 z-40 flex md:hidden justify-center px-4 pointer-events-none transition-all duration-300 ease-out",
            showFloatingDock
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-6 scale-95 pointer-events-none"
          )}
          aria-label="Profile actions"
        >
          <div className="w-full max-w-[420px] p-2 rounded-[2.25rem] bg-white/95 backdrop-blur-2xl border border-[var(--champagne-border)]/80 shadow-[0_14px_40px_rgba(26,12,18,0.14)] pointer-events-auto flex items-center gap-2">
            {isMatched ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleChatClick}
                className="flex-1 min-w-0 font-bold rounded-2xl text-xs h-11 shadow-sm active-press bg-gradient-to-r from-[var(--primary)] via-[#801835] to-[#5E0E24] text-white px-2.5 sm:px-4"
                leftIcon={<IconMessageCircle className="h-4 w-4 shrink-0" />}
              >
                <span className="truncate">Chat with {profile.name.split(' ')[0]}</span>
              </Button>
            ) : isInterestReceived ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleAcceptInterest}
                className="flex-1 min-w-0 font-bold rounded-2xl text-xs h-11 shadow-sm active-press bg-emerald-600 text-white px-2.5 sm:px-4"
                leftIcon={<IconCheck className="h-4 w-4 shrink-0" />}
              >
                <span className="truncate">Accept Interest</span>
              </Button>
            ) : isDeclined ? (
              <Button
                variant="secondary"
                size="md"
                disabled
                className="w-full font-bold rounded-2xl text-xs h-11 opacity-80 bg-stone-100 text-stone-500 border border-stone-200 cursor-not-allowed select-none shadow-none"
                leftIcon={<IconBan className="h-4 w-4 text-stone-400 shrink-0" />}
              >
                <span>Declined</span>
              </Button>
            ) : (
              <>
                {isInterestSent ? (
                  <Button
                    variant="secondary"
                    size="md"
                    disabled
                    className="flex-1 min-w-0 font-bold rounded-2xl text-xs h-11 border border-[var(--champagne-border)] bg-white/95 text-[var(--primary)] shadow-2xs select-none cursor-default px-2.5 sm:px-4"
                    leftIcon={<IconCheck className="h-4 w-4 stroke-[2.5] text-[var(--primary)] shrink-0" />}
                  >
                    <span className="truncate">Interest Sent</span>
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSendInterest}
                    className="flex-1 min-w-0 font-bold rounded-2xl text-xs h-11 shadow-[0_4px_14px_rgba(122,24,53,0.3),inset_0_1px_1px_rgba(255,255,255,0.25)] active-press bg-gradient-to-r from-[var(--primary)] via-[#801835] to-[#5E0E24] text-white px-2.5 sm:px-4"
                    leftIcon={<IconHeart className="h-4 w-4 fill-white shrink-0" />}
                  >
                    <span className="truncate">Send Interest</span>
                  </Button>
                )}

                {/* Favorite Button */}
                <Button
                  variant={isShortlisted ? 'primary' : 'outline'}
                  size="md"
                  onClick={handleToggleShortlist}
                  className={cn(
                    'h-11 w-11 sm:w-auto p-0 sm:px-3.5 rounded-2xl shrink-0 active-press font-bold text-xs flex items-center justify-center gap-1.5 transition-all',
                    isShortlisted
                      ? 'bg-gradient-to-r from-[#D8B28C] via-[#C99757] to-[#9B6C2E] border border-[#EEDCC8] text-white shadow-xs'
                      : 'bg-white border border-[var(--champagne-border)] text-[var(--muted-strong)] hover:text-[var(--primary)] hover:border-[var(--primary)]'
                  )}
                  aria-label={isShortlisted ? 'Favorited' : 'Favorite'}
                  title={isShortlisted ? 'Favorited' : 'Favorite'}
                  leftIcon={
                    isShortlisted ? (
                      <IconStarFilled className="h-4 w-4 text-white shrink-0" />
                    ) : (
                      <IconStar className="h-4 w-4 text-[var(--primary)] shrink-0" />
                    )
                  }
                >
                  <span className="hidden sm:inline">{isShortlisted ? 'Favorited' : 'Favorite'}</span>
                </Button>

                {/* Chat Action */}
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleChatClick}
                  className="h-11 w-11 p-0 rounded-2xl text-xs font-bold border border-[var(--champagne-border)] bg-white text-[var(--primary)] hover:border-[var(--primary)] flex items-center justify-center active-press"
                  aria-label="Chat"
                  title="Chat"
                >
                  <IconMessageCircle className="h-4.5 w-4.5 text-[var(--primary)]" />
                </Button>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
