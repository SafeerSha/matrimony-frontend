"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import {
  IconBriefcase,
  IconChevronDown,
  IconSearch,
  IconCheck,
  IconX,
  IconAlertCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import {
  PROFESSION_OPTIONS,
  parseStoredProfession,
} from "@/lib/data/education-profession-data";

export interface ProfessionComboboxProps {
  name?: string;
  id?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (val: string, details?: { profession: string; isCustom: boolean }) => void;
  required?: boolean;
  className?: string;
  error?: string | boolean;
  placeholder?: string;
}

export function ProfessionCombobox({
  name = "profession",
  id,
  defaultValue = "",
  value,
  onChange,
  required = false,
  className,
  error,
  placeholder = "Search or select your profession",
}: ProfessionComboboxProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const initialParsed = parseStoredProfession(value !== undefined ? value : defaultValue);

  const [selectedOption, setSelectedOption] = useState<string>(initialParsed.matchedOption);
  const [customProfession, setCustomProfession] = useState<string>(initialParsed.customText);
  const [searchTerm, setSearchTerm] = useState<string>(
    initialParsed.matchedOption === "Other"
      ? initialParsed.customText
      : initialParsed.matchedOption
  );

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsListRef = useRef<HTMLDivElement>(null);

  // Sync external controlled value or defaultValue updates
  useEffect(() => {
    const activeVal = value !== undefined ? value : defaultValue;
    if (activeVal !== undefined && activeVal !== null) {
      const parsed = parseStoredProfession(activeVal);
      setSelectedOption(parsed.matchedOption);
      setCustomProfession(parsed.customText);
      setSearchTerm(parsed.matchedOption === "Other" ? parsed.customText : parsed.matchedOption);
    }
  }, [value, defaultValue]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter professions based on search term
  const filteredProfessions = PROFESSION_OPTIONS.filter((prof) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    return prof.toLowerCase().includes(term);
  });

  const isCustomActive = selectedOption === "Other";

  // Final value to be submitted
  const finalValue = isCustomActive
    ? customProfession.trim()
    : selectedOption || searchTerm.trim();

  const notifyChange = (opt: string, customTxt: string) => {
    const computedVal = opt === "Other" ? customTxt.trim() : opt;
    if (onChange) {
      onChange(computedVal, {
        profession: computedVal,
        isCustom: opt === "Other",
      });
    }
  };

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    setIsOpen(false);
    setHighlightedIndex(-1);

    if (option === "Other") {
      setSearchTerm("Other");
      notifyChange("Other", customProfession);
    } else {
      setSearchTerm(option);
      setCustomProfession("");
      notifyChange(option, "");
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOption("");
    setCustomProfession("");
    setSearchTerm("");
    notifyChange("", "");
    searchInputRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredProfessions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredProfessions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredProfessions.length) {
        handleSelect(filteredProfessions[highlightedIndex]);
      } else if (filteredProfessions.length > 0) {
        handleSelect(filteredProfessions[0]);
      } else {
        handleSelect("Other");
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Auto scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionsListRef.current) {
      const activeElement = optionsListRef.current.children[highlightedIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className={cn("space-y-2 w-full", className)} ref={containerRef}>
      {/* Hidden inputs for form data compatibility */}
      <input
        type="hidden"
        name={name}
        id={inputId}
        value={finalValue}
        required={required}
      />
      {name !== "occupation" && (
        <input type="hidden" name="occupation" value={finalValue} />
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1">
          <span>Profession / Career</span>
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
        <p className="text-[11px] text-[var(--muted)] mb-1.5">
          Select the occupation that best describes your current work.
        </p>

        {/* Input Bar */}
        <div className="relative">
          <IconBriefcase
            className={cn(
              "pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
              selectedOption ? "text-[var(--primary)]" : "text-[var(--muted)]"
            )}
          />

          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedOption("");
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "focus-ring h-12 w-full rounded-xl border bg-white pl-10 pr-16 text-sm text-[var(--foreground)] outline-none transition",
              error
                ? "border-rose-300 ring-rose-100"
                : "border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--primary)]",
              isOpen && "border-[var(--primary)] ring-4 ring-[var(--primary)]/10"
            )}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={isOpen}
          />

          {/* Action buttons (Clear & Dropdown Toggle) */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                title="Clear profession"
              >
                <IconX className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsOpen(!isOpen);
                searchInputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <IconChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isOpen && "rotate-180 text-[var(--primary)]"
                )}
              />
            </button>
          </div>
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && (
          <div className="absolute left-0 right-0 mt-1.5 z-50 rounded-2xl border border-[var(--border)] bg-white/98 backdrop-blur-xl p-2 shadow-[0_16px_40px_rgba(40,10,20,0.14)] animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 border-b border-slate-100 flex items-center justify-between">
              <span>{searchTerm ? "Search Results" : "Common Professions"}</span>
              <span className="text-[10px]">Use ↑↓ to navigate</span>
            </div>

            <div
              ref={optionsListRef}
              className="max-h-60 overflow-y-auto space-y-0.5 pt-1 pr-0.5"
            >
              {filteredProfessions.length > 0 ? (
                filteredProfessions.map((prof, index) => {
                  const isSelected = selectedOption === prof;
                  const isHighlighted = highlightedIndex === index;
                  return (
                    <button
                      key={prof}
                      type="button"
                      onClick={() => handleSelect(prof)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={cn(
                        "w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition cursor-pointer",
                        isSelected
                          ? "bg-[#80132E] text-white font-semibold shadow-sm"
                          : isHighlighted
                          ? "bg-[#FDF2F4] text-[#80132E] font-medium"
                          : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <span className="truncate">{prof}</span>
                      {isSelected && <IconCheck className="h-3.5 w-3.5 shrink-0 text-white ml-2" />}
                    </button>
                  );
                })
              ) : (
                <div className="py-4 px-3 text-center text-xs text-slate-400">
                  <div>No matching occupations found</div>
                  <button
                    type="button"
                    onClick={() => handleSelect("Other")}
                    className="mt-2 text-xs font-semibold text-[#80132E] hover:underline cursor-pointer"
                  >
                    Select &ldquo;Other&rdquo; to enter custom profession
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom Profession Input when "Other" is chosen */}
      {isCustomActive && (
        <div className="pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Specify your specific job title or occupation:
          </label>
          <input
            type="text"
            value={customProfession}
            onChange={(e) => {
              const val = e.target.value;
              setCustomProfession(val);
              notifyChange("Other", val);
            }}
            required={required}
            placeholder="e.g. Bioinformatics Research Specialist, VFX Artist, Chef..."
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition"
          />
        </div>
      )}

      {/* Validation display */}
      {typeof error === "string" && error && (
        <div className="flex items-center gap-1 text-xs text-rose-500 mt-1">
          <IconAlertCircle className="h-3.5 w-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
