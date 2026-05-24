export interface BackendRole {
  id: string;
  name: string;
  description?: string;
  permissions?: { id: string; name: string; description?: string }[];
}

// Shape returned directly by the backend
export interface UserResponse {
  id: string;
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  // Backend returns roles as an array of role objects
  roles?: BackendRole[];
  // Normalized single role string derived from roles[0].name — used by all UI components
  role: string;
  // Derived display name
  name: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserResponse;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface PasswordResetInitRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface AuthError {
  code: string;
  message: string;
  statusCode: number;
}
