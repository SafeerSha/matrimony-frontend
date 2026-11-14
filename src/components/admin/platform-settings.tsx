'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  IconShieldCheck,
  IconShieldOff,
  IconLoader2,
  IconRefresh,
  IconAlertCircle,
  IconClock,
  IconCheck,
  IconUserCheck,
  IconUserX,
  IconCalendar,
  IconInfoCircle,
  IconAdjustments,
  IconToggleLeft,
  IconToggleRight,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminService, type CoolingPeriodSetting } from '@/services/admin.service';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';

export function PlatformSettings() {
  const [setting, setSetting] = useState<CoolingPeriodSetting | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toggling, setToggling] = useState<boolean>(false);
  const [savingDays, setSavingDays] = useState<boolean>(false);
  const [customDays, setCustomDays] = useState<number>(30);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getCoolingPeriodSetting(signal);
      setSetting(res);
      setCustomDays(res.days || 30);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Failed to load platform settings:', err);
      setError(err?.message || 'Failed to load platform settings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadSettings(controller.signal);
    return () => controller.abort();
  }, [loadSettings]);

  const handleToggle = async () => {
    if (!setting || toggling) return;
    const nextState = !setting.enabled;

    // Optimistic UI update
    setToggling(true);
    const previousSetting = { ...setting };
    setSetting({ ...setting, enabled: nextState });

    try {
      const res = await adminService.updateCoolingPeriodSetting({
        enabled: nextState,
        days: customDays,
      });
      setSetting(res);
      toast.dismissAll();
      toast.flash(
        'success',
        nextState ? 'Cooling-Off Period Enabled' : 'Cooling-Off Period Disabled',
        nextState
          ? `30-day cooling period is now active. Deleted users must wait ${res.days} days before rejoining.`
          : 'Cooling period is now turned off for testing. Users who delete their profile can re-register immediately.'
      );
    } catch (err: any) {
      // Revert on error
      setSetting(previousSetting);
      toast.dismissAll();
      toast.flash('error', 'Update Failed', err?.message || 'Could not update cooling-off period setting.');
    } finally {
      setToggling(false);
    }
  };

  const handleSaveDays = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setting || savingDays) return;

    if (customDays < 1 || customDays > 365) {
      toast.dismissAll();
      toast.flash('error', 'Invalid Duration', 'Cooling-off duration must be between 1 and 365 days.');
      return;
    }

    try {
      setSavingDays(true);
      const res = await adminService.updateCoolingPeriodSetting({
        enabled: setting.enabled,
        days: customDays,
      });
      setSetting(res);
      toast.dismissAll();
      toast.flash('success', 'Duration Saved', `Cooling-off period duration updated to ${res.days} days.`);
    } catch (err: any) {
      toast.dismissAll();
      toast.flash('error', 'Save Failed', err?.message || 'Could not save cooling-off period duration.');
    } finally {
      setSavingDays(false);
    }
  };

  const isEnabled = setting?.enabled ?? true;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-5xl">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
              Platform Configuration &amp; Controls
            </h1>
            <Badge tone="default" size="sm" className="bg-[#FAF3EC] text-[#80132E] border border-[#EAD8C7]">
              Admin Level
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Global system-level feature switches, registration safeguards, and testing flags.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadSettings()}
          disabled={loading || toggling}
          className="self-start sm:self-auto text-xs h-9"
        >
          {loading ? (
            <IconLoader2 className="mr-1.5 h-3.5 w-3.5 animate-spin text-[var(--primary)]" />
          ) : (
            <IconRefresh className="mr-1.5 h-3.5 w-3.5" />
          )}
          Refresh Settings
        </Button>
      </header>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconAlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => loadSettings()} className="text-xs h-7">
            Retry
          </Button>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6 sm:p-7 border border-[var(--border)] bg-white rounded-2xl shadow-sm">
          {loading && !setting ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
              <IconLoader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
              <p className="text-xs text-[var(--muted)]">Loading platform configuration…</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Feature Flag Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-[var(--border)]">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                      Account Rejoin Cooling-Off Period
                    </span>
                    {isEnabled ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <IconShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                        Active (Enforced)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <IconShieldOff className="h-3.5 w-3.5 text-amber-600" />
                        Disabled (Testing Mode)
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                    Controls whether users who voluntarily delete their profile are required to wait before creating a
                    new profile with the same phone number or email address.
                  </p>
                </div>

                {/* Switch Toggle */}
                <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
                  <span className="text-xs font-semibold text-[var(--muted)] select-none">
                    {isEnabled ? 'Restriction ON' : 'Restriction OFF'}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    disabled={toggling || loading}
                    onClick={handleToggle}
                    className={cn(
                      'relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#80132E] focus:ring-offset-2',
                      isEnabled ? 'bg-[#80132E]' : 'bg-zinc-300 dark:bg-zinc-700',
                      (toggling || loading) && 'opacity-60 cursor-not-allowed'
                    )}
                  >
                    <span className="sr-only">Toggle cooling-off period restriction</span>
                    <span
                      className={cn(
                        'pointer-events-none flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out text-[#80132E]',
                        isEnabled ? 'translate-x-8' : 'translate-x-0'
                      )}
                    >
                      {toggling ? (
                        <IconLoader2 className="h-3.5 w-3.5 animate-spin text-[#80132E]" />
                      ) : isEnabled ? (
                        <IconCheck className="h-3.5 w-3.5 stroke-[3] text-emerald-600" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-zinc-400" />
                      )}
                    </span>
                  </button>
                </div>
              </div>

              {/* Behavior Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={cn(
                    'p-4 rounded-xl border transition-all',
                    isEnabled
                      ? 'bg-emerald-50/60 border-emerald-200 ring-1 ring-emerald-300/40'
                      : 'bg-zinc-50 border-zinc-200 opacity-60'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <IconShieldCheck className="h-4 w-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-emerald-950">
                      When Restriction is Turned ON (Production Mode)
                    </span>
                  </div>
                  <ul className="text-xs text-emerald-900/80 space-y-1.5 ml-1 list-disc list-inside">
                    <li>
                      Users who delete their own account enter a <strong>{setting?.days || 30}-day cooling period</strong>.
                    </li>
                    <li>
                      Attempts to re-register with the same phone or email during this window are blocked with remaining days shown.
                    </li>
                    <li>
                      Prevents platform churn, accidental deletions, and repeated profile cycling.
                    </li>
                  </ul>
                </div>

                <div
                  className={cn(
                    'p-4 rounded-xl border transition-all',
                    !isEnabled
                      ? 'bg-amber-50/80 border-amber-200 ring-1 ring-amber-300/50'
                      : 'bg-zinc-50 border-zinc-200 opacity-60'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <IconShieldOff className="h-4 w-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-amber-950">
                      When Restriction is Turned OFF (Instant Rejoin Mode)
                    </span>
                  </div>
                  <ul className="text-xs text-amber-900/80 space-y-1.5 ml-1 list-disc list-inside">
                    <li>
                      <strong>Zero waiting period:</strong> Deleted users can immediately recreate their profile.
                    </li>
                    <li>
                      The previous deleted account record is archived automatically upon re-registration.
                    </li>
                    <li>
                      Ideal for QA testing, development demos, and testing profile onboarding end-to-end.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Configurable Cooling Duration */}
              {isEnabled && (
                <div className="p-4 rounded-xl bg-[#FAF3EC] border border-[#E9DDE0] space-y-3">
                  <div className="flex items-center gap-2">
                    <IconClock className="h-4 w-4 text-[#80132E]" />
                    <span className="text-xs sm:text-sm font-bold text-[#80132E]">
                      Cooling-Off Duration Configuration
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    Specify how many days a user must wait after self-deleting their profile before they can re-register.
                  </p>
                  <form onSubmit={handleSaveDays} className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={customDays}
                        onChange={(e) => setCustomDays(parseInt(e.target.value, 10) || 1)}
                        className="w-24 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#80132E]"
                      />
                      <span className="text-xs font-semibold text-[var(--foreground)]">days</span>
                    </div>

                    <Button
                      type="submit"
                      size="sm"
                      disabled={savingDays || customDays === setting?.days}
                      className="bg-[#80132E] hover:bg-[#680F25] text-white text-xs h-8 px-4"
                    >
                      {savingDays ? <IconLoader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
                      Update Duration
                    </Button>

                    <div className="flex items-center gap-1.5 ml-auto text-[11px] text-[var(--muted)]">
                      <IconCalendar className="h-3.5 w-3.5" />
                      <span>Standard default: 30 days</span>
                    </div>
                  </form>
                </div>
              )}

              {/* Security Invariant Alert */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs flex items-start gap-3">
                <IconInfoCircle className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block text-blue-950">Security Invariant Notice</span>
                  <p className="leading-relaxed text-blue-900/90">
                    This toggle <strong>only affects voluntary user-initiated account deletions</strong>.
                    Accounts terminated or banned by administrators remain permanently blocked from login and registration,
                    regardless of this setting.
                  </p>
                </div>
              </div>

              {/* Audit Meta */}
              {setting?.updatedAt && (
                <div className="pt-2 text-[11px] text-[var(--muted)] flex items-center justify-between flex-wrap gap-2">
                  <span>
                    Last updated:{' '}
                    {new Date(setting.updatedAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {setting.updatedBy && <span>Updated by: {setting.updatedBy}</span>}
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
