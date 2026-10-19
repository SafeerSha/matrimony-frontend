export type Profile = {
  id: string; profileId?: string; name: string; age: number; city: string; state: string; profession: string; education: string;
  employmentStatus?: string;
  gender?: string;
  caste?: string;
  income?: string;
  intent?: string;
  diet?: string;
  image: string; compatibility: number; verified?: boolean; online?: boolean; status?: string;
  lastActiveAt?: string;
  about: string; height: string; maritalStatus: string; religion: string; motherTongue: string;
  family: string; lifestyle: string[]; interests: string[]; lookingFor: string;
  photos?: any[];
};

export function formatLastActive(dateStr?: string): string {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  if (isNaN(diffMs) || diffMs < 0) return 'Online now';
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 5) return 'Online now';
  if (diffMin < 60) return `Active ${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Active ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Active yesterday';
  if (diffDays < 7) return `Active ${diffDays}d ago`;
  return 'Active recently';
}

export const getProfileUniqueId = (profile?: { id?: string; profileId?: string } | null): string => {
  if (!profile) return 'MAT-10001';
  if (profile.profileId) {
    return profile.profileId.toUpperCase();
  }
  const demoIdMap: Record<string, string> = {
    ananya: 'MAT-92841',
    meera: 'MAT-89214',
    diya: 'MAT-86420',
    farah: 'MAT-84193',
    sana: 'MAT-81932',
    riya: 'MAT-79245',
  };
  const key = profile.id ? profile.id.toLowerCase() : '';
  if (demoIdMap[key]) {
    return demoIdMap[key];
  }
  if (profile.id) {
    if (profile.id.toUpperCase().startsWith('MAT-') || profile.id.toUpperCase().startsWith('LT-')) {
      return profile.id.toUpperCase();
    }
    const clean = profile.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (clean.length >= 6) {
      return `MAT-${clean.substring(0, 6)}`;
    }
    let hash = 0;
    for (let i = 0; i < profile.id.length; i++) {
      hash = (hash << 5) - hash + profile.id.charCodeAt(i);
      hash |= 0;
    }
    return `MAT-${Math.abs(hash % 90000) + 10000}`;
  }
  return 'MAT-10001';
};

export const profiles: Profile[] = [];
export const receivedInterests: Profile[] = [];
export const sentInterests: Profile[] = [];
export const conversations: any[] = [];
export const notifications: any[] = [];
