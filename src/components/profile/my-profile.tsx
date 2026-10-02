'use client';
import { useState } from 'react';
import { Camera, CheckCircle2, ChevronRight, Edit3, Eye, Heart, Lock, Plus, Save, ShieldCheck, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { profiles } from '@/lib/demo-data';

const me = { 
  id: 'SAF12345', 
  name: 'Safeer', 
  age: 26, 
  city: 'Kochi', 
  profession: 'Software Engineer', 
  education: 'BSc Computer Science', 
  image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85' 
};

export function MyProfile() {
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'overview' | 'about' | 'preferences' | 'album'>('overview');

  const sections = [
    ['Basic details', 'Name, age, location and profession', '82% complete'],
    ['About you', 'A short introduction people can connect with', 'Complete'],
    ['Family & background', 'Help matches understand your background', 'Complete'],
    ['Lifestyle', 'Habits and interests', 'Complete'],
    ['Partner preferences', 'What matters to you in a partner', 'Complete']
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--primary)]">My Profile</p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">Profile Management</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Keep your details up to date to find the best matches.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary"><Eye className="mr-2 h-4 w-4" /> Preview</Button>
          <Button onClick={() => setSaved(true)}><Save className="mr-2 h-4 w-4" /> {saved ? 'Saved' : 'Save changes'}</Button>
        </div>
      </div>

      <Card className="overflow-hidden p-0 border border-[var(--border)] shadow-sm">
        <div className="relative h-48 bg-gradient-to-r from-[var(--primary-deep)] to-[var(--primary)]">
          <div className="absolute -bottom-12 left-6 rounded-full border-4 border-[var(--background)] bg-[var(--background)]">
            <Avatar src={me.image} name={me.name} size="xl" className="h-24 w-24 sm:h-28 sm:w-28" />
          </div>
          <button className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-xl bg-black/30 px-4 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-black/40 transition-colors">
            <Camera className="h-4 w-4" /> Change cover
          </button>
        </div>
        
        <div className="px-6 pb-6 pt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-[var(--foreground)]">{me.name}, {me.age}</h2>
                <Badge tone="success" className="h-6">Verified</Badge>
              </div>
              <p className="mt-1.5 text-sm font-medium text-[var(--muted-strong)]">{me.profession} · {me.city}</p>
              
              {/* Prominent Unique ID Display */}
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--primary)]/20 bg-[var(--primary)]/5 px-3 py-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Matrimony ID</span>
                <span className="text-sm font-bold tracking-widest text-[var(--primary-deep)]">{me.id}</span>
              </div>
            </div>
            
            <div className="rounded-2xl bg-[var(--primary)]/10 px-5 py-4 sm:min-w-[200px] border border-[var(--primary)]/20">
              <div className="flex justify-between items-end">
                <p className="text-xs font-semibold text-[var(--primary)]">Profile status</p>
                <p className="text-xl font-bold text-[var(--primary-deep)]">82%</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--primary)]/20">
                <div className="h-full w-[82%] rounded-full bg-[var(--primary)]" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-2 overflow-x-auto rounded-xl bg-[var(--surface-muted)] p-1.5 scrollbar-hide">
        {(['overview', 'about', 'preferences', 'album'] as const).map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold capitalize whitespace-nowrap transition-all duration-200 ${
              tab === t 
                ? 'bg-[var(--surface)] text-[var(--foreground)] shadow-sm border border-[var(--border)]/50' 
                : 'text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]/50'
            }`}
          >
            {t === 'about' ? 'Bio / Details' : t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <Card className="p-6 shadow-sm border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)]">Profile sections</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">Keep these details current and genuine.</p>
                </div>
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <div className="mt-6 divide-y divide-[var(--border)] border-t border-[var(--border)]">
                {sections.map(([title, desc, status]) => (
                  <button key={title} className="flex w-full items-center gap-4 py-4 text-left hover:bg-[var(--surface-muted)] transition-colors rounded-lg px-2 -mx-2">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">{desc}</p>
                    </div>
                    <span className="text-xs font-semibold text-green-600">{status}</span>
                    <ChevronRight className="h-4 w-4 text-[var(--muted-light)]" />
                  </button>
                ))}
              </div>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card className="p-6 shadow-sm border border-[var(--border)]">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="font-bold text-[var(--foreground)]">Privacy preview</h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">You control what is visible. Contact details stay private.</p>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--surface-muted)] p-4 border border-[var(--border)]">
                <span className="text-sm font-semibold text-[var(--foreground)]">Discoverable</span>
                <Badge tone="success">On</Badge>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'about' && (
        <Card className="p-6 sm:p-8 shadow-sm border border-[var(--border)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">About You (Bio)</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Keep your introduction natural and specific.</p>
            </div>
            <Button variant="outline"><Edit3 className="mr-2 h-4 w-4" /> Edit Bio</Button>
          </div>
          <div className="mt-6 rounded-2xl bg-[var(--surface-muted)] p-6 border border-[var(--border)]/50">
            <p className="leading-relaxed text-[var(--muted-strong)]">
              I'm a software engineer based in Kochi who values family, meaningful conversations and continuous learning. 
              I enjoy discovering new places, listening to music and spending time with people who matter.
            </p>
          </div>
          
          <div className="mt-8 border-t border-[var(--border)] pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[var(--foreground)]">Lifestyle & Interests</h2>
              <Button variant="ghost" size="sm"><Plus className="mr-2 h-4 w-4" /> Add Interest</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profiles[0].interests.map(i => <Badge key={i} tone="default" className="text-xs px-3 py-1.5">{i}</Badge>)}
            </div>
          </div>
        </Card>
      )}

      {tab === 'preferences' && (
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="p-6 sm:p-8 shadow-sm border border-[var(--border)]">
            <h2 className="text-lg font-bold text-[var(--foreground)]">Partner Characteristics</h2>
            <p className="mt-1 text-sm text-[var(--muted)] mb-6">What traits matter most to you.</p>
            <div className="space-y-4 text-sm">
              {['Kind and emotionally mature', 'Values family and friendship', 'Comfortable with honest communication', 'Supportive of personal growth'].map(x => (
                <div key={x} className="flex gap-3 items-start bg-[var(--surface-muted)] p-3 rounded-lg border border-[var(--border)]/50">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
                  <span className="text-[var(--muted-strong)] font-medium">{x}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-6 w-full"><Edit3 className="mr-2 h-4 w-4" /> Edit Characteristics</Button>
          </Card>

          <Card className="p-6 sm:p-8 shadow-sm border border-[var(--border)]">
            <h2 className="text-lg font-bold text-[var(--foreground)]">Discovery Preferences</h2>
            <p className="mt-1 text-sm text-[var(--muted)] mb-6">Filters applied to your matches.</p>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                ['Age Range', '24 – 32 years'],
                ['Location', 'Kerala + nearby'],
                ['Education', 'Bachelors or above'],
                ['Profession', 'Open to any']
              ].map(([k, v]) => (
                <div key={k} className="bg-[var(--surface-muted)] p-3 rounded-lg border border-[var(--border)]/50">
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">{k}</p>
                  <p className="mt-1 text-sm font-bold text-[var(--foreground)]">{v}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="mt-6 w-full"><Edit3 className="mr-2 h-4 w-4" /> Update Filters</Button>
          </Card>
        </div>
      )}

      {tab === 'album' && (
        <Card className="p-6 sm:p-8 shadow-sm border border-[var(--border)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-6 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">Photo Gallery</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Manage your supplementary photos (Max 5).</p>
            </div>
            <Button variant="primary"><Plus className="mr-2 h-4 w-4" /> Add Photo</Button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {/* Primary Profile Picture */}
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden border-2 border-[var(--primary)] group">
              <img src={me.image} alt="Profile" className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 bg-[var(--primary)] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Display Pic</div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button variant="secondary" size="sm" className="h-8">Change</Button>
              </div>
            </div>
            
            {/* Empty Slots */}
            {[1, 2].map(i => (
              <div key={i} className="aspect-[4/5] rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-muted)] flex flex-col items-center justify-center hover:bg-[var(--primary)]/5 hover:border-[var(--primary)]/30 transition-colors cursor-pointer text-[var(--muted)]">
                <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs font-semibold">Upload Photo</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
