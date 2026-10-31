import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { HeroSection, BotanicalCornerDecorations, HeroCommunityPill } from "@/components/hero";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { CONTACT_INFO } from "@/config/contact";
import {
  IconMail,
  IconPhone,
  IconBrandWhatsapp,
  IconShieldCheck,
  IconHeartHandshake,
  IconCompass,
  IconHeadset,
  IconArrowRight,
  IconSparkles,
  IconClock,
} from "@tabler/icons-react";

const featureCards = [
  {
    number: "01",
    title: "Thoughtful Discovery",
    tagline: "Compatibility-First Matching",
    description:
      "Profiles are designed around compatibility, lifestyle choices, and shared life values—not endless superficial swiping.",
    icon: <IconCompass className="h-6 w-6 text-[#F3E1C8]" />,
    gradient: "from-[#9E1D3B] via-[#801835] to-[#5E0E24]",
    tagBg: "bg-[#FDF2F4] text-[#801835] border-[#F5D5DB]",
  },
  {
    number: "02",
    title: "Privacy by Design",
    tagline: "Member-Controlled Privacy",
    description:
      "Your phone number, photos, and personal information stay protected behind clear, granular privacy controls that you decide.",
    icon: <IconShieldCheck className="h-6 w-6 text-emerald-100" />,
    gradient: "from-emerald-600 via-teal-700 to-emerald-900",
    tagBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  {
    number: "03",
    title: "Real Connections",
    tagline: "Marriage, Living-in & Friendship",
    description:
      "Whether seeking lifelong marriage, living-together, or genuine friendship—connect in a calm, respectful space tailored to your exact relationship goals.",
    icon: <IconHeartHandshake className="h-6 w-6 text-[#FDF0DE]" />,
    gradient: "from-[#A85B24] via-[#8A4518] to-[#68300E]",
    tagBg: "bg-[#FAF3EC] text-[#8C5D30] border-[#EAD7C5]",
  },
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

      {/* Redesigned "Why IshtamChat / How It Works" Section */}
      <section id="how-it-works" className="relative border-y border-[#EEDCC8]/80 bg-gradient-to-b from-[#FFFDFB] via-[#FCF8F5] to-white py-16 sm:py-24 overflow-hidden">
        {/* Subtle Ambient Decorative Glows */}
        <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(216,178,140,0.12)_0%,transparent_70%)] blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(158,29,59,0.06)_0%,transparent_70%)] blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF3EC] text-[#8C5D30] text-xs font-bold uppercase tracking-wider border border-[#EAD7C5] shadow-2xs">
              ✦ The IshtamChat Difference
            </span>
            <h2 className="mt-4 font-editorial-title text-2xl sm:text-4xl lg:text-[2.6rem] font-bold text-[#211B1E] tracking-tight leading-tight">
              Designed for Dignity, Privacy & Meaningful Bonds
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#766B6F] leading-relaxed font-normal">
              A respectful, modern relationship space crafted around authentic life values, personal goals, and deep compatibility.
            </p>
          </div>

          {/* 3 Luxury Feature Cards */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            {featureCards.map((feat, idx) => (
              <ScrollReveal
                key={feat.title}
                staggerClass={`stagger-${idx + 1}`}
                className="group relative flex flex-col justify-between rounded-3xl bg-gradient-to-b from-white via-[#FCF9F6] to-[#FAF5F0] p-7 sm:p-8 border border-[#EEDCC8]/90 shadow-[0_8px_30px_rgba(40,20,25,0.04)] hover:shadow-[0_16px_40px_rgba(94,14,36,0.1)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
              >
                {/* Top Subtle Shimmer Highlight on Hover */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#D8B28C]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div>
                  {/* Top Bar: Icon Medallion & Number Pill */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`h-13 w-13 rounded-2xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center shadow-md shadow-rose-950/20 border border-white/30 group-hover:scale-105 transition-transform duration-300`}>
                      {feat.icon}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white text-[#801835] text-xs font-extrabold border border-[#EEDCC8] shadow-2xs tracking-wide">
                      {feat.number}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-editorial-title text-xl sm:text-2xl font-bold text-[#211B1E] tracking-tight group-hover:text-[#801835] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#766B6F]">
                    {feat.description}
                  </p>
                </div>

                {/* Bottom Highlight Tag */}
                <div className="mt-6 pt-5 border-t border-[#EEDCC8]/60">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl border shadow-2xs ${feat.tagBg}`}>
                    {feat.tagline}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Redesigned "Contact Us / Concierge Assistance" Section */}
      <section id="contact" className="relative border-b border-[#EEDCC8]/80 bg-[#FAF6F2] py-16 sm:py-24 overflow-hidden">
        {/* Ambient Warm Gradient Orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(216,178,140,0.18)_0%,transparent_70%)] blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="relative rounded-[2.25rem] bg-gradient-to-b from-[#FFFDFB] via-[#FCF8F5] to-[#FDF4F6] border border-[#EEDCC8] shadow-[0_20px_50px_rgba(94,14,36,0.08)] p-6 sm:p-10 lg:p-12 overflow-hidden">
            {/* Top Champagne Gold Luxury Shimmer Strip */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#D8B28C]/70 to-transparent" />

            <div className="mx-auto max-w-2xl text-center">
              {/* Concierge Emblem */}
              <div className="relative mx-auto mb-3 flex items-center justify-center">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#9E1D3B] via-[#801835] to-[#5E0E24] text-white flex items-center justify-center shadow-md shadow-rose-950/25 border border-white/30">
                  <IconHeadset className="h-6 w-6 text-[#F3E1C8]" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#FFF9F6] border border-[#EEDCC8] shadow-xs flex items-center justify-center">
                  <IconSparkles className="h-3 w-3 text-[#D8B28C]" />
                </div>
              </div>

              {/* Tag */}
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FAF3EC] text-[#8C5D30] text-xs font-bold uppercase tracking-wider border border-[#EAD7C5] shadow-2xs">
                Concierge Assistance • We Are Here To Help
              </span>

              {/* Title */}
              <h2 className="mt-4 font-editorial-title text-2xl sm:text-4xl lg:text-[2.5rem] font-bold text-[#211B1E] tracking-tight leading-tight">
                Have Questions? Speak to Our Dedicated Team
              </h2>

              {/* Subtitle */}
              <p className="mt-3 text-sm sm:text-base text-[#766B6F] leading-relaxed font-normal">
                Whether you need assistance with verification, profile privacy, or membership details, our customer care team is available to assist you.
              </p>
            </div>

            {/* 3 Clickable Concierge Channel Cards */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {/* WhatsApp Support Tile */}
              <a
                href={CONTACT_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group focus-ring p-5 rounded-2xl bg-white/95 border border-[#EEDCC8]/90 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <IconBrandWhatsapp className="h-5 w-5" />
                    </div>
                    <span className="text-[10.5px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Instant Reply
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#211B1E] group-hover:text-emerald-700 transition-colors">
                    Chat on WhatsApp
                  </h4>
                  <p className="text-xs text-[#766B6F] mt-1 leading-snug">
                    Quickest support & personal connection guidance
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#EEDCC8]/40 flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                  <span>Chat Now</span>
                  <IconArrowRight className="h-3.5 w-3.5" />
                </div>
              </a>

              {/* Direct Phone Helpline Tile */}
              <a
                href={CONTACT_INFO.phoneTel}
                className="group focus-ring p-5 rounded-2xl bg-white/95 border border-[#EEDCC8]/90 hover:border-[#801835] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-rose-50 text-[#801835] border border-rose-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <IconPhone className="h-5 w-5" />
                    </div>
                    <span className="text-[10.5px] font-bold text-[#801835] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Helpline
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#211B1E] group-hover:text-[#801835] transition-colors">
                    {CONTACT_INFO.phoneDisplay}
                  </h4>
                  <p className="text-xs text-[#766B6F] mt-1 leading-snug">
                    {CONTACT_INFO.hours}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#EEDCC8]/40 flex items-center gap-1 text-xs font-bold text-[#801835] group-hover:translate-x-0.5 transition-transform">
                  <span>Call Us</span>
                  <IconArrowRight className="h-3.5 w-3.5" />
                </div>
              </a>

              {/* Direct Email Care Tile */}
              <a
                href={CONTACT_INFO.emailMailto}
                className="group focus-ring p-5 rounded-2xl bg-white/95 border border-[#EEDCC8]/90 hover:border-[#A85B24] shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-50 text-[#8A4518] border border-amber-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <IconMail className="h-5 w-5" />
                    </div>
                    <span className="text-[10.5px] font-bold text-[#8A4518] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Email
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#211B1E] group-hover:text-[#8A4518] transition-colors truncate">
                    {CONTACT_INFO.email}
                  </h4>
                  <p className="text-xs text-[#766B6F] mt-1 leading-snug">
                    Dedicated member assistance inbox
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#EEDCC8]/40 flex items-center gap-1 text-xs font-bold text-[#8A4518] group-hover:translate-x-0.5 transition-transform">
                  <span>Write to Us</span>
                  <IconArrowRight className="h-3.5 w-3.5" />
                </div>
              </a>
            </div>

            {/* Reassurance Bar */}
            <div className="mt-8 pt-6 border-t border-[#EEDCC8]/70 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#766B6F]">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <IconShieldCheck className="h-4 w-4 text-emerald-600" />
                100% Confidential Support
              </span>
              <span className="hidden sm:inline text-stone-300">•</span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <IconSparkles className="h-4 w-4 text-[#8C5D30]" />
                {CONTACT_INFO.supportAvailability}
              </span>
              <span className="hidden sm:inline text-stone-300">•</span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <IconClock className="h-4 w-4 text-[#801835]" />
                Fast turnaround
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Simple Clean Footer */}
      <footer className="border-t border-[#EEDCC8]/70 bg-[#FAF6F2] py-8 text-xs text-[#766B6F]">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-bold text-[#211B1E] tracking-tight">IshtamChat</span>
            <span className="text-[#8C5D30] font-semibold text-[11px]">Relationships</span>
            <span className="text-stone-300">•</span>
            <span>© 2026 All rights reserved.</span>
          </div>

          <div className="flex items-center gap-5 text-xs font-medium">
            <Link href="/privacy" className="hover:text-[#801835] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-stone-300">•</span>
            <Link href="/terms" className="hover:text-[#801835] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
