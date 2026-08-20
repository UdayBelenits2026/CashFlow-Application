import { createAction, props } from '@ngrx/store';
import { AuthError, LoginData, LoginRequest, RegisterRequest, RegisterResponse } from '../models/auth.models';

export const login = createAction('[Auth] Login', props<{ request: LoginRequest }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ data: LoginData }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: AuthError }>());
export const register = createAction('[Auth] Register', props<{ request: RegisterRequest }>());
export const registerSuccess = createAction('[Auth] Register Success', props<{ response: RegisterResponse }>());
export const registerFailure = createAction('[Auth] Register Failure', props<{ error: AuthError }>());
export const clearAuthError = createAction('[Auth] Clear Error');
