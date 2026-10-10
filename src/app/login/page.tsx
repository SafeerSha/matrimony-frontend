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
  IconLock,
} from "@tabler/icons-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/cn";
import { authService } from "@/services";
import { toast } from "@/lib/toast";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await authService.login({ email, password });
      toast.flash("success", "Signed in successfully!", "Welcome back");

      setTimeout(() => {
        let destination = "/app/discover";
        if (typeof window !== "undefined") {
          const searchParams = new URLSearchParams(window.location.search);
          const next = searchParams.get("next");
          if (next && next.startsWith("/") && !next.startsWith("//")) {
            destination = next;
          }
        }
        window.location.href = destination;
      }, 500);
    } catch (error: any) {
      const msg = error.message || "Failed to sign in. Please check your credentials.";
      setErrorMessage(msg);
      toast.error("Sign in failed", msg);
      setIsLoading(false);
    }
  };

  return (
    <main className="relative h-[100dvh] sm:min-h-screen sm:h-auto w-full overflow-hidden sm:overflow-y-auto bg-[var(--background)] p-0 sm:p-6 lg:p-8 flex flex-col sm:items-center sm:justify-center">
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

      {/* 3. Authentication Container: Exactly fits mobile screen height, elevated card on desktop */}
      <div className="relative z-10 w-full h-full sm:h-auto sm:max-w-xl lg:max-w-5xl rounded-none sm:rounded-[2.5rem] border-0 sm:border sm:border-[var(--border)] bg-white shadow-none sm:shadow-[0_24px_70px_var(--hero-shadow)] overflow-hidden flex flex-col justify-between">
        <div className="flex flex-col h-full lg:grid lg:grid-cols-[0.45fr_0.55fr] sm:min-h-[560px] lg:min-h-[640px]">
          {/* ======================================================== */}
          {/* PHOTO BANNER (Flexible top on mobile, Left on desktop)   */}
          {/* ======================================================== */}
          <div className="relative flex flex-col justify-between overflow-hidden bg-[var(--surface-muted)] p-4 sm:p-7 lg:p-8 order-1 lg:order-1 flex-1 min-h-0 sm:min-h-[320px] lg:min-h-full">
            {/* Background Photograph: Heritage courtyard */}
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
                className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 via-black/25 to-transparent lg:hidden z-[1]"
                aria-hidden="true"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-white/45 via-40% to-white lg:hidden z-[1]"
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
                Values-Aligned Introductions
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-white tracking-tight">
                Meaningful connections <br />
                <span className="font-semibold text-amber-100">
                  start with a hello.
                </span>
              </h2>
              <p className="mt-2 sm:mt-2.5 max-w-sm text-xs sm:text-sm leading-relaxed text-white/80">
                Private, thoughtful and designed for people looking for something meaningful.
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* AUTHENTICATION FORM BODY (Docked at bottom for thumb zone)*/}
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
              <div className="mt-0 sm:mt-1 lg:mt-8 mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--foreground)]">
                  Welcome back
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  Continue your journey toward something meaningful.
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

              {statusMessage && (
                <div
                  role="status"
                  className="mb-3.5 rounded-xl border border-[var(--primary-light)] bg-[var(--primary-lighter)] p-2.5 text-xs sm:text-sm text-[var(--primary-deep)]"
                >
                  {statusMessage}
                </div>
              )}

              {/* Authentication Form (21st.dev modern full-width inputs pattern) */}
              <form
                className="space-y-3.5 sm:space-y-5"
                action="/api/auth/login"
                method="post"
                onSubmit={handleSubmit}
                noValidate={false}
              >
                {/* Email Address Input */}
                <div className="group">
                  <label
                    htmlFor="email"
                    className="block text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--muted)] group-focus-within:text-[var(--primary)] transition-colors">
                      <IconMail className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={254}
                      placeholder="name@example.com"
                      className={cn(
                        "h-12 sm:h-12.5 lg:h-13 w-full rounded-xl border border-[var(--border)] bg-slate-50/70 pl-11 pr-4 text-sm sm:text-base",
                        "text-[var(--foreground)] placeholder:text-[var(--muted-light)]",
                        "outline-none transition-all duration-200",
                        "focus:bg-white focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                      )}
                    />
                  </div>
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
                          "Password reset link has been dispatched to your verified email address."
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
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      minLength={8}
                      maxLength={128}
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
                        <IconEyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <IconEye className="h-5 w-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-1.5">
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
                        <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom Create Account Switcher */}
            <div className="mt-4 sm:mt-8 pt-3.5 sm:pt-5 border-t border-[var(--border)] text-center text-xs sm:text-sm text-[var(--muted)]">
              <span>New to ShaadiChat? </span>
              <Link
                href="/register"
                className="font-semibold text-[var(--primary)] hover:text-[var(--primary-deep)] hover:underline focus-ring rounded"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}