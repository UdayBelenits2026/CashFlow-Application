import { createReducer, on } from '@ngrx/store';
import { initialDashboardState } from '../data/dashboard.data';
import * as DashboardActions from './dashboard.actions';
export const dashboardReducer = createReducer(
  initialDashboardState,
  on(DashboardActions.loadDashboard, (state) => ({
    ...state,
    loading: true,
    loadError: false,
  })),
  on(DashboardActions.loadDashboardSuccess, (state, { data }) => ({
    ...state,
    summaryCards: data.summaryCards,
    upcomingBills: data.upcomingBills,
    recentTransactions: data.recentTransactions,
    recentIncome: data.recentIncome,
    recentExpenses: data.recentExpenses,
    quickActions: data.quickActions,
    onboardingSteps: data.onboardingSteps,
    onboardingActions: data.onboardingActions,
    isNewUser: data.isNewUser,
    cashBalance: data.cashBalance,
    loading: false,
    loadError: false,
  })),
  on(DashboardActions.loadDashboardFailure, (state) => ({
    ...state,
    loading: false,
    loadError: true,
  })),
  on(DashboardActions.selectQuickAction, (state, { actionId }) => ({
    ...state,
    selectedAction: actionId,
    onboardingSteps: state.onboardingSteps.map((step) =>
      step.id === actionId ? { ...step, completed: true } : step,
    ),
  })),
);
