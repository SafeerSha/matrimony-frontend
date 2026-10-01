import Link from "next/link";
import { Heart } from "lucide-react";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="focus-ring inline-flex items-center gap-2" aria-label="LetsChat home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--primary)] text-white shadow-sm">
        <Heart className="h-5 w-5 fill-current" aria-hidden />
      </span>
      <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">LetsChat</span>
    </Link>
  );
}