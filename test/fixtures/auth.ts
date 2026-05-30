import { AuthResponse } from "@/types/auth";

export const authResponse: AuthResponse = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  tokenType: "Bearer",
  expiresIn: 3600,
  user: {
    id: "user-1",
    username: "admin",
    email: "admin@example.com",
    firstName: "Ada",
    lastName: "Admin",
    role: "ADMIN",
    name: "Ada Admin",
    roles: [{ id: "role-1", name: "ADMIN", description: "Admin" }],
  },
};
