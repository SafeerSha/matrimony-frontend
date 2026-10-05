'use client';
import { useState } from 'react';
import {
  IconUsers,
  IconCurrencyDollar,
  IconActivity,
  IconShield,
  IconSettings,
  IconFilter,
  IconCircleCheck,
  IconCircleX,
  IconUserPlus,
  IconEyeOff,
  IconAlertTriangle,
  IconChevronDown,
  IconMenu2,
  IconX,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { profiles, getProfileUniqueId } from '@/lib/demo-data';

type AdminRole = 'superuser' | 'moderator' | 'rm';

export default function AdminDashboard() {
  const [role, setRole] = useState<AdminRole>('superuser');
  const [tab, setTab] = useState<'analytics' | 'moderation' | 'rm-management'>('analytics');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Enforce RBAC Tab selection
  if (role === 'moderator' && tab !== 'moderation') setTab('moderation');
  if (role === 'rm' && tab !== 'rm-management') setTab('rm-management');

  const handleSelectRole = (newRole: AdminRole, defaultTab: 'analytics' | 'moderation' | 'rm-management') => {
    setRole(newRole);
    setTab(defaultTab);
    setRoleDropdownOpen(false);
  };

  const handleSelectTab = (newTab: 'analytics' | 'moderation' | 'rm-management') => {
    setTab(newTab);
    setMobileMenuOpen(false);
  };

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
          <h2 className="text-base font-bold text-white tracking-tight">
            Admin<span className="text-[var(--primary-light)]">Portal</span>
          </h2>
        </div>

        {/* Mobile Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-[#4A1024] px-2.5 py-1.5 rounded-lg text-white active:scale-95 transition-all"
          >
            <span>
              {role === 'superuser' && 'Superuser'}
              {role === 'moderator' && 'Moderator'}
              {role === 'rm' && 'RM'}
            </span>
            <IconChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {roleDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setRoleDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#4A1024] border border-[#5E142E] rounded-xl overflow-hidden shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => handleSelectRole('superuser', 'analytics')}
                  className="block w-full text-left px-3.5 py-2.5 text-xs font-medium hover:bg-[#5E142E] text-white transition-colors"
                >
                  Superuser
                </button>
                <button
                  onClick={() => handleSelectRole('moderator', 'moderation')}
                  className="block w-full text-left px-3.5 py-2.5 text-xs font-medium hover:bg-[#5E142E] text-white transition-colors border-t border-[#5E142E]/50"
                >
                  Moderator
                </button>
                <button
                  onClick={() => handleSelectRole('rm', 'rm-management')}
                  className="block w-full text-left px-3.5 py-2.5 text-xs font-medium hover:bg-[#5E142E] text-white transition-colors border-t border-[#5E142E]/50"
                >
                  Relationship Manager
                </button>
              </div>
            </>
          )}
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
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Admin<span className="text-[var(--primary-light)]">Portal</span>
            </h2>
            <p className="text-[11px] text-white/50 mt-0.5">Control Center &amp; RBAC</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:text-white hover:bg-[#3A0A18]"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {/* Desktop Role Switcher */}
        <div className="px-5 pt-4 pb-2">
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen((prev) => !prev)}
              className="flex items-center justify-between w-full text-xs font-semibold bg-[#4A1024] hover:bg-[#5A142D] px-3 py-2 rounded-xl text-white transition-colors"
            >
              <span>
                {role === 'superuser' && 'Superuser Access'}
                {role === 'moderator' && 'Moderator Access'}
                {role === 'rm' && 'RM Access'}
              </span>
              <IconChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>

            {roleDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setRoleDropdownOpen(false)} />
                <div className="absolute top-full left-0 w-full mt-1.5 bg-[#4A1024] border border-[#5E142E] rounded-xl overflow-hidden shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => handleSelectRole('superuser', 'analytics')}
                    className="block w-full text-left px-3.5 py-2.5 text-xs hover:bg-[#5E142E] text-white transition-colors"
                  >
                    Superuser
                  </button>
                  <button
                    onClick={() => handleSelectRole('moderator', 'moderation')}
                    className="block w-full text-left px-3.5 py-2.5 text-xs hover:bg-[#5E142E] text-white transition-colors border-t border-[#5E142E]/50"
                  >
                    Moderator
                  </button>
                  <button
                    onClick={() => handleSelectRole('rm', 'rm-management')}
                    className="block w-full text-left px-3.5 py-2.5 text-xs hover:bg-[#5E142E] text-white transition-colors border-t border-[#5E142E]/50"
                  >
                    Relationship Manager
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {role === 'superuser' && (
            <button
              onClick={() => handleSelectTab('analytics')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                tab === 'analytics'
                  ? 'bg-[var(--primary)] text-white shadow-sm font-semibold'
                  : 'hover:bg-[#3A0A18] text-white/80'
              }`}
            >
              <IconActivity className="h-4.5 w-4.5 shrink-0" />
              <span>Dashboard &amp; Analytics</span>
            </button>
          )}
          
          {(role === 'superuser' || role === 'moderator') && (
            <button
              onClick={() => handleSelectTab('moderation')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                tab === 'moderation'
                  ? 'bg-[var(--primary)] text-white shadow-sm font-semibold'
                  : 'hover:bg-[#3A0A18] text-white/80'
              }`}
            >
              <IconShield className="h-4.5 w-4.5 shrink-0" />
              <span>Profile Moderation</span>
            </button>
          )}

          {(role === 'superuser' || role === 'rm') && (
            <button
              onClick={() => handleSelectTab('rm-management')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                tab === 'rm-management'
                  ? 'bg-[var(--primary)] text-white shadow-sm font-semibold'
                  : 'hover:bg-[#3A0A18] text-white/80'
              }`}
            >
              <IconUsers className="h-4.5 w-4.5 shrink-0" />
              <span>{role === 'rm' ? 'My VIP Clients' : 'RM Management'}</span>
            </button>
          )}

          {role === 'superuser' && (
            <div className="pt-4 mt-4 border-t border-[#3A0A18]">
              <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium hover:bg-[#3A0A18] text-white/70 transition-colors">
                <IconSettings className="h-4.5 w-4.5 shrink-0" />
                <span>System Settings</span>
              </button>
            </div>
          )}
        </nav>
      </aside>

      {/* 4. MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">

        {/* TAB 1: DASHBOARD & ANALYTICS */}
        {tab === 'analytics' && role === 'superuser' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <header className="mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">Platform Overview</h1>
              <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">Real-time metrics for users, revenue, and subscriptions.</p>
            </header>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="p-4 sm:p-5 border-[var(--border)] shadow-sm flex items-center gap-4 border-l-4 border-l-[var(--primary)]">
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center shrink-0">
                  <IconUsers className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[var(--muted)] truncate">Total Active Users</p>
                  <p className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-0.5">24,592</p>
                  <p className="text-[11px] text-[var(--primary)] font-medium mt-0.5">+1,204 this month</p>
                </div>
              </Card>

              <Card className="p-4 sm:p-5 border-[var(--border)] shadow-sm flex items-center gap-4">
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <IconCurrencyDollar className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[var(--muted)] truncate">Monthly Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-0.5">₹1.2M</p>
                  <p className="text-[11px] text-blue-600 font-medium mt-0.5">+15% vs last month</p>
                </div>
              </Card>

              <Card className="p-4 sm:p-5 border-[var(--border)] shadow-sm flex items-center gap-4 sm:col-span-2 lg:col-span-1">
                <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <IconActivity className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-[var(--muted)] truncate">Premium Conversion</p>
                  <p className="text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-0.5">18.4%</p>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">Gold &amp; Platinum combined</p>
                </div>
              </Card>
            </div>

            {/* Recent Subscriptions Card */}
            <Card className="p-4 sm:p-6 border-[var(--border)] shadow-sm mt-6">
              <h3 className="font-bold text-[var(--foreground)] text-sm sm:text-base mb-4">Recent Subscriptions</h3>
              <div className="divide-y divide-[var(--border)]">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={profiles[i].image} name={profiles[i].name} />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold truncate">{profiles[i].name}</p>
                        <p className="text-[11px] text-[var(--muted)]">ID: {getProfileUniqueId(profiles[i])}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-11 sm:pl-0">
                      <Badge tone={i % 2 === 0 ? "accent" : "default"}>
                        {i % 2 === 0 ? "Gold Plan" : "Platinum Plan"}
                      </Badge>
                      <p className="text-xs text-[var(--muted)] font-medium">Today, 10:24 AM</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: PROFILE MODERATION QUEUE */}
        {tab === 'moderation' && (role === 'superuser' || role === 'moderator') && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">Profile Moderation Queue</h1>
                <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">Review new registrations, KYC documents, and abuse reports.</p>
              </div>
              <div className="flex gap-2 self-start sm:self-auto">
                <Button variant="outline" size="sm" className="text-xs">
                  <IconFilter className="mr-1.5 h-3.5 w-3.5" /> Filter Pending
                </Button>
              </div>
            </header>

            {/* Moderation Cards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {profiles.slice(2, 6).map((p, idx) => (
                <Card key={idx} className="p-0 overflow-hidden border-[var(--border)] shadow-sm flex flex-col">
                  <div className="bg-[#FAF3EC] p-3 border-b border-[#E9DDE0] flex justify-between items-center">
                    <Badge tone={idx === 0 ? "danger" : "default"}>
                      {idx === 0 ? (
                        <span className="flex items-center gap-1"><IconAlertTriangle className="h-3 w-3"/> User Reported</span>
                      ) : (
                        "KYC Pending"
                      )}
                    </Badge>
                    <span className="text-xs text-[#766B6F] font-medium">ID: MAT-8X{idx}21</span>
                  </div>
                  <div className="flex flex-col sm:flex-row flex-1">
                    <div className="h-44 sm:h-auto sm:w-44 shrink-0 bg-slate-100 relative group overflow-hidden">
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                      {/* Privacy Overlay Indicator */}
                      <div className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center text-white text-xs text-center p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div>
                          <IconEyeOff className="h-4 w-4 mb-1 mx-auto" />
                          <span>Private Chat Logs Encrypted</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-[var(--foreground)] text-base sm:text-lg">{p.name}, {p.age}</h3>
                        <p className="text-xs text-[var(--muted)] mt-0.5">{p.city}, {p.state}</p>
                        <p className="text-xs sm:text-sm mt-2.5 line-clamp-2 text-[var(--muted-strong)] leading-relaxed">{p.about}</p>
                      </div>
                      <div className="flex gap-2 mt-4 pt-3 border-t border-[var(--border)]">
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs">
                          <IconCircleCheck className="mr-1.5 h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 text-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-white border-[var(--primary)] text-xs">
                          <IconCircleX className="mr-1.5 h-3.5 w-3.5" /> Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: RM MANAGEMENT */}
        {tab === 'rm-management' && (role === 'superuser' || role === 'rm') && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
                  {role === 'rm' ? 'My VIP Clients' : 'RM Management'}
                </h1>
                <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                  {role === 'rm' ? 'Manage your assigned Platinum members and suggest matches.' : 'Manage staff, assign VIP clients, and track performance.'}
                </p>
              </div>
              {role === 'superuser' && (
                <Button className="bg-[var(--primary)] text-white hover:bg-[#5E142E] self-start sm:self-auto text-xs" size="sm">
                  <IconUserPlus className="mr-1.5 h-3.5 w-3.5" /> Add RM
                </Button>
              )}
            </header>

            {/* Responsive Scrollable Table Container */}
            <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm min-w-[620px]">
                <thead className="bg-[#FAF3EC] border-b border-[#E9DDE0] text-[#7A1835]">
                  <tr>
                    <th className="p-3.5 sm:p-4 font-semibold">{role === 'rm' ? 'Client Name' : 'Staff Name'}</th>
                    <th className="p-3.5 sm:p-4 font-semibold">{role === 'rm' ? 'Plan' : 'Assigned Clients'}</th>
                    <th className="p-3.5 sm:p-4 font-semibold">{role === 'rm' ? 'Match Suggestions' : 'Success Rate'}</th>
                    <th className="p-3.5 sm:p-4 font-semibold">Status</th>
                    <th className="p-3.5 sm:p-4 font-semibold text-right sm:text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {role === 'superuser' ? (
                    // RM Management View (Superuser)
                    [
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
                    ))
                  ) : (
                    // Client Management View (RM Role)
                    [
                      { name: 'Kavya Pillai', plan: 'Platinum', suggestions: 12, status: 'Searching' },
                      { name: 'Arun Kumar', plan: 'Platinum', suggestions: 5, status: 'In Talks' },
                      { name: 'Meera Nair', plan: 'Gold', suggestions: 18, status: 'Searching' },
                    ].map((client, i) => (
                      <tr key={i} className="hover:bg-[var(--surface)] transition-colors">
                        <td className="p-3.5 sm:p-4 font-bold flex items-center gap-3">
                          <Avatar src={profiles[i].image} name={client.name} />
                          <span className="truncate">{client.name}</span>
                        </td>
                        <td className="p-3.5 sm:p-4"><Badge tone={client.plan === 'Platinum' ? "accent" : "default"}>{client.plan}</Badge></td>
                        <td className="p-3.5 sm:p-4 font-medium">{client.suggestions} suggested</td>
                        <td className="p-3.5 sm:p-4"><Badge tone="success">{client.status}</Badge></td>
                        <td className="p-3.5 sm:p-4 text-right sm:text-left">
                          <Button className="bg-[var(--primary)] text-white hover:bg-[#5E142E] text-xs" size="sm">View Preferences</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
