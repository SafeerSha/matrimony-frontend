"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import {
  IconSchool,
  IconChevronDown,
  IconSearch,
  IconCheck,
  IconEdit,
  IconAlertCircle,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import {
  EDUCATION_LEVELS,
  EDUCATION_QUALIFICATIONS_BY_LEVEL,
  parseStoredEducation,
  formatStoredEducation,
} from "@/lib/data/education-profession-data";

export interface EducationSelectorProps {
  name?: string;
  id?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (val: string, details?: { level: string; qualification: string; isCustom: boolean }) => void;
  required?: boolean;
  className?: string;
  error?: string | boolean;
}

export function EducationSelector({
  name = "education",
  id,
  defaultValue = "",
  value,
  onChange,
  required = false,
  className,
  error,
}: EducationSelectorProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  // Initialize from value or defaultValue
  const initialParsed = parseStoredEducation(value !== undefined ? value : defaultValue);

  const [selectedLevelId, setSelectedLevelId] = useState<string>(initialParsed.levelId);
  const [selectedQualification, setSelectedQualification] = useState<string>(initialParsed.qualification);
  const [customQualification, setCustomQualification] = useState<string>(initialParsed.customText);

  // Search query for Step 2 qualifications
  const [searchQuery, setSearchQuery] = useState("");
  const [isLevelMenuOpen, setIsLevelMenuOpen] = useState(false);
  const [isQualMenuOpen, setIsQualMenuOpen] = useState(false);

  const levelMenuRef = useRef<HTMLDivElement>(null);
  const qualMenuRef = useRef<HTMLDivElement>(null);
  const qualInputRef = useRef<HTMLInputElement>(null);

  // Sync external controlled value or defaultValue updates
  useEffect(() => {
    const activeVal = value !== undefined ? value : defaultValue;
    if (activeVal !== undefined && activeVal !== null) {
      const parsed = parseStoredEducation(activeVal);
      setSelectedLevelId(parsed.levelId);
      setSelectedQualification(parsed.qualification);
      setCustomQualification(parsed.customText);
    }
  }, [value, defaultValue]);

  // Click outside listeners
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (levelMenuRef.current && !levelMenuRef.current.contains(event.target as Node)) {
        setIsLevelMenuOpen(false);
      }
      if (qualMenuRef.current && !qualMenuRef.current.contains(event.target as Node)) {
        setIsQualMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLevelObj = EDUCATION_LEVELS.find((l) => l.id === selectedLevelId);
  const availableQualifications = selectedLevelId
    ? EDUCATION_QUALIFICATIONS_BY_LEVEL[selectedLevelId] || []
    : [];

  const isCustomChosen =
    selectedLevelId === "other" ||
    (selectedQualification && selectedQualification.toLowerCase().startsWith("other"));

  // Compute final composite value
  const finalValue = formatStoredEducation(
    selectedLevelId,
    selectedQualification,
    customQualification
  );

  const notifyChange = (lvl: string, qual: string, custom: string) => {
    const formatted = formatStoredEducation(lvl, qual, custom);
    if (onChange) {
      onChange(formatted, {
        level: lvl,
        qualification: qual,
        isCustom: lvl === "other" || qual.toLowerCase().startsWith("other"),
      });
    }
  };

  const handleSelectLevel = (levelId: string) => {
    setSelectedLevelId(levelId);
    setIsLevelMenuOpen(false);
    // Reset qualification on level change to prevent mismatch
    setSelectedQualification("");
    setCustomQualification("");
    setSearchQuery("");
    setIsQualMenuOpen(true);
    notifyChange(levelId, "", "");
  };

  const handleSelectQualification = (qual: string) => {
    setSelectedQualification(qual);
    setIsQualMenuOpen(false);
    setSearchQuery("");
    if (!qual.toLowerCase().startsWith("other")) {
      setCustomQualification("");
      notifyChange(selectedLevelId, qual, "");
    } else {
      notifyChange(selectedLevelId, qual, customQualification);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const txt = e.target.value;
    setCustomQualification(txt);
    notifyChange(selectedLevelId, selectedQualification, txt);
  };

  // Filtered qualifications
  const filteredQualifications = availableQualifications.filter((q) => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase().trim();
    return q.toLowerCase().includes(term);
  });

  return (
    <div className={cn("space-y-2.5 w-full", className)}>
      {/* Hidden input for HTML form submission */}
      <input
        type="hidden"
        name={name}
        id={inputId}
        value={finalValue}
        required={required}
      />

      {/* Step 1: Education Level Selection */}
      <div className="relative" ref={levelMenuRef}>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] flex items-center gap-1">
            <span>Highest Education</span>
            {required && <span className="text-rose-500">*</span>}
          </label>
          {selectedLevelId && (
            <span className="text-[11px] font-medium text-[var(--primary)] bg-[var(--primary-light)]/40 px-2 py-0.5 rounded-full">
              Step 1 of 2 Complete
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setIsLevelMenuOpen(!isLevelMenuOpen);
            setIsQualMenuOpen(false);
          }}
          className={cn(
            "focus-ring h-12 w-full flex items-center justify-between rounded-xl border bg-white px-3.5 text-sm transition text-left cursor-pointer",
            error
              ? "border-rose-300 ring-rose-100"
              : "border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--primary)]",
            isLevelMenuOpen && "border-[var(--primary)] ring-4 ring-[var(--primary)]/10"
          )}
          aria-haspopup="listbox"
          aria-expanded={isLevelMenuOpen}
        >
          <div className="flex items-center gap-2.5 truncate">
            <IconSchool
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                currentLevelObj ? "text-[var(--primary)]" : "text-[var(--muted)]"
              )}
            />
            <div className="truncate">
              {currentLevelObj ? (
                <span className="font-semibold text-[var(--foreground)]">
                  {currentLevelObj.label}
                </span>
              ) : (
                <span className="text-[var(--muted-light)]">
                  Select your highest education level
                </span>
              )}
            </div>
          </div>

          <IconChevronDown
            className={cn(
              "h-4 w-4 text-[var(--muted)] shrink-0 transition-transform duration-200",
              isLevelMenuOpen && "rotate-180 text-[var(--primary)]"
            )}
          />
        </button>

        {/* Level Dropdown Menu */}
        {isLevelMenuOpen && (
          <div className="absolute top-full left-0 mt-1.5 z-50 w-full rounded-2xl border border-[var(--border)] bg-white/98 backdrop-blur-xl p-1.5 shadow-[0_16px_40px_rgba(40,10,20,0.14)] animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto">
            <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
              Select Highest Completed Level
            </div>
            <div className="space-y-0.5 pt-1">
              {EDUCATION_LEVELS.map((lvl) => {
                const isSelected = selectedLevelId === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => handleSelectLevel(lvl.id)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition cursor-pointer",
                      isSelected
                        ? "bg-[#80132E] text-white shadow-sm font-semibold"
                        : "hover:bg-[#FDF2F4] text-slate-800 hover:text-[#80132E]"
                    )}
                  >
                    <div>
                      <div className="text-xs font-semibold leading-snug">
                        {lvl.label}
                      </div>
                      <div
                        className={cn(
                          "text-[10px] line-clamp-1 mt-0.5",
                          isSelected ? "text-white/80" : "text-slate-400"
                        )}
                      >
                        {lvl.description}
                      </div>
                    </div>
                    {isSelected && <IconCheck className="h-4 w-4 shrink-0 text-white ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Dynamic Qualification Selection (shown when level is chosen) */}
      {selectedLevelId && (
        <div className="relative pt-1 animate-in fade-in slide-in-from-top-2 duration-200" ref={qualMenuRef}>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] flex items-center gap-1">
              <span>Qualification / Degree</span>
              {required && <span className="text-rose-500">*</span>}
            </label>
            <button
              type="button"
              onClick={() => setIsLevelMenuOpen(true)}
              className="text-[11px] text-[var(--primary)] hover:underline inline-flex items-center gap-0.5 font-medium cursor-pointer"
            >
              <IconEdit className="h-3 w-3" /> Change Level
            </button>
          </div>

          {/* Qualification Trigger */}
          <button
            type="button"
            onClick={() => {
              setIsQualMenuOpen(!isQualMenuOpen);
              setIsLevelMenuOpen(false);
              setTimeout(() => qualInputRef.current?.focus(), 50);
            }}
            className={cn(
              "focus-ring h-12 w-full flex items-center justify-between rounded-xl border bg-white px-3.5 text-sm transition text-left cursor-pointer",
              error
                ? "border-rose-300 ring-rose-100"
                : "border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--primary)]",
              isQualMenuOpen && "border-[var(--primary)] ring-4 ring-[var(--primary)]/10"
            )}
            aria-haspopup="listbox"
            aria-expanded={isQualMenuOpen}
          >
            <div className="truncate">
              {selectedQualification ? (
                <span className="font-semibold text-[var(--foreground)] truncate block">
                  {selectedQualification}
                </span>
              ) : (
                <span className="text-[var(--muted-light)]">
                  Select {currentLevelObj?.shortLabel || ""} Qualification
                </span>
              )}
            </div>

            <IconChevronDown
              className={cn(
                "h-4 w-4 text-[var(--muted)] shrink-0 transition-transform duration-200 ml-2",
                isQualMenuOpen && "rotate-180 text-[var(--primary)]"
              )}
            />
          </button>

          {/* Searchable Qualification Popover */}
          {isQualMenuOpen && (
            <div className="absolute top-full left-0 mt-1.5 z-50 w-full rounded-2xl border border-[var(--border)] bg-white/98 backdrop-blur-xl p-2.5 shadow-[0_16px_40px_rgba(40,10,20,0.14)] animate-in fade-in zoom-in-95 duration-150">
              {/* Search Bar */}
              <div className="relative mb-2">
                <IconSearch className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={qualInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${currentLevelObj?.shortLabel || ""} courses...`}
                  className="h-9 w-full rounded-lg bg-slate-50 pl-8 pr-7 text-xs text-slate-800 placeholder:text-slate-400 border border-slate-200 outline-none focus:border-[#80132E] focus:bg-white transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Qualification List */}
              <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
                {filteredQualifications.length > 0 ? (
                  filteredQualifications.map((q) => {
                    const isSelected = selectedQualification === q;
                    return (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleSelectQualification(q)}
                        className={cn(
                          "w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition cursor-pointer",
                          isSelected
                            ? "bg-[#80132E] text-white font-semibold shadow-sm"
                            : "hover:bg-[#FDF2F4] text-slate-700 hover:text-[#80132E]"
                        )}
                      >
                        <span className="truncate">{q}</span>
                        {isSelected && <IconCheck className="h-3.5 w-3.5 shrink-0 text-white ml-2" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="py-4 px-2 text-center text-xs text-slate-400">
                    <div>No exact match found for &ldquo;{searchQuery}&rdquo;</div>
                    <button
                      type="button"
                      onClick={() => handleSelectQualification("Other")}
                      className="mt-2 text-xs font-semibold text-[#80132E] hover:underline cursor-pointer"
                    >
                      Use &ldquo;Other qualification&rdquo; instead
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Custom Qualification Input if "Other" is chosen */}
          {isCustomChosen && (
            <div className="mt-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Specify your qualification title:
              </label>
              <input
                type="text"
                value={customQualification}
                onChange={handleCustomChange}
                required={required}
                placeholder="e.g. B.Tech Artificial Intelligence & Data Science"
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition"
              />
            </div>
          )}
        </div>
      )}

      {/* Validation / Helper display */}
      {typeof error === "string" && error && (
        <div className="flex items-center gap-1 text-xs text-rose-500 mt-1">
          <IconAlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
