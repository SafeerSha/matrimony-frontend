'use client';

import { useEffect, useState } from 'react';
import {
  IconBriefcase,
  IconCalendar,
  IconCheck,
  IconCrown,
  IconHeart,
  IconId,
  IconLoader2,
  IconMail,
  IconMapPin,
  IconPhone,
  IconPhoto,
  IconShieldCheck,
  IconSparkles,
  IconUser,
  IconUsers,
  IconAlertCircle,
} from '@tabler/icons-react';
import { Modal } from '@/components/ui/modal';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { rmService } from '@/services/rm.service';
import type { RmUserDetail } from '@/types/rm';

interface RmUserDetailModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function computeAge(dob?: string | null): number | null {
  if (!dob) return null;
  const parsed = new Date(dob);
  if (isNaN(parsed.getTime())) return null;
  return Math.floor((Date.now() - parsed.getTime()) / 31557600000);
}

function MetaRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-[var(--surface-muted)]/70 border border-[var(--border)] px-3 py-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </span>
      <span className="text-xs font-semibold text-[var(--foreground)] break-words">
        {value !== undefined && value !== null && String(value).trim() !== '' ? String(value) : '—'}
      </span>
    </div>
  );
}

export function RmUserDetailModal({ userId, isOpen, onClose }: RmUserDetailModalProps) {
  const [detail, setDetail] = useState<RmUserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = async (id: string, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await rmService.getUserDetail(id, signal);
      setDetail(data);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      setError(err?.message || 'Unable to load full user profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !userId) {
      setDetail(null);
      setError(null);
      return;
    }
    const controller = new AbortController();
    loadDetail(userId, controller.signal);
    return () => controller.abort();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const p = detail?.profile;
  const fullName =
    [detail?.firstName || p?.firstName, detail?.lastName || p?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    detail?.email?.split('@')[0] ||
    detail?.phone ||
    'Member Profile';

  const primaryPhoto =
    detail?.photos?.find((ph) => ph.isPrimary)?.url || detail?.photos?.[0]?.url || '';
  const age = computeAge(p?.dateOfBirth);
  const locationText = [p?.city, p?.state, p?.country].filter(Boolean).join(', ') || 'Not specified';
  const categoryLabel = p?.category || p?.profileFor || 'Marriage';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2.5">
          <span>Member Profile & Metadata</span>
          <Badge tone="default" size="sm" className="bg-[#FAF3EC] text-[#80132E] border border-[#EAD8C7]">
            Read-Only
          </Badge>
        </div>
      }
      description="Complete directory record, preferences, verification flags, and activity summary."
    >
      {loading ? (
        <div className="py-14 flex flex-col items-center justify-center gap-3 text-[var(--muted)]">
          <IconLoader2 className="h-7 w-7 animate-spin text-[var(--primary)]" />
          <p className="text-xs font-medium">Loading profile metadata…</p>
        </div>
      ) : error ? (
        <div className="py-10 text-center space-y-3">
          <IconAlertCircle className="h-9 w-9 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-[var(--foreground)]">Could not load profile</p>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">{error}</p>
          {userId && (
            <Button size="sm" variant="outline" onClick={() => loadDetail(userId)}>
              Retry
            </Button>
          )}
        </div>
      ) : detail ? (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Top Summary Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF3EC]/70 border border-[#EAD8C7]">
            <div className="flex items-center gap-3.5 min-w-0">
              <Avatar
                src={primaryPhoto}
                name={fullName}
                size="lg"
                online={detail.isOnline}
                className="border-2 border-white shadow-sm shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base sm:text-lg font-bold text-[var(--foreground)] truncate">
                    {fullName}
                    {age ? `, ${age}` : ''}
                  </h4>
                  <Badge tone="accent" size="sm" className="bg-[#80132E] text-white border-0">
                    {categoryLabel}
                  </Badge>
                  {p?.community && (
                    <Badge tone="default" size="sm" className="bg-white border-[#EAD8C7] text-[#80132E]">
                      {p.community}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--muted-strong)] mt-1">
                  <span className="inline-flex items-center gap-1 font-mono">
                    <IconId className="h-3.5 w-3.5 text-[var(--primary)]" />
                    {detail.profileId || detail.id.slice(0, 8)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <IconMapPin className="h-3.5 w-3.5 text-[var(--primary)]" />
                    {locationText}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <IconCalendar className="h-3.5 w-3.5 text-[var(--muted)]" />
                    Joined {formatDate(detail.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Badge
                tone={detail.isBanned ? 'default' : detail.status === 'ACTIVE' ? 'accent' : 'default'}
                className={
                  detail.isBanned
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : detail.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border-amber-200'
                }
              >
                {detail.isBanned ? 'BLOCKED' : detail.status}
              </Badge>
              <Badge
                tone="default"
                className={
                  detail.subscriptionTier === 'PAID'
                    ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }
              >
                {detail.subscriptionTier === 'PAID' && (
                  <IconCrown className="h-3 w-3 inline mr-1 text-amber-600" />
                )}
                {detail.subscription?.tier || detail.subscriptionTier}
              </Badge>
            </div>
          </div>

          {/* Activity Stats Strip */}
          {detail.activityStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-[var(--border)] bg-white p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                  Mutual Matches
                </span>
                <span className="text-lg font-bold text-[var(--primary)]">
                  {detail.activityStats.mutualMatches}
                </span>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-white p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                  Pending Sent
                </span>
                <span className="text-lg font-bold text-[var(--foreground)]">
                  {detail.activityStats.sentInterests}
                </span>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-white p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                  Pending Received
                </span>
                <span className="text-lg font-bold text-[var(--foreground)]">
                  {detail.activityStats.receivedInterests}
                </span>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-white p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                  Feedback Submitted
                </span>
                <span className="text-lg font-bold text-[var(--foreground)]">
                  {detail.activityStats.feedbackCount}
                </span>
              </div>
            </div>
          )}

          {/* Contact & Verification */}
          <section className="space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
              <IconShieldCheck className="h-4 w-4" />
              Contact & Verification
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <div className="flex items-center justify-between rounded-xl bg-[var(--surface-muted)]/70 border border-[var(--border)] px-3 py-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1">
                    <IconMail className="h-3 w-3" /> Email
                  </span>
                  <span className="text-xs font-semibold text-[var(--foreground)] truncate block">
                    {detail.email || '—'}
                  </span>
                </div>
                {detail.isEmailVerified && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
                    <IconCheck className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[var(--surface-muted)]/70 border border-[var(--border)] px-3 py-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1">
                    <IconPhone className="h-3 w-3" /> Phone
                  </span>
                  <span className="text-xs font-semibold text-[var(--foreground)] truncate block">
                    {detail.phone || '—'}
                  </span>
                </div>
                {detail.isPhoneVerified && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0">
                    <IconCheck className="h-3 w-3" /> Verified
                  </span>
                )}
              </div>

              <MetaRow label="Last Active" value={formatDate(detail.lastActiveAt)} />
              <MetaRow label="Onboarding Step" value={p?.onboardingStep ?? '—'} />
              <MetaRow label="Account Role" value={detail.role} />
              <MetaRow label="Plan Expiry" value={formatDate(detail.subscription?.expiresAt)} />
            </div>
          </section>

          {/* Bio */}
          {p?.bio && (
            <section className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
                <IconUser className="h-4 w-4" />
                About / Bio
              </h5>
              <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)] p-3.5 whitespace-pre-wrap">
                {p.bio}
              </p>
            </section>
          )}

          {/* Personal & Cultural Metadata */}
          <section className="space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
              <IconSparkles className="h-4 w-4" />
              Personal & Background Details
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              <MetaRow label="Gender" value={p?.gender} />
              <MetaRow label="Date of Birth" value={formatDate(p?.dateOfBirth)} />
              <MetaRow label="Height" value={p?.height} />
              <MetaRow label="Marital Status" value={p?.maritalStatus} />
              <MetaRow label="Religion" value={p?.religion} />
              <MetaRow label="Caste" value={p?.caste} />
              <MetaRow label="Mother Tongue" value={p?.motherTongue} />
              <MetaRow label="Nationality" value={p?.nationality} />
              <MetaRow label="Looking In" value={p?.lookingIn} />
              <MetaRow label="Profile For" value={p?.profileFor} />
            </div>
          </section>

          {/* Education & Career */}
          <section className="space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
              <IconBriefcase className="h-4 w-4" />
              Education, Career & Location
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <MetaRow label="Education" value={p?.education} />
              <MetaRow label="Occupation" value={p?.occupation} />
              <MetaRow label="Employment Status" value={p?.employmentStatus} />
              <MetaRow label="Annual Income" value={p?.annualIncome} />
              <MetaRow label="Working Place" value={p?.workingPlace} />
              <MetaRow label="Location" value={locationText} />
            </div>
          </section>

          {/* Family & Partner Preferences */}
          <section className="space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
              <IconUsers className="h-4 w-4" />
              Family & Partner Preferences
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <MetaRow label="Father" value={p?.fatherName || (p?.fatherAlive === false ? 'Deceased' : p?.fatherAlive ? 'Alive' : '—')} />
              <MetaRow label="Mother" value={p?.motherAlive === false ? 'Deceased' : p?.motherAlive ? 'Alive' : '—'} />
              <MetaRow
                label="Brothers (Married)"
                value={
                  p?.brothersCount !== null && p?.brothersCount !== undefined
                    ? `${p.brothersCount} (${p.brothersMarried ?? 0})`
                    : '—'
                }
              />
              <MetaRow
                label="Sisters (Married)"
                value={
                  p?.sistersCount !== null && p?.sistersCount !== undefined
                    ? `${p.sistersCount} (${p.sistersMarried ?? 0})`
                    : '—'
                }
              />
            </div>

            {p?.lookingFor && (
              <div className="rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)] p-3 text-xs text-[var(--foreground)]">
                <span className="font-bold text-[var(--muted-strong)] block mb-1">Looking For:</span>
                {p.lookingFor}
              </div>
            )}

            {detail.preference && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <MetaRow
                  label="Preferred Age"
                  value={
                    detail.preference.minAge || detail.preference.maxAge
                      ? `${detail.preference.minAge ?? '?'} – ${detail.preference.maxAge ?? '?'}`
                      : '—'
                  }
                />
                <MetaRow label="Preferred Location" value={detail.preference.location} />
                <MetaRow label="Preferred Education" value={detail.preference.education} />
              </div>
            )}

            {((p?.interests && p.interests.length > 0) || (p?.lifestyle && p.lifestyle.length > 0)) && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {p?.interests?.map((item) => (
                  <Badge key={`int-${item}`} tone="default" size="sm" className="bg-rose-50 text-rose-800 border-rose-200">
                    <IconHeart className="h-3 w-3 mr-1" />
                    {item}
                  </Badge>
                ))}
                {p?.lifestyle?.map((item) => (
                  <Badge key={`life-${item}`} tone="default" size="sm" className="bg-amber-50 text-amber-800 border-amber-200">
                    {item}
                  </Badge>
                ))}
              </div>
            )}
          </section>

          {/* Photos */}
          {detail.photos && detail.photos.length > 0 && (
            <section className="space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
                <IconPhoto className="h-4 w-4" />
                Uploaded Photos ({detail.photos.length})
              </h5>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                {detail.photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)]"
                  >
                    <img
                      src={photo.url}
                      alt={`${fullName} photo`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between gap-1">
                      {photo.isPrimary && (
                        <span className="rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white">
                          Primary
                        </span>
                      )}
                      {photo.isVerified && (
                        <span className="rounded bg-emerald-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white ml-auto">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : null}
    </Modal>
  );
}

