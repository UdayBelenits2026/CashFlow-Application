import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { AuthError, AuthOperation, AuthUser } from '../models/auth.models';

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
  user: null, accessToken: null, tokenType: null, expiresIn: null, isAuthenticated: false,
  loading: false, error: null, operation: null, successMessage: null,
};

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.login, AuthActions.register, (state, action) => ({ ...state, loading: true, error: null, successMessage: null, operation: action.type.includes('Login') ? 'LOGIN' : 'REGISTER' })),
  on(AuthActions.loginSuccess, (state, { data }) => ({ ...state, user: data.user, accessToken: data.accessToken, tokenType: data.tokenType, expiresIn: data.expiresIn, isAuthenticated: true, loading: false, error: null, operation: null })),
  on(AuthActions.loginFailure, AuthActions.registerFailure, (state, { error }) => ({ ...state, loading: false, error, operation: null })),
  on(AuthActions.registerSuccess, (state, { response }) => ({ ...state, loading: false, error: null, operation: null, successMessage: response.message })),
  on(AuthActions.clearAuthError, (state) => ({ ...state, error: null })),
);
