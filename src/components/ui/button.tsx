import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | string;
  loading?: boolean;
  href?: string;
};

const variants = {
  primary: "bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)] shadow-[0_10px_25px_var(--primary-shadow)]",
  secondary: "bg-white text-[var(--secondary-foreground)] border border-[var(--border)] hover:bg-[var(--surface-muted)]",
  ghost: "text-[var(--muted-strong)] hover:bg-[var(--primary-lighter)]",
  danger: "bg-[var(--danger)] text-white hover:bg-[var(--danger-deep)]"
};

const sizes: Record<string, string> = {
  sm: "min-h-9 px-3 py-1.5 text-xs rounded-lg",
  md: "min-h-11 px-4 py-2.5 text-sm rounded-xl",
  lg: "min-h-12 px-6 py-3 text-base rounded-xl"
};

export function Button({ className = "", variant = "primary", size = "md", loading, href, children, disabled, ...props }: Props) {
  const sizeClass = sizes[size] || sizes.md;
  const baseClasses = `focus-ring inline-flex items-center justify-center gap-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizeClass} ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {children}
      </Link>
    );
  }

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}