"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { IconChevronDown, IconCheck, IconSearch, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

export interface ModernSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface ModernSelectProps {
  value?: string | number | null;
  onChange: (value: string) => void;
  options: ModernSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  maxHeight?: string;
  icon?: React.ReactNode;
  label?: string;
  ariaLabel?: string;
  error?: string;
  name?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  searchable?: boolean;
}

export function ModernSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className,
  triggerClassName,
  menuClassName,
  maxHeight = "max-h-[175px]",
  icon,
  label,
  ariaLabel,
  error,
  name,
  required = false,
  size = "md",
  searchable = false,
}: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();

  // Reset or focus search when open state changes
  useEffect(() => {
    if (isOpen && searchable) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [isOpen, searchable]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  const normalizedValue = value !== undefined && value !== null ? String(value).trim() : "";

  const selectedOption =
    options.find((opt) => String(opt.value) === normalizedValue) ||
    options.find((opt) => String(opt.value).toLowerCase() === normalizedValue.toLowerCase());

  const sizeClasses = {
    sm: "h-10 px-3 text-xs rounded-xl",
    md: "h-12 px-3.5 text-sm rounded-xl",
    lg: "h-[52px] px-4 text-sm rounded-xl",
  };

  return (
    <div className={cn("relative w-full", className)}>
      {label && (
        <label
          htmlFor={generatedId}
          className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Hidden input for form support */}
      {name && <input type="hidden" name={name} value={normalizedValue} required={required} />}

      <div ref={containerRef} className={cn("relative w-full", isOpen && "z-30")}>
        <button
          ref={triggerRef}
          id={generatedId}
          type="button"
          disabled={disabled}
          aria-label={ariaLabel || label || (typeof placeholder === "string" ? placeholder : undefined)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center justify-between border border-slate-200 bg-white transition-all text-left select-none cursor-pointer",
            sizeClasses[size],
            "hover:border-[#80132E]/40 hover:bg-slate-50/50",
            disabled && "bg-slate-100/70 text-slate-400 cursor-not-allowed opacity-80",
            isOpen && "border-[#80132E] ring-4 ring-[#80132E]/10 bg-white shadow-sm",
            error && "border-rose-400 ring-rose-500/10",
            triggerClassName
          )}
        >
          <div className="flex items-center gap-2.5 truncate">
            {icon && <span className="text-[#80132E] shrink-0">{icon}</span>}
            {selectedOption ? (
              <div className="flex items-center gap-2 truncate">
                {selectedOption.icon && <span className="text-[#80132E] shrink-0">{selectedOption.icon}</span>}
                <span className="truncate text-slate-800 font-semibold">{selectedOption.label}</span>
              </div>
            ) : (
              <span className="truncate text-slate-400 font-normal">{placeholder}</span>
            )}
          </div>
          <IconChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200 shrink-0 ml-2 text-slate-400",
              isOpen && "rotate-180 text-[#80132E]"
            )}
          />
        </button>

        {isOpen && !disabled && (
          <div
            role="listbox"
            tabIndex={-1}
            className={cn(
              "absolute top-full left-0 right-0 mt-1.5 z-50 min-w-[200px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white/98 backdrop-blur-xl p-1.5 shadow-[0_16px_40px_rgba(40,10,20,0.14)] animate-in fade-in zoom-in-95 duration-150",
              menuClassName
            )}
          >
            {searchable && (
              <div className="p-1 pb-1.5 border-b border-slate-100 mb-1">
                <div className="relative">
                  <IconSearch className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search options..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#80132E] focus:bg-white text-slate-800 transition"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setIsOpen(false);
                        triggerRef.current?.focus();
                      }
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery("");
                        searchInputRef.current?.focus();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <IconX className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div
              className={cn(
                "modern-dropdown-scroll overflow-y-auto space-y-0.5 pr-1 overscroll-contain [scrollbar-width:thin] [scrollbar-color:#D8B28C_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#D8B28C] hover:[&::-webkit-scrollbar-thumb]:bg-[#7A1835]",
                maxHeight
              )}
            >
              {(() => {
                const query = searchQuery.toLowerCase().trim();
                const filtered = query
                  ? options.filter(
                      (opt) =>
                        opt.label.toLowerCase().includes(query) ||
                        (opt.description && opt.description.toLowerCase().includes(query)) ||
                        String(opt.value).toLowerCase().includes(query)
                    )
                  : options;

                if (filtered.length === 0) {
                  return (
                    <div className="py-4 px-2 text-center text-xs text-slate-400">
                      No matching options found
                    </div>
                  );
                }

                return filtered.map((opt) => {
                  const optVal = String(opt.value);
                  const isSelected =
                    optVal === normalizedValue ||
                    optVal.toLowerCase() === normalizedValue.toLowerCase();
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={opt.disabled}
                      onClick={() => {
                        if (opt.disabled) return;
                        onChange(opt.value);
                        setIsOpen(false);
                        triggerRef.current?.focus();
                      }}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left cursor-pointer",
                        opt.disabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
                        isSelected
                          ? "bg-[#80132E] text-white font-bold shadow-sm"
                          : "text-slate-700 hover:bg-[#FDF2F4] hover:text-[#80132E]"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {opt.icon && (
                          <span className={cn("shrink-0", isSelected ? "text-white" : "text-[#80132E]")}>
                            {opt.icon}
                          </span>
                        )}
                        <div className="truncate">
                          <div className="truncate">{opt.label}</div>
                          {opt.description && (
                            <div className={cn("text-[11px] font-normal truncate", isSelected ? "text-white/80" : "text-slate-500")}>
                              {opt.description}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && <IconCheck className="h-4 w-4 text-white shrink-0 ml-2" />}
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  );
}
