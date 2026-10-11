"use client";

import React, { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format, isValid, parseISO } from "date-fns";
import {
  IconCalendarEvent,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconCheck,
  IconCalendar,
} from "@tabler/icons-react";
import "react-day-picker/style.css";
import { cn } from "@/lib/cn";

export interface DatePickerProps {
  name?: string;
  id?: string;
  value?: Date | string | null;
  defaultValue?: Date | string | null;
  onChange?: (date: Date | undefined) => void;
  required?: boolean;
  placeholder?: string;
  minAge?: number; // default: 18 years
  maxAge?: number; // default: 70 years
  className?: string;
  error?: boolean;
}

const MONTH_NAMES = [
  { short: "Jan", full: "January" },
  { short: "Feb", full: "February" },
  { short: "Mar", full: "March" },
  { short: "Apr", full: "April" },
  { short: "May", full: "May" },
  { short: "Jun", full: "June" },
  { short: "Jul", full: "July" },
  { short: "Aug", full: "August" },
  { short: "Sep", full: "September" },
  { short: "Oct", full: "October" },
  { short: "Nov", full: "November" },
  { short: "Dec", full: "December" },
];

export function DatePicker({
  name = "dob",
  id,
  value,
  defaultValue,
  onChange,
  required = false,
  placeholder = "Select Date of Birth",
  minAge = 18,
  maxAge = 70,
  className,
  error = false,
}: DatePickerProps) {
  const currentYear = new Date().getFullYear();
  const maxDate = new Date(currentYear - minAge, 11, 31);
  const minDate = new Date(currentYear - maxAge, 0, 1);
  const defaultMonth = new Date(currentYear - 26, 0, 1); // default view centered around age 26

  // Parse initial date
  const parseDate = (val: Date | string | null | undefined): Date | undefined => {
    if (!val) return undefined;
    if (val instanceof Date && isValid(val)) return val;
    if (typeof val === "string") {
      const parsed = parseISO(val);
      if (isValid(parsed)) return parsed;
      const direct = new Date(val);
      if (isValid(direct)) return direct;
    }
    return undefined;
  };

  const [selected, setSelected] = useState<Date | undefined>(() => {
    return parseDate(value ?? defaultValue);
  });
  const [displayMonth, setDisplayMonth] = useState<Date>(() => {
    const init = parseDate(value ?? defaultValue);
    return init || defaultMonth;
  });
  const [viewMode, setViewMode] = useState<"days" | "month" | "year">("days");
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeYearRef = useRef<HTMLButtonElement>(null);
  const yearScrollRef = useRef<HTMLDivElement>(null);

  // Sync external controlled value or defaultValue updates
  useEffect(() => {
    const activeVal = value !== undefined ? value : defaultValue;
    if (activeVal !== undefined && activeVal !== null && activeVal !== "") {
      const parsed = parseDate(activeVal);
      setSelected(parsed);
      if (parsed) {
        setDisplayMonth(parsed);
      }
    }
  }, [value, defaultValue]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setViewMode("days");
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setViewMode("days");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  // Auto-scroll to active year when year selector is opened
  useEffect(() => {
    if (viewMode === "year" && activeYearRef.current) {
      // Small timeout to allow DOM layout
      const timer = setTimeout(() => {
        activeYearRef.current?.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [viewMode]);

  const handleSelectDate = (date: Date | undefined) => {
    setSelected(date);
    if (onChange) {
      onChange(date);
    }
    if (date) {
      setDisplayMonth(date);
      setIsOpen(false);
      setViewMode("days");
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(undefined);
    if (onChange) {
      onChange(undefined);
    }
  };

  const handlePrevMonth = () => {
    const prev = new Date(
      displayMonth.getFullYear(),
      displayMonth.getMonth() - 1,
      1
    );
    if (prev >= minDate || prev.getFullYear() === minDate.getFullYear()) {
      setDisplayMonth(prev);
    }
  };

  const handleNextMonth = () => {
    const next = new Date(
      displayMonth.getFullYear(),
      displayMonth.getMonth() + 1,
      1
    );
    if (next <= maxDate || next.getFullYear() === maxDate.getFullYear()) {
      setDisplayMonth(next);
    }
  };

  const isPrevDisabled =
    displayMonth.getFullYear() <= minDate.getFullYear() &&
    displayMonth.getMonth() <= minDate.getMonth();

  const isNextDisabled =
    displayMonth.getFullYear() >= maxDate.getFullYear() &&
    displayMonth.getMonth() >= maxDate.getMonth();

  // Generate valid years range (descending order so recent years are near top)
  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();
  const years: number[] = [];
  for (let y = maxYear; y >= minYear; y--) {
    years.push(y);
  }

  // Decades for quick jumping (descending)
  const decades: number[] = [];
  for (let dec = Math.floor(maxYear / 10) * 10; dec >= Math.floor(minYear / 10) * 10; dec -= 10) {
    decades.push(dec);
  }

  const scrollToDecade = (decade: number) => {
    // Find closest year element in that decade
    const targetYear = Math.min(decade + 9, maxYear);
    const el = document.getElementById(`year-btn-${targetYear}`) || document.getElementById(`year-btn-${decade}`);
    if (el) {
      el.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  };

  const formattedDate = selected && isValid(selected) ? format(selected, "dd MMM yyyy") : "";
  const isoDate = selected && isValid(selected) ? format(selected, "yyyy-MM-dd") : "";

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Hidden input for HTML form submission compatibility */}
      <input
        type="hidden"
        name={name}
        id={id}
        value={isoDate}
        required={required}
      />

      {/* Interactive Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setViewMode("days");
        }}
        className={cn(
          "focus-ring h-12 w-full flex items-center justify-between rounded-xl border bg-white px-3.5 text-sm transition text-left cursor-pointer select-none",
          error
            ? "border-rose-300 focus:border-rose-500 ring-rose-100"
            : "border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--primary)]",
          isOpen && "border-[var(--primary)] ring-4 ring-[var(--primary)]/10"
        )}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 truncate">
          <IconCalendarEvent
            className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              selected ? "text-[var(--primary)]" : "text-[var(--muted)]"
            )}
            aria-hidden="true"
          />
          <span
            className={cn(
              "truncate font-medium",
              selected ? "text-[var(--foreground)] font-semibold" : "text-[var(--muted-light)]"
            )}
          >
            {formattedDate || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {selected && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-1 rounded-md text-[var(--muted)] hover:text-rose-600 hover:bg-rose-50 transition"
              title="Clear date"
            >
              <IconX className="h-3.5 w-3.5" />
            </span>
          )}
          <IconChevronDown
            className={cn(
              "h-4 w-4 text-[var(--muted)] transition-transform duration-200",
              isOpen && "rotate-180 text-[var(--primary)]"
            )}
            aria-hidden="true"
          />
        </div>
      </button>

      {/* Floating Calendar Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="absolute top-full left-0 mt-2 z-50 w-full sm:w-[326px] rounded-2xl border border-[var(--border)] bg-white/98 backdrop-blur-xl p-3.5 shadow-[0_20px_50px_rgba(40,10,20,0.18)] animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Top Info Bar */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 text-xs">
            <span className="font-semibold text-slate-800">Date of Birth</span>
            <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
              Min age: {minAge} yrs
            </span>
          </div>

          {/* Modern Month / Year Selector Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              {/* Month Switcher Pill */}
              <button
                type="button"
                onClick={() => setViewMode(viewMode === "month" ? "days" : "month")}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition border cursor-pointer",
                  viewMode === "month"
                    ? "bg-[#80132E] text-white border-[#80132E] shadow-sm shadow-[#80132E]/25"
                    : "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-[#FDF2F4] hover:text-[#80132E] hover:border-[#80132E]/30"
                )}
                title="Select month"
              >
                <span>{format(displayMonth, "MMMM")}</span>
                <IconChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform duration-200",
                    viewMode === "month" && "rotate-180 text-white"
                  )}
                />
              </button>

              {/* Year Switcher Pill */}
              <button
                type="button"
                onClick={() => setViewMode(viewMode === "year" ? "days" : "year")}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition border cursor-pointer",
                  viewMode === "year"
                    ? "bg-[#80132E] text-white border-[#80132E] shadow-sm shadow-[#80132E]/25"
                    : "bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-[#FDF2F4] hover:text-[#80132E] hover:border-[#80132E]/30"
                )}
                title="Select year"
              >
                <span>{format(displayMonth, "yyyy")}</span>
                <IconChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform duration-200",
                    viewMode === "year" && "rotate-180 text-white"
                  )}
                />
              </button>
            </div>

            {/* Prev / Next Month arrows (active only in calendar days mode) */}
            <div className="flex items-center gap-1">
              {viewMode !== "days" ? (
                <button
                  type="button"
                  onClick={() => setViewMode("days")}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#80132E] hover:bg-[#FDF2F4] px-2 py-1 rounded-lg transition"
                >
                  <IconCalendar className="h-3 w-3" />
                  <span>Calendar</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    disabled={isPrevDisabled}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    aria-label="Previous month"
                  >
                    <IconChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    disabled={isNextDisabled}
                    className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    aria-label="Next month"
                  >
                    <IconChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* VIEW 1: Standard Days Calendar */}
          {viewMode === "days" && (
            <div className="custom-calendar-container flex justify-center py-0.5">
              <DayPicker
                mode="single"
                selected={selected}
                onSelect={handleSelectDate}
                month={displayMonth}
                onMonthChange={setDisplayMonth}
                hideNavigation
                startMonth={minDate}
                endMonth={maxDate}
                disabled={{ after: maxDate, before: minDate }}
                className="m-0"
                classNames={{
                  month_caption: "hidden",
                  nav: "hidden",
                }}
                style={{
                  ["--rdp-accent-color" as any]: "#80132E",
                  ["--rdp-accent-background-color" as any]: "#FDF2F4",
                  ["--rdp-day-height" as any]: "36px",
                  ["--rdp-day-width" as any]: "36px",
                  ["--rdp-day_button-height" as any]: "34px",
                  ["--rdp-day_button-width" as any]: "34px",
                  ["--rdp-today-color" as any]: "#80132E",
                }}
              />
            </div>
          )}

          {/* VIEW 2: Modern 12-Month Grid Selector */}
          {viewMode === "month" && (
            <div className="py-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-2.5 px-0.5">
                <span>Select Month in {format(displayMonth, "yyyy")}</span>
                <span className="text-[10px] text-slate-400">Tap to choose</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {MONTH_NAMES.map((m, idx) => {
                  const isCurrentSelected = displayMonth.getMonth() === idx;
                  return (
                    <button
                      key={m.full}
                      type="button"
                      onClick={() => {
                        const updated = new Date(
                          displayMonth.getFullYear(),
                          idx,
                          1
                        );
                        setDisplayMonth(updated);
                        setViewMode("days");
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center py-2 px-1 rounded-xl transition text-center cursor-pointer border",
                        isCurrentSelected
                          ? "bg-[#80132E] text-white border-[#80132E] shadow-sm shadow-[#80132E]/25"
                          : "bg-slate-50/70 text-slate-700 border-slate-100 hover:bg-[#FDF2F4] hover:text-[#80132E] hover:border-[#80132E]/20"
                      )}
                    >
                      <span className="text-xs font-bold leading-tight">
                        {m.short}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] leading-tight mt-0.5",
                          isCurrentSelected ? "text-white/80" : "text-slate-400"
                        )}
                      >
                        {m.full}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 3: Modern Year Grid Selector with Auto-Center and Decades Jump */}
          {viewMode === "year" && (
            <div className="py-1">
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1.5 px-0.5">
                <span>Birth Year Range ({minYear}–{maxYear})</span>
                <span className="text-[10px] text-slate-400">Scroll or pick decade</span>
              </div>

              {/* Fast Decade Navigation Chips */}
              <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-1 no-scrollbar">
                {decades.map((dec) => (
                  <button
                    key={dec}
                    type="button"
                    onClick={() => scrollToDecade(dec)}
                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 hover:bg-[#FDF2F4] hover:text-[#80132E] text-slate-600 transition shrink-0 cursor-pointer"
                  >
                    {dec}s
                  </button>
                ))}
              </div>

              {/* Scrollable Year Grid */}
              <div
                ref={yearScrollRef}
                className="max-h-[220px] overflow-y-auto pr-1 grid grid-cols-4 gap-1.5 scroll-smooth"
                style={{ scrollbarWidth: "thin" }}
              >
                {years.map((yr) => {
                  const isCurrentYear = displayMonth.getFullYear() === yr;
                  return (
                    <button
                      key={yr}
                      id={`year-btn-${yr}`}
                      ref={isCurrentYear ? activeYearRef : undefined}
                      type="button"
                      onClick={() => {
                        const updated = new Date(
                          yr,
                          displayMonth.getMonth(),
                          1
                        );
                        setDisplayMonth(updated);
                        setViewMode("days");
                      }}
                      className={cn(
                        "py-2 px-1 rounded-xl text-xs font-semibold transition text-center cursor-pointer border",
                        isCurrentYear
                          ? "bg-[#80132E] text-white border-[#80132E] shadow-sm shadow-[#80132E]/30 font-bold scale-[1.02]"
                          : "bg-slate-50/70 text-slate-700 border-slate-100 hover:bg-[#FDF2F4] hover:text-[#80132E] hover:border-[#80132E]/20"
                      )}
                    >
                      {yr}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Navigation Hint & Done Footer */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">
              {viewMode === "days"
                ? "Tap Month / Year above to jump"
                : "Tap any item to return to calendar"}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setViewMode("days");
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-[#80132E] text-white px-3 py-1 font-semibold text-xs hover:bg-[#600d22] transition cursor-pointer shadow-sm shadow-[#80132E]/20"
            >
              <IconCheck className="h-3 w-3" /> Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

