'use client';
import { useState } from 'react';
import { Check, Heart, MessageCircle, UserRound, X } from 'lucide-react';
import { receivedInterests, sentInterests } from '@/lib/demo-data';
import { ProfileCard } from '@/components/profile/profile-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/section-header';

export default function InterestsPage() { const [tab,setTab]=useState<'received'|'sent'|'accepted'>('received'); const [items,setItems]=useState(receivedInterests);
 const accept=(id:string)=>setItems(items.filter(p=>p.id!==id));
 return <div className="space-y-6"><SectionHeader eyebrow="Connections" title="Interests" description="See who is interested and manage the connections you want to explore." />
 <div className="flex gap-1 overflow-x-auto rounded-xl bg-surface-muted p-1">{(['received','sent','accepted'] as const).map(t=><button key={t} onClick={()=>setTab(t)} className={`rounded-lg px-4 py-2.5 text-sm font-semibold capitalize ${tab===t?'bg-surface text-foreground shadow-sm':'text-muted'}`}>{t}</button>)}</div>
 {tab==='received' && <div className="space-y-3">{items.map(p=><Card key={p.id} className="p-4"><div className="flex items-center gap-4"><Avatar src={p.image} name={p.name} size="lg"/><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{p.name}, {p.age}</h3><Badge tone="success">{p.compatibility}% match</Badge></div><p className="mt-1 text-sm text-muted">{p.profession} · {p.city}</p><p className="mt-2 line-clamp-1 text-sm text-muted">{p.about}</p></div><div className="hidden gap-2 sm:flex"><Button variant="secondary" onClick={()=>accept(p.id)}><Check className="mr-1 h-4 w-4"/> Accept</Button><Button variant="ghost"><X className="h-4 w-4"/></Button></div></div><div className="mt-4 grid grid-cols-2 gap-2 sm:hidden"><Button variant="secondary" onClick={()=>accept(p.id)}><Check className="mr-1 h-4 w-4"/> Accept</Button><Button variant="ghost"><X className="mr-1 h-4 w-4"/> Decline</Button></div></Card>)}{items.length===0&&<Card className="p-10 text-center"><Heart className="mx-auto h-8 w-8 text-primary"/><h3 className="mt-3 font-bold">You’re all caught up</h3><p className="mt-1 text-sm text-muted">New interests will appear here.</p></Card>}</div>}
 {tab==='sent' && <div className="grid gap-5 sm:grid-cols-2">{sentInterests.map(p=><ProfileCard key={p.id} profile={p} compact/>)}</div>}
 {tab==='accepted' && <Card className="p-8 text-center"><MessageCircle className="mx-auto h-8 w-8 text-primary"/><h3 className="mt-3 font-bold">Your accepted connections</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">Once you accept an interest, your conversation will appear here and in Messages.</p></Card>}
 </div>;
}
