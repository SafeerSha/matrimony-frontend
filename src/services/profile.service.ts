import { apiFetch } from "@/lib/http/api-client";

export interface ProfilePhoto {
  id: string;
  url: string;
  isPrimary?: boolean;
  order?: number;
}

export interface UserProfile {
  id?: string;
  userId?: string;
  profileId?: string;
  email?: string;
  emailOtp?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  status?: "DRAFT" | "ACTIVE" | string;
  onboardingStep?: number;
  isVerified?: boolean;
  user?: {
    id?: string;
    profileId?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    status?: "DRAFT" | "ACTIVE" | string;
    isPhoneVerified?: boolean;
  };
  bio?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: string;
  religion?: string;
  caste?: string;
  education?: string;
  occupation?: string;
  profession?: string;
  employmentStatus?: string;
  annualIncome?: string;
  height?: number;
  avatarUrl?: string;
  photoUrl?: string;
  maritalStatus?: string;
  motherTongue?: string;
  city?: string;
  state?: string;
  country?: string;
  lifestyle?: string[];
  interests?: string[];
  family?: string;
  fatherName?: string;
  nationality?: string;
  permanentAddress?: string;
  fatherAlive?: boolean;
  motherAlive?: boolean;
  brothersCount?: number;
  brothersMarried?: number;
  sistersCount?: number;
  sistersMarried?: number;
  familyDetails?: any;
  lookingFor?: string;
  photos?: ProfilePhoto[];
  preferences?: any;
  compatibility?: number;
  compatibilityHighlights?: Array<{ title: string; value: string; description: string }>;
  connectionStatus?: 'SENT' | 'RECEIVED' | 'MATCHED' | 'SHORTLISTED' | 'REJECTED' | null;
  isMatched?: boolean;
  isInterestSent?: boolean;
  isInterestReceived?: boolean;
  isShortlisted?: boolean;
  isDeclined?: boolean;
  isDeclinedByThem?: boolean;
  isDeclinedByMe?: boolean;
}

export const profileService = {
  getProfile: (userId: string | "me") => {
    return apiFetch<UserProfile>(`/profiles/${userId}`, {
      method: "GET",
    });
  },

  updateProfile: (userId: string | "me", data: Partial<UserProfile> & { height?: string | number; [key: string]: any }) => {
    return apiFetch<UserProfile>(`/profiles/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getPreferences: (userId: string | "me" = "me") => {
    return apiFetch<any>(`/profiles/${userId}/preferences`, {
      method: "GET",
    });
  },

  updatePreferences: (userId: string | "me", preferencesData: any) => {
    return apiFetch(`/profiles/${userId}/preferences`, {
      method: "PUT",
      body: JSON.stringify(preferencesData),
    });
  },

  deactivateAccount: (reason?: string) => {
    return apiFetch<{ success: boolean; message: string; status: string }>(
      "/profiles/me/deactivate",
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      }
    );
  },

  deleteAccount: (reason?: string, feedback?: string) => {
    return apiFetch<{ success: boolean; message: string; status: string }>(
      "/profiles/me/delete",
      {
        method: "POST",
        body: JSON.stringify({ reason, feedback }),
      }
    );
  },

  reactivateAccount: () => {
    return apiFetch<{ success: boolean; message: string; status: string }>(
      "/profiles/me/reactivate",
      {
        method: "POST",
      }
    );
  },

  completeOnboarding: (data: {
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    education?: string;
    occupation?: string;
    profession?: string;
    employmentStatus?: string;
    annualIncome?: string;
    income?: string;
    height?: string | number;
    religion?: string;
    caste?: string;
    fatherName?: string;
    nationality?: string;
    permanentAddress?: string;
    fatherAlive?: boolean;
    motherAlive?: boolean;
    brothersCount?: number;
    brothersMarried?: number;
    sistersCount?: number;
    sistersMarried?: number;
    familyDetails?: any;
    bio?: string;
    maritalStatus?: string;
    motherTongue?: string;
    city?: string;
    state?: string;
    country?: string;
    password?: string;
    skipPhotoCheck?: boolean;
  }) => {
    return apiFetch<{ success: boolean; message: string; user?: any; profile?: any }>(
      "/onboarding/complete",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },
};
