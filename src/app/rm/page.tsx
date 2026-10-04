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
import { profiles, getProfileUniqueId } from '@/lib/demo-data';

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
                <p className="text-[var(--muted)] mt-1">Manage your 24 assigned high-tier clients.</p>
              </div>
              <div className="relative w-72">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" />
                <input placeholder="Search clients by name or ID" className="w-full h-10 pl-9 pr-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm outline-none focus:border-[var(--primary)]" />
              </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {[profiles[0], profiles[1], profiles[2], profiles[4]].map((client, idx) => (
                <Card key={idx} className="p-6 border-[var(--border)] shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar src={client.image} name={client.name} size="lg" />
                      <div>
                        <h3 className="font-bold text-[var(--foreground)]">{client.name}, {client.age}</h3>
                        <p className="text-sm font-medium text-[var(--primary)]">ID: {getProfileUniqueId(client)}</p>
                        <p className="text-xs text-[var(--muted)] mt-1">{client.profession} · {client.city}</p>
                      </div>
                    </div>
                    <Badge tone="accent">Platinum</Badge>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2 border-t border-b border-[var(--border)] py-4">
                    <div className="text-center border-r border-[var(--border)]">
                      <p className="text-xl font-bold text-[var(--foreground)]">12</p>
                      <p className="text-xs text-[var(--muted)]">Shortlisted</p>
                    </div>
                    <div className="text-center border-r border-[var(--border)]">
                      <p className="text-xl font-bold text-[var(--foreground)]">4</p>
                      <p className="text-xs text-[var(--muted)]">Interests Sent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-[var(--foreground)]">1</p>
                      <p className="text-xs text-[var(--muted)]">Meeting Set</p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <Button className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-deep)] text-white">Find Matches</Button>
                    <Button variant="secondary" className="px-3"><IconPhone className="h-4 w-4" /></Button>
                    <Button variant="secondary" className="px-3"><IconMessageCircle className="h-4 w-4" /></Button>
                  </div>
                </Card>
              ))}
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

            <div className="flex gap-6">
              {/* Client Selector */}
              <div className="w-1/3">
                <Card className="p-4 border-[var(--border)] shadow-sm">
                  <h3 className="font-bold text-sm text-[var(--muted-strong)] uppercase tracking-wider mb-4">Select Client</h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-left">
                      <Avatar src={profiles[0].image} name={profiles[0].name} size="sm" />
                      <div className="flex-1">
                        <p className="text-sm font-bold">{profiles[0].name}</p>
                        <p className="text-xs text-[var(--primary)]">Looking for: IT Prof, Bangalore</p>
                      </div>
                      <IconChevronRight className="h-4 w-4 text-[var(--primary)]" />
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--surface-muted)] text-left transition-colors">
                      <Avatar src={profiles[1].image} name={profiles[1].name} size="sm" />
                      <div className="flex-1">
                        <p className="text-sm font-bold">{profiles[1].name}</p>
                        <p className="text-xs text-[var(--muted)]">Looking for: Doctor, Kerala</p>
                      </div>
                    </button>
                  </div>
                </Card>
              </div>

              {/* Match Pool */}
              <div className="w-2/3 space-y-4">
                <div className="flex justify-between items-center bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
                  <p className="text-sm font-bold">Showing curated matches for <span className="text-[var(--primary)]">{profiles[0].name}</span></p>
                  <Button size="sm" variant="outline">Adjust Filters</Button>
                </div>

                {profiles.slice(2, 5).map((p, idx) => (
                  <Card key={idx} className="p-4 border-[var(--border)] shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar src={p.image} name={p.name} />
                      <div>
                        <h3 className="font-bold text-[var(--foreground)]">{p.name}, {p.age}</h3>
                        <p className="text-xs text-[var(--muted)]">{p.profession} · {p.city}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge tone="success">{p.compatibility}% Match</Badge>
                          <Badge tone="default">Never Contacted</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm"><IconHeart className="mr-2 h-3.5 w-3.5" /> Shortlist for Client</Button>
                      <Button size="sm" variant="ghost">View Full Profile</Button>
                    </div>
                  </Card>
                ))}
              </div>
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
                  <tr className="bg-amber-50/50">
                    <td className="p-4 font-bold flex items-center gap-2 text-amber-600">
                      <IconClock className="h-4 w-4" /> 10:30 AM
                    </td>
                    <td className="p-4 font-bold">{profiles[0].name}</td>
                    <td className="p-4 text-[var(--muted-strong)]">Review shortlisted profiles via phone call</td>
                    <td className="p-4"><Badge tone="accent">Upcoming</Badge></td>
                    <td className="p-4"><Button size="sm">Start Call</Button></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-[var(--muted)]">02:15 PM</td>
                    <td className="p-4 font-bold">{profiles[1].name}</td>
                    <td className="p-4 text-[var(--muted-strong)]">IconCheck interest response from Matches</td>
                    <td className="p-4"><Badge tone="default">Scheduled</Badge></td>
                    <td className="p-4"><Button size="sm" variant="secondary">View Details</Button></td>
                  </tr>
                  <tr className="opacity-60">
                    <td className="p-4 font-medium text-[var(--muted)]">Yesterday</td>
                    <td className="p-4 font-bold">{profiles[2].name}</td>
                    <td className="p-4 text-[var(--muted-strong)]">Onboarding and preference setup</td>
                    <td className="p-4"><Badge tone="success">Completed</Badge></td>
                    <td className="p-4"><Button size="sm" variant="ghost">Log</Button></td>
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
