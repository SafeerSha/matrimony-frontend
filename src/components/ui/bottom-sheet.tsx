"use client";

import React, { useEffect, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { IconX } from '@tabler/icons-react';
import { cn } from "@/lib/cn";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  closeOnBackdrop = true,
}: BottomSheetProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col justify-end"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={() => closeOnBackdrop && onClose()}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div
        className={cn(
          "relative z-10 mx-auto w-full max-w-xl max-h-[88vh] flex flex-col rounded-t-[2rem] border-t border-[var(--border)] bg-white shadow-[var(--elevation-floating)] transition-transform duration-300",
          "animate-in slide-in-from-bottom duration-300 ease-out",
          className
        )}
      >
        {/* Drag Pill Handle */}
        <div className="flex justify-center pt-3 pb-2 cursor-grab" onClick={onClose}>
          <div className="h-1.5 w-12 rounded-full bg-stone-300/80" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-2 pb-4 border-b border-[var(--border)]">
          <div>
            {title && (
              <h3 className="font-editorial-title text-xl font-bold text-[var(--foreground)]">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring ml-4 grid h-8 w-8 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-colors shrink-0"
            aria-label="Close bottom sheet"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 px-6 border-t border-[var(--border)] bg-[var(--surface-muted)]/50 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
