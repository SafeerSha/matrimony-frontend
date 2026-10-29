import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { HeroSection, BotanicalCornerDecorations, HeroCommunityPill } from "@/components/hero";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const features = [
  ["Thoughtful discovery", "Profiles are designed around compatibility, not endless swiping."],
  ["Privacy by design", "Your personal information stays behind clear privacy controls."],
  ["Real connections", "A calmer space for meaningful introductions and conversations."]
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-[var(--background)]">
      {/* Landing page top-corners botanical framing (hidden on mobile for seamless hero background) */}
      <BotanicalCornerDecorations
        showTopLeft={true}
        showTopRight={true}
        showBottomLeft={false}
        showBottomRight={false}
        className="pointer-events-none absolute inset-x-0 top-0 h-[880px] z-[2] hidden sm:block"
      />
      <header className="absolute top-0 inset-x-0 w-full z-30 mx-auto flex h-16 sm:h-20 max-w-[1600px] items-start pt-3 sm:pt-4 lg:pt-0 lg:items-center justify-between px-3 sm:px-6 lg:px-8 xl:px-10 bg-transparent lg:relative">
        <Logo lightOnMobile={true} blurredBg={true} />
        <div className="flex items-start lg:items-center gap-2 sm:gap-3 shrink-0">
          {/* Communities Pill Cards: Kerala, Telugu, Bharat Matrimony on mobile */}
          <HeroCommunityPill className="flex lg:hidden" />

          <a
            href="#contact"
            className="focus-ring hidden sm:inline-flex rounded-xl bg-white/70 backdrop-blur-md border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)] hover:bg-white/95 shadow-sm transition"
          >
            Contact
          </a>
          <Link
            href="/login"
            className="focus-ring hidden lg:inline-flex rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-deep)] text-white border border-white/25 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold shadow-[0_4px_14px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-200"
          >
            Sign in
          </Link>
        </div>
      </header>

      <HeroSection />

      {/* <QuickRegisterSection /> */}

      <section id="how-it-works" className="border-y border-[var(--border)] bg-white">
        <div className="mx-auto grid max-w-[1600px] gap-4 px-4 py-12 sm:px-6 xl:px-10 md:grid-cols-3">
          {features.map(([title, description], index) => (
            <ScrollReveal
              key={title}
              staggerClass={`stagger-${index + 1}`}
              className="rounded-2xl p-6 hover:bg-[var(--background)]"
            >
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-[var(--primary-light)] font-bold text-[var(--primary)]">0{index + 1}</div>
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="border-b border-[var(--border)] bg-[var(--surface)] py-12 sm:py-16">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-10">
          <ScrollReveal className="rounded-3xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface-muted)] via-[var(--background)] to-[var(--surface-muted)] p-6 sm:p-10 lg:p-12 shadow-[0_16px_40px_var(--card-shadow)]">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--primary-light)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--primary)]">
                We are here to help
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl leading-[1.2]">
                Have questions? Speak to our team.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted)] font-normal">
                Whether you need assistance with verification, profile privacy, or membership details, our team is available 7 days a week.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                <a
                  href="mailto:care@ishtamchat.com"
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
          </ScrollReveal>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-8 text-sm text-[var(--muted)] sm:px-6 xl:px-10">
        <span>© 2026 IshtamChat</span>
        <div className="flex gap-4"><Link href="/privacy" className="hover:text-[var(--primary)]">Privacy</Link><Link href="/terms" className="hover:text-[var(--primary)]">Terms</Link></div>
      </footer>
    </main>
  );
}