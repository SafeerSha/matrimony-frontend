'use client';
import { useState } from 'react';
import {
  IconUsers,
  IconCurrencyDollar,
  IconActivity,
  IconPhoto,
  IconUserCheck,
  IconUserX,
  IconUserPlus,
  IconSettings,
  IconShield,
  IconSearch,
  IconFilter,
  IconChevronDown,
  IconCircleCheck,
  IconCircleX,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { profiles, getProfileUniqueId } from '@/lib/demo-data';

export default function AdminDashboard() {
  const [tab, setTab] = useState<'analytics' | 'moderation' | 'rm-management'>('analytics');

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white tracking-tight">Admin<span className="text-emerald-500">Portal</span></h2>
          <p className="text-xs text-slate-400 mt-1">Superuser Access</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${tab === 'analytics' ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-slate-800'}`}>
            <IconActivity className="h-5 w-5" /> Dashboard & Analytics
          </button>
          <button onClick={() => setTab('moderation')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${tab === 'moderation' ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-slate-800'}`}>
            <IconShield className="h-5 w-5" /> Profile Moderation
          </button>
          <button onClick={() => setTab('rm-management')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${tab === 'rm-management' ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-slate-800'}`}>
            <IconUsers className="h-5 w-5" /> RM Management
          </button>
          <div className="pt-6 mt-6 border-t border-slate-800">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-slate-800">
              <IconSettings className="h-5 w-5" /> System Settings
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">

        {tab === 'analytics' && (
          <div className="space-y-6">
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Platform Overview</h1>
              <p className="text-[var(--muted)] mt-1">Real-time metrics for users, revenue, and subscriptions.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-[var(--border)] shadow-sm flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <IconUsers className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--muted)]">Total Active IconUsers</p>
                  <p className="text-2xl font-bold text-[var(--foreground)]">24,592</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">+1,204 this month</p>
                </div>
              </Card>
              <Card className="p-6 border-[var(--border)] shadow-sm flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <IconCurrencyDollar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--muted)]">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-[var(--foreground)]">₹1.2M</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">+15% vs last month</p>
                </div>
              </Card>
              <Card className="p-6 border-[var(--border)] shadow-sm flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <IconActivity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--muted)]">Premium Conversion</p>
                  <p className="text-2xl font-bold text-[var(--foreground)]">18.4%</p>
                  <p className="text-xs text-[var(--muted)] mt-1">Gold & Platinum combined</p>
                </div>
              </Card>
            </div>

            <Card className="p-6 border-[var(--border)] shadow-sm mt-6">
              <h3 className="font-bold text-[var(--foreground)] mb-4">Recent Subscriptions</h3>
              <div className="divide-y divide-[var(--border)]">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar src={profiles[i].image} name={profiles[i].name} />
                      <div>
                        <p className="text-sm font-bold">{profiles[i].name}</p>
                        <p className="text-xs text-[var(--muted)]">ID: {getProfileUniqueId(profiles[i])}</p>
                      </div>
                    </div>
                    <Badge tone={i % 2 === 0 ? "accent" : "default"}>{i % 2 === 0 ? "Gold Plan" : "Platinum Plan"}</Badge>
                    <p className="text-sm font-medium text-[var(--muted)]">Today, 10:24 AM</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === 'moderation' && (
          <div className="space-y-6">
            <header className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Profile Moderation Queue</h1>
                <p className="text-[var(--muted)] mt-1">Review new registrations and image uploads.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline"><IconFilter className="mr-2 h-4 w-4" /> Filter</Button>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {profiles.slice(2, 6).map((p, idx) => (
                <Card key={idx} className="p-0 overflow-hidden border-[var(--border)] shadow-sm">
                  <div className="flex">
                    <div className="h-40 w-40 shrink-0 bg-slate-100">
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="font-bold text-[var(--foreground)]">{p.name}, {p.age}</h3>
                          <Badge tone="default">Pending Review</Badge>
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-1">Uploaded 2 hours ago</p>
                        <p className="text-sm mt-3 line-clamp-2 text-[var(--muted-strong)]">{p.about}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white"><IconCircleCheck className="mr-2 h-4 w-4" /> Approve</Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50"><IconCircleX className="mr-2 h-4 w-4" /> Reject</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {tab === 'rm-management' && (
          <div className="space-y-6">
            <header className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Relationship Managers</h1>
                <p className="text-[var(--muted)] mt-1">Manage staff, assign VIP clients, and track performance.</p>
              </div>
              <Button className="bg-[var(--primary)] text-white"><IconUserPlus className="mr-2 h-4 w-4" /> Add RM</Button>
            </header>

            <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--surface-muted)] border-b border-[var(--border)] text-[var(--muted-strong)]">
                  <tr>
                    <th className="p-4 font-semibold">Staff Name</th>
                    <th className="p-4 font-semibold">Assigned Clients</th>
                    <th className="p-4 font-semibold">Success Rate</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {[
                    { name: 'Sarah Jenkins', clients: 24, rate: '82%', status: 'Active' },
                    { name: 'Michael Chen', clients: 18, rate: '76%', status: 'Active' },
                    { name: 'Priya Sharma', clients: 31, rate: '88%', status: 'Active' },
                  ].map((rm, i) => (
                    <tr key={i} className="hover:bg-[var(--surface)] transition-colors">
                      <td className="p-4 font-bold flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">{rm.name.charAt(0)}</div>
                        {rm.name}
                      </td>
                      <td className="p-4 font-medium">{rm.clients} VIPs</td>
                      <td className="p-4 text-green-600 font-semibold">{rm.rate}</td>
                      <td className="p-4"><Badge tone="success">{rm.status}</Badge></td>
                      <td className="p-4"><Button variant="secondary" size="sm">Manage</Button></td>
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
