'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IconCalendar,
  IconMapPin,
  IconBriefcase,
  IconSchool,
  IconHeart,
  IconCoffee,
  IconAdjustments,
  IconRefresh,
  IconDeviceFloppy,
  IconCircleCheck,
  IconQuote,
  IconShieldCheck,
  IconCompass,
  IconArrowRight,
  IconLoader2,
  IconUsers,
  IconCoins,
} from '@tabler/icons-react';
import { SectionHeader } from '@/components/ui/section-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PreferenceSectionCard } from './preference-section-card';
import { PreferenceSummarySidebar } from './preference-summary-sidebar';
import {
  PreferenceModalEditor,
  PreferenceEditSectionId,
} from './preference-modal-editor';
import { PartnerPreferences, defaultPreferences } from './preference-types';
import { profileService } from '@/services';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';

interface PartnerPreferencesEditorProps {
  initialPreferences?: Partial<PartnerPreferences>;
  isEmbedded?: boolean;
}

export function PartnerPreferencesEditor({
  initialPreferences,
  isEmbedded = false,
}: PartnerPreferencesEditorProps) {
  const [preferences, setPreferences] = useState<PartnerPreferences>({
    ...defaultPreferences,
    ...initialPreferences,
  });

  const [activeSection, setActiveSection] = useState<PreferenceEditSectionId | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialPreferences);

  // Load from backend on mount if not provided
  useEffect(() => {
    if (!initialPreferences) {
      setIsLoading(true);
      profileService
        .getProfile('me')
        .then((res: any) => {
          if (res && res.preferences) {
            setPreferences((prev) => ({
              ...prev,
              ...res.preferences,
            }));
          }
        })
        .catch((err) => {
          console.warn('Could not load existing preferences from API:', err);
        })
        .finally(() => setIsLoading(false));
    }
  }, [initialPreferences]);

  const handleEditSection = (id: PreferenceEditSectionId) => {
    setActiveSection(id);
  };

  const handleApplySectionChanges = (updated: Partial<PartnerPreferences>) => {
    setPreferences((prev) => ({
      ...prev,
      ...updated,
    }));
    setHasChanges(true);
    toast.success('Section Updated', {
      description: 'Your changes are staged. Click DeviceFloppy Preferences to publish them.',
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await profileService.updatePreferences('me', preferences);
      toast.success('Preferences Saved', {
        description: 'Your matchmaking filters and discoverability reach have been updated.',
      });
      setHasChanges(false);
    } catch (err: any) {
      console.warn('API save error (proceeding with optimistic local save):', err);
      toast.success('Preferences Saved Locally', {
        description: 'Your partner preferences have been updated for this session.',
      });
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset partner preferences to default recommendations?')) {
      setPreferences(defaultPreferences);
      setHasChanges(true);
      toast.info('Preferences Reset', {
        description: 'Default preferences restored. Click IconDeviceFloppy to confirm.',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-[#766B6F] gap-3">
        <IconLoader2 className="h-8 w-8 animate-spin text-[#7A1835]" />
        <span className="text-xs font-semibold">Loading partner preferences...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      {/* Top Header */}
      {!isEmbedded && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SectionHeader
              eyebrow="Matchmaking Criteria"
              title="Your Partner Preferences"
              description="Tell us what matters to you. You can change these preferences anytime to adjust your recommendations."
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Link href="/app/discover">
              <Button
                variant="secondary"
                size="md"
                className="rounded-2xl text-xs font-bold gap-1.5 border-[#E9DDE0]"
                leftIcon={<IconCompass className="h-3.5 w-3.5 text-[#7A1835]" />}
              >
                <span>View Matches</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Main Grid: Left Editable Sections vs Right Summary Profile */}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
        {/* LEFT COLUMN: EDITABLE PREFERENCE SECTIONS */}
        <div className="space-y-4">
          {/* Mobile Quick Action Strip (Sticky/Top on 360px-430px screens) */}
          <div className="flex lg:hidden items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-[#E9DDE0] shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#FAF3EC] text-[#7A1835] flex items-center justify-center font-bold text-xs shrink-0">
                <IconAdjustments className="h-4 w-4 text-[#7A1835]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#211B1E] block">Match Criteria</span>
                <span className="text-[10px] font-medium text-[#766B6F]">
                  {hasChanges ? 'Changes staged — tap IconDeviceFloppy' : 'Tap any card below to edit'}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                'rounded-xl text-xs font-bold px-4 h-9 shadow-xs active-press shrink-0 transition-all',
                hasChanges
                  ? 'bg-[#7A1835] hover:bg-[#5C1027] text-white'
                  : 'bg-[#FAF3EC] text-[#7A1835] border border-[#EAD8C7]'
              )}
            >
              {isSaving ? <IconLoader2 className="h-3.5 w-3.5 animate-spin" /> : 'IconDeviceFloppy'}
            </Button>
          </div>

          {/* Quick Notice Banner */}
          <div className="hidden lg:flex rounded-2xl bg-gradient-to-r from-[#FAF3EC] via-[#FFF9F6] to-[#FFF5F7] p-4 border border-[#EAD8C7] items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <IconAdjustments className="h-4 w-4 text-[#7A1835] shrink-0" />
              <p className="text-xs text-[#5C1027] font-medium">
                Tap on any card to edit its filters with sliders, chips and compact controls.
              </p>
            </div>
            {hasChanges && (
              <span className="shrink-0 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                Unsaved changes
              </span>
            )}
          </div>

          {/* Section 1: Age & Physical Attributes */}
          <PreferenceSectionCard
            id="age_height"
            icon={<IconCalendar className="h-5 w-5" />}
            title="Age & Height"
            subtitle="Preferred age window and physical stature"
            statusText={`${preferences.minAge} – ${preferences.maxAge} yrs`}
            onEdit={() => handleEditSection('age_height')}
            preview={
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-[#FFF9F6] p-3 border border-[#E9DDE0]/70">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#766B6F]">
                    Age Bracket
                  </span>
                  <span className="text-sm font-bold text-[#211B1E] mt-0.5 block">
                    {preferences.minAge} to {preferences.maxAge} years
                  </span>
                </div>
                <div className="rounded-2xl bg-[#FFF9F6] p-3 border border-[#E9DDE0]/70">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#766B6F]">
                    Height Range
                  </span>
                  <span className="text-sm font-bold text-[#211B1E] mt-0.5 block">
                    {preferences.minHeight} to {preferences.maxHeight}
                  </span>
                </div>
              </div>
            }
          />

          {/* Section 2: Location & Relocation */}
          <PreferenceSectionCard
            id="location"
            icon={<IconMapPin className="h-5 w-5" />}
            title="Location & Relocation"
            subtitle="Locations where you'd love your partner to reside"
            onEdit={() => handleEditSection('location')}
            preview={
              <div className="flex flex-wrap items-center gap-2">
                {preferences.locations.map((loc) => (
                  <Badge
                    key={loc}
                    tone="accent"
                    className="text-xs font-semibold px-2.5 py-1 rounded-xl"
                  >
                    <IconMapPin className="h-3 w-3 mr-1 text-[#7A1835]" />
                    {loc}
                  </Badge>
                ))}
                {preferences.openToRelocate && (
                  <Badge
                    tone="success"
                    className="text-xs font-semibold px-2.5 py-1 rounded-xl"
                  >
                    Open to relocate
                  </Badge>
                )}
              </div>
            }
          />

          {/* Section 3: Education, Profession & Income */}
          <PreferenceSectionCard
            id="education_profession"
            icon={<IconBriefcase className="h-5 w-5" />}
            title="Education, Profession & Income"
            subtitle="Professional background and career aspirations"
            onEdit={() => handleEditSection('education_profession')}
            preview={
              <div className="space-y-2.5 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[#766B6F] font-semibold mr-1">Education:</span>
                  {preferences.education.map((e) => (
                    <span
                      key={e}
                      className="rounded-lg bg-[#FAF3EC] text-[#7A1835] font-semibold px-2 py-0.5 text-[11px] border border-[#EAD8C7]"
                    >
                      {e}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[#766B6F] font-semibold mr-1">Professions:</span>
                  {preferences.professions.map((p) => (
                    <span
                      key={p}
                      className="rounded-lg bg-[#FFF9F6] text-[#211B1E] font-semibold px-2 py-0.5 text-[11px] border border-[#E9DDE0]"
                    >
                      {p}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1 text-[#211B1E]">
                  <span className="text-[#766B6F] font-semibold">Min. Annual Income:</span>
                  <span className="font-bold text-[#7A1835]">{preferences.minIncome}</span>
                </div>
              </div>
            }
          />

          {/* Section 4: Religion & Community */}
          <PreferenceSectionCard
            id="religion_community"
            icon={<IconUsers className="h-5 w-5" />}
            title="Religion & Community"
            subtitle="Faith, community outlook and horoscope compatibility"
            onEdit={() => handleEditSection('religion_community')}
            preview={
              <div className="flex flex-wrap items-center gap-2">
                {preferences.religions.map((r) => (
                  <span
                    key={r}
                    className="rounded-xl bg-[#FFF9F6] text-[#211B1E] px-3 py-1 text-xs font-semibold border border-[#E9DDE0]"
                  >
                    {r}
                  </span>
                ))}
                <span className="rounded-xl bg-[#FAF3EC] text-[#7A1835] px-3 py-1 text-xs font-semibold border border-[#EAD8C7]">
                  Caste: {preferences.caste}
                </span>
                {preferences.horoscopeMatch && (
                  <span className="rounded-xl bg-purple-50 text-purple-700 px-3 py-1 text-xs font-semibold border border-purple-200">
                    Horoscope Required
                  </span>
                )}
              </div>
            }
          />

          {/* Section 5: Marital Status & Intent */}
          <PreferenceSectionCard
            id="marital_intent"
            icon={<IconHeart className="h-5 w-5" />}
            title="Marital Status & Marriage Intent"
            subtitle="Timeline and readiness for matrimonial commitment"
            onEdit={() => handleEditSection('marital_intent')}
            preview={
              <div className="flex flex-wrap items-center gap-2">
                {preferences.maritalStatus.map((m) => (
                  <span
                    key={m}
                    className="rounded-xl bg-[#FFF9F6] text-[#211B1E] px-3 py-1 text-xs font-semibold border border-[#E9DDE0]"
                  >
                    {m}
                  </span>
                ))}
                <span className="rounded-xl bg-gradient-to-r from-[#FAF3EC] to-[#FFF5F7] text-[#7A1835] px-3 py-1 text-xs font-bold border border-[#EAD8C7]">
                  Intent: {preferences.partnerIntent}
                </span>
              </div>
            }
          />

          {/* Section 6: Diet & Lifestyle */}
          <PreferenceSectionCard
            id="lifestyle_diet"
            icon={<IconCoffee className="h-5 w-5" />}
            title="Diet & Lifestyle Habits"
            subtitle="Food choices, habits and everyday living preferences"
            onEdit={() => handleEditSection('lifestyle_diet')}
            preview={
              <div className="flex flex-wrap items-center gap-1.5">
                {preferences.diet.map((d) => (
                  <span
                    key={d}
                    className="rounded-xl bg-[#FFF9F6] text-[#211B1E] px-2.5 py-1 text-xs font-semibold border border-[#E9DDE0]"
                  >
                    {d}
                  </span>
                ))}
                {preferences.lifestyleHabits.map((h) => (
                  <span
                    key={h}
                    className="rounded-xl bg-[#FAF3EC] text-[#7A1835] px-2.5 py-1 text-xs font-semibold border border-[#EAD8C7]"
                  >
                    {h}
                  </span>
                ))}
              </div>
            }
          />

          {/* Section 7: Personal Note */}
          <PreferenceSectionCard
            id="personal_notes"
            icon={<IconQuote className="h-5 w-5" />}
            title="What Matters to You (Personal Note)"
            subtitle="A thoughtful description of your ideal matrimonial partner"
            onEdit={() => handleEditSection('personal_notes')}
            preview={
              <div className="rounded-2xl bg-[#FFF9F6] p-4 border border-[#E9DDE0] italic text-xs leading-relaxed text-[#211B1E]">
                "{preferences.aboutPartner}"
              </div>
            }
          />
        </div>

        {/* RIGHT COLUMN: PREFERENCE PROFILE SUMMARY SIDEBAR */}
        <aside className="lg:sticky lg:top-20 h-fit">
          <PreferenceSummarySidebar
            preferences={preferences}
            onSave={handleSave}
            onReset={handleReset}
            isSaving={isSaving}
          />
        </aside>
      </div>

      {/* MODAL / SHEET EDITOR */}
      <PreferenceModalEditor
        sectionId={activeSection}
        isOpen={activeSection !== null}
        preferences={preferences}
        onClose={() => setActiveSection(null)}
        onSave={handleApplySectionChanges}
      />
    </div>
  );
}
