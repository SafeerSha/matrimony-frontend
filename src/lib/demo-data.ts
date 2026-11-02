export type Profile = {
  id: string;
  userId?: string;
  profileTableId?: string;
  profileId?: string;
  name: string;
  age: number;
  city: string;
  state: string;
  profession: string;
  education: string;
  employmentStatus?: string;
  annualIncome?: string;
  workingPlace?: string;
  workLocation?: string;
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
  if (!profile) return 'IMC-A00001';
  if (profile.profileId) {
    return profile.profileId.toUpperCase().replace(/^LT-/i, 'IMC-');
  }
  if (profile.id) {
    const upper = profile.id.toUpperCase();
    if (upper.startsWith('IMC-')) {
      return upper;
    }
    if (upper.startsWith('LT-') || upper.startsWith('IC-')) {
      return upper.replace(/^(?:LT|IC)-/i, 'IMC-');
    }
    const clean = profile.id.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (clean.length >= 6) {
      return `IMC-${clean.substring(0, 6)}`;
    }
    let hash = 0;
    for (let i = 0; i < profile.id.length; i++) {
      hash = (hash << 5) - hash + profile.id.charCodeAt(i);
      hash |= 0;
    }
    return `IMC-${Math.abs(hash % 90000) + 10000}`;
  }
  return 'IMC-A00001';
};

export const profiles: Profile[] = [];
export const receivedInterests: Profile[] = [];
export const sentInterests: Profile[] = [];
export const conversations: any[] = [];
export const notifications: any[] = [];

export interface RegistrationBadgeInfo {
  label: string;
  icon: string;
  category: 'Marriage' | 'Friendship' | 'Live-In' | 'Living Together';
  subType?: string;
  className: string;
}

export const getRegistrationBadge = (
  profile?: {
    category?: string;
    profileFor?: string;
    state?: string;
    city?: string;
    motherTongue?: string;
  } | null
): RegistrationBadgeInfo => {
  const rawCat = (profile?.category || profile?.profileFor || 'Marriage').toLowerCase().trim();
  const state = (profile?.state || '').toLowerCase().trim();
  const language = (profile?.motherTongue || '').toLowerCase().trim();

  if (rawCat.includes('friend')) {
    return {
      label: 'Friendship',
      icon: '🤝',
      category: 'Friendship',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    };
  }

  if (rawCat.includes('living') || rawCat.includes('live')) {
    return {
      label: 'Live-In',
      icon: '🏡',
      category: 'Live-In',
      className: 'border-indigo-200 bg-indigo-50 text-indigo-800',
    };
  }

  // Marriage category: determine region/sub-domain (e.g. Kerala, Telugu, Bharat)
  let region = 'Kerala';
  if (state.includes('kerala') || language.includes('malayalam')) {
    region = 'Kerala';
  } else if (state.includes('andhra') || state.includes('telangana') || language.includes('telugu')) {
    region = 'Telugu';
  } else if (state.includes('tamil') || language.includes('tamil')) {
    region = 'Tamil';
  } else if (state.includes('karnataka') || language.includes('kannada')) {
    region = 'Kannada';
  } else if (state.includes('maharashtra') || language.includes('marathi')) {
    region = 'Marathi';
  } else if (profile?.state && profile.state.trim().length > 0) {
    region = profile.state.trim();
  } else {
    region = 'Bharat';
  }

  return {
    label: `Marriage - ${region} Matrimony`,
    icon: '💍',
    category: 'Marriage',
    subType: `${region} Matrimony`,
    className: 'border-[#F2D1DA] bg-[#FAF0F3] text-[#80132E]',
  };
};
