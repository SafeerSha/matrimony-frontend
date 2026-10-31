'use client';

import Link from 'next/link';
import {
  IconPhone,
  IconMail,
  IconBrandWhatsapp,
  IconArrowLeft,
  IconShieldCheck,
  IconClock,
  IconHelpCircle,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { Logo } from '@/components/layout/logo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CONTACT_INFO } from '@/config/contact';

export default function PublicSupportPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo showTagline={false} className="scale-90 sm:scale-100 origin-left" />
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--muted-strong)] hover:text-[var(--primary)] px-3 py-1.5 rounded-lg hover:bg-[var(--surface-muted)] transition-colors"
            >
              <IconArrowLeft className="h-4 w-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Hero Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[var(--primary)] text-xs font-bold border border-rose-100">
            <IconShieldCheck className="h-3.5 w-3.5" />
            <span>Dedicated Trust & Support Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
            How can we help you?
          </h1>
          <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
            Our customer care team is available to assist with account access, membership inquiries, ban reviews, and platform safety.
          </p>
        </div>

        {/* Contact Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* WhatsApp Card */}
          <Card className="p-6 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 to-white shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <IconBrandWhatsapp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-emerald-950">WhatsApp Support</h3>
                <p className="text-xs text-emerald-800/80 mt-1">
                  Instant messaging with our care specialists for fast assistance.
                </p>
              </div>
            </div>
            <div className="pt-6">
              <Button
                variant="primary"
                size="sm"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                onClick={() => window.open(CONTACT_INFO.whatsappUrl, '_blank', 'noopener,noreferrer')}
              >
                Chat on WhatsApp
              </Button>
            </div>
          </Card>

          {/* Helpline Card */}
          <Card className="p-6 rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[#FAF3EC] to-white shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center shadow-sm">
                <IconPhone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--foreground)]">Phone Helpline</h3>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Speak directly with a support manager.
                </p>
                <p className="text-sm font-extrabold text-[var(--primary)] mt-2">
                  {CONTACT_INFO.phoneDisplay}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-[var(--muted)] mt-1">
                  <IconClock className="h-3 w-3 shrink-0" />
                  <span>{CONTACT_INFO.hours}</span>
                </div>
              </div>
            </div>
            <div className="pt-6">
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-xl font-bold border-[var(--primary)] text-[var(--primary)] hover:bg-rose-50 cursor-pointer"
                onClick={() => window.open(CONTACT_INFO.phoneTel, '_self')}
              >
                Call Customer Care
              </Button>
            </div>
          </Card>

          {/* Email Card */}
          <Card className="p-6 rounded-3xl border border-[var(--border)] bg-white shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-sm">
                <IconMail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--foreground)]">Email Support</h3>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Send detailed requests or verification documents.
                </p>
                <p className="text-xs font-semibold text-[var(--foreground)] mt-2 truncate">
                  {CONTACT_INFO.email}
                </p>
                <p className="text-[11px] text-[var(--muted)] mt-1">
                  Typical response within 24 hours.
                </p>
              </div>
            </div>
            <div className="pt-6">
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-xl font-bold cursor-pointer"
                onClick={() => window.open(CONTACT_INFO.emailMailto, '_self')}
              >
                Send Email
              </Button>
            </div>
          </Card>
        </div>

        {/* Account Restriction / Ban Information FAQ */}
        <Card className="p-6 sm:p-8 rounded-3xl border border-rose-200 bg-rose-50/40 shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-800 shrink-0">
              <IconAlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-rose-950">
                Account Suspensions & Access Reviews
              </h2>
              <p className="text-xs sm:text-sm text-rose-900/80 leading-relaxed">
                If your account displays an alert stating it has been banned or restricted, our safety team flagged activity that may require identity verification or policy review.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-rose-200/70 text-xs sm:text-sm text-rose-900/90 space-y-2">
            <p className="font-semibold text-rose-950">To request an expedited account review:</p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>Send an email to <a href={CONTACT_INFO.emailMailto} className="font-bold underline text-[var(--primary)]">{CONTACT_INFO.email}</a> or message us on WhatsApp.</li>
              <li>Include your registered email address or mobile number, and your Profile ID (e.g. LT-A00025).</li>
              <li>Our Trust & Safety team will review your account status and respond within 24 business hours.</li>
            </ol>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-6 bg-white/50 text-center text-xs text-[var(--muted)]">
        <p>© {new Date().getFullYear()} IshtamChat. All rights reserved.</p>
      </footer>
    </div>
  );
}

