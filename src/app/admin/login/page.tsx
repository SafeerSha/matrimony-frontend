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
  IconKey,
} from '@tabler/icons-react';
import { authService } from '@/services/auth.service';
import { toast } from '@/lib/toast';
import { ModernOtpInput } from '@/components/ui/modern-otp-input';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/admin';

  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // OTP flow state
  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Check if user is already logged in as ADMIN
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
        // Not authenticated or expired; stay on login page
      }
    }

    checkExistingAdmin();
    return () => {
      isMounted = false;
    };
  }, [router, nextUrl]);

  // Resend OTP countdown effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Password Login Handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your administrator password.');
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
          'Access Denied: This account does not have administrator privileges. Please sign in with an authorized admin account.'
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

  // OTP Request Handler
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMessage('Please enter a valid administrator email address.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await authService.sendOtp({ email: cleanEmail, purpose: 'login' });
      setOtpStep('code');
      setResendTimer(60);
      toast.info('Verification Code Dispatched', {
        description: `We've sent a 6-digit admin verification code to ${cleanEmail}`,
      });
    } catch (err: any) {
      const msg = err?.message || 'Failed to dispatch verification code. Please try again.';
      setErrorMessage(msg);
      toast.error('Dispatch Failed', { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Verification Handler
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpCode).trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!code || code.length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authService.verifyOtp({
        email: cleanEmail,
        otp: code,
      });

      const userRole = res?.user?.role?.toUpperCase();
      if (userRole !== 'ADMIN') {
        authService.clearAccessToken();
        setErrorMessage(
          'Access Denied: This account does not have administrator privileges.'
        );
        toast.error('Access Denied', {
          description: 'Administrator privileges are required.',
        });
        return;
      }

      toast.success('Admin Authenticated', {
        description: 'Welcome to the Admin Portal.',
      });

      router.replace(nextUrl);
    } catch (err: any) {
      const msg = err?.message || 'Invalid or expired verification code.';
      setErrorMessage(msg);
      toast.error('Verification Failed', { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1D040C] text-white flex flex-col justify-between selection:bg-[#80132E] selection:text-white relative overflow-hidden">
      {/* Background Decorative Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#80132E]/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#A22749]/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(128,19,46,0.15),rgba(0,0,0,0.8))]" />
      </div>

      {/* Top Header Bar */}
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
              Ishtam Chat Platform
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

      {/* Center Main Card */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-8">
        <div className="bg-[#2A0711]/90 backdrop-blur-xl border border-[#4A1024] rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/60">
          {/* Header Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4A1024] border border-[#6B1834] text-[11px] font-semibold text-[#F29CA3] mb-3">
              <IconLock className="h-3 w-3" />
              <span>Restricted Administrative Access</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Administrator Sign In
            </h2>
            <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
              Authorized personnel only. All access attempts are logged and monitored.
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 gap-1.5 bg-[#1D040C] p-1 rounded-xl border border-[#3A0A18] mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                authMode === 'password'
                  ? 'bg-[#80132E] text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <IconKey className="h-3.5 w-3.5" />
              <span>Password</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                authMode === 'otp'
                  ? 'bg-[#80132E] text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <IconMail className="h-3.5 w-3.5" />
              <span>Email OTP</span>
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <IconAlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* PASSWORD AUTH MODE */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">
                  Admin Email
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
                    placeholder="admin@matrimony.com"
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
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <span>Sign In as Administrator</span>
                )}
              </button>
            </form>
          )}

          {/* EMAIL OTP AUTH MODE */}
          {authMode === 'otp' && (
            <div>
              {otpStep === 'email' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-1.5">
                      Admin Email Address
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
                        placeholder="admin@matrimony.com"
                        required
                        autoFocus
                        className="w-full bg-[#1D040C] border border-[#4A1024] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#F29CA3] focus:ring-1 focus:ring-[#F29CA3]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#80132E] to-[#A22749] hover:from-[#921837] hover:to-[#B62D53] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#80132E]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <span>Send Admin Verification Code</span>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('email');
                        setOtpCode('');
                        setErrorMessage(null);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#F29CA3] hover:underline cursor-pointer"
                    >
                      <IconArrowLeft className="h-3.5 w-3.5" />
                      <span>Edit Email</span>
                    </button>
                    <span className="text-xs text-white/60 font-mono truncate max-w-[200px]">
                      {email.trim().toLowerCase()}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1D040C] border border-[#3A0A18] text-xs text-white/80 leading-relaxed text-center">
                    Enter the 6-digit code dispatched to your administrator email.
                  </div>

                  <div className="flex justify-center py-2">
                    <ModernOtpInput
                      value={otpCode}
                      onChange={(val) => {
                        setOtpCode(val);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onComplete={(code) => {
                        handleVerifyOtp(code);
                      }}
                      error={Boolean(errorMessage)}
                      autoFocus
                    />
                  </div>

                  <div className="text-center pt-1">
                    {resendTimer > 0 ? (
                      <span className="text-xs text-white/50">
                        Resend code in{' '}
                        <span className="font-semibold text-white">
                          {resendTimer}s
                        </span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="text-xs font-semibold text-[#F29CA3] hover:underline cursor-pointer"
                      >
                        Resend Verification Code
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={isLoading || otpCode.length !== 6}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#80132E] to-[#A22749] hover:from-[#921837] hover:to-[#B62D53] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#80132E]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify &amp; Sign In</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Default Local Dev Credentials Hint */}
          <div className="mt-6 pt-5 border-t border-[#4A1024]/60 text-center">
            <p className="text-[11px] text-white/40">
              Platform Admin Credentials: <br />
              <code className="text-[#F29CA3] font-mono font-medium">admin@matrimony.com</code> / <code className="text-[#F29CA3] font-mono font-medium">Admin@123456</code>
            </p>
          </div>
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
