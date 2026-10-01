import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { HeroSection, BotanicalCornerDecorations } from "@/components/hero";

const features = [
  ["Thoughtful discovery", "Profiles are designed around compatibility, not endless swiping."],
  ["Privacy by design", "Your personal information stays behind clear privacy controls."],
  ["Real connections", "A calmer space for meaningful introductions and conversations."]
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--background)]">
      {/* Landing page top-corners botanical framing (framing header and hero corners seamlessly) */}
      <BotanicalCornerDecorations
        showTopLeft={true}
        showTopRight={true}
        showBottomLeft={false}
        showBottomRight={false}
        className="pointer-events-none absolute inset-x-0 top-0 h-[880px] z-[2]"
      />
      <header className="relative z-20 mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="focus-ring hidden sm:inline-flex rounded-xl px-3.5 py-2 text-sm font-semibold text-[var(--muted-strong)] hover:text-[var(--primary)] hover:bg-[var(--primary-lighter)] transition"
          >
            Contact
          </a>
          <Link
            href="/login"
            className="focus-ring rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--primary-lighter)] transition"
          >
            Sign in
          </Link>
        </div>
      </header>

      <HeroSection />

      <section id="how-it-works" className="border-y border-[var(--border)] bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-16 sm:px-6 md:grid-cols-3">
          {features.map(([title, description], index) => (
            <div key={title} className="rounded-2xl p-6 hover:bg-[var(--background)]">
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-[var(--primary-light)] font-bold text-[var(--primary)]">0{index + 1}</div>
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="border-b border-[var(--border)] bg-[var(--surface)] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface-muted)] via-[var(--background)] to-[var(--surface-muted)] p-8 sm:p-12 lg:p-16 shadow-[0_16px_40px_var(--card-shadow)]">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--primary-light)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--primary)]">
                We are here to help
              </span>
              <h2 className="mt-4 font-editorial-title text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
                Have questions? Speak to our team.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
                Whether you need assistance with verification, profile privacy, or membership details, our team is available 7 days a week.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                <a
                  href="mailto:care@matrimony.example.com"
                  className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--primary)] px-6 text-sm font-semibold text-white shadow-[0_10px_25px_var(--primary-shadow)] hover:bg-[var(--primary-deep)] transition"
                >
                  Email us
                </a>
                <a
                  href="tel:+918005550199"
                  className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-6 text-sm font-semibold text-[var(--secondary-foreground)] hover:bg-[var(--surface-muted)] transition"
                >
                  +91 (800) 555-0199
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>© 2026 Matrimony</span>
        <div className="flex gap-4"><Link href="/privacy" className="hover:text-[var(--primary)]">Privacy</Link><Link href="/terms" className="hover:text-[var(--primary)]">Terms</Link></div>
      </footer>
    </main>
  );
}