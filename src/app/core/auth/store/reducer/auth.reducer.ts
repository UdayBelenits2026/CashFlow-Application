import { createReducer, on } from '@ngrx/store';
import * as AuthActions from '../actions/auth.actions';
import { initialAuthState } from '../state/auth.state';

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.login, AuthActions.register, (state, action) => ({
    ...state,
    loading: true,
    error: null,
    successMessage: null,
    operation: action.type.includes('Login') ? 'LOGIN' : 'REGISTER',
  })),
  on(AuthActions.loginSuccess, AuthActions.restoreSession, (state, { data }) => ({
    ...state,
    user: data.user,
    accessToken: data.accessToken,
    tokenType: data.tokenType,
    expiresIn: data.expiresIn,
    isAuthenticated: true,
    loading: false,
    error: null,
    operation: null,
  })),
  on(AuthActions.loginFailure, AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    operation: null,
  })),
  on(AuthActions.registerSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    error: null,
    operation: null,
    successMessage: response.message,
  })),
  on(AuthActions.logout, () => ({ ...initialAuthState })),
  on(AuthActions.clearAuthError, (state) => ({ ...state, error: null })),
);
