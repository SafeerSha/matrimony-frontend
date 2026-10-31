'use client';
import { useState } from 'react';
import { SectionHeader } from '@/components/ui/section-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModernSelect } from '@/components/ui/modern-select';
import { FeatureGate } from '@/components/ui/under-development';
import { CONTACT_INFO } from '@/config/contact';
import { cn } from '@/lib/cn';
import {
  IconPhone,
  IconMail,
  IconMessage,
  IconBug,
  IconBulb,
  IconStar,
  IconCircleCheck,
  IconSend,
  IconHeart,
  IconBrandWhatsapp,
} from '@tabler/icons-react';

export default function SupportPage() {
  const [tab, setTab] = useState<'contact' | 'feedback'>('contact');

  // Form states
  const [topic, setTopic] = useState('General Inquiry');
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
    <FeatureGate page="support" title="Help & Support">
      <div className="space-y-6 pb-10">
      <SectionHeader
        eyebrow="Help & Support"
        title="How can we help you?"
        description="Get in touch with our team or share your thoughts to help us improve."
      />

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E9DDE0] pb-3 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {(['contact', 'feedback'] as const).map((t) => {
          const isActive = tab === t;
          return (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setIsSuccess(false);
              }}
              className={cn(
                'inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-xs font-bold transition-all shrink-0 whitespace-nowrap capitalize select-none active-press',
                isActive
                  ? 'bg-[#7A1835] text-white shadow-xs'
                  : 'bg-white text-[#766B6F] border border-[#E9DDE0] hover:bg-[#FAF3EC] hover:text-[#211B1E]'
              )}
            >
              <span>{t === 'contact' ? 'Contact Us' : 'Feedback & Ratings'}</span>
            </button>
          );
        })}
      </div>

      {tab === 'contact' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card className="p-6 sm:p-8 rounded-3xl border border-[#E9DDE0] bg-white shadow-[var(--elevation-card)]">
            <h2 className="font-editorial-title text-xl sm:text-2xl font-bold text-[var(--foreground)] mb-6">Send us a message</h2>
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 text-center h-[350px]">
                <div className="h-16 w-16 bg-[#FAF3EC] rounded-2xl flex items-center justify-center mb-4 text-[#7A1835] border border-[#EAD8C7]">
                  <IconCircleCheck className="h-8 w-8 text-[#7A1835]" />
                </div>
                <h3 className="font-editorial-title text-lg font-bold text-[var(--foreground)]">Message Sent!</h3>
                <p className="text-xs text-[var(--muted)] mt-2">Our matrimonial support team will get back to you within 24 hours.</p>
                <Button variant="secondary" size="sm" className="mt-6 rounded-2xl text-xs font-bold" onClick={() => setIsSuccess(false)}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">First Name</label>
                    <input required className="focus-ring h-11 w-full rounded-2xl border border-[var(--border)] bg-[#FFFDFB] px-4 text-xs sm:text-sm outline-none font-medium" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Last Name</label>
                    <input required className="focus-ring h-11 w-full rounded-2xl border border-[var(--border)] bg-[#FFFDFB] px-4 text-xs sm:text-sm outline-none font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Email Address</label>
                  <input type="email" required className="focus-ring h-11 w-full rounded-2xl border border-[var(--border)] bg-[#FFFDFB] px-4 text-xs sm:text-sm outline-none font-medium" />
                </div>
                <div>
                  <ModernSelect
                    label="Topic"
                    value={topic}
                    onChange={setTopic}
                    options={[
                      { value: "General Inquiry", label: "General Inquiry" },
                      { value: "Billing & Premium", label: "Billing & Premium" },
                      { value: "Technical Issue", label: "Technical Issue" },
                      { value: "Report Profile or Concern", label: "Report Profile or Concern" },
                    ]}
                    size="sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Message</label>
                  <textarea required rows={4} className="focus-ring w-full rounded-2xl border border-[var(--border)] bg-[#FFFDFB] p-4 text-xs sm:text-sm outline-none resize-none font-medium" placeholder="How can our trust & support team assist you?" />
                </div>
                <Button type="submit" disabled={isSubmitting} variant="primary" size="md" className="w-full rounded-2xl text-xs font-bold shadow-md active-press">
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="p-6 sm:p-7 rounded-3xl border border-[#EAD8C7] bg-gradient-to-br from-[#FAF3EC] to-[#FFF9F6] shadow-xs">
              <h2 className="font-editorial-title text-base font-bold text-[#5C1027] mb-4">Contact Information</h2>
              <div className="space-y-5">
                <div className="flex gap-3.5">
                  <div className="h-10 w-10 shrink-0 bg-white border border-[#EAD8C7] rounded-2xl flex items-center justify-center shadow-2xs text-[#7A1835]">
                    <IconPhone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--foreground)]">Customer Care</p>
                    <a
                      href={CONTACT_INFO.phoneTel}
                      className="text-sm font-bold text-[#5C1027] hover:underline hover:text-[#7A1835] mt-0.5 block"
                    >
                      {CONTACT_INFO.phoneDisplay}
                    </a>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">{CONTACT_INFO.hours}</p>
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <div className="h-10 w-10 shrink-0 bg-white border border-[#EAD8C7] rounded-2xl flex items-center justify-center shadow-2xs text-[#25D366]">
                    <IconBrandWhatsapp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--foreground)]">WhatsApp Support</p>
                    <a
                      href={CONTACT_INFO.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-[#5C1027] hover:underline hover:text-[#7A1835] mt-0.5 block"
                    >
                      Chat on WhatsApp
                    </a>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">Quick assistance for inquiries</p>
                  </div>
                </div>

                <div className="flex gap-3.5">
                  <div className="h-10 w-10 shrink-0 bg-white border border-[#EAD8C7] rounded-2xl flex items-center justify-center shadow-2xs text-[#7A1835]">
                    <IconMail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[var(--foreground)]">Email Support</p>
                    <a
                      href={CONTACT_INFO.emailMailto}
                      className="text-sm font-bold text-[#5C1027] hover:underline hover:text-[#7A1835] mt-0.5 block"
                    >
                      {CONTACT_INFO.email}
                    </a>
                    <p className="text-[11px] text-[var(--muted)] mt-0.5">Replies typically within 24 hours</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-sm border-[var(--border)]">
              <h2 className="font-bold text-[var(--foreground)] mb-2">Need immediate assistance?</h2>
              <p className="text-sm text-[var(--muted)] mb-4">
                Call our customer care hotline directly at <a href={CONTACT_INFO.phoneTel} className="font-bold text-[#5C1027] hover:underline">{CONTACT_INFO.phoneDisplay}</a> for priority support.
              </p>
              <Button
                variant="outline"
                className="w-full text-xs font-bold"
                onClick={() => window.open(CONTACT_INFO.phoneTel, '_self')}
              >
                Call Customer Care
              </Button>
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
                <IconHeart className="h-8 w-8 text-[var(--primary)] fill-[var(--primary)]" />
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
                    <IconStar className={cn("h-10 w-10", rating >= star ? "text-amber-400 fill-amber-400" : "text-[var(--border)]")} />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--foreground)] mb-3">What kind of feedback is this?</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'general', label: 'General', icon: IconMessage },
                    { id: 'feature', label: 'Feature Idea', icon: IconBulb },
                    { id: 'bug', label: 'Report a Bug', icon: IconBug }
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
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'} <IconSend className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}
        </Card>
      )}
      </div>
    </FeatureGate>
  );
}
