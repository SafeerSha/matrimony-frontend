"use client";

import { useState } from "react";
import IconPhoto from "next/image";
import Link from "next/link";
import {
  IconArrowRight,
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconHeart,
  IconMail,
  IconPhone,
  IconLock,
  IconCircleCheck,
  IconDeviceMobile,
  IconKey,
  IconUserPlus,
  IconSparkles,
} from "@tabler/icons-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/cn";
import { authService, profileService } from "@/services";
import { toast } from "@/lib/toast";
import { resolvePostAuthRoute } from "@/lib/auth/auth-utils";

export default function LoginPage() {
  const [authMethod, setAuthMethod] = useState<"otp" | "password">("otp");
  const [otpStep, setOtpStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [notRegisteredAccount, setNotRegisteredAccount] = useState<{
    identifier: string;
    type: "phone" | "email";
    message?: string;
  } | null>(null);

  // Helper to determine destination based on user/profile status
  const determineDestination = async (authRes: any) => {
    let checkTarget: any = authRes;

    // If auth response does not explicitly include user status or onboardingStep,
    // fetch the latest profile status from /profiles/me
    if (!authRes?.user?.status && authRes?.profile?.onboardingStep === undefined) {
      try {
        const profile = await profileService.getProfile("me");
        if (profile) {
          checkTarget = {
            user: profile.user || authRes?.user,
            profile,
          };
        }
      } catch {
        // Fallback to authRes
      }
    }

    return resolvePostAuthRoute(checkTarget, "/app/discover");
  };

  // 1. Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);
    setNotRegisteredAccount(null);

    const rawDigits = phone.trim().replace(/\D/g, "");
    const cleanDigits = rawDigits.startsWith("91") && rawDigits.length > 10 ? rawDigits.slice(2) : rawDigits;
    if (!cleanDigits || cleanDigits.length < 10) {
      setIsLoading(false);
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    const cleanPhone = `+91 ${cleanDigits}`;

    try {
      await authService.sendOtp(cleanPhone);
      setOtpStep("code");
      toast.info("Verification code sent", `We've sent a 6-digit OTP to ${cleanPhone}`);
    } catch (err: any) {
      const isAccountNotFound =
        err?.status === 404 ||
        err?.statusCode === 404 ||
        err?.details?.code === "ACCOUNT_NOT_FOUND" ||
        err?.code === "ACCOUNT_NOT_FOUND" ||
        err?.message?.toLowerCase().includes("no account found") ||
        err?.message?.toLowerCase().includes("register first");

      if (isAccountNotFound) {
        setNotRegisteredAccount({
          identifier: cleanPhone,
          type: "phone",
          message: err.message || "No account found with this mobile number. Please register first.",
        });
        toast.warning(
          "Account Not Found",
          "This mobile number is not registered yet. Please create your profile to continue."
        );
        return;
      }

      const msg = err.message || "Failed to send verification code. Please try again.";
      setErrorMessage(msg);
      toast.error("Failed to send OTP", msg);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const rawDigits = phone.trim().replace(/\D/g, "");
      const cleanDigits = rawDigits.startsWith("91") && rawDigits.length > 10 ? rawDigits.slice(2) : rawDigits;
      const cleanPhone = `+91 ${cleanDigits}`;

      const res = await authService.verifyOtp(cleanPhone, otp.trim());
      const { url, isDraft } = await determineDestination(res);

      if (isDraft) {
        toast.flash(
          "info",
          "Complete Your Profile",
          "Please finish setting up your profile to start exploring compatible matches."
        );
      } else {
        toast.flash("success", "Signed in successfully!", "Welcome back to ShaadiChat");
      }

      setTimeout(() => {
        window.location.href = url;
      }, 400);
    } catch (err: any) {
      const isAccountNotFound =
        err?.status === 404 ||
        err?.statusCode === 404 ||
        err?.details?.code === "ACCOUNT_NOT_FOUND" ||
        err?.code === "ACCOUNT_NOT_FOUND" ||
        err?.message?.toLowerCase().includes("no account found") ||
        err?.message?.toLowerCase().includes("register first");

      if (isAccountNotFound) {
        setOtpStep("phone");
        setNotRegisteredAccount({
          identifier: phone.trim(),
          type: "phone",
          message: err.message || "No account found with this mobile number. Please register first.",
        });
        toast.warning(
          "Account Not Found",
          "This mobile number is not registered. Please create your profile to continue."
        );
        setIsLoading(false);
        return;
      }

      const msg = err.message || "Invalid OTP code. Please check and try again.";
      setErrorMessage(msg);
      toast.error("Sign in failed", msg);
      setIsLoading(false);
    }
  };

  // 3. Handle Password Login (supports Email or Mobile)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);
    setNotRegisteredAccount(null);

    try {
      const res = await authService.login({
        identifier: identifier.trim(),
        password,
      });

      const { url, isDraft } = await determineDestination(res);

      if (isDraft) {
        toast.flash(
          "info",
          "Complete Your Profile",
          "Please finish setting up your profile to start exploring compatible matches."
        );
      } else {
        toast.flash("success", "Signed in successfully!", "Welcome back");
      }

      setTimeout(() => {
        window.location.href = url;
      }, 400);
    } catch (error: any) {
      const isAccountNotFound =
        error?.status === 404 ||
        error?.statusCode === 404 ||
        error?.details?.code === "ACCOUNT_NOT_FOUND" ||
        error?.code === "ACCOUNT_NOT_FOUND" ||
        error?.message?.toLowerCase().includes("no account found") ||
        error?.message?.toLowerCase().includes("register first") ||
        error?.message?.toLowerCase().includes("user not found");

      if (isAccountNotFound) {
        const cleanIdent = identifier.trim();
        setNotRegisteredAccount({
          identifier: cleanIdent,
          type: cleanIdent.includes("@") ? "email" : "phone",
          message: error.message || "No account found with these credentials. Please register first.",
        });
        toast.warning(
          "Account Not Found",
          "No account found. Please create your profile to continue."
        );
        setIsLoading(false);
        return;
      }

      const msg = error.message || "Failed to sign in. Please verify your credentials.";
      setErrorMessage(msg);
      toast.error("Sign in failed", msg);
      setIsLoading(false);
    }
  };


  return (
    <main className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[var(--background)] p-0 sm:p-6 lg:p-8 flex flex-col sm:items-center sm:justify-center">
      {/* 1. Subtle Botanical Leaf Corner Accents (Framing floating card on tablet/desktop) */}
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

      {/* 3. Authentication Container */}
      <div className="relative z-10 w-full min-h-[100dvh] sm:min-h-0 sm:max-w-xl lg:max-w-5xl rounded-none sm:rounded-[2.5rem] border-0 sm:border sm:border-[var(--border)] bg-white shadow-none sm:shadow-[0_24px_70px_var(--hero-shadow)] overflow-hidden flex flex-col justify-between">
        <div className="flex flex-col flex-1 lg:grid lg:grid-cols-[0.45fr_0.55fr] sm:min-h-[580px] lg:min-h-[660px]">
          {/* ======================================================== */}
          {/* PHOTO BANNER (Flexible top on mobile, Left on desktop)   */}
          {/* ======================================================== */}
          <div className="relative flex flex-col justify-between overflow-hidden bg-[var(--surface-muted)] p-4 sm:p-7 lg:p-8 order-1 lg:order-1 flex-1 min-h-[160px] sm:min-h-[300px] lg:min-h-full">
            <div className="absolute inset-0 z-0">
              <IconPhoto
                src="/images/heritage-palace-courtyard.jpg"
                alt="Sunlit Rajasthan heritage palace courtyard with bougainvillea and carved sandstone arches"
                fill
                priority
                quality={92}
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-[center_35%] transition-transform duration-700 hover:scale-[1.02]"
              />

              <div
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 hidden lg:block"
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

            {/* Top Brand & Navigation Header on Photo */}
            <div className="relative z-10 flex items-center justify-between pt-1 sm:pt-0">
              <Logo
                lightOnMobile={true}
                showTagline={true}
                blurredBg={true}
                className="scale-90 sm:scale-100 origin-left"
              />

              <Link
                href="/"
                className="inline-flex lg:hidden text-xs font-semibold text-white/95 hover:text-white bg-black/40 hover:bg-black/55 backdrop-blur-md border border-white/25 rounded-full px-3.5 py-1.5 transition shadow-sm items-center gap-1.5 active:scale-95"
              >
                <IconArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Home</span>
              </Link>
            </div>

            {/* Bottom Brand Editorial Quote (Visible on Desktop) */}
            <div className="relative z-10 mt-auto pt-8 sm:pt-12 hidden lg:block">
              <div className="mb-2.5 sm:mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-amber-200/90">
                <IconHeart className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                Values-Aligned Matchmaking
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-white tracking-tight">
                Meaningful connections <br />
                <span className="font-semibold text-amber-100">
                  start with a hello.
                </span>
              </h2>
              <p className="mt-2 sm:mt-2.5 max-w-sm text-xs sm:text-sm leading-relaxed text-white/80">
                Private, thoughtful and verified profiles looking for lifelong companionship.
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* AUTHENTICATION FORM BODY */}
          {/* ======================================================== */}
          <div className="shrink-0 px-6 pt-5 pb-6 sm:p-8 lg:p-10 order-2 lg:order-2 bg-white -mt-8 sm:-mt-10 lg:mt-0 rounded-t-[2.25rem] sm:rounded-none relative z-10 shadow-[0_-16px_36px_rgba(0,0,0,0.08)] sm:shadow-none lg:flex lg:flex-col lg:justify-between">
            <div className="w-full">
              {/* Navigation (Visible on Desktop) */}
              <div className="hidden lg:flex items-center justify-end">
                <Link
                  href="/"
                  className="text-xs sm:text-sm font-medium text-[var(--muted)] hover:text-[var(--primary)] transition-colors focus-ring rounded-lg px-2 py-1"
                >
                  ← Back to home
                </Link>
              </div>

              {/* Header Title */}
              <div className="mt-0 sm:mt-1 lg:mt-6 mb-4 sm:mb-5">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--foreground)]">
                  Welcome back
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  Sign in to connect with verified prospective matches.
                </p>
              </div>

              {/* Auth Mode Switcher (OTP vs Password) */}
              <div className="grid grid-cols-2 p-1 bg-slate-100/80 rounded-xl mb-5 border border-[var(--border)]/60">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("otp");
                    setErrorMessage(null);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all",
                    authMethod === "otp"
                      ? "bg-white text-[var(--foreground)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  )}
                >
                  <IconDeviceMobile className="h-4 w-4 text-[var(--primary)]" />
                  <span>Mobile OTP</span>
                  <span className="hidden sm:inline-block ml-1 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                    Fast
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod("password");
                    setErrorMessage(null);
                    setNotRegisteredAccount(null);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all",
                    authMethod === "password"
                      ? "bg-white text-[var(--foreground)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  )}
                >
                  <IconKey className="h-4 w-4 text-[var(--primary)]" />
                  <span>Password</span>
                </button>
              </div>

              {/* Upfront Account Not Found & Direct Registration Card */}
              {notRegisteredAccount && (
                <div
                  role="alert"
                  className="mb-5 rounded-2xl border-2 border-[#D89B65]/40 bg-gradient-to-br from-[#FFF9F6] via-[#FAF3EC] to-[#FDF2F4] p-4 sm:p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <div className="flex items-start gap-3 sm:gap-3.5">
                    <div className="h-10 w-10 rounded-xl bg-[#80132E]/10 border border-[#80132E]/20 flex items-center justify-center shrink-0 text-[#80132E] mt-0.5">
                      <IconUserPlus className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#D89B65]/25 text-[#8C5D2C] text-[10px] font-bold uppercase tracking-wider mb-1.5">
                        <IconSparkles className="h-3 w-3 text-[#D89B65]" />
                        <span>New to ShaadiChat?</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        No account found for{" "}
                        <span className="font-mono text-[#80132E] font-extrabold">{notRegisteredAccount.identifier}</span>
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                        {notRegisteredAccount.message || "This mobile number is not registered yet. Create your verified matrimony profile in less than 2 minutes to start exploring compatible matches."}
                      </p>

                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2.5">
                        <Link
                          href={`/register?${notRegisteredAccount.type === "email" ? "email" : "phone"}=${encodeURIComponent(notRegisteredAccount.identifier)}`}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#80132E] via-[#741129] to-[#5C0D20] text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-105 active:scale-95 transition-all text-center"
                        >
                          <IconUserPlus className="h-4 w-4" />
                          <span>Create Free Profile Now</span>
                          <IconArrowRight className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setNotRegisteredAccount(null);
                            setErrorMessage(null);
                            if (authMethod === "otp") setPhone("");
                            else setIdentifier("");
                          }}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-black/5 transition text-center cursor-pointer"
                        >
                          Try another number
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status / Alert Messages */}
              {errorMessage && !notRegisteredAccount && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs sm:text-sm text-red-700"
                >
                  {errorMessage}
                </div>
              )}

              {statusMessage && (
                <div
                  role="status"
                  className="mb-4 rounded-xl border border-[var(--primary-light)] bg-[var(--primary-lighter)] p-3 text-xs sm:text-sm text-[var(--primary-deep)]"
                >
                  {statusMessage}
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 1: MOBILE OTP AUTHENTICATION (PRIORITIZED)          */}
              {/* ======================================================== */}
              {authMethod === "otp" && (
                <div>
                  {otpStep === "phone" ? (
                    <form className="space-y-4" onSubmit={handleSendOtp}>
                      <div className="group">
                        <label
                          htmlFor="phone"
                          className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5"
                        >
                          Mobile Number
                        </label>
                        <div className="relative flex items-center">
                          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 sm:pl-4 text-[var(--muted)] group-focus-within:text-[var(--primary)] transition-colors">
                            <IconPhone className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div className="pointer-events-none absolute left-11 sm:left-12 flex items-center pr-2.5 border-r border-slate-200 select-none">
                            <span className="text-sm sm:text-base font-bold text-[var(--foreground)]">+91</span>
                          </div>
                          <input
                            id="phone"
                            type="tel"
                            maxLength={10}
                            required
                            value={phone}
                            onChange={(e) => {
                              setNotRegisteredAccount(null);
                              setErrorMessage(null);
                              let val = e.target.value.replace(/\D/g, "");
                              if (val.startsWith("91") && val.length > 10) {
                                val = val.slice(2);
                              }
                              setPhone(val.slice(0, 10));
                            }}
                            placeholder="98765 43210"
                            className={cn(
                              "h-12 sm:h-12.5 lg:h-13 w-full rounded-xl border pl-23 sm:pl-24 pr-4 text-sm sm:text-base font-medium",
                              "text-[var(--foreground)] placeholder:text-[var(--muted-light)]",
                              "outline-none transition-all duration-200",
                              notRegisteredAccount
                                ? "border-amber-400 bg-amber-50/20 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                                : "border-[var(--border)] bg-slate-50/70 focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                            )}
                          />
                        </div>
                        {notRegisteredAccount ? (
                          <p className="mt-1.5 text-[11px] text-amber-800 font-medium">
                            ⚠️ Mobile number not found. Click &apos;Create Free Profile Now&apos; above to register.
                          </p>
                        ) : (
                          <p className="mt-1.5 text-[11px] text-[var(--muted)]">
                            We will send a 6-digit one-time password to verify your number.
                          </p>
                        )}
                      </div>


                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className={cn(
                            "group focus-ring inline-flex h-12 sm:h-12.5 lg:h-13 w-full items-center justify-center gap-2",
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
                              <span>Sending OTP...</span>
                            </>
                          ) : (
                            <>
                              <span>Get Verification Code</span>
                              <IconArrowRight
                                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                aria-hidden="true"
                              />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form className="space-y-4" onSubmit={handleVerifyOtp}>
                      <div className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            htmlFor="otp"
                            className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)]"
                          >
                            Enter 6-Digit OTP
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpStep("phone");
                              setOtp("");
                            }}
                            className="text-xs font-medium text-[var(--primary)] hover:underline"
                          >
                            Change number
                          </button>
                        </div>
                        <p className="text-xs text-[var(--muted)] mb-2">
                          Sent to <span className="font-semibold text-[var(--foreground)]">+91 {phone.replace(/\D/g, "").slice(-10)}</span>
                        </p>
                        <input
                          id="otp"
                          type="text"
                          required
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="Enter 6-digit OTP"
                          className="h-13 w-full rounded-xl border border-[var(--border)] bg-slate-50/70 px-4 text-center text-xl tracking-[0.5em] font-medium text-[var(--foreground)] outline-none transition-all duration-200 focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isLoading || otp.length !== 6}
                          className={cn(
                            "group focus-ring inline-flex h-12 sm:h-12.5 lg:h-13 w-full items-center justify-center gap-2",
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
                              <span>Verify & Sign In</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isLoading}
                          className="text-xs text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                        >
                          Didn&apos;t receive code? Resend OTP
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* ======================================================== */}
              {/* TAB 2: PASSWORD AUTHENTICATION (MOBILE OR EMAIL)        */}
              {/* ======================================================== */}
              {authMethod === "password" && (
                <form className="space-y-4" onSubmit={handlePasswordLogin}>
                  {/* Identifier: Mobile or Email */}
                  <div className="group">
                    <label
                      htmlFor="identifier"
                      className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5"
                    >
                      Email or Mobile Number
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--muted)] group-focus-within:text-[var(--primary)] transition-colors">
                        <IconMail className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <input
                        id="identifier"
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => {
                          setNotRegisteredAccount(null);
                          setErrorMessage(null);
                          setIdentifier(e.target.value);
                        }}
                        placeholder="name@example.com or 9876543210"
                        className={cn(
                          "h-12 sm:h-12.5 lg:h-13 w-full rounded-xl border pl-11 pr-4 text-sm sm:text-base",
                          "text-[var(--foreground)] placeholder:text-[var(--muted-light)]",
                          "outline-none transition-all duration-200",
                          notRegisteredAccount
                            ? "border-amber-400 bg-amber-50/20 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                            : "border-[var(--border)] bg-slate-50/70 focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                        )}
                      />
                    </div>
                    {notRegisteredAccount && (
                      <p className="mt-1.5 text-[11px] text-amber-800 font-medium">
                        ⚠️ Account not found. Click &apos;Create Free Profile Now&apos; above to register.
                      </p>
                    )}
                  </div>


                  {/* Password Input */}
                  <div className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        htmlFor="password"
                        className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)]"
                      >
                        Password
                      </label>
                      <a
                        href="#forgot"
                        onClick={(e) => {
                          e.preventDefault();
                          setStatusMessage(
                            "Tip: You can instantly sign in using the Mobile OTP tab without a password!"
                          );
                        }}
                        className="text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-deep)] hover:underline focus-ring rounded"
                      >
                        Forgot password?
                      </a>
                    </div>

                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--muted)] group-focus-within:text-[var(--primary)] transition-colors">
                        <IconLock className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className={cn(
                          "h-12 sm:h-12.5 lg:h-13 w-full rounded-xl border border-[var(--border)] bg-slate-50/70 pl-11 pr-12 text-sm sm:text-base",
                          "text-[var(--foreground)] placeholder:text-[var(--muted-light)]",
                          "outline-none transition-all duration-200",
                          "focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] p-1.5 rounded-lg focus-ring transition-colors"
                      >
                        {showPassword ? (
                          <IconEyeOff className="h-5 w-5" />
                        ) : (
                          <IconEye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={cn(
                        "group focus-ring inline-flex h-12 sm:h-12.5 lg:h-13 w-full items-center justify-center gap-2",
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
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign in</span>
                          <IconArrowRight
                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Bottom Create Account Switcher */}
            <div className="mt-5 sm:mt-8 pt-3.5 sm:pt-5 border-t border-[var(--border)] text-center text-xs sm:text-sm text-[var(--muted)]">
              <span>New to ShaadiChat? </span>
              <Link
                href="/#quick-register"
                className="font-semibold text-[var(--primary)] hover:text-[var(--primary-deep)] hover:underline focus-ring rounded"
              >
                Create an profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}