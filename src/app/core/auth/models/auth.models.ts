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

// The authenticated user/session profile persisted on the client. `userId` is the
// numeric id decoded from the JWT (distinct from `publicId`); `correlationId` comes
// from the login response envelope.
export interface AuthUser {
  userId: number | null;
  publicId: string;
  fullName: string;
  email: string;
  accountStatus: string;
  role: string;
  permissions: string[];
  sessionId: string;
  correlationId: string;
}

// Exactly matches the `data` object of the login API response.
export interface LoginData {
  publicId: string;
  fullName: string;
  email: string;
  accountStatus: string;
  role: string;
  permissions: string[];
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

// Decoded JWT access-token payload.
export interface JwtPayload {
  userId?: number;
  role?: string;
  permissions?: string[];
  sub?: string;
  iat?: number;
  exp?: number;
  [claim: string]: unknown;
}

export interface StoredSession {
  user: AuthUser;
  expiresAt: number | null;
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

export interface AccountLockData {
  lockedUntil: string;
  retryAfterSeconds: number;
  lockedAt: string;
  maxFailedAttempts: number;
  failedLoginAttempts: number;
}
export type AccountLockedResponse = ApiResponse<AccountLockData>;
