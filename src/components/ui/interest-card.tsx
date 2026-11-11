'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconCheck,
  IconX,
  IconMessageCircle,
  IconMapPin,
  IconBriefcase,
  IconSchool,
  IconClock,
  IconArrowRight,
  IconTrash,
  IconBookmark,
  IconUser,
} from '@tabler/icons-react';
import { Badge } from './badge';
import { Button } from './button';
import { Card } from './card';
import { VerificationBadge } from './verification-badge';
import { cn } from '@/lib/cn';
import { formatLastActive, getProfileUniqueId } from '@/lib/demo-data';

export interface InterestProfileData {
  id: string;
  profileId?: string;
  name: string;
  age: number;
  city: string;
  state?: string;
  profession: string;
  education?: string;
  image?: string;
  compatibility?: number;
  about?: string;
  sentAt?: string;
  verified?: boolean;
  online?: boolean;
  lastActiveAt?: string;
}

export interface InterestCardProps {
  profile: InterestProfileData;
  type: 'received' | 'sent' | 'accepted' | 'declined' | 'favorite' | 'shortlisted_you';
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onChat?: (id: string) => void;
  onRemove?: (id: string) => void;
  onShortlist?: (id: string) => void;
  isShortlisted?: boolean;
  onSendInterest?: (id: string) => void;
  onCancelInterest?: (id: string) => void;
  isInterestSent?: boolean;
  isRemoving?: boolean;
  className?: string;
}

export function InterestCard({
  profile,
  type,
  onAccept,
  onDecline,
  onChat,
  onRemove,
  onShortlist,
  isShortlisted,
  onSendInterest,
  onCancelInterest,
  isInterestSent,
  isRemoving,
  className,
}: InterestCardProps) {
  const router = useRouter();
  const formattedId = getProfileUniqueId(profile);
  const [imgError, setImgError] = useState(false);

  const handleCardClick = () => {
    router.push(`/app/profile?user=${profile.id}`);
  };

  return (
    <Card
      variant="interactive"
      role="link"
      tabIndex={0}
      aria-label={`View ${profile.name}'s profile`}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={cn(
        'group relative overflow-hidden rounded-[2rem] border border-[var(--champagne-border)] bg-[var(--surface-muted)] p-0 shadow-[var(--elevation-card)] hover:shadow-[var(--elevation-floating)] transition-all duration-300 cursor-pointer h-[510px] sm:h-[530px] w-full select-none',
        type === 'declined' && 'opacity-75',
        className
      )}
    >
      {/* 1. Full-Bleed Portrait Photo */}
      <div className="absolute inset-0 h-full w-full overflow-hidden bg-[var(--surface-muted)]">
        {profile.image && !imgError ? (
          <img
            src={profile.image}
            alt={profile.name}
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="relative h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#7D1633] via-[#630E26] to-[#450718] p-6 text-center select-none overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,151,87,0.22),transparent_70%)]" />
            <div className="relative z-10 grid h-24 w-24 place-items-center rounded-full bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md border border-[#F5D8A8]/60 shadow-[0_10px_25px_rgba(0,0,0,0.3)] text-[#FFF2D6]">
              <span className="font-editorial-title text-4xl font-bold tracking-tight">
                {profile.name?.charAt(0)?.toUpperCase() || 'M'}
              </span>
            </div>
            <p className="relative z-10 mt-3.5 text-base font-bold text-white tracking-tight drop-shadow-xs">
              {profile.name}
            </p>
            <span className="relative z-10 mt-1.5 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/15 text-[11px] font-medium text-[#F7DFBA]">
              Photo Pending
            </span>
          </div>
        )}

        {/* Ambient Warm Gradient */}
        {profile.image && <div className="absolute inset-0 photo-overlay-warm" aria-hidden="true" />}

        {/* Dark Bottom & Subtle Top Vignette Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 via-50% to-black/25 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* 2. Top Floating Badges */}
      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-start justify-between gap-1.5 z-10 pointer-events-none">
        {/* Left Status Pill */}
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {type === 'received' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md text-white border border-white/20 text-[11px] font-bold shadow-xs">
              <IconClock className="h-3 w-3 text-amber-300" /> Awaiting Response
            </span>
          )}
          {type === 'sent' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md text-[#F7DFBA] border border-amber-300/30 text-[11px] font-bold shadow-xs">
              <IconClock className="h-3 w-3 text-amber-300" /> Interest Delivered
            </span>
          )}
          {type === 'accepted' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 backdrop-blur-md text-emerald-200 border border-emerald-400/40 text-[11px] font-bold shadow-xs">
              <IconCheck className="h-3 w-3 text-emerald-400 stroke-[2.5]" /> Connected
            </span>
          )}
          {type === 'declined' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md text-stone-300 border border-white/15 text-[11px] font-bold shadow-xs">
              Declined
            </span>
          )}
          {type === 'favorite' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md text-[#F7DFBA] border border-amber-300/30 text-[11px] font-bold shadow-xs">
              <IconBookmark className="h-3 w-3 text-amber-300 fill-current" /> Shortlisted
            </span>
          )}
          {type === 'shortlisted_you' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md text-[#F7DFBA] border border-amber-300/30 text-[11px] font-bold shadow-xs">
              <IconBookmark className="h-3 w-3 text-amber-300 fill-current" /> Shortlisted You
            </span>
          )}
          {profile.online ? (
            <Badge
              tone="neutral"
              size="sm"
              dot
              dotColor="bg-emerald-500"
              className="bg-black/40 backdrop-blur-md text-white border-white/20 text-[10px] font-medium whitespace-nowrap"
            >
              Online
            </Badge>
          ) : profile.lastActiveAt ? (
            <Badge
              tone="neutral"
              size="sm"
              className="bg-black/45 text-white/95 backdrop-blur-md border-white/20 text-[10px] font-medium whitespace-nowrap"
            >
              {formatLastActive(profile.lastActiveAt)}
            </Badge>
          ) : null}
        </div>

        {/* Right Matrimony ID tag */}
        {formattedId && (
          <span className="shrink-0 rounded-full bg-black/45 backdrop-blur-md text-white/90 border border-white/15 text-[10px] font-semibold px-2.5 py-1 tracking-wider uppercase shadow-xs whitespace-nowrap">
            ID: {formattedId}
          </span>
        )}
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
          <p className="text-xs sm:text-sm font-semibold text-white/90 truncate">
            {[profile.profession, profile.education].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* Location with Pin */}
        {(profile.city || profile.state) && (
          <p className="flex items-center gap-1 text-xs text-white/85 truncate">
            <IconMapPin className="h-3.5 w-3.5 text-[#D8B28C] shrink-0" />
            <span>
              {[profile.city, profile.state].filter(Boolean).join(', ')}
            </span>
          </p>
        )}

        {/* Bio / About snippet */}
        {profile.about && (
          <p className="text-[11px] leading-relaxed text-white/75 italic line-clamp-1 pt-0.5">
            "{profile.about}"
          </p>
        )}

        {/* Action Controls Row */}
        <div className="w-full pt-2 flex items-center gap-2">
          {/* RECEIVED TAB ACTIONS: Decline (round) + View Profile (round) + Accept Interest (hero pill) */}
          {type === 'received' && (
            <>
              {onDecline && (
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDecline(profile.id);
                  }}
                  className="rounded-full aspect-square h-10 w-10 sm:h-11 sm:w-11 shrink-0 p-0 flex items-center justify-center bg-white/95 backdrop-blur-md text-rose-600 border border-white/70 hover:bg-white hover:scale-105 active-press shadow-md transition-all"
                  title="Decline Interest"
                  aria-label="Decline"
                >
                  <IconX className="h-5 w-5 stroke-[2.3]" />
                </Button>
              )}

              <Link
                href={`/app/profile?user=${profile.id}`}
                className="focus-ring shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full aspect-square h-10 w-10 sm:h-11 sm:w-11 shrink-0 p-0 bg-white/95 backdrop-blur-md text-[var(--foreground)] border border-white/60 shadow-sm hover:bg-white hover:scale-105 active-press flex items-center justify-center transition-all"
                  title={`View ${profile.name}'s Profile`}
                  aria-label="View Profile"
                >
                  <IconUser className="h-4.5 w-4.5 text-[var(--foreground)]" />
                </Button>
              </Link>

              {onAccept && (
                <Button
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept(profile.id);
                  }}
                  className="flex-1 min-w-0 h-10 sm:h-11 rounded-full px-3 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 bg-gradient-to-b from-[#9E1D3B] via-[#801835] to-[#5E0E24] text-white border-t border-t-white/35 border-x border-x-[#72122B]/60 border-b-[3px] border-b-[#420816] shadow-[0_4px_12px_rgba(94,14,36,0.5),inset_0_1.5px_1px_rgba(255,255,255,0.35)] hover:brightness-110 active-press select-none truncate"
                  title="Accept Interest & Connect"
                >
                  <IconCheck className="h-4 w-4 stroke-[2.5]" />
                  <span>Accept Interest</span>
                </Button>
              )}
            </>
          )}

          {/* SENT TAB ACTIONS */}
          {type === 'sent' && (
            <div className="flex items-center gap-2 w-full">
              {onCancelInterest && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelInterest(profile.id);
                  }}
                  className="flex-1 min-w-0 h-10 rounded-full px-3 text-xs font-semibold bg-black/40 text-stone-200 hover:text-rose-300 hover:bg-black/60 border border-white/15 active-press shadow-2xs flex items-center justify-center gap-1.5"
                  leftIcon={<IconX className="h-3.5 w-3.5 text-rose-400 shrink-0" />}
                >
                  Cancel Interest
                </Button>
              )}

              <Link
                href={`/app/profile?user=${profile.id}`}
                className={cn('focus-ring', onCancelInterest ? 'flex-1 min-w-0' : 'w-full')}
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full h-10 rounded-full px-3.5 text-xs font-bold bg-white/95 text-[var(--foreground)] hover:bg-white active-press border border-white/60 shadow-sm flex items-center justify-center gap-1"
                  rightIcon={<IconArrowRight className="h-3.5 w-3.5 shrink-0" />}
                >
                  View
                </Button>
              </Link>
            </div>
          )}

          {/* DECLINED TAB ACTIONS */}
          {type === 'declined' && (
            <div className="flex items-center justify-between gap-2 w-full">
              <span className="text-xs text-white/70 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                Request declined
              </span>

              <Link
                href={`/app/profile?user=${profile.id}`}
                className="focus-ring ml-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full px-4 text-xs font-bold bg-white/95 text-[var(--foreground)] hover:bg-white active-press border border-white/60 shadow-sm"
                  rightIcon={<IconArrowRight className="h-3.5 w-3.5" />}
                >
                  View Profile
                </Button>
              </Link>
            </div>
          )}

          {/* ACCEPTED TAB ACTIONS */}
          {type === 'accepted' && (
            <div className="flex items-center gap-2 w-full">
              <Link
                href={`/app/profile?user=${profile.id}`}
                className="focus-ring shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full aspect-square h-10 w-10 sm:h-11 sm:w-11 shrink-0 p-0 bg-white/95 backdrop-blur-md text-[var(--foreground)] border border-white/60 shadow-sm hover:bg-white hover:scale-105 active-press flex items-center justify-center transition-all"
                  title="View Profile"
                  aria-label="View Profile"
                >
                  <IconUser className="h-4.5 w-4.5 text-[var(--foreground)]" />
                </Button>
              </Link>

              <Link
                href={`/app/messages?user=${profile.id}`}
                className="focus-ring flex-1"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="primary"
                  className="w-full h-10 sm:h-11 rounded-full px-4 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active-press truncate"
                  leftIcon={<IconMessageCircle className="h-4 w-4" />}
                >
                  Chat with {profile.name.split(' ')[0]}
                </Button>
              </Link>
            </div>
          )}

          {/* FAVORITE TAB ACTIONS */}
          {type === 'favorite' && (
            <div className="flex items-center justify-between gap-2 w-full">
              {onRemove && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(profile.id);
                  }}
                  disabled={isRemoving}
                  className="rounded-full px-3.5 text-xs font-semibold bg-white/90 text-rose-600 hover:text-rose-700 hover:bg-white active-press border border-white/60 shadow-sm"
                  leftIcon={<IconTrash className="h-3.5 w-3.5" />}
                >
                  {isRemoving ? 'Removing...' : 'Remove'}
                </Button>
              )}

              <Link
                href={`/app/profile?user=${profile.id}`}
                className="focus-ring ml-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-full px-4 text-xs font-bold shadow-sm"
                  rightIcon={<IconArrowRight className="h-3.5 w-3.5" />}
                >
                  View Profile
                </Button>
              </Link>
            </div>
          )}

          {/* SHORTLISTED_YOU TAB ACTIONS */}
          {type === 'shortlisted_you' && (
            <div className="flex items-center justify-between gap-2 w-full">
              {onShortlist && (
                <Button
                  variant={isShortlisted ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShortlist(profile.id);
                  }}
                  className="rounded-full px-3.5 text-xs font-semibold active-press bg-white/90 text-[var(--foreground)]"
                  leftIcon={<IconBookmark className="h-3.5 w-3.5 fill-current" />}
                >
                  {isShortlisted ? 'Shortlisted' : 'Shortlist Back'}
                </Button>
              )}

              {onSendInterest && (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isInterestSent}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendInterest(profile.id);
                  }}
                  className="rounded-full px-4 text-xs font-bold shadow-sm"
                >
                  {isInterestSent ? 'Interest Sent' : 'Send Interest'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
