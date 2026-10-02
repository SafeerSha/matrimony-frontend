import { apiFetch } from "@/lib/http/api-client";

export interface UserProfile {
  id?: string;
  userId?: string;
  profileId?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  isVerified?: boolean;
  user?: {
    id?: string;
    profileId?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
  bio?: string;
  dateOfBirth?: string;
  gender?: string;
  religion?: string;
  caste?: string;
  education?: string;
  occupation?: string;
  height?: number;
  maritalStatus?: string;
  city?: string;
  country?: string;
  photos?: any[];
  preferences?: any;
}

export const profileService = {
  getProfile: (userId: string | "me") => {
    return apiFetch<UserProfile>(`/profiles/${userId}`, {
      method: "GET",
    });
  },

  updateProfile: (userId: string | "me", data: Partial<UserProfile>) => {
    return apiFetch<UserProfile>(`/profiles/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  updatePreferences: (userId: string | "me", preferencesData: any) => {
    return apiFetch(`/profiles/${userId}/preferences`, {
      method: "PUT",
      body: JSON.stringify(preferencesData),
    });
  },
};
