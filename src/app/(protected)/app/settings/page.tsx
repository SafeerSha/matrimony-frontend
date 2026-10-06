'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  IconUser,
  IconShieldCheck,
  IconLock,
  IconBell,
  IconKey,
  IconMessageCircle,
  IconEye,
  IconEyeOff,
  IconPhone,
  IconMapPin,
  IconBan,
  IconChevronRight,
  IconCreditCard,
  IconTrash,
  IconDeviceMobile,
  IconDeviceLaptop,
  IconCircleCheck,
  IconAlertCircle,
  IconHelpCircle,
  IconLogout,
  IconAdjustments,
  IconExternalLink,
  IconSettings,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/section-header';
import { ChangePasswordModal } from '@/components/settings/change-password-modal';
import { BlockedUsersModal } from '@/components/settings/blocked-users-modal';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';

export type SettingsSection = 'account' | 'profile' | 'privacy' | 'notifications' | 'security';

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as SettingsSection) || 'account';

  const [activeTab, setActiveTab] = useState<SettingsSection>(initialTab);

  // Modals
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);

  // Privacy Toggles
  const [profileDiscoverable, setProfileDiscoverable] = useState(true);
  const [contactVisibility, setContactVisibility] = useState(true); // only after mutual interest
  const [phonePrivacy, setPhonePrivacy] = useState(true); // hide phone until approved
  const [addressPrivacy, setAddressPrivacy] = useState(true); // show city only
  const [whoCanContact, setWhoCanContact] = useState<'verified' | 'all'>('verified');

  // Notification Toggles
  const [notifyInterests, setNotifyInterests] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyMatches, setNotifyMatches] = useState(true);
  const [notifyMarketing, setNotifyMarketing] = useState(false);

  // Security State
  const [sessions, setSessions] = useState([
    {
      id: 'sess-1',
      device: 'Chrome on Windows 11',
      location: 'Kochi, Kerala (Current Device)',
      isCurrent: true,
      time: 'Active now',
      icon: IconDeviceLaptop,
    },
    {
      id: 'sess-2',
      device: 'Let’s CHAT iOS Mobile App',
      location: 'iPhone 15 Pro • Kochi',
      isCurrent: false,
      time: '2 hours ago',
      icon: IconDeviceMobile,
    },
  ]);

  const handleTerminateOtherSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    toast.success('Sessions Terminated', {
      description: 'All other active sessions have been logged out.',
    });
  };

  const navItems: { key: SettingsSection; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    {
      key: 'account',
      label: 'Account',
      icon: IconUser,
      desc: 'Email, membership & account status',
    },
    {
      key: 'profile',
      label: 'Profile Settings',
      icon: IconEye,
      desc: 'Visibility & display preferences',
    },
    {
      key: 'privacy',
      label: 'Privacy',
      icon: IconShieldCheck,
      desc: 'Contact masking, phone & block list',
    },
    {
      key: 'notifications',
      label: 'Notifications',
      icon: IconBell,
      desc: 'Alerts, messages & email digests',
    },
    {
      key: 'security',
      label: 'Security',
      icon: IconLock,
      desc: 'Password, sessions & trust verification',
    },
  ];

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-clip space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionHeader
            eyebrow="Preferences & Safety"
            title="Settings & Privacy"
            description="Manage your matrimonial profile preferences, contact visibility, privacy shields and login security."
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Link href="/app/preferences">
            <Button
              variant="secondary"
              size="md"
              className="rounded-2xl border-[#E9DDE0] text-xs font-bold gap-1.5"
              leftIcon={<IconAdjustments className="h-3.5 w-3.5 text-[#7A1835]" />}
            >
              <span>Partner Preferences</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* MOBILE HORIZONTAL TABS (Scrollable rail for 360px-430px screens) */}
      <div className="w-full max-w-full min-w-0 flex lg:hidden gap-2 overflow-x-auto py-1.5 pb-2 scrollbar-none border-b border-[#E9DDE0]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition-all shrink-0 select-none active-press',
                isActive
                  ? 'bg-[#7A1835] text-white shadow-xs'
                  : 'bg-white text-[#766B6F] border border-[#E9DDE0] hover:bg-[#FAF3EC] hover:text-[#211B1E]'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Layout: Left Navigation Rail (Desktop) + Right IconSettings Panel */}
      <div className="w-full max-w-full min-w-0 grid gap-6 lg:grid-cols-[280px_1fr] items-start">
        {/* LEFT SETTINGS NAVIGATION (Desktop only) */}
        <aside className="hidden lg:block space-y-1 rounded-3xl border border-[#E9DDE0] bg-white p-2.5 shadow-xs">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#7A1835]">
            Settings Menu
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={cn(
                  'w-full text-left flex items-center gap-3 rounded-2xl px-3.5 py-3 transition-all duration-200 select-none group',
                  isActive
                    ? 'bg-[#7A1835] text-white shadow-xs font-bold'
                    : 'text-[#211B1E] hover:bg-[#FAF3EC] hover:text-[#7A1835]'
                )}
              >
                <div
                  className={cn(
                    'grid h-8 w-8 place-items-center rounded-xl transition-colors',
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'bg-[#FFF9F6] text-[#7A1835] group-hover:bg-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold leading-tight">{item.label}</p>
                  <p
                    className={cn(
                      'text-[10px] truncate mt-0.5 leading-tight',
                      isActive ? 'text-white/80' : 'text-[#766B6F]'
                    )}
                  >
                    {item.desc}
                  </p>
                </div>
                <IconChevronRight
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 transition-transform',
                    isActive ? 'text-white translate-x-0.5' : 'text-[#766B6F]/60'
                  )}
                />
              </button>
            );
          })}
        </aside>

        {/* RIGHT CONTENT PANEL */}
        <main className="w-full max-w-full min-w-0 space-y-6">
          {/* ======================================================== */}
          {/* 1. ACCOUNT SECTION */}
          {/* ======================================================== */}
          {activeTab === 'account' && (
            <div className="w-full max-w-full min-w-0 space-y-5 animate-in fade-in duration-200">
              <Card padding="none" className="w-full max-w-full min-w-0 overflow-hidden">
                <div className="border-b border-[#E9DDE0] p-4 sm:p-5 bg-[#FFFDFB]">
                  <h3 className="font-editorial-title text-base font-bold text-[#211B1E]">
                    Account & Membership
                  </h3>
                  <p className="text-xs text-[#766B6F] mt-0.5">
                    Your login identifier and subscription plan.
                  </p>
                </div>

                <div className="divide-y divide-[#E9DDE0]">
                  {/* Row: Email */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FAF3EC] text-[#7A1835]">
                        <IconUser className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#211B1E]">Registered Email</h4>
                        <p className="text-[11px] text-[#766B6F] mt-0.5">
                          Used for logging in and critical account alerts
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#211B1E] bg-[#FFF9F6] border border-[#E9DDE0] px-3 py-1.5 rounded-xl self-start sm:self-auto shrink-0 break-all max-w-full">
                      pksaf@example.com
                    </span>
                  </div>

                  {/* Row: Matrimony ID */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FAF3EC] text-[#7A1835]">
                        <IconShieldCheck className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#211B1E]">Matrimony Profile ID</h4>
                        <p className="text-[11px] text-[#766B6F] mt-0.5">
                          Unique verified identifier for support and relationship managers
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-xs tracking-wider text-[#7A1835] bg-[#FAF3EC] border border-[#EAD8C7] px-3 py-1.5 rounded-xl self-start sm:self-auto shrink-0">
                      LT-A0001
                    </span>
                  </div>

                  {/* Row: Membership Plan */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FAF3EC] text-[#7A1835]">
                        <IconCreditCard className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-[#211B1E]">Premium Plan</h4>
                          <Badge tone="accent" className="text-[10px]">
                            Active Premium
                          </Badge>
                        </div>
                        <p className="text-[11px] text-[#766B6F] mt-0.5">
                          Unlimited direct messaging and verified contact access
                        </p>
                      </div>
                    </div>
                    <Link href="/app/subscription" className="self-start sm:self-auto shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-xl border-[#E9DDE0] text-xs font-bold"
                      >
                        Manage Plan
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Danger Zone */}
              <Card className="w-full max-w-full min-w-0 rounded-3xl border border-red-200 bg-red-50/40 p-4 sm:p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-100 text-red-700 mt-0.5 sm:mt-0">
                      <IconTrash className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-red-900">Deactivate or Delete Account</h4>
                      <p className="text-[11px] text-red-700 leading-relaxed mt-0.5 max-w-md">
                        Temporarily hide your profile from all discovery searches or permanently delete
                        your account and connection history.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (confirm('Are you sure you want to deactivate your matrimonial account?')) {
                        toast.warning('Account Deactivated', {
                          description: 'Your profile has been hidden from recommendations.',
                        });
                      }
                    }}
                    className="rounded-xl text-xs font-bold shrink-0 self-start sm:self-auto"
                  >
                    Deactivate Account
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. PROFILE SETTINGS */}
          {/* ======================================================== */}
          {activeTab === 'profile' && (
            <div className="w-full max-w-full min-w-0 space-y-5 animate-in fade-in duration-200">
              <Card padding="none" className="w-full max-w-full min-w-0 overflow-hidden">
                <div className="border-b border-[#E9DDE0] p-4 sm:p-5 bg-[#FFFDFB]">
                  <h3 className="font-editorial-title text-base font-bold text-[#211B1E]">
                    Profile Preferences & Visibility
                  </h3>
                  <p className="text-xs text-[#766B6F] mt-0.5">
                    Control how your profile appears to potential matrimonial matches.
                  </p>
                </div>

                <div className="divide-y divide-[#E9DDE0]">
                  {/* Row: Profile Discoverability */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FAF3EC] text-[#7A1835]">
                        <IconEye className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#211B1E]">
                          Profile Discoverability
                        </h4>
                        <p className="text-[11px] text-[#766B6F] mt-0.5">
                          Allow your profile to appear in daily recommendations and Featured Discover
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfileDiscoverable(!profileDiscoverable)}
                      className={cn(
                        'h-6 w-11 rounded-full p-0.5 transition-colors shrink-0 ml-2',
                        profileDiscoverable ? 'bg-[#7A1835]' : 'bg-[#E9DDE0]'
                      )}
                    >
                      <div
                        className={cn(
                          'h-5 w-5 rounded-full bg-white transition-transform shadow-xs',
                          profileDiscoverable ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>

                  {/* Row: Horoscope Details */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FAF3EC] text-[#7A1835]">
                        <IconSettings className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#211B1E]">
                          Horoscope / Porutham Visibility
                        </h4>
                        <p className="text-[11px] text-[#766B6F] mt-0.5">
                          Display birth star and astrological chart details to mutual matches
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#7A1835] bg-[#FAF3EC] px-3 py-1 rounded-xl border border-[#EAD8C7] self-start sm:self-auto shrink-0">
                      Mutual Matches Only
                    </span>
                  </div>

                  {/* Row: Edit Bio & Photos */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FAF3EC] text-[#7A1835]">
                        <IconUser className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#211B1E]">
                          Edit Bio, Lifestyle & Photos
                        </h4>
                        <p className="text-[11px] text-[#766B6F] mt-0.5">
                          Update your photo gallery, education, and family background
                        </p>
                      </div>
                    </div>
                    <Link href="/app/profile" className="self-start sm:self-auto shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-xl border-[#E9DDE0] text-xs font-bold gap-1"
                      >
                        <span>Edit Profile</span>
                        <IconChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. PRIVACY SECTION */}
          {/* ======================================================== */}
          {activeTab === 'privacy' && (
            <div className="w-full max-w-full min-w-0 space-y-5 animate-in fade-in duration-200">
              <Card padding="none" className="w-full max-w-full min-w-0 overflow-hidden">
                <div className="border-b border-[#E9DDE0] p-4 sm:p-5 bg-[#FFFDFB]">
                  <h3 className="font-editorial-title text-base font-bold text-[#211B1E]">
                    Privacy Shields & Contact Security
                  </h3>
                  <p className="text-xs text-[#766B6F] mt-0.5">
                    Customize who can view your private contact numbers, address, and initiate communication.
                  </p>
                </div>

                <div className="divide-y divide-[#E9DDE0]">
                  {/* Contact Visibility */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FAF3EC] text-[#7A1835]">
                        <IconShieldCheck className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#211B1E]">
                          Contact Visibility
                        </h4>
                        <p className="text-[11px] text-[#766B6F] mt-0.5">
                          Only reveal contact details to members whose interest you have mutually accepted
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setContactVisibility(!contactVisibility)}
                      className={cn(
                        'h-6 w-11 rounded-full p-0.5 transition-colors shrink-0 ml-2',
                        contactVisibility ? 'bg-[#7A1835]' : 'bg-[#E9DDE0]'
                      )}
                    >
                      <div
                        className={cn(
                          'h-5 w-5 rounded-full bg-white transition-transform shadow-xs',
                          contactVisibility ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>

                  {/* Phone Number Privacy */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FAF3EC] text-[#7A1835]">
                        <IconPhone className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#211B1E]">
                          Phone Number Shield
                        </h4>
                        <p className="text-[11px] text-[#766B6F] mt-0.5">
                          Require explicit per-request permission before sharing your mobile number
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhonePrivacy(!phonePrivacy)}
                      className={cn(
                        'h-6 w-11 rounded-full p-0.5 transition-colors shrink-0 ml-2',
                        phonePrivacy ? 'bg-[#7A1835]' : 'bg-[#E9DDE0]'
                      )}
                    >
                      <div
                        className={cn(
                          'h-5 w-5 rounded-full bg-white transition-transform shadow-xs',
                          phonePrivacy ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>

                  {/* Address Privacy */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FAF3EC] text-[#7A1835]">
                        <IconMapPin className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#211B1E]">
                          Home Address Privacy
                        </h4>
                        <p className="text-[11px] text-[#766B6F] mt-0.5">
                          Display district/city only and protect precise residential street address
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAddressPrivacy(!addressPrivacy)}
                      className={cn(
                        'h-6 w-11 rounded-full p-0.5 transition-colors shrink-0 ml-2',
                        addressPrivacy ? 'bg-[#7A1835]' : 'bg-[#E9DDE0]'
                      )}
                    >
                      <div
                        className={cn(
                          'h-5 w-5 rounded-full bg-white transition-transform shadow-xs',
                          addressPrivacy ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>

                  {/* Who Can Contact Me */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FAF3EC] text-[#7A1835]">
                        <IconUser className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#211B1E]">Who Can Contact Me</h4>
                        <p className="text-[11px] text-[#766B6F] mt-0.5">
                          Limit connection requests to verified profiles matching partner criteria
                        </p>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto min-w-0">
                      <select
                        value={whoCanContact}
                        onChange={(e) => setWhoCanContact(e.target.value as any)}
                        className="w-full sm:w-auto max-w-full rounded-xl bg-[#FFF9F6] border border-[#E9DDE0] px-3 py-2 text-xs font-semibold text-[#211B1E] outline-none focus:border-[#7A1835]"
                      >
                        <option value="verified">Verified Matches Only (Recommended)</option>
                        <option value="all">All Registered Members</option>
                      </select>
                    </div>
                  </div>

                  {/* Blocked Profiles */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FAF3EC] text-[#7A1835]">
                        <IconBan className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#211B1E]">Blocked Profiles</h4>
                        <p className="text-[11px] text-[#766B6F] mt-0.5">
                          Manage members whom you have blocked from viewing or messaging you
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsBlockedModalOpen(true)}
                      className="rounded-xl border-[#E9DDE0] text-xs font-bold self-start sm:self-auto shrink-0"
                    >
                      <span>Manage (2)</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. NOTIFICATIONS SETTINGS */}
          {/* ======================================================== */}
          {activeTab === 'notifications' && (
            <div className="w-full max-w-full min-w-0 space-y-5 animate-in fade-in duration-200">
              <Card padding="none" className="w-full max-w-full min-w-0 overflow-hidden">
                <div className="border-b border-[#E9DDE0] p-4 sm:p-5 bg-[#FFFDFB]">
                  <h3 className="font-editorial-title text-base font-bold text-[#211B1E]">
                    Notification Preferences
                  </h3>
                  <p className="text-xs text-[#766B6F] mt-0.5">
                    Choose which notifications you wish to receive across email and in-app alerts.
                  </p>
                </div>

                <div className="divide-y divide-[#E9DDE0]">
                  {/* New Interest Alerts */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FAF3EC] text-[#7A1835]">
                        <IconBell className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#211B1E]">Interest Alerts</h4>
                        <p className="text-[11px] text-[#766B6F] mt-0.5">
                          Receive instant alerts when someone expresses interest in your profile
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifyInterests(!notifyInterests)}
                      className={cn(
                        'h-6 w-11 rounded-full p-0.5 transition-colors shrink-0 ml-2',
                        notifyInterests ? 'bg-[#7A1835]' : 'bg-[#E9DDE0]'
                      )}
                    >
                      <div
                        className={cn(
                          'h-5 w-5 rounded-full bg-white transition-transform shadow-xs',
                          notifyInterests ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>

                  {/* Direct Messages */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FAF3EC] text-[#7A1835]">
                        <IconMessageCircle className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#211B1E]">Chat & Message Alerts</h4>
                        <p className="text-[11px] text-[#766B6F] mt-0.5">
                          Push notifications when a mutual connection sends you a message
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifyMessages(!notifyMessages)}
                      className={cn(
                        'h-6 w-11 rounded-full p-0.5 transition-colors shrink-0 ml-2',
                        notifyMessages ? 'bg-[#7A1835]' : 'bg-[#E9DDE0]'
                      )}
                    >
                      <div
                        className={cn(
                          'h-5 w-5 rounded-full bg-white transition-transform shadow-xs',
                          notifyMessages ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>

                  {/* Weekly Match Suggestions */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FAF3EC] text-[#7A1835]">
                        <IconSettings className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#211B1E]">Recommended Match Digest</h4>
                        <p className="text-[11px] text-[#766B6F] mt-0.5">
                          A curated weekly summary of verified profiles matching your partner preferences
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifyMatches(!notifyMatches)}
                      className={cn(
                        'h-6 w-11 rounded-full p-0.5 transition-colors shrink-0 ml-2',
                        notifyMatches ? 'bg-[#7A1835]' : 'bg-[#E9DDE0]'
                      )}
                    >
                      <div
                        className={cn(
                          'h-5 w-5 rounded-full bg-white transition-transform shadow-xs',
                          notifyMatches ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>

                  {/* Marketing & Special Promotions */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FAF3EC] text-[#7A1835]">
                        <IconCreditCard className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#211B1E]">Membership Offers & News</h4>
                        <p className="text-[11px] text-[#766B6F] mt-0.5">
                          Occasional updates about subscription discounts and relationship manager services
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifyMarketing(!notifyMarketing)}
                      className={cn(
                        'h-6 w-11 rounded-full p-0.5 transition-colors shrink-0 ml-2',
                        notifyMarketing ? 'bg-[#7A1835]' : 'bg-[#E9DDE0]'
                      )}
                    >
                      <div
                        className={cn(
                          'h-5 w-5 rounded-full bg-white transition-transform shadow-xs',
                          notifyMarketing ? 'translate-x-5' : 'translate-x-0'
                        )}
                      />
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. SECURITY SECTION */}
          {/* ======================================================== */}
          {activeTab === 'security' && (
            <div className="w-full max-w-full min-w-0 space-y-5 animate-in fade-in duration-200">
              {/* Account Verification Badges Card */}
              <Card className="w-full max-w-full min-w-0 rounded-3xl border border-[#E9DDE0] bg-white p-4 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E9DDE0]">
                  <div>
                    <h3 className="font-editorial-title text-base font-bold text-[#211B1E]">
                      Account Trust & Verification
                    </h3>
                    <p className="text-xs text-[#766B6F] mt-0.5">
                      Badges earn higher trust and boost response rates from prospective matches.
                    </p>
                  </div>
                  <span className="self-start sm:self-auto shrink-0 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <IconCircleCheck className="h-3.5 w-3.5" /> 100% Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-[#FFF9F6] p-3.5 border border-[#E9DDE0] flex items-center gap-3 min-w-0">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                      <IconShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-[#211B1E] block truncate">
                        Govt. ID
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <IconCircleCheck className="h-3 w-3" /> Verified
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#FFF9F6] p-3.5 border border-[#E9DDE0] flex items-center gap-3 min-w-0">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                      <IconPhone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-[#211B1E] block truncate">
                        Mobile OTP
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <IconCircleCheck className="h-3 w-3" /> Verified
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#FFF9F6] p-3.5 border border-[#E9DDE0] flex items-center gap-3 min-w-0">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                      <IconShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-[#211B1E] block truncate">
                        Photo Selfie
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <IconCircleCheck className="h-3 w-3" /> Verified
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Password Management */}
              <Card className="w-full max-w-full min-w-0 rounded-3xl border border-[#E9DDE0] bg-white p-4 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FAF3EC] text-[#7A1835]">
                      <IconKey className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#211B1E]">Account Password</h4>
                      <p className="text-[11px] text-[#766B6F] mt-0.5">
                        Last changed 3 weeks ago • Strong security
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="rounded-xl border-[#7A1835] text-[#7A1835] hover:bg-[#FAF3EC] text-xs font-bold self-start sm:self-auto shrink-0"
                  >
                    Change Password
                  </Button>
                </div>
              </Card>

              {/* Active Login Sessions */}
              <Card className="w-full max-w-full min-w-0 rounded-3xl border border-[#E9DDE0] bg-white p-4 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E9DDE0]">
                  <div>
                    <h3 className="font-editorial-title text-base font-bold text-[#211B1E]">
                      Active Login Devices
                    </h3>
                    <p className="text-xs text-[#766B6F] mt-0.5">
                      Devices currently authorized and connected to your account.
                    </p>
                  </div>
                  {sessions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleTerminateOtherSessions}
                      className="text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl self-start sm:self-auto"
                    >
                      Log out other devices
                    </Button>
                  )}
                </div>

                <div className="divide-y divide-[#E9DDE0]/70">
                  {sessions.map((sess) => {
                    const DeviceIcon = sess.icon;
                    return (
                      <div
                        key={sess.id}
                        className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#FFF9F6] border border-[#E9DDE0] text-[#7A1835]">
                            <DeviceIcon className="h-4.5 w-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#211B1E] truncate">
                                {sess.device}
                              </span>
                              {sess.isCurrent && (
                                <Badge tone="success" className="text-[9px] py-0 px-1.5 shrink-0">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <p className="text-[10px] text-[#766B6F] truncate">{sess.location}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold text-[#766B6F] shrink-0">
                          {sess.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* BLOCKED USERS MODAL */}
      <BlockedUsersModal
        isOpen={isBlockedModalOpen}
        onClose={() => setIsBlockedModalOpen(false)}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-24 flex flex-col items-center justify-center text-[#766B6F] gap-2">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#7A1835] border-t-transparent" />
          <span className="text-xs font-semibold">Loading settings...</span>
        </div>
      }
    >
      <SettingsContent />
    </React.Suspense>
  );
}
