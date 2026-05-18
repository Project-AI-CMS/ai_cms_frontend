export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role:
    | "Administrator"
    | "Maintenance Manager"
    | "Maintenance Worker"
    | "Safety Officer"
    | "Viewer";
  isActive?: boolean;
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
