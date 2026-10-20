'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  IconCamera,
  IconCircleCheck,
  IconChevronRight,
  IconEdit,
  IconEye,
  IconLock,
  IconPlus,
  IconDeviceFloppy,
  IconShieldCheck,
  IconPhoto,
  IconLoader2,
  IconTrash,
  IconStar,
  IconStarFilled,
  IconX,
  IconCheck,
  IconSparkles,
  IconHeart,
  IconUsers,
  IconBriefcase,
  IconMapPin,
  IconLanguage,
  IconCoins,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { SectionHeader } from '@/components/ui/section-header';
import { cn } from '@/lib/cn';
import { profileService, mediaService, authService } from '@/services';
import type { UserProfile, ProfilePhoto } from '@/services/profile.service';
import { PartnerPreferencesEditor } from '@/components/preferences/partner-preferences-editor';
import { PageLoader } from '@/components/ui/page-loader';
import { toast } from '@/lib/toast';

const POPULAR_LIFESTYLE_TAGS = [
  'Vegetarian',
  'Non-Vegetarian',
  'Eggetarian',
  'Vegan',
  'Fitness Enthusiast',
  'Non-Smoker',
  'Non-Drinker',
  'Social Drinker',
  'Early Riser',
  'Night Owl',
  'Pet Friendly',
];

const POPULAR_INTEREST_TAGS = [
  'Travel & Exploring',
  'Music & Concerts',
  'Reading & Literature',
  'Cooking & Foodie',
  'Yoga & Meditation',
  'Movies & Cinema',
  'Art & Design',
  'Hiking & Outdoors',
  'Tech & Coding',
  'Photography',
];

const INCOME_OPTIONS = [
  'Under ₹5 LPA',
  '₹5 - 10 LPA',
  '₹10 - 15 LPA',
  '₹15 - 20 LPA',
  '₹20 - 30 LPA',
  '₹30 - 50 LPA',
  '₹50+ LPA',
];

function SafeGalleryThumbnail({ p, i }: { p: ProfilePhoto; i: number }) {
  const [error, setError] = useState(false);
  return (
    <div
      key={p.id || i}
      className="relative aspect-square rounded-xl overflow-hidden border border-[var(--border)] bg-[#FAF3EC] flex items-center justify-center"
    >
      {!error && p.url ? (
        <img
          src={p.url}
          alt="Photo"
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#FAF3EC] to-[#F5E6D8] text-[var(--primary)]">
          <IconPhoto className="w-6 h-6 opacity-60" />
        </div>
      )}
      {p.isPrimary && (
        <div className="absolute top-1 right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-xs">
          <IconStar className="h-2.5 w-2.5 fill-white" />
        </div>
      )}
    </div>
  );
}

function SafeAlbumPhotoCard({
  photo,
  index,
  isPrimary,
  isSettingThisPrimary,
  isDeletingThis,
  onSetPrimary,
  onDelete,
}: {
  photo: ProfilePhoto;
  index: number;
  isPrimary: boolean;
  isSettingThisPrimary: boolean;
  isDeletingThis: boolean;
  onSetPrimary: () => void;
  onDelete: () => void;
}) {
  const [error, setError] = useState(false);

  return (
    <div
      className={cn(
        'relative aspect-[4/5] rounded-2xl overflow-hidden border-2 transition-all group bg-stone-100 shadow-2xs',
        isPrimary
          ? 'border-amber-400 ring-2 ring-amber-300/60 shadow-md'
          : 'border-[var(--border)] hover:border-[var(--primary)]'
      )}
    >
      {!error && photo.url ? (
        <img
          src={photo.url}
          alt={`Gallery Photo ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF3EC] to-[#F5E6D8] p-4 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-[var(--primary)] shadow-sm mb-1.5">
            <IconPhoto className="w-6 h-6 opacity-75" />
          </div>
          <span className="text-[11px] font-bold text-[#5C1027]">Photo {index + 1}</span>
          <span className="text-[10px] text-[var(--muted)]">Preview unavailable</span>
        </div>
      )}

      {/* Primary Photo Badge */}
      {isPrimary && (
        <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1 z-10">
          <IconStar className="h-3 w-3 fill-white" />
          Primary DP
        </div>
      )}

      {/* Photo Actions Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 gap-2">
        {!isPrimary && (
          <Button
            variant="secondary"
            size="xs"
            onClick={onSetPrimary}
            disabled={isSettingThisPrimary}
            className="w-full text-[11px] font-bold bg-white text-[var(--foreground)] hover:bg-[#FAF3EC] border-0 shadow-sm gap-1"
          >
            {isSettingThisPrimary ? (
              <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <IconStar className="h-3.5 w-3.5 text-amber-500" />
            )}
            Set as Primary
          </Button>
        )}

        <Button
          variant="danger"
          size="xs"
          onClick={onDelete}
          disabled={isDeletingThis}
          className="w-full text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white border-0 shadow-sm gap-1"
        >
          {isDeletingThis ? (
            <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <IconTrash className="h-3.5 w-3.5" />
          )}
          Delete Photo
        </Button>
      </div>
    </div>
  );
}

export function MyProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'about' | 'preferences' | 'album'>('overview');

  // Photo management state
  const [isUploading, setIsUploading] = useState(false);
  const [isSettingPrimary, setIsSettingPrimary] = useState<string | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile details edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [editDraft, setEditDraft] = useState<{
    bio: string;
    family: string;
    lookingFor: string;
    state: string;
    city: string;
    motherTongue: string;
    annualIncome: string;
    lifestyle: string[];
    interests: string[];
    customLifestyleInput: string;
    customInterestInput: string;
  }>({
    bio: '',
    family: '',
    lookingFor: '',
    state: '',
    city: '',
    motherTongue: '',
    annualIncome: '',
    lifestyle: [],
    interests: [],
    customLifestyleInput: '',
    customInterestInput: '',
  });

  const fetchProfile = async () => {
    try {
      const [profileResult, userResult] = await Promise.allSettled([
        profileService.getProfile('me'),
        authService.getCurrentUser(),
      ]);

      const profileData =
        profileResult.status === 'fulfilled' && profileResult.value ? profileResult.value : {};
      const userData =
        userResult.status === 'fulfilled' && userResult.value ? userResult.value : {};

      const combined: UserProfile = {
        ...userData,
        ...profileData,
      };

      setProfile(combined);

      // Pre-fill edit draft
      setEditDraft({
        bio: combined.bio || '',
        family: combined.family || '',
        lookingFor: combined.lookingFor || '',
        state: combined.state || '',
        city: combined.city || '',
        motherTongue: combined.motherTongue || '',
        annualIncome: combined.annualIncome || '',
        lifestyle: Array.isArray(combined.lifestyle) ? combined.lifestyle : [],
        interests: Array.isArray(combined.interests) ? combined.interests : [],
        customLifestyleInput: '',
        customInterestInput: '',
      });
    } catch (e) {
      console.error('Error fetching profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 1. PHOTO GALLERY MANAGEMENT
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const currentPhotos = profile?.photos || [];
    const currentCount = currentPhotos.length;
    const remainingSlots = Math.max(0, 5 - currentCount);

    if (remainingSlots <= 0) {
      toast.warning('Maximum Limit Reached', {
        description: 'You can upload a maximum of 5 photos. Please delete a photo to add a new one.',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    let filesToUpload = files;
    if (files.length > remainingSlots) {
      filesToUpload = files.slice(0, remainingSlots);
      toast.info('Photo Cap Applied', {
        description: `Uploading only the first ${remainingSlots} photo(s) to stay within the 5-photo maximum limit.`,
      });
    }

    setIsUploading(true);
    try {
      if (filesToUpload.length > 1) {
        await mediaService.uploadMultiplePhotos(filesToUpload);
        toast.success('Photos Uploaded', {
          description: `Successfully added ${filesToUpload.length} photos to your gallery.`,
        });
      } else {
        await mediaService.uploadPhoto(filesToUpload[0]);
        toast.success('Photo Uploaded', {
          description: 'Your photo was uploaded successfully.',
        });
      }
      await fetchProfile();
    } catch (err: any) {
      console.error('Upload failed:', err);
      toast.error('Upload Failed', {
        description: err?.message || 'Failed to upload photo. Please ensure file is an image under 5MB.',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSetPrimaryPhoto = async (photoId: string) => {
    setIsSettingPrimary(photoId);
    try {
      await mediaService.setPrimaryPhoto(photoId);
      toast.success('Primary Photo Set', {
        description: 'This photo is now your main profile display picture.',
      });
      await fetchProfile();
    } catch (err: any) {
      console.error('Failed to set primary photo:', err);
      toast.error('Could not set primary', {
        description: err?.message || 'Please try again.',
      });
    } finally {
      setIsSettingPrimary(null);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    setDeletingPhotoId(photoId);
    try {
      await mediaService.deletePhoto(photoId);
      toast.success('Photo Deleted', {
        description: 'Photo removed from your gallery.',
      });
      await fetchProfile();
    } catch (err: any) {
      console.error('Failed to delete photo:', err);
      toast.error('Could not delete photo', {
        description: err?.message || 'Please try again.',
      });
    } finally {
      setDeletingPhotoId(null);
    }
  };

  // 2. SAVE PROFILE DETAILS
  const handleSaveDetails = async () => {
    setIsSavingDetails(true);
    try {
      const payload: Partial<UserProfile> = {
        bio: editDraft.bio,
        family: editDraft.family,
        lookingFor: editDraft.lookingFor,
        state: editDraft.state,
        city: editDraft.city,
        motherTongue: editDraft.motherTongue,
        annualIncome: editDraft.annualIncome,
        lifestyle: editDraft.lifestyle,
        interests: editDraft.interests,
      };

      await profileService.updateProfile('me', payload);
      toast.success('Profile Updated', {
        description: 'Your background, lifestyle, and values have been saved.',
      });
      setIsEditModalOpen(false);
      await fetchProfile();
    } catch (err: any) {
      console.error('Update profile error:', err);
      toast.error('Update Failed', {
        description: err?.message || 'Could not save profile details.',
      });
    } finally {
      setIsSavingDetails(false);
    }
  };

  const toggleDraftTag = (category: 'lifestyle' | 'interests', tag: string) => {
    setEditDraft((prev) => {
      const currentList = prev[category];
      const nextList = currentList.includes(tag)
        ? currentList.filter((t) => t !== tag)
        : [...currentList, tag];
      return { ...prev, [category]: nextList };
    });
  };

  const addCustomTag = (category: 'lifestyle' | 'interests') => {
    const inputKey = category === 'lifestyle' ? 'customLifestyleInput' : 'customInterestInput';
    const tag = editDraft[inputKey].trim();
    if (!tag) return;
    if (editDraft[category].includes(tag)) {
      setEditDraft((prev) => ({ ...prev, [inputKey]: '' }));
      return;
    }
    setEditDraft((prev) => ({
      ...prev,
      [category]: [...prev[category], tag],
      [inputKey]: '',
    }));
  };

  if (isLoading) {
    return <PageLoader text="Loading your profile..." />;
  }

  if (!profile) return null;

  const displayName = profile.firstName
    ? `${profile.firstName} ${profile.lastName || ''}`.trim()
    : profile.name || (profile as any)?.user?.firstName
      ? `${(profile as any).user.firstName} ${(profile as any).user.lastName || ''}`.trim()
      : 'User';

  const dob = profile.dateOfBirth || (profile as any)?.user?.dateOfBirth;
  // Use computed age from API directly if present; fallback to dateOfBirth calculation
  const age =
    profile.age !== undefined && profile.age !== null
      ? profile.age
      : dob
        ? Math.floor((new Date().getTime() - new Date(dob).getTime()) / 31557600000)
        : '--';

  const photos = profile.photos || [];
  const primaryPhoto = photos.find((p) => p.isPrimary) || photos[0];
  const displayImage =
    primaryPhoto?.url ||
    (profile as any).avatarUrl ||
    (profile.user as any)?.avatarUrl ||
    '';

  const matrimonyId =
    profile.profileId ||
    profile.user?.profileId ||
    (profile.id
      ? String(profile.id).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase()
      : 'LT-A00001');

  const photosCount = photos.length;
  const isCapReached = photosCount >= 5;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="My Profile"
          title="Profile Management"
          description="Keep your matrimonial profile details, photos, and criteria up to date for verified compatibility matching."
        />
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<IconEdit className="h-4 w-4 text-[var(--primary)]" />}
            className="rounded-2xl text-xs font-bold shadow-2xs h-10 px-4 active-press"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<IconEye className="h-4 w-4" />}
            className="rounded-2xl text-xs font-bold shadow-xs active-press h-10 px-4"
            onClick={() => setTab('overview')}
          >
            View Profile
          </Button>
        </div>
      </div>

      {/* Main Profile Cover & Hero Card */}
      <Card className="overflow-hidden p-0 rounded-3xl border border-[var(--border)] shadow-[var(--elevation-card)]">
        <div className="relative h-32 sm:h-44 bg-gradient-to-r from-[#5C1027] via-[#7A1835] to-[#8C1D3D]">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(216,178,140,0.25)_0%,transparent_60%)]"
            aria-hidden="true"
          />
          <div className="absolute -bottom-10 left-6 flex items-center justify-center rounded-full border-4 border-white bg-white shadow-md leading-none shrink-0">
            <Avatar src={displayImage} name={displayName} size="xl" />
          </div>
        </div>

        <div className="px-6 pb-6 pt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center flex-wrap gap-2.5">
                <h2 className="font-editorial-title text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                  {displayName}, {age}
                </h2>
                {profile.isVerified && (
                  <Badge
                    tone="champagne"
                    size="sm"
                    className="font-bold gap-1 bg-amber-50 text-amber-800 border-amber-200"
                  >
                    <IconShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                    Verified Profile
                  </Badge>
                )}
              </div>

              <p className="mt-1.5 text-xs sm:text-sm font-semibold text-[var(--muted-strong)] flex items-center flex-wrap gap-2">
                <span>{profile.occupation || 'Profession not set'}</span>
                <span>•</span>
                <span>
                  {profile.city || 'City not set'}
                  {profile.state ? `, ${profile.state}` : ''}
                </span>
                {profile.motherTongue && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <IconLanguage className="h-3.5 w-3.5 text-[var(--primary)]" />
                      {profile.motherTongue}
                    </span>
                  </>
                )}
              </p>

              <div className="mt-3.5 inline-flex items-center gap-2 rounded-xl border border-[#EAD8C7] bg-[#FAF3EC] px-3 py-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5D30]">
                  Matrimony ID
                </span>
                <span className="text-xs font-bold tracking-wider text-[#5C1027]">
                  {matrimonyId}
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-[#FAF3EC] to-[#FFF9F6] p-4 sm:min-w-[240px] border border-[#EAD8C7] shadow-2xs">
              <div className="flex justify-between items-end mb-2">
                <p className="text-xs font-bold text-[#5C1027]">Profile Completeness</p>
                <p className="text-lg font-bold text-[var(--primary)]">
                  {photosCount >= 3 && profile.bio ? '95%' : '80%'}
                </p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--blush-deep)] transition-all duration-500"
                  style={{ width: photosCount >= 3 && profile.bio ? '95%' : '80%' }}
                />
              </div>
              <p className="mt-2 text-[10px] font-semibold text-[var(--muted)]">
                {photosCount} of 5 photos • {profile.bio ? 'Bio completed' : 'Add bio'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E9DDE0] pb-3 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {(['overview', 'about', 'album', 'preferences'] as const).map((t) => {
          const isActive = tab === t;
          const label =
            t === 'about'
              ? 'Bio & Background'
              : t === 'album'
                ? `Photo Gallery (${photosCount}/5)`
                : t === 'preferences'
                  ? 'Partner Preferences'
                  : 'Overview';
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all shrink-0 whitespace-nowrap select-none active-press',
                isActive
                  ? 'bg-[#7A1835] text-white shadow-xs'
                  : 'bg-white text-[#766B6F] border border-[#E9DDE0] hover:bg-[#FAF3EC] hover:text-[#211B1E]'
              )}
            >
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {/* Quick Details Grid */}
            <Card className="p-6 rounded-3xl border border-[var(--border)] shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-[var(--border)] pb-3">
                <h3 className="font-editorial-title text-xl font-bold text-[var(--foreground)]">
                  Personal & Basic Details
                </h3>
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => setIsEditModalOpen(true)}
                  className="gap-1 font-bold rounded-xl"
                >
                  <IconEdit className="h-3.5 w-3.5 text-[var(--primary)]" />
                  Edit
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-[11px] font-semibold text-[var(--muted)] block mb-1">
                    Full Name
                  </span>
                  <span className="font-bold text-[var(--foreground)] text-sm">{displayName}</span>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-[11px] font-semibold text-[var(--muted)] block mb-1">
                    Age & DOB
                  </span>
                  <span className="font-bold text-[var(--foreground)] text-sm">
                    {age} yrs {dob ? `(${new Date(dob).toLocaleDateString()})` : ''}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-[11px] font-semibold text-[var(--muted)] block mb-1">
                    Location (City & State)
                  </span>
                  <span className="font-bold text-[var(--foreground)] text-sm">
                    {profile.city || 'Not specified'}
                    {profile.state ? `, ${profile.state}` : ''}
                    {profile.country ? ` (${profile.country})` : ''}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-[11px] font-semibold text-[var(--muted)] block mb-1">
                    Mother Tongue
                  </span>
                  <span className="font-bold text-[var(--foreground)] text-sm">
                    {profile.motherTongue || 'Not specified'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-[11px] font-semibold text-[var(--muted)] block mb-1">
                    Profession & Education
                  </span>
                  <span className="font-bold text-[var(--foreground)] text-sm">
                    {profile.occupation || profile.profession || 'Professional'} •{' '}
                    {profile.education || 'Graduate'}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
                  <span className="text-[11px] font-semibold text-[var(--muted)] block mb-1">
                    Annual Income
                  </span>
                  <span className="font-bold text-[var(--foreground)] text-sm">
                    {profile.annualIncome || 'Available upon request'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Bio Highlight */}
            <Card className="p-6 rounded-3xl border border-[var(--border)] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-editorial-title text-xl font-bold text-[var(--foreground)]">
                  About Me
                </h3>
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => setIsEditModalOpen(true)}
                  className="gap-1 font-bold rounded-xl"
                >
                  <IconEdit className="h-3.5 w-3.5 text-[var(--primary)]" />
                  Edit Bio
                </Button>
              </div>
              <p className="text-sm leading-relaxed text-[var(--muted-strong)] bg-[#FFFDFB] p-4 rounded-2xl border border-[var(--border)]">
                {profile.bio ||
                  'No bio written yet. Click "Edit Details" to share a thoughtful overview of your background, values, and life aspirations.'}
              </p>
            </Card>

            {/* Family & Partner Expectations Highlight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="p-5 rounded-3xl border border-[var(--border)] shadow-sm">
                <h4 className="font-bold text-sm text-[var(--foreground)] mb-2 flex items-center gap-1.5">
                  <IconUsers className="h-4 w-4 text-[var(--primary)]" />
                  Family Background
                </h4>
                <p className="text-xs text-[var(--muted-strong)] leading-relaxed">
                  {profile.family || 'No family background added yet.'}
                </p>
              </Card>

              <Card className="p-5 rounded-3xl border border-[var(--border)] shadow-sm">
                <h4 className="font-bold text-sm text-[var(--foreground)] mb-2 flex items-center gap-1.5">
                  <IconHeart className="h-4 w-4 text-[var(--primary)]" />
                  Partner Expectations
                </h4>
                <p className="text-xs text-[var(--muted-strong)] leading-relaxed">
                  {profile.lookingFor || 'Looking for an understanding partner who values mutual respect.'}
                </p>
              </Card>
            </div>
          </div>

          {/* Right Column: Privacy & Verification */}
          <div className="space-y-5">
            <Card className="p-5 sm:p-6 rounded-3xl border border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#FAF3EC] text-[#7A1835]">
                  <IconShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-editorial-title text-lg font-bold text-[var(--foreground)]">
                    Verified Status
                  </h3>
                  <p className="text-xs text-[var(--muted)]">Profile Trust & Safety</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[var(--muted-strong)]">
                Your profile is verified with verified mobile OTP and credentials. Contact numbers
                remain strictly confidential until mutual acceptance.
              </p>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#FAF3EC]/60 p-3.5 border border-[#EAD8C7]">
                <span className="text-xs font-bold text-[#5C1027]">Matchmaking Visibility</span>
                <Badge tone="accent" size="sm" className="font-bold">
                  Active & Searchable
                </Badge>
              </div>
            </Card>

            {/* Quick Photo Gallery Widget */}
            <Card className="p-5 rounded-3xl border border-[var(--border)]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                  Gallery Photos ({photosCount}/5)
                </h4>
                <button
                  onClick={() => setTab('album')}
                  className="text-xs font-bold text-[var(--primary)] hover:underline"
                >
                  Manage
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {photos.slice(0, 3).map((p, i) => (
                  <SafeGalleryThumbnail key={p.id || i} p={p} i={i} />
                ))}
                {Array.from({ length: Math.max(0, 3 - photos.length) }).map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setTab('album')}
                    className="aspect-square rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] flex items-center justify-center cursor-pointer hover:bg-[var(--primary-lighter)]"
                  >
                    <IconPlus className="h-4 w-4 text-[var(--muted)]" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: ABOUT, FAMILY & LIFESTYLE */}
      {tab === 'about' && (
        <div className="space-y-6">
          <Card className="p-6 rounded-3xl border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
              <div>
                <h3 className="font-editorial-title text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                  About You & Personal Bio
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Introduce yourself authentically to potential partners.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="rounded-2xl text-xs font-bold gap-1"
                onClick={() => setIsEditModalOpen(true)}
              >
                <IconEdit className="h-4 w-4 text-[var(--primary)]" />
                Edit Bio
              </Button>
            </div>
            <p className="leading-relaxed text-sm text-[var(--muted-strong)] bg-[#FFFDFB] p-5 rounded-2xl border border-[var(--border)]">
              {profile.bio ||
                'No bio added yet. Write a thoughtful summary of yourself, your family values, and what you seek in a life partner.'}
            </p>
          </Card>

          {/* Family Background */}
          <Card className="p-6 rounded-3xl border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
              <div>
                <h3 className="font-editorial-title text-xl font-bold text-[var(--foreground)]">
                  Family Background & Values
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Share your family structure, hometown, and shared core values.
                </p>
              </div>
              <Button
                variant="secondary"
                size="xs"
                className="rounded-xl text-xs font-bold gap-1"
                onClick={() => setIsEditModalOpen(true)}
              >
                <IconEdit className="h-3.5 w-3.5 text-[var(--primary)]" />
                Edit Family
              </Button>
            </div>
            <p className="leading-relaxed text-sm text-[var(--muted-strong)] bg-[#FFFDFB] p-5 rounded-2xl border border-[var(--border)]">
              {profile.family ||
                'No family background provided yet. Detail your family values and background to help prospective families connect.'}
            </p>
          </Card>

          {/* Partner Expectations */}
          <Card className="p-6 rounded-3xl border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-4">
              <div>
                <h3 className="font-editorial-title text-xl font-bold text-[var(--foreground)]">
                  Partner Expectations (Looking For)
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  What kind of person are you hoping to build a future with?
                </p>
              </div>
              <Button
                variant="secondary"
                size="xs"
                className="rounded-xl text-xs font-bold gap-1"
                onClick={() => setIsEditModalOpen(true)}
              >
                <IconEdit className="h-3.5 w-3.5 text-[var(--primary)]" />
                Edit Expectations
              </Button>
            </div>
            <p className="leading-relaxed text-sm text-[var(--muted-strong)] bg-[#FFFDFB] p-5 rounded-2xl border border-[var(--border)]">
              {profile.lookingFor ||
                'Describe the values, personality, and aspirations you appreciate in a life partner.'}
            </p>
          </Card>

          {/* Lifestyle & Interests Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card className="p-6 rounded-3xl border border-[var(--border)] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-sm text-[var(--foreground)]">
                  Lifestyle & Dietary Habits
                </h4>
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => setIsEditModalOpen(true)}
                  className="rounded-xl text-xs font-bold"
                >
                  <IconEdit className="h-3.5 w-3.5 text-[var(--primary)]" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.lifestyle && profile.lifestyle.length > 0 ? (
                  profile.lifestyle.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#FAF3EC] text-[#5C1027] border border-[#EAD8C7]"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-[var(--muted)]">No lifestyle tags added yet.</p>
                )}
              </div>
            </Card>

            <Card className="p-6 rounded-3xl border border-[var(--border)] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-sm text-[var(--foreground)]">Interests & Hobbies</h4>
                <Button
                  variant="secondary"
                  size="xs"
                  onClick={() => setIsEditModalOpen(true)}
                  className="rounded-xl text-xs font-bold"
                >
                  <IconEdit className="h-3.5 w-3.5 text-[var(--primary)]" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.interests && profile.interests.length > 0 ? (
                  profile.interests.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--surface-muted)] text-[var(--foreground)] border border-[var(--border)]"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-[var(--muted)]">No interest tags added yet.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: PHOTO GALLERY (DOMAIN 1 - MOST IMPACTFUL) */}
      {tab === 'album' && (
        <Card className="p-6 sm:p-8 rounded-3xl border border-[var(--border)] shadow-sm">
          {/* Header & Cap Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border)] pb-5 mb-6 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-editorial-title text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                  Photo Gallery Management
                </h3>
                <span
                  className={cn(
                    'text-xs font-bold px-3 py-1 rounded-full border',
                    isCapReached
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  )}
                >
                  {photosCount} / 5 Photos Uploaded
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-[var(--muted)]">
                Up to 5 photos supported. Set your primary display photo with the star icon. Select
                multiple photos to upload simultaneously.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <Button
                variant="primary"
                size="sm"
                className="rounded-2xl text-xs font-bold shadow-xs active-press h-10 px-4"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isCapReached}
                leftIcon={
                  isUploading ? (
                    <IconLoader2 className="h-4 w-4 animate-spin shrink-0" />
                  ) : (
                    <IconPlus className="h-4 w-4 shrink-0" />
                  )
                }
              >
                {isUploading ? 'Uploading...' : isCapReached ? 'Limit Reached (5/5)' : 'Upload Photos'}
              </Button>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
              />
            </div>
          </div>

          {/* 5-Photo Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {photos.map((photo, index) => (
              <SafeAlbumPhotoCard
                key={photo.id || index}
                photo={photo}
                index={index}
                isPrimary={photo.isPrimary || index === 0}
                isSettingThisPrimary={isSettingPrimary === photo.id}
                isDeletingThis={deletingPhotoId === photo.id}
                onSetPrimary={() => handleSetPrimaryPhoto(photo.id)}
                onDelete={() => handleDeletePhoto(photo.id)}
              />
            ))}

            {/* Empty Slots Fillers up to 5 */}
            {Array.from({ length: Math.max(0, 5 - photosCount) }).map((_, i) => (
              <div
                key={`empty-slot-${i}`}
                onClick={() => {
                  if (!isCapReached && !isUploading) {
                    fileInputRef.current?.click();
                  }
                }}
                className={cn(
                  'aspect-[4/5] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all p-4 text-center select-none',
                  isCapReached
                    ? 'border-gray-200 bg-gray-50/50 cursor-not-allowed opacity-60 text-gray-400'
                    : 'border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--primary-lighter)] hover:border-[var(--primary)] cursor-pointer text-[var(--muted)]'
                )}
              >
                <div className="h-10 w-10 rounded-full bg-white shadow-2xs flex items-center justify-center mb-2">
                  <IconPhoto className="h-5 w-5 opacity-60 text-[var(--primary)]" />
                </div>
                <span className="text-xs font-bold text-[var(--foreground)]">
                  Slot {photosCount + i + 1} of 5
                </span>
                <span className="text-[10px] text-[var(--muted)] mt-1">
                  {isCapReached ? 'Cap reached' : 'Click to Upload'}
                </span>
              </div>
            ))}
          </div>

          {/* Upload Instructions Tip */}
          <div className="mt-6 rounded-2xl bg-[#FAF3EC] border border-[#EAD8C7] p-4 text-xs text-[#5C1027] flex items-start gap-2.5">
            <IconSparkles className="h-4 w-4 shrink-0 mt-0.5 text-[#7A1835]" />
            <div>
              <p className="font-bold mb-0.5">Photo Verification Guidelines</p>
              <p className="text-[#8C5D30] leading-relaxed">
                Clear, front-facing solo photos receive 4x more mutual responses. Your primary
                photo is shown in search results and Discovery cards.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 4: PARTNER PREFERENCES (DOMAIN 4) */}
      {tab === 'preferences' && (
        <div className="pt-2">
          <PartnerPreferencesEditor isEmbedded={true} initialPreferences={profile.preferences} />
        </div>
      )}

      {/* EDIT PROFILE DETAILS MODAL (DOMAINS 2 & 3) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile Details"
        description="Update your personal details, location, family background, and lifestyle."
        size="lg"
      >
        <div className="space-y-5 max-h-[72vh] overflow-y-auto px-1 pr-2">
          {/* Location & Mother Tongue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-1.5">
                City / Town
              </label>
              <input
                type="text"
                value={editDraft.city}
                onChange={(e) => setEditDraft({ ...editDraft, city: e.target.value })}
                placeholder="e.g. Kochi, Bengaluru"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-1.5">
                State / Province
              </label>
              <input
                type="text"
                value={editDraft.state}
                onChange={(e) => setEditDraft({ ...editDraft, state: e.target.value })}
                placeholder="e.g. Kerala, Karnataka, Maharashtra"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-1.5">
                Mother Tongue
              </label>
              <input
                type="text"
                value={editDraft.motherTongue}
                onChange={(e) => setEditDraft({ ...editDraft, motherTongue: e.target.value })}
                placeholder="e.g. Malayalam, Tamil, Hindi"
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-1.5">
                Annual Income
              </label>
              <select
                value={editDraft.annualIncome}
                onChange={(e) => setEditDraft({ ...editDraft, annualIncome: e.target.value })}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3.5 py-2.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">Select income bracket</option>
                {INCOME_OPTIONS.map((inc) => (
                  <option key={inc} value={inc}>
                    {inc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bio Textarea (Up to 1,500 chars) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                About You (Bio)
              </label>
              <span className="text-[10px] text-[var(--muted)]">
                {editDraft.bio.length} / 1500 characters
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={1500}
              value={editDraft.bio}
              onChange={(e) => setEditDraft({ ...editDraft, bio: e.target.value })}
              placeholder="Write a thoughtful introduction about yourself, your career, and life outlook..."
              className="w-full rounded-xl border border-[var(--border)] bg-white p-3 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] leading-relaxed"
            />
          </div>

          {/* Family Background Textarea (Up to 1,500 chars) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                Family Background & Values
              </label>
              <span className="text-[10px] text-[var(--muted)]">
                {editDraft.family.length} / 1500 characters
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={1500}
              value={editDraft.family}
              onChange={(e) => setEditDraft({ ...editDraft, family: e.target.value })}
              placeholder="Share details about your parents, siblings, family values, and native place..."
              className="w-full rounded-xl border border-[var(--border)] bg-white p-3 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] leading-relaxed"
            />
          </div>

          {/* Partner Expectations (Looking For) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                Partner Expectations (Looking For)
              </label>
              <span className="text-[10px] text-[var(--muted)]">
                {editDraft.lookingFor.length} / 1500 characters
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={1500}
              value={editDraft.lookingFor}
              onChange={(e) => setEditDraft({ ...editDraft, lookingFor: e.target.value })}
              placeholder="Describe your ideal partner's nature, compatibility factors, and expectations..."
              className="w-full rounded-xl border border-[var(--border)] bg-white p-3 text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] leading-relaxed"
            />
          </div>

          {/* Lifestyle Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-2">
              Lifestyle & Dietary Habits
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {POPULAR_LIFESTYLE_TAGS.map((tag) => {
                const isSelected = editDraft.lifestyle.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleDraftTag('lifestyle', tag)}
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-full border transition-all font-medium',
                      isSelected
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                        : 'bg-white text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--surface-muted)]'
                    )}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interests & Hobbies Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--foreground)] mb-2">
              Interests & Hobbies
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {POPULAR_INTEREST_TAGS.map((tag) => {
                const isSelected = editDraft.interests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleDraftTag('interests', tag)}
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-full border transition-all font-medium',
                      isSelected
                        ? 'bg-[#5C1027] text-white border-[#5C1027]'
                        : 'bg-white text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--surface-muted)]'
                    )}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveDetails}
              disabled={isSavingDetails}
              className="rounded-xl font-bold gap-1.5"
            >
              {isSavingDetails ? (
                <>
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="h-4 w-4" />
                  Save Details
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
