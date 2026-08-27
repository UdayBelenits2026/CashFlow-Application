import { createAction, props } from '@ngrx/store';
import {
  AccountLockData,
  AuthError,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordData,
  ResetPasswordRequest,
} from '../../models/auth.models';

// Payload persisted into auth state after a successful sign-in or session restore.
export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  correlationId: string;
}

export const login = createAction('[Auth] Login', props<{ request: LoginRequest }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ session: AuthSession }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: AuthError }>());
export const loginLocked = createAction('[Auth] Login Locked', props<{ lock: AccountLockData }>());
export const clearAccountLock = createAction('[Auth] Clear Account Lock');
export const restoreSession = createAction('[Auth] Restore Session', props<{ session: AuthSession }>());
export const register = createAction('[Auth] Register', props<{ request: RegisterRequest }>());
export const registerSuccess = createAction('[Auth] Register Success', props<{ response: RegisterResponse }>());
export const registerFailure = createAction('[Auth] Register Failure', props<{ error: AuthError }>());
export const logout = createAction('[Auth] Logout');
export const sessionExpired = createAction('[Auth] Session Expired', props<{ message: string }>());
export const sessionRenewed = createAction('[Auth] Session Renewed', props<{ expiresIn: number }>());
export const clearAuthError = createAction('[Auth] Clear Error');

export const resetPassword = createAction(
  '[Auth] Reset Password',
  props<{ request: ResetPasswordRequest }>(),
);
export const resetPasswordSuccess = createAction(
  '[Auth] Reset Password Success',
  props<{ message: string; data: ResetPasswordData }>(),
);
export const resetPasswordFailure = createAction(
  '[Auth] Reset Password Failure',
  props<{ error: AuthError }>(),
);
export const clearResetPasswordState = createAction('[Auth] Clear Reset Password State');
