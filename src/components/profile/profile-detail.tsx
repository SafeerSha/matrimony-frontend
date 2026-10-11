'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
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
} from '@tabler/icons-react';
import { profiles as demoProfiles, getProfileUniqueId } from '@/lib/demo-data';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip } from '@/components/ui/chip';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { ProfileCard } from '@/components/profile/profile-card';
import { matchesService, profileService } from '@/services';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import type { Profile } from '@/lib/demo-data';

export function ProfileDetail({ id }: { id?: string }) {
  // Find profile from demoProfiles or fallback
  const baseProfile = useMemo(() => {
    return demoProfiles.find((p) => p.id === id) ?? demoProfiles[0];
  }, [id]);

  const [profile, setProfile] = useState<Profile>(baseProfile);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isInterestSent, setIsInterestSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFloatingDock, setShowFloatingDock] = useState(false);
  const inlineActionsRef = useRef<HTMLDivElement>(null);

  // Show floating dock only once the inline buttons section has scrolled past view
  useEffect(() => {
    const handleScroll = () => {
      if (!inlineActionsRef.current) return;
      const rect = inlineActionsRef.current.getBoundingClientRect();
      setShowFloatingDock(rect.bottom < 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync state if id changes
  useEffect(() => {
    const found = demoProfiles.find((p) => p.id === id) ?? demoProfiles[0];
    setProfile(found);
    setActivePhotoIdx(0);
    setIsInterestSent(false);

    // Optionally fetch live profile if id is present
    if (id && id !== found.id) {
      setIsLoading(true);
      profileService
        .getProfile(id)
        .then((res: any) => {
          if (res) {
            setProfile((prev) => {
              const calculatedAge =
                res.age !== undefined && res.age !== null
                  ? res.age
                  : res.dateOfBirth
                    ? Math.floor((new Date().getTime() - new Date(res.dateOfBirth).getTime()) / 31557600000)
                    : prev.age;

              const primaryImg =
                res.photos?.find((p: any) => p.isPrimary)?.url ||
                res.photos?.[0]?.url ||
                prev.image;

              return {
                ...prev,
                name: res.name || `${res.firstName || ''} ${res.lastName || ''}`.trim() || prev.name,
                age: calculatedAge,
                city: res.city || prev.city,
                state: res.state || prev.state,
                motherTongue: res.motherTongue || prev.motherTongue,
                verified: res.isVerified ?? prev.verified,
                profession: res.occupation || res.profession || prev.profession,
                education: res.education || prev.education,
                employmentStatus: res.employmentStatus || prev.employmentStatus,
                about: res.bio || prev.about,
                family: res.family || prev.family,
                lookingFor: res.lookingFor || prev.lookingFor,
                lifestyle: Array.isArray(res.lifestyle) ? res.lifestyle : prev.lifestyle,
                interests: Array.isArray(res.interests) ? res.interests : prev.interests,
                image: primaryImg,
                photos: res.photos,
              };
            });
          }
        })
        .catch(() => {
          // Graceful fallback to demo profile
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [id]);

  // Gallery Photos (Multi-angle photos from backend with fallback)
  const galleryPhotos = useMemo(() => {
    if (profile.photos && profile.photos.length > 0) {
      return profile.photos.map((p: any) => p.url);
    }
    const baseList = [
      profile.image,
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85',
    ];
    return baseList;
  }, [profile.image, profile.photos]);

  // Related Profiles for bottom "You may also like" rail
  const relatedProfiles = useMemo(() => {
    return demoProfiles.filter((p) => p.id !== profile.id);
  }, [profile.id]);

  // Shortlist handler
  const handleToggleShortlist = async () => {
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
    if (isInterestSent) return;
    try {
      await matchesService.sendInterest(profile.id);
      setIsInterestSent(true);
      toast.success('Interest Sent!', `We have notified ${profile.name} of your interest.`);
    } catch {
      setIsInterestSent(true);
      toast.success('Interest Sent!', `We have notified ${profile.name} of your interest.`);
    }
  };

  // Share profile
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Link Copied', 'Profile link copied to clipboard.');
    }
  };

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
              <img
                src={galleryPhotos[activePhotoIdx]}
                alt={`${profile.name} - Photo ${activePhotoIdx + 1}`}
                className="h-full w-full object-cover object-center transition-all duration-500 ease-out"
              />

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
                  {profile.compatibility}% Compatibility
                </Badge>

                {profile.online && (
                  <Badge
                    tone="neutral"
                    size="sm"
                    dot
                    dotColor="bg-emerald-500"
                    className="bg-white/95 backdrop-blur-md text-[var(--foreground)] border-white/80 font-semibold"
                  >
                    Active Now
                  </Badge>
                )}
              </div>

              {/* Gallery Counter Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className="rounded-full bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1">
                  Photo {activePhotoIdx + 1} of {galleryPhotos.length}
                </span>
              </div>

              {/* Photo Navigation Chevrons */}
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

              {/* Photo Overlay IconInfo for Mobile/Hero */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white z-10 lg:hidden">
                <div className="flex items-center gap-2">
                  <h1 className="font-editorial-title text-3xl font-bold tracking-tight text-white drop-shadow-md">
                    {profile.name}, {profile.age}
                  </h1>
                  {profile.verified && <VerificationBadge type="general" showIconOnly size="md" />}
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
                  <IconMapPin className="h-4 w-4 text-[var(--accent)] shrink-0" />
                  <span>
                    {profile.city}, {profile.state}
                  </span>
                </p>
              </div>
            </div>

            {/* Gallery Thumbnails Strip */}
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
          </div>

          {/* Profile Identity & Primary Actions (Desktop: 5 cols) */}
          <div className="lg:col-span-5 p-5 sm:p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-5">
              {/* Header Title & Verification */}
              <div>
                <div className="flex items-center gap-2">
                                    {profile.verified && <VerificationBadge type="general" size="md" />}
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
                      {profile.city}, {profile.state}, India
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
              <div className="flex items-center gap-3">
                {/* Send Interest (Burgundy primary) */}
                <Button
                  variant={isInterestSent ? 'blush' : 'primary'}
                  size="lg"
                  disabled={isInterestSent}
                  onClick={handleSendInterest}
                  className="flex-1 font-bold shadow-md rounded-2xl text-sm h-13 active-press"
                  leftIcon={
                    isInterestSent ? (
                      <IconCheck className="h-4 w-4" />
                    ) : (
                      <IconHeart className="h-4 w-4 fill-white" />
                    )
                  }
                >
                  {isInterestSent ? 'Interest Sent' : 'Send Interest'}
                </Button>

                {/* Favorite Button */}
                <Button
                  variant={isShortlisted ? 'primary' : 'outline'}
                  size="lg"
                  onClick={handleToggleShortlist}
                  aria-label={isShortlisted ? 'Favorited' : 'Favorite'}
                  title={isShortlisted ? 'Favorited' : `Add ${profile.name} to favorites`}
                  className={cn(
                    'h-13 px-4 sm:px-5 rounded-2xl shrink-0 active-press transition-all font-bold text-sm',
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
                  <span>{isShortlisted ? 'Favorited' : 'Favorite'}</span>
                </Button>
              </div>

              {/* Chat action with Premium link */}
              <Link
                href={`/app/messages?user=${profile.id}`}
                className="focus-ring block w-full"
              >
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full rounded-2xl text-xs font-bold h-11 text-[var(--foreground)] hover:border-[var(--primary)]"
                  leftIcon={<IconMessageCircle className="h-4 w-4 text-[var(--primary)]" />}
                >
                  Chat with {profile.name.split(' ')[0]}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* ======================================================== */}
      {/* 3. CONTEXTUAL PROFILE INSIGHTS: "Why You May Connect"     */}
      {/* ======================================================== */}
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
          <div className="rounded-2xl bg-white/90 p-4 border border-[#EAD8C7]/70 backdrop-blur-xs">
            <p className="text-xs font-bold text-[var(--primary)] flex items-center gap-1.5">
              <span>✓ Same Location</span>
            </p>
            <p className="mt-1 text-xs text-[var(--foreground)] font-semibold">
              Based in {profile.city}, {profile.state}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--muted)]">
              Shared familiarity with regional lifestyle and community roots.
            </p>
          </div>

          <div className="rounded-2xl bg-white/90 p-4 border border-[#EAD8C7]/70 backdrop-blur-xs">
            <p className="text-xs font-bold text-[var(--primary)] flex items-center gap-1.5">
              <span>✓ Partner Age Match</span>
            </p>
            <p className="mt-1 text-xs text-[var(--foreground)] font-semibold">
              Age {profile.age} years
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--muted)]">
              Falls within your preferred age window for matrimonial matchmaking.
            </p>
          </div>

          <div className="rounded-2xl bg-white/90 p-4 border border-[#EAD8C7]/70 backdrop-blur-xs">
            <p className="text-xs font-bold text-[var(--primary)] flex items-center gap-1.5">
              <span>✓ Educational Alignment</span>
            </p>
            <p className="mt-1 text-xs text-[var(--foreground)] font-semibold truncate">
              {profile.education}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--muted)]">
              Matches your preference for professional and postgraduate qualifications.
            </p>
          </div>

          <div className="rounded-2xl bg-white/90 p-4 border border-[#EAD8C7]/70 backdrop-blur-xs">
            <p className="text-xs font-bold text-[var(--primary)] flex items-center gap-1.5">
              <span>✓ Shared Passions</span>
            </p>
            <p className="mt-1 text-xs text-[var(--foreground)] font-semibold truncate">
              {profile.interests.slice(0, 2).join(' & ')}
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--muted)]">
              Overlapping leisure interests make initial conversations effortless.
            </p>
          </div>
        </div>
      </Card>

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
                  Height
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
                  {profile.height}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Marital Status
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
                  {profile.maritalStatus}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Mother Tongue
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
                  {profile.motherTongue}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Current City
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
                  {profile.city}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  State / Country
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
                  {profile.state}, India
                </p>
              </div>
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
                  {profile.education}
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Full-time Professional Program
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-muted)]/70 border border-[var(--border)]/70">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Current Occupation
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--foreground)]">
                  {profile.profession}
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  {profile.employmentStatus || 'Working Professional'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-muted)]/70 border border-[var(--border)]/70">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Working Location
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--foreground)]">
                  {profile.city}, {profile.state}
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Hybrid / Office Based
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface-muted)]/70 border border-[var(--border)]/70">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Annual Income
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--primary)]">
                  Disclosed to accepted connections
                </p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Confidential bracket maintained
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
                "{profile.family}"
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-[var(--surface-muted)] text-center">
                  <p className="text-[11px] font-semibold text-[var(--muted)]">Family Values</p>
                  <p className="text-xs font-bold text-[var(--foreground)] mt-0.5">
                    Moderate & Caring
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-muted)] text-center">
                  <p className="text-[11px] font-semibold text-[var(--muted)]">Family Type</p>
                  <p className="text-xs font-bold text-[var(--foreground)] mt-0.5">
                    Nuclear Family
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--surface-muted)] text-center">
                  <p className="text-[11px] font-semibold text-[var(--muted)]">Native Roots</p>
                  <p className="text-xs font-bold text-[var(--foreground)] mt-0.5">
                    {profile.city}, {profile.state}
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
                  {profile.religion === 'Not specified' ? 'Hindu' : profile.religion}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Caste / Community
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
                  Open to all communities
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Horoscope Matching
                </p>
                <p className="mt-0.5 text-sm font-bold text-[var(--foreground)]">
                  Optional / Mutual
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
                <span className="font-bold text-[var(--foreground)]">24 – 32 years</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--border)]">
                <span className="text-[var(--muted)] font-medium">Preferred Height</span>
                <span className="font-bold text-[var(--foreground)]">5'3" – 6'0"</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--border)]">
                <span className="text-[var(--muted)] font-medium">Education</span>
                <span className="font-bold text-[var(--foreground)]">Graduate or Post Graduate</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--border)]">
                <span className="text-[var(--muted)] font-medium">Profession</span>
                <span className="font-bold text-[var(--foreground)]">Working Professional</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-[var(--muted)] font-medium">Location</span>
                <span className="font-bold text-[var(--foreground)]">
                  {profile.state}, Bangalore or UAE
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
                  <p className="text-[11px] font-semibold text-[var(--muted)]">Phone Number</p>
                  <p className="text-xs font-bold text-[var(--foreground)] tracking-wider">
                    +91 98•••• •••12
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-stone-200/60 px-2 py-0.5 text-[10px] font-bold text-stone-600">
                  <IconLock className="h-3 w-3" /> Private
                </span>
              </div>

              <div className="rounded-xl bg-[var(--surface-muted)] p-3 border border-[var(--border)] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-[var(--muted)]">
                    Residential Address
                  </p>
                  <p className="text-xs font-bold text-[var(--foreground)]">
                    ••••••••, {profile.city}
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

            {/* Premium notice */}
            <div className="pt-3 border-t border-[var(--border)]">
              <Link href="/app/subscription" className="focus-ring block w-full">
                <div className="rounded-2xl bg-[#FAF3EC] p-3 border border-[#EAD7C5] flex items-center gap-3 hover:bg-[#F5EADE] transition active-press">
                  <IconLock className="h-5 w-5 text-[#8C5D30] shrink-0" />
                  <p className="text-xs font-semibold text-[#8C5D30] leading-snug">
                    An active Premium is required to unlock direct chat.{' '}
                    <strong className="underline font-bold">Upgrade Permit</strong>
                  </p>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. "YOU MAY ALSO LIKE" RELATED PROFILES RAIL             */}
      {/* ======================================================== */}
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
          {relatedProfiles.slice(0, 4).map((relProfile) => (
            <ProfileCard key={relProfile.id} profile={relProfile} compact />
          ))}
        </div>
      </div>

      {/* MOBILE STICKY BOTTOM ACTION DOCK (Floating above bottom navigation dock, shown only once inline actions scroll past) */}
      <div
        className={cn(
          "fixed bottom-[84px] inset-x-0 z-40 flex md:hidden justify-center px-4 pointer-events-none transition-all duration-300 ease-out",
          showFloatingDock
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-6 scale-95 pointer-events-none"
        )}
      >
        <div className="w-full max-w-[420px] p-2 rounded-[2rem] bg-white/90 backdrop-blur-2xl border border-white/70 shadow-[0_12px_36px_rgba(33,27,30,0.14)] pointer-events-auto flex items-center gap-2">
          <Button
            variant={isInterestSent ? 'blush' : 'primary'}
            size="md"
            disabled={isInterestSent}
            onClick={handleSendInterest}
            className="flex-1 font-bold rounded-2xl text-xs h-11 shadow-sm active-press"
            leftIcon={isInterestSent ? <IconCheck className="h-4 w-4" /> : <IconHeart className="h-4 w-4 fill-white" />}
          >
            {isInterestSent ? 'Interest Sent' : 'Send Interest'}
          </Button>

          <Button
            variant={isShortlisted ? 'primary' : 'outline'}
            size="md"
            onClick={handleToggleShortlist}
            className={cn(
              'h-11 px-3.5 rounded-2xl shrink-0 active-press border-[var(--border)] font-bold text-xs flex items-center gap-1.5',
              isShortlisted && 'bg-[var(--primary)] text-white border-[var(--primary)]'
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
            <span>{isShortlisted ? 'Favorited' : 'Favorite'}</span>
          </Button>

          <Link href={`/app/messages?user=${profile.id}`} className="shrink-0">
            <Button
              variant="secondary"
              size="md"
              className="h-11 w-11 p-0 rounded-2xl text-xs font-bold border-[var(--border)] flex items-center justify-center active-press"
              aria-label="Chat"
              title="Chat"
            >
              <IconMessageCircle className="h-4.5 w-4.5 text-[var(--primary)]" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
