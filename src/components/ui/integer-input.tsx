'use client';

import React, { useState, useEffect, useRef } from 'react';
import { IconPlus, IconMinus } from '@tabler/icons-react';
import { cn } from '@/lib/cn';

export interface IntegerInputProps {
  label: string;
  name: string;
  value: number | undefined | null;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  onChange: (val: number) => void;
}

export function IntegerInput({
  label,
  name,
  value,
  min = 0,
  max = 20,
  step = 1,
  disabled = false,
  required = false,
  className = '',
  onChange,
}: IntegerInputProps) {
  const numericValue = typeof value === 'number' && !isNaN(value) ? value : min;
  const [textValue, setTextValue] = useState<string>(String(numericValue));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize internal display with prop when not actively focused / typing
  useEffect(() => {
    if (!isFocused) {
      setTextValue(String(numericValue));
    }
  }, [numericValue, isFocused]);

  const handleIncrement = () => {
    if (disabled) return;
    const next = Math.min(numericValue + step, max);
    setTextValue(String(next));
    onChange(next);
  };

  const handleDecrement = () => {
    if (disabled) return;
    const next = Math.max(numericValue - step, min);
    setTextValue(String(next));
    onChange(next);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');

    // Allow empty string temporarily while typing / backspacing
    if (raw === '') {
      setTextValue('');
      onChange(min);
      return;
    }

    // Strip leading zeroes so typing '1' when initial is '0' produces '1', not '01'
    const cleanStr = raw.replace(/^0+(?=\d)/, '');
    const parsed = parseInt(cleanStr, 10);
    const clamped = Math.min(Math.max(isNaN(parsed) ? min : parsed, min), max);

    setTextValue(cleanStr);
    onChange(clamped);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Auto-select text so any digit typed replaces the current value instantly
    e.target.select();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (textValue === '' || isNaN(parseInt(textValue, 10))) {
      setTextValue(String(min));
      onChange(min);
    } else {
      const parsed = parseInt(textValue, 10);
      const clamped = Math.min(Math.max(parsed, min), max);
      setTextValue(String(clamped));
      onChange(clamped);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  return (
    <div className={className}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1">
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>

      {/* Hidden input to ensure FormData serialization works identically on submit */}
      <input type="hidden" name={name} value={numericValue} />

      <div
        className={cn(
          "flex items-center h-11 w-full rounded-xl border border-[var(--border)] bg-white overflow-hidden transition shadow-xs",
          isFocused ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/10" : "hover:border-slate-300",
          disabled && "opacity-50 pointer-events-none bg-slate-50"
        )}
      >
        <button
          type="button"
          tabIndex={-1}
          onClick={handleDecrement}
          disabled={disabled || numericValue <= min}
          aria-label={`Decrease ${label}`}
          className="h-full px-3 text-slate-500 hover:text-[#80132E] hover:bg-slate-50 active:bg-slate-100 disabled:opacity-25 disabled:cursor-not-allowed transition flex items-center justify-center select-none"
        >
          <IconMinus className="w-4 h-4 stroke-[2.5]" />
        </button>

        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={textValue}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          className="h-full w-full text-center text-sm font-semibold text-[var(--foreground)] bg-transparent outline-none select-all"
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={handleIncrement}
          disabled={disabled || numericValue >= max}
          aria-label={`Increase ${label}`}
          className="h-full px-3 text-slate-500 hover:text-[#80132E] hover:bg-slate-50 active:bg-slate-100 disabled:opacity-25 disabled:cursor-not-allowed transition flex items-center justify-center select-none"
        >
          <IconPlus className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}

