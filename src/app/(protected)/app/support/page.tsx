'use client';
import { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/ui/section-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModernSelect } from '@/components/ui/modern-select';
import { FeatureGate } from '@/components/ui/under-development';
import { CONTACT_INFO } from '@/config/contact';
import { authService, profileService, supportService } from '@/services';
import { toast } from '@/lib/toast';
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

  // Contact Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    name: string;
    email: string;
    topic: string;
    message: string;
  } | null>(null);

  // Feedback Form states
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'feature'>('general');
  const [feedbackText, setFeedbackText] = useState('');

  // Auto-fill logged-in user's details
  useEffect(() => {
    async function loadUserDetails() {
      try {
        const [userRes, profileRes] = await Promise.allSettled([
          authService.getCurrentUser(),
          profileService.getProfile('me'),
        ]);

        if (userRes.status === 'fulfilled' && userRes.value) {
          const u = userRes.value as any;
          const userFullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || '';
          if (userFullName) setName(userFullName);
          if (u.email) setEmail(u.email);
        }

        if (profileRes.status === 'fulfilled' && profileRes.value) {
          const p = (profileRes.value.profile || profileRes.value) as any;
          const profileFullName = `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.name || '';
          if (profileFullName) setName((prev) => prev || profileFullName);
          if (p.email) setEmail((prev) => prev || p.email);
        }
      } catch {}
    }
    loadUserDetails();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !name.trim()) return;

    setIsSubmitting(true);
    const fullName = name.trim();
    const emailToUse = email.trim();
    const currentTopic = topic;
    const currentMessage = message.trim();

    try {
      // 1. Genuinely store inquiry in PostgreSQL database via API
      await supportService.submitInquiry({
        name: fullName,
        email: emailToUse,
        topic: currentTopic,
        message: currentMessage,
      });

      setSubmittedData({
        name: fullName,
        email: emailToUse,
        topic: currentTopic,
        message: currentMessage,
      });

      toast.success('Inquiry Submitted', 'Our customer support team has received your message.');
      setIsSuccess(true);
      setMessage('');
    } catch {
      // Fallback: still record and allow client-side email/WhatsApp dispatch
      setSubmittedData({
        name: fullName,
        email: emailToUse,
        topic: currentTopic,
        message: currentMessage,
      });
      setIsSuccess(true);
      toast.info('Message Prepared', 'You can dispatch your message directly to customer care.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || rating === 0) return;

    setIsSubmitting(true);
    try {
      // Genuinely store feedback / bug report / feature suggestion in database
      await supportService.submitFeedback({
        rating,
        type: feedbackType,
        message: feedbackText.trim(),
      });

      toast.success('Feedback Submitted', 'Thank you for helping us improve IshtamChat!');
      setIsSuccess(true);
      setFeedbackText('');
      setRating(0);
    } catch (err: any) {
      toast.error('Submission Failed', err.message || 'Unable to submit feedback right now.');
    } finally {
      setIsSubmitting(false);
    }
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
            {isSuccess && submittedData ? (
              <div className="flex flex-col items-center justify-center py-10 text-center min-h-[380px] space-y-4">
                <div className="h-16 w-16 bg-[#FAF3EC] rounded-2xl flex items-center justify-center text-[#7A1835] border border-[#EAD8C7] shadow-2xs">
                  <IconCircleCheck className="h-8 w-8 text-[#7A1835]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-editorial-title text-xl font-bold text-[var(--foreground)]">Inquiry Ready & Dispatched</h3>
                  <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                    Your message regarding <span className="font-semibold text-[var(--foreground)]">{submittedData.topic}</span> has been formatted for our customer care team at <span className="font-semibold text-[var(--primary)]">{CONTACT_INFO.email}</span>.
                  </p>
                </div>

                {/* Instant alternative channels */}
                <div className="w-full max-w-sm pt-2 space-y-2">
                  <a
                    href={`https://wa.me/917671908789?text=${encodeURIComponent(
                      `Hi IshtamChat Support,\nI need assistance with *${submittedData.topic}*.\nName: ${submittedData.name}\nEmail: ${submittedData.email}\n\nMessage:\n${submittedData.message}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                  >
                    <IconBrandWhatsapp className="h-4 w-4" />
                    <span>Send directly on WhatsApp</span>
                  </a>

                  <a
                    href={`mailto:${CONTACT_INFO.email}?subject=${encodeURIComponent(
                      `[IshtamChat Support] ${submittedData.topic} - ${submittedData.name}`
                    )}&body=${encodeURIComponent(
                      `Name: ${submittedData.name}\nEmail: ${submittedData.email}\nTopic: ${submittedData.topic}\n\nMessage:\n${submittedData.message}\n\n---\nSent from IshtamChat Web Portal`
                    )}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)] hover:bg-[#FAF3EC] text-xs font-semibold transition"
                  >
                    <IconMail className="h-4 w-4" />
                    <span>Open in Email App ({CONTACT_INFO.email})</span>
                  </a>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
                  onClick={() => setIsSuccess(false)}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Name</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="focus-ring h-11 w-full rounded-2xl border border-[var(--border)] bg-[#FFFDFB] px-4 text-xs sm:text-sm outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted-strong)] mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="focus-ring h-11 w-full rounded-2xl border border-[var(--border)] bg-[#FFFDFB] px-4 text-xs sm:text-sm outline-none font-medium"
                  />
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
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="focus-ring w-full rounded-2xl border border-[var(--border)] bg-[#FFFDFB] p-4 text-xs sm:text-sm outline-none resize-none font-medium"
                    placeholder="How can our trust & support team assist you?"
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} variant="primary" size="md" className="w-full rounded-2xl text-xs font-bold shadow-md active-press">
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </Card>

          {/* Clean Contact Information Sidebar (Duplicate Call Card Removed) */}
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
                    <a
                      href={CONTACT_INFO.phoneTel}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7A1835] hover:underline mt-1.5"
                    >
                      <span>Call Hotline</span>
                      <span>→</span>
                    </a>
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
            <form onSubmit={handleFeedbackSubmit} className="space-y-8">

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
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="focus-ring w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm outline-none resize-none"
                  placeholder={
                    feedbackType === 'bug' ? "What went wrong? Please be as detailed as possible." :
                      feedbackType === 'feature' ? "What feature would make your experience better?" :
                        "What do you like or dislike about your experience?"
                  }
                />
              </div>

              <Button type="submit" disabled={isSubmitting || rating === 0 || !feedbackText.trim()} className="w-full h-12 text-sm font-bold bg-[var(--primary)] text-white hover:bg-[var(--primary-deep)]">
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
