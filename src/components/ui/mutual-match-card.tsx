'use client';

import React from 'react';
import Link from 'next/link';
import {
  IconMessageCircle,
  IconMapPin,
  IconBriefcase,
  IconSchool,
  IconArrowRight,
  IconShieldCheck,
  IconCircleCheck,
  IconUsers,
} from '@tabler/icons-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { cn } from '@/lib/cn';
import type { Profile } from '@/lib/demo-data';

export interface MutualMatchCardProps {
  match: Profile;
  currentUser?: {
    name?: string;
    image?: string;
    verified?: boolean;
    city?: string;
  };
  className?: string;
}

export function MutualMatchCard({
  match,
  currentUser = {
    name: 'You',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    verified: true,
    city: 'Kochi',
  },
  className,
}: MutualMatchCardProps) {
  return (
    <Card
      variant="default"
      className={cn(
        'group relative overflow-hidden rounded-3xl border border-[#EAD8C7] bg-white p-0 shadow-[var(--elevation-card)] transition-all duration-300 hover:shadow-[var(--elevation-card-hover)]',
        className
      )}
    >
      {/* Top Ambient Gold Highlight Strip */}
      <div className="bg-gradient-to-r from-[#FAF3EC] via-[#FFF9F6] to-[#FFF5F7] px-5 py-3 border-b border-[#EAD8C7]/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--primary)] text-white">
            <IconUsers className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#5C1027]">
            Mutual Match
          </span>
        </div>

        <div className="flex items-center gap-2">
          {match.compatibility && (
            <Badge tone="accent" size="sm" className="font-bold text-[11px]">
              {match.compatibility}% Compatibility
            </Badge>
          )}
          {match.online && (
            <Badge
              tone="neutral"
              size="sm"
              dot
              dotColor="bg-emerald-500"
              className="bg-white/90 text-[var(--foreground)] border-stone-200 text-[11px]"
            >
              Online
            </Badge>
          )}
        </div>
      </div>

      <div className="p-6 sm:p-7 space-y-6">
        {/* ======================================================== */}
        {/* DUAL PROFILES PRESENTATION (Profile A + Profile B)       */}
        {/* ======================================================== */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 py-2">
          {/* Profile A: Current User */}
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full ring-4 ring-[#FAF3EC] border-2 border-[#D8B28C] shadow-sm bg-[var(--surface-muted)]">
                <img
                  src={currentUser.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                  alt={currentUser.name || 'You'}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              {currentUser.verified && (
                <div className="absolute -bottom-1 -right-1">
                  <VerificationBadge type="general" showIconOnly size="sm" />
                </div>
              )}
            </div>
            <p className="mt-2 text-xs font-bold text-[var(--foreground)] truncate max-w-[90px]">
              {currentUser.name || 'You'}
            </p>
            <span className="text-[10px] font-semibold text-[var(--muted)]">Your Profile</span>
          </div>

          {/* Center Connection Knot & Crest */}
          <div className="flex flex-col items-center justify-center px-1 sm:px-3">
            <div className="relative flex items-center justify-center">
              {/* Subtle connecting horizontal line */}
              <div className="absolute w-20 sm:w-28 h-0.5 bg-gradient-to-r from-transparent via-[#D8B28C] to-transparent" />
              
              {/* Central Refined Emblem */}
              <div className="relative z-10 grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-full bg-gradient-to-br from-[#7A1835] to-[#5C1027] text-white shadow-md ring-4 ring-white">
                <IconUsers className="h-5 w-5" />
              </div>
            </div>
            <span className="mt-2 text-[10px] font-bold tracking-wider text-[#8C5D30] uppercase">
              Connected
            </span>
          </div>

          {/* Profile B: Matched Partner */}
          <div className="flex flex-col items-center text-center">
            <Link
              href={`/app/profile?user=${match.id}`}
              className="focus-ring relative rounded-full block group/avatar"
            >
              <div className="h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full ring-4 ring-[#FAF3EC] border-2 border-[var(--primary)] shadow-sm bg-[var(--surface-muted)] transition-transform duration-300 group-hover/avatar:scale-105">
                <img
                  src={match.image}
                  alt={match.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              {match.verified && (
                <div className="absolute -bottom-1 -right-1">
                  <VerificationBadge type="general" showIconOnly size="sm" />
                </div>
              )}
            </Link>
            <Link
              href={`/app/profile?user=${match.id}`}
              className="mt-2 text-xs font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors truncate max-w-[110px]"
            >
              {match.name}, {match.age}
            </Link>
            <span className="text-[10px] font-semibold text-[var(--muted)] truncate max-w-[100px]">
              {match.city}
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CONNECTION STATUS & SUMMARY STATEMENT                    */}
        {/* ======================================================== */}
        <div className="text-center space-y-1.5 pt-1">
          <h3 className="font-editorial-title text-xl sm:text-2xl font-bold text-[var(--foreground)]">
            Both of you are interested in connecting.
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted-strong)] max-w-md mx-auto">
            {match.profession} · {match.education} · Based in {match.city}, {match.state}
          </p>
        </div>

        {/* Short Personal IconQuote */}
        {match.about && (
          <p className="text-xs leading-relaxed text-[var(--muted-strong)] italic bg-[#FFFDFB] p-3.5 rounded-2xl border border-[var(--border)]/70 text-center line-clamp-2">
            "{match.about}"
          </p>
        )}

        {/* ======================================================== */}
        {/* ACTIONS: START CHAT & VIEW PROFILE                       */}
        {/* ======================================================== */}
        <div className="pt-2 border-t border-[var(--border)] flex flex-col sm:flex-row items-center gap-3">
          <Link href={`/app/profile?user=${match.id}`} className="w-full sm:w-auto flex-1 focus-ring">
            <Button
              variant="secondary"
              size="md"
              className="w-full rounded-2xl text-xs font-bold h-11"
            >
              View Profile
            </Button>
          </Link>

          <Link href={`/app/messages?user=${match.id}`} className="w-full sm:w-auto flex-1 focus-ring">
            <Button
              variant="primary"
              size="md"
              className="w-full rounded-2xl text-xs font-bold h-11 shadow-md active-press"
              leftIcon={<IconMessageCircle className="h-4 w-4" />}
            >
              Start Chat
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
