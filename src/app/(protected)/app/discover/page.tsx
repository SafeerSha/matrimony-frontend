'use client';
import { useEffect, useState, useMemo } from 'react';
import { ChevronDown, Filter, Search, SlidersHorizontal, HeartHandshake, X, Loader2 } from 'lucide-react';
import { ProfileCard } from '@/components/profile/profile-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/section-header';
import { matchesService } from '@/services';
import type { Profile } from '@/lib/demo-data';

export default function DiscoverPage() {
  const [query, setQuery] = useState(''); 
  const [showFilters, setShowFilters] = useState(false); 
  const [city, setCity] = useState('All locations'); 
  const [minAge, setMinAge] = useState(24); 
  const [maxAge, setMaxAge] = useState(32);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    matchesService.searchProfiles({
      city: city === 'All locations' ? undefined : city,
      minAge,
      maxAge
    })
    .then((res) => {
      // Map backend UserProfile to frontend Profile type
      const mapped = (res.data || []).map((u: any) => ({
        id: u.id,
        name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User',
        age: u.dateOfBirth ? Math.floor((new Date().getTime() - new Date(u.dateOfBirth).getTime()) / 31557600000) : 25,
        city: u.city || 'Unknown',
        state: u.country || 'Unknown',
        profession: u.occupation || 'Not specified',
        education: u.education || 'Not specified',
        image: u.photos?.[0]?.url || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85', // fallback
        compatibility: Math.floor(Math.random() * 20) + 75,
        verified: u.isVerified || false,
        online: true,
        about: u.bio || '',
        height: u.height ? `${u.height}cm` : 'Not specified',
        maritalStatus: u.maritalStatus || 'Not specified',
        religion: u.religion || 'Not specified',
        motherTongue: 'Not specified',
        family: 'Not specified',
        lifestyle: [],
        interests: [],
        lookingFor: ''
      }));
      setProfiles(mapped);
      setIsLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setIsLoading(false);
    });
  }, [city, minAge, maxAge]);

  const filtered = useMemo(() => 
    profiles.filter(p => `${p.id} ${p.name} ${p.city} ${p.profession}`.toLowerCase().includes(query.toLowerCase())),
  [query, profiles]);

  return <div className="space-y-6">
    <SectionHeader eyebrow="Discover" title="People who could be a great fit" description="Explore thoughtful matches based on your preferences and profile." action={<Button variant="secondary" className="hidden sm:inline-flex" onClick={()=>setShowFilters(v=>!v)}><SlidersHorizontal className="mr-2 h-4 w-4" /> Filters</Button>} />
    <Card className="p-3 sm:p-4"><div className="flex flex-col gap-3 lg:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" /><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by Unique ID, name or city" className="focus-ring h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm outline-none placeholder:text-subtle-foreground" /></div><div className="flex gap-2"><button onClick={()=>setShowFilters(v=>!v)} className="focus-ring inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold sm:hidden"><Filter className="h-4 w-4" /> Filters</button><select value={city} onChange={e=>setCity(e.target.value)} className="focus-ring h-11 flex-1 rounded-xl border border-border bg-surface px-3 text-sm font-medium outline-none"><option>All locations</option><option>Kochi</option><option>Thrissur</option><option>Bengaluru</option><option>Calicut</option><option>Kottayam</option><option>Chennai</option></select><select className="focus-ring hidden h-11 rounded-xl border border-border bg-surface px-3 text-sm font-medium outline-none sm:block"><option>Recommended</option><option>Most recent</option><option>Most compatible</option></select></div></div></Card>
    {showFilters && <Card className="p-5"><div className="flex items-center justify-between"><div><h3 className="font-bold">Refine your matches</h3><p className="mt-1 text-sm text-muted">Keep your filters focused on what matters to you.</p></div><button onClick={()=>setShowFilters(false)} aria-label="Close filters"><X className="h-4 w-4" /></button></div><div className="mt-5 grid gap-5 sm:grid-cols-3"><label className="text-sm font-semibold">Minimum age<input type="number" value={minAge} onChange={e=>setMinAge(+e.target.value)} className="focus-ring mt-2 h-10 w-full rounded-lg border border-border px-3 outline-none" /></label><label className="text-sm font-semibold">Maximum age<input type="number" value={maxAge} onChange={e=>setMaxAge(+e.target.value)} className="focus-ring mt-2 h-10 w-full rounded-lg border border-border px-3 outline-none" /></label><div><p className="text-sm font-semibold">Profile signals</p><div className="mt-2 flex flex-wrap gap-2"><Badge tone="success">Verified</Badge><Badge>Recently active</Badge><Badge>High compatibility</Badge></div></div></div></Card>}
    <div className="flex items-center justify-between"><div><p className="text-sm font-semibold">{filtered.length} profiles</p><p className="text-xs text-muted">Updated recommendations for you</p></div><div className="hidden items-center gap-2 text-xs text-muted sm:flex"><HeartHandshake className="h-4 w-4 text-primary" /> Personalized recommendations</div></div>
    
    {isLoading ? (
      <div className="py-20 flex justify-center items-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
    ) : filtered.length ? (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(p=><ProfileCard key={p.id} profile={p} />)}</div> 
    ) : (
      <Card className="p-10 text-center"><h3 className="font-bold">No profiles match those filters</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">Try widening your age range or clearing the location filter to discover more profiles.</p><Button className="mt-5" onClick={()=>{setQuery('');setCity('All locations');setMinAge(24);setMaxAge(32)}}>Reset filters</Button></Card>
    )}
  </div>;
}
