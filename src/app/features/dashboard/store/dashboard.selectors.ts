import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DashboardState } from '../models/dashboard.models';
export const selectDashboardState = createFeatureSelector<DashboardState>('dashboard');
export const selectSummaryCards = createSelector(selectDashboardState, (state) =>
  state.isNewUser
    ? state.summaryCards.map((card) => ({
        ...card,
        amount: 0,
        percentage: 0,
        comparison: 'vs Apr 2026',
      }))
    : state.summaryCards,
);
export const selectUpcomingBills = createSelector(
  selectDashboardState,
  (state) => state.upcomingBills,
);
export const selectRecentTransactions = createSelector(
  selectDashboardState,
  (state) => state.recentTransactions,
);
export const selectRecentIncome = createSelector(
  selectDashboardState,
  (state) => state.recentIncome,
);
export const selectRecentExpenses = createSelector(
  selectDashboardState,
  (state) => state.recentExpenses,
);
export const selectQuickActions = createSelector(
  selectDashboardState,
  (state) => state.quickActions,
);
export const selectOnboardingSteps = createSelector(
  selectDashboardState,
  (state) => state.onboardingSteps,
);
export const selectOnboardingActions = createSelector(
  selectDashboardState,
  (state) => state.onboardingActions,
);
export const selectIsNewUser = createSelector(selectDashboardState, (state) => state.isNewUser);
export const selectCashBalance = createSelector(selectDashboardState, (state) => state.cashBalance);
export const selectSelectedAction = createSelector(
  selectDashboardState,
  (state) => state.selectedAction,
);
export const selectDashboardLoading = createSelector(
  selectDashboardState,
  (state) => state.loading,
);
export const selectDashboardLoadError = createSelector(
  selectDashboardState,
  (state) => state.loadError,
);
