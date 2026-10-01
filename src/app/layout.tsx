import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "LetsChat — Meaningful connections, thoughtfully made",
    template: "%s | LetsChat"
  },
  description: "A modern, privacy-first LetsChat experience.",
  robots: { index: false, follow: false }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}