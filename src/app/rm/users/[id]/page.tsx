'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  IconUsers,
  IconMessageReport,
  IconHeartHandshake,
  IconMenu2,
  IconX,
  IconUserCheck,
  IconLoader2,
  IconLogout,
  IconFlag,
} from '@tabler/icons-react';
import { RmUserDetailView } from '@/components/rm/rm-user-detail-view';
import { authService } from '@/services/auth.service';
import { rmService } from '@/services/rm.service';
import { toast } from '@/lib/toast';

export default function RmUserProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = typeof params?.id === 'string' ? params.id : '';

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openIssuesCount, setOpenIssuesCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function verifyRmAccess() {
      const token = authService.getAccessToken();
      if (!token) {
        if (isMounted) setIsAuthorized(false);
        router.replace(`/rm/login?next=${encodeURIComponent(`/rm/users/${userId}`)}`);
        return;
      }

      try {
        const user = await authService.getCurrentUser();
        const role = typeof user?.role === 'string' ? user.role.toUpperCase() : '';

        if (role !== 'RM' && role !== 'ADMIN') {
          if (isMounted) setIsAuthorized(false);
          toast.dismissAll();
          toast.flash(
            'error',
            'Access Denied',
            'You do not have permission to access the RM Portal. Please sign in with an authorized account.'
          );
          router.replace('/rm/login?next=/rm');
          return;
        }

        if (isMounted) {
          setIsAuthorized(true);
        }
      } catch {
        if (isMounted) setIsAuthorized(false);
        router.replace('/rm/login?next=/rm');
      }
    }

    verifyRmAccess();
    return () => {
      isMounted = false;
    };
  }, [router, userId]);

  useEffect(() => {
    if (isAuthorized !== true) return;
    const controller = new AbortController();
    rmService
      .getFeedbackStats(controller.signal)
      .then((res) => setOpenIssuesCount(res.openCount || 0))
      .catch(() => {});
    return () => controller.abort();
  }, [isAuthorized]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {}
    toast.dismissAll();
    toast.flash('info', 'Logged Out', 'You have been signed out of the RM Portal.');
    window.location.href = '/rm/login';
  };

  if (isAuthorized !== true) {
    return (
      <div className="min-h-screen bg-[#2A0711] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="flex flex-col items-center gap-4 max-w-sm">
          <div className="h-12 w-12 rounded-2xl bg-[#4A1024] border border-[#5E142E] grid place-items-center text-rose-300 shadow-inner">
            <IconLoader2 className="h-6 w-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Verifying RM Authorization</h3>
            <p className="text-xs text-white/60 mt-1">
              Checking access permissions for the RM Portal…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between bg-[#2A0711] text-white px-4 py-3 border-b border-[#3A0A18] sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="grid h-9 w-9 place-items-center rounded-lg text-white/80 hover:text-white hover:bg-[#3A0A18] transition-colors"
            aria-label="Toggle RM menu"
          >
            {mobileMenuOpen ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-white tracking-tight leading-none">
              RM Portal
            </h2>
            <span className="text-[10px] font-semibold text-[#F29CA3] tracking-wide mt-0.5">
              IshtamChat
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold bg-[#4A1024] px-2.5 py-1 rounded-lg text-white border border-[#5E142E]">
            <IconUserCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>RM</span>
          </div>
          <button
            onClick={handleLogout}
            title="Log out of RM Portal"
            className="flex items-center gap-1 text-xs font-semibold bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-800/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <IconLogout className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-[#2A0711] text-white/80 border-r border-[#3A0A18] flex flex-col transition-transform duration-300 ease-in-out
          lg:static lg:w-64 lg:translate-x-0 lg:z-auto lg:shrink-0
          ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-5 sm:p-6 border-b border-[#3A0A18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#80132E] to-[#A22749] border border-[#C23B60]/40 flex items-center justify-center shadow-md shadow-[#80132E]/30 text-white shrink-0">
              <IconHeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight leading-none">
                RM Portal
              </h2>
              <p className="text-xs font-semibold text-[#F29CA3] mt-1 tracking-wide">
                IshtamChat
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:text-white hover:bg-[#3A0A18]"
            aria-label="Close sidebar"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" aria-label="RM Navigation">
          <Link
            href="/rm?tab=users"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--primary)] text-white shadow-sm transition-all"
          >
            <IconUsers className="h-4.5 w-4.5 shrink-0" />
            <span>User Directory</span>
          </Link>

          <Link
            href="/rm?tab=feedback"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium hover:bg-[#3A0A18] text-white/80 transition-all"
          >
            <div className="flex items-center gap-3">
              <IconMessageReport className="h-4.5 w-4.5 shrink-0" />
              <span>Feedback &amp; Issues</span>
            </div>
            {openIssuesCount > 0 && (
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white">
                {openIssuesCount}
              </span>
            )}
          </Link>

          <Link
            href="/rm?tab=reports"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium hover:bg-[#3A0A18] text-white/80 transition-all"
          >
            <div className="flex items-center gap-3">
              <IconFlag className="h-4.5 w-4.5 shrink-0" />
              <span>User Reports</span>
            </div>
          </Link>
        </nav>

        <div className="p-4 border-t border-[#3A0A18] mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-200 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/70 transition-all cursor-pointer shadow-sm hover:shadow-rose-950/40"
          >
            <IconLogout className="h-4 w-4" />
            <span>Logout from RM Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">
        <header className="hidden lg:flex items-center justify-between pb-6 mb-6 border-b border-[var(--border)]">
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight leading-tight">
              RM Portal
            </h1>
            <p className="text-xs font-semibold text-[var(--primary)] tracking-wide">
              IshtamChat Platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF3EC] border border-[#EAD8C7] text-xs font-semibold text-[#80132E]">
              <IconUserCheck className="h-4 w-4 text-emerald-600" />
              <span>Relationship Manager</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer shadow-xs"
            >
              <IconLogout className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <RmUserDetailView userId={userId} />
      </main>
    </div>
  );
}

