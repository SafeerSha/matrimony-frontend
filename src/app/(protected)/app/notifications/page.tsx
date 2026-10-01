'use client';
import Link from 'next/link';
import { Bell, CheckCircle2, Heart, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { notifications } from '@/lib/demo-data';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';

const iconFor=(type:string)=>type==='interest'?Heart:type==='match'?Sparkles:type==='message'?MessageCircle:ShieldCheck;
export default function NotificationsPage(){return <div className="space-y-6"><SectionHeader eyebrow="Updates" title="Notifications" description="Stay up to date with matches, interests and account activity." action={<Button variant="secondary">Mark all as read</Button>}/><div className="space-y-2">{notifications.map(n=>{const Icon=iconFor(n.type);return <Card key={n.id} className={`p-4 ${n.unread?'border-primary-light bg-primary-light/25':''}`}><div className="flex gap-4"><div className="relative"><Avatar src={n.profile?.image} name={n.profile?.name ?? 'LetsChat'} size="md"/><span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-surface bg-primary text-white"><Icon className="h-3 w-3"/></span></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold">{n.title}</p><p className="mt-1 text-sm leading-6 text-muted">{n.text}</p></div>{n.unread&&<span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary"/>}</div><div className="mt-3 flex items-center gap-3"><span className="text-xs text-subtle-foreground">{n.time}</span>{n.profile&&<Link href={`/app/profile?user=${n.profile.id}`} className="text-xs font-semibold text-primary">View profile</Link>}</div></div></div></Card>})}</div><Card className="p-6 text-center"><Bell className="mx-auto h-7 w-7 text-primary"/><h3 className="mt-3 font-bold">Notifications are private</h3><p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted">We’ll only surface useful activity. You can control notification categories from Settings.</p></Card></div>}
