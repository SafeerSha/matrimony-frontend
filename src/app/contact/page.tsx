import Link from "next/link";
import {
  IconArrowLeft,
  IconPhone,
  IconMail,
  IconBrandWhatsapp,
  IconClock,
  IconShieldCheck,
  IconMapPin,
  IconHeadset,
} from "@tabler/icons-react";
import { CONTACT_INFO } from "@/config/contact";

export const metadata = {
  title: "Contact Us – IshtamChat",
  description: "Get in touch with the IshtamChat support, billing, and trust & safety team.",
};

export default function ContactPage() {
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
          Customer Support & Grievances
        </span>
        <h1 className="text-3xl sm:text-4xl font-editorial-title font-bold text-[var(--foreground)] mt-3">
          Contact Us
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-2xl">
          Whether you need assistance with membership subscriptions, profile verification, payment inquiries, or platform safety, our customer care team is here to help.
        </p>
      </div>

      {/* Main Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {/* WhatsApp Channel */}
        <div className="p-6 rounded-3xl bg-white border border-[var(--border)] shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <IconBrandWhatsapp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--foreground)]">WhatsApp Support</h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                Instant messaging support for quick questions and guidance.
              </p>
            </div>
          </div>
          <div className="pt-6">
            <a
              href={CONTACT_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* Phone Helpline */}
        <div className="p-6 rounded-3xl bg-white border border-[var(--border)] shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 text-[#801835] border border-rose-200 flex items-center justify-center">
              <IconPhone className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--foreground)]">Phone Helpline</h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                Speak directly with our customer care representatives.
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
            <a
              href={CONTACT_INFO.phoneTel}
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl font-bold text-xs border border-[var(--primary)] text-[var(--primary)] hover:bg-rose-50 transition"
            >
              Call Helpline
            </a>
          </div>
        </div>

        {/* Email Support */}
        <div className="p-6 rounded-3xl bg-white border border-[var(--border)] shadow-xs flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-[#8A4518] border border-amber-200 flex items-center justify-center">
              <IconMail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--foreground)]">Email Support</h3>
              <p className="text-xs text-[var(--muted)] mt-1">
                For official inquiries, billing, and document verification.
              </p>
              <p className="text-xs font-semibold text-[var(--foreground)] mt-2 truncate">
                {CONTACT_INFO.email}
              </p>
              <p className="text-[11px] text-[var(--muted)] mt-1">
                Average reply time: 24–48 hours
              </p>
            </div>
          </div>
          <div className="pt-6">
            <a
              href={CONTACT_INFO.emailMailto}
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[var(--primary)] hover:bg-[var(--primary-deep)] text-white transition"
            >
              Write Email
            </a>
          </div>
        </div>
      </div>

      {/* Operational Details & Grievance Desk */}
      <div className="space-y-6">
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[var(--border)] shadow-xs">
          <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <IconShieldCheck className="h-5 w-5 text-emerald-600" />
            Operational & Registered Office Information
          </h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-[var(--muted)]">
            <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-xs uppercase tracking-wider">
                <IconMapPin className="h-4 w-4 text-[var(--primary)]" /> Operating Jurisdiction
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                <strong>Platform:</strong> IshtamChat.com<br />
                <strong>Location:</strong> Kerala, India<br />
                <strong>Service Domain:</strong> Online Matrimonial & Relationship Networking Platform
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-900 text-xs uppercase tracking-wider">
                <IconHeadset className="h-4 w-4 text-[var(--primary)]" /> Grievance & Trust Officer
              </div>
              <p className="text-xs text-stone-700 leading-relaxed">
                In compliance with the Information Technology Act, 2000 and Rules made thereunder:<br />
                <strong>Designation:</strong> Grievance Officer<br />
                <strong>Email:</strong> <a href={CONTACT_INFO.emailMailto} className="underline text-[var(--primary)]">{CONTACT_INFO.email}</a><br />
                <strong>Response Time:</strong> Redressal within 36 to 48 hours
              </p>
            </div>
          </div>
        </section>

        <section className="p-6 sm:p-8 rounded-3xl bg-[#FAF6F2] border border-[#EEDCC8] shadow-xs">
          <h3 className="font-bold text-stone-900 text-base">Frequently Contacted For:</h3>
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-stone-700">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
              Chat Permit subscription activation & billing issues
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
              Refund and transaction reconciliation
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
              ID verification and profile badge confirmation
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
              Report abusive or fraudulent member profiles
            </li>
          </ul>
        </section>
      </div>

      {/* Footer Links */}
      <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--muted)]">
        <p>© {new Date().getFullYear()} IshtamChat.com. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/terms" className="hover:underline">
            Terms & Conditions
          </Link>
          <Link href="/refund-policy" className="hover:underline">
            Refunds & Cancellations
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/pricing" className="hover:underline">
            Pricing (INR)
          </Link>
        </div>
      </div>
    </main>
  );
}

