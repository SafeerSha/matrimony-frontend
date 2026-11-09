'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  IconX,
  IconChevronLeft,
  IconChevronRight,
  IconShieldLock,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
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
}: SecureImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isWindowBlurred, setIsWindowBlurred] = useState<boolean>(false);
  const [captureBlocked, setCaptureBlocked] = useState<boolean>(false);

  // Zoom & Pan State for Mobile & Desktop Gestures
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);

  // Touch gesture tracking references
  const initialDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTapRef = useRef<number>(0);
  const touchStartXRef = useRef<number | null>(null);

  // Reset zoom helper
  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // Mount on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync index and reset zoom when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, Math.max(0, images.length - 1))));
      setIsWindowBlurred(false);
      setCaptureBlocked(false);
      resetZoom();
    }
  }, [isOpen, initialIndex, images.length, resetZoom]);

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return;
    resetZoom();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length, resetZoom]);

  const handleNext = useCallback(() => {
    if (images.length <= 1) return;
    resetZoom();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length, resetZoom]);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(4, Number((prev + 0.5).toFixed(1))));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(1, Number((prev - 0.5).toFixed(1)));
      if (next <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  }, []);

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

      // Navigate with Left / Right arrows if not zoomed in
      if (scale <= 1) {
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
  }, [isOpen, onClose, handleNext, handlePrev, scale]);

  // ========================================================
  // MOBILE GESTURES: PINCH-ZOOM, DRAG/PAN, DOUBLE-TAP & SWIPE
  // ========================================================
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // 2 fingers: pinch-to-zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialDistanceRef.current = dist;
      initialScaleRef.current = scale;
    } else if (e.touches.length === 1) {
      // 1 finger: detect double-tap or drag
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;

      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        // Double-tap detected: toggle zoom between 1x and 2.5x
        if (scale > 1) {
          resetZoom();
        } else {
          setScale(2.5);
          setPosition({ x: 0, y: 0 });
        }
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      if (scale > 1) {
        // Drag/pan when zoomed
        setIsPanning(true);
        dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        startPosRef.current = { ...position };
      } else {
        // Track swipe for photo navigation
        touchStartXRef.current = e.touches[0].clientX;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistanceRef.current) {
      // Pinch zooming
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / initialDistanceRef.current;
      const targetScale = Math.min(4, Math.max(1, Number((initialScaleRef.current * ratio).toFixed(2))));
      setScale(targetScale);
      if (targetScale <= 1) {
        setPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && scale > 1 && isPanning) {
      // Dragging / panning zoomed image
      const deltaX = e.touches[0].clientX - dragStartRef.current.x;
      const deltaY = e.touches[0].clientY - dragStartRef.current.y;

      const maxPanX = (scale - 1) * 220;
      const maxPanY = (scale - 1) * 300;

      const newX = Math.max(-maxPanX, Math.min(maxPanX, startPosRef.current.x + deltaX));
      const newY = Math.max(-maxPanY, Math.min(maxPanY, startPosRef.current.y + deltaY));
      setPosition({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsPanning(false);
      initialDistanceRef.current = null;

      // When at 1x, process horizontal swipe navigation
      if (scale === 1 && touchStartXRef.current !== null && e.changedTouches.length > 0) {
        const diff = touchStartXRef.current - e.changedTouches[0].clientX;
        const SWIPE_THRESHOLD = 50;
        if (diff > SWIPE_THRESHOLD) {
          handleNext();
        } else if (diff < -SWIPE_THRESHOLD) {
          handlePrev();
        }
        touchStartXRef.current = null;
      }
    }
  };

  // Mouse drag & scroll wheel support for desktop
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.2 : 0.8;
    setScale((prev) => {
      const next = Math.min(4, Math.max(1, Number((prev * zoomFactor).toFixed(2))));
      if (next <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsPanning(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      startPosRef.current = { ...position };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && scale > 1) {
      e.preventDefault();
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const maxPanX = (scale - 1) * 220;
      const maxPanY = (scale - 1) * 300;
      setPosition({
        x: Math.max(-maxPanX, Math.min(maxPanX, startPosRef.current.x + deltaX)),
        y: Math.max(-maxPanY, Math.min(maxPanY, startPosRef.current.y + deltaY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  if (!mounted || !isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];
  const isShielded = isWindowBlurred || captureBlocked;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Secure Full-Screen Image Viewer"
      className="fixed inset-0 z-[999999] select-none bg-black flex items-center justify-center overflow-hidden"
      onContextMenu={preventSecurityAction}
      onDragStart={preventSecurityAction}
      style={{
        WebkitUserSelect: 'none',
        userSelect: 'none',
        touchAction: 'none',
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
        onClick={() => {
          if (scale > 1) {
            resetZoom();
          } else {
            onClose();
          }
        }}
        aria-hidden="true"
      />

      {/* Top Floating Controls: Counter, Zoom In/Out & Close */}
      <div className="absolute top-5 inset-x-5 z-40 flex items-center justify-between pointer-events-none">
        {/* Photo Counter Pill (subtle) */}
        {images.length > 1 ? (
          <div className="px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md text-white/85 text-xs font-semibold tracking-wide border border-white/15 pointer-events-auto">
            {currentIndex + 1} / {images.length}
          </div>
        ) : (
          <div />
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 1}
            aria-label="Zoom out"
            title="Zoom out"
            className={cn(
              'grid h-10 w-10 place-items-center rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white/80 transition-all active:scale-95 focus:outline-hidden',
              scale <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-black/75 hover:text-white'
            )}
          >
            <IconZoomOut className="h-5 w-5" />
          </button>

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 4}
            aria-label="Zoom in"
            title="Zoom in"
            className={cn(
              'grid h-10 w-10 place-items-center rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-white/80 transition-all active:scale-95 focus:outline-hidden',
              scale >= 4 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-black/75 hover:text-white'
            )}
          >
            <IconZoomIn className="h-5 w-5" />
          </button>

          {/* Close Trigger */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close full-screen image viewer"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white/90 hover:bg-white/25 hover:text-white backdrop-blur-md transition-all active:scale-95 focus:outline-hidden ml-1"
          >
            <IconX className="h-5 w-5 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Navigation Arrows for Multiple Photos (only when not zoomed in) */}
      {images.length > 1 && scale <= 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous photo"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 grid h-12 w-12 place-items-center rounded-full bg-black/45 text-white/85 hover:bg-black/75 hover:text-white backdrop-blur-md border border-white/15 transition-all active:scale-95 focus:outline-hidden"
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
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 grid h-12 w-12 place-items-center rounded-full bg-black/45 text-white/85 hover:bg-black/75 hover:text-white backdrop-blur-md border border-white/15 transition-all active:scale-95 focus:outline-hidden"
          >
            <IconChevronRight className="h-7 w-7" />
          </button>
        </>
      )}

      {/* Reset Zoom Pill at bottom when zoomed in */}
      {scale > 1 && (
        <button
          type="button"
          onClick={resetZoom}
          className="absolute bottom-6 z-40 flex items-center gap-1.5 px-4 py-2 rounded-full bg-black/70 backdrop-blur-md border border-white/25 text-white/95 text-xs font-semibold shadow-2xl transition-all active:scale-95 hover:bg-black/85"
        >
          <IconZoomReset className="h-4 w-4" />
          <span>{Math.round(scale * 100)}% · Tap to reset</span>
        </button>
      )}

      {/* ======================================================== */}
      {/* IMAGE CONTAINER WITH ZOOM / PAN & STANDARD WATERMARKS    */}
      {/* ======================================================== */}
      <div
        className={cn(
          'relative z-20 inline-flex items-center justify-center rounded-xl select-none',
          scale > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
        )}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={() => {
          if (scale > 1) {
            resetZoom();
          } else {
            setScale(2.5);
            setPosition({ x: 0, y: 0 });
          }
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onContextMenu={preventSecurityAction}
        onDragStart={preventSecurityAction}
      >
        {/* Transforming Photo Wrapper (zooms and pans freely) */}
        <div
          className="relative inline-flex items-center justify-center select-none"
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${scale})`,
            transition: isPanning ? 'none' : 'transform 200ms ease-out',
            touchAction: 'none',
          }}
        >
          {/* The Fullscreen Image */}
          <img
            src={currentImage}
            alt={profileName ? `${profileName} - Full-screen photo` : 'Member photo'}
            draggable={false}
            onContextMenu={preventSecurityAction}
            onDragStart={preventSecurityAction}
            className={cn(
              'max-h-[94vh] max-w-[95vw] w-auto h-auto object-contain rounded-xl select-none pointer-events-none transition-all duration-300 ease-out shadow-2xl',
              isShielded && 'filter blur-3xl opacity-0 scale-95'
            )}
            style={{
              WebkitTouchCallout: 'none',
              userSelect: 'none',
            }}
          />

          {/* Transparent Shield Layer: Prevents right-click target extraction */}
          <div
            className="absolute inset-0 z-10 pointer-events-auto cursor-inherit"
            onContextMenu={preventSecurityAction}
            onDragStart={preventSecurityAction}
          />
        </div>

        {/* ======================================================== */}
        {/* STATIC "ishtamchat" OVERLAY (STANDARD 3-POINT COUNT)     */}
        {/* Stays in stationary 1x position strictly over photo area */}
        {/* ======================================================== */}
        <div
          className={cn(
            'absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 overflow-hidden select-none rounded-xl',
            isShielded && 'opacity-0'
          )}
          aria-hidden="true"
        >
          {/* 1. Upper-Left Diagonal Watermark */}
          <div className="absolute top-[22%] left-[26%] -translate-x-1/2 -translate-y-1/2 -rotate-[26deg] select-none pointer-events-none">
            <span
              className="text-sm sm:text-base font-black tracking-widest text-white/65 select-none uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
              style={{
                WebkitTextStroke: '0.6px rgba(0, 0, 0, 0.85)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              ishtamchat
            </span>
          </div>

          {/* 2. Center Primary Diagonal Watermark */}
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 -rotate-[26deg] select-none pointer-events-none">
            <span
              className="text-base sm:text-xl font-black tracking-widest text-white/75 select-none uppercase drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]"
              style={{
                WebkitTextStroke: '0.75px rgba(0, 0, 0, 0.9)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              ishtamchat
            </span>
          </div>

          {/* 3. Lower-Right Diagonal Watermark */}
          <div className="absolute top-[78%] left-[74%] -translate-x-1/2 -translate-y-1/2 -rotate-[26deg] select-none pointer-events-none">
            <span
              className="text-sm sm:text-base font-black tracking-widest text-white/65 select-none uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
              style={{
                WebkitTextStroke: '0.6px rgba(0, 0, 0, 0.85)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              ishtamchat
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ANTI-RECORDING / ANTI-SNIPPING PRIVACY SHIELD            */}
      {/* ======================================================== */}
      {isShielded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/98 p-6 text-center animate-content-appear">
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
    </div>,
    document.body
  );
}
