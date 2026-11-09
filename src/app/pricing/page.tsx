import Link from "next/link";
import {
  IconArrowLeft,
  IconCheck,
  IconCrown,
  IconShieldCheck,
  IconStar,
  IconLock,
  IconCreditCard,
  IconHeart,
} from "@tabler/icons-react";
import { CONTACT_INFO } from "@/config/contact";

export const metadata = {
  title: "Membership Plans & Pricing (INR) – IshtamChat",
  description: "Official Chat Permit subscription plans and pricing in Indian Rupees (INR) for IshtamChat.com.",
};

const plans = [
  {
    id: "BASIC",
    name: "1 Month Chat Permit",
    badge: "Basic",
    priceInr: "₹500",
    currency: "INR",
    period: "30 Days Validity",
    description: "Active Premium for 30 days with verified contacts and daily interest quota.",
    popular: false,
    features: [
      "Active Premium for 30 days",
      "Send up to 20 Interests per day",
      "Unlimited messaging with mutual matches",
      "Standard Profile Visibility in search",
      "20 Verified Contact Numbers unlocked",
    ],
  },
  {
    id: "STANDARD",
    name: "3 Months Chat Permit",
    badge: "Standard",
    priceInr: "₹1,250",
    currency: "INR",
    period: "90 Days Validity",
    description: "Our most popular plan. Active matchmaking with verified connections.",
    popular: true,
    features: [
      "Active Premium for 90 days",
      "Send up to 40 Interests per day",
      "Unlimited messaging with mutual matches",
      "Priority Profile Visibility in search",
      "60 Verified Contact Numbers unlocked",
    ],
  },
  {
    id: "PLUS",
    name: "6 Months Permit",
    badge: "Plus",
    priceInr: "₹2,500",
    currency: "INR",
    period: "180 Days Validity",
    description: "Extended connection time with higher contact quota and high visibility.",
    popular: false,
    features: [
      "Active Premium for 180 days",
      "Send Unlimited Interests",
      "Unlimited messaging with mutual matches",
      "High Profile Visibility & recommendation boost",
      "120 Verified Contact Numbers unlocked",
    ],
  },
  {
    id: "ELITE",
    name: "One Year Chat Permit",
    badge: "Elite",
    priceInr: "₹5,000",
    currency: "INR",
    period: "365 Days Validity",
    description: "Complete peace of mind with 1 full year of unlimited matchmaking access.",
    popular: false,
    features: [
      "Active Premium for 365 days (1 Year)",
      "Send Unlimited Interests",
      "Unlimited messaging with mutual matches",
      "Maximum VIP Profile Visibility",
      "Unlimited Verified Contact Numbers",
    ],
  },
];

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
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] bg-[var(--primary-light)] px-3 py-1 rounded-full">
          Transparent Pricing (INR)
        </span>
        <h1 className="text-3xl sm:text-5xl font-editorial-title font-bold text-[var(--foreground)] mt-4">
          Chat Permit Membership Plans
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[var(--muted)] leading-relaxed">
          Unlock unlimited direct messaging with mutual matches, view verified contact numbers, and expand your daily discovery. All plans are billed in Indian National Rupees (INR).
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200">
          <IconShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Official Payment Gateway: Cashfree Payments (UPI, Cards, Net Banking)</span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between border transition-all duration-200 ${
              plan.popular
                ? "bg-[#FFFDFB] border-[var(--primary)] shadow-lg shadow-rose-950/5 ring-2 ring-[var(--primary)]/20"
                : "bg-white border-[var(--border)] shadow-xs hover:shadow-md"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--primary)] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                <IconStar className="h-3 w-3 fill-white" /> Most Popular
              </span>
            )}

            <div>
              {/* Badge & Plan Name */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  {plan.badge}
                </span>
                {plan.popular ? (
                  <IconCrown className="h-5 w-5 text-[var(--primary)]" />
                ) : (
                  <IconHeart className="h-5 w-5 text-stone-400" />
                )}
              </div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">{plan.name}</h3>
              <p className="text-xs text-[var(--muted)] mt-1 min-h-[32px]">{plan.description}</p>

              {/* Price */}
              <div className="my-5 pb-5 border-b border-[var(--border)]">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] tracking-tight">
                    {plan.priceInr}
                  </span>
                  <span className="text-xs font-bold text-stone-500 uppercase">{plan.currency}</span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-1 font-medium">{plan.period}</p>
              </div>

              {/* Features List */}
              <ul className="space-y-2.5 text-xs text-stone-700">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2">
                    <IconCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Subscribe Action Button */}
            <div className="mt-8 pt-4 border-t border-[var(--border)]">
              <Link
                href="/login"
                className={`inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl font-bold text-xs transition ${
                  plan.popular
                    ? "bg-[var(--primary)] hover:bg-[var(--primary-deep)] text-white shadow-sm"
                    : "bg-stone-900 hover:bg-black text-white"
                }`}
              >
                Sign in to Subscribe
              </Link>
            </div>
          </div>
        ))}
      </div>

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

