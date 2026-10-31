'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  IconLoader2,
  IconEdit,
  IconArrowLeft,
  IconRefresh,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { SectionHeader } from '@/components/ui/section-header';
import { ModernSelect } from '@/components/ui/modern-select';
import { ModernOtpInput } from '@/components/ui';
import { ChangePasswordModal } from '@/components/settings/change-password-modal';
import { BlockedUsersModal } from '@/components/settings/blocked-users-modal';
import { FeatureGate } from '@/components/ui/under-development';
import { authService, UserDevice } from '@/services/auth.service';
import { profileService } from '@/services/profile.service';
import { IconMail } from '@tabler/icons-react';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';

export type SettingsSection = 'account' | 'profile' | 'privacy' | 'notifications' | 'security';

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as SettingsSection) || 'account';

  const [activeTab, setActiveTab] = useState<SettingsSection>(initialTab);

  // Modals
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordModalMode, setPasswordModalMode] = useState<'enable' | 'change'>('change');
  const [isDisableConfirmOpen, setIsDisableConfirmOpen] = useState(false);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);

  // Account Lifecycle (Deactivate / Delete)
  const [accountActionModal, setAccountActionModal] = useState(false);
  const [accountActionType, setAccountActionType] = useState<'deactivate' | 'delete'>('deactivate');
  const [accountActionReason, setAccountActionReason] = useState('Taking a temporary break');
  const [accountActionFeedback, setAccountActionFeedback] = useState('');
  const [accountActionLoading, setAccountActionLoading] = useState(false);

  const handleAccountActionSubmit = async () => {
    setAccountActionLoading(true);
    try {
      if (accountActionType === 'deactivate') {
        await profileService.deactivateAccount(accountActionReason);
        toast.info('Account Deactivated', {
          description: 'Your profile has been paused. Sign in anytime to reactivate.',
        });
      } else {
        await profileService.deleteAccount(accountActionReason, accountActionFeedback);
        toast.warning('Account Deleted', {
          description: 'Your profile has been scheduled for deletion.',
        });
      }
      setAccountActionModal(false);
      await authService.logout().catch(() => {});
      window.location.href = '/login';
    } catch (err: any) {
      const msg = err?.message || 'Could not complete account action.';
      toast.error('Action Failed', { description: msg });
    } finally {
      setAccountActionLoading(false);
    }
  };

  // User Account Details
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailModalStep, setEmailModalStep] = useState<'input' | 'otp'>('input');
  const [emailInput, setEmailInput] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailResendTimer, setEmailResendTimer] = useState(0);

  // Timer effect for OTP resend countdown
  useEffect(() => {
    if (emailResendTimer > 0) {
      const timer = setInterval(() => {
        setEmailResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [emailResendTimer]);

  const handleOpenEmailModal = () => {
    setEmailInput('');
    setEmailOtp('');
    setEmailModalStep('input');
    setEmailError(null);
    setEmailResendTimer(0);
    setIsEmailModalOpen(true);
  };

  const handleSendEmailOtp = async () => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setEmailError('Please enter a valid email address (e.g. name@gmail.com).');
      return;
    }
    const currentRegisteredEmail = (currentUser?.email || currentUser?.user?.email || '').trim().toLowerCase();
    if (currentRegisteredEmail && cleanEmail === currentRegisteredEmail) {
      setEmailError('New email must be different from your current registered email.');
      return;
    }

    setIsSendingEmailOtp(true);
    setEmailError(null);
    try {
      await authService.sendOtp({ email: cleanEmail, purpose: 'change_email' });
      setEmailModalStep('otp');
      setEmailResendTimer(60);
      toast.info('Verification Code Sent', {
        description: `We've sent a 6-digit verification code to ${cleanEmail}`,
      });
    } catch (err: any) {
      const msg = err?.message || 'Failed to send verification code. Please check the email address and try again.';
      setEmailError(msg);
      toast.error('Send Failed', {
        description: msg,
      });
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (emailResendTimer > 0 || isSendingEmailOtp) return;
    const cleanEmail = emailInput.trim().toLowerCase();
    setIsSendingEmailOtp(true);
    setEmailError(null);
    try {
      await authService.sendOtp({ email: cleanEmail, purpose: 'change_email' });
      setEmailResendTimer(60);
      toast.info('Code Resent', {
        description: `A new verification code was sent to ${cleanEmail}`,
      });
    } catch (err: any) {
      const msg = err?.message || 'Failed to resend verification code.';
      setEmailError(msg);
      toast.error('Resend Failed', {
        description: msg,
      });
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleVerifyAndUpdateEmail = async (codeToVerify?: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanOtp = (codeToVerify ?? emailOtp).trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setEmailError('Please enter the 6-digit verification code.');
      return;
    }

    setIsSavingEmail(true);
    setEmailError(null);
    try {
      await profileService.updateProfile('me', { email: cleanEmail, emailOtp: cleanOtp });
      setCurrentUser((prev: any) => ({
        ...prev,
        email: cleanEmail,
        isEmailVerified: true,
        user: { ...(prev?.user || {}), email: cleanEmail, isEmailVerified: true },
      }));
      toast.success('Email Updated', {
        description: `Your registered email has been successfully updated to ${cleanEmail}.`,
      });
      setIsEmailModalOpen(false);
    } catch (err: any) {
      const msg = err?.message || 'Invalid or expired verification code. Please check and try again.';
      setEmailError(msg);
      toast.error('Verification Failed', {
        description: msg,
      });
    } finally {
      setIsSavingEmail(false);
    }
  };

  // Password Security State
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(true);
  const [passwordLastChanged, setPasswordLastChanged] = useState('3 weeks ago');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedEnabled = localStorage.getItem('shaadi_password_enabled');
      if (storedEnabled !== null) {
        setIsPasswordEnabled(storedEnabled === 'true');
      }
      const storedLastChanged = localStorage.getItem('shaadi_password_last_changed');
      if (storedLastChanged) {
        setPasswordLastChanged(storedLastChanged);
      }
    }

    profileService.getProfile('me').then((res) => {
      if (res) {
        setCurrentUser(res);
        setEmailInput(res.email || (res as any)?.user?.email || '');
      }
    }).catch(() => {});
  }, []);

  const handleTogglePassword = () => {
    if (isPasswordEnabled) {
      setIsDisableConfirmOpen(true);
    } else {
      setPasswordModalMode('enable');
      setIsPasswordModalOpen(true);
    }
  };

  const handleConfirmDisablePassword = async () => {
    try {
      await authService.disablePassword();
      setIsPasswordEnabled(false);
      setIsDisableConfirmOpen(false);
      toast.success('Password Login Disabled', {
        description: 'You can now log in securely using Mobile OTP.',
      });
    } catch (err: any) {
      toast.error('Failed to disable password', {
        description: err?.message || 'Please try again later.',
      });
    }
  };

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

  // Active Devices State
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [isTerminatingDevices, setIsTerminatingDevices] = useState(false);
  const [terminatingDeviceId, setTerminatingDeviceId] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setIsLoadingDevices(true);
    try {
      const data = await authService.getDevices();
      setDevices(data);
    } catch (err: any) {
      console.warn("Could not fetch active devices:", err);
    } finally {
      setIsLoadingDevices(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'security') {
      fetchDevices();
    }
  }, [activeTab, fetchDevices]);

  const handleTerminateOtherSessions = async () => {
    setIsTerminatingDevices(true);
    try {
      await authService.terminateOtherDevices();
      setDevices((prev) => prev.filter((s) => s.isCurrent));
      toast.success('Sessions Terminated', {
        description: 'All other active sessions have been safely logged out.',
      });
    } catch (err: any) {
      toast.error('Termination Failed', {
        description: err?.message || 'Could not log out other devices. Please try again.',
      });
    } finally {
      setIsTerminatingDevices(false);
    }
  };

  const handleTerminateSingleDevice = async (deviceId: string) => {
    setTerminatingDeviceId(deviceId);
    try {
      await authService.terminateDevice(deviceId);
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
      toast.success('Device Logged Out', {
        description: 'Selected device session has been terminated.',
      });
    } catch (err: any) {
      toast.error('Termination Failed', {
        description: err?.message || 'Could not terminate device session.',
      });
    } finally {
      setTerminatingDeviceId(null);
    }
  };

  const formatDeviceActiveTime = (lastActiveAt?: string, isCurrent?: boolean) => {
    if (isCurrent) return 'Active now';
    if (!lastActiveAt) return 'Recently';
    try {
      const date = new Date(lastActiveAt);
      if (isNaN(date.getTime())) return 'Recently';
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Active just now';
      if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString();
    } catch {
      return 'Recently';
    }
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
                  {/* Row: Email (Dynamic & Editable) */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FAF3EC] text-[#7A1835]">
                        <IconMail className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-[#211B1E]">Registered Email (Gmail)</h4>
                        <p className="text-[11px] text-[#766B6F] mt-0.5">
                          Used for logging in, verification codes, and critical account alerts
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <span className="text-xs font-semibold text-[#211B1E] bg-[#FFF9F6] border border-[#E9DDE0] px-3 py-1.5 rounded-xl break-all max-w-[220px] truncate">
                        {currentUser?.email || (currentUser as any)?.user?.email || 'Loading...'}
                      </span>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={handleOpenEmailModal}
                        className="rounded-xl text-xs font-bold gap-1 shadow-2xs cursor-pointer"
                      >
                        <IconEdit className="h-3.5 w-3.5 text-[var(--primary)]" />
                        <span>Change</span>
                      </Button>
                    </div>
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
                      {currentUser?.profileId || (currentUser as any)?.user?.profileId || 'ISHTAM-ID'}
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
                    <div className="w-full sm:w-64 min-w-0">
                      <ModernSelect
                        value={whoCanContact}
                        onChange={(val) => setWhoCanContact(val as any)}
                        options={[
                          { value: "verified", label: "Verified Matches Only (Recommended)" },
                          { value: "all", label: "All Registered Members" },
                        ]}
                        size="sm"
                      />
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
              <Card className="w-full max-w-full min-w-0 rounded-3xl border border-[#E9DDE0] bg-white p-3.5 sm:p-6 shadow-xs space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-[#E9DDE0]">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-editorial-title text-sm sm:text-base font-bold text-[#211B1E] truncate">
                      Account Trust & Verification
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#766B6F] mt-0.5 line-clamp-1 sm:line-clamp-none">
                      Badges earn higher trust and boost response rates from prospective matches.
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                    <IconCircleCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> 100% Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="rounded-2xl bg-[#FFF9F6] p-2.5 sm:p-3.5 border border-[#E9DDE0] flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                      <IconPhone className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] sm:text-xs font-bold text-[#211B1E] block truncate">
                        Mobile OTP
                      </span>
                      <span className="text-[9.5px] sm:text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <IconCircleCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" /> Verified
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#FFF9F6] p-2.5 sm:p-3.5 border border-[#E9DDE0] flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                      <IconShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] sm:text-xs font-bold text-[#211B1E] block truncate">
                        Photo Selfie
                      </span>
                      <span className="text-[9.5px] sm:text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <IconCircleCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" /> Verified
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Password Management */}
              <Card className="w-full max-w-full min-w-0 rounded-3xl border border-[#E9DDE0] bg-white p-3.5 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                    <div
                      className={cn(
                        'grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-xl transition-colors',
                        isPasswordEnabled ? 'bg-[#FAF3EC] text-[#7A1835]' : 'bg-slate-100 text-[#766B6F]'
                      )}
                    >
                      <IconKey className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <h4 className="text-xs font-bold text-[#211B1E]">Account Password</h4>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-semibold transition-colors',
                            isPasswordEnabled
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          )}
                        >
                          {isPasswordEnabled ? (
                            <>
                              <IconCircleCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Enabled
                            </>
                          ) : (
                            'Disabled'
                          )}
                        </span>
                      </div>
                      <p className="text-[10.5px] sm:text-[11px] text-[#766B6F] mt-0.5">
                        {isPasswordEnabled
                          ? `Last changed ${passwordLastChanged} • Strong security`
                          : 'Password login is disabled • Sign in using Mobile OTP'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto pt-2.5 sm:pt-0 border-t border-[#E9DDE0]/60 sm:border-t-0 shrink-0">
                    {isPasswordEnabled ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setPasswordModalMode('change');
                          setIsPasswordModalOpen(true);
                        }}
                        className="rounded-xl border-[#7A1835] text-[#7A1835] hover:bg-[#FAF3EC] text-xs font-bold shrink-0 h-8 sm:h-9 px-3"
                      >
                        Change Password
                      </Button>
                    ) : (
                      <span className="text-[11px] text-[#766B6F] sm:hidden">
                        Enable password login
                      </span>
                    )}

                    {/* Enable / Disable Controller Switch */}
                    <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[#E9DDE0]">
                      <span className="text-[11px] font-semibold text-[#453A3E]">
                        {isPasswordEnabled ? 'Enabled' : 'Enable'}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isPasswordEnabled}
                        aria-label="Toggle password login"
                        onClick={handleTogglePassword}
                        className={cn(
                          'h-6 w-11 rounded-full p-0.5 transition-colors shrink-0 focus-ring',
                          isPasswordEnabled ? 'bg-[#7A1835]' : 'bg-[#E9DDE0]'
                        )}
                      >
                        <div
                          className={cn(
                            'h-5 w-5 rounded-full bg-white transition-transform shadow-xs',
                            isPasswordEnabled ? 'translate-x-5' : 'translate-x-0'
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Active Login Sessions */}
              <Card className="w-full max-w-full min-w-0 rounded-3xl border border-[#E9DDE0] bg-white p-3.5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E9DDE0]">
                  <div>
                    <h3 className="font-editorial-title text-base font-bold text-[#211B1E]">
                      Active Login Devices
                    </h3>
                    <p className="text-xs text-[#766B6F] mt-0.5">
                      Devices currently authorized and connected to your account.
                    </p>
                  </div>
                  {devices.filter((d) => !d.isCurrent).length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleTerminateOtherSessions}
                      disabled={isTerminatingDevices}
                      className="text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl self-start sm:self-auto h-8 px-3"
                    >
                      {isTerminatingDevices ? (
                        <>
                          <IconLoader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                          <span>Logging out...</span>
                        </>
                      ) : (
                        'Log out other devices'
                      )}
                    </Button>
                  )}
                </div>

                {isLoadingDevices ? (
                  <div className="py-6 flex flex-col items-center justify-center text-[#766B6F] gap-2">
                    <IconLoader2 className="h-5 w-5 animate-spin text-[#7A1835]" />
                    <span className="text-xs font-medium">Loading active devices...</span>
                  </div>
                ) : devices.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#766B6F]">
                    No active device sessions found.
                  </div>
                ) : (
                  <div className="divide-y divide-[#E9DDE0]/70">
                    {devices.map((device) => {
                      const isMobile =
                        device.deviceType === 'MOBILE' ||
                        device.os?.toLowerCase().includes('ios') ||
                        device.os?.toLowerCase().includes('android');
                      const DeviceIcon = isMobile ? IconDeviceMobile : IconDeviceLaptop;

                      return (
                        <div
                          key={device.id}
                          className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#FFF9F6] border border-[#E9DDE0] text-[#7A1835]">
                              <DeviceIcon className="h-4.5 w-4.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-[#211B1E] truncate">
                                  {device.deviceName}
                                </span>
                                {device.isCurrent && (
                                  <Badge tone="success" className="text-[9px] py-0 px-1.5 shrink-0">
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[10px] text-[#766B6F] truncate">
                                {device.location ||
                                  [device.browser, device.os].filter(Boolean).join(' • ') ||
                                  'Location unknown'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className="text-[10px] font-semibold text-[#766B6F]">
                              {formatDeviceActiveTime(device.lastActiveAt, device.isCurrent)}
                            </span>
                            {!device.isCurrent && (
                              <button
                                type="button"
                                onClick={() => handleTerminateSingleDevice(device.id)}
                                disabled={terminatingDeviceId === device.id}
                                title="Log out this device"
                                aria-label={`Log out ${device.deviceName}`}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors focus-ring"
                              >
                                {terminatingDeviceId === device.id ? (
                                  <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <IconLogout className="h-3.5 w-3.5" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          )}
        </main>
      </div>


      {/* ACCOUNT DEACTIVATE / DELETE LIFECYCLE MODAL */}
      <Modal
        isOpen={accountActionModal}
        onClose={() => !accountActionLoading && setAccountActionModal(false)}
        title={accountActionType === 'deactivate' ? 'Deactivate Your Profile' : 'Delete Your Account'}
        description={
          accountActionType === 'deactivate'
            ? 'Temporarily pause your profile visibility. You can return anytime.'
            : 'Permanently remove your account and matrimonial profile.'
        }
        size="md"
      >
        <div className="space-y-4 pt-1">
          {/* Action Type Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setAccountActionType('deactivate');
                setAccountActionReason('Taking a temporary break');
              }}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                accountActionType === 'deactivate'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pause Profile
            </button>
            <button
              type="button"
              onClick={() => {
                setAccountActionType('delete');
                setAccountActionReason('Found my match on IshtamChat');
              }}
              className={`py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                accountActionType === 'delete'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-red-600'
              }`}
            >
              Delete Account
            </button>
          </div>

          {accountActionType === 'deactivate' ? (
            <div className="rounded-2xl bg-amber-50/70 border border-amber-200/80 p-3 text-xs text-amber-900 leading-relaxed">
              <p className="font-semibold mb-1">What happens when you deactivate?</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-800">
                <li>Your profile is hidden from all discovery and search recommendations.</li>
                <li>Your chats, matches, and uploaded photos remain completely safe.</li>
                <li>You can reactivate your profile anytime simply by signing back in.</li>
              </ul>
            </div>
          ) : (
            <div className="rounded-2xl bg-red-50/70 border border-red-200/80 p-3 text-xs text-red-900 leading-relaxed">
              <p className="font-semibold mb-1">Important: Account Deletion Policy</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-red-800">
                <li>Your profile and conversations will be immediately deactivated.</li>
                <li>A 30-day grace period applies: contact support anytime to cancel.</li>
                <li>After 30 days, personal data and photos are permanently purged.</li>
              </ul>
            </div>
          )}

          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reason for {accountActionType === 'deactivate' ? 'deactivating' : 'leaving'}
            </label>
            <select
              value={accountActionReason}
              onChange={(e) => setAccountActionReason(e.target.value)}
              className="w-full h-10 px-3 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-[#80132E] font-medium"
            >
              {accountActionType === 'deactivate' ? (
                <>
                  <option value="Taking a temporary break">Taking a temporary break</option>
                  <option value="Dating someone exclusively">Dating someone exclusively</option>
                  <option value="Too busy with career/studies">Too busy with career / studies</option>
                  <option value="Privacy preference">Privacy preference</option>
                  <option value="Other reason">Other reason</option>
                </>
              ) : (
                <>
                  <option value="Found my match on IshtamChat">Found my match on IshtamChat! 💍</option>
                  <option value="Found partner outside platform">Found partner outside platform</option>
                  <option value="Did not find suitable matches">Did not find suitable matches</option>
                  <option value="Privacy or safety concerns">Privacy or safety concerns</option>
                  <option value="Closing matrimonial search">Closing matrimonial search</option>
                </>
              )}
            </select>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Additional notes or feedback (Optional)
            </label>
            <textarea
              value={accountActionFeedback}
              onChange={(e) => setAccountActionFeedback(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={2}
              maxLength={200}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-[#80132E] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={accountActionLoading}
              onClick={() => setAccountActionModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={accountActionType === 'deactivate' ? 'primary' : 'danger'}
              size="sm"
              disabled={accountActionLoading}
              onClick={handleAccountActionSubmit}
              className={accountActionType === 'deactivate' ? 'bg-[#80132E] text-white hover:bg-[#680F25]' : 'bg-red-600 text-white hover:bg-red-700'}
            >
              {accountActionLoading ? (
                <span className="flex items-center gap-1.5">
                  <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                  Processing…
                </span>
              ) : accountActionType === 'deactivate' ? (
                'Pause Profile'
              ) : (
                'Confirm Deletion'
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* CHANGE PASSWORD MODAL */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        mode={passwordModalMode}
        onSuccess={() => {
          setIsPasswordEnabled(true);
          setPasswordLastChanged('Just now');
        }}
      />

      {/* DISABLE PASSWORD CONFIRMATION MODAL */}
      <Modal
        isOpen={isDisableConfirmOpen}
        onClose={() => setIsDisableConfirmOpen(false)}
        title="Disable Password Login?"
        description="Are you sure you want to turn off password login for your account?"
        size="sm"
      >
        <div className="space-y-4 pt-1">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <IconAlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Mobile OTP login remains active</p>
              <p className="mt-0.5 text-[11px] text-amber-800">
                You will only be able to sign in via Mobile OTP. You can re-enable a password at any time.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E9DDE0]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDisableConfirmOpen(false)}
              className="rounded-xl text-xs font-semibold text-[#766B6F]"
            >
              Keep Enabled
            </Button>
            <Button
              type="button"
              size="md"
              onClick={handleConfirmDisablePassword}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 shadow-sm active-press"
            >
              Disable Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* CHANGE EMAIL MODAL WITH OTP VERIFICATION */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => {
          if (!isSavingEmail && !isSendingEmailOtp) {
            setIsEmailModalOpen(false);
          }
        }}
        title="Change Registered Email"
        description={
          emailModalStep === 'input'
            ? 'Enter your new email address. We will send a 6-digit verification code to confirm ownership.'
            : 'Enter the 6-digit verification code sent to your new email to complete the update.'
        }
      >
        {emailModalStep === 'input' ? (
          <div className="space-y-4 pt-1">
            {/* Current Email Info */}
            <div className="p-3 rounded-xl bg-[#FAF3EC] border border-[#EAD8C7] flex items-center justify-between gap-2 text-xs">
              <span className="text-[#766B6F]">Current Email:</span>
              <span className="font-bold text-[#211B1E] truncate max-w-[220px]">
                {currentUser?.email || (currentUser as any)?.user?.email || 'Not set'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-1.5">
                New Email Address (Gmail)
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendEmailOtp();
                  }
                }}
                placeholder="newname@gmail.com"
                autoFocus
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              {emailError && (
                <p className="mt-1.5 text-xs text-rose-600 font-semibold">{emailError}</p>
              )}
            </div>

            <p className="text-xs text-[var(--muted)] leading-relaxed bg-[#FFF9F6] p-3 rounded-xl border border-[#E9DDE0]">
              🔒 Confidential: Your email address is strictly private, used only for account login, password recovery, and security alerts. It is never displayed to other members.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEmailModalOpen(false)}
                className="rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isSendingEmailOtp || !emailInput.trim()}
                onClick={handleSendEmailOtp}
                className="rounded-xl font-bold cursor-pointer"
              >
                {isSendingEmailOtp ? (
                  <span className="flex items-center gap-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    <span>Sending Code...</span>
                  </span>
                ) : (
                  <span>Send Verification Code</span>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            {/* Back button & recipient indicator */}
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => {
                  setEmailModalStep('input');
                  setEmailOtp('');
                  setEmailError(null);
                }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#80132E] hover:underline cursor-pointer"
              >
                <IconArrowLeft className="h-3.5 w-3.5" />
                <span>Edit Email</span>
              </button>
              <span className="text-xs text-[#766B6F] font-medium truncate max-w-[200px]">
                {emailInput.trim().toLowerCase()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF3EC] border border-[#EAD8C7] text-xs text-[#211B1E] leading-relaxed">
              We sent a 6-digit verification code to <span className="font-bold">{emailInput.trim().toLowerCase()}</span>. Please enter the code below to verify ownership.
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] text-center">
                Enter 6-Digit Code
              </label>
              <div className="flex justify-center py-1">
                <ModernOtpInput
                  value={emailOtp}
                  onChange={(val) => {
                    setEmailOtp(val);
                    if (emailError) setEmailError(null);
                  }}
                  onComplete={(code) => {
                    handleVerifyAndUpdateEmail(code);
                  }}
                  error={!!emailError}
                  autoFocus
                />
              </div>
              {emailError && (
                <p className="text-xs text-rose-600 font-semibold text-center">{emailError}</p>
              )}
            </div>

            {/* Resend OTP */}
            <div className="text-center pt-1">
              {emailResendTimer > 0 ? (
                <span className="text-xs text-[#766B6F]">
                  Resend code in <span className="font-semibold text-[#211B1E]">{emailResendTimer}s</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendEmailOtp}
                  disabled={isSendingEmailOtp}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#80132E] hover:underline cursor-pointer disabled:opacity-50"
                >
                  <IconRefresh className={cn('h-3.5 w-3.5', isSendingEmailOtp && 'animate-spin')} />
                  <span>Didn't receive the code? Resend Code</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E9DDE0]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEmailModalOpen(false)}
                disabled={isSavingEmail}
                className="rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isSavingEmail || emailOtp.length !== 6}
                onClick={() => handleVerifyAndUpdateEmail()}
                className="rounded-xl font-bold cursor-pointer"
              >
                {isSavingEmail ? (
                  <span className="flex items-center gap-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying...</span>
                  </span>
                ) : (
                  <span>Verify & Update Email</span>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
    <FeatureGate page="settings" title="Settings">
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
    </FeatureGate>
  );
}
