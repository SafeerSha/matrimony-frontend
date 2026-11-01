'use client';

import React, { useState, useEffect } from 'react';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconCreditCard,
  IconStar,
  IconCrown,
  IconLoader2,
  IconRefresh,
  IconAlertCircle,
  IconShieldCheck,
  IconFlame,
  IconPhone,
  IconHeart,
  IconSparkles,
  IconChevronDown,
  IconPower,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModernSelect, type ModernSelectOption } from '@/components/ui/modern-select';
import { Modal } from '@/components/ui/modal';
import { adminService, type AdminPlanItem, type PlanFormInput } from '@/services/admin.service';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/cn';

const PLAN_TEMPLATES = [
  {
    label: '1 Month (Basic)',
    name: '1 Month Permit',
    code: 'BASIC',
    price: 500,
    period: 'per month',
    durationDays: 30,
    badge: 'Basic',
    contactCredits: 10,
    dailyInterestsLimit: 25,
    popular: false,
    description: 'Ideal for trying out the platform and exploring matches.',
    features: [
      'Active Premium for 30 days',
      'Send & accept chat requests',
      'Unlimited messaging with matches',
      'Standard profile visibility',
    ],
  },
  {
    label: '3 Months (Standard / Popular)',
    name: '3 Months Permit',
    code: 'STANDARD',
    price: 1250,
    period: 'for 90 days',
    durationDays: 90,
    badge: 'Standard',
    contactCredits: 30,
    dailyInterestsLimit: 50,
    popular: true,
    description: 'Our most popular plan. Best value for active matchmaking.',
    features: [
      'Active Premium for 90 days',
      'Send & accept chat requests',
      'Unlimited messaging with matches',
      'Priority profile visibility',
    ],
  },
  {
    label: '6 Months (Plus)',
    name: '6 Months Permit',
    code: 'PLUS',
    price: 2500,
    period: 'for 180 days',
    durationDays: 180,
    badge: 'Plus',
    contactCredits: 75,
    dailyInterestsLimit: 100,
    popular: false,
    description: 'Serious about finding a match with extended connection time.',
    features: [
      'Active Premium for 180 days',
      'Send & accept chat requests',
      'Unlimited messaging with matches',
      'Priority profile visibility',
    ],
  },
  {
    label: '1 Year (Elite)',
    name: '1 Year Permit',
    code: 'ELITE',
    price: 5000,
    period: 'for 365 days',
    durationDays: 365,
    badge: 'Elite',
    contactCredits: 200,
    dailyInterestsLimit: 200,
    popular: false,
    description: 'Complete peace of mind with 365 days of full unlimited access.',
    features: [
      'Active Premium for 365 days',
      'Send & accept chat requests',
      'Unlimited messaging with matches',
      'Highest priority profile visibility',
    ],
  },
];

const PERIOD_SELECT_OPTIONS: ModernSelectOption[] = [
  { label: 'per month (1 Month)', value: 'per month', description: 'Standard 30 days duration' },
  { label: 'for 30 days', value: 'for 30 days' },
  { label: 'for 90 days (Quarterly)', value: 'for 90 days', description: 'Quarterly active matchmaking' },
  { label: 'quarterly', value: 'quarterly' },
  { label: 'for 180 days (Half-Yearly)', value: 'for 180 days', description: 'Extended 6 months duration' },
  { label: 'half-yearly', value: 'half-yearly' },
  { label: 'for 365 days (1 Year)', value: 'for 365 days', description: 'Full annual 365 days access' },
  { label: 'annual', value: 'annual' },
  { label: 'per year', value: 'per year' },
  { label: 'for 730 days (2 Years)', value: 'for 730 days' },
  { label: 'lifetime', value: 'lifetime' },
  { label: 'Custom label...', value: '__custom__', description: 'Type custom billing period' },
];

const DURATION_SELECT_OPTIONS: ModernSelectOption[] = [
  { label: '30 Days (1 Month)', value: '30', description: '1 calendar month' },
  { label: '60 Days (2 Months)', value: '60', description: '2 calendar months' },
  { label: '90 Days (3 Months / Quarter)', value: '90', description: '1 matrimonial quarter' },
  { label: '180 Days (6 Months / Half-Year)', value: '180', description: 'Half-yearly plan' },
  { label: '365 Days (1 Year / Annual)', value: '365', description: 'Full 12-month access' },
  { label: '730 Days (2 Years)', value: '730', description: '2 full years' },
  { label: 'Custom Days...', value: '__custom__', description: 'Enter specific number of days' },
];

const BADGE_SELECT_OPTIONS: ModernSelectOption[] = [
  { label: 'None (No Badge)', value: '' },
  { label: 'Basic', value: 'Basic' },
  { label: 'Standard', value: 'Standard' },
  { label: 'Plus', value: 'Plus' },
  { label: 'Elite', value: 'Elite' },
  { label: 'Popular', value: 'Popular' },
  { label: 'Best Value', value: 'Best Value' },
  { label: 'Recommended', value: 'Recommended' },
  { label: 'VIP', value: 'VIP' },
  { label: 'Save 20%', value: 'Save 20%' },
  { label: 'Save 40%', value: 'Save 40%' },
  { label: 'Custom Tag...', value: '__custom__', description: 'Type custom badge tag' },
];

const PERIOD_OPTIONS = [
  { label: 'per month (1 Month)', value: 'per month', defaultDays: 30 },
  { label: 'for 30 days', value: 'for 30 days', defaultDays: 30 },
  { label: 'for 90 days (Quarterly)', value: 'for 90 days', defaultDays: 90 },
  { label: 'quarterly', value: 'quarterly', defaultDays: 90 },
  { label: 'for 180 days (Half-Yearly)', value: 'for 180 days', defaultDays: 180 },
  { label: 'half-yearly', value: 'half-yearly', defaultDays: 180 },
  { label: 'for 365 days (1 Year)', value: 'for 365 days', defaultDays: 365 },
  { label: 'annual', value: 'annual', defaultDays: 365 },
  { label: 'per year', value: 'per year', defaultDays: 365 },
  { label: 'for 730 days (2 Years)', value: 'for 730 days', defaultDays: 730 },
  { label: 'lifetime', value: 'lifetime', defaultDays: 3650 },
];

const DURATION_OPTIONS = [
  { label: '30 Days (1 Month)', value: 30, period: 'per month' },
  { label: '60 Days (2 Months)', value: 60, period: 'for 60 days' },
  { label: '90 Days (3 Months / Quarter)', value: 90, period: 'for 90 days' },
  { label: '180 Days (6 Months / Half-Year)', value: 180, period: 'for 180 days' },
  { label: '365 Days (1 Year / Annual)', value: 365, period: 'for 365 days' },
  { label: '730 Days (2 Years)', value: 730, period: 'for 730 days' },
];

const BADGE_OPTIONS = [
  { label: 'None (No Badge)', value: '' },
  { label: 'Basic', value: 'Basic' },
  { label: 'Standard', value: 'Standard' },
  { label: 'Plus', value: 'Plus' },
  { label: 'Elite', value: 'Elite' },
  { label: 'Popular', value: 'Popular' },
  { label: 'Best Value', value: 'Best Value' },
  { label: 'Recommended', value: 'Recommended' },
  { label: 'VIP', value: 'VIP' },
  { label: 'Save 20%', value: 'Save 20%' },
  { label: 'Save 40%', value: 'Save 40%' },
];

const PRICE_PRESETS = [500, 1000, 1250, 1500, 2000, 2500, 3500, 5000, 9999];
const CONTACT_PRESETS = [10, 25, 30, 50, 75, 100, 150, 200];
const INTEREST_PRESETS = [15, 25, 50, 75, 100, 150, 200];
const DESCRIPTION_PRESETS = [
  'Ideal for trying out the platform and exploring matches.',
  'Our most popular plan. Best value for active matchmaking.',
  'Serious about finding a match with extended connection time.',
  'Complete peace of mind with 365 days of full unlimited access.',
  'VIP concierge access with personalized matchmaker support.',
];

const SUGGESTED_FEATURES = [
  'Active Premium full access',
  'Send & accept chat requests',
  'Unlimited messaging with matches',
  'Standard profile visibility',
  'Priority profile visibility',
  'Highest priority profile visibility',
  'Dedicated Relationship Manager',
  'Verified contact number views',
];

export function PlanManagement() {
  const [plans, setPlans] = useState<AdminPlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminPlanItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deletingPlan, setDeletingPlan] = useState<AdminPlanItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<PlanFormInput>({
    name: '',
    code: '',
    badge: '',
    price: 500,
    period: 'per month',
    durationDays: 30,
    description: '',
    features: [],
    contactCredits: 10,
    dailyInterestsLimit: 25,
    popular: false,
    isActive: true,
    displayOrder: 1,
  });

  const [featureInput, setFeatureInput] = useState('');

  const loadPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getPlans();
      setPlans(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load plans:', err);
      setError(err?.message || 'Failed to load plans from server.');
      toast.error('Error', err?.message || 'Failed to load plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    const nextOrder = plans.length > 0 ? Math.max(...plans.map((p) => p.displayOrder || 0)) + 1 : 1;
    setFormData({
      name: '',
      code: '',
      badge: '',
      price: 999,
      period: 'per month',
      durationDays: 30,
      description: '',
      features: [
        'Active Premium full access',
        'Send & accept chat requests',
        'Unlimited messaging with matches',
      ],
      contactCredits: 15,
      dailyInterestsLimit: 30,
      popular: false,
      isActive: true,
      displayOrder: nextOrder,
    });
    setFeatureInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (plan: AdminPlanItem) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      code: plan.code,
      badge: plan.badge || '',
      price: plan.price,
      period: plan.period,
      durationDays: plan.durationDays,
      description: plan.description || '',
      features: Array.isArray(plan.features) ? [...plan.features] : [],
      contactCredits: plan.contactCredits,
      dailyInterestsLimit: plan.dailyInterestsLimit,
      popular: Boolean(plan.popular),
      isActive: Boolean(plan.isActive),
      displayOrder: plan.displayOrder ?? 1,
    });
    setFeatureInput('');
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed) return;
    if (formData.features?.includes(trimmed)) {
      toast.info('Feature already added', 'This feature bullet is already in the list.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      features: [...(prev.features || []), trimmed],
    }));
    setFeatureInput('');
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index),
    }));
  };

  const handleToggleActive = async (plan: AdminPlanItem) => {
    try {
      const updated = await adminService.togglePlanActive(plan.id);
      setPlans((prev) =>
        prev.map((p) =>
          p.id === plan.id
            ? {
                ...p,
                isActive: updated.isActive,
                // Automatically unset popular if plan is deactivated
                popular: updated.isActive ? p.popular : false,
              }
            : p
        )
      );
      toast.success(
        updated.isActive ? 'Plan Published' : 'Plan Unpublished',
        `"${plan.name}" is now ${updated.isActive ? 'live and visible to members' : 'hidden from public listing'}.`
      );
    } catch (err: any) {
      toast.error('Action Failed', err?.message || 'Could not toggle plan status.');
    }
  };

  const handleTogglePopular = async (plan: AdminPlanItem) => {
    if (!plan.isActive && !plan.popular) {
      toast.warning(
        'Cannot feature hidden plan',
        'Please publish this plan (make it Live) before setting it as Most Popular.'
      );
      return;
    }

    const willBePopular = !plan.popular;
    // Enforce invariant: only 1 popular plan at a time across all active plans
    setPlans((prev) =>
      prev.map((p) => ({
        ...p,
        popular: p.id === plan.id ? willBePopular : false,
      }))
    );

    try {
      await adminService.togglePlanPopular(plan.id);
      toast.success(
        willBePopular ? 'Featured Plan Set' : 'Popular Status Removed',
        willBePopular
          ? `"${plan.name}" is now the single featured Most Popular plan on the public website.`
          : `"${plan.name}" is no longer marked as popular.`
      );
    } catch (err: any) {
      console.error('Failed to toggle popular plan:', err);
      toast.error('Action Failed', err?.message || 'Could not update popular status.');
      loadPlans();
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Validation Error', 'Please enter a plan name.');
      return;
    }
    if (formData.price < 0 || isNaN(formData.price)) {
      toast.error('Validation Error', 'Please enter a valid price (>= 0).');
      return;
    }
    if (formData.durationDays < 1) {
      toast.error('Validation Error', 'Duration must be at least 1 day.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPlan) {
        const updated = await adminService.updatePlan(editingPlan.id, formData);
        setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? updated : p)));
        toast.success('Plan Updated', `"${formData.name}" has been successfully updated.`);
      } else {
        const created = await adminService.createPlan(formData);
        setPlans((prev) => [...prev, created].sort((a, b) => a.displayOrder - b.displayOrder));
        toast.success('Plan Created', `New plan "${formData.name}" has been created and published.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error('Save Failed', err?.message || 'Could not save plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPlan) return;
    setIsDeleting(true);
    try {
      await adminService.deletePlan(deletingPlan.id);
      setPlans((prev) => prev.filter((p) => p.id !== deletingPlan.id));
      toast.success('Plan Deleted', `"${deletingPlan.name}" has been removed from database.`);
      setDeletingPlan(null);
    } catch (err: any) {
      toast.error('Delete Failed', err?.message || 'Could not delete plan.');
    } finally {
      setIsDeleting(false);
    }
  };

  const activePlansCount = plans.filter((p) => p.isActive).length;
  const popularPlan = plans.find((p) => p.popular);

  return (
    <div className="space-y-6">
      {/* 1. Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-[var(--border)] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#80132E] to-[#A22749] text-white shadow-xs">
              <IconCreditCard className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold font-editorial-title text-[var(--foreground)]">
                Plan Configuration
              </h1>
              <p className="text-xs text-[var(--muted)]">
                Manage matrimonial subscription plans, prices, durations, quotas, and public listing in real time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={loadPlans}
            disabled={loading}
            className="rounded-2xl text-xs font-bold h-10 px-3.5 border-[var(--border)]"
            leftIcon={<IconRefresh className={cn('h-4 w-4', loading && 'animate-spin')} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="rounded-2xl text-xs font-bold h-10 px-4 bg-gradient-to-r from-[var(--primary)] to-[#801835] hover:brightness-105 shadow-sm text-white"
            leftIcon={<IconPlus className="h-4 w-4" />}
          >
            Create New Plan
          </Button>
        </div>
      </div>

      {/* 2. Overview Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 rounded-2xl border border-[var(--border)] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-xs font-medium">Total Plans</span>
            <IconCreditCard className="h-4 w-4 opacity-40" />
          </div>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-1.5">{plans.length}</p>
        </Card>

        <Card className="p-4 rounded-2xl border border-[var(--border)] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-xs font-medium">Active Plans</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1.5">{activePlansCount}</p>
        </Card>

        <Card className="p-4 rounded-2xl border border-[var(--border)] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-xs font-medium">Inactive</span>
            <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
              Draft
            </span>
          </div>
          <p className="text-2xl font-bold text-stone-600 mt-1.5">{plans.length - activePlansCount}</p>
        </Card>

        <Card className="p-4 rounded-2xl border border-[var(--border)] bg-white shadow-2xs">
          <div className="flex items-center justify-between text-[var(--muted)]">
            <span className="text-xs font-medium">Featured Plan</span>
            <IconFlame className="h-4 w-4 text-amber-500" />
          </div>
          <p
            className="text-base sm:text-lg font-bold text-[var(--primary)] mt-1.5 truncate"
            title={popularPlan ? popularPlan.name : 'None Selected'}
          >
            {popularPlan ? popularPlan.name : 'None'}
          </p>
        </Card>
      </div>

      {/* 3. Plans List Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-[var(--primary)] mx-auto mb-3" />
          <p className="text-sm font-semibold text-[var(--muted)]">Loading configured plans...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 rounded-3xl border border-rose-200 text-rose-900 max-w-md mx-auto">
          <IconAlertCircle className="h-8 w-8 text-rose-600 mx-auto mb-2" />
          <p className="text-sm font-bold">Failed to load plans</p>
          <p className="text-xs text-rose-700 mt-1">{error}</p>
          <Button variant="secondary" size="sm" onClick={loadPlans} className="mt-4">
            Retry
          </Button>
        </div>
      ) : plans.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-[var(--border)] p-8">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--surface-muted)] text-[var(--muted)] mx-auto mb-3">
            <IconCreditCard className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-[var(--foreground)]">No Plans Configured</h3>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
            Create your first membership plan to start offering chat permits to users.
          </p>
          <Button variant="primary" size="sm" onClick={openCreateModal} className="mt-4">
            Create Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                'relative p-5 rounded-3xl flex flex-col justify-between transition-all duration-200 border',
                plan.isActive
                  ? plan.popular
                    ? 'border-amber-400/80 bg-gradient-to-b from-[#FFFDF9] via-white to-white shadow-md ring-1 ring-amber-300'
                    : 'border-[var(--border)] bg-white shadow-xs hover:shadow-md'
                  : 'border-dashed border-stone-300 bg-stone-50/70 opacity-75'
              )}
            >
              {/* Header Badges */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#2A0711] text-amber-200 font-mono">
                      {plan.code}
                    </span>
                    {plan.popular ? (
                      <button
                        type="button"
                        onClick={() => handleTogglePopular(plan)}
                        title="Currently featured as Most Popular. Click to remove."
                        className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-2xs hover:brightness-105 transition-all cursor-pointer"
                      >
                        <IconStar className="h-3 w-3 fill-current" />
                        <span>Popular</span>
                      </button>
                    ) : plan.isActive ? (
                      <button
                        type="button"
                        onClick={() => handleTogglePopular(plan)}
                        title="Click to make this the featured Most Popular plan"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 hover:border-amber-400 shadow-2xs transition-all cursor-pointer"
                      >
                        <IconStar className="h-3 w-3 text-amber-600" />
                        <span>Make Popular</span>
                      </button>
                    ) : (
                      <span
                        title="Cannot feature an inactive plan. Make it Live first."
                        className="inline-flex items-center gap-1 text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed select-none opacity-60"
                      >
                        <IconStar className="h-3 w-3 text-stone-300" />
                        <span>Make Popular</span>
                      </span>
                    )}
                  </div>

                  {/* Active / Inactive Status Pill */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(plan)}
                    title={plan.isActive ? 'Click to deactivate (hide from users)' : 'Click to activate (publish to users)'}
                    className={cn(
                      'text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer flex items-center gap-1',
                      plan.isActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-stone-200/80 text-stone-600 border-stone-300 hover:bg-stone-200'
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', plan.isActive ? 'bg-emerald-500' : 'bg-stone-400')} />
                    <span>{plan.isActive ? 'Live' : 'Hidden'}</span>
                  </button>
                </div>

                {/* Plan Name & Custom Badge */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight">
                    {plan.name}
                  </h3>
                  {plan.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
                      {plan.badge}
                    </span>
                  )}
                </div>

                {plan.description && (
                  <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed line-clamp-2 min-h-[32px]">
                    {plan.description}
                  </p>
                )}

                {/* Pricing Block */}
                <div className="my-4 py-3 border-y border-[var(--border)]/70">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-bold font-editorial-title text-[var(--foreground)]">
                      {plan.formattedPrice || `₹${plan.price}`}
                    </span>
                    <span className="text-xs text-[var(--muted)] font-medium">
                      / {plan.period}
                    </span>
                  </div>
                  <span className="text-[11px] text-[var(--muted-strong)] font-semibold mt-0.5 block">
                    Duration: {plan.durationDays} days
                  </span>
                </div>

                {/* Quota Limits Preview */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[var(--surface-muted)] text-[11px] mb-4">
                  <div className="flex items-center gap-1.5">
                    <IconPhone className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" />
                    <div>
                      <span className="text-[10px] text-[var(--muted)] block leading-none">Contacts</span>
                      <span className="font-bold text-[var(--foreground)]">{plan.contactCredits} credits</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconHeart className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-[var(--muted)] block leading-none">Daily Limit</span>
                      <span className="font-bold text-[var(--foreground)]">{plan.dailyInterestsLimit} interests</span>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-1.5 mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    Included Features ({plan.features?.length || 0})
                  </p>
                  <ul className="space-y-1.5">
                    {(plan.features || []).slice(0, 4).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-[var(--foreground)] font-medium leading-snug">
                        <IconCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="truncate">{feat}</span>
                      </li>
                    ))}
                    {(plan.features?.length || 0) > 4 && (
                      <li className="text-[11px] font-semibold text-[var(--muted)] pl-5">
                        +{plan.features.length - 4} more features...
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => openEditModal(plan)}
                  className="flex-1 rounded-xl text-xs font-bold h-9 bg-stone-100 hover:bg-stone-200 text-stone-800 border-0"
                  leftIcon={<IconEdit className="h-3.5 w-3.5" />}
                >
                  Edit
                </Button>

                <button
                  type="button"
                  disabled={!plan.isActive && !plan.popular}
                  onClick={() => handleTogglePopular(plan)}
                  title={
                    !plan.isActive && !plan.popular
                      ? 'Cannot feature an inactive plan. Make it Live first.'
                      : plan.popular
                        ? 'Currently Most Popular plan (click to unset)'
                        : 'Set as the single Most Popular plan'
                  }
                  className={cn(
                    'h-9 px-3 rounded-xl flex items-center gap-1.5 transition-all text-xs font-bold border shrink-0',
                    plan.popular
                      ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-2xs cursor-pointer'
                      : plan.isActive
                        ? 'bg-amber-50/70 text-amber-900 border-amber-300 hover:border-amber-400 hover:bg-amber-100 cursor-pointer'
                        : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-50'
                  )}
                >
                  <IconStar
                    className={cn(
                      'h-4 w-4',
                      plan.popular
                        ? 'fill-white text-white'
                        : plan.isActive
                          ? 'text-amber-600'
                          : 'text-stone-400'
                    )}
                  />
                  <span>{plan.popular ? 'Popular' : 'Make Popular'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleActive(plan)}
                  title={plan.isActive ? 'Deactivate plan' : 'Activate plan'}
                  className={cn(
                    'h-9 w-9 rounded-xl grid place-items-center transition-colors border text-xs shrink-0',
                    plan.isActive
                      ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      : 'border-stone-300 text-stone-500 hover:bg-stone-100'
                  )}
                >
                  <IconPower className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeletingPlan(plan)}
                  title="Delete plan"
                  className="h-9 w-9 rounded-xl grid place-items-center text-rose-600 hover:bg-rose-50 border border-rose-200/80 transition-colors shrink-0"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 4. CREATE / EDIT PLAN MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create New Subscription Plan'}
        size="lg"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 pt-2">
          {/* Quick Suggested Template Loader */}
          <div className="p-3 rounded-2xl bg-[#FAF3EC] border border-[#EBD7C4] text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#80132E] flex items-center gap-1.5">
                <IconSparkles className="h-4 w-4 text-amber-600" />
                <span>Quick Preset Templates:</span>
              </span>
              <span className="text-[10px] text-[var(--muted)]">Auto-fill all fields in 1-click</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PLAN_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.code}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      name: tmpl.name,
                      code: editingPlan ? prev.code : tmpl.code,
                      price: tmpl.price,
                      period: tmpl.period,
                      durationDays: tmpl.durationDays,
                      badge: tmpl.badge,
                      contactCredits: tmpl.contactCredits,
                      dailyInterestsLimit: tmpl.dailyInterestsLimit,
                      popular: tmpl.popular,
                      description: tmpl.description,
                      features: [...tmpl.features],
                    }));
                    toast.success('Template Applied', {
                      description: `Loaded preset for ${tmpl.name}`,
                    });
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-[#80132E] hover:text-white border border-[#D5B79F] font-semibold text-stone-700 transition-colors text-[11px] shadow-2xs"
                >
                  {tmpl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Plan Name */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                Plan Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    name: val,
                    code: !editingPlan && !prev.code ? val.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase() : prev.code,
                  }));
                }}
                placeholder="e.g. 3 Months Permit"
                className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['1 Month Permit', '3 Months Permit', '6 Months Permit', '1 Year Permit'].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, name }))}
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan Code / Identifier */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                Unique Plan Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. STANDARD or BASIC"
                className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {['BASIC', 'STANDARD', 'PLUS', 'ELITE', 'VIP'].map((cd) => (
                  <button
                    key={cd}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, code: cd }))}
                    className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  >
                    {cd}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                placeholder="e.g. 1300"
                className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {PRICE_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, price: p }))}
                    className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded-md border transition-colors',
                      formData.price === p
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                    )}
                  >
                    ₹{p.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Billing Period Modern Dropdown */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                Billing Period Label <span className="text-rose-500">*</span>
              </label>
              <ModernSelect
                size="sm"
                value={
                  PERIOD_OPTIONS.some((o) => o.value === formData.period)
                    ? formData.period
                    : '__custom__'
                }
                onChange={(selected) => {
                  if (selected === '__custom__') {
                    if (PERIOD_OPTIONS.some((o) => o.value === formData.period)) {
                      setFormData((prev) => ({ ...prev, period: '' }));
                    }
                  } else {
                    const matched = PERIOD_OPTIONS.find((o) => o.value === selected);
                    setFormData((prev) => ({
                      ...prev,
                      period: selected,
                      durationDays: matched?.defaultDays ?? prev.durationDays,
                    }));
                  }
                }}
                options={PERIOD_SELECT_OPTIONS}
                placeholder="Select billing period..."
                maxHeight="max-h-60"
              />

              {/* If user selected custom or typed a custom period */}
              {(!PERIOD_OPTIONS.some((o) => o.value === formData.period) || formData.period === '__custom__') && (
                <input
                  type="text"
                  required
                  value={formData.period === '__custom__' ? '' : formData.period}
                  onChange={(e) => setFormData((prev) => ({ ...prev, period: e.target.value }))}
                  placeholder="Type custom period (e.g. for 45 days)..."
                  className="w-full h-8 px-2.5 rounded-lg border border-[var(--border)] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white mt-1.5"
                />
              )}
            </div>

            {/* Duration Days Modern Dropdown */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                Duration (Days) <span className="text-rose-500">*</span>
              </label>
              <ModernSelect
                size="sm"
                value={
                  DURATION_OPTIONS.some((o) => o.value === formData.durationDays)
                    ? String(formData.durationDays)
                    : '__custom__'
                }
                onChange={(selected) => {
                  if (selected !== '__custom__') {
                    const days = Number(selected);
                    const matched = DURATION_OPTIONS.find((o) => o.value === days);
                    setFormData((prev) => ({
                      ...prev,
                      durationDays: days,
                      period: matched ? matched.period : prev.period,
                    }));
                  }
                }}
                options={DURATION_SELECT_OPTIONS}
                placeholder="Select duration..."
                maxHeight="max-h-60"
              />

              {/* If custom duration */}
              {!DURATION_OPTIONS.some((o) => o.value === formData.durationDays) && (
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.durationDays || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, durationDays: Number(e.target.value) }))}
                  placeholder="Type custom days (e.g. 45)..."
                  className="w-full h-8 px-2.5 rounded-lg border border-[var(--border)] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white mt-1.5"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Badge Modern Dropdown */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                Custom Badge / Tag
              </label>
              <ModernSelect
                size="sm"
                value={
                  BADGE_OPTIONS.some((b) => b.value === (formData.badge || ''))
                    ? formData.badge || ''
                    : '__custom__'
                }
                onChange={(selected) => {
                  if (selected !== '__custom__') {
                    setFormData((prev) => ({ ...prev, badge: selected }));
                  }
                }}
                options={BADGE_SELECT_OPTIONS}
                placeholder="Select badge..."
                maxHeight="max-h-60"
              />

              {/* If custom badge */}
              {formData.badge && !BADGE_OPTIONS.some((b) => b.value === formData.badge) && (
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
                  placeholder="Type custom badge tag..."
                  className="w-full h-8 px-2.5 rounded-lg border border-[var(--border)] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white mt-1.5"
                />
              )}
            </div>

            {/* Contact Credits */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                Contact Credits
              </label>
              <input
                type="number"
                min="0"
                value={formData.contactCredits}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactCredits: Number(e.target.value) }))}
                placeholder="e.g. 30"
                className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {CONTACT_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, contactCredits: c }))}
                    className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded-md border transition-colors',
                      formData.contactCredits === c
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Interests Limit */}
            <div>
              <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
                Daily Interests Limit
              </label>
              <input
                type="number"
                min="0"
                value={formData.dailyInterestsLimit}
                onChange={(e) => setFormData((prev) => ({ ...prev, dailyInterestsLimit: Number(e.target.value) }))}
                placeholder="e.g. 50"
                className="w-full h-10 px-3 rounded-xl border border-[var(--border)] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {INTEREST_PRESETS.map((lim) => (
                  <button
                    key={lim}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, dailyInterestsLimit: lim }))}
                    className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded-md border transition-colors',
                      formData.dailyInterestsLimit === lim
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                    )}
                  >
                    {lim}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description / Pitch */}
          <div>
            <label className="block text-xs font-bold text-[var(--foreground)] mb-1">
              Description / Pitch
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. Our most popular plan. Best value for active matchmaking."
              className="w-full p-2.5 rounded-xl border border-[var(--border)] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
            />
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <span className="text-[10px] text-[var(--muted)] font-semibold self-center">Suggestions:</span>
              {DESCRIPTION_PRESETS.map((desc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, description: desc }))}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 transition truncate max-w-[240px]"
                  title={desc}
                >
                  {desc}
                </button>
              ))}
            </div>
          </div>

          {/* Features Builder */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--foreground)]">
              Feature Bullet Points
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="Type a feature and press Add..."
                className="flex-1 h-9 px-3 rounded-xl border border-[var(--border)] text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-white"
              />
              <Button type="button" variant="secondary" size="xs" onClick={handleAddFeature} className="h-9 px-3 text-xs font-bold">
                Add
              </Button>
            </div>

            {/* Feature Suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-[var(--muted)] font-semibold self-center mr-1">Suggestions:</span>
              {SUGGESTED_FEATURES.filter((s) => !formData.features?.includes(s))
                .slice(0, 5)
                .map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        features: [...(prev.features || []), suggestion],
                      }));
                    }}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                  >
                    + {suggestion}
                  </button>
                ))}
            </div>

            {/* Current Added Features */}
            <div className="space-y-1.5 pt-2 max-h-36 overflow-y-auto">
              {(formData.features || []).map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[var(--surface-muted)] text-xs font-medium text-[var(--foreground)]"
                >
                  <span className="flex items-center gap-2 truncate">
                    <IconCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-stone-400 hover:text-rose-600 p-0.5"
                  >
                    <IconX className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Checkboxes: Active & Popular */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--surface-muted)]">
            <label className={cn(
              "flex items-center gap-2 select-none",
              formData.isActive ? "cursor-pointer" : "cursor-not-allowed opacity-50"
            )}>
              <input
                type="checkbox"
                disabled={!formData.isActive}
                checked={Boolean(formData.popular && formData.isActive)}
                onChange={(e) => {
                  if (!formData.isActive) {
                    toast.info('Publish Plan First', 'Only active published plans can be featured as Most Popular.');
                    return;
                  }
                  setFormData((prev) => ({ ...prev, popular: e.target.checked }));
                }}
                className="h-4 w-4 rounded text-[var(--primary)] focus:ring-[var(--primary)] disabled:cursor-not-allowed"
              />
              <div>
                <span className="text-xs font-bold text-[var(--foreground)] block">
                  Highlight as Most Popular
                </span>
                {!formData.isActive ? (
                  <span className="text-[10px] text-amber-800 font-semibold block leading-tight">
                    Must be published (Live) to be featured
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-500 block leading-tight">
                    Enforces 1 popular plan at a time
                  </span>
                )}
              </div>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => {
                  const active = e.target.checked;
                  setFormData((prev) => ({
                    ...prev,
                    isActive: active,
                    // If user unpublishes plan, automatically unset popular
                    popular: active ? prev.popular : false,
                  }));
                }}
                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-bold text-emerald-800">Publish Immediately (Live)</span>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="rounded-xl text-xs font-bold bg-gradient-to-r from-[var(--primary)] to-[#801835] text-white"
              leftIcon={isSubmitting ? <IconLoader2 className="h-4 w-4 animate-spin" /> : undefined}
            >
              {isSubmitting ? 'Saving...' : editingPlan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 5. DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(deletingPlan)}
        onClose={() => !isDeleting && setDeletingPlan(null)}
        title="Delete Subscription Plan"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Are you sure you want to permanently delete plan{' '}
            <strong className="text-[var(--foreground)]">"{deletingPlan?.name}"</strong> ({deletingPlan?.code})?
            Existing active members with this tier will retain their current active permit period, but new users will
            not be able to subscribe to it.
          </p>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setDeletingPlan(null)}
              className="rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
              leftIcon={isDeleting ? <IconLoader2 className="h-3.5 w-3.5 animate-spin" /> : <IconTrash className="h-3.5 w-3.5" />}
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

