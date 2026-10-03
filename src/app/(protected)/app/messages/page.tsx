'use client';
import { useState, useEffect, useRef } from 'react';
import { Check, Lock, MoreHorizontal, Paperclip, Search, Send, Smile, Info, Crown, ArrowRight, Loader2, MessageCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { cn } from '@/lib/cn';
import Link from 'next/link';
import { chatService, Conversation, Message } from '@/services/chat.service';

export default function MessagesPage() {
  const [isSubscribed, setIsSubscribed] = useState(true); // Default true for demo
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [text, setText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Socket & Fetch Conversations
  useEffect(() => {
    setIsLoadingConversations(true);
    
    // Connect to websocket
    chatService.connect();
    
    // Fetch initial conversations
    chatService.getConversations()
      .then(res => {
        const data = Array.isArray(res) ? res : ((res as any).data || []);
        setConversations(data);
        if (data.length > 0) {
          setSelected(data[0]);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingConversations(false));

    // Listen for incoming websocket messages
    const unsubscribe = chatService.onMessage((msg: Message) => {
      // If message belongs to current selected conversation, append it
      setMessages(prev => {
        // Simple check: if message is for the current conversation
        if (selected && msg.conversationId === selected.id) {
          // ensure no duplicate
          if (!prev.find(m => m.id === msg.id)) {
            return [...prev, msg];
          }
        }
        return prev;
      });
      
      // Update lastMessage in conversations list
      setConversations(prev => prev.map(c => {
        if (c.id === msg.conversationId) {
          return { ...c, lastMessage: msg, unreadCount: selected?.id === c.id ? 0 : c.unreadCount + 1 };
        }
        return c;
      }));
    });

    return () => {
      unsubscribe();
      chatService.disconnect();
    };
  }, []);

  // Fetch messages when selected conversation changes
  useEffect(() => {
    if (selected) {
      setIsLoadingMessages(true);
      chatService.getMessages(selected.id)
        .then(res => {
          const data = Array.isArray(res) ? res : ((res as any).data || []);
          setMessages(data.reverse()); // Assume API returns latest first, we want oldest first for chat UI
          chatService.markAsRead(selected.id).catch(console.error);
          
          // Clear unread count locally
          setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, unreadCount: 0 } : c));
        })
        .catch(console.error)
        .finally(() => setIsLoadingMessages(false));
    }
  }, [selected?.id]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredConversations = conversations.filter(c => {
    const name = c.participant?.firstName || c.participant?.name || 'User';
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSend = async () => {
    if (text.trim() && selected && selected.participantId) {
      const currentText = text.trim();
      setText(''); // Optimistic clear
      
      try {
        const newMsg = await chatService.sendMessage(selected.participantId, currentText);
        setMessages(prev => [...prev, newMsg]);
        setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, lastMessage: newMsg } : c));
      } catch (e) {
        console.error("Failed to send message", e);
        setText(currentText); // Revert on failure
      }
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            Toggle Subscription (Dev)
          </button>
        }
      />

      <Card className="overflow-hidden p-0 border border-[var(--border)] shadow-sm">
        <div className="grid min-h-[650px] lg:grid-cols-[320px_1fr]">
          
          {/* LEFT SIDEBAR: Conversation List */}
          <aside className="border-b border-[var(--border)] lg:border-b-0 lg:border-r bg-[var(--background)] flex flex-col">
            <div className="border-b border-[var(--border)] p-4 shrink-0">
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
            
            <div className="flex-1 overflow-y-auto scrollbar-hide max-h-[600px]">
              {isLoadingConversations ? (
                <div className="p-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" /></div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-10 text-center text-[var(--muted)] text-sm">No conversations found.</div>
              ) : (
                filteredConversations.map(c => {
                  const pName = c.participant?.firstName || c.participant?.name || 'User';
                  const pImage = c.participant?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85';
                  
                  return (
                    <button 
                      key={c.id} 
                      onClick={() => setSelected(c)} 
                      className={cn(
                        "flex w-full items-center gap-3 border-b border-[var(--border)] p-4 text-left transition-colors",
                        selected?.id === c.id ? "bg-[var(--primary)]/5" : "hover:bg-[var(--surface-muted)]"
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar src={pImage} name={pName} size="md" />
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--background)] bg-green-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-bold text-[var(--foreground)]">{pName}</p>
                          <span className="text-[11px] font-medium text-[var(--muted)]">{formatTime(c.lastMessage?.createdAt || c.updatedAt)}</span>
                        </div>
                        <p className={cn("mt-0.5 truncate text-xs", c.unreadCount > 0 ? "text-[var(--foreground)] font-semibold" : "text-[var(--muted)]")}>
                          {c.lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                      {c.unreadCount > 0 && (
                        <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-[var(--primary)] px-1.5 text-[10px] font-bold text-white">
                          {c.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          {/* RIGHT SIDE: Chat Area */}
          <section className="flex min-h-[500px] flex-col bg-white relative">
            {!selected ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-[var(--surface-muted)]/30 text-center p-6">
                <MessageCircle className="h-12 w-12 text-[var(--muted-light)] mb-4" />
                <h3 className="text-lg font-bold text-[var(--foreground)]">Your Messages</h3>
                <p className="text-sm text-[var(--muted)] max-w-sm mt-2">Select a conversation from the left to start chatting, or connect with someone new from your matches.</p>
              </div>
            ) : (
              <>
                <header className="flex items-center justify-between border-b border-[var(--border)] p-4 bg-white/95 backdrop-blur-sm z-10 shrink-0">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      src={selected.participant?.photos?.[0]?.url || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85'} 
                      name={selected.participant?.firstName || selected.participant?.name || 'User'} 
                      size="sm" 
                    />
                    <div>
                      <p className="font-bold text-sm text-[var(--foreground)]">{selected.participant?.firstName || selected.participant?.name || 'User'}</p>
                      <p className="text-[11px] font-medium text-[var(--muted)]">
                        <span className="text-[var(--primary)] font-medium">Online now</span>
                      </p>
                    </div>
                  </div>
                  <button aria-label="Options" className="grid h-9 w-9 place-items-center rounded-full hover:bg-[var(--surface-muted)] text-[var(--muted)] transition">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </header>

                {!isSubscribed ? (
                  /* LOCKED STATE FOR FREE USERS */
                  <div className="flex-1 flex flex-col items-center justify-center bg-[var(--surface-muted)]/50 p-6 text-center">
                    <div className="h-20 w-20 bg-gradient-to-br from-[#FAF3EC] to-[#F5EADE] rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#EAD7C5]">
                      <Crown className="h-10 w-10 text-[var(--accent)]" />
                    </div>
                    <h2 className="text-2xl font-editorial-title font-bold text-[var(--foreground)] mb-3">Unlock Private Messaging</h2>
                    <p className="text-sm text-[var(--muted)] max-w-md leading-relaxed mb-8">
                      You have a connection! Upgrade to a Premium Subscription to read their messages, reply instantly, and take the next step.
                    </p>
                    <Link href="/app/subscription" className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-8 text-sm font-semibold text-white shadow-[0_4px_16px_var(--primary-shadow)] hover:bg-[var(--primary-deep)] transition-all">
                      View Subscription Plans <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  /* UNLOCKED STATE FOR SUBSCRIBED USERS */
                  <>
                    <div className="flex-1 space-y-6 overflow-y-auto bg-[var(--surface-muted)]/30 p-6">
                      <div className="mx-auto flex max-w-sm items-start gap-3 rounded-2xl border border-[#EAD7C5] bg-[#FAF3EC]/80 p-4 text-left shadow-sm">
                        <Info className="h-5 w-5 shrink-0 text-[#8C5D30] mt-0.5" />
                        <p className="text-xs leading-relaxed text-[#5C3A1A] font-medium">
                          This is a premium private chat. Be respectful and never share sensitive financial or login information.
                        </p>
                      </div>
                      
                      {isLoadingMessages ? (
                        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[var(--primary)]" /></div>
                      ) : messages.length === 0 ? (
                        <div className="text-center text-[var(--muted)] text-sm py-10">Start the conversation! Say hi.</div>
                      ) : (
                        messages.map((m, i) => {
                          // Simple heuristic: if senderId is participantId, it's from them, else from us
                          const isOurs = m.senderId !== selected.participantId;
                          
                          return (
                            <div key={m.id || i} className={cn("flex", isOurs ? "justify-end" : "justify-start")}>
                              <div className="max-w-[75%]">
                                <div className={cn(
                                  "px-4 py-3 text-sm shadow-sm",
                                  isOurs 
                                    ? "rounded-2xl rounded-tr-sm bg-[var(--primary)] text-white" 
                                    : "rounded-2xl rounded-tl-sm bg-white border border-[var(--border)] text-[var(--foreground)]"
                                )}>
                                  <p>{m.content}</p>
                                </div>
                                <span className={cn("mt-1.5 flex items-center gap-1 text-[10px] font-medium text-[var(--muted)]", isOurs ? "justify-end mr-1" : "ml-1")}>
                                  {formatTime(m.createdAt)} {isOurs && <Check className="h-3.5 w-3.5 text-[var(--primary)]" />}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                    
                    <div className="border-t border-[var(--border)] bg-white p-4 shrink-0">
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
                          disabled={!text.trim() || isLoadingMessages}
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
              </>
            )}
          </section>

        </div>
      </Card>
    </div>
  );
}
