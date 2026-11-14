'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  IconUsers,
  IconUserPlus,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconChevronRight,
  IconX,
  IconCheck,
  IconLoader2,
  IconEye,
  IconUserMinus,
  IconCalendarEvent,
  IconPhone,
  IconMail,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { adminService, type RelationshipManagerItem } from '@/services/admin.service';
import { toast } from '@/lib/toast';

export function RmManagement() {
  const [rms, setRms] = useState<RelationshipManagerItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Add RM Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Manage Assigned Clients Modal state
  const [selectedRm, setSelectedRm] = useState<RelationshipManagerItem | null>(null);
  const [assignedClients, setAssignedClients] = useState<any[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  // Assign New Client Sub-modal / Search state
  const [assignSearch, setAssignSearch] = useState('');
  const [candidateUsers, setCandidateUsers] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUserIdsToAssign, setSelectedUserIdsToAssign] = useState<Set<string>>(new Set());
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const fetchRms = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const data = await adminService.getRelationshipManagers(signal);
      setRms(data || []);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      toast.error('Failed to load RMs', err?.message || 'Could not fetch Relationship Managers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchRms(controller.signal);
    return () => controller.abort();
  }, [fetchRms]);

  const handleOpenClientsModal = async (rm: RelationshipManagerItem) => {
    setSelectedRm(rm);
    setClientsLoading(true);
    setCandidateUsers([]);
    setAssignSearch('');
    setSelectedUserIdsToAssign(new Set());
    try {
      const res = await adminService.getRmClients(rm.id);
      setAssignedClients(res.clients || []);
    } catch (err: any) {
      toast.error('Failed to load clients', err?.message || 'Could not fetch assigned clients.');
    } finally {
      setClientsLoading(false);
    }
  };

  const handleCreateRm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim() || !password) {
      toast.error('Missing details', 'First name, email, and password are required.');
      return;
    }

    try {
      setSubmittingAdd(true);
      await adminService.createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        role: 'RM',
      });
      toast.success('RM Account Created', `${firstName} can now sign in to the RM Portal.`);
      setAddModalOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      fetchRms();
    } catch (err: any) {
      toast.error('Failed to create RM', err?.message || 'Could not create Relationship Manager account.');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleSearchUsersToAssign = async () => {
    if (!assignSearch.trim()) return;
    try {
      setSearchLoading(true);
      const res = await adminService.getUsers({
        search: assignSearch.trim(),
        role: 'USER',
        limit: 10,
      });
      // Filter out users already assigned to this RM
      const existingIds = new Set(assignedClients.map((c) => c.id));
      setCandidateUsers((res.data || []).filter((u: any) => !existingIds.has(u.id)));
    } catch (err: any) {
      toast.error('Search failed', err?.message || 'Could not search users.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAssignSelected = async () => {
    if (!selectedRm || selectedUserIdsToAssign.size === 0) return;
    try {
      setSubmittingAssign(true);
      const res = await adminService.assignClientsToRm(
        selectedRm.id,
        Array.from(selectedUserIdsToAssign)
      );
      toast.success('Clients Assigned', res.message);
      setSelectedUserIdsToAssign(new Set());
      setCandidateUsers([]);
      setAssignSearch('');
      // Reload RM clients
      const clientsRes = await adminService.getRmClients(selectedRm.id);
      setAssignedClients(clientsRes.clients || []);
      fetchRms();
    } catch (err: any) {
      toast.error('Assignment Failed', err?.message || 'Could not assign clients.');
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleUnassignClient = async (clientId: string) => {
    if (!selectedRm) return;
    try {
      await adminService.unassignClientsFromRm([clientId]);
      toast.success('Client Unassigned', 'Client removed from RM portfolio.');
      setAssignedClients((prev) => prev.filter((c) => c.id !== clientId));
      fetchRms();
    } catch (err: any) {
      toast.error('Unassign Failed', err?.message || 'Could not unassign client.');
    }
  };

  const toggleSelectUserToAssign = (userId: string) => {
    const next = new Set(selectedUserIdsToAssign);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    setSelectedUserIdsToAssign(next);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
              Relationship Manager Management
            </h1>
            <Badge tone="default">{rms.length} Staff</Badge>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Manage RM staff members, assign client portfolios, and track client interactions and follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchRms()}
            disabled={loading}
            className="cursor-pointer"
          >
            <IconRefresh className={`mr-1.5 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setAddModalOpen(true)}
            className="bg-[var(--primary)] text-white hover:bg-[#5E142E] cursor-pointer text-xs"
          >
            <IconUserPlus className="mr-1.5 h-3.5 w-3.5" /> Add New RM
          </Button>
        </div>
      </header>

      {/* RMs Table */}
      {loading ? (
        <Card className="p-8 text-center bg-white border-[var(--border)]">
          <IconLoader2 className="h-6 w-6 animate-spin text-[var(--primary)] mx-auto mb-2" />
          <p className="text-xs text-[var(--muted)]">Loading Relationship Managers…</p>
        </Card>
      ) : rms.length === 0 ? (
        <Card className="p-12 text-center bg-white border-[var(--border)]">
          <div className="h-12 w-12 rounded-2xl bg-stone-100 text-stone-500 grid place-items-center mx-auto mb-3">
            <IconUsers className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-[var(--foreground)]">No RMs Registered Yet</h3>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
            Click &ldquo;Add New RM&rdquo; to create your first Relationship Manager account.
          </p>
          <Button
            size="sm"
            onClick={() => setAddModalOpen(true)}
            className="mt-4 bg-[var(--primary)] text-white"
          >
            <IconUserPlus className="mr-1.5 h-3.5 w-3.5" /> Add New RM
          </Button>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-[var(--border)] shadow-xs overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
            <thead className="bg-[#FAF3EC] border-b border-[#E9DDE0] text-[#7A1835]">
              <tr>
                <th className="p-3.5 sm:p-4 font-semibold">RM Name</th>
                <th className="p-3.5 sm:p-4 font-semibold">Contact Details</th>
                <th className="p-3.5 sm:p-4 font-semibold">Assigned Clients</th>
                <th className="p-3.5 sm:p-4 font-semibold">Interactions Logged</th>
                <th className="p-3.5 sm:p-4 font-semibold">Follow-ups Scheduled</th>
                <th className="p-3.5 sm:p-4 font-semibold">Status</th>
                <th className="p-3.5 sm:p-4 font-semibold text-right sm:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rms.map((rm) => (
                <tr key={rm.id} className="hover:bg-[var(--surface)] transition-colors">
                  <td className="p-3.5 sm:p-4 font-bold">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-[#80132E] to-[#A22749] text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {rm.firstName ? rm.firstName.charAt(0).toUpperCase() : 'R'}
                        {rm.isOnline && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white"
                            title="Online now"
                          />
                        )}
                      </div>
                      <div>
                        <span className="text-[var(--foreground)] block">
                          {rm.firstName} {rm.lastName || ''}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--muted)] font-normal">
                          {rm.profileId || 'RM'}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 sm:p-4 text-xs text-[var(--muted)]">
                    <div className="space-y-0.5">
                      <span className="block text-stone-700">{rm.email}</span>
                      {rm.phone && <span>{rm.phone}</span>}
                    </div>
                  </td>

                  <td className="p-3.5 sm:p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-900 font-bold text-xs border border-rose-100">
                      <IconUsers className="h-3.5 w-3.5 text-[#80132E]" />
                      {rm.assignedClientsCount} Clients
                    </span>
                  </td>

                  <td className="p-3.5 sm:p-4 font-medium text-stone-700">
                    {rm.interactionsCount} logged
                  </td>

                  <td className="p-3.5 sm:p-4 font-medium text-stone-700">
                    {rm.followUpsCount} active
                  </td>

                  <td className="p-3.5 sm:p-4">
                    <Badge tone={rm.isBanned ? 'danger' : 'success'}>
                      {rm.isBanned ? 'Banned' : rm.status}
                    </Badge>
                  </td>

                  <td className="p-3.5 sm:p-4 text-right sm:text-left">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenClientsModal(rm)}
                      className="text-xs font-semibold cursor-pointer"
                    >
                      Manage Portfolio
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add RM Modal */}
      {addModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setAddModalOpen(false)}
          title="Add New Relationship Manager (RM)"
        >
          <form onSubmit={handleCreateRm} className="space-y-4 text-xs sm:text-sm">
            <p className="text-[var(--muted)] text-xs">
              This creates a dedicated staff account. The RM will be able to log in to the RM portal directly and manage their assigned clients.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Priya"
                  className="w-full p-2.5 bg-white border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Sharma"
                  className="w-full p-2.5 bg-white border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rm.priya@ishtamchat.com"
                className="w-full p-2.5 bg-white border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 bg-white border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full p-2.5 bg-white border border-[var(--border)] rounded-xl text-xs text-[var(--foreground)] focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={submittingAdd}
                onClick={() => setAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submittingAdd}
                className="bg-[var(--primary)] text-white hover:bg-[#5E142E]"
              >
                {submittingAdd ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Create RM Account'
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Manage RM Portfolio Modal */}
      {selectedRm && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRm(null)}
          title={`Portfolio: ${selectedRm.firstName} ${selectedRm.lastName || ''} (${assignedClients.length} Clients)`}
        >
          <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1 text-xs">
            {/* Section 1: Assign New Clients */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5">
                <IconUserPlus className="h-4 w-4 text-[var(--primary)]" />
                Assign More Clients to {selectedRm.firstName}
              </h4>
              <p className="text-[11px] text-[var(--muted)]">
                Search members by name, email, or profile ID to assign them to this RM:
              </p>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted)]" />
                  <input
                    type="text"
                    placeholder="Search unassigned members…"
                    value={assignSearch}
                    onChange={(e) => setAssignSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchUsersToAssign();
                      }
                    }}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-[var(--border)] rounded-lg text-xs"
                  />
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleSearchUsersToAssign}
                  disabled={searchLoading}
                  className="text-xs"
                >
                  {searchLoading ? <IconLoader2 className="h-3.5 w-3.5 animate-spin" /> : 'Find'}
                </Button>
              </div>

              {/* Candidate search results */}
              {candidateUsers.length > 0 && (
                <div className="space-y-1.5 pt-2 max-h-40 overflow-y-auto">
                  {candidateUsers.map((u) => {
                    const isChecked = selectedUserIdsToAssign.has(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => toggleSelectUserToAssign(u.id)}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-rose-50 border-rose-300'
                            : 'bg-white border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-[var(--primary)]"
                          />
                          <div>
                            <span className="font-bold text-stone-900">
                              {u.firstName} {u.lastName || ''}
                            </span>
                            <span className="text-[10px] text-stone-500 ml-1.5">
                              ({u.profileId || u.email})
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 font-medium">
                          {u.subscriptionTier || 'BASIC'}
                        </span>
                      </div>
                    );
                  })}

                  {selectedUserIdsToAssign.size > 0 && (
                    <Button
                      size="sm"
                      onClick={handleAssignSelected}
                      disabled={submittingAssign}
                      className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                    >
                      {submittingAssign ? (
                        <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        `Assign ${selectedUserIdsToAssign.size} Client(s) to ${selectedRm.firstName}`
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Section 2: Current Assigned Clients */}
            <div className="space-y-3">
              <h4 className="font-bold text-stone-900 text-xs">
                Currently Assigned Clients ({assignedClients.length})
              </h4>

              {clientsLoading ? (
                <div className="p-6 text-center text-stone-500">
                  <IconLoader2 className="h-5 w-5 animate-spin mx-auto mb-1 text-[var(--primary)]" />
                  Loading client roster…
                </div>
              ) : assignedClients.length === 0 ? (
                <div className="p-6 text-center rounded-xl bg-stone-50 text-[var(--muted)] border border-dashed border-stone-200">
                  No clients currently assigned to this Relationship Manager.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-xl overflow-hidden bg-white">
                  {assignedClients.map((client) => (
                    <div
                      key={client.id}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                          {client.photos?.[0]?.url ? (
                            <img
                              src={client.photos[0].url}
                              alt="Client"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full grid place-items-center text-stone-400">
                              <IconUsers className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-stone-900">
                              {client.firstName} {client.lastName || ''}
                            </span>
                            <span className="text-[10px] font-mono text-stone-500">
                              {client.profileId || 'N/A'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--muted)]">
                            {client.profile?.city || 'India'} • Stage:{' '}
                            <strong className="text-stone-700">{client.clientStage || 'NEW_LEAD'}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUnassignClient(client.id)}
                          className="text-rose-700 hover:bg-rose-50 border-rose-200 text-[11px] h-7 cursor-pointer"
                        >
                          <IconUserMinus className="mr-1 h-3 w-3" /> Unassign
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--border)]">
              <Button variant="secondary" onClick={() => setSelectedRm(null)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
