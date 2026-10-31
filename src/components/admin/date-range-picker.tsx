'use client';

import React, { useState } from 'react';
import { IconCalendar, IconCheck, IconChevronDown } from '@tabler/icons-react';
import type { AnalyticsPreset, DateRangeInput } from '@/types/analytics';

interface DateRangePickerProps {
  currentRange: DateRangeInput;
  onChange: (newRange: DateRangeInput) => void;
  isLoading?: boolean;
}

const PRESETS: Array<{ id: AnalyticsPreset; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
  { id: 'custom', label: 'Custom' },
];

export function DateRangePicker({
  currentRange,
  onChange,
  isLoading = false,
}: DateRangePickerProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(
    currentRange.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [customTo, setCustomTo] = useState(
    currentRange.to || new Date().toISOString().slice(0, 10)
  );
  const [customError, setCustomError] = useState<string | null>(null);

  const selectedPreset = currentRange.preset || '30d';

  const handleSelectPreset = (preset: AnalyticsPreset) => {
    if (preset === 'custom') {
      setDropdownOpen(true);
      return;
    }
    setCustomError(null);
    setDropdownOpen(false);
    onChange({
      preset,
      timezone: currentRange.timezone || 'UTC',
    });
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(customFrom).getTime();
    const end = new Date(customTo).getTime();
    const now = Date.now();

    if (Number.isNaN(start) || Number.isNaN(end)) {
      setCustomError('Please provide valid start and end dates.');
      return;
    }
    if (start > end) {
      setCustomError('Start date must be before or equal to end date.');
      return;
    }
    if (end > now + 24 * 60 * 60 * 1000) {
      setCustomError('End date cannot be in the future.');
      return;
    }
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays > 366) {
      setCustomError('Custom range cannot exceed 366 days.');
      return;
    }

    setCustomError(null);
    setDropdownOpen(false);
    onChange({
      preset: 'custom',
      from: new Date(customFrom).toISOString(),
      to: new Date(customTo).toISOString(),
      timezone: currentRange.timezone || 'UTC',
    });
  };

  const currentLabel =
    selectedPreset === 'custom'
      ? `${customFrom} – ${customTo}`
      : PRESETS.find((p) => p.id === selectedPreset)?.label || '30 Days';

  return (
    <div className="relative inline-block text-left">
      {/* Preset Buttons for Desktop */}
      <div className="hidden sm:inline-flex items-center rounded-xl bg-[var(--surface)] p-1 border border-[var(--border)] shadow-xs gap-1">
        {PRESETS.map((p) => {
          const isActive = selectedPreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              disabled={isLoading}
              onClick={() => handleSelectPreset(p.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Mobile Preset Dropdown Trigger */}
      <div className="sm:hidden">
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center justify-between gap-2 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs font-semibold text-[var(--foreground)] shadow-xs"
        >
          <div className="flex items-center gap-2">
            <IconCalendar className="h-4 w-4 text-[var(--primary)]" />
            <span>{currentLabel}</span>
          </div>
          <IconChevronDown className="h-3.5 w-3.5 text-[var(--muted)]" />
        </button>
      </div>

      {/* Custom Date Modal / Dropdown */}
      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
          <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 z-50 w-72 rounded-2xl bg-white p-4 shadow-xl border border-[var(--border)] animate-in fade-in zoom-in-95 duration-150">
            <h4 className="text-xs font-bold text-[var(--foreground)] mb-3 flex items-center gap-1.5">
              <IconCalendar className="h-4 w-4 text-[var(--primary)]" />
              <span>Select Date Range</span>
            </h4>

            {/* Mobile list of presets */}
            <div className="sm:hidden grid grid-cols-2 gap-1 mb-4 border-b border-[var(--border)] pb-3">
              {PRESETS.filter((p) => p.id !== 'custom').map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p.id)}
                  className={`text-left px-2.5 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                    selectedPreset === p.id
                      ? 'bg-[var(--primary-light)] text-[var(--primary)] font-bold'
                      : 'hover:bg-[var(--surface-muted)] text-[var(--muted-strong)]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom from / to form */}
            <form onSubmit={handleApplyCustom} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--muted-strong)] mb-1">
                  Start Date (From)
                </label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 focus:border-[var(--primary)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[var(--muted-strong)] mb-1">
                  End Date (To)
                </label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full text-xs rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 focus:border-[var(--primary)] focus:outline-hidden"
                />
              </div>

              {customError && (
                <p className="text-[11px] text-rose-600 font-medium">{customError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(false)}
                  className="px-2.5 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)] hover:bg-[#5E142E] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                >
                  <IconCheck className="h-3.5 w-3.5" />
                  Apply Range
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
