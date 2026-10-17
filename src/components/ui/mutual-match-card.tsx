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
import { IconSparkles } from '@tabler/icons-react';

export interface MutualMatchCardProps {
  match: Profile;
  currentUser?: {
    name?: string;
    image?: string;
    verified?: boolean;
    city?: string;
  };
  onCelebrate?: (match: Profile) => void;
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
  onCelebrate,
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
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C1027]">
            Mutual Match
          </span>
        </div>

        <div className="flex items-center gap-2">
          {match.compatibility && (
            <Badge tone="accent" size="sm" className="font-bold text-[10px]">
              {match.compatibility}% Compatibility
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* ======================================================== */}
        {/* DUAL PROFILES PRESENTATION (Profile A + Profile B)       */}
        {/* ======================================================== */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 py-2">
          {/* Profile A: Current User */}
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-full ring-4 ring-[#FAF3EC] border-2 border-[#D8B28C] shadow-sm bg-[var(--surface-muted)]">
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
            <p className="mt-2 text-xs font-bold text-[var(--foreground)] truncate max-w-[75px]">
              {currentUser.name || 'You'}
            </p>
            <span className="text-[10px] font-semibold text-[var(--muted)]">Your Profile</span>
          </div>

          {/* Center Connection Knot & Crest */}
          <div className="flex flex-col items-center justify-center px-0">
            <div className="relative flex items-center justify-center">
              {/* Subtle connecting horizontal line */}
              <div className="absolute w-10 sm:w-14 h-0.5 bg-gradient-to-r from-transparent via-[#D8B28C] to-transparent" />
              
              {/* Central Refined Emblem */}
              <div className="relative z-10 grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full bg-gradient-to-br from-[#7A1835] to-[#5C1027] text-white shadow-md ring-4 ring-white">
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
              <div className="h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-full ring-4 ring-[#FAF3EC] border-2 border-[var(--primary)] shadow-sm bg-[var(--surface-muted)] transition-transform duration-300 group-hover/avatar:scale-105">
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
              {match.online && (
                <div 
                  className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm z-10" 
                  title="Online"
                />
              )}
            </Link>
            <Link
              href={`/app/profile?user=${match.id}`}
              className="mt-2 text-[11px] font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors truncate max-w-[80px]"
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
          <h3 className="font-editorial-title text-base sm:text-lg font-bold text-[var(--foreground)] leading-tight">
            Both of you are interested in connecting.
          </h3>
          <p className="text-[11px] sm:text-xs text-[var(--muted-strong)] max-w-md mx-auto">
            {match.profession} · {match.education} · Based in {match.city}, {match.state}
          </p>
        </div>



        {/* ======================================================== */}
        {/* ACTIONS: START CHAT & VIEW PROFILE                       */}
        {/* ======================================================== */}
        <div className="pt-2 border-t border-[var(--border)] flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <Link href={`/app/profile?user=${match.id}`} className="flex-1 focus-ring">
              <Button
                variant="secondary"
                size="md"
                className="w-full rounded-2xl text-xs font-bold h-11"
              >
                View Profile
              </Button>
            </Link>

            {onCelebrate && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => onCelebrate(match)}
                className="rounded-2xl text-xs font-bold h-11 px-3 bg-[#FAF3EC] border-[#EAD8C7] text-[#7A1835] hover:bg-[#F3E7DC] active-press flex items-center gap-1.5 shrink-0"
                title="Celebrate Connection"
              >
                <IconSparkles className="h-4 w-4 text-[#7A1835]" />
                <span className="hidden sm:inline">Celebrate</span>
              </Button>
            )}
          </div>

          <Link href={`/app/messages?user=${match.id}`} className="w-full focus-ring">
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
