import { apiFetch } from "@/lib/http/api-client";

export interface LoginDto {
  email: string;
  password?: string;
}

export interface RegisterDto {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export const authService = {
  login: async (data: LoginDto) => {
    return await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  register: async (data: RegisterDto) => {
    return await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  logout: async () => {
    // The backend should clear the HttpOnly cookie when this is called
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch (e) {
      // Ignore if it fails
    }
  },

  getCurrentUser: () => {
    return apiFetch<AuthResponse["user"]>("/auth/me", {
      method: "GET",
    });
  },
};
