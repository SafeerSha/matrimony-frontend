'use client';

import React from 'react';
import {
  IconDeviceFloppy,
  IconRefresh,
  IconCircleCheck,
  IconShieldCheck,
  IconCompass,
  IconAdjustments,
  IconHeart,
  IconLoader2,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import type { PartnerPreferences } from './preference-types';

interface PreferenceSummarySidebarProps {
  preferences: PartnerPreferences;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
  className?: string;
}

export function PreferenceSummarySidebar({
  preferences,
  onSave,
  onReset,
  isSaving = false,
  className,
}: PreferenceSummarySidebarProps) {
  // Compute approximate discoverability score based on breadth of filters
  const computeDiscoverability = () => {
    let score = 70;
    if (preferences.locations.length >= 2) score += 8;
    if (preferences.openToRelocate) score += 5;
    if (preferences.education.length >= 2) score += 5;
    if (preferences.maxAge - preferences.minAge >= 5) score += 6;
    if (preferences.religions.some((r) => r.toLowerCase().includes('open') || r.toLowerCase().includes('all'))) score += 6;
    return Math.min(score, 98);
  };

  const score = computeDiscoverability();

  return (
    <div className={cn('space-y-4', className)}>
      {/* Preference Profile Card */}
      <Card className="rounded-3xl border border-[#E9DDE0] bg-white p-5 sm:p-6 shadow-sm space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E9DDE0]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A1835]">
              Match Strategy
            </span>
            <h3 className="font-editorial-title text-lg font-bold text-[#211B1E]">
              Your Preference Profile
            </h3>
          </div>
          <div className="h-9 w-9 rounded-2xl bg-[#FAF3EC] border border-[#EAD8C7] flex items-center justify-center text-[#7A1835]">
            <IconAdjustments className="h-4 w-4" />
          </div>
        </div>

        {/* Discoverability Meter */}
        <div className="rounded-2xl bg-[#FAF3EC]/80 border border-[#EAD8C7] p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5C1027] flex items-center gap-1.5">
              <IconCompass className="h-3.5 w-3.5 text-[#D8B28C]" />
              Discovery Breadth
            </span>
            <span className="text-sm font-bold text-[#7A1835]">{score}% Match Reach</span>
          </div>

          <div className="h-2 w-full rounded-full bg-white/80 overflow-hidden border border-[#EAD8C7]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C77A8B] to-[#7A1835] transition-all duration-500"
              style={{ width: `${score}%` }}
            />
          </div>

          <p className="text-[11px] text-[#766B6F] leading-relaxed pt-0.5">
            Your preferences strike a strong balance between specific requirements and an active
            matrimonial match pool.
          </p>
        </div>

        {/* Key Highlights Digest */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-[#E9DDE0]/60">
            <span className="text-[#766B6F] font-medium">Age Window</span>
            <span className="font-bold text-[#211B1E]">
              {preferences.minAge} – {preferences.maxAge} yrs
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#E9DDE0]/60">
            <span className="text-[#766B6F] font-medium">Height</span>
            <span className="font-bold text-[#211B1E]">
              {preferences.minHeight} – {preferences.maxHeight}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#E9DDE0]/60">
            <span className="text-[#766B6F] font-medium">Locations</span>
            <span className="font-bold text-[#211B1E] truncate max-w-[150px] text-right">
              {preferences.locations.slice(0, 2).join(', ')}
              {preferences.locations.length > 2 && ` +${preferences.locations.length - 2}`}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#E9DDE0]/60">
            <span className="text-[#766B6F] font-medium">Min. Income</span>
            <span className="font-bold text-[#211B1E]">{preferences.minIncome}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-[#E9DDE0]/60">
            <span className="text-[#766B6F] font-medium">Partner Intent</span>
            <span className="font-bold text-[#7A1835] truncate max-w-[150px] text-right">
              {preferences.partnerIntent}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <span className="text-[#766B6F] font-medium">Relocation</span>
            <span className="font-bold text-[#211B1E]">
              {preferences.openToRelocate ? 'Open to relocate' : 'Preferred location only'}
            </span>
          </div>
        </div>

        {/* Primary and Secondary Action CTAs */}
        <div className="pt-2 space-y-2.5">
          <Button
            size="lg"
            onClick={onSave}
            disabled={isSaving}
            className="w-full rounded-2xl bg-[#7A1835] hover:bg-[#5C1027] text-white font-bold text-sm shadow-sm active-press justify-center gap-2"
          >
            {isSaving ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy className="h-4 w-4 text-[#D8B28C]" />
                <span>Save Preferences</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={onReset}
            disabled={isSaving}
            className="w-full rounded-2xl border-[#E9DDE0] bg-[#FFF9F6] hover:bg-[#FAF3EC] text-[#766B6F] hover:text-[#211B1E] font-semibold text-xs justify-center gap-2"
          >
            <IconRefresh className="h-3.5 w-3.5" />
            <span>Reset to Default</span>
          </Button>
        </div>
      </Card>

      {/* Trust & Privacy Card */}
      <div className="rounded-3xl border border-[#E9DDE0] bg-[#FFF9F6] p-4.5 flex items-start gap-3">
        <IconShieldCheck className="h-5 w-5 text-[#7A1835] shrink-0 mt-0.5" />
        <div className="text-xs text-[#211B1E] leading-relaxed">
          <p className="font-bold text-[#5C1027]">Private & Confidential</p>
          <p className="text-[11px] text-[#766B6F] mt-0.5">
            Your partner preferences are never published publicly on your profile. They are only
            used by our matchmaking algorithms to recommend profiles.
          </p>
        </div>
      </div>
    </div>
  );
}
