"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowRight,
  IconShieldCheck,
  IconChevronDown,
  IconHeart,
  IconSparkles,
  IconUser,
  IconPhone,
  IconCheck,
} from "@tabler/icons-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/cn";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const countryCodes = [
  { code: "+91", label: "India (+91)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+1", label: "USA/CA (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+966", label: "Saudi Arabia (+966)" },
  { code: "+974", label: "Qatar (+974)" },
  { code: "+61", label: "Australia (+61)" },
];

const profileForOptions = [
  { value: "Marriage", label: "Marriage" },
  { value: "Friendship", label: "Friendship" },
  { value: "Living Together", label: "Living Together" },
  { value: "Malayalam Matrimony", label: "Malayalam Matrimony" },
  { value: "Telugu Matrimony", label: "Telugu Matrimony" },
];

const createdByOptions = [
  { value: "Myself", label: "Myself" },
  { value: "By Parent", label: "By Parent" },
  { value: "By Sibling", label: "By Sibling" },
  { value: "By Cousin", label: "By Cousin" },
  { value: "By Relative", label: "By Relative" },
  { value: "By Friend", label: "By Friend" },
];

const genderOptions = [
  { value: "Female", label: "Female" },
  { value: "Male", label: "Male" },
];

// Modern Custom Dropdown Component
function ModernSelect({
  value,
  onChange,
  options,
  disabled = false,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "focus-ring h-[52px] w-full flex items-center justify-between rounded-xl border border-[var(--border)] px-3.5 py-3 text-sm font-medium transition text-left select-none cursor-pointer",
          disabled
            ? "bg-[var(--surface-muted)]/80 text-[var(--muted-strong)] cursor-not-allowed opacity-80"
            : "bg-[var(--surface-muted)]/40 text-[var(--foreground)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]/60",
          isOpen && "border-[var(--primary)] ring-4 ring-[var(--primary)]/10"
        )}
      >
        <span className="truncate">{selectedOption?.label || value}</span>
        <IconChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200 shrink-0 ml-2",
            disabled ? "text-[var(--muted)]/50" : "text-[var(--muted)]",
            isOpen && "rotate-180 text-[var(--primary)]"
          )}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 min-w-[200px] overflow-hidden rounded-2xl border border-[var(--border)] bg-white/98 backdrop-blur-xl p-1.5 shadow-[0_16px_40px_rgba(40,10,20,0.14)] animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer",
                    isSelected
                      ? "bg-[var(--primary-light)]/90 text-[var(--primary)] font-bold shadow-2xs"
                      : "text-[var(--foreground)] hover:bg-[var(--surface-muted)] hover:text-[var(--primary)]"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <IconCheck className="h-4 w-4 text-[var(--primary)] shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Modern Country Code Dropdown
function ModernCountrySelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { code: string; label: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={containerRef} className="relative w-20 sm:w-22 shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "focus-ring h-[52px] w-full flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/40 px-2.5 py-3 text-xs font-bold text-[var(--foreground)] transition hover:border-[var(--border-strong)] cursor-pointer",
          isOpen && "border-[var(--primary)] ring-4 ring-[var(--primary)]/10"
        )}
      >
        <span>{value}</span>
        <IconChevronDown
          className={cn(
            "h-3.5 w-3.5 text-[var(--muted)] transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-[var(--primary)]"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-52 overflow-hidden rounded-2xl border border-[var(--border)] bg-white/98 backdrop-blur-xl p-1.5 shadow-[0_16px_40px_rgba(40,10,20,0.14)] animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
            {options.map((opt) => {
              const isSelected = opt.code === value;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    onChange(opt.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer",
                    isSelected
                      ? "bg-[var(--primary-light)]/90 text-[var(--primary)] font-bold shadow-2xs"
                      : "text-[var(--foreground)] hover:bg-[var(--surface-muted)] hover:text-[var(--primary)]"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <IconCheck className="h-3.5 w-3.5 text-[var(--primary)] shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function QuickRegisterSection() {
  const router = useRouter();
  const [profileFor, setProfileFor] = useState("Marriage");
  const [createdBy, setCreatedBy] = useState("Myself");
  const [gender, setGender] = useState("Female");
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isByLocked = profileFor === "Friendship" || profileFor === "Living Together";

  const handleProfileForChange = (value: string) => {
    setProfileFor(value);
    if (value === "Friendship" || value === "Living Together") {
      setCreatedBy("Myself");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter your full name");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 8) {
      setError("Please enter a valid mobile number");
      return;
    }

    const fullPhone = `${countryCode} ${cleanPhone}`;
    const paramsObj: Record<string, string> = {
      name: trimmedName,
      phone: fullPhone,
      profileFor,
      category: profileFor,
      gender,
      createdBy: isByLocked ? "Myself" : createdBy,
    };

    const params = new URLSearchParams(paramsObj);

    toast.info("Starting Registration", `Welcome, ${trimmedName}! Taking you to account setup.`);
    router.push(`/register?${params.toString()}`);
  };

  return (
    <section
      id="quick-register"
      className="scroll-mt-8 sm:scroll-mt-16 relative py-12 sm:py-16 lg:py-20 border-y border-[var(--border)] bg-transparent"
    >
      {/* Background Romantic Photo Collage with repeated/tiled pattern and luxury atmospheric overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="h-full w-full bg-repeat bg-center opacity-90 blur-[2.5px] scale-[1.02]"
          style={{
            backgroundImage: "url('/registerFormBg.webp'), url('/registerFormBg.png')",
            backgroundSize: "440px auto",
          }}
        />
        {/* Soft atmospheric overlay for readability with high background visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/25 to-white/45" />
      </div>

      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-24 left-1/3 h-[28rem] w-[28rem] rounded-full bg-[var(--primary)]/5 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 right-1/3 h-[28rem] w-[28rem] rounded-full bg-[var(--accent)]/10 blur-3xl"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 space-y-3">
          <ScrollReveal staggerClass="stagger-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-white/95 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-[var(--primary)] shadow-sm">
              <IconHeart className="h-3.5 w-3.5 fill-current" />
              <span>The Biggest & Most Trusted Matrimony Service</span>
            </div>
          </ScrollReveal>

          <ScrollReveal staggerClass="stagger-2">
            <div className="inline-block rounded-2xl bg-white/90 backdrop-blur-md border border-white/60 px-5 py-2 shadow-sm">
              <p className="text-sm sm:text-base font-semibold text-[var(--foreground)]">
                Now find verified matches based on your hobbies, values, and shared interests.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Horizontal Registration Card */}
        <ScrollReveal className="mx-auto max-w-[1380px]" staggerClass="stagger-3">
          <div className="relative rounded-3xl border border-[var(--border)] bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(122,20,40,0.10)]">
            {/* Top Micro-Header Banner */}
            <div className="rounded-t-3xl bg-gradient-to-r from-[#7A1428] via-[#8C1D33] to-[#7A1428] px-6 sm:px-8 py-3.5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconSparkles className="h-4 w-4 text-[var(--accent)]" />
                <span className="font-editorial-title text-sm sm:text-base font-bold tracking-wide">
                  Create a Profile
                </span>
              </div>
              <span className="hidden sm:inline-block text-xs font-medium text-white/85">
                100% Verified Profiles & Privacy Protection
              </span>
            </div>

            {/* Form Fields: Single Horizontal Row on Desktop */}
            <form onSubmit={handleSubmit} className="p-8 sm:p-10 lg:p-11">
              {error && (
                <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_0.8fr_0.75fr_1.15fr_1.65fr_1fr] gap-4 sm:gap-5 items-end">
                {/* 1. Profile Created For */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
                    Profile created for
                  </label>
                  <ModernSelect
                    value={profileFor}
                    onChange={handleProfileForChange}
                    options={profileForOptions}
                  />
                </div>

                {/* 2. Created By field */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                      Created By
                    </label>
                    {isByLocked && (
                      <span className="text-[10px] text-[var(--muted)] font-medium">
                        (Self only)
                      </span>
                    )}
                  </div>
                  <ModernSelect
                    value={isByLocked ? "Myself" : createdBy}
                    disabled={isByLocked}
                    onChange={setCreatedBy}
                    options={isByLocked ? [{ value: "Myself", label: "Myself" }] : createdByOptions}
                  />
                </div>

                {/* 3. Gender */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
                    Gender
                  </label>
                  <ModernSelect
                    value={gender}
                    onChange={setGender}
                    options={genderOptions}
                  />
                </div>

                {/* 4. Full Name */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
                    Enter the name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Anand Menon"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError(null);
                      }}
                      className="focus-ring h-[52px] w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-3 pl-9 text-sm font-medium text-[var(--foreground)] placeholder:text-[var(--muted)] transition hover:border-[var(--border-strong)]"
                    />
                    <IconUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                  </div>
                </div>

                {/* 5. Mobile Number */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    <ModernCountrySelect
                      value={countryCode}
                      onChange={setCountryCode}
                      options={countryCodes}
                    />

                    <div className="relative flex-1">
                      <input
                        type="tel"
                        placeholder="Enter mobile number"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (error) setError(null);
                        }}
                        className="focus-ring h-[52px] w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-3 pl-9 text-sm font-medium text-[var(--foreground)] placeholder:text-[var(--muted)] transition hover:border-[var(--border-strong)]"
                      />
                      <IconPhone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                    </div>
                  </div>
                </div>

                {/* 6. Submit CTA Button */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <span className="hidden lg:block text-[11px] font-bold uppercase tracking-wider text-transparent mb-2 select-none">
                    Submit
                  </span>
                  <button
                    type="submit"
                    className="focus-ring group h-[52px] w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-deep)] text-white px-4 font-bold text-sm sm:text-base shadow-[0_10px_25px_var(--primary-shadow-strong)] transition-all duration-200 active-press cursor-pointer whitespace-nowrap"
                  >
                    <span>Let's Begin</span>
                    <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

              {/* Bottom Footer Info: Disclaimer & Trust */}
              <div className="mt-7 pt-4 border-t border-[var(--border)]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[var(--muted)]">
                <p>
                  *By clicking Let's Begin, I agree to the{" "}
                  <Link href="/terms" className="underline hover:text-[var(--primary)]">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline hover:text-[var(--primary)]">
                    Privacy Policy
                  </Link>
                </p>

                <div className="flex items-center gap-1.5 text-[var(--muted-strong)] font-medium">
                  <IconShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>100% Privacy & Verification Guarantee</span>
                </div>
              </div>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
