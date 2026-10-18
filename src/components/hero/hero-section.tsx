"use client";

import { IconArrowRight, IconHeart, IconMessage, IconUsers, IconHomeHeart, IconShieldCheck, IconLock } from '@tabler/icons-react';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TrustBadge } from "./trust-badge";
import { TrustFeature } from "./trust-feature";
import { ConnectionBadge } from "./connection-badge";
import { CinematicHeroImage, type HeroImageData } from "./cinematic-hero-image";
import { BotanicalLayer } from "./botanical-layer";
import { LookingForModal, type LookingForOption, type MatrimonyCommunityOption } from "./looking-for-modal";
import { cn } from "@/lib/cn";

export interface HeroSectionProps {
  className?: string;
}

const HERO_SLIDES = [
  {
    id: "marriage",
    category: "Marriage",
    title: "Explore for Marriage",
    subtitle: "Values-aligned & verified",
    src: "/images/hero-mobile-1.jpg",
    desktopSrc: "/images/hero-1.jpg",
    alt: "Smiling Indian couple in traditional wedding attire celebrating marriage",
    objectPosition: "center 18%",
    iconBoxClass: "bg-rose-50 text-rose-700 ring-rose-200/70",
  },
  {
    id: "friendship",
    category: "Friendship",
    title: "Explore for Friendship",
    subtitle: "Meaningful bonds & shared vibes",
    src: "/images/hero-friendship.jpg",
    desktopSrc: "/images/hero-friendship.jpg",
    alt: "Young Indian friends laughing together at a sunny cafe terrace representing Friendship",
    objectPosition: "center 22%",
    iconBoxClass: "bg-amber-50 text-amber-700 ring-amber-200/70",
  },
  {
    id: "living-together",
    category: "Living Together",
    title: "Explore for Living Together",
    subtitle: "Modern partners & compatible living",
    src: "/images/hero-living-together.jpg",
    desktopSrc: "/images/hero-living-together.jpg",
    alt: "Modern Indian couple in cozy contemporary home representing Living Together",
    objectPosition: "center 18%",
    iconBoxClass: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  },
];

const HERO_IMAGES: HeroImageData[] = [
  {
    id: "hero-1",
    src: "/images/hero-1.jpg",
    alt: "Smiling Indian couple in traditional wedding attire celebrating marriage",
  },
  {
    id: "hero-friendship",
    src: "/images/hero-friendship.jpg",
    alt: "Young Indian friends laughing together at a sunny cafe terrace representing Friendship",
  },
  {
    id: "hero-living-together",
    src: "/images/hero-living-together.jpg",
    alt: "Modern Indian couple in contemporary home representing Living Together",
  },
];

export function HeroSection({ className = "" }: HeroSectionProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [isHeroHovered, setIsHeroHovered] = useState<boolean>(false);
  const [isLookingForOpen, setIsLookingForOpen] = useState<boolean>(false);

  // Automatically cycle through Marriage, Friendship, and Living Together every 4.5 seconds with smooth fade
  useEffect(() => {
    if (isHeroHovered || isLookingForOpen) return;

    const timer = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [isHeroHovered, isLookingForOpen]);

  const handleOpenLookingFor = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsLookingForOpen(true);
  };

  const handleSelectLookingForOption = (
    option: LookingForOption,
    community?: MatrimonyCommunityOption
  ) => {
    setIsLookingForOpen(false);

    // Sync active slide in hero preview
    const slideIdx = option === "Friendship" ? 1 : option === "Living-together" ? 2 : 0;
    setActiveSlideIndex(slideIdx);

    // Dispatch selection to QuickRegisterSection
    const mappedCategory = option === "Living-together" ? "Living Together" : option;
    window.dispatchEvent(
      new CustomEvent("ishtam:select-category", {
        detail: {
          category: mappedCategory,
          community: community,
        },
      })
    );

    // Smoothly scroll down to quick-register section and focus name input
    setTimeout(() => {
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
    }, 120);
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className={cn(
        "relative overflow-hidden bg-transparent pt-0 pb-0 sm:pt-8 sm:pb-28 lg:pt-12 lg:pb-36 z-[1]",
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

      {/* Soft ambient green & warm gold background glows (desktop/tablet only to save mobile GPU) */}
      <div
        className="pointer-events-none absolute -top-24 right-0 hidden sm:block h-[32rem] w-[32rem] rounded-full bg-[var(--primary)]/6 blur-3xl lg:h-[40rem] lg:w-[40rem]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -left-20 hidden sm:block h-[24rem] w-[24rem] rounded-full bg-[var(--accent)]/8 blur-3xl sm:h-[30rem] sm:w-[30rem]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-0 sm:px-6 lg:px-8">
        {/* Mobile View Hero Layout: Edge-to-Edge Immersive Visual with Auto-Switching Fade Transitions */}
        <div className="block lg:hidden animate-hero-fade">
          <div className="relative w-full overflow-hidden bg-neutral-950 h-screen h-[100svh] min-h-[100svh] max-h-[100svh] flex flex-col justify-end touch-pan-y">
            {/* Background Couple Images with Smooth Crossfade Transition */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-neutral-950">
              {HERO_SLIDES.map((slide, idx) => {
                const isActive = idx === activeSlideIndex;
                return (
                  <div
                    key={slide.id}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                      isActive ? "opacity-100 z-[1]" : "opacity-0 z-0 pointer-events-none"
                    )}
                    style={{ willChange: "opacity", transform: "translateZ(0)" }}
                  >
                    <img
                      src={slide.src}
                      alt={slide.alt}
                      className={cn(
                        "h-full w-full object-cover transition-transform duration-[5500ms] ease-out will-change-transform",
                        isActive ? "scale-105" : "scale-100"
                      )}
                      style={{ objectPosition: slide.objectPosition, transform: "translateZ(0)" }}
                    />
                  </div>
                );
              })}

              {/* Top ambient shadow for transparent header & badges */}
              <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/75 via-black/30 to-transparent z-[2] pointer-events-none" />

              {/* Bottom gradient overlay focused behind bottom text & buttons */}
              <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-[#100104] via-[#22030B]/95 via-42% to-transparent z-[2] pointer-events-none" />
            </div>

            {/* Bottom Content Overlay: Middle to Bottom */}
            <div className="relative z-10 px-5 sm:px-6 pb-7 sm:pb-9 pt-4 flex flex-col gap-3">
              {/* Category indicator & Slide dots */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/35 bg-black/55 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-amber-200 shadow-sm transition-all duration-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                  <span>Explore for {HERO_SLIDES[activeSlideIndex].category}</span>
                </span>

                <div className="flex items-center gap-1.5" aria-label="Slides">
                  {HERO_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => setActiveSlideIndex(idx)}
                      className={cn(
                        "h-1 rounded-full transition-all duration-500 cursor-pointer",
                        idx === activeSlideIndex
                          ? "w-6 bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.8)]"
                          : "w-2 bg-white/40 hover:bg-white/70"
                      )}
                      aria-label={`Switch to ${slide.category}`}
                    />
                  ))}
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-3.5xl font-extrabold tracking-tight text-white leading-[1.16] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)]">
                Discover meaningful{" "}
                <span className="text-amber-200 drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] inline-block font-black">
                  connections today
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
                <strong className="font-semibold text-white">Register Free</strong> — Create your profile and discover meaningful connections for Friendship, Marriage, and Living Together.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-1">
                <Button
                  onClick={handleOpenLookingFor}
                  variant="primary"
                  className="w-full min-h-12 text-sm font-bold shadow-[0_12px_28px_rgba(122,20,40,0.45)] bg-gradient-to-r from-[#7A1428] via-[#8C1D33] to-[#7A1428] hover:from-[#8C1D33] hover:to-[#6E1224] text-white border border-white/20 active:scale-[0.99] transition-all"
                  rightIcon={<IconArrowRight className="h-4 w-4" aria-hidden="true" />}
                >
                  Register Free
                </Button>

                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    href="/login"
                    className="w-full min-h-11 px-3 text-xs font-semibold rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-md transition shadow-sm"
                  >
                    Sign In
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
              label="Welcome to IshtamChat"
              className="mb-5 sm:mb-6"
            />

            <h1
              id="hero-heading"
              className="text-balance text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] font-bold leading-[1.15] tracking-[-0.03em] text-[var(--foreground)]"
            >
              Discover meaningful{" "}
              <span className="text-[var(--primary)] inline-block">
                connections today
              </span>
            </h1>

            <p className="mt-5 sm:mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[var(--muted)] font-normal">
              <strong className="font-semibold text-[var(--foreground)]">Register Free</strong> — Create your profile and discover meaningful connections. Explore categories for Friendship, Marriage, and Living Together.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-3.5 sm:mt-10">
              <Button
                onClick={handleOpenLookingFor}
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
                  Sign In
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
              activeSlideIndex={activeSlideIndex}
              onHoverChange={setIsHeroHovered}
              className="origin-center"
            />

            {/* Floating Trust Badge 1 - Top Left: 100% Verified Profiles */}
            <div className="absolute -top-3 -left-3 sm:-top-5 sm:-left-6 lg:-left-8 z-10 transition-transform duration-300 hover:scale-[1.02]">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_12px_28px_rgba(42,7,17,0.12)]">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/80 shrink-0">
                  <IconShieldCheck className="h-5 w-5" />
                </span>
                <div className="text-left">
                  <p className="text-xs font-bold text-[var(--foreground)]">100% Verified Members</p>
                  <p className="text-[11px] text-[var(--muted)]">Manual &amp; Document Screened</p>
                </div>
              </div>
            </div>

            {/* Floating Trust Badge 2 - Bottom Right: Privacy First */}
            <div className="absolute -bottom-3 -right-3 sm:-bottom-5 sm:-right-6 lg:-right-6 z-10 transition-transform duration-300 hover:scale-[1.02]">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_12px_28px_rgba(42,7,17,0.12)]">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-200/80 shrink-0">
                  <IconLock className="h-5 w-5" />
                </span>
                <div className="text-left">
                  <p className="text-xs font-bold text-[var(--foreground)]">Privacy-First Controls</p>
                  <p className="text-[11px] text-[var(--muted)]">Encrypted &amp; Protected Sharing</p>
                </div>
              </div>
            </div>

            {/* Dynamic Category Card - Bottom Left (Changes with Marriage, Friendship, and Living Together) */}
            <div
              className="absolute bottom-6 left-3 sm:bottom-8 sm:left-4 z-20"
              onMouseEnter={() => setIsHeroHovered(true)}
              onMouseLeave={() => setIsHeroHovered(false)}
            >
              <ConnectionBadge
                title={HERO_SLIDES[activeSlideIndex].title}
                subtitle={HERO_SLIDES[activeSlideIndex].subtitle}
                icon={
                  activeSlideIndex === 0 ? (
                    <IconHeart className="h-5 w-5 fill-current" aria-hidden="true" />
                  ) : activeSlideIndex === 1 ? (
                    <IconUsers className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <IconHomeHeart className="h-5 w-5" aria-hidden="true" />
                  )
                }
                iconBoxClassName={HERO_SLIDES[activeSlideIndex].iconBoxClass}
                activeCategoryIndex={activeSlideIndex}
                totalCategories={HERO_SLIDES.length}
                onSelectCategory={(idx) => setActiveSlideIndex(idx)}
                onClick={() => setActiveSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
                className="scale-90 sm:scale-100 origin-bottom-left"
              />
            </div>

          </div>
        </div>
      </div>

      {/* Soft curved transition into the next section (tablet/desktop only) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden leading-none hidden sm:block"
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
      {/* Looking For Glassmorphism Selection Modal */}
      <LookingForModal
        isOpen={isLookingForOpen}
        onClose={() => setIsLookingForOpen(false)}
        onSelectOption={handleSelectLookingForOption}
      />
    </section>
  );
}
