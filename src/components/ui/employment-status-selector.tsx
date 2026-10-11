"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import {
  IconBuildingStore,
  IconChevronDown,
  IconCheck,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { EMPLOYMENT_STATUS_OPTIONS } from "@/lib/data/education-profession-data";

export interface EmploymentStatusSelectorProps {
  name?: string;
  id?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (val: string) => void;
  required?: boolean;
  className?: string;
}

export function EmploymentStatusSelector({
  name = "employmentStatus",
  id,
  defaultValue = "",
  value,
  onChange,
  required = false,
  className,
}: EmploymentStatusSelectorProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const [selectedId, setSelectedId] = useState<string>(() => {
    const initial = value !== undefined ? value : defaultValue;
    const found = EMPLOYMENT_STATUS_OPTIONS.find(
      (opt) => opt.id === initial || opt.label.toLowerCase() === initial.toLowerCase()
    );
    return found ? found.id : initial || "";
  });
  const [customText, setCustomText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeVal = value !== undefined ? value : defaultValue;
    if (activeVal !== undefined && activeVal !== null) {
      const found = EMPLOYMENT_STATUS_OPTIONS.find(
        (opt) => opt.id === activeVal || opt.label.toLowerCase() === activeVal.toLowerCase()
      );
      if (found) {
        setSelectedId(found.id);
      } else if (activeVal) {
        setSelectedId("other");
        setCustomText(activeVal);
      } else {
        setSelectedId("");
        setCustomText("");
      }
    }
  }, [value, defaultValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentOption = EMPLOYMENT_STATUS_OPTIONS.find((opt) => opt.id === selectedId);

  const finalValue = selectedId === "other"
    ? customText.trim() || "Other"
    : currentOption ? currentOption.label : "";

  const handleSelect = (optId: string) => {
    setSelectedId(optId);
    setIsOpen(false);
    const chosen = EMPLOYMENT_STATUS_OPTIONS.find((o) => o.id === optId);
    const val = optId === "other" ? (customText.trim() || "Other") : (chosen ? chosen.label : "");
    if (onChange) {
      onChange(val);
    }
  };

  return (
    <div className={cn("space-y-1.5 w-full", className)} ref={containerRef}>
      <input
        type="hidden"
        name={name}
        id={inputId}
        value={finalValue}
        required={required}
      />

      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)]">
        <span>Employment Status</span>
        {required && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <p className="text-[11px] text-[var(--muted)] mb-1">
        Your current work or study status.
      </p>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "focus-ring h-12 w-full flex items-center justify-between rounded-xl border bg-white px-3.5 text-sm transition text-left cursor-pointer",
            "border-[var(--border)] hover:border-[var(--border-strong)] focus:border-[var(--primary)]",
            isOpen && "border-[var(--primary)] ring-4 ring-[var(--primary)]/10"
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2.5 truncate">
            <IconBuildingStore
              className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                currentOption ? "text-[var(--primary)]" : "text-[var(--muted)]"
              )}
            />
            <span
              className={cn(
                "truncate",
                currentOption
                  ? "font-semibold text-[var(--foreground)]"
                  : "text-[var(--muted-light)]"
              )}
            >
              {currentOption ? currentOption.label : "Select Employment Status"}
            </span>
          </div>

          <IconChevronDown
            className={cn(
              "h-4 w-4 text-[var(--muted)] shrink-0 transition-transform duration-200",
              isOpen && "rotate-180 text-[var(--primary)]"
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1.5 z-50 w-full rounded-2xl border border-[var(--border)] bg-white/98 backdrop-blur-xl p-1.5 shadow-[0_16px_40px_rgba(40,10,20,0.14)] animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto">
            <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
              Choose Employment Type
            </div>
            <div className="space-y-0.5 pt-1">
              {EMPLOYMENT_STATUS_OPTIONS.map((opt) => {
                const isSelected = selectedId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelect(opt.id)}
                    className={cn(
                      "w-full flex items-center justify-between rounded-xl px-3 py-2 text-left transition cursor-pointer",
                      isSelected
                        ? "bg-[#80132E] text-white shadow-sm font-semibold"
                        : "hover:bg-[#FDF2F4] text-slate-800 hover:text-[#80132E]"
                    )}
                  >
                    <div>
                      <div className="text-xs font-semibold leading-snug">
                        {opt.label}
                      </div>
                      <div
                        className={cn(
                          "text-[10px] mt-0.5",
                          isSelected ? "text-white/80" : "text-slate-400"
                        )}
                      >
                        {opt.description}
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

      {selectedId === "other" && (
        <div className="pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
            Specify employment situation:
          </label>
          <input
            type="text"
            value={customText}
            onChange={(e) => {
              const val = e.target.value;
              setCustomText(val);
              if (onChange) onChange(val);
            }}
            placeholder="e.g. Sabbatical, Family Enterprise, Freelance Consultant..."
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 transition"
          />
        </div>
      )}
    </div>
  );
}
