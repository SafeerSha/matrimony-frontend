"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

export interface HeroImageData {
  id: string;
  src: string;
  alt: string;
}

export interface CinematicHeroImageProps {
  images: HeroImageData[];
  className?: string;
  hoveredProfile?: string | null;
  activeSlideIndex?: number;
  onHoverChange?: (isHovered: boolean) => void;
}

export function CinematicHeroImage({
  images,
  className = "",
  hoveredProfile = null,
  activeSlideIndex,
  onHoverChange,
}: CinematicHeroImageProps) {
  const [activeId, setActiveId] = useState<string>(images[0]?.id || "hero-1");
  const [previousId, setPreviousId] = useState<string | null>(null);
  const [isHeroHovered, setIsHeroHovered] = useState<boolean>(false);
  const [hasFinePointer, setHasFinePointer] = useState<boolean>(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  const clearPrevTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check for fine pointer (desktop mouse vs touchscreen) and reduced motion preference
  useEffect(() => {
    if (typeof window === "undefined") return;

    const pointerMql = window.matchMedia("(pointer: fine)");
    setHasFinePointer(pointerMql.matches);
    const onPointerChange = (e: MediaQueryListEvent) => setHasFinePointer(e.matches);
    pointerMql.addEventListener("change", onPointerChange);

    const motionMql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionMql.matches);
    const onMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionMql.addEventListener("change", onMotionChange);

    // Eagerly preload and decode all alternate hero images so crossfade is instantaneous and never flashes
    images.forEach((item) => {
      const img = new window.Image();
      img.src = item.src;
    });

    return () => {
      pointerMql.removeEventListener("change", onPointerChange);
      motionMql.removeEventListener("change", onMotionChange);
    };
  }, [images]);

  const [autoIndex, setAutoIndex] = useState<number>(0);

  // Automatically cycle through category images if not controlled by parent
  useEffect(() => {
    if (activeSlideIndex !== undefined) return;
    if (isHeroHovered || Boolean(hoveredProfile)) return;

    const timer = setInterval(() => {
      setAutoIndex((prev) => (prev + 1) % 3);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeSlideIndex, isHeroHovered, hoveredProfile]);

  // Determine which image should be target based on user hover state or active category
  const targetId = (() => {
    if (hoveredProfile === "ananya") return "hero-2";
    if (hoveredProfile === "rohan") return "hero-3";
    const selectedIdx = activeSlideIndex !== undefined ? activeSlideIndex : autoIndex;
    return images[selectedIdx]?.id || images[0]?.id || "hero-1";
  })();

  // Trigger smooth crossfade whenever targetId changes
  useEffect(() => {
    if (targetId === activeId) return;

    if (prefersReducedMotion) {
      setPreviousId(null);
      setActiveId(targetId);
      return;
    }

    setPreviousId(activeId);
    setActiveId(targetId);

    if (clearPrevTimeoutRef.current) {
      clearTimeout(clearPrevTimeoutRef.current);
    }

    // Keep previous image mounted and visible during crossfade (1400ms duration)
    clearPrevTimeoutRef.current = setTimeout(() => {
      setPreviousId(null);
    }, 1450);

    return () => {
      if (clearPrevTimeoutRef.current) {
        clearTimeout(clearPrevTimeoutRef.current);
      }
    };
  }, [targetId, activeId, prefersReducedMotion]);

  // Main hero image hover handlers (guarded for desktop pointer)
  const handleMouseEnter = () => {
    if (!hasFinePointer) return;
    setIsHeroHovered(true);
    onHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    if (!hasFinePointer) return;
    setIsHeroHovered(false);
    onHoverChange?.(false);
  };


  // Optional tap handler for mobile/touch devices (cycles through images safely without scroll interference)
  const handleTap = () => {
    if (hasFinePointer) return; // Only for touch devices
    const currentIndex = images.findIndex((img) => img.id === activeId);
    const nextIndex = (currentIndex + 1) % images.length;
    setActiveId(images[nextIndex].id);
  };

  const isInteracting = isHeroHovered || Boolean(hoveredProfile);

  return (
    <div
      className={cn(
        "relative mx-auto aspect-[3/4] w-full max-w-[420px] sm:max-w-[460px] lg:max-w-[480px] overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-[var(--border)] bg-[var(--surface-muted)] shadow-[0_24px_70px_var(--hero-shadow)] select-none",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleTap}
      role="region"
      aria-label="Matrimony featured photography"
    >
      {/* Stacked Image Layers */}
      {images.map((img) => {
        const isActive = img.id === activeId;
        const isPrevious = img.id === previousId;

        // z-index layering:
        // Active image dissolves in on top (z-index 3)
        // Previous image dissolves out underneath (z-index 2)
        // Non-active images sit ready at z-index 1
        const zIndex = isActive ? 3 : isPrevious ? 2 : 1;
        const opacity = isActive ? 1 : 0;

        // Subtle cinematic breathing scale during active interaction: 1 -> 1.015 -> 1
        const scaleClass =
          isActive && isInteracting && !prefersReducedMotion
            ? "scale-[1.015]"
            : "scale-100";

        return (
          <div
            key={img.id}
            className={cn(
              "absolute inset-0 h-full w-full overflow-hidden transition-all ease-in-out",
              scaleClass
            )}
            style={{
              opacity,
              zIndex,
              transitionDuration: prefersReducedMotion ? "0ms" : "1400ms",
              transitionProperty: "opacity, transform",
            }}
            aria-hidden={!isActive}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority
              sizes="(max-width: 640px) 92vw, (max-width: 1024px) 460px, 480px"
              className="object-cover object-center"
            />
          </div>
        );
      })}

      {/* Persistent natural bottom vignette for text contrast and depth */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/25 via-black/5 to-transparent z-[5]"
        aria-hidden="true"
      />
    </div>
  );
}
