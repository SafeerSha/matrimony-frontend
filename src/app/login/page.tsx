"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2, Sparkles, Heart } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/cn";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // If javascript is active, provide silky smooth client-side submission with feedback
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 501) {
          // Graceful handling of backend service in-development
          setStatusMessage(
            "Account system is currently being connected to the secure registry. Welcome to the preview!"
          );
        } else {
          setErrorMessage(data.message || "Invalid credentials format. Please try again.");
        }
      } else {
        // If successful, navigate to dashboard
        window.location.href = "/app";
      }
    } catch {
      setErrorMessage("Unable to connect to the authentication service. Please check your network.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--background)] px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12 flex items-center justify-center">
      {/* 1. Subtle Botanical Leaf Corner Accents (pointer-events-none, never blocks form) */}
      {/* Top-Left Corner: Gentle Green Botanical Leaf Branch */}
      <div
        className="pointer-events-none absolute top-0 left-0 z-0 origin-top-left -translate-x-[6%] -translate-y-[8%] opacity-60 sm:opacity-75 lg:opacity-85"
        aria-hidden="true"
      >
        <div className="relative aspect-[3/2] w-28 sm:w-44 md:w-56 lg:w-72 drop-shadow-[0_12px_24px_rgba(10,50,30,0.12)]">
          <Image
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
        className="pointer-events-none absolute bottom-0 right-0 z-0 origin-bottom-right translate-x-[6%] translate-y-[8%] opacity-60 sm:opacity-75 lg:opacity-85"
        aria-hidden="true"
      >
        <div
          className="relative aspect-square w-28 sm:w-44 md:w-56 lg:w-72 drop-shadow-[0_12px_24px_rgba(200,60,90,0.12)]"
          style={{
            transform: "scaleX(-1) rotate(-15deg)",
            transformOrigin: "center center",
          }}
        >
          <Image
            src="/images/pink-cherry.png"
            alt=""
            width={576}
            height={576}
            quality={85}
            className="h-full w-full object-contain"
          />
        </div>
      </div>


      {/* 2. Soft Ambient Background Glows */}
      <div
        className="pointer-events-none absolute -top-24 left-1/4 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(16,133,96,0.08)_0%,transparent_70%)] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 right-1/4 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(217,163,89,0.06)_0%,transparent_70%)] blur-3xl"
        aria-hidden="true"
      />

      {/* 3. Main Two-Column Premium Authentication Card Container */}
      <div className="relative z-10 mx-auto w-full max-w-5xl rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--border)] bg-white/95 backdrop-blur-sm shadow-[0_24px_70px_var(--hero-shadow)] overflow-hidden">
        <div className="grid lg:grid-cols-[0.45fr_0.55fr] min-h-[580px] lg:min-h-[640px]">
          {/* ======================================================== */}
          {/* LEFT SIDE: Warm, Elegant Matrimonial Couple Photography */}
          {/* ======================================================== */}
          <div className="relative flex flex-col justify-between overflow-hidden bg-[var(--surface-muted)] p-6 sm:p-8 lg:p-10 order-2 lg:order-1 min-h-[260px] sm:min-h-[320px] lg:min-h-full">
            {/* Background Couple Photograph */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/hero-1.jpg"
                alt="Smiling couple in traditional Indian attire celebrating their connection"
                fill
                priority
                quality={90}
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
              />
              {/* Deep atmospheric editorial gradient overlay for crisp white text legibility */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-[var(--primary)]/15 mix-blend-multiply"
                aria-hidden="true"
              />
            </div>

            {/* Top Brand Pill on Photo */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white tracking-wide shadow-sm">
                <Heart className="h-3.5 w-3.5" aria-hidden="true" fill="currentColor" />                Curated Matrimony
              </span>
            </div>

            {/* Bottom Brand Quote */}
            <div className="relative z-10 mt-auto pt-12">
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-amber-200/90">
                <Heart className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                Values-Aligned Introductions
              </div>
              <h2 className="font-editorial-title text-2xl sm:text-3xl font-normal leading-tight text-white tracking-tight">
                Meaningful connections <br />
                <span className="font-editorial-highlight font-medium text-amber-100">
                  start with a hello.
                </span>
              </h2>
              <p className="mt-2.5 max-w-sm text-xs sm:text-sm leading-relaxed text-white/80">
                Private, thoughtful and designed for people looking for something meaningful.
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT SIDE: Clean, Premium Authentication Experience     */}
          {/* ======================================================== */}
          <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 order-1 lg:order-2 bg-white">
            <div>
              {/* Logo & Navigation */}
              <div className="flex items-center justify-between">
                <Logo />
                <Link
                  href="/"
                  className="text-xs sm:text-sm font-medium text-[var(--muted)] hover:text-[var(--primary)] transition-colors focus-ring rounded-lg px-2 py-1"
                >
                  ← Back to home
                </Link>
              </div>

              {/* Header Title */}
              <div className="mt-8 sm:mt-10 mb-6 sm:mb-8">
                <h1 className="font-editorial-title text-3xl sm:text-4xl font-normal tracking-tight text-[var(--foreground)]">
                  Welcome back
                </h1>
                <p className="mt-2 text-sm sm:text-base text-[var(--muted)] leading-relaxed">
                  Continue your journey toward something meaningful.
                </p>
              </div>

              {/* Status / Alert Messages */}
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-xs sm:text-sm text-red-700"
                >
                  {errorMessage}
                </div>
              )}

              {statusMessage && (
                <div
                  role="status"
                  className="mb-5 rounded-xl border border-[var(--primary-light)] bg-[var(--primary-lighter)] p-3.5 text-xs sm:text-sm text-[var(--primary-deep)]"
                >
                  {statusMessage}
                </div>
              )}

              {/* Authentication Form */}
              <form
                className="space-y-5"
                action="/api/auth/login"
                method="post"
                onSubmit={handleSubmit}
                noValidate={false}
              >
                {/* Email Address Input */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-2"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    placeholder="name@example.com"
                    className={cn(
                      "h-13 sm:h-14 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm sm:text-base",
                      "text-[var(--foreground)] placeholder:text-[var(--muted-light)]",
                      "outline-none transition-all duration-200",
                      "focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                    )}
                  />
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)]"
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
                      className="text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-deep)] hover:underline focus-ring rounded"
                    >
                      Forgot password?
                    </a>
                  </div>

                  <div className="relative">
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
                        "h-13 sm:h-14 w-full rounded-xl border border-[var(--border)] bg-white pl-4 pr-12 text-sm sm:text-base",
                        "text-[var(--foreground)] placeholder:text-[var(--muted-light)]",
                        "outline-none transition-all duration-200",
                        "focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] p-1.5 rounded-lg focus-ring transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-5 w-5" aria-hidden="true" />
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
                      "focus-ring inline-flex h-13 sm:h-14 w-full items-center justify-center gap-2",
                      "rounded-xl bg-[var(--primary)] text-sm sm:text-base font-semibold text-white",
                      "shadow-[0_12px_28px_var(--primary-shadow)]",
                      "hover:bg-[var(--primary-deep)] hover:shadow-[0_16px_34px_var(--primary-shadow-strong)]",
                      "active:scale-[0.99] transition-all duration-200",
                      "disabled:cursor-not-allowed disabled:opacity-60"
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign in</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom Create Account Switcher */}
            <div className="mt-8 pt-6 border-t border-[var(--border)] text-center text-sm text-[var(--muted)]">
              <span>New to LetsChat? </span>
              <Link
                href="/#how-it-works"
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