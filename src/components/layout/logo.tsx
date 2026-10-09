import Link from "next/link";
import { IconHeart } from '@tabler/icons-react';
import { cn } from "@/lib/cn";

export function Logo({
  href = "/",
  lightOnMobile = false,
  className = "",
}: {
  href?: string;
  lightOnMobile?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("focus-ring inline-flex items-center gap-2", className)}
      aria-label="Let's CHAT .Com home"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--primary)] text-white shadow-sm border border-white/20">
        <IconHeart className="h-5 w-5 fill-current" aria-hidden />
      </span>
      <span
        className={cn(
          "text-lg font-bold tracking-tight",
          lightOnMobile ? "text-white lg:text-[var(--foreground)]" : "text-[var(--foreground)]"
        )}
      >
        Let's CHAT{" "}
        <span
          className={cn(
            "font-medium text-sm",
            lightOnMobile ? "text-white/75 lg:text-[var(--muted)]" : "text-[var(--muted)]"
          )}
        >
          .Com
        </span>
      </span>
    </Link>
  );
}