'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  IconLoader2,
  IconRefresh,
  IconAlertCircle,
  IconCheck,
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
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getCoolingPeriodSetting(signal);
      setSetting(res);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Failed to load platform settings:', err);
      setError(err?.message || 'Failed to load platform settings.');
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

    setToggling(true);
    const previousSetting = { ...setting };
    setSetting({ ...setting, enabled: nextState });

    try {
      const res = await adminService.updateCoolingPeriodSetting({
        enabled: nextState,
      });
      setSetting(res);
      toast.dismissAll();
      toast.flash(
        'success',
        nextState ? 'Cooling-Off Period Enabled' : 'Cooling-Off Period Disabled',
        nextState
          ? '30-day cooling-off period is now active for deleted accounts.'
          : 'Cooling-off period disabled. Deleted users can rejoin immediately.'
      );
    } catch (err: any) {
      setSetting(previousSetting);
      toast.dismissAll();
      toast.flash('error', 'Update Failed', err?.message || 'Could not update setting.');
    } finally {
      setToggling(false);
    }
  };

  const isEnabled = setting?.enabled ?? true;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-4xl">
      {/* Header */}
      <header className="flex items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
            Platform Settings
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
            Manage system-wide feature flags and testing controls.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadSettings()}
          disabled={loading || toggling}
          className="text-xs h-8"
        >
          {loading ? (
            <IconLoader2 className="mr-1.5 h-3.5 w-3.5 animate-spin text-[var(--primary)]" />
          ) : (
            <IconRefresh className="mr-1.5 h-3.5 w-3.5" />
          )}
          Refresh
        </Button>
      </header>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconAlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => loadSettings()} className="text-xs h-6">
            Retry
          </Button>
        </div>
      )}

      {/* Minimal Setting Card */}
      <Card className="p-5 sm:p-6 border border-[var(--border)] bg-white rounded-2xl shadow-xs">
        {loading && !setting ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs text-[var(--muted)]">
            <IconLoader2 className="h-4 w-4 animate-spin text-[var(--primary)]" />
            <span>Loading settings…</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-[var(--foreground)]">
                  Account Rejoin Cooling-Off Period
                </span>
                <Badge
                  tone={isEnabled ? 'success' : 'default'}
                  size="sm"
                  className={cn(
                    'text-[11px] font-semibold',
                    isEnabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                  )}
                >
                  {isEnabled ? 'Active (30 Days)' : 'Disabled (Instant Rejoin)'}
                </Badge>
              </div>
              <p className="text-xs text-[var(--muted)]">
                Require users who delete their profile to wait before recreating an account with the same phone or email.
              </p>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3 self-start sm:self-center shrink-0">
              <button
                type="button"
                role="switch"
                aria-checked={isEnabled}
                disabled={toggling || loading}
                onClick={handleToggle}
                className={cn(
                  'relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#80132E] focus:ring-offset-2',
                  isEnabled ? 'bg-[#80132E]' : 'bg-zinc-300 dark:bg-zinc-700',
                  (toggling || loading) && 'opacity-60 cursor-not-allowed'
                )}
              >
                <span className="sr-only">Toggle cooling-off period restriction</span>
                <span
                  className={cn(
                    'pointer-events-none flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out text-[#80132E]',
                    isEnabled ? 'translate-x-6' : 'translate-x-0'
                  )}
                >
                  {toggling ? (
                    <IconLoader2 className="h-3 w-3 animate-spin text-[#80132E]" />
                  ) : isEnabled ? (
                    <IconCheck className="h-3 w-3 stroke-[3] text-emerald-600" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                  )}
                </span>
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
