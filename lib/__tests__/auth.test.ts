import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authResponse } from "@/test/fixtures/auth";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axios);

describe("authService", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("logs in with the expected endpoint and payload", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: authResponse });
    const { authService } = await import("@/lib/auth");

    const response = await authService.login({
      emailOrUsername: "admin@example.com",
      password: "secret",
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/auth/login",
      { emailOrUsername: "admin@example.com", password: "secret" },
      { timeout: 10000 },
    );
    expect(response).toEqual(authResponse);
  });

  it("maps invalid credentials to a user-facing auth error", async () => {
    mockedAxios.post.mockRejectedValueOnce({ response: { status: 401 } });
    const { authService } = await import("@/lib/auth");

    await expect(
      authService.login({ emailOrUsername: "admin", password: "wrong" }),
    ).rejects.toEqual({
      code: "LOGIN_FAILED",
      message: "Invalid email/username or password",
      statusCode: 401,
    });
  });

  it("stores and clears tokens and the current user", async () => {
    const { authService } = await import("@/lib/auth");

    authService.setTokens("access", "refresh");
    authService.setUser(authResponse.user);

    expect(authService.getAccessToken()).toBe("access");
    expect(authService.getRefreshToken()).toBe("refresh");
    expect(authService.getUser()).toEqual(authResponse.user);

    authService.clearTokens();
    authService.clearUser();

    expect(authService.getAccessToken()).toBeNull();
    expect(authService.getRefreshToken()).toBeNull();
    expect(authService.getUser()).toBeNull();
  });

  it("logs out with the current access token", async () => {
    mockedAxios.post.mockResolvedValueOnce({});
    const { authService } = await import("@/lib/auth");

    authService.setTokens("access", "refresh");
    await authService.logout("refresh");

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/auth/logout",
      {},
      { headers: { Authorization: "Bearer access" }, timeout: 10000 },
    );
  });

  it("does not throw when logout API fails", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("network"));
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const { authService } = await import("@/lib/auth");

    await expect(authService.logout("refresh")).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalled();
  });

  it("refreshes the access token with the expected payload", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: authResponse });
    const { authService } = await import("@/lib/auth");

    const response = await authService.refreshAccessToken("refresh-token");

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/auth/refresh",
      { refreshToken: "refresh-token" },
      { timeout: 10000 },
    );
    expect(response).toEqual(authResponse);
  });

  it("maps invalid refresh token errors", async () => {
    mockedAxios.post.mockRejectedValueOnce({ response: { status: 400 } });
    const { authService } = await import("@/lib/auth");

    await expect(authService.refreshAccessToken("bad-token")).rejects.toEqual({
      code: "REFRESH_FAILED",
      message: "Invalid or expired refresh token",
      statusCode: 400,
    });
  });

  it("requests password reset for the supplied email", async () => {
    mockedAxios.post.mockResolvedValueOnce({});
    const { authService } = await import("@/lib/auth");

    await authService.requestPasswordReset("ada@example.com");

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/auth/password-reset/request",
      { email: "ada@example.com" },
      { timeout: 10000 },
    );
  });

  it("maps password reset request failures", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 500, data: { message: "Mail service unavailable" } },
    });
    const { authService } = await import("@/lib/auth");

    await expect(authService.requestPasswordReset("ada@example.com")).rejects.toEqual({
      code: "RESET_REQUEST_FAILED",
      message: "Mail service unavailable",
      statusCode: 500,
    });
  });

  it("confirms password reset with token and new password", async () => {
    mockedAxios.post.mockResolvedValueOnce({});
    const { authService } = await import("@/lib/auth");

    await authService.confirmPasswordReset("reset-token", "new-password");

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/auth/password-reset/confirm",
      { token: "reset-token", newPassword: "new-password" },
      { timeout: 10000 },
    );
  });

  it("maps invalid password reset confirmation tokens", async () => {
    mockedAxios.post.mockRejectedValueOnce({ response: { status: 400 } });
    const { authService } = await import("@/lib/auth");

    await expect(
      authService.confirmPasswordReset("expired-token", "new-password"),
    ).rejects.toEqual({
      code: "RESET_CONFIRM_FAILED",
      message: "Invalid, expired, or already-used reset token",
      statusCode: 400,
    });
  });

  it("returns null token expiry when no access token exists", async () => {
    const { authService } = await import("@/lib/auth");

    expect(authService.getTokenExpiresIn()).toBeNull();
  });

  it("returns null token expiry for malformed JWT values", async () => {
    const { authService } = await import("@/lib/auth");

    authService.setTokens("not-a-jwt", "refresh");

    expect(authService.getTokenExpiresIn()).toBeNull();
  });
});
