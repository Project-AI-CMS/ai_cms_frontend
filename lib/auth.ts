import axios from "axios";
import {
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  PasswordResetInitRequest,
  PasswordResetConfirmRequest,
} from "@/types/auth";

const AUTH_API_URL =
  process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8000/api/v1";

const TOKEN_KEY = "ai_cms_access_token";
const REFRESH_TOKEN_KEY = "ai_cms_refresh_token";
const USER_KEY = "ai_cms_user";

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${AUTH_API_URL}/auth/login`,
        credentials,
        { timeout: 10000 },
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };

      let message = "Login failed";
      const statusCode = axiosError.response?.status || 500;

      if (statusCode === 401) {
        message = "Invalid email/username or password";
      } else if (statusCode === 423) {
        message =
          "Account locked due to too many failed login attempts. Please try again later.";
      } else if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message) {
        message = axiosError.message;
      }

      throw {
        code: "LOGIN_FAILED",
        message,
        statusCode,
      };
    }
  },

  async logout(refreshToken: string): Promise<void> {
    try {
      await axios.post(
        `${AUTH_API_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.getAccessToken()}`,
          },
          timeout: 10000,
        },
      );
    } catch (err: unknown) {
      // Log error but don't throw - logout should always clear local state
      console.error("Logout API call failed:", err);
    }
  },

  async refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${AUTH_API_URL}/auth/refresh`,
        { refreshToken } as RefreshTokenRequest,
        { timeout: 10000 },
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };

      let message = "Token refresh failed";
      const statusCode = axiosError.response?.status || 500;

      if (statusCode === 400) {
        message = "Invalid or expired refresh token";
      } else if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      }

      throw {
        code: "REFRESH_FAILED",
        message,
        statusCode,
      };
    }
  },

  async requestPasswordReset(
    email: PasswordResetInitRequest["email"],
  ): Promise<void> {
    try {
      await axios.post(
        `${AUTH_API_URL}/auth/password-reset/request`,
        { email } as PasswordResetInitRequest,
        { timeout: 10000 },
      );
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };

      let message = "Password reset request failed";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message) {
        message = axiosError.message;
      }

      throw {
        code: "RESET_REQUEST_FAILED",
        message,
        statusCode: axiosError.response?.status || 500,
      };
    }
  },

  async confirmPasswordReset(
    token: string,
    newPassword: string,
  ): Promise<void> {
    try {
      await axios.post(
        `${AUTH_API_URL}/auth/password-reset/confirm`,
        { token, newPassword } as PasswordResetConfirmRequest,
        { timeout: 10000 },
      );
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };

      let message = "Password reset failed";
      const statusCode = axiosError.response?.status || 500;

      if (statusCode === 400) {
        message = "Invalid, expired, or already-used reset token";
      } else if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      }

      throw {
        code: "RESET_CONFIRM_FAILED",
        message,
        statusCode,
      };
    }
  },

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
    return null;
  },

  clearTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  setUser(user: any): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  getUser(): any | null {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  clearUser(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_KEY);
    }
  },

  getTokenExpiresIn(): number | null {
    try {
      const token = this.getAccessToken();
      if (!token) return null;

      // Try to decode JWT to get expiration time
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const decoded = JSON.parse(atob(parts[1]));
      return decoded.exp ? (decoded.exp * 1000 - Date.now()) / 1000 : null;
    } catch {
      return null;
    }
  },
};
