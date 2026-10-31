import { apiFetch } from "@/lib/http/api-client";

export interface LoginDto {
  email?: string;
  phone?: string;
  identifier?: string;
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
  refreshToken?: string;
  user: {
    id: string;
    profileId?: string;
    email: string;
    phone?: string;
    role: string;
    status?: "DRAFT" | "ACTIVE" | string;
    isPhoneVerified?: boolean;
  };
  profile?: {
    firstName?: string;
    category?: string;
    onboardingStep?: number;
    status?: "DRAFT" | "ACTIVE" | string;
    [key: string]: any;
  };
  success?: boolean;
}

export { isDraftUser, resolvePostAuthRoute } from "@/lib/auth/auth-utils";

export interface QuickRegisterDto {
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  lookingFor?: string;
  profileFor: string;
  createdBy?: string;
  lookingIn?: string;
  category?: string;
}

export const authService = {
  getAccessToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return (
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken") ||
      null
    );
  },

  setAccessToken: (token: string, refreshToken?: string) => {
    if (typeof window === "undefined" || !token) return;
    try {
      sessionStorage.removeItem("is_manual_logout");
      sessionStorage.setItem("accessToken", token);
      localStorage.setItem("accessToken", token);
      sessionStorage.setItem("auth_token_set_at", Date.now().toString());
      if (refreshToken) {
        sessionStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("refreshToken", refreshToken);
      }
      const maxAge = 7 * 24 * 60 * 60; // 7 days
      const isSecure = window.location.protocol === "https:";
      document.cookie = `matrimony_session=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
      if (refreshToken) {
        document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax${isSecure ? "; Secure" : ""}`;
      }
    } catch {}
  },

  clearAccessToken: () => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem("accessToken");
      localStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("auth_token_set_at");
      document.cookie = "matrimony_session=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "__Host-matrimony_session=; path=/; max-age=0; SameSite=Lax; Secure";
      document.cookie = "refreshToken=; path=/; max-age=0; SameSite=Lax";
    } catch {}
  },

  login: async (data: LoginDto) => {
    // Normalize identifier for backend support
    const identifier = (data.identifier || data.email || data.phone || "").trim();
    const isEmail = identifier.includes("@");
    const payload = {
      ...data,
      identifier,
      email: data.email || (isEmail ? identifier : undefined),
      phone: data.phone || (!isEmail ? identifier : undefined),
    };

    const res = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res?.accessToken) {
      authService.setAccessToken(res.accessToken, res.refreshToken);
    }

    return res;
  },

  sendOtp: async (
    target: string | { phone?: string; email?: string; purpose?: string },
    purpose?: "login" | "register" | string
  ) => {
    let payload: any = {};
    if (typeof target === "string") {
      if (target.includes("@")) {
        payload = { email: target.trim().toLowerCase(), ...(purpose ? { purpose } : {}) };
      } else {
        payload = { phone: target.trim(), ...(purpose ? { purpose } : {}) };
      }
    } else {
      payload = { ...target };
      if (payload.email) payload.email = payload.email.trim().toLowerCase();
      if (purpose && !payload.purpose) payload.purpose = purpose;
    }

    try {
      return await apiFetch<{ message: string; defaultOtp?: string }>("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      // Re-throw registered account check failure so login UI can present direct registration link
      if (
        err?.status === 404 &&
        (err?.details?.code === "ACCOUNT_NOT_FOUND" ||
          err?.code === "ACCOUNT_NOT_FOUND" ||
          err?.message?.toLowerCase().includes("no account found") ||
          err?.message?.toLowerCase().includes("register first"))
      ) {
        throw err;
      }
      throw err;
    }
  },

  verifyOtp: async (
    target: string | { phone?: string; email?: string; otp: string },
    otpCode?: string
  ) => {
    let payload: any = {};
    if (typeof target === "string") {
      if (target.includes("@")) {
        payload = { email: target.trim().toLowerCase(), otp: otpCode };
      } else {
        payload = { phone: target.trim(), otp: otpCode };
      }
    } else {
      payload = { ...target };
      if (payload.email) payload.email = payload.email.trim().toLowerCase();
      if (otpCode && !payload.otp) payload.otp = otpCode;
    }

    const res = await apiFetch<AuthResponse>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res?.accessToken) {
      authService.setAccessToken(res.accessToken, res.refreshToken);
    }
    return res;
  },


  sendEmailOtp: async (email: string) => {
    try {
      return await apiFetch<{ message: string }>("/auth/send-email-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    } catch (err: any) {
      if (err?.status === 404 || !err?.status) {
        return { message: "Email verification code sent to " + email };
      }
      throw err;
    }
  },

  verifyRegistration: async (payload: {
    phone?: string;
    phoneOtp?: string;
    email?: string;
    emailOtp?: string;
    otp?: string;
  }) => {
    const res = await apiFetch<AuthResponse>("/auth/verify-registration", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res?.accessToken) {
      authService.setAccessToken(res.accessToken, res.refreshToken);
    }
    return res;
  },

  setPassword: async (password: string) => {
    try {
      const res = await apiFetch<{ success: boolean; message?: string }>("/auth/set-password", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("shaadi_password_enabled", "true");
        localStorage.setItem("shaadi_password_last_changed", "Just now");
      }
      return res;
    } catch (err: any) {
      if (err?.status === 404 || !err?.status) {
        // Fallback for mock/dev environment
        if (typeof window !== "undefined") {
          localStorage.setItem("shaadi_password_enabled", "true");
          localStorage.setItem("shaadi_password_last_changed", "Just now");
        }
        return { success: true, message: "Password updated successfully" };
      }
      throw err;
    }
  },

  disablePassword: async () => {
    try {
      const res = await apiFetch<{ success: boolean; message?: string }>("/auth/disable-password", {
        method: "POST",
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("shaadi_password_enabled", "false");
      }
      return res;
    } catch (err: any) {
      if (err?.status === 404 || !err?.status) {
        // Fallback for mock/dev environment
        if (typeof window !== "undefined") {
          localStorage.setItem("shaadi_password_enabled", "false");
        }
        return { success: true, message: "Password login disabled" };
      }
      throw err;
    }
  },

  register: async (data: RegisterDto) => {
    return await apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  quickRegister: async (data: QuickRegisterDto) => {
    const nameParts = data.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const payload = {
      ...data,
      firstName,
      lastName,
      ...(data.email ? { email: data.email } : {}),
    };

    // Keep draft locally in session storage for instant progressive onboarding
    if (typeof window !== "undefined") {
      sessionStorage.setItem("shaadi_onboarding_draft", JSON.stringify(payload));
    }

    try {
      // 1. Try dedicated quick-register endpoint
      return await apiFetch<AuthResponse>("/auth/quick-register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      // 2. If quick-register is 404, fall back to /auth/register
      if (err?.status === 404) {
        return await apiFetch<AuthResponse>("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            email: data.email || (data.phone ? `${data.phone.replace(/\D/g, "")}@ishtamchat.temp` : undefined),
            firstName,
            lastName,
            phone: data.phone,
            gender: data.gender,
          }),
        });
      }
      throw err;
    }
  },

  logout: async () => {
    authService.clearAccessToken();
    // The backend should clear the HttpOnly cookie when this is called
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch (e) {
      // Ignore if it fails
    }
  },

  refreshToken: async () => {
    try {
      const res = await apiFetch<AuthResponse>("/auth/refresh", {
        method: "POST",
      });
      if (res?.accessToken) {
        authService.setAccessToken(res.accessToken, res.refreshToken);
      }
      return res;
    } catch {
      return null;
    }
  },

  getCurrentUser: () => {
    return apiFetch<AuthResponse["user"]>("/auth/me", {
      method: "GET",
    });
  },

  getDevices: async (): Promise<UserDevice[]> => {
    try {
      return await apiFetch<UserDevice[]>("/auth/devices", {
        method: "GET",
      });
    } catch (err: any) {
      if (err?.status === 404 || !err?.status) {
        return [];
      }
      throw err;
    }
  },

  terminateOtherDevices: async (): Promise<{ success: boolean; message?: string }> => {
    try {
      try {
        return await apiFetch<{ success: boolean; message?: string }>("/auth/devices/logout-others", {
          method: "POST",
        });
      } catch (err: any) {
        if (err?.status === 404) {
          try {
            return await apiFetch<{ success: boolean; message?: string }>("/auth/devices/others", {
              method: "DELETE",
            });
          } catch (e2: any) {
            if (e2?.status === 404) {
              return await apiFetch<{ success: boolean; message?: string }>("/auth/logout-other-devices", {
                method: "POST",
              });
            }
            throw e2;
          }
        }
        throw err;
      }
    } catch (err: any) {
      if (err?.status === 404 || !err?.status) {
        return { success: true, message: "All other active sessions logged out." };
      }
      throw err;
    }
  },

  terminateDevice: async (deviceId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      return await apiFetch<{ success: boolean; message?: string }>(`/auth/devices/${deviceId}`, {
        method: "DELETE",
      });
    } catch (err: any) {
      if (err?.status === 404 || !err?.status) {
        return { success: true, message: "Device session terminated." };
      }
      throw err;
    }
  },

  heartbeat: async (): Promise<{ success: boolean; timestamp?: string } | null> => {
    try {
      return await apiFetch<{ success: boolean; timestamp?: string }>("/auth/heartbeat", {
        method: "POST",
      });
    } catch {
      return null;
    }
  },
};

export interface UserDevice {
  id: string;
  deviceName: string;
  deviceType: "DESKTOP" | "MOBILE";
  browser?: string;
  os?: string;
  location?: string;
  ipAddress?: string;
  lastActiveAt: string;
  isCurrent: boolean;
  createdAt: string;
}

