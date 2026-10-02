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
  login: (data: LoginDto) => {
    return apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  register: (data: RegisterDto) => {
    return apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  logout: () => {
    return apiFetch("/auth/logout", {
      method: "POST",
    });
  },

  getCurrentUser: () => {
    return apiFetch<AuthResponse["user"]>("/auth/me", {
      method: "GET",
    });
  },
};
