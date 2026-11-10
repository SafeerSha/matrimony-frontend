'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  IconX,
  IconArrowRight,
  IconRefresh,
  IconShieldCheck,
  IconSparkles,
  IconCrown,
  IconClock,
  IconAlertTriangle,
  IconHeartHandshake,
  IconCheck,
  IconLoader2,
  IconCopy,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { toast } from '@/lib/toast';

export type PaymentModalStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'USER_DROPPED' | null;

export interface PaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: PaymentModalStatus;
  orderId?: string;
  planName?: string;
  amount?: number;
  message?: string;
  onRetry?: () => void;
  onCheckStatus?: () => Promise<void> | void;
  onContinue?: () => void;
  autoCloseDuration?: number; // duration in ms, 0 to disable
}

export function PaymentStatusModal({
  isOpen,
  onClose,
  status,
  orderId,
  planName = 'Chat Permit',
  amount,
  message,
  onRetry,
  onCheckStatus,
  onContinue,
  autoCloseDuration: customAutoClose,
}: PaymentStatusModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Default auto-close durations:
  // SUCCESS: 5 seconds
  // USER_DROPPED: 4 seconds
  // PENDING / FAILED: 0 (disabled by default so user can read / retry, unless custom specified)
  const autoCloseDuration =
    customAutoClose !== undefined
      ? customAutoClose
      : status === 'SUCCESS'
      ? 5000
      : status === 'USER_DROPPED'
      ? 4000
      : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (!isOpen || autoCloseDuration <= 0) {
      setTimeLeft(0);
      return;
    }

    setTimeLeft(autoCloseDuration);
    const intervalMs = 50;

    const timer = setInterval(() => {
      if (isPaused) return;

      setTimeLeft((prev) => {
        if (prev <= intervalMs) {
          clearInterval(timer);
          if (status === 'SUCCESS' && onContinue) {
            onContinue();
          } else {
            onClose();
          }
          return 0;
        }
        return prev - intervalMs;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isOpen, autoCloseDuration, isPaused, status, onClose, onContinue]);

  // Lock body scroll and handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !mounted || !status) return null;

  const handleManualCheckStatus = async () => {
    if (!onCheckStatus) return;
    setIsChecking(true);
    try {
      await onCheckStatus();
    } finally {
      setIsChecking(false);
    }
  };

  const handleCopyOrderId = async () => {
    if (!orderId) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(orderId);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = orderId;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success('Order reference copied to clipboard');
      setTimeout(() => setCopied(false), 2200);
    } catch (e) {
      console.error('Failed to copy orderId:', e);
      toast.info(`Order ID: ${orderId}`);
    }
  };

  const progressPercent =
    autoCloseDuration > 0 ? Math.max(0, Math.min(100, (timeLeft / autoCloseDuration) * 100)) : 0;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[160] overflow-y-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Dynamic Keyframe Animations for SVG Paths */}
      <style jsx global>{`
        @keyframes strokeCircle {
          0% {
            stroke-dasharray: 180;
            stroke-dashoffset: 180;
          }
          100% {
            stroke-dasharray: 180;
            stroke-dashoffset: 0;
          }
        }
        @keyframes strokeCheck {
          0% {
            stroke-dasharray: 45;
            stroke-dashoffset: 45;
          }
          100% {
            stroke-dasharray: 45;
            stroke-dashoffset: 0;
          }
        }
        @keyframes strokeCross {
          0% {
            stroke-dasharray: 35;
            stroke-dashoffset: 35;
          }
          100% {
            stroke-dasharray: 35;
            stroke-dashoffset: 0;
          }
        }
        @keyframes rotateRadar {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes softPulseHalo {
          0%, 100% {
            transform: scale(0.96);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.2;
          }
        }
        .anim-circle {
          animation: strokeCircle 0.55s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .anim-check {
          animation: strokeCheck 0.35s 0.45s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .anim-cross-1 {
          animation: strokeCross 0.3s 0.4s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .anim-cross-2 {
          animation: strokeCross 0.3s 0.5s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .anim-radar {
          animation: rotateRadar 3s linear infinite;
        }
        .anim-halo {
          animation: softPulseHalo 2.5s ease-in-out infinite;
        }
      `}</style>

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-stone-950/75 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal Card */}
        <div
          ref={modalRef}
          className={cn(
            'relative w-full max-w-[480px] overflow-hidden rounded-[2.25rem] border bg-white text-center shadow-[0_25px_70px_rgba(0,0,0,0.35)] transition-all duration-300 animate-in zoom-in-95 fade-in slide-in-from-bottom-4',
            status === 'SUCCESS' && 'border-emerald-200/90 shadow-emerald-950/20',
            status === 'FAILED' && 'border-rose-200/90 shadow-rose-950/20',
            status === 'PENDING' && 'border-amber-200/90 shadow-amber-950/20',
            status === 'USER_DROPPED' && 'border-stone-200 shadow-stone-950/15'
          )}
        >
          {/* Ambient Lighting Gradients */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {status === 'SUCCESS' && (
              <>
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-56 w-64 rounded-full bg-gradient-to-b from-emerald-100/80 via-emerald-50/40 to-transparent blur-2xl" />
                <div className="absolute -bottom-10 right-0 h-40 w-40 rounded-full bg-amber-100/50 blur-2xl" />
              </>
            )}
            {status === 'FAILED' && (
              <>
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-56 w-64 rounded-full bg-gradient-to-b from-rose-100/80 via-rose-50/40 to-transparent blur-2xl" />
                <div className="absolute -bottom-10 left-0 h-40 w-40 rounded-full bg-stone-100/50 blur-2xl" />
              </>
            )}
            {status === 'PENDING' && (
              <>
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-56 w-64 rounded-full bg-gradient-to-b from-amber-100/80 via-amber-50/40 to-transparent blur-2xl" />
                <div className="absolute -bottom-10 right-0 h-40 w-40 rounded-full bg-orange-100/50 blur-2xl" />
              </>
            )}
            {status === 'USER_DROPPED' && (
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-56 w-64 rounded-full bg-gradient-to-b from-stone-100 via-stone-50 to-transparent blur-2xl" />
            )}
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4.5 top-4.5 z-20 grid h-8.5 w-8.5 place-items-center rounded-full bg-stone-100/80 text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-all active:scale-95 border border-stone-200/60"
            aria-label="Close dialog"
          >
            <IconX className="h-4 w-4" />
          </button>

          {/* Modal Content */}
          <div className="relative z-10 px-6 pt-8 pb-7 sm:px-8 sm:pt-9 sm:pb-8">
            {/* 1. Animated Graphic Stage */}
            <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center">
              {/* SUCCESS ANIMATION */}
              {status === 'SUCCESS' && (
                <>
                  <div className="anim-halo absolute -inset-2 rounded-full bg-emerald-400/20 blur-sm" />
                  <div className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_10px_25px_rgba(16,185,129,0.35)] ring-4 ring-white">
                    <svg className="h-12 w-12 text-white" viewBox="0 0 52 52" fill="none">
                      <circle
                        className="anim-circle"
                        cx="26"
                        cy="26"
                        r="23"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeDasharray="180"
                        strokeDashoffset="180"
                        strokeLinecap="round"
                      />
                      <path
                        className="anim-check"
                        d="M15 27L23 35L37 19"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray="45"
                        strokeDashoffset="45"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </>
              )}

              {/* FAILED ANIMATION */}
              {status === 'FAILED' && (
                <>
                  <div className="anim-halo absolute -inset-2 rounded-full bg-rose-400/20 blur-sm" />
                  <div className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-red-600 shadow-[0_10px_25px_rgba(244,63,94,0.35)] ring-4 ring-white">
                    <svg className="h-12 w-12 text-white" viewBox="0 0 52 52" fill="none">
                      <circle
                        className="anim-circle"
                        cx="26"
                        cy="26"
                        r="23"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeDasharray="180"
                        strokeDashoffset="180"
                        strokeLinecap="round"
                      />
                      <path
                        className="anim-cross-1"
                        d="M18 18L34 34"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray="35"
                        strokeDashoffset="35"
                        strokeLinecap="round"
                      />
                      <path
                        className="anim-cross-2"
                        d="M34 18L18 34"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray="35"
                        strokeDashoffset="35"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </>
              )}

              {/* PENDING ANIMATION */}
              {status === 'PENDING' && (
                <>
                  <div className="anim-halo absolute -inset-2 rounded-full bg-amber-400/20 blur-sm" />
                  {/* Rotating orbital dash ring */}
                  <div className="anim-radar absolute inset-0 rounded-full border-2 border-dashed border-amber-400/80" />
                  <div className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-[0_10px_25px_rgba(245,158,11,0.35)] ring-4 ring-white text-white">
                    <IconClock className="h-10 w-10 animate-pulse stroke-[2.2]" />
                  </div>
                </>
              )}

              {/* USER_DROPPED ANIMATION */}
              {status === 'USER_DROPPED' && (
                <div className="relative grid h-18 w-18 place-items-center rounded-full bg-stone-100 border border-stone-200 text-stone-500 shadow-sm ring-4 ring-white">
                  <IconHeartHandshake className="h-9 w-9 stroke-[1.8]" />
                </div>
              )}
            </div>

            {/* 2. Top Header Pill */}
            <div className="mb-3 flex justify-center">
              {status === 'SUCCESS' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200/80">
                  <IconSparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                  Payment Confirmed & Verified
                </span>
              )}
              {status === 'FAILED' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-800 border border-rose-200/80">
                  <IconAlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  Transaction Incomplete
                </span>
              )}
              {status === 'PENDING' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200/80">
                  <IconLoader2 className="h-3.5 w-3.5 text-amber-600 animate-spin" />
                  Awaiting Bank Settlement
                </span>
              )}
              {status === 'USER_DROPPED' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700 border border-stone-200">
                  Session Cancelled
                </span>
              )}
            </div>

            {/* 3. Title & Subtitle */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              {status === 'SUCCESS' && '🎉 Payment Successful!'}
              {status === 'FAILED' && 'Payment Could Not Be Completed'}
              {status === 'PENDING' && 'Payment In Progress'}
              {status === 'USER_DROPPED' && 'Checkout Cancelled'}
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
              {status === 'SUCCESS' && (
                <>
                  You have successfully unlocked <span className="font-semibold text-stone-900">{planName}</span>. Your messaging privileges and contact credits are now fully active.
                </>
              )}
              {status === 'FAILED' && (
                <>
                  {message || 'Your bank was unable to authorize the transaction. No worries—your account was not debited.'}
                </>
              )}
              {status === 'PENDING' && (
                <>
                  Your bank is processing the transaction. If money was debited, your permit will activate automatically. Please avoid making a duplicate payment.
                </>
              )}
              {status === 'USER_DROPPED' && (
                <>
                  You cancelled the payment session. No amount was charged. You can resume checkout anytime.
                </>
              )}
            </p>

            {/* 4. Contextual Details Box */}
            <div className="mt-5 rounded-2xl border border-stone-100 bg-stone-50/70 p-3.5 sm:p-4 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Selected Plan:</span>
                <span className="font-bold text-stone-900 flex items-center gap-1">
                  <IconCrown className="h-3.5 w-3.5 text-amber-600" /> {planName}
                </span>
              </div>
              {amount !== undefined && amount > 0 && (
                <div className="flex items-center justify-between text-stone-600">
                  <span>Amount:</span>
                  <span className="font-bold text-stone-900">₹{amount.toLocaleString('en-IN')}</span>
                </div>
              )}
              {orderId && (
                <div className="flex items-center justify-between text-stone-600 gap-2">
                  <span className="shrink-0 text-xs">Order Reference:</span>
                  <button
                    type="button"
                    onClick={handleCopyOrderId}
                    title="Click to copy full Order ID"
                    aria-label="Copy Order Reference"
                    className={cn(
                      'group font-mono text-[11px] font-semibold px-2 py-1 rounded-md border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 select-all focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30',
                      copied
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200/90 hover:bg-stone-50 hover:border-stone-400 shadow-2xs'
                    )}
                  >
                    <span>
                      {orderId.length > 24 ? `${orderId.slice(0, 10)}...${orderId.slice(-8)}` : orderId}
                    </span>
                    {copied ? (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 font-bold">
                        <IconCheck className="h-3 w-3 stroke-[2.5]" />
                        <span>Copied!</span>
                      </span>
                    ) : (
                      <IconCopy className="h-3 w-3 text-stone-400 group-hover:text-stone-700 transition-colors shrink-0" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* 5. Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
              {status === 'SUCCESS' && (
                <Button
                  onClick={onContinue || onClose}
                  className="w-full h-11 text-sm font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-600/25 hover:opacity-95"
                >
                  <span>Continue to Matches</span>
                  <IconArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              )}

              {status === 'FAILED' && (
                <>
                  {onRetry && (
                    <Button
                      onClick={onRetry}
                      className="w-full sm:flex-1 h-11 text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
                    >
                      <IconRefresh className="mr-1.5 h-4 w-4" />
                      Try Again
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full sm:flex-1 h-11 text-sm font-semibold border-stone-200"
                  >
                    Dismiss
                  </Button>
                </>
              )}

              {status === 'PENDING' && (
                <>
                  {onCheckStatus && (
                    <Button
                      onClick={handleManualCheckStatus}
                      disabled={isChecking}
                      className="w-full sm:flex-1 h-11 text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20"
                    >
                      {isChecking ? (
                        <>
                          <IconLoader2 className="mr-1.5 h-4 w-4 animate-spin" /> Checking...
                        </>
                      ) : (
                        <>
                          <IconRefresh className="mr-1.5 h-4 w-4" /> Check Status
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full sm:flex-1 h-11 text-sm font-semibold border-stone-200"
                  >
                    Close for Now
                  </Button>
                </>
              )}

              {status === 'USER_DROPPED' && (
                <Button
                  onClick={onClose}
                  className="w-full h-11 text-sm font-bold bg-stone-900 hover:bg-stone-800 text-white"
                >
                  Got It
                </Button>
              )}
            </div>

            {/* 6. Auto-Close Countdown Indicator */}
            {autoCloseDuration > 0 && (
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                <span className="flex items-center gap-1">
                  <IconClock className="h-3 w-3" />
                  {isPaused ? (
                    <span className="text-amber-600 font-medium">Paused (hovering)</span>
                  ) : (
                    <span>Auto-closing in {Math.ceil(timeLeft / 1000)}s</span>
                  )}
                </span>
                <span className="text-stone-300">|</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-stone-500 hover:text-stone-800 font-medium underline"
                >
                  Close now
                </button>
              </div>
            )}
          </div>

          {/* Bottom Progress Bar for Auto-Closing */}
          {autoCloseDuration > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-stone-100 overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-75',
                  status === 'SUCCESS' && 'bg-emerald-500',
                  status === 'FAILED' && 'bg-rose-500',
                  status === 'PENDING' && 'bg-amber-500',
                  status === 'USER_DROPPED' && 'bg-stone-400'
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
