import Link from "next/link";
import { IconMail, IconPhone, IconShieldCheck, IconAlertTriangle, IconCreditCard, IconArrowLeft } from "@tabler/icons-react";
import { CONTACT_INFO } from "@/config/contact";

export default function TermsPage() {
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
          Legal Agreement
        </span>
        <h1 className="text-3xl sm:text-4xl font-editorial-title font-bold text-[var(--foreground)] mt-3">
          Terms & Conditions
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-2xl">
          IshtamChat is a platform for people to connect with others for marriage, friendship, companionship, and living together relationships.
        </p>
        <p className="mt-2 text-xs sm:text-sm text-[var(--muted)]">
          By registering or using <strong className="text-[var(--foreground)]">IshtamChat.com</strong>, you agree to these Terms & Conditions.
        </p>
      </div>

      {/* Terms Sections */}
      <div className="space-y-8">
        {/* Section 1 */}
        <section className="p-6 rounded-2xl bg-white border border-[var(--border)] shadow-xs">
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">1</span>
            User Registration
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
            Users must provide genuine and accurate information while creating their profiles. Please ensure that your personal details and profile photos are appropriate and truthful.
          </p>
        </section>

        {/* Section 2 */}
        <section className="p-6 rounded-2xl bg-white border border-[var(--border)] shadow-xs">
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">2</span>
            Age Requirement
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
            Users must be <strong>18 years or older</strong> to register and use IshtamChat.com.
          </p>
        </section>

        {/* Section 3 */}
        <section className="p-6 rounded-2xl bg-white border border-[var(--border)] shadow-xs">
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">3</span>
            Profile Information
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
            Users are responsible for the personal information, profile photos, and other details they upload. Do not upload fake profiles, misleading information, or photos belonging to other people without permission.
          </p>
        </section>

        {/* Section 4 */}
        <section className="p-6 rounded-2xl bg-white border border-[var(--border)] shadow-xs">
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">4</span>
            Respect Other Users
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
            Users must treat everyone with respect. Harassment, abusive language, threats, fraud, and inappropriate behavior are strictly prohibited.
          </p>
        </section>

        {/* Section 5 */}
        <section className="p-6 rounded-2xl bg-white border border-[var(--border)] shadow-xs">
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">5</span>
            Personal Safety
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
            Please be careful when sharing personal information with other users. Do not share financial details, passwords, or sensitive information with strangers. Always use your own judgment before meeting anyone personally.
          </p>
        </section>

        {/* Section 6 - Callout */}
        <section className="p-6 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-xs">
          <h2 className="text-lg font-bold text-amber-950 flex items-center gap-2">
            <IconAlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>6. Marriage and Relationship Disclaimer</span>
          </h2>
          <p className="mt-2 text-sm text-amber-900 leading-relaxed font-medium">
            It is the duty of each member to ensure the character and genuinity of the match they are meeting with. And &lsquo;IshtamChat&rsquo; has no responsibility in this.
          </p>
        </section>

        {/* Section 7 */}
        <section className="p-6 rounded-2xl bg-white border border-[var(--border)] shadow-xs">
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">7</span>
            Account Suspension
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
            We reserve the right to remove fake profiles, inappropriate photos, misleading information, or accounts that violate these terms.
          </p>
        </section>

        {/* Section 8 */}
        <section className="p-6 rounded-2xl bg-white border border-[var(--border)] shadow-xs">
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">8</span>
            Privacy
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
            We respect user privacy. Personal information and profile details are handled according to our Privacy Policy. Users should understand that information shared publicly on their profiles may be visible to other users.
          </p>
        </section>

        {/* Section 9 */}
        <section className="p-6 rounded-2xl bg-white border border-[var(--border)] shadow-xs">
          <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">9</span>
            Changes to Terms
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
            IshtamChat.com may update these Terms & Conditions whenever necessary. Users are encouraged to review this page periodically every year.
          </p>
        </section>

        {/* Payment Terms and Conditions */}
        <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#FFFDFB] to-white border-2 border-[var(--primary)]/20 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="p-2 rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
              <IconCreditCard className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-[var(--foreground)]">Payment Terms & Conditions</h2>
          </div>
          <p className="text-xs text-[var(--muted)] mb-5">
            Applicable to all Chat Permit subscriptions and membership upgrades purchased on IshtamChat.com:
          </p>
          <ul className="space-y-3 text-sm text-[var(--foreground)]">
            <li className="flex items-start gap-2.5">
              <IconShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>1. Validity:</strong> Chat Permit is valid for the selected subscription period from activation.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <IconShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>2. Plan Quotas:</strong> Premium features, interest limits, and contact access depend on the selected plan.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <IconShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>3. Match Requirement:</strong> Unlimited messaging is available only with mutual matches.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <IconShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>4. Non-Refundable:</strong> All Chat Permits are non-transferable and non-refundable after activation, except as required by law.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <IconShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>5. Agreement:</strong> By proceeding with payment, you agree to our Terms & Conditions and Privacy Policy.</span>
            </li>
          </ul>
        </section>

        {/* Section 10 - Contact Us */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[var(--border)] shadow-xs">
          <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold">10</span>
            Contact Us
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
            For questions, complaints, or support, please contact:
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <a
              href="https://ishtamchat.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 p-3.5 rounded-xl border border-[var(--border)] bg-[#FFFDFB] hover:bg-stone-50 transition font-medium text-[var(--foreground)]"
            >
              <span className="text-xs font-bold text-[var(--primary)] uppercase">Website:</span>
              <span className="text-[var(--primary)] hover:underline truncate">https://ishtamchat.com</span>
            </a>
            <a
              href={CONTACT_INFO.emailMailto}
              className="flex items-center gap-2.5 p-3.5 rounded-xl border border-[var(--border)] bg-[#FFFDFB] hover:bg-stone-50 transition font-medium text-[var(--foreground)]"
            >
              <IconMail className="h-4 w-4 text-[var(--primary)] shrink-0" />
              <span className="truncate">{CONTACT_INFO.email}</span>
            </a>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)]">
            <IconPhone className="h-3.5 w-3.5 text-stone-400" />
            <span>Customer Care: {CONTACT_INFO.phoneDisplay} ({CONTACT_INFO.hours})</span>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
        <p>© {new Date().getFullYear()} IshtamChat.com. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/refund-policy" className="hover:underline">
            Refunds & Cancellations
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact Us
          </Link>
          <Link href="/pricing" className="hover:underline">
            Pricing (INR)
          </Link>
          <Link href="/" className="font-semibold text-[var(--primary)] hover:underline">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
