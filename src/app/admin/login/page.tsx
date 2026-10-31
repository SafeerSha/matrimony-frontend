'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  IconShieldCheck,
  IconLock,
  IconMail,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconArrowLeft,
  IconAlertCircle,
} from '@tabler/icons-react';
import { authService } from '@/services/auth.service';
import { toast } from '@/lib/toast';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated as ADMIN, redirect straight to the admin dashboard
  useEffect(() => {
    let isMounted = true;
    async function checkExistingAdmin() {
      const token = authService.getAccessToken();
      if (!token) return;

      try {
        const user = await authService.getCurrentUser();
        if (isMounted && user?.role?.toUpperCase() === 'ADMIN') {
          router.replace(nextUrl);
        }
      } catch {
        // Not authenticated or expired session; remain on login form
      }
    }

    checkExistingAdmin();
    return () => {
      isMounted = false;
    };
  }, [router, nextUrl]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authService.login({
        email: cleanEmail,
        password,
      });

      const userRole = res?.user?.role?.toUpperCase();
      if (userRole !== 'ADMIN') {
        authService.clearAccessToken();
        setErrorMessage(
          'Access Denied: This account does not have administrator privileges.'
        );
        toast.error('Access Denied', {
          description: 'Administrator privileges are required to access this portal.',
        });
        return;
      }

      toast.success('Admin Authenticated', {
        description: 'Welcome to the Admin Portal.',
      });

      router.replace(nextUrl);
    } catch (err: any) {
      const msg =
        err?.message ||
        'Authentication failed. Please verify your credentials and try again.';
      setErrorMessage(msg);
      toast.error('Sign In Failed', { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1D040C] text-white flex flex-col justify-between selection:bg-[#80132E] selection:text-white relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#80132E]/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#A22749]/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(128,19,46,0.15),rgba(0,0,0,0.8))]" />
      </div>

      {/* Top Navigation */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#80132E] to-[#A22749] border border-[#C23B60]/40 flex items-center justify-center shadow-lg shadow-[#80132E]/20">
            <IconShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white">
              Admin<span className="text-[#F29CA3]">Portal</span>
            </h1>
            <p className="text-[11px] text-white/50 tracking-wider uppercase font-semibold">
              Ishtam Chat
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10"
        >
          <IconArrowLeft className="h-3.5 w-3.5" />
          <span>Platform Home</span>
        </Link>
      </header>

      {/* Login Card */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-8">
        <div className="bg-[#2A0711]/90 backdrop-blur-xl border border-[#4A1024] rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/60">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4A1024] border border-[#6B1834] text-[11px] font-semibold text-[#F29CA3] mb-3">
              <IconLock className="h-3 w-3" />
              <span>Restricted Administrative Access</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Administrator Sign In
            </h2>
            <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
              Enter your administrator email and password to continue.
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <IconAlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <IconMail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="admin@example.com"
                  required
                  autoFocus
                  className="w-full bg-[#1D040C] border border-[#4A1024] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#F29CA3] focus:ring-1 focus:ring-[#F29CA3]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <IconLock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-[#1D040C] border border-[#4A1024] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#F29CA3] focus:ring-1 focus:ring-[#F29CA3]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <IconEyeOff className="h-4 w-4" />
                  ) : (
                    <IconEye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#80132E] to-[#A22749] hover:from-[#921837] hover:to-[#B62D53] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#80132E]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In to Admin Portal</span>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 text-center text-xs text-white/40">
        &copy; {new Date().getFullYear()} Ishtam Chat Platform. Administrative Console.
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1D040C] flex items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-[#F29CA3]" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
