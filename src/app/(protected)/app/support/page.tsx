'use client';
import { useState } from 'react';
import { SectionHeader } from '@/components/ui/section-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Bug, 
  Lightbulb, 
  Star,
  CheckCircle2,
  Send,
  Heart
} from 'lucide-react';

export default function SupportPage() {
  const [tab, setTab] = useState<'contact' | 'feedback'>('contact');
  
  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'feature'>('general');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Mock submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader 
        eyebrow="Help & Support" 
        title="How can we help you?" 
        description="Get in touch with our team or share your thoughts to help us improve."
      />

      <div className="flex gap-2 overflow-x-auto rounded-xl bg-[var(--surface-muted)] p-1.5 scrollbar-hide max-w-sm">
        {(['contact', 'feedback'] as const).map(t => (
          <button 
            key={t} 
            onClick={() => {
              setTab(t);
              setIsSuccess(false);
            }} 
            className={cn(
              "flex-1 rounded-lg px-5 py-2.5 text-sm font-semibold capitalize whitespace-nowrap transition-all duration-200",
              tab === t 
                ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm border border-[var(--border)]/50" 
                : "text-[var(--muted-strong)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]/50"
            )}
          >
            {t === 'contact' ? 'Contact Us' : 'Feedback'}
          </button>
        ))}
      </div>

      {tab === 'contact' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card className="p-6 sm:p-8 shadow-sm border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-6">Send us a message</h2>
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 text-center h-[350px]">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)]">Message Sent!</h3>
                <p className="text-[var(--muted)] mt-2">Our support team will get back to you within 24 hours.</p>
                <Button variant="secondary" className="mt-6" onClick={() => setIsSuccess(false)}>Send another message</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">First Name</label>
                    <input required className="focus-ring h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Last Name</label>
                    <input required className="focus-ring h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Email Address</label>
                  <input type="email" required className="focus-ring h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Topic</label>
                  <select className="focus-ring h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm outline-none">
                    <option>General Inquiry</option>
                    <option>Billing Support</option>
                    <option>Technical Issue</option>
                    <option>Report a User</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Message</label>
                  <textarea required rows={4} className="focus-ring w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm outline-none resize-none" placeholder="How can we help?" />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-sm font-bold bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)]">
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="p-6 shadow-sm border-[var(--border)] bg-[var(--primary)]/5">
              <h2 className="font-bold text-[var(--foreground)] mb-4">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm text-[var(--primary)]">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">Helpline</p>
                    <p className="text-sm font-medium text-[var(--primary-deep)] mt-0.5">1800-MATRIMONY</p>
                    <p className="text-xs text-[var(--muted)] mt-1">Mon-Sat from 9am to 6pm.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 bg-white rounded-full flex items-center justify-center shadow-sm text-[var(--primary)]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">Email Support</p>
                    <p className="text-sm font-medium text-[var(--primary-deep)] mt-0.5">care@matrimony.com</p>
                    <p className="text-xs text-[var(--muted)] mt-1">Expect a reply within 24hrs.</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-sm border-[var(--border)]">
              <h2 className="font-bold text-[var(--foreground)] mb-2">Need a quicker answer?</h2>
              <p className="text-sm text-[var(--muted)] mb-4">Check out our frequently asked questions.</p>
              <Button variant="outline" className="w-full">Browse Help Center</Button>
            </Card>
          </div>
        </div>
      )}

      {tab === 'feedback' && (
        <Card className="max-w-2xl mx-auto p-6 sm:p-8 shadow-sm border-[var(--border)]">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[var(--foreground)]">We value your feedback</h2>
            <p className="mt-2 text-[var(--muted)]">Help us shape the future of this platform by sharing your experience.</p>
          </div>

          {isSuccess ? (
             <div className="flex flex-col items-center justify-center py-10 text-center h-[350px]">
               <div className="h-16 w-16 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-4">
                 <Heart className="h-8 w-8 text-[var(--primary)] fill-[var(--primary)]" />
               </div>
               <h3 className="text-xl font-bold text-[var(--foreground)]">Thank You!</h3>
               <p className="text-[var(--muted)] mt-2 max-w-sm">Your feedback has been successfully submitted. We deeply appreciate your time.</p>
               <Button variant="secondary" className="mt-8" onClick={() => setIsSuccess(false)}>Submit another response</Button>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setRating(star)}
                    className="focus-ring p-1 transition-transform hover:scale-110"
                  >
                    <Star className={cn("h-10 w-10", rating >= star ? "text-amber-400 fill-amber-400" : "text-[var(--border)]")} />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-3">What kind of feedback is this?</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'general', label: 'General', icon: MessageSquare },
                    { id: 'feature', label: 'Feature Idea', icon: Lightbulb },
                    { id: 'bug', label: 'Report a Bug', icon: Bug }
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFeedbackType(type.id as any)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-sm font-medium transition-all",
                        feedbackType === type.id 
                          ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary-deep)] shadow-sm" 
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-muted)]"
                      )}
                    >
                      <type.icon className="h-5 w-5" />
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Tell us more</label>
                <textarea 
                  required 
                  rows={5} 
                  className="focus-ring w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm outline-none resize-none" 
                  placeholder={
                    feedbackType === 'bug' ? "What went wrong? Please be as detailed as possible." :
                    feedbackType === 'feature' ? "What feature would make your experience better?" :
                    "What do you like or dislike about your experience?"
                  }
                />
              </div>

              <Button type="submit" disabled={isSubmitting || rating === 0} className="w-full h-12 text-sm font-bold bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)]">
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'} <Send className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}
        </Card>
      )}
    </div>
  );
}
