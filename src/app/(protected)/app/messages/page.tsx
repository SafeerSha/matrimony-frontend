'use client';
import { useState } from 'react';
import { Check, Lock, MoreHorizontal, Paperclip, Search, Send, Smile, Info, Crown, ArrowRight } from 'lucide-react';
import { conversations } from '@/lib/demo-data';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { cn } from '@/lib/cn';
import Link from 'next/link';

export default function MessagesPage() {
  // Mock subscription state for Phase 1 demonstration
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const [selected, setSelected] = useState(conversations[0]);
  const [text, setText] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(c => 
    c.profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (text.trim()) {
      setSent([...sent, text.trim()]);
      setText('');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        eyebrow="Messages" 
        title="Conversations" 
        description="Continue conversations with people you've connected with." 
        action={
          <button 
            onClick={() => setIsSubscribed(!isSubscribed)}
            className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] border border-[var(--border)] px-3 py-1.5 rounded-lg"
          >
            Toggle Subscription State (Dev)
          </button>
        }
      />

      <Card className="overflow-hidden p-0 border border-[var(--border)] shadow-sm">
        <div className="grid min-h-[650px] lg:grid-cols-[320px_1fr]">
          
          {/* LEFT SIDEBAR: Conversation List */}
          <aside className="border-b border-[var(--border)] lg:border-b-0 lg:border-r bg-[var(--background)]">
            <div className="border-b border-[var(--border)] p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search conversations" 
                  className="focus-ring h-10 w-full rounded-xl bg-[var(--surface-muted)] pl-9 pr-3 text-sm outline-none placeholder:text-[var(--muted-light)]" 
                />
              </div>
            </div>
            <div className="max-h-[280px] overflow-y-auto lg:max-h-[600px] scrollbar-hide">
              {filteredConversations.map(c => (
                <button 
                  key={c.id} 
                  onClick={() => setSelected(c)} 
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-[var(--border)] p-4 text-left transition-colors",
                    selected.id === c.id ? "bg-[var(--primary)]/5" : "hover:bg-[var(--surface-muted)]"
                  )}
                >
                  <div className="relative shrink-0">
                    <Avatar src={c.profile.image} name={c.profile.name} size="md" />
                    {c.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--background)] bg-green-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-bold text-[var(--foreground)]">{c.profile.name}</p>
                      <span className="text-[11px] font-medium text-[var(--muted)]">{c.time}</span>
                    </div>
                    <p className={cn("mt-0.5 truncate text-xs", c.unread > 0 ? "text-[var(--foreground)] font-semibold" : "text-[var(--muted)]")}>
                      {c.last}
                    </p>
                  </div>
                  {c.unread > 0 && (
                    <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-[var(--primary)] px-1.5 text-[10px] font-bold text-white">
                      {c.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* RIGHT SIDE: Chat Area */}
          <section className="flex min-h-[500px] flex-col bg-white relative">
            <header className="flex items-center justify-between border-b border-[var(--border)] p-4 bg-white/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <Avatar src={selected.profile.image} name={selected.profile.name} size="sm" />
                <div>
                  <p className="font-bold text-sm text-[var(--foreground)]">{selected.profile.name}</p>
                  <p className="text-[11px] font-medium text-[var(--muted)]">
                    {selected.online ? <span className="text-green-600">Online now</span> : 'Active 2h ago'}
                  </p>
                </div>
              </div>
              <button aria-label="Options" className="grid h-9 w-9 place-items-center rounded-full hover:bg-[var(--surface-muted)] text-[var(--muted)]">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </header>

            {!isSubscribed ? (
              /* LOCKED STATE FOR FREE USERS */
              <div className="flex-1 flex flex-col items-center justify-center bg-[var(--surface-muted)]/50 p-6 text-center">
                <div className="h-20 w-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-6 shadow-sm border border-amber-300/50">
                  <Crown className="h-10 w-10 text-amber-600" />
                </div>
                <h2 className="text-2xl font-editorial-title text-[var(--foreground)] mb-3">Unlock Private Messaging</h2>
                <p className="text-sm text-[var(--muted)] max-w-md leading-relaxed mb-8">
                  You have a connection with {selected.profile.name}! Upgrade to a Premium Subscription to read their messages, reply instantly, and take the next step.
                </p>
                <Link href="/app/subscription" className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 text-sm font-semibold text-white shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all">
                  View Subscription Plans <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              /* UNLOCKED STATE FOR SUBSCRIBED USERS */
              <>
                <div className="flex-1 space-y-6 overflow-y-auto bg-[var(--surface-muted)]/30 p-6">
                  <div className="mx-auto flex max-w-sm items-start gap-3 rounded-2xl border border-[var(--border)] bg-amber-50/50 p-4 text-left shadow-sm">
                    <Info className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                    <p className="text-xs leading-relaxed text-amber-800/80 font-medium">
                      This is a premium private chat. Be respectful and never share sensitive financial or login information.
                    </p>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="max-w-[75%]">
                      <div className="rounded-2xl rounded-tl-sm bg-white border border-[var(--border)] px-4 py-3 text-sm text-[var(--foreground)] shadow-sm">
                        <p>Hi! I really enjoyed reading your profile. We seem to share a lot of similar interests.</p>
                      </div>
                      <span className="mt-1.5 ml-1 block text-[10px] font-medium text-[var(--muted)]">10:36 AM</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className="max-w-[75%]">
                      <div className="rounded-2xl rounded-tr-sm bg-[var(--primary)] px-4 py-3 text-sm text-white shadow-sm">
                        <p>Thank you! I've been wanting to connect as well. How has your week been so far?</p>
                      </div>
                      <span className="mt-1.5 mr-1 flex items-center justify-end gap-1 text-[10px] font-medium text-[var(--muted)]">
                        10:39 AM <Check className="h-3.5 w-3.5 text-[var(--primary)]" />
                      </span>
                    </div>
                  </div>
                  
                  {sent.map((m, i) => (
                    <div key={i} className="flex justify-end">
                      <div className="max-w-[75%]">
                        <div className="rounded-2xl rounded-tr-sm bg-[var(--primary)] px-4 py-3 text-sm text-white shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <p>{m}</p>
                        </div>
                        <span className="mt-1.5 mr-1 block text-right text-[10px] font-medium text-[var(--muted)]">Just now</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-[var(--border)] bg-white p-4">
                  <div className="flex items-end gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/50 p-1.5 focus-within:border-[var(--primary)] focus-within:ring-4 focus-within:ring-[var(--primary)]/10 transition-all">
                    <button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-colors" aria-label="Attach">
                      <Paperclip className="h-4.5 w-4.5" />
                    </button>
                    <textarea 
                      value={text} 
                      onChange={e => setText(e.target.value)} 
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }} 
                      placeholder="Type a message..." 
                      className="max-h-32 min-h-[40px] w-full resize-none bg-transparent py-2.5 px-2 text-sm outline-none placeholder:text-[var(--muted-light)]" 
                      rows={1}
                    />
                    <button className="hidden sm:grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[var(--muted)] hover:bg-[var(--border)] hover:text-[var(--foreground)] transition-colors" aria-label="Emoji">
                      <Smile className="h-4.5 w-4.5" />
                    </button>
                    <Button 
                      onClick={handleSend} 
                      disabled={!text.trim()}
                      className={cn(
                        "h-10 w-10 shrink-0 rounded-xl p-0 transition-all duration-200",
                        text.trim() ? "bg-[var(--primary)] text-white shadow-md hover:bg-[var(--primary-deep)]" : "bg-[var(--border)] text-[var(--muted)]"
                      )} 
                      aria-label="Send"
                    >
                      <Send className="h-4 w-4 ml-0.5" />
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center justify-between px-1">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-light)]">Secure Connection</p>
                    <Badge tone="accent" className="text-[9px] px-2 py-0.5">Premium Chat</Badge>
                  </div>
                </div>
              </>
            )}
          </section>

        </div>
      </Card>
    </div>
  );
}
