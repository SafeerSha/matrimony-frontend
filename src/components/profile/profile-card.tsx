'use client';
import Link from 'next/link';
import { CheckCircle2, Heart, MapPin, MoreHorizontal, ShieldCheck, Sparkles } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Profile } from '@/lib/demo-data';

export function ProfileCard({ profile, compact=false }: { profile: Profile; compact?: boolean }) {
  return <Card className="group overflow-hidden p-0 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
    <div className={`relative ${compact ? 'h-44' : 'h-64'} overflow-hidden bg-primary-light`}>
      <img src={profile.image} alt={profile.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-4 pt-16 text-white">
        <div className="flex items-center gap-2"><h3 className="font-bold">{profile.name}, {profile.age}</h3>{profile.verified && <CheckCircle2 className="h-4 w-4" aria-label="Verified profile" />}</div>
        <p className="mt-1 flex items-center gap-1 text-xs text-white/85"><MapPin className="h-3.5 w-3.5" /> {profile.city}, {profile.state}</p>
      </div>
      <button aria-label={`More options for ${profile.name}`} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/25 text-white backdrop-blur hover:bg-black/40"><MoreHorizontal className="h-4 w-4" /></button>
      <div className="absolute left-3 top-3 flex gap-2"><Badge tone="success">{profile.compatibility}% match</Badge>{profile.online && <Badge>Online</Badge>}</div>
    </div>
    <div className="space-y-4 p-4">
      <div><p className="text-sm font-semibold">{profile.profession}</p><p className="mt-1 text-xs text-muted">{profile.education} · {profile.maritalStatus}</p></div>
      {!compact && <p className="line-clamp-2 text-sm leading-6 text-muted">{profile.about}</p>}
      {!compact && <div className="flex flex-wrap gap-2"><Badge>{profile.height}</Badge><Badge>{profile.motherTongue}</Badge><Badge>{profile.lifestyle[0]}</Badge></div>}
      <div className="grid grid-cols-[1fr_auto] gap-2"><Link href={`/app/profile?user=${profile.id}`} className="focus-ring"><Button variant="secondary" className="w-full">View profile</Button></Link><Button aria-label={`Shortlist ${profile.name}`} variant="ghost" className="px-3"><Heart className="h-4 w-4" /></Button></div>
    </div>
  </Card>;
}
