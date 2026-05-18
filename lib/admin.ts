import axios from "axios";
import {
  User,
  Role,
  Permission,
  PagedUser,
  CreateUserRequest,
  UpdateUserRequest,
  CreateRoleRequest,
  CreatePermissionRequest,
} from "@/types/admin";

const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8000/api/v1";

const handleError = (err: unknown, defaultMessage: string) => {
  const axiosError = err as {
    response?: { status?: number; data?: { message?: string } };
    message?: string;
  };

  let message = defaultMessage;
  const statusCode = axiosError.response?.status || 500;

  if (statusCode === 409) {
    message = axiosError.response?.data?.message || "Resource already exists";
  } else if (statusCode === 404) {
    message = "Resource not found";
  } else if (axiosError.response?.data?.message) {
    message = axiosError.response.data.message;
  } else if (axiosError.message) {
    message = axiosError.message;
  }

  return { code: "API_ERROR", message, statusCode };
};

export const userApi = {
  async getAll(page: number = 0, size: number = 10): Promise<PagedUser> {
    try {
      const response = await axios.get<PagedUser>(
        `${AUTH_API_URL}/users?page=${page}&size=${size}`,
        { timeout: 10000 }
      );
      return response.data;
    } catch (err) {
      throw handleError(err, "Failed to fetch users");
    }
  },

  async getById(id: string): Promise<User> {
    try {
      const response = await axios.get<User>(`${AUTH_API_URL}/users/${id}`, {
        timeout: 10000,
      });
      return response.data;
    } catch (err) {
      throw handleError(err, "Failed to fetch user");
    }
  },

  async create(data: CreateUserRequest): Promise<User> {
    try {
      const response = await axios.post<User>(
        `${AUTH_API_URL}/users`,
        data,
        { timeout: 10000 }
      );
      return response.data;
    } catch (err) {
      throw handleError(err, "Failed to create user");
    }
  },

  async update(id: string, data: UpdateUserRequest): Promise<User> {
    try {
      const response = await axios.put<User>(
        `${AUTH_API_URL}/users/${id}`,
        data,
        { timeout: 10000 }
      );
      return response.data;
    } catch (err) {
      throw handleError(err, "Failed to update user");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${AUTH_API_URL}/users/${id}`, { timeout: 10000 });
    } catch (err) {
      throw handleError(err, "Failed to delete user");
    }
  },

  async assignRole(userId: string, roleId: string): Promise<User> {
    try {
      const response = await axios.post<User>(
        `${AUTH_API_URL}/users/${userId}/roles/${roleId}`,
        {},
        { timeout: 10000 }
      );
      return response.data;
    } catch (err) {
      throw handleError(err, "Failed to assign role");
    }
  },

  async removeRole(userId: string, roleId: string): Promise<User> {
    try {
      const response = await axios.delete<User>(
        `${AUTH_API_URL}/users/${userId}/roles/${roleId}`,
        { timeout: 10000 }
      );
      return response.data;
    } catch (err) {
      throw handleError(err, "Failed to remove role");
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      const response = await axios.get<User>(`${AUTH_API_URL}/users/me`, {
        timeout: 10000,
      });
      return response.data;
    } catch (err) {
      throw handleError(err, "Failed to fetch current user");
    }
  },
};

export const roleApi = {
  async getAll(): Promise<Role[]> {
    try {
      const response = await axios.get<Role[]>(`${AUTH_API_URL}/roles`, {
        timeout: 10000,
      });
      return response.data;
    } catch (err) {
      throw handleError(err, "Failed to fetch roles");
    }
  },

  async getById(id: string): Promise<Role> {
    try {
      const response = await axios.get<Role>(`${AUTH_API_URL}/roles/${id}`, {
        timeout: 10000,
      });
      return response.data;
    } catch (err) {
      throw handleError(err, "Failed to fetch role");
    }
  },

  async create(data: CreateRoleRequest): Promise<Role> {
    try {
      const response = await axios.post<Role>(
        `${AUTH_API_URL}/roles`,
        data,
        { timeout: 10000 }
      );
      return response.data;
    } catch (err) {
      throw handleError(err, "Failed to create role");
    }
  },

  async update(id: string, data: CreateRoleRequest): Promise<Role> {
    try {
      const response = await axios.put<Role>(
        `${AUTH_API_URL}/roles/${id}`,
        data,
        { timeout: 10000 }
      );
      return response.data;
    } catch (err) {
      throw handleError(err, "Failed to update role");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${AUTH_API_URL}/roles/${id}`, { timeout: 10000 });
    } catch (err) {
      throw handleError(err, "Failed to delete role");
    }
  },

  async assignPermission(roleId: string, permissionId: string): Promise<Role> {
    try {
      const response = await axios.post<Role>(
        `${AUTH_API_URL}/roles/${roleId}/permissions/${permissionId}`,
        {},
        { timeout: 10000 }
      );
      return response.data;
    } catch (err) {
      throw handleError(err, "Failed to assign permission");
    }
  },

  async removePermission(roleId: string, permissionId: string): Promise<Role> {
    try {
      const response = await axios.delete<Role>(
        `${AUTH_API_URL}/roles/${roleId}/permissions/${permissionId}`,
        { timeout: 10000 }
      );
      return response.data;
    } catch (err) {
      throw handleError(err, "Failed to remove permission");
    }
  },
};

export const permissionApi = {
  async getAll(): Promise<Permission[]> {
    try {
      const response = await axios.get<Permission[]>(
        `${AUTH_API_URL}/roles/permissions`,
        { timeout: 10000 }
      );
      return response.data;
    } catch (err) {
      throw handleError(err, "Failed to fetch permissions");
    }
  },

  async create(data: CreatePermissionRequest): Promise<Permission> {
    try {
      const response = await axios.post<Permission>(
        `${AUTH_API_URL}/roles/permissions`,
        data,
        { timeout: 10000 }
      );
      return response.data;
    } catch (err) {
      throw handleError(err, "Failed to create permission");
    }
  },
};
