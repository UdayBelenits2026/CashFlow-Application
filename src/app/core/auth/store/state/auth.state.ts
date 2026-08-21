import { AuthError, AuthOperation, AuthUser } from '../../models/auth.models';

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
};