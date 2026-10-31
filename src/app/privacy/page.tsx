import Link from "next/link";
import { IconMail, IconPhone } from "@tabler/icons-react";
import { CONTACT_INFO } from "@/config/contact";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">Privacy Policy</h1>
      <p className="mt-4 leading-7 text-[var(--muted)]">
        At IshtamChat, your privacy and trust are our highest priorities. All profile details, uploaded verification IDs, and private communications are protected by robust safeguards and confidential data access policies.
      </p>

      <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[#FFFDFB] p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg font-bold text-[var(--foreground)]">Privacy & Support Inquiries</h2>
        <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
          For any questions concerning your personal data, privacy settings, profile deletion, or account security, please reach out directly to our customer care desk:
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold">
          <a
            href={CONTACT_INFO.emailMailto}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 border border-[var(--border)] text-[#7A1835] hover:bg-[#FAF3EC] transition"
          >
            <IconMail className="h-4 w-4" /> {CONTACT_INFO.email}
          </a>
          <a
            href={CONTACT_INFO.phoneTel}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 border border-[var(--border)] text-[#7A1835] hover:bg-[#FAF3EC] transition"
          >
            <IconPhone className="h-4 w-4" /> {CONTACT_INFO.phoneDisplay}
          </a>
        </div>
        <p className="mt-4 text-xs text-[var(--muted)]">Customer Care Hours: {CONTACT_INFO.hours}</p>
      </div>

      <div className="mt-10 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)]">
        <Link href="/" className="text-[var(--primary)] hover:underline font-semibold">
          ← Back to IshtamChat
        </Link>
      </div>
    </main>
  );
}
