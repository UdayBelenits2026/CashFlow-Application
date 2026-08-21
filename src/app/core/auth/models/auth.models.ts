export type AuthOperation = 'LOGIN' | 'REGISTER' | null;

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
  user: AuthUser;
}

export interface StoredAuthSession {
  accessToken: string;
  tokenType: string;
  expiresAt: number;
  user: AuthUser;
}

export type LoginResponse = ApiResponse<LoginData>;
export type RegisterResponse = ApiResponse<RegisteredUser>;
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
