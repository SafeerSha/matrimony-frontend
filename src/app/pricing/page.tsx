import Link from "next/link";
import {
  IconArrowLeft,
  IconShieldCheck,
  IconCreditCard,
} from "@tabler/icons-react";
import { LandingPricingPlans } from "@/components/subscription/landing-pricing-plans";

export const metadata = {
  title: "Membership Plans & Pricing (INR) – IshtamChat",
  description: "Official Chat Permit subscription plans and pricing in Indian Rupees (INR) for IshtamChat.com.",
};

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 sm:px-6 py-12 sm:py-16">
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
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <p className="mt-3 text-sm sm:text-base text-[var(--muted)] leading-relaxed">
          Unlock unlimited direct messaging with mutual matches, view verified contact numbers, and expand your daily discovery.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
          <IconShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Secure Checkout (UPI, Cards, Net Banking)</span>
        </div>
      </div>

      {/* Plans Grid (Live from Admin API with Instant Fallback) */}
      <LandingPricingPlans ctaText="Sign in to Subscribe" />

      {/* Pricing Notes & Currency Clarification */}
      <div className="mt-12 p-6 rounded-3xl bg-[#FAF6F2] border border-[#EEDCC8] space-y-3">
        <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
          <IconCreditCard className="h-4 w-4 text-[var(--primary)]" />
          Pricing Details & Currency Declaration
        </h4>
        <ul className="list-disc list-inside text-xs text-stone-600 space-y-1.5 leading-relaxed">
          <li>
            <strong>Currency:</strong> All products, membership services, and Chat Permits listed on IshtamChat.com are priced exclusively in <strong>Indian National Rupees (INR)</strong>.
          </li>
          <li>
            <strong>Taxes:</strong> All listed prices are inclusive of applicable Goods and Services Tax (GST).
          </li>
          <li>
            <strong>Payment Modes:</strong> We support UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, MasterCard, RuPay), and Net Banking across major Indian banks through Cashfree Payments.
          </li>
          <li>
            <strong>Service Activation:</strong> Chat Permits activate immediately upon confirmation from the payment gateway.
          </li>
          <li>
            <strong>Refunds:</strong> Subject to our{" "}
            <Link href="/refund-policy" className="underline font-semibold text-[var(--primary)]">
              Refunds & Cancellations Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="underline font-semibold text-[var(--primary)]">
              Terms & Conditions
            </Link>
            .
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
        <p>© {new Date().getFullYear()} IshtamChat.com. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/terms" className="hover:underline">
            Terms & Conditions
          </Link>
          <Link href="/refund-policy" className="hover:underline">
            Refunds & Cancellations
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact Us
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}

