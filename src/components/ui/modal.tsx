"use client";

import React, { useEffect, useCallback } from "react";
import { IconX } from '@tabler/icons-react';
import { cn } from "@/lib/cn";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  closeOnBackdrop?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
  closeOnBackdrop = true,
}: ModalProps) {
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

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={() => closeOnBackdrop && onClose()}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div
        className={cn(
          "relative w-full rounded-3xl border border-[var(--border)] bg-white p-6 sm:p-8 shadow-[var(--elevation-floating)] transition-all duration-300",
          "animate-in fade-in zoom-in-95 slide-in-from-bottom-2",
          sizes[size],
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="focus-ring absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-colors"
          aria-label="Close dialog"
        >
          <IconX className="h-4 w-4" />
        </button>

        {(title || description) && (
          <div className="mb-6 pr-8">
            {title && (
              <h3 className="font-editorial-title text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)]">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1.5 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="relative">{children}</div>

        {footer && (
          <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-[var(--border)] pt-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
