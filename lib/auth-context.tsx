"use client";

import React, { createContext, useCallback, useEffect, useState } from "react";
import axios from "axios";
import { authService } from "./auth";
import { AuthResponse, LoginRequest, UserResponse } from "@/types/auth";

export interface AuthContextType {
  user: UserResponse | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

let tokenRefreshTimeout: NodeJS.Timeout | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set up axios interceptor to include auth token in all requests
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const token = authService.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (err) => Promise.reject(err),
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // Set up axios response interceptor to handle token refresh on 401
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (err) => {
        const originalRequest = err.config;

        // If we get a 401 and haven't already tried to refresh
        if (err.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = authService.getRefreshToken();
            if (refreshToken) {
              const response =
                await authService.refreshAccessToken(refreshToken);
              authService.setTokens(
                response.accessToken,
                response.refreshToken,
              );

              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
              return axios(originalRequest);
            }
          } catch (refreshErr) {
            // Refresh failed, redirect to login
            setUser(null);
            authService.clearTokens();
            authService.clearUser();
            setError("Session expired. Please log in again.");
            return Promise.reject(refreshErr);
          }
        }

        return Promise.reject(err);
      },
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = () => {
      try {
        const savedUser = authService.getUser();
        if (savedUser && authService.getAccessToken()) {
          setUser(savedUser);
        }
      } catch (err) {
        console.error("Failed to restore session:", err);
        authService.clearTokens();
        authService.clearUser();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Schedule proactive token refresh
  const scheduleTokenRefresh = useCallback((expiresIn: number) => {
    if (tokenRefreshTimeout) {
      clearTimeout(tokenRefreshTimeout);
    }

    // Refresh when 90% of token lifetime has passed
    const refreshTime = Math.max(expiresIn * 0.9 * 1000, 60000); // Min 1 minute

    tokenRefreshTimeout = setTimeout(async () => {
      try {
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          const response = await authService.refreshAccessToken(refreshToken);
          authService.setTokens(response.accessToken, response.refreshToken);
          scheduleTokenRefresh(response.expiresIn);
        }
      } catch (err) {
        console.error("Proactive token refresh failed:", err);
      }
    }, refreshTime);
  }, []);

  const login = useCallback(
    async (emailOrUsername: string, password: string) => {
      setError(null);
      setLoading(true);

      try {
        const response = await authService.login({
          emailOrUsername,
          password,
        } as LoginRequest);

        authService.setTokens(response.accessToken, response.refreshToken);
        authService.setUser(response.user);
        setUser(response.user);

        // Schedule proactive token refresh
        scheduleTokenRefresh(response.expiresIn);
      } catch (err: any) {
        const errorMessage = err?.message || "Login failed";
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [scheduleTokenRefresh],
  );

  const logout = useCallback(async () => {
    setLoading(true);

    try {
      const refreshToken = authService.getRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (err) {
      console.error("Logout API call failed:", err);
    } finally {
      // Clear local state regardless of API call result
      if (tokenRefreshTimeout) {
        clearTimeout(tokenRefreshTimeout);
      }
      authService.clearTokens();
      authService.clearUser();
      setUser(null);
      setError(null);
      setLoading(false);
    }
  }, []);

  const refreshTokenFn = useCallback(async () => {
    try {
      const refreshToken = authService.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await authService.refreshAccessToken(refreshToken);
      authService.setTokens(response.accessToken, response.refreshToken);
      scheduleTokenRefresh(response.expiresIn);
    } catch (err: any) {
      setUser(null);
      authService.clearTokens();
      authService.clearUser();
      const errorMessage = err?.message || "Token refresh failed";
      setError(errorMessage);
      throw err;
    }
  }, [scheduleTokenRefresh]);

  const requestPasswordReset = useCallback(async (email: string) => {
    setError(null);

    try {
      await authService.requestPasswordReset(email);
    } catch (err: any) {
      const errorMessage = err?.message || "Password reset request failed";
      setError(errorMessage);
      throw err;
    }
  }, []);

  const confirmPasswordReset = useCallback(
    async (token: string, newPassword: string) => {
      setError(null);

      try {
        await authService.confirmPasswordReset(token, newPassword);
      } catch (err: any) {
        const errorMessage = err?.message || "Password reset failed";
        setError(errorMessage);
        throw err;
      }
    },
    [],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    refreshToken: refreshTokenFn,
    requestPasswordReset,
    confirmPasswordReset,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
