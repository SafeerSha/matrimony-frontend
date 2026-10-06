import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import NextTopLoader from "nextjs-toploader";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Let’s CHAT .Com — Meaningful connections, thoughtfully made",
    template: "%s | Let’s CHAT .Com"
  },
  description: "A modern, privacy-first matrimony and relationship discovery experience.",
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="font-sans antialiased">
        <NextTopLoader color="var(--primary)" showSpinner={false} />
        {children}
        <Toaster />
      </body>
    </html>
  );
}