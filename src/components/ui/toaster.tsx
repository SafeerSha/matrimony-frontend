"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { toast, type ToastItem } from "@/lib/toast";
import { cn } from "@/lib/cn";

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    return toast.subscribe((updatedToasts) => {
      setToasts(updatedToasts);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-4 right-4 z-[9999] flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={() => toast.dismiss(item.id)} />
      ))}
    </div>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 200);
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />,
    error: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />,
    info: <Info className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />,
  };

  const borders = {
    success: "border-emerald-200/80 bg-white/95 shadow-emerald-950/5",
    error: "border-rose-200/80 bg-white/95 shadow-rose-950/5",
    warning: "border-amber-200/80 bg-white/95 shadow-amber-950/5",
    info: "border-teal-200/80 bg-white/95 shadow-teal-950/5",
  };

  const accentPills = {
    success: "bg-emerald-500",
    error: "bg-rose-500",
    warning: "bg-amber-500",
    info: "bg-teal-500",
  };

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full items-start gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 ease-out",
        borders[item.type],
        isExiting
          ? "opacity-0 -translate-y-2 scale-95"
          : "opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-top-3"
      )}
      style={{
        boxShadow: "0 12px 30px -4px rgba(16, 40, 24, 0.12), 0 4px 10px -2px rgba(16, 40, 24, 0.04)"
      }}
    >
      <div className={cn("absolute left-0 top-3 bottom-3 w-1 rounded-r-full", accentPills[item.type])} />

      <div className="pl-1">
        {icons[item.type]}
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <h4 className="text-sm font-semibold text-stone-900 leading-snug">
          {item.title}
        </h4>
        {item.description && (
          <p className="mt-1 text-xs text-stone-600 leading-relaxed break-words">
            {item.description}
          </p>
        )}
      </div>

      <button
        onClick={handleDismiss}
        className="rounded-lg p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
