'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  IconAlertCircle,
  IconArrowLeft,
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
  IconZoomIn,
} from '@tabler/icons-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SecureImageViewer } from '@/components/ui/secure-image-viewer';
import { rmService } from '@/services/rm.service';
import type { RmUserDetail } from '@/types/rm';

interface RmUserDetailViewProps {
  userId: string;
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

function MetaTile({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-[var(--surface-muted)]/70 border border-[var(--border)] px-3.5 py-2.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
        {label}
      </span>
      <span className="text-xs sm:text-sm font-semibold text-[var(--foreground)] break-words">
        {value !== undefined && value !== null && String(value).trim() !== '' ? String(value) : '—'}
      </span>
    </div>
  );
}

export function RmUserDetailView({ userId }: RmUserDetailViewProps) {
  const [detail, setDetail] = useState<RmUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const loadDetail = async (id: string, signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await rmService.getUserDetail(id, signal);
      setDetail(data);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      setError(err?.message || 'Unable to load user profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    loadDetail(userId, controller.signal);
    return () => controller.abort();
  }, [userId]);

  const p = detail?.profile;
  const fullName =
    [detail?.firstName || p?.firstName, detail?.lastName || p?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    detail?.email?.split('@')[0] ||
    detail?.phone ||
    'Member Profile';

  const photoUrls = (detail?.photos || []).map((ph) => ph.url).filter(Boolean);
  const primaryPhoto =
    detail?.photos?.find((ph) => ph.isPrimary)?.url || detail?.photos?.[0]?.url || '';
  const age = computeAge(p?.dateOfBirth);
  const locationText = [p?.city, p?.state, p?.country].filter(Boolean).join(', ') || 'Not specified';
  const categoryLabel = p?.category || p?.profileFor || 'Marriage';

  const openPhotoAt = (url?: string) => {
    if (!url || photoUrls.length === 0) return;
    const idx = photoUrls.indexOf(url);
    setViewerIndex(idx >= 0 ? idx : 0);
  };

  return (
    <>
      <SecureImageViewer
        isOpen={viewerIndex !== null && photoUrls.length > 0}
        onClose={() => setViewerIndex(null)}
        images={photoUrls}
        initialIndex={viewerIndex ?? 0}
        profileName={fullName}
        profileId={detail?.profileId || detail?.id}
      />

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
        {/* Top Breadcrumb / Back Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/rm">
              <Button variant="outline" size="sm" className="gap-1.5 font-semibold">
                <IconArrowLeft className="h-4 w-4" />
                Back to Directory
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tracking-tight">
                  Member Profile
                </h1>
                <Badge tone="champagne" size="sm">
                  Read-Only
                </Badge>
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Complete user profile, preferences, photos, and activity metadata.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <Card className="p-14 border border-[var(--border)] bg-[var(--surface)] flex flex-col items-center justify-center gap-3 text-[var(--muted)]">
            <IconLoader2 className="h-7 w-7 animate-spin text-[var(--primary)]" />
            <p className="text-xs font-medium">Loading member profile…</p>
          </Card>
        ) : error ? (
          <Card className="p-10 border border-[var(--border)] bg-[var(--surface)] text-center space-y-3">
            <IconAlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
            <h2 className="text-base font-bold text-[var(--foreground)]">Could not load profile</h2>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">{error}</p>
            <div className="flex items-center justify-center gap-2">
              <Button size="sm" variant="outline" onClick={() => loadDetail(userId)}>
                Retry
              </Button>
              <Link href="/rm">
                <Button size="sm" variant="primary">
                  Return to Directory
                </Button>
              </Link>
            </div>
          </Card>
        ) : detail ? (
          <>
            {/* Hero Profile Card */}
            <Card className="p-5 sm:p-6 border border-[#EAD8C7] bg-[#FAF3EC]/70 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-center gap-4 min-w-0">
                  {primaryPhoto ? (
                    <button
                      type="button"
                      onClick={() => openPhotoAt(primaryPhoto)}
                      className="group relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                      title="Click to enlarge photo"
                      aria-label="Enlarge primary profile photo"
                    >
                      <img
                        src={primaryPhoto}
                        alt={fullName}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <IconZoomIn className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                      </span>
                      {detail.isOnline && (
                        <span
                          className="absolute bottom-1.5 right-1.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white"
                          title="Online"
                        />
                      )}
                    </button>
                  ) : (
                    <Avatar
                      src=""
                      name={fullName}
                      size="xl"
                      online={detail.isOnline}
                      className="border-2 border-white shadow-md shrink-0"
                    />
                  )}

                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] truncate">
                        {fullName}
                        {age ? `, ${age}` : ''}
                      </h2>
                      <Badge tone="primary" size="sm">
                        {categoryLabel}
                      </Badge>
                      {p?.community && (
                        <Badge tone="burgundy" size="sm">
                          {p.community}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted-strong)]">
                      <span className="inline-flex items-center gap-1 font-mono font-semibold">
                        <IconId className="h-3.5 w-3.5 text-[var(--primary)]" />
                        {detail.profileId || detail.id}
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

                    {primaryPhoto && (
                      <p className="text-[11px] font-medium text-[var(--primary)]">
                        Click photo to view enlarged gallery
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Badge
                    tone={detail.isBanned ? 'danger' : detail.status === 'ACTIVE' ? 'success' : 'champagne'}
                    size="md"
                  >
                    {detail.isBanned ? 'BLOCKED' : detail.status}
                  </Badge>
                  <Badge
                    tone={detail.subscriptionTier === 'PAID' ? 'champagne' : 'neutral'}
                    size="md"
                    className={
                      detail.subscriptionTier === 'PAID'
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : ''
                    }
                  >
                    {detail.subscriptionTier === 'PAID' && (
                      <IconCrown className="h-3.5 w-3.5 inline mr-1 text-amber-600" />
                    )}
                    {detail.subscription?.tier || detail.subscriptionTier}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Photo Gallery (Click any image for enlarged mode) */}
            <Card className="p-5 sm:p-6 border-[var(--border)] shadow-xs space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
                  <IconPhoto className="h-4 w-4" />
                  Uploaded Photos ({detail.photos?.length || 0})
                </h3>
                {photoUrls.length > 0 && (
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() => setViewerIndex(0)}
                    className="gap-1.5 font-semibold"
                  >
                    <IconZoomIn className="h-3.5 w-3.5" />
                    Open Enlarged Gallery
                  </Button>
                )}
              </div>

              {detail.photos && detail.photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {detail.photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setViewerIndex(index)}
                      className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)] cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
                      aria-label={`Enlarge photo ${index + 1} of ${fullName}`}
                    >
                      <img
                        src={photo.url}
                        alt={`${fullName} photo ${index + 1}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                        <span className="h-9 w-9 rounded-full bg-black/60 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                          <IconZoomIn className="h-4.5 w-4.5" />
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1">
                        {photo.isPrimary && (
                          <span className="rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white">
                            Primary
                          </span>
                        )}
                        {photo.isVerified && (
                          <span className="rounded-md bg-emerald-600/90 px-2 py-0.5 text-[10px] font-bold text-white ml-auto">
                            Verified
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--muted)] italic">No photos uploaded yet.</p>
              )}
            </Card>

            {/* Contact & Verification */}
            <Card className="p-5 sm:p-6 border-[var(--border)] shadow-xs space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
                <IconShieldCheck className="h-4 w-4" />
                Contact &amp; Account Verification
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--surface-muted)]/70 border border-[var(--border)] px-3.5 py-2.5">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1">
                      <IconMail className="h-3 w-3" /> Email
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[var(--foreground)] truncate block">
                      {detail.email || '—'}
                    </span>
                  </div>
                  {detail.isEmailVerified && (
                    <Badge tone="success" size="sm">
                      <IconCheck className="h-3 w-3 mr-0.5" /> Verified
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 rounded-xl bg-[var(--surface-muted)]/70 border border-[var(--border)] px-3.5 py-2.5">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1">
                      <IconPhone className="h-3 w-3" /> Phone
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-[var(--foreground)] truncate block">
                      {detail.phone || '—'}
                    </span>
                  </div>
                  {detail.isPhoneVerified && (
                    <Badge tone="success" size="sm">
                      <IconCheck className="h-3 w-3 mr-0.5" /> Verified
                    </Badge>
                  )}
                </div>

                <MetaTile label="Last Active" value={formatDate(detail.lastActiveAt)} />
                <MetaTile label="Onboarding Step" value={p?.onboardingStep ?? '—'} />
                <MetaTile label="Subscription Status" value={detail.subscription?.status ?? '—'} />
                <MetaTile label="Plan Expiry" value={formatDate(detail.subscription?.expiresAt)} />
              </div>
            </Card>

            {/* About / Bio */}
            {p?.bio && (
              <Card className="p-5 sm:p-6 border-[var(--border)] shadow-xs space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
                  <IconUser className="h-4 w-4" />
                  About / Bio
                </h3>
                <p className="text-xs sm:text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
                  {p.bio}
                </p>
              </Card>
            )}

            {/* Personal & Background Details */}
            <Card className="p-5 sm:p-6 border-[var(--border)] shadow-xs space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
                <IconSparkles className="h-4 w-4" />
                Personal &amp; Background Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <MetaTile label="Gender" value={p?.gender} />
                <MetaTile label="Date of Birth" value={formatDate(p?.dateOfBirth)} />
                <MetaTile label="Height" value={p?.height} />
                <MetaTile label="Marital Status" value={p?.maritalStatus} />
                <MetaTile label="Religion" value={p?.religion} />
                <MetaTile label="Caste" value={p?.caste} />
                <MetaTile label="Mother Tongue" value={p?.motherTongue} />
                <MetaTile label="Nationality" value={p?.nationality} />
                <MetaTile label="Looking In" value={p?.lookingIn} />
                <MetaTile label="Profile For" value={p?.profileFor} />
              </div>
            </Card>

            {/* Education, Career & Location */}
            <Card className="p-5 sm:p-6 border-[var(--border)] shadow-xs space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
                <IconBriefcase className="h-4 w-4" />
                Education, Career &amp; Location
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <MetaTile label="Education" value={p?.education} />
                <MetaTile label="Occupation" value={p?.occupation} />
                <MetaTile label="Employment Status" value={p?.employmentStatus} />
                <MetaTile label="Annual Income" value={p?.annualIncome} />
                <MetaTile label="Working Place" value={p?.workingPlace} />
                <MetaTile label="Location" value={locationText} />
              </div>
            </Card>

            {/* Family & Partner Preferences */}
            <Card className="p-5 sm:p-6 border-[var(--border)] shadow-xs space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
                <IconUsers className="h-4 w-4" />
                Family &amp; Partner Preferences
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetaTile
                  label="Father"
                  value={p?.fatherName || (p?.fatherAlive === false ? 'Deceased' : p?.fatherAlive ? 'Alive' : '—')}
                />
                <MetaTile
                  label="Mother"
                  value={p?.motherAlive === false ? 'Deceased' : p?.motherAlive ? 'Alive' : '—'}
                />
                <MetaTile
                  label="Brothers (Married)"
                  value={
                    p?.brothersCount !== null && p?.brothersCount !== undefined
                      ? `${p.brothersCount} (${p.brothersMarried ?? 0})`
                      : '—'
                  }
                />
                <MetaTile
                  label="Sisters (Married)"
                  value={
                    p?.sistersCount !== null && p?.sistersCount !== undefined
                      ? `${p.sistersCount} (${p.sistersMarried ?? 0})`
                      : '—'
                  }
                />
              </div>

              {p?.lookingFor && (
                <div className="rounded-xl bg-[var(--surface-muted)]/60 border border-[var(--border)] p-3.5 text-xs sm:text-sm text-[var(--foreground)]">
                  <span className="font-bold text-[var(--muted-strong)] block mb-1">Looking For:</span>
                  {p.lookingFor}
                </div>
              )}

              {detail.preference && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <MetaTile
                    label="Preferred Age"
                    value={
                      detail.preference.minAge || detail.preference.maxAge
                        ? `${detail.preference.minAge ?? '?'} – ${detail.preference.maxAge ?? '?'}`
                        : '—'
                    }
                  />
                  <MetaTile label="Preferred Location" value={detail.preference.location} />
                  <MetaTile label="Preferred Education" value={detail.preference.education} />
                </div>
              )}

              {((p?.interests && p.interests.length > 0) || (p?.lifestyle && p.lifestyle.length > 0)) && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p?.interests?.map((item) => (
                    <Badge key={`int-${item}`} tone="blush" size="sm">
                      <IconHeart className="h-3 w-3 mr-1" />
                      {item}
                    </Badge>
                  ))}
                  {p?.lifestyle?.map((item) => (
                    <Badge key={`life-${item}`} tone="champagne" size="sm">
                      {item}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          </>
        ) : null}
      </div>
    </>
  );
}

