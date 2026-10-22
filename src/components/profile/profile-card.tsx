'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IconCircleCheck, IconHeart, IconMapPin, IconUsers } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';
import { type Profile, formatLastActive } from '@/lib/demo-data';

export function ProfileCard({ profile, compact = false }: { profile: Profile; compact?: boolean }) {
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    import('@/services').then(({ profileService }) => {
      profileService
        .getProfile('me')
        .then((p: any) => {
          const uid = p?.user?.id || p?.userId || p?.id;
          if (uid) {
            setCurrentUserId(uid);
            const userStorageKey = `ishtam_shortlisted_${uid}_by_me`;
            try {
              const stored = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
              if (stored.includes(profile.id) || (profile.profileId && stored.includes(profile.profileId))) {
                setIsShortlisted(true);
              }
            } catch {}
          }
        })
        .catch(() => {});
    });
  }, [profile.id, profile.profileId]);

  const handleShortlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !isShortlisted;
    setIsShortlisted(nextState);

    const userStorageKey = currentUserId ? `ishtam_shortlisted_${currentUserId}_by_me` : null;
    if (userStorageKey) {
      try {
        const stored = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
        const updated = nextState
          ? Array.from(new Set([...stored, profile.id]))
          : stored.filter((id: string) => id !== profile.id && id !== profile.profileId);
        localStorage.setItem(userStorageKey, JSON.stringify(updated));
      } catch {}
    }

    try {
      const { matchesService } = await import('@/services');
      const { toast } = await import('@/lib/toast');
      if (nextState) {
        await matchesService.shortlistProfile(profile.id);
      } else {
        await matchesService.removeShortlist(profile.id);
      }
      toast.success(
        nextState ? 'Profile Favorited' : 'Removed from Favorites',
        `${profile.name} has been ${nextState ? 'added to' : 'removed from'} your favorites.`
      );
    } catch (error) {
      // Rollback
      setIsShortlisted(!nextState);
      if (userStorageKey) {
        try {
          const stored = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
          const rollback = !nextState
            ? Array.from(new Set([...stored, profile.id]))
            : stored.filter((id: string) => id !== profile.id && id !== profile.profileId);
          localStorage.setItem(userStorageKey, JSON.stringify(rollback));
        } catch {}
      }
      const { toast } = await import('@/lib/toast');
      toast.error('Action failed', 'Could not update shortlist at this time.');
      console.error(error);
    }
  };

  const [imgError, setImgError] = useState(false);

  return (
    <Card
      variant="interactive"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden p-0 border-[var(--border)] rounded-2xl bg-white flex flex-col justify-between"
    >
      {/* Photo with Matrimonial Vignette Overlay */}
      <div className={cn("relative overflow-hidden bg-[var(--surface-muted)]", compact ? "h-52" : "h-72")}>
        {profile.image && !imgError ? (
          <img
            src={profile.image}
            alt={profile.name}
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="relative h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#7D1633] via-[#630E26] to-[#450718] p-4 text-center select-none overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,151,87,0.2),transparent_70%)]" />
            <div className="relative z-10 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-b from-white/20 to-white/5 backdrop-blur-md text-[#FFF2D6] border border-[#F5D8A8]/60 shadow-lg mb-2">
              <span className="font-editorial-title text-2xl font-bold">
                {profile.name?.charAt(0)?.toUpperCase() || 'M'}
              </span>
            </div>
            <p className="relative z-10 text-[10px] font-medium text-[#F7DFBA] px-2 py-0.5 rounded-full bg-black/20 border border-white/10">
              Photo Pending
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

          {profile.online ? (
            <Badge
              tone="neutral"
              size="sm"
              dot
              dotColor="bg-emerald-500"
              className="bg-white/90 backdrop-blur-md text-[var(--foreground)] border-white/80 font-medium"
            >
              Online now
            </Badge>
          ) : profile.lastActiveAt ? (
            <Badge
              tone="neutral"
              size="sm"
              className="bg-black/50 text-white/95 backdrop-blur-md border-white/20 text-[10px] font-medium"
            >
              {formatLastActive(profile.lastActiveAt)}
            </Badge>
          ) : null}
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
            <IconMapPin className="h-3.5 w-3.5 text-[#F5D8A8]" />
            <span className="truncate">{profile.city}, {profile.state}</span>
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-4 space-y-3.5 flex flex-col justify-between">
        <div className="space-y-2">
          <div>
            <p className="text-sm font-bold text-[var(--foreground)] truncate">{profile.profession}</p>
            <p className="text-xs text-[var(--muted-strong)] font-medium truncate">
              {profile.education} · {profile.maritalStatus}
            </p>
          </div>

          {!compact && profile.about && (
            <p className="line-clamp-2 text-xs leading-relaxed text-[#2C1D24] font-medium bg-[#FFFAF5] p-2.5 rounded-xl border border-[var(--champagne-border)]/70">
              "{profile.about}"
            </p>
          )}

          {!compact && profile.lifestyle && profile.lifestyle.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {profile.height && (
                <span className="rounded-lg bg-[#FAF4EF] border border-[#EDE4DC] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted-strong)]">
                  {profile.height}
                </span>
              )}
              {profile.motherTongue && (
                <span className="rounded-lg bg-[#FAF4EF] border border-[#EDE4DC] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted-strong)]">
                  {profile.motherTongue}
                </span>
              )}
              {profile.lifestyle[0] && (
                <span className="rounded-lg bg-[#FAF4EF] border border-[#EDE4DC] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted-strong)]">
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
