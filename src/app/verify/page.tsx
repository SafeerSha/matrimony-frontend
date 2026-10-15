"use client";

import { useState, useEffect } from "react";
import IconPhoto from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowRight,
  IconArrowLeft,
  IconLoader2,
  IconHeart,
  IconPhone,
  IconMail,
  IconCircleCheck,
  IconShieldCheck,
  IconRefresh,
  IconEdit,
} from "@tabler/icons-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/cn";
import { authService, resolvePostAuthRoute } from "@/services";
import { toast } from "@/lib/toast";

export default function VerifyPage() {
  const router = useRouter();

  // User details from draft or session
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // OTP states
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");

  // Resend cooldown timers
  const [phoneTimer, setPhoneTimer] = useState(30);
  const [emailTimer, setEmailTimer] = useState(30);
  const [isResendingPhone, setIsResendingPhone] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load registered draft info on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("shaadi_onboarding_draft");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.name) setName(parsed.name);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.email) setEmail(parsed.email);
        }
      } catch (err) {
        console.warn("Could not read local draft:", err);
      }

      // Check URL search parameters as fallback
      const params = new URLSearchParams(window.location.search);
      if (params.get("phone")) setPhone(params.get("phone")!);
      if (params.get("email")) setEmail(params.get("email")!);
      if (params.get("name")) setName(params.get("name")!);
    }
  }, []);

  // Cooldown countdowns
  useEffect(() => {
    if (phoneTimer > 0) {
      const timer = setTimeout(() => setPhoneTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneTimer]);

  useEffect(() => {
    if (emailTimer > 0) {
      const timer = setTimeout(() => setEmailTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailTimer]);

  // Resend Phone OTP
  const handleResendPhoneOtp = async () => {
    if (phoneTimer > 0 || isResendingPhone) return;
    setIsResendingPhone(true);
    try {
      await authService.sendOtp(phone || "+91 98765 43210");
      setPhoneTimer(30);
      toast.info("SMS Code Resent", `We've sent a new 6-digit code to ${phone || "your mobile"}`);
    } catch (err: any) {
      toast.error("Failed to resend SMS", err.message || "Please try again later.");
    } finally {
      setIsResendingPhone(false);
    }
  };

  // Resend Email OTP
  const handleResendEmailOtp = async () => {
    if (!email || emailTimer > 0 || isResendingEmail) return;
    setIsResendingEmail(true);
    try {
      await authService.sendEmailOtp(email);
      setEmailTimer(30);
      toast.info("Email Code Resent", `We've sent a new 6-digit code to ${email}`);
    } catch (err: any) {
      toast.error("Failed to resend email", err.message || "Please try again later.");
    } finally {
      setIsResendingEmail(false);
    }
  };

  // Submit Verification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const cleanPhoneOtp = phoneOtp.trim();
    const cleanEmailOtp = emailOtp.trim();

    if (cleanPhoneOtp.length !== 6) {
      setIsLoading(false);
      setErrorMessage("Please enter the complete 6-digit mobile verification code.");
      return;
    }

    if (email && cleanEmailOtp.length !== 6) {
      setIsLoading(false);
      setErrorMessage("Please enter the complete 6-digit email verification code.");
      return;
    }

    try {
      const res = await authService.verifyRegistration({
        phone: phone || "+91 9876543210",
        phoneOtp: cleanPhoneOtp,
        email: email || undefined,
        emailOtp: email ? cleanEmailOtp : undefined,
      });

      const { url, isDraft } = resolvePostAuthRoute(res, "/app/discover");

      if (isDraft) {
        toast.flash(
          "info",
          "Complete Your Profile",
          "Please finish setting up your profile to start exploring compatible matches."
        );
      } else {
        toast.flash(
          "success",
          "Verification Successful!",
          "Your contact details have been verified. Welcome to IshtamChat!"
        );
      }

      setTimeout(() => {
        router.push(url);
      }, 500);
    } catch (err: any) {
      const msg = err.message || "Verification code is invalid or has expired.";
      setErrorMessage(msg);
      toast.error("Verification failed", msg);
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[var(--background)] p-0 sm:p-6 lg:p-8 flex flex-col sm:items-center sm:justify-center">
      {/* 1. Subtle Botanical Leaf Corner Accents */}
      <div
        className="pointer-events-none absolute top-0 left-0 z-0 origin-top-left -translate-x-[6%] -translate-y-[8%] opacity-60 sm:opacity-75 lg:opacity-85 hidden sm:block"
        aria-hidden="true"
      >
        <div className="relative aspect-[3/2] w-36 sm:w-44 md:w-56 lg:w-72 drop-shadow-[0_12px_24px_rgba(10,50,30,0.12)] animate-botanical-float-left">
          <IconPhoto
            src="/images/green-leaves.png"
            alt=""
            width={576}
            height={384}
            priority
            quality={85}
            className="h-full w-full object-contain object-top-left"
          />
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 right-0 z-0 origin-bottom-right translate-x-[6%] translate-y-[8%] opacity-60 sm:opacity-75 lg:opacity-85 hidden sm:block"
        aria-hidden="true"
      >
        <div className="animate-botanical-float-right">
          <div
            className="relative aspect-square w-36 sm:w-44 md:w-56 lg:w-72 drop-shadow-[0_12px_24px_rgba(200,60,90,0.12)]"
            style={{
              transform: "scaleX(-1) rotate(-15deg)",
              transformOrigin: "center center",
            }}
          >
            <IconPhoto
              src="/images/pink-cherry.png"
              alt=""
              width={576}
              height={576}
              quality={85}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* 2. Soft Ambient Background Glows */}
      <div
        className="pointer-events-none absolute -top-24 left-1/4 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(16,133,96,0.08)_0%,transparent_70%)] blur-3xl hidden sm:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 right-1/4 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(217,163,89,0.06)_0%,transparent_70%)] blur-3xl hidden sm:block"
        aria-hidden="true"
      />

      {/* 3. Verification Container Card */}
      <div className="relative z-10 w-full min-h-[100dvh] sm:min-h-0 sm:max-w-xl lg:max-w-5xl rounded-none sm:rounded-[2.5rem] border-0 sm:border sm:border-[var(--border)] bg-white shadow-none sm:shadow-[0_24px_70px_var(--hero-shadow)] overflow-hidden flex flex-col justify-between">
        <div className="flex flex-col flex-1 lg:grid lg:grid-cols-[0.42fr_0.58fr] sm:min-h-[580px] lg:min-h-[660px]">
          {/* PHOTO BANNER (Left column on desktop) */}
          <div className="relative flex flex-col justify-between overflow-hidden bg-[var(--surface-muted)] p-4 sm:p-7 lg:p-8 order-1 lg:order-1 flex-1 min-h-[160px] sm:min-h-[300px] lg:min-h-full">
            <div className="absolute inset-0 z-0">
              <IconPhoto
                src="/images/heritage-palace-courtyard.jpg"
                alt="Sunlit Rajasthan heritage palace courtyard with bougainvillea"
                fill
                priority
                quality={92}
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover object-[center_35%]"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15 hidden lg:block"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-[var(--primary)]/15 mix-blend-multiply hidden lg:block"
                aria-hidden="true"
              />
              <div
                className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 via-black/25 to-transparent lg:hidden z-[1]"
                aria-hidden="true"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent via-white/45 via-40% to-white lg:hidden z-[1]"
                aria-hidden="true"
              />
            </div>

            {/* Top Brand & Header */}
            <div className="relative z-10 flex items-center justify-between pt-1 sm:pt-0">
              <Logo
                lightOnMobile={true}
                showTagline={true}
                blurredBg={true}
                className="scale-90 sm:scale-100 origin-left"
              />
              <Link
                href="/#quick-register"
                className="inline-flex lg:hidden text-xs font-semibold text-white/95 hover:text-white bg-black/40 hover:bg-black/55 backdrop-blur-md border border-white/25 rounded-full px-3.5 py-1.5 transition shadow-sm items-center gap-1.5 active:scale-95"
              >
                <IconArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Back</span>
              </Link>
            </div>

            {/* Editorial Quote */}
            <div className="relative z-10 mt-auto pt-8 sm:pt-12 hidden lg:block">
              <div className="mb-2.5 sm:mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-amber-200/90">
                <IconShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                100% Verified Profiles
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-white tracking-tight">
                Trust begins with <br />
                <span className="font-semibold text-amber-100">genuine verification.</span>
              </h2>
              <p className="mt-2 sm:mt-2.5 max-w-sm text-xs sm:text-sm leading-relaxed text-white/80">
                We verify every phone number and email to keep our matrimonial community authentic,
                respectful, and spam-free.
              </p>
            </div>
          </div>

          {/* VERIFICATION FORM BODY */}
          <div className="shrink-0 px-6 pt-5 pb-6 sm:p-8 lg:p-10 order-2 lg:order-2 bg-white -mt-8 sm:-mt-10 lg:mt-0 rounded-t-[2.25rem] sm:rounded-none relative z-10 shadow-[0_-16px_36px_rgba(0,0,0,0.08)] sm:shadow-none lg:flex lg:flex-col lg:justify-between">
            <div className="w-full">
              {/* Desktop back link */}
              <div className="hidden lg:flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                  <IconCircleCheck className="h-3.5 w-3.5" />
                  {email ? "Two-Step Verification" : "Mobile Verification"}
                </span>
                <Link
                  href="/#quick-register"
                  className="text-xs sm:text-sm font-medium text-[var(--muted)] hover:text-[var(--primary)] transition-colors focus-ring rounded-lg px-2 py-1 inline-flex items-center gap-1"
                >
                  <IconArrowLeft className="h-3.5 w-3.5" /> Change details
                </Link>
              </div>

              {/* Header Title */}
              <div className="mt-2 sm:mt-4 mb-4 sm:mb-5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                  Verify your account
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  {name ? `Welcome ${name}! ` : ""}Please enter the 6-digit verification code sent
                  to {email ? "your mobile and email address." : `your mobile number (${phone || "mobile"}).`}
                </p>
              </div>

              {/* Status Banner */}
              <div className="mb-5 p-3 sm:p-3.5 rounded-xl border border-[var(--border)] bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-[var(--muted-strong)] font-medium inline-flex items-center gap-1.5">
                    <IconPhone className="h-3.5 w-3.5 text-[var(--primary)]" />
                    Mobile:
                  </span>
                  <span className="font-semibold text-[var(--foreground)] tracking-wide">
                    {phone || "+91 98765 43210"}
                  </span>
                </div>
                {email && (
                  <div className="flex items-center justify-between text-xs sm:text-sm border-t border-[var(--border)]/60 pt-2">
                    <span className="text-[var(--muted-strong)] font-medium inline-flex items-center gap-1.5">
                      <IconMail className="h-3.5 w-3.5 text-[var(--primary)]" />
                      Email:
                    </span>
                    <span className="font-semibold text-[var(--foreground)] truncate max-w-[200px] sm:max-w-[280px]">
                      {email}
                    </span>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs sm:text-sm text-red-700"
                >
                  {errorMessage}
                </div>
              )}

              {/* Verification Form */}
              <form onSubmit={handleVerify} className="space-y-4 sm:space-y-5">
                {/* 1. Mobile OTP Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="phoneOtp"
                      className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)]"
                    >
                      Mobile Verification Code (SMS)
                    </label>
                    <button
                      type="button"
                      onClick={handleResendPhoneOtp}
                      disabled={phoneTimer > 0 || isResendingPhone}
                      className="text-xs font-medium text-[var(--primary)] hover:underline disabled:opacity-50 disabled:no-underline inline-flex items-center gap-1"
                    >
                      {phoneTimer > 0 ? (
                        <span>Resend in {phoneTimer}s</span>
                      ) : (
                        <>
                          <IconRefresh className="h-3 w-3" />
                          <span>Resend SMS</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="phoneOtp"
                      type="text"
                      required
                      maxLength={6}
                      value={phoneOtp}
                      onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 6-digit SMS OTP"
                      className="h-12 sm:h-13 w-full rounded-xl border border-[var(--border)] bg-slate-50/70 px-4 text-center text-lg sm:text-xl tracking-[0.4em] font-medium text-[var(--foreground)] outline-none transition-all duration-200 focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                    />
                  </div>
                </div>

                {/* 2. Email OTP Field (Rendered if email was provided) */}
                {email && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="emailOtp"
                        className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)]"
                      >
                        Email Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={handleResendEmailOtp}
                        disabled={emailTimer > 0 || isResendingEmail}
                        className="text-xs font-medium text-[var(--primary)] hover:underline disabled:opacity-50 disabled:no-underline inline-flex items-center gap-1"
                      >
                        {emailTimer > 0 ? (
                          <span>Resend in {emailTimer}s</span>
                        ) : (
                          <>
                            <IconRefresh className="h-3 w-3" />
                            <span>Resend Email</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="emailOtp"
                        type="text"
                        required
                        maxLength={6}
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter 6-digit Email OTP"
                        className="h-12 sm:h-13 w-full rounded-xl border border-[var(--border)] bg-slate-50/70 px-4 text-center text-lg sm:text-xl tracking-[0.4em] font-medium text-[var(--foreground)] outline-none transition-all duration-200 focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                      />
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={
                      isLoading ||
                      phoneOtp.length !== 6 ||
                      (!!email && emailOtp.length !== 6)
                    }
                    className={cn(
                      "group focus-ring inline-flex h-12 sm:h-13 w-full items-center justify-center gap-2",
                      "rounded-xl bg-gradient-to-r from-[#80132E] via-[#741129] to-[#5C0D20] text-sm sm:text-base font-semibold text-white",
                      "shadow-[0_10px_24px_rgba(116,17,41,0.28)]",
                      "hover:shadow-[0_14px_30px_rgba(116,17,41,0.38)] hover:brightness-105",
                      "active:scale-[0.98] transition-all duration-200",
                      "disabled:cursor-not-allowed disabled:opacity-60"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <IconLoader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <IconCircleCheck className="h-5 w-5" aria-hidden="true" />
                        <span>Verify & Continue Onboarding</span>
                        <IconArrowRight
                          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom edit contact helper */}
            <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-[var(--border)] text-center text-xs text-[var(--muted)]">
              <span>Entered the wrong details? </span>
              <Link
                href="/#quick-register"
                className="font-semibold text-[var(--primary)] hover:underline inline-flex items-center gap-1"
              >
                <IconEdit className="h-3 w-3" /> Edit phone or email
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
