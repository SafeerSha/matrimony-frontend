'use client';
import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Heart, Lock, MapPin, MessageCircle, ShieldCheck, Star, UserRound, X } from 'lucide-react';
import Link from 'next/link';
import { profiles } from '@/lib/demo-data';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function ProfileDetail({ id }: { id?: string }) {
  const [sent, setSent] = useState(false);
  const profile = profiles.find(p => p.id === id) ?? profiles[0];
  return <div className="space-y-5">
    <Link href="/app/discover" className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to discover</Link>
    <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
      <Card className="overflow-hidden p-0 border-[var(--border)] shadow-[0_8px_30px_var(--card-shadow)]">
        <div className="relative h-[460px] bg-[var(--surface-muted)] sm:h-[560px]">
          <img src={profile.image} alt={profile.name} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-6 pt-24 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{profile.name}, {profile.age}</h1>
              {profile.verified && <CheckCircle2 className="h-5 w-5 text-[var(--accent)]" fill="currentColor" stroke="white" />}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-white/90"><MapPin className="h-4 w-4 text-white/70" />{profile.city}, {profile.state}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x border-t border-[var(--border)] bg-white">
          <div className="p-4 text-center">
            <p className="text-lg font-bold text-[var(--primary)]">{profile.compatibility}%</p>
            <p className="text-xs text-[var(--muted)]">Compatibility</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-lg font-bold text-[var(--foreground)]">{profile.height}</p>
            <p className="text-xs text-[var(--muted)]">Height</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-lg font-bold text-[var(--foreground)]">{profile.maritalStatus.split(' ')[0]}</p>
            <p className="text-xs text-[var(--muted)]">Status</p>
          </div>
        </div>
      </Card>
      <div className="space-y-5">
        <Card className="p-5 sm:p-6 border-[var(--border)] shadow-[0_8px_30px_var(--card-shadow)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge tone="accent">{profile.compatibility}% match</Badge>
              <h2 className="mt-3 text-2xl font-bold text-[var(--foreground)]">A little about {profile.name.split(' ')[0]}</h2>
            </div>
            <button className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] text-[var(--muted)] hover:text-[var(--primary)] hover:border-[var(--border-strong)] hover:bg-[var(--primary-light)]/40 transition" aria-label="Shortlist">
              <Heart className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 leading-7 text-[var(--muted)]">{profile.about}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {profile.interests.map(i => <Badge key={i} tone="neutral">{i}</Badge>)}
          </div>
        </Card>

        <Card className="p-5 sm:p-6 border-[var(--border)] shadow-[0_8px_30px_var(--card-shadow)]">
          <h2 className="font-bold text-[var(--foreground)]">About & preferences</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[['Education',profile.education],['Profession',profile.profession],['Mother tongue',profile.motherTongue],['Family',profile.family]].map(([k,v]) => (
              <div key={k}>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--subtle-foreground)]">{k}</p>
                <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{v}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] p-4">
            <p className="text-sm font-semibold text-[var(--primary)]">Looking for</p>
            <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">{profile.lookingFor}</p>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 border-[var(--border)] shadow-[0_8px_30px_var(--card-shadow)]">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-[var(--foreground)]">Connect with confidence</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Keep conversations respectful. You can block or report a profile at any time.</p>
            </div>
          </div>
          
          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <Link href="/app/subscription" className="focus-ring block w-full">
              <Button variant="secondary" className="w-full h-auto py-3 bg-[#FAF3EC] text-[#8C5D30] hover:bg-[#F5EADE] border border-[#EAD7C5] shadow-sm transition-all whitespace-normal">
                <Lock className="mr-2 h-5 w-5 shrink-0" /> 
                <span className="text-left leading-tight">An active Chat Permit is required to send chat requests. <strong className="font-bold underline">Upgrade Now</strong></span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  </div>;
}
