export type AuthOperation = 'LOGIN' | 'REGISTER' | null;

// Single source of truth for the inactivity timeout (5 minutes).
export const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

// User-facing messages generated on the frontend.
export const AUTH_MESSAGES = {
  logoutSuccess: 'Logout successful.',
  registerSuccess: 'Account created successfully.',
  inactivity: 'Your session has expired due to inactivity. Please sign in again.',
  unauthorized: 'Your session has expired. Please sign in again.',
} as const;

export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  correlationId: string;
}

export interface RegisteredUser {
  publicId: string;
  fullName: string;
  email: string;
  accountStatus: string;
  role: string;
}

export interface AuthUser {
  publicId: string;
  fullName: string;
  email: string;
  accountStatus: string;
  roles: string[];
  permissions: string[];
}

export interface LoginData {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
  user: AuthUser;
}

export interface StoredSession {
  user: AuthUser;
  expiresAt: number | null;
  expiresInSeconds: number;
}

export interface LogoutData {
  publicId: string;
  fullName: string;
}

export type LoginResponse = ApiResponse<LoginData>;
export type RegisterResponse = ApiResponse<RegisteredUser>;
export type LogoutResponse = ApiResponse<LogoutData>;
export interface AuthError { code: string; message: string; correlationId?: string; }
export interface AuthSidePanelConfig {
  image: string;
  title: string;
  description: string;
  showCashFlowStats?: boolean;
  showSecurityPoints?: boolean;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}
export interface RoleGuardData {
  roles?: string[];
}
export interface ForgotPassword{
  newPassword:string;
  confirmPassword:string;
}
export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
  confirmPassword: string;
}
export interface ResetPasswordData {
  publicId: string;
  email: string;
}
export type ResetPasswordResponse = ApiResponse<ResetPasswordData>;

export interface RefreshTokenRequest {
  refreshToken: string;
}
export interface RefreshTokenData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}
export type RefreshTokenResponse = ApiResponse<RefreshTokenData>;
