import Link from "next/link";
import {
  IconArrowLeft,
  IconShieldCheck,
  IconCreditCard,
  IconRotateClockwise,
  IconClock,
  IconAlertCircle,
  IconMail,
  IconPhone,
} from "@tabler/icons-react";
import { CONTACT_INFO } from "@/config/contact";

export const metadata = {
  title: "Refunds & Cancellations Policy – IshtamChat",
  description: "Official Refund and Cancellation Policy for IshtamChat subscriptions, Chat Permits, and membership services.",
};

export default function RefundPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 sm:px-6 py-12 sm:py-16">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[var(--primary)] hover:underline"
        >
          <IconArrowLeft className="h-4 w-4" /> Back to IshtamChat
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-[var(--border)] pb-8 mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] bg-[var(--primary-light)] px-3 py-1 rounded-full">
          Billing Policy
        </span>
        <h1 className="text-3xl sm:text-4xl font-editorial-title font-bold text-[var(--foreground)] mt-3">
          Refunds & Cancellations Policy
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-2xl">
          At IshtamChat.com, we strive to deliver transparent, reliable matchmaking and communication services. This policy outlines our cancellation guidelines and refund eligibility for Chat Permit subscriptions.
        </p>
        <p className="mt-2 text-xs text-[var(--muted)]">
          Last updated: January 2026 • Governed under the Information Technology Act & Consumer Protection (E-Commerce) Rules of India.
        </p>
      </div>

      <div className="space-y-8">
        {/* Section 1 - Nature of Service */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[var(--border)] shadow-xs">
          <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">1</span>
            Nature of Service & Instant Delivery
          </h2>
          <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
            IshtamChat provides matchmaking, relationship, and communication networking services through prepaid digital subscriptions known as <strong>Chat Permits</strong>.
          </p>
          <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
            Chat Permits are <strong>digital services delivered and activated immediately</strong> upon successful payment authorization through our secure payment gateway partner (Cashfree Payments). Once activated, members receive instant access to premium features including verified contact number quotas, elevated daily interests, and unlimited messaging with mutual matches.
          </p>
        </section>

        {/* Section 2 - Cancellation Policy */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[var(--border)] shadow-xs">
          <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">2</span>
            Cancellation Policy
          </h2>
          <div className="mt-3 space-y-3 text-sm text-[var(--muted)] leading-relaxed">
            <p>
              Users may cancel or discontinue their membership at any time through their account settings or by requesting account deactivation from customer support.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2 text-stone-700">
              <li>
                <strong>No Automatic Hidden Renewals:</strong> Chat Permits are prepaid, fixed-duration plans (30, 90, 180, or 365 days). We do not perform recurring auto-debits without explicit member selection.
              </li>
              <li>
                <strong>Access Duration:</strong> If you choose to stop using the platform during your active Chat Permit duration, your account features will remain active until the end of the purchased subscription validity, after which the account smoothly transitions back to the free tier without any penalty.
              </li>
              <li>
                <strong>Voluntary Account Deletion:</strong> If a member chooses to delete or deactivate their profile prior to plan expiration, remaining permit days and unused contact credits are forfeited.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3 - Refund Policy */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[var(--border)] shadow-xs">
          <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">3</span>
            Refund Policy & Eligibility
          </h2>
          <div className="mt-3 space-y-4 text-sm text-[var(--muted)] leading-relaxed">
            <p>
              Due to the immediate digital nature and consumption of matrimonial contact credits and messaging privileges upon purchase, <strong>Chat Permits are generally non-transferable and non-refundable</strong> once activated.
            </p>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <h3 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                <IconAlertCircle className="h-4 w-4 text-amber-700" />
                Eligible Refund Scenarios
              </h3>
              <p className="text-xs text-amber-900 mt-1">
                A full refund will be processed promptly under the following verified technical conditions:
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-amber-950 list-disc list-inside">
                <li>
                  <strong>Duplicate Payments:</strong> If your bank account or card was charged more than once for a single order due to a network timeout or gateway glitch.
                </li>
                <li>
                  <strong>Payment Debited but Not Activated:</strong> If the subscription amount was successfully deducted from your account, but the Chat Permit was not activated within 24 hours and our support team is unable to activate it manually.
                </li>
                <li>
                  <strong>Verified Platform Outage:</strong> Persistent technical failure attributable directly to IshtamChat that prevents account access for more than 7 consecutive business days.
                </li>
              </ul>
            </div>

            <p className="text-xs text-stone-600">
              <em>Note:</em> Inability to find a matching partner, lack of mutual interest from other members, change of personal mind after activating the permit, or violation of community standards resulting in account ban under our Terms & Conditions do not qualify for a refund.
            </p>
          </div>
        </section>

        {/* Section 4 - Refund Processing Timelines */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[var(--border)] shadow-xs">
          <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">4</span>
            Refund Request Process & Settlement Timeline
          </h2>
          <div className="mt-3 space-y-3 text-sm text-[var(--muted)] leading-relaxed">
            <p>
              To request a refund for an eligible transaction, please notify our billing team within <strong>7 calendar days</strong> of the transaction date.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[var(--border)]">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)]">
                  <IconRotateClockwise className="h-4 w-4" /> 1. Request
                </div>
                <p className="text-xs text-stone-600 mt-2">
                  Email us with your Order ID, registered phone/email, and bank debit proof.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[var(--border)]">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
                  <IconClock className="h-4 w-4" /> 2. Verification
                </div>
                <p className="text-xs text-stone-600 mt-2">
                  Our billing team audits the transaction with Cashfree within <strong>48–72 hours</strong>.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[var(--border)]">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <IconCreditCard className="h-4 w-4" /> 3. Settlement
                </div>
                <p className="text-xs text-stone-600 mt-2">
                  Funds credit back to your original source within <strong>5–7 business days</strong>.
                </p>
              </div>
            </div>
            <p className="text-xs text-stone-500">
              Approved refunds are credited directly to the original payment method (Bank Account, Credit/Debit Card, UPI, or Wallet) via Cashfree Payments in compliance with Reserve Bank of India (RBI) guidelines.
            </p>
          </div>
        </section>

        {/* Section 5 - Billing Support & Contact */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[var(--border)] shadow-xs">
          <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">5</span>
            Billing & Refund Support Desk
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
            For questions or requests regarding billing, payments, cancellations, or refunds:
          </p>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <a
              href={CONTACT_INFO.emailMailto}
              className="flex items-center gap-2.5 p-3.5 rounded-xl border border-[var(--border)] bg-[#FFFDFB] hover:bg-stone-50 transition font-medium text-[var(--foreground)]"
            >
              <IconMail className="h-4 w-4 text-[var(--primary)] shrink-0" />
              <span className="truncate">{CONTACT_INFO.email}</span>
            </a>
            <a
              href={CONTACT_INFO.phoneTel}
              className="flex items-center gap-2.5 p-3.5 rounded-xl border border-[var(--border)] bg-[#FFFDFB] hover:bg-stone-50 transition font-medium text-[var(--foreground)]"
            >
              <IconPhone className="h-4 w-4 text-[var(--primary)] shrink-0" />
              <span>{CONTACT_INFO.phoneDisplay}</span>
            </a>
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">
            Helpline Hours: {CONTACT_INFO.hours} • Expected response within 24–48 hours.
          </p>
        </section>
      </div>

      {/* Footer Links */}
      <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
        <p>© {new Date().getFullYear()} IshtamChat.com. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/terms" className="hover:underline">
            Terms & Conditions
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact Us
          </Link>
          <Link href="/pricing" className="hover:underline">
            Pricing (INR)
          </Link>
        </div>
      </div>
    </main>
  );
}

