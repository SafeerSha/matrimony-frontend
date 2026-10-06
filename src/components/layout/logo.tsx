import Link from "next/link";
import { IconHeart } from '@tabler/icons-react';

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="focus-ring inline-flex items-center gap-2" aria-label="Let's CHAT .Com home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--primary)] text-white shadow-sm">
        <IconHeart className="h-5 w-5 fill-current" aria-hidden />
      </span>
      <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">Let's CHAT <span className="font-medium text-[var(--muted)] text-sm">.Com</span></span>
    </Link>
  );
}