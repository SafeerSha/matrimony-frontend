import Image from "next/image";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrustBadge } from "./trust-badge";
import { TrustFeature } from "./trust-feature";
import { HeroProfileCard, type HeroProfile } from "./hero-profile-card";
import { ConnectionBadge } from "./connection-badge";
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

export function HeroSection({ className = "" }: HeroSectionProps) {
  return (
    <section
      aria-labelledby="hero-heading"
      className={cn(
        "relative overflow-hidden bg-[var(--background)] pt-4 pb-20 sm:pt-8 sm:pb-28 lg:pt-12 lg:pb-36",
        className
      )}
    >
      {/* Soft ambient green & warm gold background glows */}
      <div
        className="pointer-events-none absolute -top-24 right-0 h-[32rem] w-[32rem] rounded-full bg-[var(--primary)]/6 blur-3xl lg:h-[40rem] lg:w-[40rem]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -left-20 h-[24rem] w-[24rem] rounded-full bg-[var(--accent)]/8 blur-3xl sm:h-[30rem] sm:w-[30rem]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
          {/* Left Content Column */}
          <div className="animate-hero-fade">
            <TrustBadge
              icon={<Heart className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden="true" fill="currentColor" />}
              label="Curated for intentional matrimony"
              className="mb-5 sm:mb-6"
            />

            <h1
              id="hero-heading"
              className="text-balance text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-serif font-normal leading-[1.12] tracking-[-0.025em] text-[var(--foreground)]"
            >
              Find someone{" "}
              <span className="font-serif italic font-medium text-[var(--primary)]">
                to build a life with.
              </span>
            </h1>

            <p className="mt-5 sm:mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[var(--muted)]">
              Discover compatible people who share your values, aspirations and vision for the future.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5 sm:mt-10">
              <Button
                href="/login"
                variant="primary"
                className="min-h-12 px-6 text-sm sm:text-base font-semibold shadow-[0_14px_30px_var(--primary-shadow-strong)]"
              >
                Get started
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>

              <Button
                href="#how-it-works"
                variant="secondary"
                className="min-h-12 px-6 text-sm sm:text-base font-semibold"
              >
                How it works
              </Button>
            </div>

            {/* Trust Features */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[var(--border)] pt-6 sm:mt-10">
              <TrustFeature label="Privacy-first" />
              <TrustFeature label="Verified profiles" />
              <TrustFeature label="Mobile ready" />
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
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[420px] sm:max-w-[460px] lg:max-w-[480px] overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--border)] bg-[var(--surface-muted)] shadow-[0_24px_70px_var(--hero-shadow)]">
              <Image
                src="/images/hero-couple.jpg"
                alt="A smiling Indian couple in tasteful contemporary attire celebrating their connection"
                fill
                priority
                sizes="(max-width: 640px) 92vw, (max-width: 1024px) 460px, 480px"
                className="object-cover object-center transition duration-700 ease-out hover:scale-[1.02]"
              />

              {/* Natural bottom vignette for gentle depth */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/25 via-black/5 to-transparent"
                aria-hidden="true"
              />
            </div>

            {/* Floating Profile Card 1 - Top Left/Side */}
            <div className="absolute -top-4 -left-3 sm:-top-6 sm:-left-6 lg:-left-10 z-10 w-60 sm:w-68">
              <HeroProfileCard
                profile={sampleProfiles[0]}
                animationVariant="float-1"
                className="scale-90 sm:scale-100 origin-top-left"
              />
            </div>

            {/* Floating Profile Card 2 - Bottom Right/Side */}
            <div className="absolute -bottom-4 -right-3 sm:-bottom-6 sm:-right-6 lg:-right-8 z-10 w-60 sm:w-68">
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
