"use client";

import { useState, useEffect } from "react";
import IconPhoto from "next/image";
import Link from "next/link";
import {
  IconArrowRight,
  IconArrowLeft,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconHeart,
  IconCircleCheck,
  IconUser,
  IconMail,
  IconPhone,
  IconLock,
} from "@tabler/icons-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/cn";
import { authService } from "@/services";
import { toast } from "@/lib/toast";

export default function RegisterPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qName = params.get("name");
      const qPhone = params.get("phone");
      const qEmail = params.get("email");
      if (qName) setName(qName);
      if (qPhone) setPhone(qPhone);
      if (qEmail) setEmail(qEmail);
    }
  }, []);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (phone) {
        await authService.sendOtp(phone, "register");
        toast.info("Verification code sent", `We've sent a 6-digit verification code to ${phone}`);
      } else if (email) {
        await authService.sendEmailOtp(email);
        toast.info("Verification code sent", `We've sent a verification code to ${email}`);
      }
      setStep(2);
    } catch (err: any) {
      const msg = err.message || "Failed to send verification code. Please try again.";
      setErrorMessage(msg);
      toast.error("Verification failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [firstName, ...rest] = name.split(" ");
      const lastName = rest.join(" ");

      if (phone) {
        await authService.verifyRegistration({
          phone,
          phoneOtp: otp,
          email: email || undefined,
        });
      }

      await authService.register({
        email,
        password,
        firstName: firstName || "",
        lastName: lastName || "",
      });

      toast.flash(
        "success",
        "Account created successfully!",
        "Welcome to IshtamChat. Redirecting to your dashboard..."
      );

      setTimeout(() => {
        window.location.href = "/onboarding";
      }, 600);
    } catch (error: any) {
      const msg = error.message || "Failed to create account. Please check your verification code.";
      setErrorMessage(msg);
      toast.error("Registration failed", msg);
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[var(--background)] p-0 sm:p-6 lg:p-8 flex flex-col sm:items-center sm:justify-center">
      {/* 1. Subtle Botanical Leaf Corner Accents (Framing floating card on tablet/desktop) */}
      {/* Top-Left Corner: Gentle Green Botanical Leaf Branch */}
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

      {/* Bottom-Right Corner: Gentle Pink Cherry Blossom Branch */}
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

      {/* 2. Soft Ambient Background Glows (Hidden on mobile to prevent expanding document scroll height) */}
      <div
        className="pointer-events-none absolute -top-24 left-1/4 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(16,133,96,0.08)_0%,transparent_70%)] blur-3xl hidden sm:block"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 right-1/4 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(217,163,89,0.06)_0%,transparent_70%)] blur-3xl hidden sm:block"
        aria-hidden="true"
      />

      {/* 3. Authentication Container: Matches login page architecture & ambience */}
      <div className="relative z-10 w-full min-h-[100dvh] sm:min-h-0 sm:max-w-xl lg:max-w-5xl rounded-none sm:rounded-[2.5rem] border-0 sm:border sm:border-[var(--border)] bg-white shadow-none sm:shadow-[0_24px_70px_var(--hero-shadow)] overflow-hidden flex flex-col justify-between">
        <div className="flex flex-col flex-1 lg:grid lg:grid-cols-[0.45fr_0.55fr] sm:min-h-[580px] lg:min-h-[660px]">
          {/* ======================================================== */}
          {/* PHOTO BANNER (Flexible top on mobile, Left on desktop)   */}
          {/* ======================================================== */}
          <div className="relative flex flex-col justify-between overflow-hidden bg-[var(--surface-muted)] p-4 sm:p-7 lg:p-8 order-1 lg:order-1 flex-1 min-h-[160px] sm:min-h-[300px] lg:min-h-full">
            {/* Background Photograph: Authentic Heritage Courtyard Ambience */}
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

              {/* Deep atmospheric editorial gradient overlay for desktop */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10 hidden lg:block"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-[var(--primary)]/15 mix-blend-multiply hidden lg:block"
                aria-hidden="true"
              />

              {/* Mobile gradient blend: dark vignette at top for navigation, soft warm dissolve into white at bottom */}
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

              {/* Mobile Back to home on Photo */}
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
                Find someone <br />
                <span className="font-semibold text-amber-100">to build a life with.</span>
              </h2>
              <p className="mt-2 sm:mt-2.5 max-w-sm text-xs sm:text-sm leading-relaxed text-white/80">
                Join thousands of verified profiles looking for meaningful, lifelong partnerships.
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* AUTHENTICATION FORM BODY (Docked at bottom for thumb zone)*/}
          {/* ======================================================== */}
          <div className="shrink-0 px-6 pt-4 pb-5 sm:p-8 lg:p-10 order-2 lg:order-2 bg-white -mt-7 sm:-mt-10 lg:mt-0 rounded-t-[2.25rem] sm:rounded-none relative z-10 shadow-[0_-16px_36px_rgba(0,0,0,0.08)] sm:shadow-none lg:flex lg:flex-col lg:justify-between">
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
                  {step === 1 ? "Create an profile" : "Verify your email"}
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  {step === 1
                    ? "Take the first step toward finding your match."
                    : `We've sent a 6-digit code to ${email}`}
                </p>
              </div>

              {/* Status / Alert Messages */}
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-3.5 rounded-xl border border-red-200 bg-red-50/80 p-2.5 text-xs sm:text-sm text-red-700"
                >
                  {errorMessage}
                </div>
              )}

              {/* Step 1: Registration Form with 21st.dev style inputs */}
              {step === 1 && (
                <form className="space-y-3 sm:space-y-4" onSubmit={handleStep1Submit}>
                  {/* Full Name Input */}
                  <div className="group">
                    <label
                      htmlFor="name"
                      className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--muted)] group-focus-within:text-[var(--primary)] transition-colors">
                        <IconUser className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rohan Kumar"
                        className={cn(
                          "h-11 sm:h-12 w-full rounded-xl border border-[var(--border)] bg-slate-50/70 pl-11 pr-4 text-sm sm:text-base",
                          "text-[var(--foreground)] placeholder:text-[var(--muted-light)]",
                          "outline-none transition-all duration-200",
                          "focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                        )}
                      />
                    </div>
                  </div>

                  {/* Email Address Input */}
                  <div className="group">
                    <label
                      htmlFor="email"
                      className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1"
                    >
                      Email address
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--muted)] group-focus-within:text-[var(--primary)] transition-colors">
                        <IconMail className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className={cn(
                          "h-11 sm:h-12 w-full rounded-xl border border-[var(--border)] bg-slate-50/70 pl-11 pr-4 text-sm sm:text-base",
                          "text-[var(--foreground)] placeholder:text-[var(--muted-light)]",
                          "outline-none transition-all duration-200",
                          "focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                        )}
                      />
                    </div>
                  </div>

                  {/* Phone Number Input */}
                  <div className="group">
                    <label
                      htmlFor="phone"
                      className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1"
                    >
                      Phone Number
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
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.startsWith("91") && val.length > 10) {
                            val = val.slice(2);
                          }
                          setPhone(val.slice(0, 10));
                        }}
                        placeholder="98765 43210"
                        className={cn(
                          "h-11 sm:h-12 w-full rounded-xl border border-[var(--border)] bg-slate-50/70 pl-23 sm:pl-24 pr-4 text-sm sm:text-base font-medium",
                          "text-[var(--foreground)] placeholder:text-[var(--muted-light)]",
                          "outline-none transition-all duration-200",
                          "focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                        )}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="group">
                    <label
                      htmlFor="password"
                      className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--muted)] group-focus-within:text-[var(--primary)] transition-colors">
                        <IconLock className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className={cn(
                          "h-11 sm:h-12 w-full rounded-xl border border-[var(--border)] bg-slate-50/70 pl-11 pr-12 text-sm sm:text-base",
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
                        "group focus-ring inline-flex h-11.5 sm:h-12.5 lg:h-13 w-full items-center justify-center gap-2",
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
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Continue</span>
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

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <form className="space-y-5" onSubmit={handleStep2Submit}>
                  <div>
                    <label
                      htmlFor="otp"
                      className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-2"
                    >
                      6-Digit Verification Code
                    </label>
                    <input
                      id="otp"
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter OTP (use 123456)"
                      className="h-14 w-full rounded-xl border border-[var(--border)] bg-slate-50/70 px-4 text-center text-xl tracking-[0.5em] font-medium text-[var(--foreground)] outline-none transition-all duration-200 focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading || otp.length !== 6}
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
                          <span>Verify & Create Account</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs sm:text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                      Wrong email? Go back
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Bottom Sign In Switcher */}
            <div className="mt-5 sm:mt-8 pt-3.5 sm:pt-5 border-t border-[var(--border)] text-center text-xs sm:text-sm text-[var(--muted)]">
              <span>Already have an account? </span>
              <Link
                href="/login"
                className="font-semibold text-[var(--primary)] hover:text-[var(--primary-deep)] hover:underline focus-ring rounded"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
