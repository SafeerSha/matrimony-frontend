'use client';

import React from 'react';
import Link from 'next/link';
import {
  IconCheck,
  IconX,
  IconMessageCircle,
  IconMapPin,
  IconBriefcase,
  IconSchool,
  IconCalendar,
  IconClock,
  IconArrowRight,
  IconShieldCheck,
  IconUsers,
  IconHeart,
  IconTrash,
  IconBookmark,
} from '@tabler/icons-react';
import { Avatar } from './avatar';
import { Badge } from './badge';
import { Button } from './button';
import { Card } from './card';
import { VerificationBadge } from './verification-badge';
import { cn } from '@/lib/cn';
import { getProfileUniqueId } from '@/lib/demo-data';

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
  isInterestSent?: boolean;
  isRemoving?: boolean;
  className?: string;
}

export function InterestCard({
  profile,
  type,
  onAccept,
  onDecline,
  onRemove,
  onShortlist,
  isShortlisted,
  onSendInterest,
  isInterestSent,
  isRemoving,
  className,
}: InterestCardProps) {
  const formattedId = getProfileUniqueId(profile);

  return (
    <Card
      variant="default"
      className={cn(
        'group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-white p-0 shadow-[var(--elevation-card)] transition-all duration-300 hover:shadow-[var(--elevation-card-hover)]',
        type === 'declined' && 'opacity-70 bg-[var(--surface-muted)]/50',
        className
      )}
    >
      <div className="flex flex-col md:flex-row">
        {/* Large Profile Photography Section (3:4 ratio portrait or dominant square) */}
        <div className="relative h-64 sm:h-72 md:h-auto md:w-56 lg:w-64 shrink-0 overflow-hidden bg-[var(--surface-muted)]">
          <img
            src={profile.image}
            alt={profile.name}
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />

          {/* Ambient Warm Gradient */}
          <div className="absolute inset-0 photo-overlay-warm" aria-hidden="true" />

          {/* Top Floating Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
            {profile.compatibility && (
              <Badge
                tone="accent"
                size="sm"
                icon={<IconUsers className="h-2.5 w-2.5 fill-current" />}
                className="backdrop-blur-md shadow-2xs text-[11px]"
              >
                {profile.compatibility}% Match
              </Badge>
            )}

            {profile.online && (
              <Badge
                tone="neutral"
                size="sm"
                dot
                dotColor="bg-emerald-500"
                className="bg-white/90 backdrop-blur-md text-[var(--foreground)] border-white/80 text-[11px]"
              >
                Online
              </Badge>
            )}
          </div>

          {/* Matrimony ID tag on Photo */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className="rounded-full bg-black/45 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 tracking-wider uppercase">
              ID: {formattedId}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            {/* Header: Name, Age, Verification */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link
                  href={`/app/profile?user=${profile.id}`}
                  className="font-editorial-title text-2xl font-bold tracking-tight text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                >
                  {profile.name}, {profile.age}
                </Link>
                {profile.verified && <VerificationBadge type="general" size="sm" />}
              </div>

              {/* Status pill based on tab type */}
              <div>
                {type === 'received' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--primary)] bg-[var(--primary-light)] px-2.5 py-1 rounded-full border border-[var(--primary)]/20">
                    <IconClock className="h-3 w-3" /> Awaiting Response
                  </span>
                )}
                {type === 'accepted' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <IconCheck className="h-3 w-3" /> Connected
                  </span>
                )}
                {type === 'sent' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8C5D30] bg-[#FAF3EC] px-2.5 py-1 rounded-full border border-[#EAD8C7]">
                    <IconClock className="h-3 w-3" /> Interest Delivered
                  </span>
                )}
                {type === 'declined' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                    Declined
                  </span>
                )}
              </div>
            </div>

            {/* Profession, Education & Location */}
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-semibold text-[var(--muted-strong)]">
              <span className="flex items-center gap-1.5 text-[var(--foreground)]">
                <IconBriefcase className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" />
                {profile.profession}
              </span>

              {profile.education && (
                <span className="flex items-center gap-1.5">
                  <IconSchool className="h-3.5 w-3.5 text-[var(--muted)] shrink-0" />
                  {profile.education}
                </span>
              )}

              <span className="flex items-center gap-1.5">
                <IconMapPin className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
                {profile.city}
                {profile.state ? `, ${profile.state}` : ''}
              </span>
            </div>

            {/* Short Introduction / Summary */}
            {profile.about && (
              <p className="text-xs leading-relaxed text-[var(--muted-strong)] italic bg-[#FFFDFB] p-3.5 rounded-2xl border border-[var(--border)]/70 line-clamp-2">
                "{profile.about}"
              </p>
            )}

            {/* Sent / Received timestamp if present */}
            {profile.sentAt && (
              <p className="text-[11px] text-[var(--muted)]">
                {type === 'sent' ? 'Sent' : 'Received'} {profile.sentAt}
              </p>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center gap-2.5">
            {/* RECEIVED TAB ACTIONS: Accept, Decline, View Profile */}
            {type === 'received' && (
              <>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onAccept?.(profile.id)}
                  className="rounded-xl px-5 text-xs font-bold shadow-xs active-press flex-1 sm:flex-none"
                  leftIcon={<IconCheck className="h-4 w-4" />}
                >
                  Accept Interest
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => onDecline?.(profile.id)}
                  className="rounded-xl px-4 text-xs font-semibold text-[var(--muted-strong)] hover:text-red-700 hover:border-red-200 active-press flex-1 sm:flex-none"
                  leftIcon={<IconX className="h-4 w-4" />}
                >
                  Decline
                </Button>

                <Link
                  href={`/app/profile?user=${profile.id}`}
                  className="focus-ring w-full sm:w-auto sm:ml-auto"
                >
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full sm:w-auto rounded-xl px-4 text-xs font-semibold"
                  >
                    View Profile
                  </Button>
                </Link>
              </>
            )}

            {/* ACCEPTED TAB ACTIONS: Chat, View Profile */}
            {type === 'accepted' && (
              <>
                <Link
                  href={`/app/messages?user=${profile.id}`}
                  className="focus-ring flex-1 sm:flex-none"
                >
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full rounded-xl px-5 text-xs font-bold shadow-xs active-press"
                    leftIcon={<IconMessageCircle className="h-4 w-4" />}
                  >
                    Chat with {profile.name.split(' ')[0]}
                  </Button>
                </Link>

                <Link
                  href={`/app/profile?user=${profile.id}`}
                  className="focus-ring w-full sm:w-auto sm:ml-auto"
                >
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full sm:w-auto rounded-xl px-4 text-xs font-semibold"
                  >
                    View Profile
                  </Button>
                </Link>
              </>
            )}

            {/* SENT TAB ACTIONS: View Profile */}
            {type === 'sent' && (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-[var(--muted)]">
                  Waiting for response
                </span>
                <Link href={`/app/profile?user=${profile.id}`} className="focus-ring">
                  <Button
                    variant="secondary"
                    size="md"
                    className="rounded-xl px-4 text-xs font-semibold"
                  >
                    View Profile
                  </Button>
                </Link>
              </div>
            )}

            {/* DECLINED TAB ACTIONS: View Profile */}
            {type === 'declined' && (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-[var(--muted)]">
                  Respectfully passed
                </span>
                <Link href={`/app/profile?user=${profile.id}`} className="focus-ring">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-xl px-3 text-xs font-semibold"
                  >
                    View Profile
                  </Button>
                </Link>
              </div>
            )}

            {/* FAVORITE TAB ACTIONS: View Profile & Remove */}
            {type === 'favorite' && (
              <div className="flex flex-wrap items-center justify-between gap-2.5 w-full">
                <span className="text-xs font-semibold text-[var(--primary)] flex items-center gap-1.5">
                  <IconBookmark className="h-4 w-4 fill-current" />
                  Saved in Shortlist
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  {onRemove && (
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => onRemove(profile.id)}
                      disabled={isRemoving}
                      className="rounded-xl px-3.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:border-rose-300 hover:bg-rose-50 active-press transition-colors"
                      leftIcon={<IconTrash className="h-3.5 w-3.5" />}
                    >
                      {isRemoving ? 'Removing...' : 'Remove'}
                    </Button>
                  )}
                  <Link href={`/app/profile?user=${profile.id}`} className="focus-ring">
                    <Button
                      variant="secondary"
                      size="md"
                      className="rounded-xl px-4 text-xs font-semibold"
                    >
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* SHORTLISTED YOU TAB ACTIONS: Shortlist Back, Send Interest, View Profile */}
            {type === 'shortlisted_you' && (
              <div className="flex flex-wrap items-center justify-between gap-2.5 w-full">
                <span className="text-xs font-semibold text-[#8B5A2B] flex items-center gap-1.5">
                  <IconBookmark className="h-4 w-4 text-[var(--accent)] fill-current" />
                  Shortlisted Your Profile
                </span>
                <div className="flex flex-wrap items-center gap-2 ml-auto">
                  {onShortlist && (
                    <Button
                      variant={isShortlisted ? 'primary' : 'outline'}
                      size="md"
                      onClick={() => onShortlist(profile.id)}
                      className="rounded-xl px-3.5 text-xs font-semibold active-press"
                      leftIcon={<IconBookmark className="h-3.5 w-3.5 fill-current" />}
                    >
                      {isShortlisted ? 'Shortlisted' : 'Shortlist Back'}
                    </Button>
                  )}
                  {onSendInterest && (
                    <Button
                      variant="primary"
                      size="md"
                      disabled={isInterestSent}
                      onClick={() => onSendInterest(profile.id)}
                      className="rounded-xl px-3.5 text-xs font-semibold active-press"
                      leftIcon={<IconHeart className="h-3.5 w-3.5 fill-current" />}
                    >
                      {isInterestSent ? 'Interest Sent' : 'Send Interest'}
                    </Button>
                  )}
                  <Link href={`/app/profile?user=${profile.id}`} className="focus-ring">
                    <Button
                      variant="secondary"
                      size="md"
                      className="rounded-xl px-3.5 text-xs font-semibold"
                    >
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
