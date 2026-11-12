export interface AdminUserListItem {
  id: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  deactivatedAt?: string | null;
  deletedAt?: string | null;
  deletionReason?: string | null;
  subscriptionTier: 'BASIC' | 'PAID' | string;
  isBanned: boolean;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
  profileId: string | null;
  lastActiveAt: string;
  isOnline?: boolean;
  createdAt: string;
  profile?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    gender: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    occupation: string | null;
    education: string | null;
    dateOfBirth: string | null;
    onboardingStep: number;
    maritalStatus: string | null;
  } | null;
  photos?: {
    id: string;
    url: string;
    isPrimary: boolean;
    isVerified: boolean;
  }[];
  subscription?: {
    id: string;
    tier: string;
    status: string;
    startDate: string;
    expiresAt: string | null;
    canChat: boolean;
    contactCredits: number;
    dailyInterestsLimit: number;
  } | null;
}

export interface AdminUserQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  role?: 'ALL' | 'USER' | 'RM';
  plan?: 'ALL' | 'BASIC' | 'PAID';
  status?: 'ALL' | 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'DEACTIVATED' | 'DELETED';
}

export interface AdminUserListResponse {
  data: AdminUserListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
