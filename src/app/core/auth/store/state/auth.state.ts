import { AuthError, AuthOperation, AuthUser, ResetPasswordData } from '../../models/auth.models';

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: AuthError | null;
  operation: AuthOperation;
  successMessage: string | null;
  notice: string | null;
  resetPasswordLoading: boolean;
  resetPasswordSuccess: boolean;
  resetPasswordMessage: string | null;
  resetPasswordError: string | null;
  resetPasswordData: ResetPasswordData | null;
}

export const initialAuthState: AuthState = {
  user: null,
  accessToken: null,
  tokenType: null,
  expiresIn: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  operation: null,
  successMessage: null,
  notice: null,
  resetPasswordLoading: false,
  resetPasswordSuccess: false,
  resetPasswordMessage: null,
  resetPasswordError: null,
  resetPasswordData: null,
};