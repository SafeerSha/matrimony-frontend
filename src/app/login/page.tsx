import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/layout/logo";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <Logo />
        <div className="mt-8 rounded-3xl border border-[var(--border)] bg-white p-6 shadow-[0_20px_60px_var(--hero-shadow)] sm:p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">The authentication UI is ready for your backend identity flow.</p>
          </div>
          <form className="space-y-4" action="/api/auth/login" method="post">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Email</span>
              <input name="email" type="email" autoComplete="email" required maxLength={254} className="focus-ring h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 outline-none focus:border-[var(--primary)]" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Password</span>
              <input name="password" type="password" autoComplete="current-password" required minLength={8} maxLength={128} className="focus-ring h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 outline-none focus:border-[var(--primary)]" />
            </label>
            <button className="focus-ring h-12 w-full rounded-xl bg-[var(--primary)] font-semibold text-white hover:bg-[var(--primary-deep)]" type="submit">Continue</button>
          </form>
          <div className="mt-6 flex gap-3 rounded-2xl bg-[var(--primary-lighter)] p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden />
            <p className="text-xs leading-5 text-[var(--muted-strong)]">Authentication should issue a Secure, HttpOnly, SameSite session cookie. Never store access tokens in browser storage.</p>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-[var(--muted)]"><Link href="/" className="font-semibold text-[var(--primary)]">Back to home</Link></p>
      </div>
    </main>
  );
}