'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bell, CheckCircle2, Heart, MessageCircle, ShieldCheck, Sparkles, UsersRound, Loader2 } from 'lucide-react';
import { notifications } from '@/lib/demo-data'; // Keep notifications mock for now
import { ProfileCard } from '@/components/profile/profile-card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { matchesService } from '@/services';
import type { Profile } from '@/lib/demo-data';

export default function DashboardPage() { 
  const [recommendations, setRecommendations] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    matchesService.getRecommendations()
      .then((res) => {
        const mapped = (res.data || []).slice(0, 3).map((u: any) => ({
          id: u.id,
          name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'User',
          age: u.dateOfBirth ? Math.floor((new Date().getTime() - new Date(u.dateOfBirth).getTime()) / 31557600000) : 25,
          city: u.city || 'Unknown',
          state: u.country || 'Unknown',
          profession: u.occupation || 'Not specified',
          education: u.education || 'Not specified',
          image: u.photos?.[0]?.url || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85',
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
        setRecommendations(mapped);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  return <div className="space-y-7">
 <section className="relative overflow-hidden rounded-[28px] bg-primary-deep p-6 text-white shadow-xl sm:p-8"><div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary-light/10 blur-3xl"/><div className="relative max-w-2xl"><Badge>Private by design</Badge><h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">A thoughtful start to something meaningful.</h1><p className="mt-3 max-w-xl leading-7 text-white/75">Your recommendations are ready. Take a moment to explore profiles, review interests and continue conversations that feel right.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/app/discover"><Button>Explore matches <ArrowRight className="ml-1 h-4 w-4"/></Button></Link><Link href="/app/profile"><Button variant="secondary">Complete your profile</Button></Link></div></div></section>
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{label:'Profile strength',value:'82%',detail:'2 sections to complete',icon:CheckCircle2,href:'/app/profile'},{label:'New interests',value:'4',detail:'2 need your response',icon:Heart,href:'/app/interests'},{label:'New messages',value:'2',detail:'Across 3 conversations',icon:MessageCircle,href:'/app/messages'},{label:'New suggestions',value:'12',detail:'Updated today',icon:Sparkles,href:'/app/discover'}].map(({label,value,detail,icon:Icon,href})=><Link key={label} href={href}><Card className="h-full p-5 transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-center justify-between"><div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-light text-primary"><Icon className="h-5 w-5"/></div><ArrowRight className="h-4 w-4 text-subtle-foreground"/></div><p className="mt-5 text-sm font-semibold text-muted">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-muted">{detail}</p></Card></Link>)}</div>
 <section className="space-y-4">
   <SectionHeader eyebrow="For you" title="Recommended profiles" description="A few people who align with the preferences in your profile." action={<Link href="/app/discover" className="text-sm font-semibold text-primary">View all</Link>}/>
   {isLoading ? (
     <div className="py-10 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
   ) : (
     <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{recommendations.map(p=><ProfileCard key={p.id} profile={p} compact/>)}</div>
   )}
 </section>
 <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><Card className="p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Your activity</p><h2 className="mt-1 text-lg font-bold">Recent updates</h2></div><Bell className="h-5 w-5 text-muted"/></div><div className="mt-4 divide-y divide-border">{notifications.slice(0,3).map(n=><div key={n.id} className="flex gap-3 py-4"><Avatar src={n.profile?.image} name={n.profile?.name ?? 'LetsChat'} size="sm"/><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{n.title}</p><p className="mt-1 text-xs leading-5 text-muted">{n.text}</p><p className="mt-1 text-[11px] text-subtle-foreground">{n.time}</p></div>{n.unread&&<span className="mt-1 h-2 w-2 rounded-full bg-primary"/>}</div>)}</div></Card><Card className="p-5"><div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-light text-primary"><ShieldCheck className="h-5 w-5"/></div><h2 className="mt-4 text-lg font-bold">Build trust into every connection</h2><p className="mt-2 text-sm leading-6 text-muted">Keep your profile authentic, protect private information and use the report/block tools whenever something feels uncomfortable.</p><div className="mt-5 space-y-3 text-sm"><p className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-success"/> Verify your important profile details</p><p className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-success"/> Keep conversations inside the platform</p><p className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-success"/> Review privacy settings regularly</p></div></Card></div>
 </div> 
}
