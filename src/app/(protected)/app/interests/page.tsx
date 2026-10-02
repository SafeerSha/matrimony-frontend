'use client';
import { useState, useEffect, useMemo } from 'react';
import { Check, Heart, MessageCircle, Search, X, ShieldAlert, Loader2 } from 'lucide-react';
import { ProfileCard } from '@/components/profile/profile-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SectionHeader } from '@/components/ui/section-header';
import { cn } from '@/lib/cn';
import { matchesService } from '@/services';
import type { Profile } from '@/lib/demo-data';

// Helper to map UserProfile to Profile UI model
const mapProfile = (u: any): Profile => ({
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
});

export default function InterestsPage() {
  const [tab, setTab] = useState<'pending' | 'sent' | 'accepted' | 'declined'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [pendingItems, setPendingItems] = useState<Profile[]>([]);
  const [acceptedItems, setAcceptedItems] = useState<Profile[]>([]);
  const [declinedItems, setDeclinedItems] = useState<Profile[]>([]);
  const [sentItems, setSentItems] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data when tab changes
  useEffect(() => {
    setIsLoading(true);
    let type: "received" | "sent" | "matches" | "shortlisted";
    
    if (tab === 'pending') type = 'received';
    else if (tab === 'sent') type = 'sent';
    else if (tab === 'accepted') type = 'matches';
    else {
      // Declined is not explicitly supported by backend, just clear loader
      setIsLoading(false);
      return;
    }

    matchesService.getConnections(type)
      .then(res => {
        const data = Array.isArray(res) ? res : (res.data || []);
        const mapped = data.map(mapProfile);
        if (tab === 'pending') setPendingItems(mapped);
        else if (tab === 'sent') setSentItems(mapped);
        else if (tab === 'accepted') setAcceptedItems(mapped);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, [tab]);

  const handleSearch = (items: Profile[]) => {
    if (!searchQuery.trim()) return items;
    const lowerQuery = searchQuery.toLowerCase();
    return items.filter(p => 
      `${p.id} ${p.name} ${p.city} ${p.profession} ${p.education}`.toLowerCase().includes(lowerQuery)
    );
  };

  const accept = async (id: string) => {
    try {
      await matchesService.acceptInterest(id);
      const item = pendingItems.find(p => p.id === id);
      if (item) {
        setPendingItems(prev => prev.filter(p => p.id !== id));
        // We don't push to acceptedItems directly, we'll re-fetch when they visit the accepted tab
      }
    } catch (e) {
      console.error(e);
    }
  };

  const decline = async (id: string) => {
    try {
      await matchesService.rejectInterest(id);
      const item = pendingItems.find(p => p.id === id);
      if (item) {
        setPendingItems(prev => prev.filter(p => p.id !== id));
        setDeclinedItems(prev => [item, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredPending = handleSearch(pendingItems);
  const filteredSent = handleSearch(sentItems);
  const filteredAccepted = handleSearch(acceptedItems);
  const filteredDeclined = handleSearch(declinedItems);

  return (
    <div className="space-y-6">
      <SectionHeader 
        eyebrow="Connections" 
        title="Requests & Interests" 
        description="Manage your incoming requests, accepted connections, and sent interests." 
      />

      <Card className="p-3 sm:p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <input 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Search requests by Unique ID, name, location or profession..." 
            className="focus-ring h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-10 pr-4 text-sm outline-none placeholder:text-[var(--muted-light)]" 
          />
        </div>
      </Card>

      <div className="flex gap-2 overflow-x-auto rounded-xl bg-[var(--surface-muted)] p-1.5 scrollbar-hide">
        {(['pending', 'sent', 'accepted', 'declined'] as const).map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={cn(
              "rounded-lg px-5 py-2.5 text-sm font-semibold capitalize whitespace-nowrap transition-all duration-200",
              tab === t 
                ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm border border-[var(--border)]/50" 
                : "text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]/50"
            )}
          >
            {t === 'pending' ? 'Pending Requests' : t}
            {t === 'pending' && pendingItems.length > 0 && (
              <span className="ml-2 inline-flex h-5 items-center justify-center rounded-full bg-[var(--primary)] px-2 text-[10px] font-bold text-white">
                {pendingItems.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center items-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
      ) : (
        <>
          {/* PENDING TAB */}
          {tab === 'pending' && (
            <div className="space-y-3">
              {filteredPending.map(p => (
                <Card key={p.id} className="p-5 transition-shadow hover:shadow-md">
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar src={p.image} name={p.name} size="xl" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-bold text-[var(--foreground)] text-lg">{p.name} <span className="font-normal text-[var(--muted)]">({p.age})</span></h3>
                          <Badge tone="success">{p.compatibility}% match</Badge>
                        </div>
                        <p className="text-sm font-medium text-[var(--primary)] mb-1">ID: {p.id.toUpperCase()}</p>
                        <p className="text-sm text-[var(--muted)]">{p.profession} · {p.city}</p>
                        <p className="mt-2 line-clamp-2 text-sm text-[var(--muted-strong)] bg-[var(--surface-muted)] p-3 rounded-xl italic">"{p.about}"</p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 shrink-0 justify-center">
                      <Button variant="primary" onClick={() => accept(p.id)} className="flex-1 sm:flex-none">
                        <Check className="mr-2 h-4 w-4" /> Accept
                      </Button>
                      <Button variant="outline" onClick={() => decline(p.id)} className="flex-1 sm:flex-none">
                        <X className="mr-2 h-4 w-4" /> Decline
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {filteredPending.length === 0 && (
                <Card className="p-12 text-center border-dashed">
                  <div className="mx-auto h-16 w-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-4">
                    <Heart className="h-8 w-8 text-[var(--primary)]" />
                  </div>
                  <h3 className="font-bold text-lg text-[var(--foreground)]">No pending requests</h3>
                  <p className="mt-2 text-sm text-[var(--muted)] max-w-md mx-auto">
                    {searchQuery ? "No requests match your search criteria." : "You're all caught up! When someone sends you an interest, it will appear here."}
                  </p>
                </Card>
              )}
            </div>
          )}

          {/* SENT TAB */}
          {tab === 'sent' && (
            <div className="grid gap-5 sm:grid-cols-2">
              {filteredSent.map(p => (
                <ProfileCard key={p.id} profile={p} compact />
              ))}
              {filteredSent.length === 0 && (
                <Card className="p-12 text-center col-span-full border-dashed">
                  <p className="text-sm text-[var(--muted)]">No sent interests found.</p>
                </Card>
              )}
            </div>
          )}

          {/* ACCEPTED TAB */}
          {tab === 'accepted' && (
            <div className="space-y-3">
              {filteredAccepted.map(p => (
                <Card key={p.id} className="p-5">
                  <div className="flex items-center gap-4">
                    <Avatar src={p.image} name={p.name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[var(--foreground)]">{p.name}, {p.age}</h3>
                      <p className="text-sm font-medium text-[var(--primary)] mb-0.5">ID: {p.id.toUpperCase()}</p>
                      <p className="text-sm text-[var(--muted)]">{p.city}</p>
                    </div>
                    <Button variant="primary" className="hidden sm:inline-flex">
                      <MessageCircle className="mr-2 h-4 w-4" /> Chat
                    </Button>
                  </div>
                </Card>
              ))}
              {filteredAccepted.length === 0 && (
                <Card className="p-12 text-center border-dashed">
                  <MessageCircle className="mx-auto h-8 w-8 text-[var(--muted-light)] mb-4" />
                  <h3 className="font-bold text-[var(--foreground)]">No accepted connections</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">Your accepted requests will appear here so you can chat with them.</p>
                </Card>
              )}
            </div>
          )}

          {/* DECLINED TAB */}
          {tab === 'declined' && (
            <div className="space-y-3">
              {filteredDeclined.map(p => (
                <Card key={p.id} className="p-5 opacity-70">
                  <div className="flex items-center gap-4">
                    <Avatar src={p.image} name={p.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-[var(--foreground)]">{p.name}, {p.age}</h3>
                      <p className="text-sm text-[var(--muted)]">ID: {p.id.toUpperCase()}</p>
                    </div>
                    <Badge tone="default">Declined</Badge>
                  </div>
                </Card>
              ))}
              {filteredDeclined.length === 0 && (
                <Card className="p-12 text-center border-dashed">
                  <ShieldAlert className="mx-auto h-8 w-8 text-[var(--muted-light)] mb-4" />
                  <h3 className="font-bold text-[var(--foreground)]">No declined requests</h3>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
