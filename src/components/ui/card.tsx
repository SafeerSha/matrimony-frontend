import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-white shadow-[0_8px_30px_var(--card-shadow)] ${className}`}
      {...props}
    />
  );
}