'use client';
import Link from 'next/link';
import { CheckCircle2, Heart, MapPin, MoreHorizontal, ShieldCheck, Sparkles } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Profile } from '@/lib/demo-data';

export function ProfileCard({ profile, compact=false }: { profile: Profile; compact?: boolean }) {
  return <Card className="group overflow-hidden p-0 border-[var(--border)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_var(--card-shadow)] hover:border-[var(--border-strong)]">
    <div className={`relative ${compact ? 'h-44' : 'h-64'} overflow-hidden bg-[var(--surface-muted)]`}>
      <img src={profile.image} alt={profile.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4 pt-16 text-white">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-base tracking-tight">{profile.name}, {profile.age}</h3>
          {profile.verified && (
            <span title="Verified Profile" className="inline-flex items-center">
              <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" fill="currentColor" stroke="white" aria-label="Verified profile" />
            </span>
          )}
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-white/85"><MapPin className="h-3.5 w-3.5 text-white/70" /> {profile.city}, {profile.state}</p>
      </div>
      <button aria-label={`More options for ${profile.name}`} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/25 text-white backdrop-blur hover:bg-black/40 transition"><MoreHorizontal className="h-4 w-4" /></button>
      <div className="absolute left-3 top-3 flex gap-2">
        <Badge tone="accent">{profile.compatibility}% match</Badge>
        {profile.online && <Badge tone="neutral" className="bg-white/90 backdrop-blur text-[var(--foreground)] border-white/60">Online</Badge>}
      </div>
    </div>
    <div className="space-y-4 p-4">
      <div>
        <p className="text-sm font-semibold text-[var(--foreground)]">{profile.profession}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">{profile.education} · {profile.maritalStatus}</p>
      </div>
      {!compact && <p className="line-clamp-2 text-sm leading-6 text-[var(--muted)]">{profile.about}</p>}
      {!compact && (
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="neutral">{profile.height}</Badge>
          <Badge tone="neutral">{profile.motherTongue}</Badge>
          <Badge tone="neutral">{profile.lifestyle[0]}</Badge>
        </div>
      )}
      <div className="grid grid-cols-[1fr_auto] gap-2 pt-1">
        <Link href={`/app/profile?user=${profile.id}`} className="focus-ring">
          <Button variant="secondary" className="w-full text-xs font-semibold hover:border-[var(--primary)] hover:text-[var(--primary)] transition">View profile</Button>
        </Link>
        <Button 
          aria-label={`Shortlist ${profile.name}`} 
          variant="ghost" 
          className="px-3 hover:text-[var(--primary)] hover:bg-[var(--primary-light)]/50 transition"
          onClick={async (e) => {
            e.preventDefault();
            try {
              const { matchesService } = await import('@/services');
              const { toast } = await import('@/lib/toast');
              await matchesService.shortlistProfile(profile.id);
              toast.success("Profile Shortlisted", `Added ${profile.name} to your shortlists.`);
            } catch (error) {
              const { toast } = await import('@/lib/toast');
              toast.error("Action failed", "Could not shortlist profile at this time.");
              console.error(error);
            }
          }}
        >
          <Heart className="h-4 w-4 text-[var(--muted)] hover:text-[var(--primary)] hover:fill-[var(--primary)] transition-colors" />
        </Button>
      </div>
    </div>
  </Card>;
}
