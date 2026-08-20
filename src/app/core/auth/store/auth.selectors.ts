import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');
export const selectUser = createSelector(selectAuthState, (state) => state.user);
export const selectAccessToken = createSelector(selectAuthState, (state) => state.accessToken);
export const selectIsAuthenticated = createSelector(selectAuthState, (state) => state.isAuthenticated);
export const selectLoading = createSelector(selectAuthState, (state) => state.loading);
export const selectError = createSelector(selectAuthState, (state) => state.error);
export const selectSuccessMessage = createSelector(selectAuthState, (state) => state.successMessage);
