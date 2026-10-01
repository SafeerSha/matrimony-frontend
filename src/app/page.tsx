import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { HeroSection } from "@/components/hero";

const features = [
  ["Thoughtful discovery", "Profiles are designed around compatibility, not endless swiping."],
  ["Privacy by design", "Your personal information stays behind clear privacy controls."],
  ["Real connections", "A calmer space for meaningful introductions and conversations."]
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)]">
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />
        <div className="flex items-center gap-3">
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

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>© 2026 LetsChat</span>
        <div className="flex gap-4"><Link href="/privacy" className="hover:text-[var(--primary)]">Privacy</Link><Link href="/terms" className="hover:text-[var(--primary)]">Terms</Link></div>
      </footer>
    </main>
  );
}