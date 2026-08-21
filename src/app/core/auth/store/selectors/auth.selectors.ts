import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../state/auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');
export const selectUser = createSelector(selectAuthState, (state) => state.user);
export const selectAccessToken = createSelector(selectAuthState, (state) => state.accessToken);
export const selectTokenType = createSelector(selectAuthState, (state) => state.tokenType);
export const selectExpiresIn = createSelector(selectAuthState, (state) => state.expiresIn);
export const selectIsAuthenticated = createSelector(selectAuthState, (state) => state.isAuthenticated);
export const selectRoles = createSelector(selectUser, (user) => user?.roles ?? []);
export const selectPermissions = createSelector(selectUser, (user) => user?.permissions ?? []);
export const selectLoading = createSelector(selectAuthState, (state) => state.loading);
export const selectError = createSelector(selectAuthState, (state) => state.error);
export const selectSuccessMessage = createSelector(selectAuthState, (state) => state.successMessage);
