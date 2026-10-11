'use client';

import React, { useState, useEffect } from 'react';
import {
  IconCalendar,
  IconMapPin,
  IconBriefcase,
  IconSchool,
  IconHeart,
  IconCoffee,
  IconCheck,
  IconX,
  IconAdjustments,
  IconCoins,
  IconShieldCheck,
} from '@tabler/icons-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { ModernSelect } from '@/components/ui/modern-select';
import { cn } from '@/lib/cn';
import type { PartnerPreferences } from './preference-types';

export type PreferenceEditSectionId =
  | 'age_height'
  | 'location'
  | 'religion_community'
  | 'education_profession'
  | 'marital_intent'
  | 'lifestyle_diet'
  | 'personal_notes';

interface PreferenceModalEditorProps {
  sectionId: PreferenceEditSectionId | null;
  isOpen: boolean;
  preferences: PartnerPreferences;
  onClose: () => void;
  onSave: (updated: Partial<PartnerPreferences>) => void;
}

const LOCATION_OPTIONS = [
  'Kerala',
  'Bengaluru',
  'Chennai',
  'Mumbai',
  'Hyderabad',
  'Delhi NCR',
  'UAE / Gulf',
  'US / Canada',
  'UK / Europe',
  'Australia',
  'Any location',
];

const RELIGION_OPTIONS = [
  'Open to all communities',
  'Hindu',
  'Muslim',
  'Christian',
  'Jain',
  'Sikh',
  'Buddhist',
  'Spiritual / Non-religious',
];

const EDUCATION_OPTIONS = [
  'Any qualification',
  'Graduate Degree',
  'Postgraduate / Masters',
  'Doctorate / PhD',
  'Professional (CA/MBBS/LLB/MBA)',
  'Engineering / Tech',
];

const PROFESSION_OPTIONS = [
  'Any profession',
  'Software / IT',
  'Healthcare / Medical',
  'Finance & Banking',
  'Government / Civil Services',
  'Design / Creative',
  'Business & Entrepreneurship',
  'Teaching / Academia',
];

const INCOME_OPTIONS = [
  'Doesn\'t matter',
  '₹5 Lakhs+',
  '₹8 Lakhs+',
  '₹12 Lakhs+',
  '₹18 Lakhs+',
  '₹25 Lakhs+',
  '₹40 Lakhs+',
  '₹50 Lakhs+',
];

const MARITAL_STATUS_OPTIONS = [
  'Never Married',
  'Divorced',
  'Awaiting Divorce',
  'Widowed',
  'Doesn\'t Matter',
];

const INTENT_OPTIONS = [
  'Serious Marriage (within 6 months)',
  'Serious Marriage (within 1 year)',
  'Flexible Timeline / Mutual Understanding',
  'Simple / Intimate Wedding preferred',
];

const DIET_OPTIONS = [
  'Doesn\'t Matter',
  'Vegetarian',
  'Eggetarian',
  'Non-Vegetarian',
  'Vegan',
];

const HABIT_OPTIONS = [
  'Non-smoker',
  'Non-drinker',
  'Social drinker',
  'Fitness Enthusiast',
  'Pet Friendly',
  'Family-oriented',
  'Loves Traveling',
];

const HEIGHT_OPTIONS = [
  "4'10\"", "4'11\"", "5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"",
  "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"",
  "6'2\"", "6'3\"", "6'4\""
];

export function PreferenceModalEditor({
  sectionId,
  isOpen,
  preferences,
  onClose,
  onSave,
}: PreferenceModalEditorProps) {
  const [draft, setDraft] = useState<PartnerPreferences>(preferences);

  // Sync draft when opened
  useEffect(() => {
    setDraft(preferences);
  }, [preferences, sectionId, isOpen]);

  if (!sectionId || !isOpen) return null;

  const handleApply = () => {
    onSave(draft);
    onClose();
  };

  const toggleArrayItem = <K extends keyof PartnerPreferences>(key: K, item: string) => {
    const list = (draft[key] as unknown as string[]) || [];
    if (list.includes(item)) {
      setDraft({
        ...draft,
        [key]: list.filter((i) => i !== item),
      });
    } else {
      setDraft({
        ...draft,
        [key]: [...list, item],
      });
    }
  };

  // Section configs
  const titles: Record<PreferenceEditSectionId, { title: string; desc: string }> = {
    age_height: {
      title: 'Age & Height Range',
      desc: 'Set the ideal age bracket and physical height preferences for your partner.',
    },
    location: {
      title: 'Location & Relocation',
      desc: 'Specify regions or cities where you would like your prospective partner to be located.',
    },
    religion_community: {
      title: 'Religion & Community',
      desc: 'Indicate your community preferences and horoscope matching requirements.',
    },
    education_profession: {
      title: 'Education, Career & Income',
      desc: 'Select preferred educational backgrounds, industry sectors, and expected income.',
    },
    marital_intent: {
      title: 'Marital Status & Marriage Intent',
      desc: 'Clarify expectations around marital history and timeline towards marriage.',
    },
    lifestyle_diet: {
      title: 'Diet & Lifestyle Habits',
      desc: 'Dietary preferences, wellness habits, and daily lifestyle compatibility.',
    },
    personal_notes: {
      title: 'Personal Partner Note',
      desc: 'A thoughtful note describing who you are looking to build a life with.',
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titles[sectionId].title}
      description={titles[sectionId].desc}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            className="rounded-xl text-xs font-semibold text-[#766B6F]"
          >
            Cancel
          </Button>
          <Button
            size="md"
            onClick={handleApply}
            className="rounded-xl bg-[#7A1835] hover:bg-[#5C1027] text-white text-xs font-bold px-6 shadow-sm active-press"
          >
            Apply Changes
          </Button>
        </div>
      }
    >
      <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
        {/* 1. AGE & HEIGHT */}
        {sectionId === 'age_height' && (
          <div className="space-y-5">
            {/* Age Range Slider Controls */}
            <div className="rounded-2xl bg-[#FFF9F6] p-4 sm:p-5 border border-[#E9DDE0] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7A1835]">
                  Age Window
                </span>
                <span className="text-base font-editorial-title font-bold text-[#211B1E] bg-white px-3 py-1 rounded-xl border border-[#EAD8C7]">
                  {draft.minAge} – {draft.maxAge} years
                </span>
              </div>

              {/* IconAdjustments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="flex justify-between text-xs text-[#766B6F] mb-1.5 font-medium">
                    <span>Min Age: {draft.minAge} yrs</span>
                    <span>18</span>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={50}
                    value={draft.minAge}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setDraft({
                        ...draft,
                        minAge: Math.min(val, draft.maxAge),
                      });
                    }}
                    className="w-full accent-[#7A1835] cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[#766B6F] mb-1.5 font-medium">
                    <span>Max Age: {draft.maxAge} yrs</span>
                    <span>60</span>
                  </div>
                  <input
                    type="range"
                    min={21}
                    max={60}
                    value={draft.maxAge}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setDraft({
                        ...draft,
                        maxAge: Math.max(val, draft.minAge),
                      });
                    }}
                    className="w-full accent-[#7A1835] cursor-pointer"
                  />
                </div>
              </div>

              {/* Quick Age Presets */}
              <div className="pt-2">
                <span className="block text-[11px] font-semibold text-[#766B6F] mb-2">
                  Popular Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    [21, 26],
                    [24, 29],
                    [26, 32],
                    [28, 35],
                    [30, 40],
                  ].map(([min, max]) => (
                    <button
                      key={`${min}-${max}`}
                      type="button"
                      onClick={() => setDraft({ ...draft, minAge: min, maxAge: max })}
                      className={cn(
                        'text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all',
                        draft.minAge === min && draft.maxAge === max
                          ? 'bg-[#7A1835] text-white border-[#7A1835]'
                          : 'bg-white text-[#211B1E] border-[#E9DDE0] hover:bg-[#FAF3EC]'
                      )}
                    >
                      {min} – {max} yrs
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Height Selectors */}
            <div className="rounded-2xl bg-[#FFF9F6] p-4 sm:p-5 border border-[#E9DDE0] space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7A1835] block">
                Preferred Height
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <ModernSelect
                    label="Min Height"
                    value={draft.minHeight}
                    onChange={(val) => setDraft({ ...draft, minHeight: val })}
                    options={HEIGHT_OPTIONS.map((h) => ({ value: h, label: h }))}
                    size="sm"
                  />
                </div>

                <div>
                  <ModernSelect
                    label="Max Height"
                    value={draft.maxHeight}
                    onChange={(val) => setDraft({ ...draft, maxHeight: val })}
                    options={HEIGHT_OPTIONS.map((h) => ({ value: h, label: h }))}
                    size="sm"
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 2. LOCATION & RELOCATION */}
        {sectionId === 'location' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#766B6F] mb-1.5">
                Preferred Locations (Multi-select)
              </label>
              <div className="flex flex-wrap gap-2">
                {LOCATION_OPTIONS.map((loc) => {
                  const isSelected = draft.locations.includes(loc);
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => toggleArrayItem('locations', loc)}
                      className={cn(
                        'text-xs font-semibold px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all',
                        isSelected
                          ? 'bg-[#7A1835] text-white border-[#7A1835] shadow-2xs'
                          : 'bg-white text-[#211B1E] border-[#E9DDE0] hover:bg-[#FAF3EC]'
                      )}
                    >
                      {isSelected && <IconCheck className="h-3 w-3" />}
                      <span>{loc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Relocation Toggle */}
            <div className="flex items-center justify-between rounded-2xl bg-[#FFF9F6] p-4 border border-[#E9DDE0]">
              <div className="pr-4">
                <span className="font-bold text-xs text-[#211B1E] block">
                  Open to Relocation
                </span>
                <span className="text-[11px] text-[#766B6F] leading-relaxed">
                  Include profiles who are open to moving or where you would be willing to relocate.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDraft({ ...draft, openToRelocate: !draft.openToRelocate })
                }
                className={cn(
                  'h-6 w-11 rounded-full p-0.5 transition-colors shrink-0',
                  draft.openToRelocate ? 'bg-[#7A1835]' : 'bg-[#E9DDE0]'
                )}
              >
                <div
                  className={cn(
                    'h-5 w-5 rounded-full bg-white transition-transform shadow-xs',
                    draft.openToRelocate ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          </div>
        )}

        {/* 3. RELIGION & COMMUNITY */}
        {sectionId === 'religion_community' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#766B6F] mb-1.5">
                Religion / Community Preference
              </label>
              <div className="flex flex-wrap gap-2">
                {RELIGION_OPTIONS.map((rel) => {
                  const isSelected = draft.religions.includes(rel);
                  return (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => toggleArrayItem('religions', rel)}
                      className={cn(
                        'text-xs font-semibold px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all',
                        isSelected
                          ? 'bg-[#7A1835] text-white border-[#7A1835] shadow-2xs'
                          : 'bg-white text-[#211B1E] border-[#E9DDE0] hover:bg-[#FAF3EC]'
                      )}
                    >
                      {isSelected && <IconCheck className="h-3 w-3" />}
                      <span>{rel}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#766B6F] mb-1.5">
                Caste / Denomination
              </label>
              <input
                type="text"
                value={draft.caste}
                onChange={(e) => setDraft({ ...draft, caste: e.target.value })}
                placeholder="e.g. Open to all or specify"
                className="w-full rounded-xl bg-white border border-[#E9DDE0] p-2.5 text-xs text-[#211B1E] outline-none focus:border-[#7A1835]"
              />
            </div>

            {/* Horoscope Toggle */}
            <div className="flex items-center justify-between rounded-2xl bg-[#FFF9F6] p-4 border border-[#E9DDE0]">
              <div className="pr-4">
                <span className="font-bold text-xs text-[#211B1E] block">
                  Horoscope Matching Preferred
                </span>
                <span className="text-[11px] text-[#766B6F]">
                  Prioritize profiles with matching astrological compatibility (kundali / porutham).
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDraft({ ...draft, horoscopeMatch: !draft.horoscopeMatch })
                }
                className={cn(
                  'h-6 w-11 rounded-full p-0.5 transition-colors shrink-0',
                  draft.horoscopeMatch ? 'bg-[#7A1835]' : 'bg-[#E9DDE0]'
                )}
              >
                <div
                  className={cn(
                    'h-5 w-5 rounded-full bg-white transition-transform shadow-xs',
                    draft.horoscopeMatch ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>
          </div>
        )}

        {/* 4. EDUCATION & PROFESSION */}
        {sectionId === 'education_profession' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#766B6F] mb-1.5">
                Education Level
              </label>
              <div className="flex flex-wrap gap-2">
                {EDUCATION_OPTIONS.map((edu) => {
                  const isSelected = draft.education.includes(edu);
                  return (
                    <button
                      key={edu}
                      type="button"
                      onClick={() => toggleArrayItem('education', edu)}
                      className={cn(
                        'text-xs font-semibold px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all',
                        isSelected
                          ? 'bg-[#7A1835] text-white border-[#7A1835]'
                          : 'bg-white text-[#211B1E] border-[#E9DDE0] hover:bg-[#FAF3EC]'
                      )}
                    >
                      {isSelected && <IconCheck className="h-3 w-3" />}
                      <span>{edu}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#766B6F] mb-1.5">
                Profession / Industry
              </label>
              <div className="flex flex-wrap gap-2">
                {PROFESSION_OPTIONS.map((prof) => {
                  const isSelected = draft.professions.includes(prof);
                  return (
                    <button
                      key={prof}
                      type="button"
                      onClick={() => toggleArrayItem('professions', prof)}
                      className={cn(
                        'text-xs font-semibold px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all',
                        isSelected
                          ? 'bg-[#7A1835] text-white border-[#7A1835]'
                          : 'bg-white text-[#211B1E] border-[#E9DDE0] hover:bg-[#FAF3EC]'
                      )}
                    >
                      {isSelected && <IconCheck className="h-3 w-3" />}
                      <span>{prof}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#766B6F] mb-1.5">
                Minimum Annual Income
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {INCOME_OPTIONS.map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => setDraft({ ...draft, minIncome: inc })}
                    className={cn(
                      'text-xs font-semibold p-2.5 rounded-xl border text-center transition-all',
                      draft.minIncome === inc
                        ? 'bg-[#7A1835] text-white border-[#7A1835]'
                        : 'bg-white text-[#211B1E] border-[#E9DDE0] hover:bg-[#FAF3EC]'
                    )}
                  >
                    {inc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. MARITAL STATUS & INTENT */}
        {sectionId === 'marital_intent' && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#766B6F] mb-1.5">
                Marital Status
              </label>
              <div className="flex flex-wrap gap-2">
                {MARITAL_STATUS_OPTIONS.map((m) => {
                  const isSelected = draft.maritalStatus.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleArrayItem('maritalStatus', m)}
                      className={cn(
                        'text-xs font-semibold px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all',
                        isSelected
                          ? 'bg-[#7A1835] text-white border-[#7A1835]'
                          : 'bg-white text-[#211B1E] border-[#E9DDE0] hover:bg-[#FAF3EC]'
                      )}
                    >
                      {isSelected && <IconCheck className="h-3 w-3" />}
                      <span>{m}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#766B6F] mb-2.5">
                Partner Marriage Intent
              </label>
              <div className="space-y-2">
                {INTENT_OPTIONS.map((intent) => (
                  <button
                    key={intent}
                    type="button"
                    onClick={() => setDraft({ ...draft, partnerIntent: intent })}
                    className={cn(
                      'w-full text-left p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all',
                      draft.partnerIntent === intent
                        ? 'bg-[#FAF3EC] border-[#7A1835] text-[#7A1835]'
                        : 'bg-white border-[#E9DDE0] text-[#211B1E] hover:bg-[#FFF9F6]'
                    )}
                  >
                    <span>{intent}</span>
                    {draft.partnerIntent === intent && (
                      <IconCheck className="h-4 w-4 text-[#7A1835]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. LIFESTYLE & DIET */}
        {sectionId === 'lifestyle_diet' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#766B6F] mb-2.5">
                Dietary Preference
              </label>
              <div className="flex flex-wrap gap-2">
                {DIET_OPTIONS.map((d) => {
                  const isSelected = draft.diet.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleArrayItem('diet', d)}
                      className={cn(
                        'text-xs font-semibold px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all',
                        isSelected
                          ? 'bg-[#7A1835] text-white border-[#7A1835]'
                          : 'bg-white text-[#211B1E] border-[#E9DDE0] hover:bg-[#FAF3EC]'
                      )}
                    >
                      {isSelected && <IconCheck className="h-3 w-3" />}
                      <span>{d}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#766B6F] mb-2.5">
                Lifestyle Habits & Values
              </label>
              <div className="flex flex-wrap gap-2">
                {HABIT_OPTIONS.map((h) => {
                  const isSelected = draft.lifestyleHabits.includes(h);
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => toggleArrayItem('lifestyleHabits', h)}
                      className={cn(
                        'text-xs font-semibold px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all',
                        isSelected
                          ? 'bg-[#7A1835] text-white border-[#7A1835]'
                          : 'bg-white text-[#211B1E] border-[#E9DDE0] hover:bg-[#FAF3EC]'
                      )}
                    >
                      {isSelected && <IconCheck className="h-3 w-3" />}
                      <span>{h}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 7. PERSONAL NOTE */}
        {sectionId === 'personal_notes' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#766B6F]">
              What You Value Most in a Partner
            </label>
            <textarea
              rows={4}
              value={draft.aboutPartner}
              onChange={(e) => setDraft({ ...draft, aboutPartner: e.target.value })}
              placeholder="Describe personal qualities, shared family values, communication style, or future life visions..."
              className="w-full rounded-2xl bg-white border border-[#E9DDE0] p-3.5 text-xs sm:text-sm text-[#211B1E] placeholder:text-[#766B6F]/70 outline-none focus:border-[#7A1835] focus:ring-2 focus:ring-[#7A1835]/10 leading-relaxed"
            />
            <p className="text-[11px] text-[#766B6F]">
              This short description is shown on your profile's partner expectations card so potential
              matches can understand what truly matters to you.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
