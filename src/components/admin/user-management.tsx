'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  IconSearch,
  IconMapPin,
  IconBan,
  IconUserCheck,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconCrown,
  IconAlertCircle,
  IconMail,
  IconPhone,
  IconId,
  IconAlertTriangle,
  IconX,
  IconSparkles,
  IconCheck,
  IconLoader2,
  IconSettings,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/cn';
import { adminService, type AdminPlanItem } from '@/services/admin.service';
import { chatService } from '@/services/chat.service';
import type { AdminUserListItem, AdminUserQueryFilters } from '@/types/admin-user';
import { toast } from '@/lib/toast';
import { ModernSelect, type ModernSelectOption } from '@/components/ui/modern-select';

// ─── Default Plans Fallback ───────────────────────────────────────────────────

const DEFAULT_PLANS: AdminPlanItem[] = [
  {
    id: 'BASIC',
    code: 'BASIC',
    name: '1 Month Chat Permit',
    badge: 'Basic',
    price: 500,
    formattedPrice: '₹500',
    period: 'per month',
    durationDays: 30,
    description: 'Active Premium for 30 days with verified contacts and daily interest quota.',
    features: [
      'Active Premium for 30 days',
      'Send "Interests" only 20 per day',
      'Unlimited messaging with matches',
      'Standard Profile Visibility',
      'Verified Contact Numbers - 20',
    ],
    contactCredits: 20,
    dailyInterestsLimit: 20,
    popular: false,
    isActive: true,
    displayOrder: 1,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'STANDARD',
    code: 'STANDARD',
    name: '3 Months Chat Permit',
    badge: 'Standard',
    price: 1250,
    formattedPrice: '₹1,250',
    period: 'for 90 days',
    durationDays: 90,
    description: 'Our most popular plan. Active matchmaking with verified connections.',
    features: [
      'Active Premium for 90 days',
      'Send "Interests" only 40/ day',
      'Unlimited messaging with matches',
      'Priority profile visibility',
      'Can View/Get Verified Contact Numbers',
    ],
    contactCredits: 60,
    dailyInterestsLimit: 40,
    popular: true,
    isActive: true,
    displayOrder: 2,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'PLUS',
    code: 'PLUS',
    name: '6 Months Permit',
    badge: 'Plus',
    price: 2500,
    formattedPrice: '₹2,500',
    period: 'for 180 days',
    durationDays: 180,
    description: 'Serious about finding a match with extended priority connection time.',
    features: [
      'Active Premium for 180 days',
      'Send "Interests" - Unlimited',
      'Unlimited messaging with matches',
      'High profile visibility',
      'Can View/Get 120 verified Contact Numbers',
    ],
    contactCredits: 120,
    dailyInterestsLimit: 9999,
    popular: false,
    isActive: true,
    displayOrder: 3,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 'ELITE',
    code: 'ELITE',
    name: 'One year Chat permit',
    badge: 'Elite',
    price: 5000,
    formattedPrice: '₹5,000',
    period: 'for one year',
    durationDays: 365,
    description: 'Complete peace of mind with one year of full unlimited access.',
    features: [
      'Active premium for one year',
      'Send interests unlimited',
      'Unlimited chat with matches',
      'High profile visibility.',
      'Can get unlimited contact numbers.',
    ],
    contactCredits: 9999,
    dailyInterestsLimit: 9999,
    popular: false,
    isActive: true,
    displayOrder: 4,
    createdAt: '',
    updatedAt: '',
  },
];

// ─── Assign Plan Modal ────────────────────────────────────────────────────────

interface AssignPlanModalProps {
  user: AdminUserListItem | null;
  isOpen: boolean;
  plans: AdminPlanItem[];
  onClose: () => void;
  onPlanAssigned: (updatedUser: AdminUserListItem) => void;
  isOnline?: boolean;
}

function AssignPlanModal({
  user,
  isOpen,
  plans,
  onClose,
  onPlanAssigned,
  isOnline,
}: AssignPlanModalProps) {
  const activePlans = useMemo(() => {
    const list = plans.length > 0 ? plans.filter((p) => p.isActive) : DEFAULT_PLANS;
    return list.length > 0 ? list : DEFAULT_PLANS;
  }, [plans]);

  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !isOpen) return;

    const currentTier = user.subscription?.tier || user.subscriptionTier;

    const matched = activePlans.find(
      (p) => p.code?.toUpperCase() === currentTier?.toUpperCase() || p.id === currentTier,
    );

    if (matched) {
      setSelectedOption(matched.id);
    } else {
      const popularOrFirst = activePlans.find((p) => p.popular) || activePlans[0];
      setSelectedOption(popularOrFirst?.id || 'BASIC');
    }
  }, [user, isOpen, activePlans]);

  if (!isOpen || !user) return null;

  const displayName =
    user.firstName ??
    user.profile?.firstName ??
    user.email?.split('@')[0] ??
    user.phone ??
    'Unnamed User';

  const isCurrentPaid = user.subscriptionTier === 'PAID' || (user.subscription?.canChat ?? false);
  const currentExpiry = user.subscription?.expiresAt ? new Date(user.subscription.expiresAt) : null;
  const isExpired = currentExpiry ? currentExpiry < new Date() : false;

  const handleApply = async () => {
    setIsSubmitting(true);
    try {
      if (selectedOption === 'REVOKE') {
        const res = await adminService.assignUserPlan(user.id, { action: 'revoke' });
        toast.success(
          'Plan Revoked',
          `${displayName}'s subscription has been reset to Basic / Free.`
        );
        onPlanAssigned(res.user);
        onClose();
      } else {
        const plan = activePlans.find((p) => p.id === selectedOption || p.code === selectedOption);
        const res = await adminService.assignUserPlan(user.id, {
          planId: plan?.id,
          planCode: plan?.code,
          action: 'apply',
        });
        toast.success(
          'Plan Activated',
          `${plan?.name || 'Subscription'} applied to ${displayName} (${plan?.durationDays ?? 30} days validity).`
        );
        onPlanAssigned(res.user);
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to apply subscription plan';
      toast.error('Assignment Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      size="lg"
      title={
        <div className="flex items-center gap-2.5 text-[var(--foreground)] font-bold text-base sm:text-lg">
          <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <IconCrown className="h-4.5 w-4.5" />
          </div>
          <span>Assign Subscription Plan</span>
        </div>
      }
      description={
        <span>
          Manually activate or adjust the chat permit and subscription package for{' '}
          <strong className="text-[var(--foreground)]">{displayName}</strong>.
        </span>
      }
    >
      <div className="space-y-4 pt-2">
        {/* User Current Status Summary Card */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
          <Avatar
            src={user.photos?.[0]?.url ?? ''}
            name={displayName}
            size="md"
            online={isOnline ?? user.isOnline ?? false}
            className="border border-[var(--border)] shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-[var(--foreground)] truncate">{displayName}</span>
              <span className="font-mono text-xs text-[var(--muted)]">({user.profileId ?? user.id.slice(0, 8)})</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs flex-wrap">
              <span className="text-[var(--muted)]">Current Status:</span>
              <Badge tone={isCurrentPaid && !isExpired ? 'accent' : 'default'} size="sm" className="font-semibold">
                {isCurrentPaid && !isExpired ? (
                  <>
                    <IconCrown className="h-3 w-3 inline text-amber-600 mr-1" />
                    {user.subscription?.tier || 'Paid Tier'}
                  </>
                ) : (
                  'Basic / Free'
                )}
              </Badge>
              {currentExpiry && (
                <span className={`text-[11px] font-medium ${isExpired ? 'text-rose-600' : 'text-amber-800'}`}>
                  • {isExpired ? 'Expired' : 'Active until'} {currentExpiry.toLocaleDateString()}
                </span>
              )}
              {user.subscription?.contactCredits !== undefined && user.subscription.contactCredits > 0 && (
                <span className="text-[11px] text-[var(--muted)]">
                  • {user.subscription.contactCredits} credits left
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-strong)]">
            Select Plan to Apply
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[290px] overflow-y-auto pr-1">
            {activePlans.map((p) => {
              const isSelected = selectedOption === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedOption(p.id)}
                  className={cn(
                    'relative rounded-xl border p-3.5 cursor-pointer transition-all flex flex-col justify-between text-left select-none',
                    isSelected
                      ? 'border-[var(--primary)] bg-[var(--primary)]/5 ring-2 ring-[var(--primary)]/20 shadow-xs'
                      : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]/50',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          'h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                          isSelected
                            ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                            : 'border-slate-300 bg-white',
                        )}
                      >
                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="font-bold text-xs text-[var(--foreground)] truncate">{p.name}</span>
                    </div>
                    {p.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                        {p.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 flex items-baseline justify-between text-xs">
                    <span className="font-extrabold text-[var(--foreground)] text-sm">
                      {p.formattedPrice || `₹${p.price}`}
                    </span>
                    <span className="text-[11px] text-[var(--muted)] font-medium">{p.durationDays} Days</span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-[var(--border)]/70 text-[11px] text-[var(--muted)] flex items-center justify-between">
                    <span>{p.contactCredits} Contacts</span>
                    <span>{p.dailyInterestsLimit}/day limit</span>
                  </div>
                </div>
              );
            })}

            {/* Downgrade to Basic Option */}
            <div
              onClick={() => setSelectedOption('REVOKE')}
              className={cn(
                'relative rounded-xl border p-3.5 cursor-pointer transition-all flex flex-col justify-between text-left select-none sm:col-span-2',
                selectedOption === 'REVOKE'
                  ? 'border-rose-400 bg-rose-50/50 ring-2 ring-rose-400/20 shadow-xs'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]/50',
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'h-4 w-4 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                      selectedOption === 'REVOKE'
                        ? 'border-rose-600 bg-rose-600 text-white'
                        : 'border-slate-300 bg-white',
                    )}
                  >
                    {selectedOption === 'REVOKE' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="font-bold text-xs text-rose-700">Downgrade / Reset to Basic (Free)</span>
                </div>
                <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">
                  Revoke Permit
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-[var(--muted)] pl-6 leading-relaxed">
                Cancels active chat permit and contact quotas, returning the member to the standard free tier.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={isSubmitting}
            className={cn(
              'font-bold px-4 flex items-center gap-1.5',
              selectedOption === 'REVOKE'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-gradient-to-r from-[#80132E] to-[#A22749] text-white',
            )}
          >
            {isSubmitting ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                <span>Applying…</span>
              </>
            ) : selectedOption === 'REVOKE' ? (
              <>
                <IconBan className="h-4 w-4" />
                <span>Revoke Subscription</span>
              </>
            ) : (
              <>
                <IconCheck className="h-4 w-4" />
                <span>Apply Plan</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Confirmation Dialog ───────────────────────────────────────────────────────

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  variant,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl p-6 animate-in zoom-in-95 fade-in duration-150">
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`flex-shrink-0 rounded-full p-2 ${variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
              }`}
          >
            <IconAlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="confirm-dialog-title" className="font-bold text-[var(--foreground)] text-base leading-snug">
              {title}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">{message}</p>
          </div>
          <button
            onClick={onCancel}
            aria-label="Dismiss dialog"
            className="ml-auto flex-shrink-0 rounded-lg p-1 hover:bg-[var(--surface-muted)] text-[var(--muted)] transition-colors"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            className={
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700 text-white border-none'
                : 'bg-amber-600 hover:bg-amber-700 text-white border-none'
            }
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface PendingConfirm {
  user: AdminUserListItem;
  action: 'block' | 'unblock';
}

const PAGE_SIZE = 15;

const PLAN_FILTER_OPTIONS: ModernSelectOption[] = [
  {
    value: 'ALL',
    label: 'All Plans',
    icon: <span className="h-2 w-2 rounded-full bg-slate-400 inline-block" />,
  },
  {
    value: 'PAID',
    label: 'Paid / Premium',
    icon: <IconCrown className="h-3.5 w-3.5 text-amber-500 shrink-0" />,
  },
  {
    value: 'BASIC',
    label: 'Basic / Free',
    icon: <span className="h-2 w-2 rounded-full bg-slate-400 inline-block" />,
  },
];

const STATUS_FILTER_OPTIONS: ModernSelectOption[] = [
  {
    value: 'ALL',
    label: 'All Statuses',
    icon: <span className="h-2 w-2 rounded-full bg-slate-400 inline-block" />,
  },
  {
    value: 'ACTIVE',
    label: 'Active',
    icon: <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block shadow-[0_0_6px_rgba(16,185,129,0.5)]" />,
  },
  {
    value: 'BLOCKED',
    label: 'Blocked',
    icon: <span className="h-2 w-2 rounded-full bg-rose-500 inline-block shadow-[0_0_6px_rgba(244,63,94,0.5)]" />,
  },
  {
    value: 'SUSPENDED',
    label: 'Suspended',
    icon: <span className="h-2 w-2 rounded-full bg-amber-500 inline-block shadow-[0_0_6px_rgba(245,158,11,0.5)]" />,
  },
  {
    value: 'DEACTIVATED',
    label: 'Deactivated',
    icon: <span className="h-2 w-2 rounded-full bg-slate-400 inline-block" />,
  },
  {
    value: 'DELETED',
    label: 'Deleted',
    icon: <span className="h-2 w-2 rounded-full bg-rose-600 inline-block" />,
  },
];

function renderUserStatusBadge(u: AdminUserListItem) {
  if (u.status === 'DELETED' || u.deletedAt) {
    return (
      <Badge tone="default" className="bg-rose-100 text-rose-800 border-rose-200 text-xs font-semibold inline-flex items-center gap-1.5 px-2.5 py-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 inline-block" />
        Deleted
      </Badge>
    );
  }
  if (u.isBanned || u.status === 'BLOCKED') {
    return (
      <Badge tone="default" className="bg-red-100 text-red-800 border-red-200 text-xs font-semibold inline-flex items-center gap-1.5 px-2.5 py-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 inline-block" />
        Blocked
      </Badge>
    );
  }
  if (u.status === 'SUSPENDED') {
    return (
      <Badge tone="default" className="bg-amber-100 text-amber-800 border-amber-200 text-xs font-semibold inline-flex items-center gap-1.5 px-2.5 py-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
        Suspended
      </Badge>
    );
  }
  if (u.status === 'DEACTIVATED' || u.deactivatedAt) {
    return (
      <Badge tone="default" className="bg-slate-100 text-slate-700 border-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 px-2.5 py-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400 inline-block" />
        Deactivated
      </Badge>
    );
  }
  return (
    <Badge tone="default" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-semibold inline-flex items-center gap-1.5 px-2.5 py-0.5">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
      Active
    </Badge>
  );
}

export function UserManagement() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [plan, setPlan] = useState<'ALL' | 'BASIC' | 'PAID'>('ALL');
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'DEACTIVATED' | 'DELETED'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Action state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(null);

  // Real-time live presence tracking
  const [livePresence, setLivePresence] = useState<Record<string, boolean>>({});

  // Subscribe to live WebSocket presence updates
  useEffect(() => {
    chatService.connect();
    const cleanup = chatService.onPresence((data) => {
      if (data?.userId) {
        setLivePresence((prev) => ({
          ...prev,
          [data.userId]: Boolean(data.isOnline),
        }));
      }
    });
    return cleanup;
  }, []);

  // Manual Subscription Plan Assignment state
  const [availablePlans, setAvailablePlans] = useState<AdminPlanItem[]>([]);
  const [selectedUserForPlan, setSelectedUserForPlan] = useState<AdminUserListItem | null>(null);

  // Real-time count of active online users in current list
  const onlineCount = useMemo(() => {
    return users.filter((u) => livePresence[u.id] ?? u.isOnline).length;
  }, [users, livePresence]);

  // Load plans on mount so modal is instant
  useEffect(() => {
    let isMounted = true;
    async function loadPlans() {
      try {
        const data = await adminService.getPlans();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setAvailablePlans(data);
        }
      } catch {
        // Fallback to DEFAULT_PLANS
      }
    }
    loadPlans();
    return () => {
      isMounted = false;
    };
  }, []);

  const openAssignPlanModal = (user: AdminUserListItem) => {
    setSelectedUserForPlan(user);
  };

  const handlePlanAssigned = (updatedUser: AdminUserListItem) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)),
    );
  };

  // Debounce refs for text inputs (avoid fetching on every keystroke)
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locationRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived state
  const hasActiveFilters = useMemo(
    () => Boolean(search || location || plan !== 'ALL' || status !== 'ALL'),
    [search, location, plan, status],
  );

  // ── Data Fetching ────────────────────────────────────────────────────────────

  const fetchUsers = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const filters: AdminUserQueryFilters = {
          page,
          limit: PAGE_SIZE,
          search: search.trim() || undefined,
          location: location.trim() || undefined,
          plan,
          status,
        };
        const res = await adminService.getUsers(filters, signal);
        if (signal?.aborted) return;
        setUsers(res.data ?? []);
        setTotalPages(res.meta?.totalPages ?? 1);
        setTotalCount(res.meta?.total ?? 0);

        if (Array.isArray(res.data)) {
          const initialPresence: Record<string, boolean> = {};
          res.data.forEach((u) => {
            if (typeof u.isOnline === 'boolean') {
              initialPresence[u.id] = u.isOnline;
            }
          });
          setLivePresence((prev) => ({ ...initialPresence, ...prev }));
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Failed to fetch users';
        setError(message);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [page, search, location, plan, status],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller.signal);
    return () => controller.abort();
  }, [fetchUsers]);

  // ── Block / Unblock ──────────────────────────────────────────────────────────

  const confirmBlock = (user: AdminUserListItem) => {
    setPendingConfirm({ user, action: user.isBanned ? 'unblock' : 'block' });
  };

  const handleConfirmAction = async () => {
    if (!pendingConfirm) return;
    const { user, action } = pendingConfirm;
    setPendingConfirm(null);
    setActionLoadingId(user.id);

    try {
      if (action === 'unblock') {
        await adminService.unbanUser(user.id);
        toast.success('User Unblocked', `${user.firstName ?? user.email ?? 'User'} can now access the platform.`);
      } else {
        await adminService.banUser(user.id);
        toast.warning('User Blocked', `${user.firstName ?? user.email ?? 'User'} has been restricted.`);
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isBanned: action === 'block' } : u)),
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : `Could not ${action} user`;
      toast.error('Action Failed', message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Toggle Plan Tier ─────────────────────────────────────────────────────────

  const handleToggleTier = async (user: AdminUserListItem) => {
    const nextTier: 'BASIC' | 'PAID' = user.subscriptionTier === 'PAID' ? 'BASIC' : 'PAID';
    setActionLoadingId(user.id);
    try {
      await adminService.updateSubscriptionTier(user.id, nextTier);
      toast.success('Plan Updated', `Plan changed to ${nextTier} for ${user.firstName ?? user.email}.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, subscriptionTier: nextTier } : u)),
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error updating subscription tier';
      toast.error('Failed to update plan', message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // ── Filters ──────────────────────────────────────────────────────────────────

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => setPage(1), 400);
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    if (locationRef.current) clearTimeout(locationRef.current);
    locationRef.current = setTimeout(() => setPage(1), 400);
  };

  const resetFilters = () => {
    setSearch('');
    setLocation('');
    setPlan('ALL');
    setStatus('ALL');
    setPage(1);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Accessible confirm dialog — no blocking window.confirm */}
      <ConfirmDialog
        isOpen={Boolean(pendingConfirm)}
        title={pendingConfirm?.action === 'block' ? 'Block User?' : 'Unblock User?'}
        message={
          pendingConfirm?.action === 'block'
            ? `${pendingConfirm?.user.firstName ?? pendingConfirm?.user.email ?? 'This user'} will lose access to the platform.`
            : `${pendingConfirm?.user.firstName ?? pendingConfirm?.user.email ?? 'This user'} will regain full access.`
        }
        confirmLabel={pendingConfirm?.action === 'block' ? 'Block User' : 'Unblock User'}
        variant={pendingConfirm?.action === 'block' ? 'danger' : 'warning'}
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingConfirm(null)}
      />

      {/* Manual Subscription Plan Assignment Modal */}
      <AssignPlanModal
        user={selectedUserForPlan}
        isOpen={Boolean(selectedUserForPlan)}
        plans={availablePlans}
        onClose={() => setSelectedUserForPlan(null)}
        onPlanAssigned={handlePlanAssigned}
        isOnline={selectedUserForPlan ? (livePresence[selectedUserForPlan.id] ?? selectedUserForPlan.isOnline ?? false) : false}
      />

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">User Management</h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Browse registered profiles, filter by location or plan, and manage access restrictions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onlineCount > 0 && (
              <Badge tone="default" size="md" className="px-2.5 py-1 font-semibold text-xs bg-emerald-50 text-emerald-800 border-emerald-200/80 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{onlineCount} Online</span>
              </Badge>
            )}
            <Badge tone="default" size="md" className="px-3 py-1 font-semibold text-xs">
              {totalCount} Total
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUsers()}
              disabled={loading}
              aria-label="Refresh user list"
              className="flex items-center gap-1.5"
            >
              <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              Refresh
            </Button>
          </div>
        </div>

        {/* ── Filters ── */}
        <Card className="relative z-10 p-4 sm:p-5 border border-[var(--border)] shadow-xs bg-[var(--surface)]">
          <fieldset>
            <legend className="sr-only">Filter users</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Search */}
              <div className="relative">
                <label htmlFor="um-search" className="sr-only">
                  Search users
                </label>
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" aria-hidden="true" />
                <input
                  id="um-search"
                  type="search"
                  placeholder="Search name, email, ID…"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  maxLength={100}
                  className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              {/* Location */}
              <div className="relative">
                <label htmlFor="um-location" className="sr-only">
                  Filter by location
                </label>
                <IconMapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)]" aria-hidden="true" />
                <input
                  id="um-location"
                  type="search"
                  placeholder="City, state, country…"
                  value={location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  maxLength={100}
                  className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--background)] outline-none focus:border-[var(--primary)] transition-colors"
                />
              </div>

              {/* Plan */}
              <div>
                <ModernSelect
                  value={plan}
                  onChange={(val) => {
                    setPlan(val as 'ALL' | 'BASIC' | 'PAID');
                    setPage(1);
                  }}
                  options={PLAN_FILTER_OPTIONS}
                  size="sm"
                  ariaLabel="Filter by plan"
                  triggerClassName="border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/50 text-xs sm:text-sm font-medium"
                />
              </div>

              {/* Status */}
              <div>
                <ModernSelect
                  value={status}
                  onChange={(val) => {
                    setStatus(val as 'ALL' | 'ACTIVE' | 'BLOCKED' | 'SUSPENDED');
                    setPage(1);
                  }}
                  options={STATUS_FILTER_OPTIONS}
                  size="sm"
                  ariaLabel="Filter by status"
                  triggerClassName="border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/50 text-xs sm:text-sm font-medium"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                <span className="text-[var(--muted)]">Filters active</span>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-[var(--primary)] font-semibold hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </fieldset>
        </Card>

        {/* ── Table ── */}
        <Card className="border border-[var(--border)] overflow-hidden shadow-xs bg-[var(--surface)]">
          {error ? (
            <div className="p-8 text-center space-y-3" role="alert">
              <IconAlertCircle className="h-10 w-10 text-red-500 mx-auto" aria-hidden="true" />
              <h3 className="text-sm font-bold text-[var(--foreground)]">Error loading users</h3>
              <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">{error}</p>
              <Button size="sm" variant="outline" onClick={() => fetchUsers()}>
                Try Again
              </Button>
            </div>
          ) : loading ? (
            <div className="p-12 text-center space-y-3" aria-live="polite" aria-busy="true">
              <div
                className="h-7 w-7 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"
                role="status"
                aria-label="Loading users"
              />
              <p className="text-xs text-[var(--muted)]">Loading users…</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <IconSearch className="h-10 w-10 text-[var(--muted)] mx-auto opacity-50" aria-hidden="true" />
              <h3 className="text-base font-bold text-[var(--foreground)]">No users found</h3>
              <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                No accounts match the applied search and filter criteria.
              </p>
              {hasActiveFilters && (
                <Button size="sm" variant="outline" onClick={resetFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* ── Mobile Card View (< md) ── */}
              <div className="block md:hidden divide-y divide-[var(--border)]">
                {users.map((u) => {
                  const displayName =
                    u.firstName ??
                    u.profile?.firstName ??
                    u.email?.split('@')[0] ??
                    u.phone ??
                    'Unnamed User';
                  const locationText =
                    [u.profile?.city, u.profile?.state, u.profile?.country]
                      .filter(Boolean)
                      .join(', ') || 'Not specified';
                  const isPaid = u.subscriptionTier === 'PAID';
                  const isBlocked = u.isBanned;
                  const isActing = actionLoadingId === u.id;
                  const isOnline = livePresence[u.id] ?? u.isOnline ?? false;

                  return (
                    <div
                      key={u.id}
                      className={`p-4 space-y-3 transition-colors ${isBlocked ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                        }`}
                    >
                      {/* Header: Avatar, Name, Role, Status */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar
                            src={u.photos?.[0]?.url ?? ''}
                            name={displayName}
                            size="md"
                            online={isOnline}
                            className="border border-[var(--border)] shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm text-[var(--foreground)] truncate">
                                {displayName}
                              </span>
                              {isOnline && (
                                <span
                                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full px-1.5 py-0.2"
                                  title="User is currently connected & active"
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Online
                                </span>
                              )}
                              {u.role === 'ADMIN' && (
                                <Badge tone="accent" size="sm" className="text-[10px] py-0 px-1 font-semibold">
                                  Admin
                                </Badge>
                              )}
                              {u.role === 'RM' && (
                                <Badge tone="default" size="sm" className="bg-amber-100 text-amber-800 text-[10px] py-0 px-1 font-semibold">
                                  RM
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-[var(--muted)] mt-0.5">
                              <IconId className="h-3 w-3 shrink-0" aria-hidden="true" />
                              <span className="font-mono">{u.profileId ?? u.id.slice(0, 8)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0">
                          {renderUserStatusBadge(u)}
                        </div>
                      </div>

                      {/* Info Container */}
                      <div className="space-y-2.5 text-xs bg-[var(--surface-muted)]/70 rounded-xl p-3 border border-[var(--border)]">
                        {/* Contact Info */}
                        <div className="space-y-1">
                          {u.email && (
                            <div className="flex items-center gap-1.5 text-[var(--foreground)] truncate">
                              <IconMail className="h-3.5 w-3.5 text-[var(--muted)] shrink-0" />
                              <span className="truncate">{u.email}</span>
                            </div>
                          )}
                          {u.phone && (
                            <div className="flex items-center gap-1.5 text-[var(--muted-strong)]">
                              <IconPhone className="h-3.5 w-3.5 text-[var(--muted)] shrink-0" />
                              <span>{u.phone}</span>
                            </div>
                          )}
                          {!u.email && !u.phone && (
                            <span className="text-[var(--muted)] italic text-[11px]">No contact details</span>
                          )}
                          <div className="flex items-center gap-1.5 text-[var(--muted)] pt-0.5 truncate">
                            <IconMapPin className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" />
                            <span className="truncate">{locationText}</span>
                          </div>
                        </div>

                        {/* Plan Status Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
                          <span className="text-[var(--muted-strong)] font-semibold flex items-center gap-1.5">
                            <IconCrown className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            Plan Status:
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openAssignPlanModal(u)}
                              disabled={isActing}
                              className="group inline-flex items-center gap-1 focus:outline-none"
                              title="Click to manage subscription plan"
                            >
                              <Badge
                                tone={isPaid ? 'accent' : 'default'}
                                className={`cursor-pointer transition-all hover:scale-105 ${isPaid
                                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                                    : 'bg-slate-100 text-slate-700 font-medium'
                                  }`}
                              >
                                {isPaid && <IconCrown className="h-3 w-3 text-amber-600 inline mr-1" />}
                                {u.subscription?.tier ? `${u.subscription.tier} Plan` : isPaid ? 'Paid Tier' : 'Basic Tier'}
                              </Badge>
                            </button>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => openAssignPlanModal(u)}
                              disabled={isActing}
                              className="h-6 px-1.5 text-[11px] font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/10"
                            >
                              Change
                            </Button>
                          </div>
                        </div>

                        {/* Active Expiry details */}
                        {u.subscription?.expiresAt && (
                          <div className="text-[11px] text-amber-900/90 font-medium flex items-center justify-between pt-0.5">
                            <span>Active permit:</span>
                            <span>Expires {new Date(u.subscription.expiresAt).toLocaleDateString()}</span>
                          </div>
                        )}

                        {/* Reason / Notes if Deactivated or Deleted */}
                        {u.deletionReason && (
                          <div className="pt-1.5 border-t border-[var(--border)] text-[11px] text-[var(--muted)]">
                            <span className="font-semibold">Reason:</span> &ldquo;{u.deletionReason}&rdquo;
                          </div>
                        )}
                      </div>

                      {/* Mobile Actions: Assign Plan & Block / Unblock */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isActing}
                          onClick={() => openAssignPlanModal(u)}
                          className="w-full text-xs h-8 px-2.5 flex items-center justify-center gap-1.5 font-semibold text-amber-800 border-amber-300 hover:bg-amber-50"
                        >
                          <IconCrown className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                          <span>Assign Plan</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isActing}
                          onClick={() => confirmBlock(u)}
                          className={`w-full text-xs h-8 px-2.5 flex items-center justify-center gap-1.5 font-semibold transition-colors ${isBlocked
                              ? 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                              : 'text-red-600 border-red-200 hover:bg-red-50'
                            }`}
                        >
                          {isActing ? (
                            <span className="h-3.5 w-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : isBlocked ? (
                            <IconUserCheck className="h-3.5 w-3.5" />
                          ) : (
                            <IconBan className="h-3.5 w-3.5" />
                          )}
                          <span>{isBlocked ? 'Unblock' : 'Block User'}</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Desktop Table View (>= md) ── */}
              <div className="hidden md:block overflow-x-auto" role="region" aria-label="User list">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[var(--muted-strong)] font-semibold">
                      <th scope="col" className="p-3.5 sm:p-4">User / Profile</th>
                      <th scope="col" className="p-3.5 sm:p-4">Contact</th>
                      <th scope="col" className="p-3.5 sm:p-4">Location</th>
                      <th scope="col" className="p-3.5 sm:p-4">Plan</th>
                      <th scope="col" className="p-3.5 sm:p-4">Status</th>
                      <th scope="col" className="p-3.5 sm:p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {users.map((u) => {
                      const displayName =
                        u.firstName ??
                        u.profile?.firstName ??
                        u.email?.split('@')[0] ??
                        u.phone ??
                        'Unnamed User';
                      const locationText =
                        [u.profile?.city, u.profile?.state, u.profile?.country]
                          .filter(Boolean)
                          .join(', ') || 'Not specified';
                      const isPaid = u.subscriptionTier === 'PAID';
                      const isBlocked = u.isBanned;
                      const isActing = actionLoadingId === u.id;
                      const isOnline = livePresence[u.id] ?? u.isOnline ?? false;

                      return (
                        <tr
                          key={u.id}
                          className={`hover:bg-[var(--surface-muted)]/50 transition-colors ${isBlocked ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                            }`}
                        >
                          {/* Name & Avatar */}
                          <td className="p-3.5 sm:p-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={u.photos?.[0]?.url ?? ''}
                                name={displayName}
                                size="md"
                                online={isOnline}
                                className="border border-[var(--border)] shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-[var(--foreground)] truncate">
                                    {displayName}
                                  </span>
                                  {isOnline && (
                                    <span
                                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full px-1.5 py-0.2"
                                      title="User is currently connected & active"
                                    >
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      Online
                                    </span>
                                  )}
                                  {u.role === 'ADMIN' && (
                                    <Badge tone="accent" size="sm" className="text-[10px] py-0 px-1">
                                      Admin
                                    </Badge>
                                  )}
                                  {u.role === 'RM' && (
                                    <Badge tone="default" size="sm" className="bg-amber-100 text-amber-800 text-[10px] py-0 px-1">
                                      RM
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-[var(--muted)] mt-0.5">
                                  <IconId className="h-3 w-3 shrink-0" aria-hidden="true" />
                                  <span>{u.profileId ?? u.id.slice(0, 8)}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="p-3.5 sm:p-4">
                            <div className="space-y-0.5 text-xs">
                              {u.email && (
                                <div className="flex items-center gap-1 text-[var(--foreground)]">
                                  <IconMail className="h-3 w-3 text-[var(--muted)] shrink-0" aria-hidden="true" />
                                  <span className="truncate max-w-[180px]">{u.email}</span>
                                </div>
                              )}
                              {u.phone && (
                                <div className="flex items-center gap-1 text-[var(--muted-strong)]">
                                  <IconPhone className="h-3 w-3 text-[var(--muted)] shrink-0" aria-hidden="true" />
                                  <span>{u.phone}</span>
                                </div>
                              )}
                              {!u.email && !u.phone && (
                                <span className="text-[var(--muted)] italic">No contact info</span>
                              )}
                            </div>
                          </td>

                          {/* Location */}
                          <td className="p-3.5 sm:p-4 text-xs">
                            <div className="flex items-center gap-1.5 text-[var(--foreground)]">
                              <IconMapPin className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" aria-hidden="true" />
                              <span className="truncate max-w-[160px]">{locationText}</span>
                            </div>
                          </td>

                          {/* Plan management */}
                          <td className="p-3.5 sm:p-4">
                            <div className="flex flex-col gap-0.5">
                              <button
                                type="button"
                                onClick={() => openAssignPlanModal(u)}
                                disabled={isActing}
                                aria-label={`Manage plan for ${displayName} — currently ${isPaid ? (u.subscription?.tier || 'Paid') : 'Basic'}`}
                                title="Click to manage subscription plan"
                                className="group inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded self-start"
                              >
                                <Badge
                                  tone={isPaid ? 'accent' : 'default'}
                                  className={`cursor-pointer transition-all group-hover:scale-105 ${isPaid
                                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-semibold'
                                      : 'bg-slate-100 text-slate-700 font-medium'
                                    }`}
                                >
                                  {isPaid && <IconCrown className="h-3 w-3 text-amber-600 inline mr-1" aria-hidden="true" />}
                                  {isPaid ? (u.subscription?.tier || 'Paid Tier') : 'Basic'}
                                </Badge>
                              </button>
                              {isPaid && u.subscription?.expiresAt && (
                                <span className="text-[10px] text-[var(--muted-strong)]">
                                  Exp: {new Date(u.subscription.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status (Read-Only) */}
                          <td className="p-3.5 sm:p-4">
                            <div className="space-y-0.5">
                              {renderUserStatusBadge(u)}
                              {u.deletionReason && (
                                <p className="text-[10px] text-rose-700/80 truncate max-w-[130px]" title={u.deletionReason}>
                                  {u.deletionReason}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Actions: Plan & Block / Unblock */}
                          <td className="p-3.5 sm:p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isActing}
                                onClick={() => openAssignPlanModal(u)}
                                aria-label={`Assign plan for ${displayName}`}
                                className="text-xs h-8 px-2.5 flex items-center gap-1 font-medium border-amber-200 text-amber-800 hover:bg-amber-50"
                              >
                                <IconCrown className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
                                Plan
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isActing}
                                onClick={() => confirmBlock(u)}
                                aria-label={isBlocked ? `Unblock ${displayName}` : `Block ${displayName}`}
                                className={`text-xs h-8 px-2.5 flex items-center gap-1 font-medium transition-colors ${isBlocked
                                    ? 'text-emerald-700 hover:text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                                    : 'text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50'
                                  }`}
                              >
                                {isActing ? (
                                  <span
                                    className="h-3.5 w-3.5 border border-current border-t-transparent rounded-full animate-spin"
                                    aria-hidden="true"
                                  />
                                ) : isBlocked ? (
                                  <IconUserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                                ) : (
                                  <IconBan className="h-3.5 w-3.5" aria-hidden="true" />
                                )}
                                {isBlocked ? 'Unblock' : 'Block'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <nav
              aria-label="User list pagination"
              className="p-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted-strong)]"
            >
              <span>
                Page {page} of {totalPages} ({totalCount} users)
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="h-8 w-8 p-0"
                >
                  <IconChevronLeft className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                  className="h-8 w-8 p-0"
                >
                  <IconChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </nav>
          )}
        </Card>
      </div>
    </>
  );
}
