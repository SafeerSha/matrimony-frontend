'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconShieldLock,
} from '@tabler/icons-react';
import { cn } from '@/lib/cn';

export interface SecureImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  profileName?: string;
  profileId?: string;
}

export function SecureImageViewer({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
  profileName,
  profileId,
}: SecureImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState<boolean>(false);
  const [captureBlocked, setCaptureBlocked] = useState<boolean>(false);

  // Touch swipe handling
  const touchStartXRef = useRef<number | null>(null);

  // Mount on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync index when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, Math.max(0, images.length - 1))));
      setIsWindowBlurred(false);
      setCaptureBlocked(false);
    }
  }, [isOpen, initialIndex, images.length]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Prevent default utility for mouse/touch security events
  const preventSecurityAction = useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, []);

  // ========================================================
  // SECURITY MEASURES: ANTI-SCREENSHOT & ANTI-RECORDING
  // ========================================================
  useEffect(() => {
    if (!isOpen) return;

    // 1. Lock background scrolling
    const origBodyOverflow = document.body.style.overflow;
    const origHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // 2. Window Blur & Document Visibility Change Detection
    // When external screen recording or Snipping Tool is activated, window loses focus
    const onWindowBlur = () => {
      setIsWindowBlurred(true);
    };

    const onWindowFocus = () => {
      setIsWindowBlurred(false);
    };

    const onVisibilityChange = () => {
      if (document.hidden || document.visibilityState !== 'visible') {
        setIsWindowBlurred(true);
      } else {
        setIsWindowBlurred(false);
      }
    };

    // 3. Keyboard Interception
    const onKeyDown = (e: KeyboardEvent) => {
      // Close on Escape
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Navigate with Left / Right arrows
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
        return;
      }

      // Intercept PrintScreen
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        setCaptureBlocked(true);
        try {
          navigator.clipboard?.writeText?.('');
        } catch {
          // Ignore clipboard permission errors
        }
        setTimeout(() => setCaptureBlocked(false), 1600);
        return;
      }

      // Intercept Save / Print / Copy / Source shortcuts
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 's' || key === 'p' || key === 'c' || key === 'u') {
          e.preventDefault();
          setCaptureBlocked(true);
          setTimeout(() => setCaptureBlocked(false), 1400);
          return;
        }
      }

      // Intercept F12 / DevTools
      if (e.key === 'F12') {
        e.preventDefault();
      }
    };

    // 4. Disable context menu on window level while viewer is open
    const onContextMenuWindow = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('focus', onWindowFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('keydown', onKeyDown, { capture: true });
    window.addEventListener('contextmenu', onContextMenuWindow, { capture: true });

    return () => {
      document.body.style.overflow = origBodyOverflow;
      document.documentElement.style.overflow = origHtmlOverflow;
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('focus', onWindowFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('keydown', onKeyDown, { capture: true });
      window.removeEventListener('contextmenu', onContextMenuWindow, { capture: true });
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    const SWIPE_THRESHOLD = 50;
    if (diff > SWIPE_THRESHOLD) {
      handleNext();
    } else if (diff < -SWIPE_THRESHOLD) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  if (!mounted || !isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];
  const isShielded = isWindowBlurred || captureBlocked;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Secure Full-Screen Image Viewer"
      className="fixed inset-0 z-[999999] select-none bg-black flex items-center justify-center overflow-hidden touch-none"
      onContextMenu={preventSecurityAction}
      onDragStart={preventSecurityAction}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {/* Print protection style: hides viewer on print/PDF export */}
      <style>{`
        @media print {
          body { display: none !important; }
        }
      `}</style>

      {/* Backdrop: Clicking backdrop outside image closes the viewer */}
      <div
        className="absolute inset-0 bg-black/95 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Minimal Top Close Trigger */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close full-screen image viewer"
        className="absolute top-5 right-5 z-40 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white backdrop-blur-md transition-all active:scale-95 focus:outline-hidden"
      >
        <IconX className="h-6 w-6 stroke-[2.2]" />
      </button>

      {/* Photo Counter Pill (subtle) */}
      {images.length > 1 && (
        <div className="absolute top-5 left-5 z-40 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/85 text-xs font-semibold tracking-wide border border-white/15">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Navigation Arrows for Multiple Photos */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous photo"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 grid h-12 w-12 place-items-center rounded-full bg-black/40 text-white/85 hover:bg-black/75 hover:text-white backdrop-blur-md border border-white/15 transition-all active:scale-95 focus:outline-hidden"
          >
            <IconChevronLeft className="h-7 w-7" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next photo"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 grid h-12 w-12 place-items-center rounded-full bg-black/40 text-white/85 hover:bg-black/75 hover:text-white backdrop-blur-md border border-white/15 transition-all active:scale-95 focus:outline-hidden"
          >
            <IconChevronRight className="h-7 w-7" />
          </button>
        </>
      )}

      {/* ======================================================== */}
      {/* IMAGE CONTAINER WITH "ishtamchat" WATERMARK & SHIELD      */}
      {/* ======================================================== */}
      <div
        className="relative z-30 inline-flex items-center justify-center overflow-hidden rounded-xl shadow-2xl max-h-[94vh] max-w-[95vw]"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={preventSecurityAction}
        onDragStart={preventSecurityAction}
      >
        {/* The Fullscreen Image */}
        <img
          src={currentImage}
          alt={profileName ? `${profileName} - Full-screen photo` : 'Member photo'}
          draggable={false}
          onContextMenu={preventSecurityAction}
          onDragStart={preventSecurityAction}
          className={cn(
            'max-h-[94vh] max-w-[95vw] w-auto h-auto object-contain select-none pointer-events-none transition-all duration-300 ease-out',
            isShielded && 'filter blur-3xl opacity-0 scale-95'
          )}
          style={{
            WebkitTouchCallout: 'none',
            userSelect: 'none',
          }}
        />

        {/* ======================================================== */}
        {/* REPEATING "ishtamchat" OVERLAY WATERMARK                  */}
        {/* ======================================================== */}
        <div
          className={cn(
            'absolute inset-0 pointer-events-none z-10 transition-opacity duration-300 overflow-hidden select-none',
            isShielded && 'opacity-0'
          )}
          aria-hidden="true"
        >
          {/* Tiled diagonal watermark SVG */}
          <svg
            className="w-full h-full opacity-50 select-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="ishtamchat-tiled-watermark"
                width="220"
                height="110"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(-25)"
              >
                <text
                  x="20"
                  y="45"
                  fill="rgba(255, 255, 255, 0.75)"
                  stroke="rgba(0, 0, 0, 0.85)"
                  strokeWidth="0.8"
                  fontSize="20"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  fontWeight="900"
                  letterSpacing="2.5"
                >
                  ishtamchat
                </text>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ishtamchat-tiled-watermark)" />
          </svg>
        </div>

        {/* Transparent Shield Layer: Sits directly over the image to block right-clicks, element inspections, and dragging */}
        <div
          className="absolute inset-0 z-20 pointer-events-auto cursor-default"
          onContextMenu={preventSecurityAction}
          onDragStart={preventSecurityAction}
        />

        {/* ======================================================== */}
        {/* ANTI-RECORDING / ANTI-SNIPPING PRIVACY SHIELD            */}
        {/* ======================================================== */}
        {isShielded && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/98 p-6 text-center animate-content-appear">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-rose-400 border border-white/15 shadow-xl mb-4">
              <IconShieldLock className="h-9 w-9 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Capture Protection Active
            </h3>
            <p className="mt-1 text-xs text-stone-300 max-w-xs">
              Screen recording and screen capture tools are restricted to safeguard member privacy on IshtamChat.
            </p>
            <p className="mt-3 text-[11px] text-stone-400 font-medium">
              Click or refocus the window to resume viewing.
            </p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
