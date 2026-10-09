"use client";

import { IconArrowRight, IconHeart, IconMessage } from '@tabler/icons-react';
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TrustBadge } from "./trust-badge";
import { TrustFeature } from "./trust-feature";
import { HeroProfileCard, type HeroProfile } from "./hero-profile-card";
import { ConnectionBadge } from "./connection-badge";
import { CinematicHeroImage, type HeroImageData } from "./cinematic-hero-image";
import { BotanicalLayer } from "./botanical-layer";
import { cn } from "@/lib/cn";

export interface HeroSectionProps {
  className?: string;
}

const sampleProfiles: [HeroProfile, HeroProfile] = [
  {
    name: "Ananya M.",
    age: 27,
    profession: "Product Designer",
    location: "Bangalore • Kerala roots",
    image: "/images/profile-ananya.jpg",
    matchScore: "94% Match",
    verified: true,
  },
  {
    name: "Rohan K.",
    age: 29,
    profession: "Architect & Partner",
    location: "Kochi • Kerala",
    image: "/images/profile-rohan.jpg",
    matchScore: "91% Match",
    verified: true,
  },
];

const HERO_IMAGES: HeroImageData[] = [
  {
    id: "hero-1",
    src: "/images/hero-1.jpg",
    alt: "A smiling Indian couple in tasteful contemporary attire celebrating their connection",
  },
  {
    id: "hero-2",
    src: "/images/hero-2.jpg",
    alt: "Ananya in elegant traditional ivory and champagne gold silk saree in heritage courtyard",
  },
  {
    id: "hero-3",
    src: "/images/hero-3.jpg",
    alt: "Rohan in dignified forest green Nehru jacket and cream kurta on palace veranda",
  },
  {
    id: "hero-4",
    src: "/images/hero-4.jpg",
    alt: "Joyful Indian couple candidly laughing together in warm sunset golden hour",
  },
];

export function HeroSection({ className = "" }: HeroSectionProps) {
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null);

  const handleScrollToRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById("quick-register");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      const nameInput = el.querySelector<HTMLInputElement>('input[type="text"]');
      if (nameInput) {
        setTimeout(() => {
          nameInput.focus({ preventScroll: true });
        }, 450);
      }
    } else {
      window.location.hash = "quick-register";
    }
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className={cn(
        "relative overflow-hidden bg-transparent pt-0 pb-16 sm:pt-8 sm:pb-28 lg:pt-12 lg:pb-36 z-[1]",
        className
      )}
    >
      {/* Enhanced Botanical Layer with lower corner accents & atmospheric glows */}
      <BotanicalLayer
        showTopLeft={false}
        showTopRight={false}
        showBottomLeft={true}
        showBottomRight={true}
      />

      {/* Soft ambient green & warm gold background glows */}
      <div
        className="pointer-events-none absolute -top-24 right-0 h-[32rem] w-[32rem] rounded-full bg-[var(--primary)]/6 blur-3xl lg:h-[40rem] lg:w-[40rem]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -left-20 h-[24rem] w-[24rem] rounded-full bg-[var(--accent)]/8 blur-3xl sm:h-[30rem] sm:w-[30rem]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-0 sm:px-6 lg:px-8">
        {/* Mobile View Hero Layout: Edge-to-Edge Immersive Couple Visual with Mid-to-Bottom Overlay */}
        <div className="block lg:hidden animate-hero-fade">
          <div className="relative w-full overflow-hidden bg-neutral-950 min-h-[calc(100svh-20px)] sm:min-h-[780px] flex flex-col justify-between">
            {/* Background Couple Image with Edge-to-Edge Fit */}
            <div className="absolute inset-0 z-0">
              <img
                src="/images/hero-1.jpg"
                alt="Couple celebrating meaningful connection"
                className="h-full w-full object-cover object-[center_18%] scale-[1.02]"
              />
              {/* Top ambient shadow for transparent header & badges */}
              <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/75 via-black/30 to-transparent" />

              {/* Bottom gradient overlay focused behind bottom text & buttons */}
              <div className="absolute inset-x-0 bottom-0 h-[54%] bg-gradient-to-t from-[#100104] via-[#22030B]/95 via-42% to-transparent" />
            </div>

            {/* Top Bar Floating Badges (Positioned below transparent header) */}
            <div className="relative z-10 px-5 pt-22 sm:pt-26 flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/60 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
                <IconHeart className="h-3.5 w-3.5 text-rose-400 fill-rose-400" />
                <span>Let's CHAT</span>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/60 backdrop-blur-md px-3.5 py-1.5 text-[11px] font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>100% Verified</span>
              </div>
            </div>

            {/* Bottom Content Overlay: Middle to Bottom */}
            <div className="relative z-10 px-5 sm:px-6 pb-10 sm:pb-12 pt-6 flex flex-col gap-3.5">
              {/* Main Headline */}
              <h1 className="text-2.5xl sm:text-3xl font-bold tracking-tight text-white leading-[1.2] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                Discover meaningful{" "}
                <span className="text-amber-200 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] inline-block font-extrabold">
                  connections today.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                <strong className="font-semibold text-white">Register Free</strong> — Create your profile and discover meaningful connections for Friendship, Marriage, and Living Together.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-1">
                <Button
                  href="#quick-register"
                  onClick={handleScrollToRegister}
                  variant="primary"
                  className="w-full min-h-12 text-sm font-bold shadow-[0_10px_25px_rgba(225,29,72,0.35)] bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 hover:from-rose-600 hover:to-rose-500 text-white border border-rose-400/30"
                  rightIcon={<IconArrowRight className="h-4 w-4" aria-hidden="true" />}
                >
                  Register Free
                </Button>

                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    href="/login"
                    className="w-full min-h-11 px-3 text-xs font-semibold rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md transition shadow-sm"
                  >
                    Login
                  </Button>

                  <Button
                    href="#contact"
                    className="w-full min-h-11 px-3 text-xs font-semibold rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md transition shadow-sm"
                  >
                    Contact Us
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop View Hero Layout (lg and above) */}
        <div className="hidden lg:grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
          {/* Left Content Column */}
          <div className="animate-hero-fade">
            <TrustBadge
              icon={<IconHeart className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden="true" fill="currentColor" />}
              label="Welcome to Let's CHAT .Com"
              className="mb-5 sm:mb-6"
            />

            <h1
              id="hero-heading"
              className="text-balance text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-bold leading-[1.15] tracking-[-0.03em] text-[var(--foreground)]"
            >
              Discover meaningful{" "}
              <span className="text-[var(--primary)] inline-block">
                connections today.
              </span>
            </h1>

            <p className="mt-5 sm:mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[var(--muted)] font-normal">
              <strong className="font-semibold text-[var(--foreground)]">Register Free</strong> — Create your profile and discover meaningful connections. Explore categories for Friendship, Marriage, and Living Together.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-3.5 sm:mt-10">
              <Button
                href="#quick-register"
                onClick={handleScrollToRegister}
                variant="primary"
                className="w-full sm:w-auto min-h-12 px-6 sm:px-8 text-sm sm:text-base font-semibold shadow-[0_14px_30px_var(--primary-shadow-strong)]"
                rightIcon={<IconArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                Register Free
              </Button>

              <div className="grid grid-cols-2 gap-3 w-full sm:w-auto sm:flex sm:items-center sm:gap-3.5">
                <Button
                  href="/login"
                  variant="secondary"
                  className="w-full sm:w-auto min-h-12 px-5 sm:px-8 text-sm sm:text-base font-semibold"
                >
                  Login
                </Button>

                <Button
                  href="#contact"
                  variant="secondary"
                  className="w-full sm:w-auto min-h-12 px-5 sm:px-7 text-sm sm:text-base font-bold text-[var(--muted-strong)] hover:text-[var(--primary)]"
                >
                  Contact Us
                </Button>
              </div>
            </div>

            {/* Trust Features */}
            <div className="mt-8 flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-3 border-t border-[var(--border)] pt-6 sm:mt-10">
              <TrustFeature label="Privacy-first" className="text-xs sm:text-sm" />
              <TrustFeature label="Verified profiles" className="text-xs sm:text-sm" />
              <TrustFeature label="Mobile ready" className="text-xs sm:text-sm" />
            </div>
          </div>

          {/* Right Visual Column */}
          <div className="relative mx-auto w-full max-w-md sm:max-w-lg lg:max-w-none">
            {/* Subtle decorative champagne frame accent */}
            <div
              className="pointer-events-none absolute -inset-3 sm:-inset-4 rounded-[2.5rem] sm:rounded-[3rem] border border-[var(--accent)]/25"
              aria-hidden="true"
            />

            {/* Main Couple Photo Container */}
            <CinematicHeroImage
              images={HERO_IMAGES}
              hoveredProfile={hoveredProfile}
              className="origin-center"
            />

            {/* Floating Profile Card 1 - Top Left/Side */}
            <div
              className="absolute -top-4 -left-3 sm:-top-6 sm:-left-6 lg:-left-10 z-10 w-60 sm:w-68 cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
              onMouseEnter={() => setHoveredProfile("ananya")}
              onMouseLeave={() => setHoveredProfile(null)}
            >
              <HeroProfileCard
                profile={sampleProfiles[0]}
                animationVariant="float-1"
                className="scale-90 sm:scale-100 origin-top-left"
              />
            </div>

            {/* Floating Profile Card 2 - Bottom Right/Side */}
            <div
              className="absolute -bottom-4 -right-3 sm:-bottom-6 sm:-right-6 lg:-right-8 z-10 w-60 sm:w-68 cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
              onMouseEnter={() => setHoveredProfile("rohan")}
              onMouseLeave={() => setHoveredProfile(null)}
            >
              <HeroProfileCard
                profile={sampleProfiles[1]}
                animationVariant="float-2"
                className="scale-90 sm:scale-100 origin-bottom-right"
              />
            </div>

            {/* Connection Badge - Bottom Left */}
            <div className="absolute bottom-6 left-3 sm:bottom-8 sm:left-4 z-20">
              <ConnectionBadge
                title="Meaningful connections"
                subtitle="Values-aligned & verified"
                className="scale-90 sm:scale-100 origin-bottom-left"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Soft curved transition into the next section */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden leading-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 60"
          className="relative block h-8 w-full sm:h-12 lg:h-16"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C480,50 960,50 1440,0 L1440,60 L0,60 Z"
            fill="var(--surface)"
          />
        </svg>
      </div>
    </section>
  );
}
