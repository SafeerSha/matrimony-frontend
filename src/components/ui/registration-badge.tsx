'use client';

import React from 'react';
import { IconHeartHandshake, IconUsers, IconHomeHeart } from '@tabler/icons-react';
import { cn } from '@/lib/cn';
import { getRegistrationBadge, type RegistrationBadgeInfo } from '@/lib/demo-data';

export interface RegistrationCategoryBadgeProps {
  profile?: {
    category?: string;
    profileFor?: string;
    state?: string;
    city?: string;
    motherTongue?: string;
    [key: string]: any;
  } | null;
  className?: string;
  size?: 'sm' | 'md';
}

export function RegistrationCategoryBadge({
  profile,
  className = '',
  size = 'md',
}: RegistrationCategoryBadgeProps) {
  const badge: RegistrationBadgeInfo = getRegistrationBadge(profile);

  const isLiveIn = badge.category === 'Live-In' || badge.category === 'Living Together';
  const IconComponent =
    badge.category === 'Friendship'
      ? IconUsers
      : isLiveIn
      ? IconHomeHeart
      : IconHeartHandshake;

  const isSmall = size === 'sm';

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border font-bold tracking-wide select-none shadow-2xs transition-all",
        isSmall ? "gap-1 px-2 py-0.5 text-[11px]" : "gap-1.5 px-3 py-1 text-xs",
        badge.className,
        className
      )}
    >
      <IconComponent
        className={cn(
          "shrink-0",
          isSmall ? "h-3 w-3" : "h-3.5 w-3.5",
          badge.category === 'Friendship'
            ? "text-emerald-700"
            : isLiveIn
            ? "text-indigo-700"
            : "text-[#80132E]"
        )}
      />
      <span>{badge.label}</span>
    </div>
  );
}

