"use client";

import { useState, useEffect } from "react";
import IconPhoto from "next/image";
import Link from "next/link";
import { IconArrowRight, IconEye, IconEyeOff, IconLoader2, IconHeart, IconCircleCheck } from '@tabler/icons-react';
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

    // Mock API call to send OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep(2); // Move to OTP verification
      toast.info("Verification code sent", `We've sent a 6-digit code to ${email}`);
    }, 800);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (otp !== "123456") { // Mock OTP check
      setTimeout(() => {
        setIsLoading(false);
        const msg = "Invalid OTP. For this mock, please use 123456.";
        setErrorMessage(msg);
        toast.error("Verification failed", msg);
      }, 600);
      return;
    }

    try {
      const [firstName, ...rest] = name.split(" ");
      const lastName = rest.join(" ");
      
      await authService.register({
        email,
        password,
        firstName: firstName || "",
        lastName: lastName || ""
      });

      toast.flash("success", "Account created successfully!", "Welcome to Matrimony. Redirecting to your dashboard...");

      setTimeout(() => {
        window.location.href = "/app/discover";
      }, 600);
    } catch (error: any) {
      const msg = error.message || "Failed to create account. Email might already exist.";
      setErrorMessage(msg);
      toast.error("Registration failed", msg);
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--background)] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 flex items-center justify-center">
      {/* 1. Subtle Botanical Leaf Corner Accents */}
      <div
        className="pointer-events-none absolute top-0 left-0 z-0 origin-top-left -translate-x-[6%] -translate-y-[8%] opacity-60 sm:opacity-75 lg:opacity-85"
        aria-hidden="true"
      >
        <div className="relative aspect-[3/2] w-28 sm:w-44 md:w-56 lg:w-72 drop-shadow-[0_12px_24px_rgba(10,50,30,0.12)] animate-botanical-float-left">
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
        className="pointer-events-none absolute bottom-0 right-0 z-0 origin-bottom-right translate-x-[6%] translate-y-[8%] opacity-60 sm:opacity-75 lg:opacity-85"
        aria-hidden="true"
      >
        <div className="animate-botanical-float-right">
          <div
            className="relative aspect-square w-28 sm:w-44 md:w-56 lg:w-72 drop-shadow-[0_12px_24px_rgba(200,60,90,0.12)]"
            style={{ transform: "scaleX(-1) rotate(-15deg)", transformOrigin: "center center" }}
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
      <div className="pointer-events-none absolute -top-24 left-1/4 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(16,133,96,0.08)_0%,transparent_70%)] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 right-1/4 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(217,163,89,0.06)_0%,transparent_70%)] blur-3xl" aria-hidden="true" />

      {/* 3. Main Two-Column Container */}
      <div className="relative z-10 mx-auto w-full max-w-5xl rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--border)] bg-white/95 backdrop-blur-sm shadow-[0_24px_70px_var(--hero-shadow)] overflow-hidden">
        <div className="grid lg:grid-cols-[0.45fr_0.55fr] min-h-[580px] lg:min-h-[640px]">
          {/* LEFT SIDE: Hero IconPhoto */}
          <div className="relative flex flex-col justify-between overflow-hidden bg-[var(--surface-muted)] p-6 sm:p-8 order-2 lg:order-1 min-h-[260px] sm:min-h-[320px] lg:min-h-full">
            <div className="absolute inset-0 z-0">
              <IconPhoto
                src="/images/hero-2.jpg"
                alt="Happy couple"
                fill
                priority
                quality={90}
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" aria-hidden="true" />
              <div className="absolute inset-0 bg-[var(--primary)]/15 mix-blend-multiply" aria-hidden="true" />
            </div>
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white tracking-wide shadow-sm">
                <IconHeart className="h-3.5 w-3.5" aria-hidden="true" fill="currentColor" /> Premium Matchmaking
              </span>
            </div>
            <div className="relative z-10 mt-auto pt-12">
              <div className="mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-amber-200/90">
                <IconHeart className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> Start Your Journey
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-white tracking-tight">
                Find someone <br />
                <span className="font-semibold text-amber-100">to build a life with.</span>
              </h2>
              <p className="mt-2.5 max-w-sm text-xs sm:text-sm leading-relaxed text-white/80">
                Join thousands of verified profiles looking for meaningful, lifelong partnerships.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE: Registration Form */}
          <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10 order-1 lg:order-2 bg-white">
            <div>
              <div className="flex items-center justify-between">
                <Logo />
                <Link href="/" className="text-xs sm:text-sm font-medium text-[var(--muted)] hover:text-[var(--primary)] transition-colors focus-ring rounded-lg px-2 py-1">
                  ← Back to home
                </Link>
              </div>

              <div className="mt-8 mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
                  {step === 1 ? "Create an account" : "Verify your email"}
                </h1>
                <p className="mt-2 text-sm sm:text-base text-[var(--muted)] leading-relaxed">
                  {step === 1 ? "Take the first step toward finding your match." : `We've sent a 6-digit code to ${email}`}
                </p>
              </div>

              {errorMessage && (
                <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-xs sm:text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              {step === 1 && (
                <form className="space-y-4" onSubmit={handleStep1Submit}>
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Full Name</label>
                    <input
                      id="name" type="text" required
                      value={name} onChange={e => setName(e.target.value)}
                      placeholder="e.g. Rohan Kumar"
                      className="h-12 sm:h-13 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm sm:text-base outline-none transition-all duration-200 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Email address</label>
                    <input
                      id="email" type="email" required
                      value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="h-12 sm:h-13 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm sm:text-base outline-none transition-all duration-200 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Phone Number</label>
                    <input
                      id="phone" type="tel" required
                      value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-12 sm:h-13 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-sm sm:text-base outline-none transition-all duration-200 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        id="password" type={showPassword ? "text" : "password"} required minLength={8}
                        value={password} onChange={e => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="h-12 sm:h-13 w-full rounded-xl border border-[var(--border)] bg-white pl-4 pr-12 text-sm sm:text-base outline-none transition-all duration-200 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                      />
                      <button
                        type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] p-1.5 rounded-lg focus-ring transition-colors"
                      >
                        {showPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit" disabled={isLoading}
                      className={cn(
                        "focus-ring inline-flex h-13 sm:h-14 w-full items-center justify-center gap-2",
                        "rounded-xl bg-[var(--primary)] text-sm sm:text-base font-semibold text-white",
                        "shadow-[0_12px_28px_var(--primary-shadow)] hover:bg-[var(--primary-deep)] transition-all duration-200",
                        "disabled:cursor-not-allowed disabled:opacity-60"
                      )}
                    >
                      {isLoading ? (
                        <><IconLoader2 className="h-5 w-5 animate-spin" /><span>Processing...</span></>
                      ) : (
                        <><IconArrowRight className="h-4 w-4" /><span>Continue</span></>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <form className="space-y-5" onSubmit={handleStep2Submit}>
                  <div>
                    <label htmlFor="otp" className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-2">6-Digit Verification Code</label>
                    <input
                      id="otp" type="text" required maxLength={6}
                      value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter OTP (use 123456)"
                      className="h-14 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-center text-xl tracking-[0.5em] font-medium text-[var(--foreground)] outline-none transition-all duration-200 focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10"
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit" disabled={isLoading || otp.length !== 6}
                      className={cn(
                        "focus-ring inline-flex h-13 sm:h-14 w-full items-center justify-center gap-2",
                        "rounded-xl bg-[var(--primary)] text-sm sm:text-base font-semibold text-white",
                        "shadow-[0_12px_28px_var(--primary-shadow)] hover:bg-[var(--primary-deep)] transition-all duration-200",
                        "disabled:cursor-not-allowed disabled:opacity-60"
                      )}
                    >
                      {isLoading ? (
                        <><IconLoader2 className="h-5 w-5 animate-spin" /><span>Verifying...</span></>
                      ) : (
                        <><IconCircleCheck className="h-5 w-5" /><span>Verify & Create Account</span></>
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

            <div className="mt-8 pt-6 border-t border-[var(--border)] text-center text-sm text-[var(--muted)]">
              <span>Already have an account? </span>
              <Link href="/login" className="font-semibold text-[var(--primary)] hover:text-[var(--primary-deep)] hover:underline focus-ring rounded">
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
