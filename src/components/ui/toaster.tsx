"use client";

import { useEffect, useState } from "react";
import {
  IconCircleCheck,
  IconAlertCircle,
  IconAlertTriangle,
  IconInfoCircle,
  IconX,
  IconMessageCircleFilled,
  IconChevronRight,
} from "@tabler/icons-react";
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
      className="pointer-events-none fixed z-[99999] flex flex-col gap-2.5 top-3 inset-x-3 sm:top-5 sm:right-5 sm:left-auto sm:w-full sm:max-w-md sm:px-0"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} onDismiss={() => toast.dismiss(item.id)} />
      ))}
    </div>
  );
}

function getInitials(title?: string) {
  if (!title) return "LC";
  const clean = title.replace(/^Message from\s+/i, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "M") + (parts[1]?.[0] || "");
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 220);
  };

  const isChatMessage = item.title.toLowerCase().startsWith("message from");

  const icons = {
    success: <IconCircleCheck className="h-5 w-5 text-[#7A1835] shrink-0" />,
    error: <IconAlertCircle className="h-5 w-5 text-rose-600 shrink-0" />,
    warning: <IconAlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
    info: <IconInfoCircle className="h-5 w-5 text-[#8C5D30] shrink-0" />,
  };

  const handleClick = () => {
    if (item.onClick) {
      item.onClick();
      handleDismiss();
    }
  };

  return (
    <div
      onClick={handleClick}
      role={item.onClick ? "button" : "status"}
      tabIndex={item.onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (item.onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        "pointer-events-auto relative w-full overflow-hidden rounded-2xl border transition-all duration-300 ease-out select-none",
        "bg-white/95 backdrop-blur-2xl border-[#EEDFCE] shadow-[0_16px_38px_rgba(92,16,39,0.16),0_4px_12px_rgba(0,0,0,0.06)]",
        item.onClick && "cursor-pointer hover:shadow-[0_20px_45px_rgba(92,16,39,0.22)] active:scale-[0.98]",
        isExiting
          ? "opacity-0 -translate-y-4 scale-95 duration-200"
          : "opacity-100 translate-y-0 scale-100 animate-in fade-in slide-in-from-top-4 duration-300"
      )}
    >
      {/* Top micro progress accent line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#7A1835] via-[#A7586A] to-[#D8B28C]" />

      <div className="p-3.5 sm:p-4 flex items-center gap-3">
        {/* Leading Avatar / Icon Graphic */}
        {isChatMessage ? (
          <div className="relative shrink-0">
            {item.avatarUrl && !imgError ? (
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full overflow-hidden ring-2 ring-[#7A1835]/25 border-2 border-white shadow-sm bg-[#FAF2EF]">
                <img
                  src={item.avatarUrl}
                  alt={item.title}
                  className="h-full w-full object-cover object-center"
                  onError={() => setImgError(true)}
                />
              </div>
            ) : (
              <div className="grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-full bg-gradient-to-br from-[#7A1835] via-[#8B1E3F] to-[#5C1027] text-[#FAF0E6] font-bold text-xs sm:text-sm tracking-wider shadow-sm ring-2 ring-white">
                <span>{getInitials(item.title).toUpperCase()}</span>
              </div>
            )}
            {/* Small chat badge indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-[#7A1835] text-white ring-2 ring-white shadow-2xs">
              <IconMessageCircleFilled className="h-2.5 w-2.5 text-[#F4D9C0]" />
            </span>
          </div>
        ) : (
          <div className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center rounded-xl bg-[#FAF3EC] border border-[#EAD8C7] shrink-0 text-[#7A1835]">
            {icons[item.type]}
          </div>
        )}

        {/* Text Details */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-bold text-[#211B1E] truncate leading-tight">
              {item.title}
            </h4>
            <span className="inline-block shrink-0 rounded-full bg-[#FAF3EC] px-1.5 py-0.2 text-[9px] font-bold text-[#7A1835] uppercase tracking-wider border border-[#E5D2C0]">
              Now
            </span>
          </div>
          {item.description && (
            <p className="mt-1 text-xs text-[#5C5357] line-clamp-2 leading-relaxed break-words font-medium">
              {item.description}
            </p>
          )}
        </div>

        {/* Action arrow indicator if clickable */}
        {item.onClick && (
          <div className="shrink-0 text-[#A97C52] sm:flex items-center hidden pr-0.5">
            <span className="text-[11px] font-bold text-[#7A1835] mr-0.5">Reply</span>
            <IconChevronRight className="h-4 w-4" />
          </div>
        )}

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="rounded-full p-1.5 text-[#8C7D82] hover:text-[#211B1E] hover:bg-[#FAF3EC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#7A1835]/30 shrink-0 self-center"
          aria-label="Dismiss notification"
        >
          <IconX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
