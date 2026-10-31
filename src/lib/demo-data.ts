export type Profile = {
  id: string;
  profileId?: string;
  name: string;
  age: number;
  city: string;
  state: string;
  profession: string;
  education: string;
  employmentStatus?: string;
  annualIncome?: string;
  gender?: string;
  category?: string;
  profileFor?: string;
  
  nationality?: string;
  country?: string;
  caste?: string;
  income?: string;
  intent?: string;
  diet?: string;
  image: string;
  compatibility: number;
  verified?: boolean;
  online?: boolean;
  status?: string;
  lastActiveAt?: string;
  about: string;
  height: string;
  maritalStatus: string;
  religion: string;
  motherTongue: string;
  family: string;
  fatherName?: string;
  fatherAlive?: boolean;
  motherAlive?: boolean;
  brothersCount?: number;
  brothersMarried?: number;
  sistersCount?: number;
  sistersMarried?: number;
  lifestyle: string[];
  interests: string[];
  lookingFor: string;
  photos?: any[];
  compatibilityHighlights?: Array<{ title: string; value: string; description: string }>;
  preferences?: any;
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
  if (!profile) return 'IC-10001';
  if (profile.profileId) {
    return profile.profileId.toUpperCase();
  }
  if (profile.id) {
    if (profile.id.toUpperCase().startsWith('IC-')) {
      return profile.id.toUpperCase();
    }
    const clean = profile.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (clean.length >= 6) {
      return `IC-${clean.substring(0, 6)}`;
    }
    let hash = 0;
    for (let i = 0; i < profile.id.length; i++) {
      hash = (hash << 5) - hash + profile.id.charCodeAt(i);
      hash |= 0;
    }
    return `IC-${Math.abs(hash % 90000) + 10000}`;
  }
  return 'IC-10001';
};

export const profiles: Profile[] = [];
export const receivedInterests: Profile[] = [];
export const sentInterests: Profile[] = [];
export const conversations: any[] = [];
export const notifications: any[] = [];
