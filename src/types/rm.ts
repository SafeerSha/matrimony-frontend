export type RmUserCategory = 'ALL' | 'Marriage' | 'Friendship' | 'Live-In';
export type RmUserPlan = 'ALL' | 'BASIC' | 'PAID';
export type RmUserStatus = 'ALL' | 'ACTIVE' | 'BLOCKED' | 'SUSPENDED' | 'DEACTIVATED' | 'DELETED';
export type RmUserVerified = 'ALL' | 'VERIFIED' | 'UNVERIFIED';
export type RmUserGender = 'ALL' | 'Male' | 'Female' | 'Other';

export interface RmUserListItem {
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
  updatedAt?: string;
  profile?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    gender: string | null;
    category: string | null;
    community: string | null;
    lookingIn: string | null;
    profileFor: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    occupation: string | null;
    education: string | null;
    dateOfBirth: string | null;
    maritalStatus: string | null;
    onboardingStep: number;
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

export interface RmUserDetail extends RmUserListItem {
  profile?: (RmUserListItem['profile'] & {
    bio?: string | null;
    religion?: string | null;
    caste?: string | null;
    employmentStatus?: string | null;
    annualIncome?: string | null;
    workingPlace?: string | null;
    height?: string | null;
    motherTongue?: string | null;
    family?: string | null;
    lifestyle?: string[];
    interests?: string[];
    lookingFor?: string | null;
    preferences?: Record<string, any> | null;
    fatherName?: string | null;
    nationality?: string | null;
    fatherAlive?: boolean | null;
    motherAlive?: boolean | null;
    brothersCount?: number | null;
    brothersMarried?: number | null;
    sistersCount?: number | null;
    sistersMarried?: number | null;
    familyDetails?: Record<string, any> | null;
    createdAt?: string;
    updatedAt?: string;
  }) | null;
  preference?: {
    id: string;
    minAge?: number | null;
    maxAge?: number | null;
    minHeight?: string | null;
    maxHeight?: string | null;
    religions?: string | null;
    maritalStatuses?: string | null;
    education?: string | null;
    occupations?: string | null;
    employmentStatuses?: string | null;
    location?: string | null;
    diet?: string | null;
  } | null;
  photos?: {
    id: string;
    url: string;
    isPrimary: boolean;
    isVerified: boolean;
    createdAt?: string;
  }[];
  subscription?: (NonNullable<RmUserListItem['subscription']> & {
    priorityRanking?: boolean;
  }) | null;
  activityStats?: {
    sentInterests: number;
    receivedInterests: number;
    mutualMatches: number;
    feedbackCount: number;
  };
}

export interface RmUserQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  category?: RmUserCategory;
  plan?: RmUserPlan;
  status?: RmUserStatus;
  verified?: RmUserVerified;
  gender?: RmUserGender;
}

export interface RmUserListResponse {
  data: RmUserListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RmUserStats {
  total: number;
  categories: {
    Marriage: number;
    Friendship: number;
    'Live-In': number;
  };
  active: number;
  paid: number;
  unverified: number;
}

export type RmFeedbackType = 'ALL' | 'general' | 'feature' | 'bug';
export type RmFeedbackStatus =
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'REVIEWED'
  | 'PLANNED'
  | 'RESOLVED'
  | 'ACTIONED'
  | 'DISMISSED';
export type RmFeedbackPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RmFeedbackItem {
  id: string;
  userId: string | null;
  rating: number;
  type: 'general' | 'feature' | 'bug' | string;
  message: string;
  status: RmFeedbackStatus | string;
  priority: RmFeedbackPriority | string;
  rmNotes: string | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    profileId: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    photos?: { url: string }[];
  } | null;
}

export interface RmFeedbackQueryFilters {
  page?: number;
  limit?: number;
  type?: RmFeedbackType;
  status?: 'ALL' | RmFeedbackStatus;
  priority?: 'ALL' | RmFeedbackPriority;
  rating?: number;
  search?: string;
}

export interface RmFeedbackListResponse {
  data: RmFeedbackItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface RmFeedbackStats {
  total: number;
  openCount: number;
  byType: {
    bug: number;
    feature: number;
    general: number;
  };
  averageRating: number;
}

export interface UpdateRmFeedbackPayload {
  status?: RmFeedbackStatus;
  priority?: RmFeedbackPriority;
  rmNotes?: string;
}

