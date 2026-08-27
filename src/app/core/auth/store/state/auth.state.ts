import { AccountLockData, AuthError, AuthUser, ResetPasswordData } from '../../models/auth.models';
import { AuthOperation } from '../../constants/auth.constants';

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  correlationId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: AuthError | null;
  accountLock: AccountLockData | null;
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
  correlationId: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  accountLock: null,
  operation: null,
  successMessage: null,
  notice: null,
  resetPasswordLoading: false,
  resetPasswordSuccess: false,
  resetPasswordMessage: null,
  resetPasswordError: null,
  resetPasswordData: null,
};