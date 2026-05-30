import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { permissionApi, roleApi, userApi } from "@/lib/admin";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axios);

const user = { id: "user-1", email: "ada@example.com", username: "ada" };
const role = { id: "role-1", name: "ADMIN", permissions: [] };
const permission = { id: "perm-1", name: "users:read" };

describe("admin APIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches paged users with default paging", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { content: [user], totalElements: 1 } });

    await expect(userApi.getAll()).resolves.toEqual({ content: [user], totalElements: 1 });
    expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8000/api/v1/users?page=0&size=10", {
      timeout: 10000,
    });
  });

  it("fetches paged users with custom paging", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { content: [] } });

    await userApi.getAll(2, 25);

    expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8000/api/v1/users?page=2&size=25", {
      timeout: 10000,
    });
  });

  it("fetches a user by id", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: user });

    await expect(userApi.getById("user-1")).resolves.toEqual(user);
    expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8000/api/v1/users/user-1", {
      timeout: 10000,
    });
  });

  it("creates a user", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: user });

    await expect(userApi.create({ email: "ada@example.com" } as never)).resolves.toEqual(user);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/users",
      { email: "ada@example.com" },
      { timeout: 10000 },
    );
  });

  it("updates a user", async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: user });

    await expect(userApi.update("user-1", { email: "ada@example.com" } as never)).resolves.toEqual(user);
    expect(mockedAxios.put).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/users/user-1",
      { email: "ada@example.com" },
      { timeout: 10000 },
    );
  });

  it("deletes a user", async () => {
    mockedAxios.delete.mockResolvedValueOnce({});

    await expect(userApi.delete("user-1")).resolves.toBeUndefined();
    expect(mockedAxios.delete).toHaveBeenCalledWith("http://localhost:8000/api/v1/users/user-1", {
      timeout: 10000,
    });
  });

  it("assigns a role to a user", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: user });

    await expect(userApi.assignRole("user-1", "role-1")).resolves.toEqual(user);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/users/user-1/roles/role-1",
      {},
      { timeout: 10000 },
    );
  });

  it("removes a role from a user", async () => {
    mockedAxios.delete.mockResolvedValueOnce({ data: user });

    await expect(userApi.removeRole("user-1", "role-1")).resolves.toEqual(user);
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/users/user-1/roles/role-1",
      { timeout: 10000 },
    );
  });

  it("fetches the current user", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: user });

    await expect(userApi.getCurrentUser()).resolves.toEqual(user);
    expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8000/api/v1/users/me", {
      timeout: 10000,
    });
  });

  it("fetches all roles", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [role] });

    await expect(roleApi.getAll()).resolves.toEqual([role]);
    expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8000/api/v1/roles", { timeout: 10000 });
  });

  it("creates a role", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: role });

    await expect(roleApi.create({ name: "ADMIN" } as never)).resolves.toEqual(role);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/roles",
      { name: "ADMIN" },
      { timeout: 10000 },
    );
  });

  it("updates a role", async () => {
    mockedAxios.put.mockResolvedValueOnce({ data: role });

    await expect(roleApi.update("role-1", { name: "ADMIN" } as never)).resolves.toEqual(role);
    expect(mockedAxios.put).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/roles/role-1",
      { name: "ADMIN" },
      { timeout: 10000 },
    );
  });

  it("deletes a role", async () => {
    mockedAxios.delete.mockResolvedValueOnce({});

    await expect(roleApi.delete("role-1")).resolves.toBeUndefined();
    expect(mockedAxios.delete).toHaveBeenCalledWith("http://localhost:8000/api/v1/roles/role-1", {
      timeout: 10000,
    });
  });

  it("assigns a permission to a role", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: role });

    await expect(roleApi.assignPermission("role-1", "perm-1")).resolves.toEqual(role);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/roles/role-1/permissions/perm-1",
      {},
      { timeout: 10000 },
    );
  });

  it("removes a permission from a role", async () => {
    mockedAxios.delete.mockResolvedValueOnce({ data: role });

    await expect(roleApi.removePermission("role-1", "perm-1")).resolves.toEqual(role);
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/roles/role-1/permissions/perm-1",
      { timeout: 10000 },
    );
  });

  it("fetches all permissions", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [permission] });

    await expect(permissionApi.getAll()).resolves.toEqual([permission]);
    expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8000/api/v1/roles/permissions", {
      timeout: 10000,
    });
  });

  it("creates a permission", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: permission });

    await expect(permissionApi.create({ name: "users:read" } as never)).resolves.toEqual(permission);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/roles/permissions",
      { name: "users:read" },
      { timeout: 10000 },
    );
  });

  it("maps conflict errors", async () => {
    mockedAxios.post.mockRejectedValueOnce({ response: { status: 409, data: { message: "Duplicate user" } } });

    await expect(userApi.create({ email: "ada@example.com" } as never)).rejects.toEqual({
      code: "API_ERROR",
      message: "Duplicate user",
      statusCode: 409,
    });
  });

  it("maps not found errors", async () => {
    mockedAxios.get.mockRejectedValueOnce({ response: { status: 404 } });

    await expect(userApi.getById("missing")).rejects.toEqual({
      code: "API_ERROR",
      message: "Resource not found",
      statusCode: 404,
    });
  });

  it("maps generic axios messages", async () => {
    mockedAxios.get.mockRejectedValueOnce({ message: "Network Error" });

    await expect(roleApi.getAll()).rejects.toEqual({
      code: "API_ERROR",
      message: "Network Error",
      statusCode: 500,
    });
  });
});
