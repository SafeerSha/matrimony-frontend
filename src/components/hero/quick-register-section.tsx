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
  IconLoader2,
  IconUsers,
  IconHomeHeart,
  IconMapPin,
  IconUserHeart,
  IconLock,
} from "@tabler/icons-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/cn";
import { authService } from "@/services";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const profileForOptions = [
  { value: "Marriage", label: "Marriage" },
  { value: "Friendship", label: "Friendship" },
  { value: "Living Together", label: "Living Together" },
];

const lookingInOptions = [
  { value: "Kerala", label: "Kerala Community" },
  { value: "Telugu", label: "Telugu Community" },
];

const createdByOptions = [
  { value: "Myself", label: "Myself" },
  { value: "By Parent", label: "By Parent" },
  { value: "By Sibling", label: "By Sibling" },
  { value: "By Cousin", label: "By Cousin" },
  { value: "By Relative", label: "By Relative" },
  { value: "By Friend", label: "By Friend" },
];

import { ModernSelect } from "@/components/ui/modern-select";


export function QuickRegisterSection() {
  const router = useRouter();
  const [profileFor, setProfileFor] = useState("Marriage");
  const [lookingIn, setLookingIn] = useState("Kerala");
  const [createdBy, setCreatedBy] = useState("Myself");
  const [gender, setGender] = useState("Female");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qPhone = params.get("phone");
      const qName = params.get("name");
      if (qPhone) setPhone(qPhone);
      if (qName) setName(qName);
    }
  }, []);

  useEffect(() => {
    const handleCategorySelect = (e: Event) => {
      const customEvent = e as CustomEvent<{ category: string }>;
      if (customEvent.detail?.category) {
        const cat = customEvent.detail.category;
        const normalized =
          cat === "Living-together" || cat === "living_together" ? "Living Together" : cat;
        setProfileFor(normalized);
        if (normalized === "Friendship" || normalized === "Living Together") {
          setCreatedBy("Myself");
        }
      }
    };

    window.addEventListener("ishtam:select-category", handleCategorySelect);
    return () => {
      window.removeEventListener("ishtam:select-category", handleCategorySelect);
    };
  }, []);

  const isByLocked = profileFor === "Friendship" || profileFor === "Living Together";

  const handleProfileForChange = (value: string) => {
    setProfileFor(value);
    if (value === "Friendship" || value === "Living Together") {
      setCreatedBy("Myself");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter your full name");
      return;
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    const fullPhone = `+91 ${cleanPhone}`;
    const finalCreatedBy = isByLocked ? "Myself" : createdBy;
    const isCreatedByMyself = finalCreatedBy.trim().toLowerCase() === "myself";

    // Auto-fill gender ONLY when created by "Myself":
    // If Looking For Female (Bride) -> User's own gender is Male
    // If Looking For Male (Groom) -> User's own gender is Female
    // If created by Parent / Sibling / Relative, do NOT auto-fill gender (leave undefined for manual selection)
    const derivedUserGender = isCreatedByMyself
      ? (gender === "Female" ? "male" : "female")
      : undefined;

    const payload = {
      name: trimmedName,
      phone: fullPhone,
      profileFor,
      category: profileFor,
      gender: derivedUserGender,
      lookingFor: gender,
      createdBy: finalCreatedBy,
      ...(profileFor === "Marriage" ? { lookingIn } : {}),
    };

    setIsSubmitting(true);

    try {
      await authService.quickRegister(payload);
      // Trigger mobile verification code in background
      authService.sendOtp(fullPhone).catch(() => {});

      toast.info(
        "Verification Code Sent",
        `We've sent a 6-digit verification code to ${fullPhone}.`
      );
      router.push("/verify");
    } catch (err: any) {
      if (err?.status === 409) {
        setError("An account with this mobile number already exists. Please sign in.");
        toast.warning("Account exists", "Please sign in to access your profile.");
        setIsSubmitting(false);
        return;
      }
      // If network/endpoint is in progress, local draft is stored in sessionStorage
      console.warn("Backend notice (proceeding with local draft):", err);
      authService.sendOtp(fullPhone).catch(() => {});
      toast.info(
        "Verification Code Sent",
        `Please verify your mobile number to continue.`
      );
      router.push("/verify");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="quick-register"
      className="scroll-mt-8 sm:scroll-mt-16 relative py-12 sm:py-16 lg:py-20 border-y border-[var(--border)] bg-transparent"
    >
      {/* Romantic Photo Collage Background with repeated/tiled pattern */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="h-full w-full bg-repeat bg-center opacity-60 blur-[1px] sm:blur-[2px] scale-[1.01]"
          style={{
            backgroundImage: "url('/registerFormBg.webp'), url('/registerFormBg.png')",
            backgroundSize: "440px auto",
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        />
        {/* Soft atmospheric overlay for high text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/65 to-white/85" />
      </div>

      {/* Decorative ambient background glows */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-24 left-1/3 hidden sm:block h-[28rem] w-[28rem] rounded-full bg-[var(--primary)]/6 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 right-1/3 hidden sm:block h-[28rem] w-[28rem] rounded-full bg-[#D4AF37]/10 blur-3xl"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
        {/* Integrated Section Header with Frosted Glass Plate for Crystal-Clear Visibility */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          <ScrollReveal>
            <div className="inline-flex flex-col items-center rounded-3xl bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_10px_30px_rgba(92,16,39,0.08)] px-5 sm:px-8 py-4 sm:py-5 space-y-2.5">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D89B65]/40 bg-[#FAF3EC] px-3.5 py-1 text-[10px] sm:text-xs font-bold text-[#8C5D2C] shadow-2xs">
                <IconSparkles className="h-3.5 w-3.5 text-[#D89B65]" />
                <span>The Most Trusted Matrimony & Matchmaking Network</span>
              </div>

              <h2 className="font-editorial-title text-[28px] sm:text-3xl lg:text-4xl font-black text-[#5C1027] tracking-tight">
                Begin Your{" "}
                <span className="bg-gradient-to-r from-[#A86E38] via-[#C98B50] to-[#8C5523] bg-clip-text text-transparent">
                  Story
                </span>
              </h2>

              <p className="text-xs sm:text-sm font-semibold text-slate-700 max-w-md">
                Discover verified matches curated for your community, values, and shared interests.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* The Luxury Matchmaker Bar Card */}
        <ScrollReveal className="mx-auto max-w-[1240px]">
          <div className="relative rounded-3xl border border-[#EAD8C7]/70 hover:border-[#D89B65]/60 bg-white/95 backdrop-blur-2xl shadow-[0_24px_70px_rgba(128,19,46,0.12)] p-4 sm:p-7 lg:p-8 transition-colors duration-300">
            {/* Top Deck: Intent Tabs + Verified Pill (Zero Horizontal Overflow) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 sm:pb-5 mb-4 sm:mb-5 border-b border-slate-100">
              <div className="w-full lg:w-auto">
                <div className="grid grid-cols-3 gap-1 sm:gap-2 w-full sm:w-auto sm:inline-flex sm:items-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden lg:inline">
                    Seeking:
                  </span>
                  {profileForOptions.map((opt) => {
                    const isSelected = profileFor === opt.value;
                    const IconComp =
                      opt.value === "Marriage"
                        ? IconHeart
                        : opt.value === "Friendship"
                        ? IconUsers
                        : IconHomeHeart;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleProfileForChange(opt.value)}
                        className={cn(
                          "flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs md:text-sm font-semibold transition-all cursor-pointer border text-center select-none",
                          isSelected
                            ? "bg-[#80132E] text-white border-[#80132E] shadow-sm shadow-[#80132E]/25 font-bold"
                            : "bg-slate-50 text-slate-700 border-slate-200/70 hover:bg-[#FDF2F4] hover:text-[#80132E] hover:border-[#80132E]/30"
                        )}
                      >
                        <IconComp className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0", isSelected ? "text-white" : "text-[#80132E]")} />
                        {opt.value === "Living Together" ? (
                          <>
                            <span className="hidden sm:inline">Living Together</span>
                            <span className="sm:hidden">Live-in</span>
                          </>
                        ) : (
                          <span>{opt.label}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Verified Trust Pill */}
              {/* <div className="inline-flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50/90 border border-emerald-200/70 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full w-full sm:w-auto text-center self-center lg:self-auto">
                <IconShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>100% Verified Profiles & Privacy Protection</span>
              </div> */}
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 animate-in fade-in">
                  {error}
                </div>
              )}

              {/* Row 1: Match Criteria (1-Tap Chips & Selectors) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 items-end">
                {/* 1. Looking For (Interactive 1-Tap Bride / Groom Chips) */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Looking For
                  </label>
                  <div className="h-[52px] p-1 rounded-xl bg-slate-100/80 border border-slate-200/80 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setGender("Female")}
                      className={cn(
                        "flex-1 h-full rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                        gender === "Female"
                          ? "bg-[#80132E] text-white shadow-sm font-bold scale-[1.01] ring-1 ring-[#D89B65]/40"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                      )}
                    >
                      <span>{profileFor === "Marriage" ? "👰 Bride" : "👩 Female"}</span>
                      {gender === "Female" && <IconCheck className="h-3.5 w-3.5 text-[#F9E2B2]" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("Male")}
                      className={cn(
                        "flex-1 h-full rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                        gender === "Male"
                          ? "bg-[#80132E] text-white shadow-sm font-bold scale-[1.01] ring-1 ring-[#D89B65]/40"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                      )}
                    >
                      <span>{profileFor === "Marriage" ? "🤵 Groom" : "👨 Male"}</span>
                      {gender === "Male" && <IconCheck className="h-3.5 w-3.5 text-[#F9E2B2]" />}
                    </button>
                  </div>
                </div>

                {/* 2. Community / Region (Shown for Marriage, or auto-adapts) */}
                {profileFor === "Marriage" && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Community
                    </label>
                    <ModernSelect
                      value={lookingIn}
                      onChange={setLookingIn}
                      options={lookingInOptions}
                      icon={<IconMapPin className="h-4 w-4 text-[#C58F5A]" />}
                    />
                  </div>
                )}

                {/* 3. Profile Created By */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Profile Created By
                    </label>
                    {isByLocked && (
                      <span className="text-[10px] text-slate-400 font-medium inline-flex items-center gap-0.5">
                        <IconLock className="h-2.5 w-2.5" /> Self only
                      </span>
                    )}
                  </div>
                  <ModernSelect
                    value={isByLocked ? "Myself" : createdBy}
                    disabled={isByLocked}
                    onChange={setCreatedBy}
                    options={isByLocked ? [{ value: "Myself", label: "Myself" }] : createdByOptions}
                    icon={<IconUserHeart className="h-4 w-4 text-[#C58F5A]" />}
                  />
                </div>
              </div>

              {/* Row 2: Personal Details & Instant Submission */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 sm:gap-4 items-end pt-1">
                {/* 4. Full Name (5 cols on lg) */}
                <div className="lg:col-span-5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Your Full Name
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
                      className="focus-ring h-[52px] w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-3 pl-10 text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal transition hover:border-[#D89B65]/50 focus:border-[#80132E]"
                    />
                    <IconUser className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* 5. Mobile Number (4 cols on lg) */}
                <div className="lg:col-span-4">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative flex items-center">
                    <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pr-2.5 border-r border-slate-200 select-none">
                      <span className="text-sm font-bold text-[#80132E]">+91</span>
                    </div>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setPhone(val);
                        if (error) setError(null);
                      }}
                      className="focus-ring h-[52px] w-full rounded-xl border border-slate-200/90 bg-white py-3 pl-16 pr-9 text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal transition hover:border-[#D89B65]/50 focus:border-[#80132E]"
                    />
                    <IconPhone className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                {/* 6. Primary CTA Button (3 cols on lg) */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="focus-ring group relative h-[52px] w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#80132E] via-[#941c38] to-[#80132E] hover:from-[#6c1027] hover:to-[#7a142c] text-white px-5 font-bold text-sm sm:text-base shadow-[0_12px_28px_rgba(128,19,46,0.28)] border border-[#D89B65]/40 transition-all duration-200 active-press cursor-pointer whitespace-nowrap disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                        <span>Creating Profile...</span>
                      </>
                    ) : (
                      <>
                        <span>Let&apos;s Begin</span>
                        <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 text-[#F9E2B2]" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Bottom Footer Disclaimers & Micro-Guarantees */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-2.5 text-[11px] text-slate-500">
                <p className="text-center md:text-left">
                  By clicking Let&apos;s Begin, you agree to our{" "}
                  <Link href="/terms" className="underline hover:text-[#80132E]">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline hover:text-[#80132E]">
                    Privacy Policy
                  </Link>.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[11px] font-semibold text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="text-emerald-600 font-bold">✓</span> Free Registration
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-emerald-600 font-bold">✓</span> 100% Privacy-First
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-emerald-600 font-bold">✓</span> Verified Profiles
                  </span>
                </div>
              </div>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

