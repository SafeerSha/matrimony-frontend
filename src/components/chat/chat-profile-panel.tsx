'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  IconMapPin,
  IconBriefcase,
  IconSchool,
  IconHeart,
  IconBookmark,
  IconBan,
  IconFlag,
  IconShieldCheck,
  IconExternalLink,
  IconChevronRight,
  IconCheck,
  IconUsers,
} from '@tabler/icons-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VerificationBadge } from '@/components/ui/verification-badge';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import type { Profile } from '@/lib/demo-data';

interface ChatProfilePanelProps {
  participant?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    city?: string;
    country?: string;
    occupation?: string;
    education?: string;
    dateOfBirth?: string;
    photos?: { url: string }[];
    isVerified?: boolean;
    bio?: string;
    height?: number;
    religion?: string;
    maritalStatus?: string;
  };
  demoProfile?: Profile;
  className?: string;
  onClose?: () => void;
}

export function ChatProfilePanel({
  participant,
  demoProfile,
  className,
  onClose,
}: ChatProfilePanelProps) {
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  // Derive unified profile data
  const name =
    participant?.name ||
    `${participant?.firstName || ''} ${participant?.lastName || ''}`.trim() ||
    demoProfile?.name ||
    'Member Profile';

  const photo =
    participant?.photos?.[0]?.url ||
    demoProfile?.image ||
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85';

  const age = participant?.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(participant.dateOfBirth).getTime()) / 31557600000
      )
    : demoProfile?.age || 27;

  const city = participant?.city || demoProfile?.city || 'Kochi';
  const state = participant?.country || demoProfile?.state || 'Kerala';
  const occupation = participant?.occupation || demoProfile?.profession || 'Professional';
  const education = participant?.education || demoProfile?.education || 'Postgraduate';
  const bio =
    participant?.bio ||
    demoProfile?.about ||
    'Looking forward to meaningful conversations and building a life based on mutual respect and shared values.';
  const compatibility = demoProfile?.compatibility || 92;
  const isVerified = participant?.isVerified ?? demoProfile?.verified ?? true;
  const profileId = participant?.id || demoProfile?.id || 'profile';

  const handleShortlistToggle = () => {
    setIsShortlisted((prev) => {
      const next = !prev;
      if (next) {
        toast.success('Saved to Shortlist', {
          description: `${name} has been added to your shortlisted connections.`,
        });
      } else {
        toast.info('Removed from Shortlist', {
          description: `${name} was removed from your shortlist.`,
        });
      }
      return next;
    });
  };

  const handleBlock = () => {
    if (confirm(`Are you sure you want to block ${name}? You will no longer receive messages.`)) {
      setIsBlocked(true);
      toast.warning('Contact Blocked', {
        description: `${name} has been blocked and removed from your active chats.`,
      });
      if (onClose) onClose();
    }
  };

  const handleReport = () => {
    toast.info('Report Submitted', {
      description: 'Our trust & safety team has received your report for review.',
    });
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-[#FFFDFB] text-[#211B1E] overflow-y-auto scrollbar-none',
        className
      )}
    >
      {/* Profile Header IconPhoto & Compatibility */}
      <div className="p-5 pb-0">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#E9DDE0] bg-[#FAF3EC] shadow-xs group">
          <img
            src={photo}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Compatibility Pill */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-[#7A1835] shadow-sm backdrop-blur-xs">
              <IconUsers className="h-3 w-3 text-[#D8B28C]" />
              {compatibility}% Match
            </span>
          </div>

          {/* Name & Basic info over photo overlay */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="flex items-center gap-1.5">
              <h3 className="font-editorial-title text-lg font-bold leading-tight drop-shadow-xs">
                {name}, {age}
              </h3>
              {isVerified && <VerificationBadge size="sm" />}
            </div>
            <p className="text-[12px] text-white/90 font-medium truncate flex items-center gap-1 mt-0.5">
              <IconMapPin className="h-3 w-3 text-white/80 shrink-0" />
              {city}, {state}
            </p>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="p-5 space-y-5 flex-1">
        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 gap-2.5 rounded-2xl bg-[#FFF9F6] p-3.5 border border-[#E9DDE0]">
          <div className="flex items-center gap-2.5 text-xs text-[#211B1E]">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-white border border-[#E9DDE0] text-[#7A1835]">
              <IconBriefcase className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#766B6F]">
                Profession
              </span>
              <span className="font-semibold truncate block">{occupation}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-[#211B1E]">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-white border border-[#E9DDE0] text-[#7A1835]">
              <IconSchool className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#766B6F]">
                Education
              </span>
              <span className="font-semibold truncate block">{education}</span>
            </div>
          </div>
        </div>

        {/* About Snippet */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#766B6F] mb-1.5">
            About
          </h4>
          <p className="text-xs text-[#211B1E] leading-relaxed line-clamp-4 bg-white p-3 rounded-xl border border-[#E9DDE0]/80">
            {bio}
          </p>
        </div>

        {/* Primary Action: View Full Profile */}
        <div className="space-y-2 pt-1">
          <Link href={`/app/discover?view=${profileId}`} className="block">
            <Button
              variant="outline"
              size="md"
              className="w-full justify-between rounded-xl border-[#7A1835] text-[#7A1835] hover:bg-[#7A1835]/5 text-xs font-bold"
            >
              <span>View Full Profile</span>
              <IconExternalLink className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="md"
            onClick={handleShortlistToggle}
            className={cn(
              'w-full justify-center rounded-xl text-xs font-bold gap-2 transition-all',
              isShortlisted
                ? 'bg-[#FAF3EC] border-[#D8B28C] text-[#7A1835]'
                : 'bg-white border-[#E9DDE0] text-[#211B1E] hover:bg-[#FFF9F6]'
            )}
          >
            <IconBookmark
              className={cn(
                'h-3.5 w-3.5',
                isShortlisted ? 'fill-[#7A1835] text-[#7A1835]' : 'text-[#766B6F]'
              )}
            />
            <span>{isShortlisted ? 'Shortlisted' : 'Shortlist Profile'}</span>
          </Button>
        </div>

        {/* Safety & Trust Note */}
        <div className="rounded-xl border border-[#EAD8C7] bg-[#FAF3EC]/60 p-3 flex items-start gap-2.5">
          <IconShieldCheck className="h-4 w-4 text-[#7A1835] shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed text-[#5C1027]">
            <span className="font-bold block">Verified Matrimonial Match</span>
            Identity verified via photo selfie and contact screening.
          </div>
        </div>

        {/* Moderation Actions (Block / Report) */}
        <div className="pt-2 border-t border-[#E9DDE0] flex items-center justify-between text-xs text-[#766B6F]">
          <button
            onClick={handleBlock}
            className="inline-flex items-center gap-1.5 hover:text-red-700 transition-colors py-1 px-2 rounded-lg hover:bg-red-50 text-[11px] font-semibold"
          >
            <IconBan className="h-3 w-3 text-red-500" />
            <span>Block</span>
          </button>

          <button
            onClick={handleReport}
            className="inline-flex items-center gap-1.5 hover:text-amber-800 transition-colors py-1 px-2 rounded-lg hover:bg-amber-50 text-[11px] font-semibold"
          >
            <IconFlag className="h-3 w-3 text-amber-600" />
            <span>Report Member</span>
          </button>
        </div>
      </div>
    </div>
  );
}
