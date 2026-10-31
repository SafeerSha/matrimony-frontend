'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconUsers,
  IconActivity,
  IconShield,
  IconFilter,
  IconUserPlus,
  IconMenu2,
  IconX,
  IconShieldCheck,
  IconLoader2,
  IconLogout,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlatformOverview } from '@/components/admin/platform-overview';
import { UserManagement } from '@/components/admin/user-management';
import { authService } from '@/services/auth.service';
import { toast } from '@/lib/toast';

type AdminTab = 'analytics' | 'users' | 'moderation' | 'rm-management';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [tab, setTab] = useState<AdminTab>('analytics');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyAdminAccess() {
      const token = authService.getAccessToken();
      if (!token) {
        if (isMounted) setIsAuthorized(false);
        router.replace('/admin/login?next=/admin');
        return;
      }

      try {
        const user = await authService.getCurrentUser();
        const role = typeof user?.role === 'string' ? user.role.toUpperCase() : '';

        if (role !== 'ADMIN') {
          if (isMounted) setIsAuthorized(false);
          toast.dismissAll();
          toast.flash(
            'error',
            'Access Denied',
            'You do not have permission to access the Admin Portal. Please sign in with an administrator account.'
          );
          router.replace('/admin/login?next=/admin');
          return;
        }

        if (isMounted) {
          setIsAuthorized(true);
        }
      } catch (err: any) {
        if (isMounted) setIsAuthorized(false);
        router.replace('/admin/login?next=/admin');
      }
    }

    verifyAdminAccess();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSelectTab = (newTab: AdminTab) => {
    setTab(newTab);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch { }
    toast.dismissAll();
    toast.flash('info', 'Logged Out', 'You have been signed out of the Admin Portal.');
    window.location.href = '/admin/login';
  };

  // If user is not authorized or still verifying, DO NOT show the dashboard screen itself
  if (isAuthorized !== true) {
    return (
      <div className="min-h-screen bg-[#2A0711] flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="flex flex-col items-center gap-4 max-w-sm">
          <div className="h-12 w-12 rounded-2xl bg-[#4A1024] border border-[#5E142E] grid place-items-center text-rose-300 shadow-inner">
            <IconLoader2 className="h-6 w-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Verifying Admin Authorization</h3>
            <p className="text-xs text-white/60 mt-1">
              Checking access permissions for the Admin Portal…
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col lg:flex-row">
      {/* 1. MOBILE TOP HEADER (shown on < lg) */}
      <div className="lg:hidden flex items-center justify-between bg-[#2A0711] text-white px-4 py-3 border-b border-[#3A0A18] sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="grid h-9 w-9 place-items-center rounded-lg text-white/80 hover:text-white hover:bg-[#3A0A18] transition-colors"
            aria-label="Toggle admin menu"
          >
            {mobileMenuOpen ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-white tracking-tight leading-none">
              Admin Portal
            </h2>
            <span className="text-[10px] font-semibold text-[#F29CA3] tracking-wide mt-0.5">
              IshtamChat
            </span>
          </div>
        </div>

        {/* Header Right: Authenticated Role Indicator & Logout Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold bg-[#4A1024] px-2.5 py-1 rounded-lg text-white border border-[#5E142E]">
            <IconShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Admin</span>
          </div>
          <button
            onClick={handleLogout}
            title="Log out of Admin Portal"
            className="flex items-center gap-1 text-xs font-semibold bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-800/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <IconLogout className="h-3.5 w-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* 2. MOBILE SIDEBAR BACKDROP */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 3. SIDEBAR (Persistent on Desktop, Slide-over on Mobile) */}
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
              <IconShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight leading-none">
                Admin Portal
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

        {/* Role badge */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#4A1024] border border-[#5E142E] text-xs text-white">
            <IconShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold block leading-tight">Administrator</span>
              <span className="text-[10px] text-white/60">Full Platform Access</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" aria-label="Admin Navigation">
          <button
            onClick={() => handleSelectTab('analytics')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${tab === 'analytics'
              ? 'bg-[var(--primary)] text-white shadow-sm font-semibold'
              : 'hover:bg-[#3A0A18] text-white/80'
              }`}
          >
            <IconActivity className="h-4.5 w-4.5 shrink-0" />
            <span>Platform Overview</span>
          </button>

          <button
            onClick={() => handleSelectTab('users')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${tab === 'users'
              ? 'bg-[var(--primary)] text-white shadow-sm font-semibold'
              : 'hover:bg-[#3A0A18] text-white/80'
              }`}
          >
            <IconUsers className="h-4.5 w-4.5 shrink-0" />
            <span>User Management</span>
          </button>

          {/* <button
            onClick={() => handleSelectTab('moderation')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${tab === 'moderation'
                ? 'bg-[var(--primary)] text-white shadow-sm font-semibold'
                : 'hover:bg-[#3A0A18] text-white/80'
              }`}
          >
            <div className="flex items-center gap-3">
              <IconShield className="h-4.5 w-4.5 shrink-0" />
              <span>Moderation</span>
            </div>
            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">Mock</span>
          </button> */}

          {/* <button
            onClick={() => handleSelectTab('rm-management')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${tab === 'rm-management'
                ? 'bg-[var(--primary)] text-white shadow-sm font-semibold'
                : 'hover:bg-[#3A0A18] text-white/80'
              }`}
          >
            <div className="flex items-center gap-3">
              <IconUsers className="h-4.5 w-4.5 shrink-0" />
              <span>RM Management</span>
            </div>
            <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">Mock</span>
          </button> */}
        </nav>

        {/* Sidebar Footer with Logout */}
        <div className="p-4 border-t border-[#3A0A18] mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-200 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/70 transition-all cursor-pointer shadow-sm hover:shadow-rose-950/40"
          >
            <IconLogout className="h-4 w-4" />
            <span>Logout from Admin</span>
          </button>
        </div>
      </aside>

      {/* 4. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex items-center justify-between pb-6 mb-6 border-b border-[var(--border)]">
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)] tracking-tight leading-tight">
              Admin Portal
            </h1>
            <p className="text-xs font-semibold text-[var(--primary)] tracking-wide">
              IshtamChat Platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF3EC] border border-[#EAD8C7] text-xs font-semibold text-[#80132E]">
              <IconShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Administrator</span>
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

        {/* TAB 1: DASHBOARD & LIVE ANALYTICS */}
        {tab === 'analytics' && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
            <Suspense
              fallback={
                <div
                  className="h-64 rounded-2xl bg-[var(--surface-muted)] animate-pulse flex items-center justify-center text-xs text-[var(--muted)]"
                  aria-busy="true"
                >
                  Loading platform analytics…
                </div>
              }
            >
              <PlatformOverview />
            </Suspense>
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {tab === 'users' && <UserManagement />}

        {/* TAB 3: PROFILE MODERATION QUEUE (Labeled Mock Prototype) */}
        {tab === 'moderation' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
                    Profile Moderation Queue
                  </h1>
                  <Badge tone="default" size="sm" className="bg-amber-100 text-amber-800">
                    Mock Prototype
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                  Review new registrations, KYC documents, and abuse reports.
                </p>
              </div>
              <div className="flex gap-2 self-start sm:self-auto">
                <Button variant="outline" size="sm" className="text-xs">
                  <IconFilter className="mr-1.5 h-3.5 w-3.5" /> Filter Pending
                </Button>
              </div>
            </header>

            {/* Moderation Queue Empty State */}
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-12 text-center shadow-xs">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--surface-muted)] text-[var(--muted)] mb-3 border border-[var(--border)]">
                <IconShield className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)]">Moderation Queue is Clear</h3>
              <p className="mt-1 text-xs sm:text-sm text-[var(--muted)] max-w-sm mx-auto">
                No new profile registrations or KYC documents are awaiting review at this time.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: RM MANAGEMENT (Labeled Mock Prototype) */}
        {tab === 'rm-management' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
                    RM Management
                  </h1>
                  <Badge tone="default" size="sm" className="bg-amber-100 text-amber-800">
                    Mock Prototype
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                  Manage staff, assign VIP clients, and track performance.
                </p>
              </div>
              <Button className="bg-[var(--primary)] text-white hover:bg-[#5E142E] self-start sm:self-auto text-xs" size="sm">
                <IconUserPlus className="mr-1.5 h-3.5 w-3.5" /> Add RM
              </Button>
            </header>

            <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm min-w-[620px]">
                <thead className="bg-[#FAF3EC] border-b border-[#E9DDE0] text-[#7A1835]">
                  <tr>
                    <th className="p-3.5 sm:p-4 font-semibold">Staff Name</th>
                    <th className="p-3.5 sm:p-4 font-semibold">Assigned Clients</th>
                    <th className="p-3.5 sm:p-4 font-semibold">Success Rate</th>
                    <th className="p-3.5 sm:p-4 font-semibold">Status</th>
                    <th className="p-3.5 sm:p-4 font-semibold text-right sm:text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {[
                    { name: 'Sarah Jenkins', clients: 24, rate: '82%', status: 'Active' },
                    { name: 'Michael Chen', clients: 18, rate: '76%', status: 'Active' },
                    { name: 'Priya Sharma', clients: 31, rate: '88%', status: 'Active' },
                  ].map((rm, i) => (
                    <tr key={i} className="hover:bg-[var(--surface)] transition-colors">
                      <td className="p-3.5 sm:p-4 font-bold flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center shrink-0">
                          {rm.name.charAt(0)}
                        </div>
                        <span className="truncate">{rm.name}</span>
                      </td>
                      <td className="p-3.5 sm:p-4 font-medium">{rm.clients} VIPs</td>
                      <td className="p-3.5 sm:p-4 text-green-600 font-semibold">{rm.rate}</td>
                      <td className="p-3.5 sm:p-4"><Badge tone="success">{rm.status}</Badge></td>
                      <td className="p-3.5 sm:p-4 text-right sm:text-left">
                        <Button variant="secondary" size="sm" className="text-xs">Manage Staff</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
