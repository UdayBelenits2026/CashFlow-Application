import { createReducer, on } from '@ngrx/store';
import * as AuthActions from '../actions/auth.actions';
import { initialAuthState } from '../state/auth.state';
import { AUTH_MESSAGES } from '../../constants/auth.constants';

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.login, AuthActions.register, (state, action) => ({
    ...state,
    loading: true,
    error: null,
    accountLock: null,
    successMessage: null,
    notice: null,
    operation: action.type.includes('Login') ? 'LOGIN' : 'REGISTER',
  })),
  on(AuthActions.loginSuccess, AuthActions.restoreSession, (state, { session }) => ({
    ...state,
    user: session.user,
    accessToken: session.accessToken,
    correlationId: session.correlationId,
    isAuthenticated: true,
    loading: false,
    error: null,
    notice: null,
    operation: null,
  })),
  on(AuthActions.loginFailure, AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    operation: null,
  })),
  on(AuthActions.loginLocked, (state, { lock }) => ({
    ...state,
    loading: false,
    error: null,
    accountLock: lock,
    operation: null,
  })),
  on(AuthActions.clearAccountLock, (state) => ({
    ...state,
    accountLock: null,
  })),
  on(AuthActions.registerSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    error: null,
    operation: null,
    // Surfaced via `notice` so it survives navigation to the sign-in page.
    notice: response.message || AUTH_MESSAGES.registerSuccess,
  })),
  on(AuthActions.logout, () => ({
    ...initialAuthState,
    notice: AUTH_MESSAGES.logoutSuccess,
  })),
  on(AuthActions.sessionExpired, (_state, { message }) => ({
    ...initialAuthState,
    notice: message,
  })),
  on(AuthActions.clearAuthError, (state) => ({ ...state, error: null })),
  on(AuthActions.resetPassword, (state) => ({
    ...state,
    resetPasswordLoading: true,
    resetPasswordSuccess: false,
    resetPasswordMessage: null,
    resetPasswordError: null,
    resetPasswordData: null,
  })),
  on(AuthActions.resetPasswordSuccess, (state, { message, data }) => ({
    ...state,
    resetPasswordLoading: false,
    resetPasswordSuccess: true,
    resetPasswordMessage: message,
    resetPasswordError: null,
    resetPasswordData: data,
  })),
  on(AuthActions.resetPasswordFailure, (state, { error }) => ({
    ...state,
    resetPasswordLoading: false,
    resetPasswordSuccess: false,
    resetPasswordError: error.message,
    resetPasswordData: null,
  })),
  on(AuthActions.clearResetPasswordState, (state) => ({
    ...state,
    resetPasswordLoading: false,
    resetPasswordSuccess: false,
    resetPasswordMessage: null,
    resetPasswordError: null,
    resetPasswordData: null,
  })),
);
