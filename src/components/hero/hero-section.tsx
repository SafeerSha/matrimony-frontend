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
        "relative overflow-hidden bg-transparent pt-4 pb-20 sm:pt-8 sm:pb-28 lg:pt-12 lg:pb-36 z-[1]",
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

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
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
              <strong className="font-semibold text-[var(--foreground)]">Register Free</strong> — Create your profile and discover meaningful connections. Explore categories for Friendship, Marriage, Living Together, Malayalam Matrimony, and Telugu Matrimony.
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
