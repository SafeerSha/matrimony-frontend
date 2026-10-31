import Link from "next/link";
import { IconMail, IconPhone } from "@tabler/icons-react";
import { CONTACT_INFO } from "@/config/contact";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <h1 className="text-3xl font-bold text-[var(--foreground)]">Terms & Conditions</h1>
      <p className="mt-4 leading-7 text-[var(--muted)]">
        Welcome to IshtamChat. By accessing our platform, members agree to authentic representations, respectful interactions, and community safety guidelines across Friendship, Marriage, and Living Together relationships.
      </p>

      <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[#FFFDFB] p-6 sm:p-8 shadow-xs">
        <h2 className="text-lg font-bold text-[var(--foreground)]">Customer Care & Support</h2>
        <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
          If you have questions regarding membership terms, verification rules, billing policies, or community safety, our dedicated support team is here to assist you:
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
