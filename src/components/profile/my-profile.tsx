'use client';
import { useState, useEffect, useRef } from 'react';
import { IconCamera, IconCircleCheck, IconChevronRight, IconEdit, IconEye, IconLock, IconPlus, IconDeviceFloppy, IconShieldCheck, IconPhoto, IconLoader2, IconTrash } from '@tabler/icons-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { SectionHeader } from '@/components/ui/section-header';
import { cn } from '@/lib/cn';
import { profileService, mediaService, authService } from '@/services';
import type { UserProfile } from '@/services/profile.service';
import { PartnerPreferencesEditor } from '@/components/preferences/partner-preferences-editor';
import { PageLoader } from '@/components/ui/page-loader';
import { toast } from '@/lib/toast';

export function MyProfile() {
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'overview' | 'about' | 'preferences' | 'album'>('overview');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = async () => {
    try {
      const [profileResult, userResult] = await Promise.allSettled([
        profileService.getProfile("me"),
        authService.getCurrentUser(),
      ]);

      const profileData = profileResult.status === "fulfilled" && profileResult.value ? profileResult.value : {};
      const userData = userResult.status === "fulfilled" && userResult.value ? userResult.value : {};

      setProfile({
        ...userData,
        ...profileData,
      } as UserProfile);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      try {
        await mediaService.uploadPhoto(e.target.files[0]);
        await fetchProfile(); // Refetch to show new photo
      } catch (e) {
        console.error(e);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await mediaService.deletePhoto(photoId);
      await fetchProfile();
    } catch (e) {
      console.error(e);
    }
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
  const age = dob ? Math.floor((new Date().getTime() - new Date(dob).getTime()) / 31557600000) : '--';
  const displayImage = profile.photos && profile.photos.length > 0 ? profile.photos[0].url : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85';

  const rawId = profile.profileId || profile.user?.profileId || profile.id || profile.userId || 'LT-A00001';
  const matrimonyId = profile.profileId || profile.user?.profileId || (profile.id ? String(profile.id).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase() : 'LT-A00001');

  const sections = [
    ['Basic details', 'Name, age, location and profession', '82% complete'],
    ['About you', 'A short introduction people can connect with', 'Complete'],
    ['Family & background', 'Help matches understand your background', 'Complete'],
    ['Lifestyle', 'Habits and interests', 'Complete'],
    ['Partner preferences', 'What matters to you in a partner', 'Complete']
  ];

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader
          eyebrow="My Profile"
          title="Profile Management"
          description="Keep your matrimonial profile details up to date to find genuine, high-compatibility matches."
        />
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<IconEye className="h-4 w-4 text-[var(--primary)]" />}
            className="rounded-xl text-xs font-bold shadow-2xs h-10 px-4"
          >
            Preview
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<IconDeviceFloppy className="h-4 w-4" />}
            className="rounded-xl text-xs font-bold shadow-xs active-press h-10 px-4"
            onClick={() => {
              setSaved(true);
              toast.success('Changes Saved', 'Your matrimonial profile details have been updated.');
            }}
          >
            {saved ? 'Saved' : 'Save changes'}
          </Button>
        </div>
      </div>

      {/* Main Profile Cover & Hero Card */}
      <Card className="overflow-hidden p-0 rounded-3xl">
        <div className="relative h-32 sm:h-40 bg-gradient-to-r from-[#5C1027] via-[#7A1835] to-[#8C1D3D]">
          {/* Subtle Ambient Radial Highlight */}
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(216,178,140,0.2)_0%,transparent_60%)]"
            aria-hidden="true"
          />
          <div className="absolute -bottom-10 left-6 rounded-full border-4 border-white bg-white shadow-md">
            <Avatar src={displayImage} name={displayName} size="xl" />
          </div>
        </div>

        <div className="px-6 pb-6 pt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-editorial-title text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                  {displayName}, {age}
                </h2>
                {profile.isVerified && <Badge tone="accent" size="sm" className="font-bold">Verified</Badge>}
              </div>
              <p className="mt-1.5 text-xs sm:text-sm font-semibold text-[var(--muted-strong)]">
                {profile.occupation || 'Profession not set'} · {profile.city || 'City not set'}
              </p>

              <div className="mt-3.5 inline-flex items-center gap-2 rounded-xl border border-[#EAD8C7] bg-[#FAF3EC] px-3 py-1 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5D30]">Matrimony ID</span>
                <span className="text-xs font-bold tracking-wider text-[#5C1027]">{matrimonyId}</span>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-[#FAF3EC] to-[#FFF9F6] p-4 sm:min-w-[220px] border border-[#EAD8C7] shadow-2xs">
              <div className="flex justify-between items-end mb-2">
                <p className="text-xs font-bold text-[#5C1027]">Profile Strength</p>
                <p className="text-lg font-bold text-[var(--primary)]">82%</p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200/80">
                <div className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--blush-deep)] transition-all duration-500" style={{ width: '82%' }} />
              </div>
              <p className="mt-2 text-[10px] font-semibold text-[var(--muted)]">Almost complete · Add partner preferences</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Modern Filter / Section Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E9DDE0] pb-3 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        {(['overview', 'about', 'preferences', 'album'] as const).map((t) => {
          const isActive = tab === t;
          const label = t === 'about' ? 'Bio & Values' : t === 'album' ? 'Photo Gallery' : t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-bold transition-all shrink-0 whitespace-nowrap capitalize select-none active-press',
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

      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <Card className="p-6 shadow-sm border border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--foreground)]">Profile sections</h2>
                  <p className="mt-1 text-sm text-[var(--muted)]">Keep these details current and genuine.</p>
                </div>
                <IconShieldCheck className="h-5 w-5 text-amber-500" />
              </div>
              <div className="mt-6 divide-y divide-[var(--border)] border-t border-[var(--border)]">
                {sections.map(([title, desc, status]) => (
                  <button key={title} className="flex w-full items-center gap-4 py-4 text-left hover:bg-[var(--surface-muted)] transition-colors rounded-lg px-2 -mx-2">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                      <IconCircleCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">{desc}</p>
                    </div>
                    <span className="text-xs font-semibold text-[var(--primary)]">{status}</span>
                    <IconChevronRight className="h-4 w-4 text-[var(--muted-light)]" />
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="p-5 sm:p-6 rounded-3xl">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#FAF3EC] text-[#7A1835]">
                  <IconShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-editorial-title text-lg font-bold text-[var(--foreground)]">Privacy preview</h2>
                  <p className="text-xs text-[var(--muted)]">You control what is visible</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[var(--muted-strong)]">
                You control what information is displayed to prospective matches. Contact details and phone number stay strictly private until mutually accepted.
              </p>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#FAF3EC]/60 p-3.5 border border-[#EAD8C7]">
                <span className="text-xs font-bold text-[#5C1027]">Profile Discoverable</span>
                <Badge tone="accent" size="sm" className="font-bold">Active</Badge>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'about' && (
        <Card className="p-5 sm:p-6 rounded-3xl">
          <div className="flex items-center justify-between border-b border-[#E9DDE0] pb-6">
            <div>
              <h2 className="font-editorial-title text-xl sm:text-2xl font-bold text-[var(--foreground)]">About You (Bio)</h2>
              <p className="mt-1 text-xs sm:text-sm text-[var(--muted)]">Keep your introduction natural, respectful, and specific.</p>
            </div>
            <Button variant="secondary" size="sm" className="rounded-2xl text-xs font-bold">
              <IconEdit className="mr-2 h-4 w-4" /> Edit Bio
            </Button>
          </div>
          <div className="mt-6 rounded-2xl bg-[#FFFDFB] p-6 border border-[#E9DDE0]/80">
            <p className="leading-relaxed text-sm text-[var(--muted-strong)]">
              {profile.bio || "No bio added yet. Write a thoughtful summary of yourself, your family values, and what you seek in a life partner."}
            </p>
          </div>
        </Card>
      )}

      {tab === 'preferences' && (
        <div className="pt-2">
          <PartnerPreferencesEditor isEmbedded={true} initialPreferences={profile.preferences} />
        </div>
      )}

      {tab === 'album' && (
        <Card className="p-5 sm:p-6 rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border)] pb-5 mb-5 gap-3">
            <div>
              <h2 className="font-editorial-title text-xl sm:text-2xl font-bold text-[var(--foreground)]">Photo Gallery</h2>
              <p className="mt-1 text-xs sm:text-sm text-[var(--muted)]">Manage your supplementary photos (Max 5 verified photos).</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="rounded-2xl text-xs font-bold shadow-xs active-press self-start sm:self-auto shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              leftIcon={isUploading ? <IconLoader2 className="h-4 w-4 animate-spin shrink-0" /> : <IconPlus className="h-4 w-4 shrink-0" />}
            >
              {isUploading ? 'Uploading...' : 'Add Photo'}
            </Button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {profile.photos && profile.photos.length > 0 ? profile.photos.map((photo: any, index: number) => (
              <div key={photo.id || index} className="relative aspect-[4/5] rounded-xl overflow-hidden border-2 border-[var(--border)] group">
                <img src={photo.url} alt="Profile Album" className="w-full h-full object-cover" />
                {index === 0 && <div className="absolute top-2 left-2 bg-[var(--primary)] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Display Pic</div>}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button variant="danger" className="h-8 w-8 p-0" onClick={() => handleDeletePhoto(photo.id)}>
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )) : null}

            {/* Empty Slots Filler */}
            {Array.from({ length: Math.max(0, 5 - (profile.photos?.length || 0)) }).map((_, i) => (
              <div key={i} onClick={() => fileInputRef.current?.click()} className="aspect-[4/5] rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-muted)] flex flex-col items-center justify-center hover:bg-[var(--primary)]/5 hover:border-[var(--primary)]/30 transition-colors cursor-pointer text-[var(--muted)]">
                <IconPhoto className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs font-semibold">Upload Photo</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
