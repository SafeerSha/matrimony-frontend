import React from 'react';
import { IconHeart } from '@tabler/icons-react';
import { cn } from '@/lib/cn';

export interface PageLoaderProps {
  className?: string;
  text?: string;
  subtitle?: string;
  fullScreen?: boolean;
  variant?: 'orbital' | 'compact';
  showBackgroundDecor?: boolean;
}

export function PageLoader({
  className,
  text = "Loading profile details...",
  subtitle = "Just a moment while we get everything ready",
  fullScreen = false,
  variant = "orbital",
  showBackgroundDecor = true,
}: PageLoaderProps) {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3",
          fullScreen ? "fixed inset-0 z-50 bg-[var(--background)]" : "min-h-[200px] w-full",
          className
        )}
        role="status"
        aria-live="polite"
      >
        <div className="relative flex items-center justify-center h-12 w-12">
          <div
            className="absolute inset-0 rounded-full bg-[var(--primary)]/20 animate-ping"
            style={{ animationDuration: '2s' }}
          />
          <div
            className="absolute -inset-1.5 rounded-full border-2 border-transparent border-t-[var(--primary)] border-r-[var(--primary)]/40 animate-spin"
            style={{ animationDuration: '1.2s' }}
          />
          <div className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-md border border-[var(--primary)]/10 shadow-xs flex items-center justify-center relative z-10">
            <IconHeart className="h-4 w-4 text-[var(--primary)] fill-current" />
          </div>
        </div>
        {text && (
          <span className="text-xs font-semibold text-[var(--primary)]">
            {text}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden py-10 px-4",
        fullScreen
          ? "fixed inset-0 z-50 bg-[#FAF7F4]"
          : "min-h-[460px] sm:min-h-[520px] w-full rounded-3xl",
        showBackgroundDecor && "bg-gradient-to-b from-[#FFFDFB] via-[#FAF6F3] to-[#F7F2ED] border border-[#F0E4D8]/70 shadow-[0_8px_32px_rgba(26,12,18,0.03)]",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* ======================================================== */}
      {/* 1. LUXURY BACKGROUND DECORATION (Watermarks & Ambiance)   */}
      {/* ======================================================== */}
      {showBackgroundDecor && (
        <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden="true">
          {/* Subtle blush-pink radial lighting */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,rgba(225,112,142,0.07)_0%,transparent_70%)]" />

          {/* Soft ambient corner glow orbs */}
          <div className="absolute -top-16 -left-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(216,178,140,0.09)_0%,transparent_70%)] blur-2xl" />
          <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(158,29,59,0.06)_0%,transparent_70%)] blur-2xl" />

          {/* Large, low-opacity decorative watermark hearts around edges */}
          <div className="absolute top-4 left-4 text-[#9E1D3B] opacity-[0.035] -rotate-12 transition-transform duration-1000">
            <svg className="w-36 h-36 sm:w-48 sm:h-48" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>

          <div className="absolute bottom-6 right-4 text-[#C99757] opacity-[0.035] rotate-12 transition-transform duration-1000">
            <svg className="w-40 h-40 sm:w-52 sm:h-52" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SOPHISTICATED ORBITAL ANIMATION                        */}
      {/* ======================================================== */}
      <div className="relative flex items-center justify-center w-56 h-56 sm:w-64 sm:h-64 my-4">
        {/* Ambient aura glow behind orbits */}
        <div 
          className="absolute h-36 w-36 rounded-full bg-gradient-to-tr from-[#9E1D3B]/10 via-[#D8B28C]/12 to-transparent blur-2xl pointer-events-none" 
          aria-hidden="true" 
        />

        {/* Concentric Orbital Rings (Solid and Dotted) */}
        {/* Ring 1: Outer Solid / Subtle Track */}
        <div 
          className="absolute h-52 w-52 sm:h-60 sm:w-60 rounded-full border border-[#9E1D3B]/15 pointer-events-none" 
          aria-hidden="true"
        />

        {/* Ring 2: Middle Dotted Orbital Path */}
        <div 
          className="absolute h-40 w-40 sm:h-46 sm:w-46 rounded-full border border-dashed border-[#C99757]/35 pointer-events-none" 
          aria-hidden="true"
        />

        {/* Ring 3: Inner Solid Orbit */}
        <div 
          className="absolute h-28 w-28 sm:h-32 sm:w-32 rounded-full border border-[#EEDCC8] pointer-events-none" 
          aria-hidden="true"
        />

        {/* Rotating Orbital Track 1 (Outer - Burgundy Particle) */}
        <div 
          className="absolute h-52 w-52 sm:h-60 sm:w-60 rounded-full animate-ishtam-orbit-cw pointer-events-none"
          aria-hidden="true"
        >
          {/* Deep Burgundy Orbiting Particle */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
            {/* Glowing aura effect */}
            <div className="absolute h-6 w-6 rounded-full bg-[#801835]/35 blur-sm" />
            {/* Main particle sphere */}
            <div className="relative h-3 w-3 rounded-full bg-gradient-to-br from-[#9E1D3B] via-[#801835] to-[#550E20] shadow-[0_0_12px_rgba(128,24,53,0.7),0_0_22px_rgba(128,24,53,0.35)] ring-1 ring-white/50" />
          </div>
        </div>

        {/* Rotating Orbital Track 2 (Middle - Muted Gold Particle) */}
        <div 
          className="absolute h-40 w-40 sm:h-46 sm:w-46 rounded-full animate-ishtam-orbit-ccw pointer-events-none"
          aria-hidden="true"
        >
          {/* Muted Gold Orbiting Particle */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center">
            {/* Glowing aura effect */}
            <div className="absolute h-5 w-5 rounded-full bg-[#C99757]/30 blur-sm" />
            {/* Main particle sphere */}
            <div className="relative h-2.5 w-2.5 rounded-full bg-gradient-to-br from-[#E8CA9D] via-[#C99757] to-[#A37438] shadow-[0_0_10px_rgba(201,151,87,0.7),0_0_18px_rgba(201,151,87,0.35)] ring-1 ring-white/60" />
          </div>
        </div>

        {/* Central Circular Element with IshtamChat Heart Symbol */}
        <div className="relative z-10 flex items-center justify-center">
          {/* Soft circular background behind central element */}
          <div className="h-18 w-18 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-[#FFFDFB] via-[#FFF5F2] to-[#FCEEF1] border border-[#F1DFD5] shadow-[0_10px_26px_rgba(122,24,53,0.12),inset_0_2px_4px_rgba(255,255,255,0.95)] flex items-center justify-center">
            {/* Pulsing Central Heart */}
            <div className="animate-ishtam-heart-pulse flex items-center justify-center">
              <IconHeart 
                className="h-8 w-8 sm:h-9 sm:w-9 text-[#801835] fill-[#801835] drop-shadow-[0_2px_4px_rgba(128,24,53,0.25)]" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CENTERED LUXURY TYPOGRAPHY & ANIMATED DOTS            */}
      {/* ======================================================== */}
      <div className="relative z-10 flex flex-col items-center text-center gap-1.5 max-w-sm px-4 pt-2 pb-2">
        {/* Primary text in deep burgundy */}
        <h3 className="text-base sm:text-lg font-bold text-[#6A122A] tracking-tight font-editorial-title">
          {text}
        </h3>

        {/* Secondary text in muted warm grey / rose */}
        {subtitle && (
          <p className="text-xs sm:text-sm text-[#8A7279] font-medium leading-relaxed max-w-xs">
            {subtitle}
          </p>
        )}

        {/* Three small animated dots below description */}
        <div className="flex items-center justify-center gap-2 pt-2" aria-hidden="true">
          <span className="h-1.5 w-1.5 rounded-full bg-[#801835] animate-ishtam-dot-1" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#C99757] animate-ishtam-dot-2" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#801835] animate-ishtam-dot-3" />
        </div>
      </div>
    </div>
  );
}
