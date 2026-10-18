'use client';
import { useState } from 'react';
import {
  IconUsers,
  IconHeart,
  IconCalendar,
  IconSearch,
  IconPhone,
  IconMail,
  IconMessageCircle,
  IconDots as IconMoreHorizontal,
  IconCircleCheck,
  IconChevronRight,
  IconClock,
  IconShield,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';

export default function RMDashboard() {
  const [tab, setTab] = useState<'clients' | 'followups' | 'shortlists'>('clients');

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* RM Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--surface)] flex flex-col">
        <div className="p-6 border-b border-[var(--border)] flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <IconShield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--foreground)] tracking-tight">RM Portal</h2>
            <p className="text-xs text-[var(--muted)]">Sarah Jenkins</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setTab('clients')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${tab === 'clients' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--muted-strong)] hover:bg-[var(--surface-muted)]'}`}>
            <IconUsers className="h-5 w-5" /> Assigned Clients
          </button>
          <button onClick={() => setTab('shortlists')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${tab === 'shortlists' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--muted-strong)] hover:bg-[var(--surface-muted)]'}`}>
            <IconHeart className="h-5 w-5" /> Manage Shortlists
          </button>
          <button onClick={() => setTab('followups')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${tab === 'followups' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--muted-strong)] hover:bg-[var(--surface-muted)]'}`}>
            <IconCalendar className="h-5 w-5" /> Follow-ups & Calls
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">

        {tab === 'clients' && (
          <div className="space-y-6">
            <header className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">My VIP Clients</h1>
                <p className="text-[var(--muted)] mt-1">Manage your assigned high-tier clients.</p>
              </div>
              <div className="relative w-72">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                <input placeholder="Search clients by name or ID" className="w-full h-10 pl-9 pr-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm outline-none focus:border-[var(--primary)]" />
              </div>
            </header>

            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-12 text-center shadow-xs">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--surface-muted)] text-[var(--muted)] mb-3 border border-[var(--border)]">
                <IconUsers className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)]">No VIP Clients Assigned</h3>
              <p className="mt-1 text-xs sm:text-sm text-[var(--muted)] max-w-sm mx-auto">
                Assigned Platinum and VIP accounts will appear in this workspace once allocated by management.
              </p>
            </div>
          </div>
        )}

        {tab === 'shortlists' && (
          <div className="space-y-6">
            <header className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Curate Shortlists</h1>
                <p className="text-[var(--muted)] mt-1">Review profiles and shortlist them on behalf of your clients.</p>
              </div>
            </header>

            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-12 text-center shadow-xs">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--surface-muted)] text-[var(--muted)] mb-3 border border-[var(--border)]">
                <IconHeart className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)]">No Client Selected</h3>
              <p className="mt-1 text-xs sm:text-sm text-[var(--muted)] max-w-sm mx-auto">
                Select an active VIP client to curate candidate matches and shortlists.
              </p>
            </div>
          </div>
        )}

        {tab === 'followups' && (
          <div className="space-y-6">
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Follow-ups & Calls</h1>
              <p className="text-[var(--muted)] mt-1">Track interaction status and schedule meetings.</p>
            </header>

            <Card className="p-0 border-[var(--border)] shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--surface-muted)] border-b border-[var(--border)] text-[var(--muted-strong)]">
                  <tr>
                    <th className="p-4 font-semibold">Time</th>
                    <th className="p-4 font-semibold">Client</th>
                    <th className="p-4 font-semibold">Task / Goal</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs text-[var(--muted)]">
                      No scheduled RM calls or pending tasks for today.
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
}
