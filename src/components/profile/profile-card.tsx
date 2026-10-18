'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IconCircleCheck, IconHeart, IconMapPin, IconUsers } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import type { Profile } from '@/lib/demo-data';

export function ProfileCard({ profile, compact = false }: { profile: Profile; compact?: boolean }) {
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleShortlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { matchesService } = await import('@/services');
      const { toast } = await import('@/lib/toast');
      await matchesService.shortlistProfile(profile.id);
      setIsShortlisted(!isShortlisted);
      toast.success(
        isShortlisted ? "Removed from Favorites" : "Profile Favorited",
        `${profile.name} has been ${isShortlisted ? 'removed from' : 'added to'} your favorites.`
      );
    } catch (error) {
      const { toast } = await import('@/lib/toast');
      toast.error("Action failed", "Could not update shortlist at this time.");
      console.error(error);
    }
  };

  return (
    <Card
      variant="interactive"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden p-0 border-[var(--border)] rounded-2xl bg-white flex flex-col justify-between"
    >
      {/* Photo with Matrimonial Vignette Overlay */}
      <div className={cn("relative overflow-hidden bg-[var(--surface-muted)]", compact ? "h-52" : "h-72")}>
        {profile.image ? (
          <img
            src={profile.image}
            alt={profile.name}
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2D121B] via-[#4A1828] to-[#1F0B13] p-4 text-center select-none">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-xl mb-2">
              <span className="font-editorial-title text-3xl font-bold">
                {profile.name?.charAt(0)?.toUpperCase() || 'M'}
              </span>
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
              Photo not uploaded
            </p>
          </div>
        )}

        {/* Ambient Warm Gradient for crisp text readability */}
        <div className="absolute inset-0 photo-overlay-warm" aria-hidden="true" />

        {/* Top Badges */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 z-10">
          {profile.compatibility && (
            <Badge
              tone="accent"
              size="sm"
              icon={<IconUsers className="h-2.5 w-2.5 fill-current" />}
              className="backdrop-blur-sm"
            >
              {profile.compatibility}% match
            </Badge>
          )}

          {profile.online && (
            <Badge
              tone="neutral"
              size="sm"
              dot
              dotColor="bg-emerald-500"
              className="bg-white/90 backdrop-blur-md text-[var(--foreground)] border-white/80"
            >
              Online
            </Badge>
          )}
        </div>

        {/* Floating Shortlist IconHeart on Photo */}
        <button
          type="button"
          onClick={handleShortlist}
          aria-label={isShortlisted ? `Remove ${profile.name} from shortlist` : `Shortlist ${profile.name}`}
          className={cn(
            "focus-ring absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full backdrop-blur-md transition-all duration-200 active-press",
            isShortlisted
              ? "bg-white text-[var(--primary)] shadow-md"
              : "bg-black/30 text-white hover:bg-white hover:text-[var(--primary)]"
          )}
        >
          <IconHeart className={cn("h-4 w-4 transition-transform duration-200", isShortlisted && "fill-[var(--primary)] scale-110")} />
        </button>

        {/* Bottom Photo Overlay Details */}
        <div className="absolute inset-x-0 bottom-0 p-4 text-white z-10">
          <div className="flex items-center gap-2">
            <h3 className="font-editorial-title text-lg sm:text-xl font-bold tracking-tight text-white drop-shadow-sm">
              {profile.name}, {profile.age}
            </h3>
            {profile.verified && (
              <span title="Verified Profile" className="inline-flex items-center">
                <IconCircleCheck className="h-4 w-4 fill-[var(--accent)] text-white stroke-[2.5]" aria-label="Verified profile" />
              </span>
            )}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-white/90 font-medium">
            <IconMapPin className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span className="truncate">{profile.city}, {profile.state}</span>
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-4 space-y-3.5 flex flex-col justify-between">
        <div className="space-y-2">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)] truncate">{profile.profession}</p>
            <p className="text-xs text-[var(--muted)] font-normal truncate">
              {profile.education} · {profile.maritalStatus}
            </p>
          </div>

          {!compact && profile.about && (
            <p className="line-clamp-2 text-xs leading-relaxed text-[var(--muted-strong)] font-normal">
              {profile.about}
            </p>
          )}

          {!compact && profile.lifestyle && profile.lifestyle.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {profile.height && (
                <span className="rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]/70 px-2 py-0.5 text-[11px] font-medium text-[var(--muted-strong)]">
                  {profile.height}
                </span>
              )}
              {profile.motherTongue && (
                <span className="rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]/70 px-2 py-0.5 text-[11px] font-medium text-[var(--muted-strong)]">
                  {profile.motherTongue}
                </span>
              )}
              {profile.lifestyle[0] && (
                <span className="rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]/70 px-2 py-0.5 text-[11px] font-medium text-[var(--muted-strong)]">
                  {profile.lifestyle[0]}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card CTA Row */}
        <div className="pt-2 border-t border-[var(--border)]/60">
          <Link href={`/app/profile?user=${profile.id}`} className="focus-ring block w-full">
            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs font-bold hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-lighter)] transition-all"
            >
              View Full Profile
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
