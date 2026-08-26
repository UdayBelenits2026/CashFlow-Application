import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DashboardState } from '../models/dashboard.models';
// Selects main dashboard feature state
export const selectDashboardState = createFeatureSelector<DashboardState>('dashboard');
// Selects summary card metrics with fallback for new user state
export const selectSummaryCards = createSelector(selectDashboardState, (state) =>
  state.isNewUser
    ? state.summaryCards.map((card) => ({
        ...card,
        amount: 0,
        selectedMonthAmount: 0,
        previousMonthAmount: 0,
        percentage: 0,
        comparison: 'vs last month',
      }))
    : state.summaryCards,
);
// Selects list of upcoming bills
export const selectUpcomingBills = createSelector(
  selectDashboardState,
  (state) => state.upcomingBills,
);
// Selects recent transactions list
export const selectRecentTransactions = createSelector(
  selectDashboardState,
  (state) => state.recentTransactions,
);
// Selects recent income entries list
export const selectRecentIncome = createSelector(
  selectDashboardState,
  (state) => state.recentIncome,
);
// Selects recent expense entries list
export const selectRecentExpenses = createSelector(
  selectDashboardState,
  (state) => state.recentExpenses,
);
// Selects dashboard widget layout and selection configuration
export const selectDashboardWidgetConfig = createSelector(
  selectDashboardState,
  (state) => state.widgetConfig,
);
// Selects list of available quick actions
export const selectQuickActions = createSelector(
  selectDashboardState,
  (state) => state.quickActions,
);
// Selects list of onboarding steps
export const selectOnboardingSteps = createSelector(
  selectDashboardState,
  (state) => state.onboardingSteps,
);
// Selects list of onboarding action details
export const selectOnboardingActions = createSelector(
  selectDashboardState,
  (state) => state.onboardingActions,
);
// Selects new user flag indicator
export const selectIsNewUser = createSelector(selectDashboardState, (state) => state.isNewUser);
// Selects cash balance state slice
export const selectCashBalance = createSelector(selectDashboardState, (state) => state.cashBalance);
// Selects budget categories state slice
export const selectBudgetCategories = createSelector(
  selectDashboardState,
  (state) => state.budgetCategories,
);
// Selects savings goal state slice
export const selectSavingsGoal = createSelector(selectDashboardState, (state) => state.savingsGoal);
// Selects income sources breakdown state slice
export const selectIncomeSources = createSelector(
  selectDashboardState,
  (state) => state.incomeSources,
);
// Selects net worth summary state slice
export const selectNetWorth = createSelector(selectDashboardState, (state) => state.netWorth);
// Selects cash flow trend chart dataset
export const selectCashFlowTrendChart = createSelector(
  selectDashboardState,
  (state) => state.cashFlowTrendChart,
);
// Selects spending by category doughnut chart dataset
export const selectSpendingByCategoryChart = createSelector(
  selectDashboardState,
  (state) => state.spendingByCategoryChart,
);
// Selects active selected quick action ID
export const selectSelectedAction = createSelector(
  selectDashboardState,
  (state) => state.selectedAction,
);
// Selects dashboard loading status indicator
export const selectDashboardLoading = createSelector(
  selectDashboardState,
  (state) => state.loading,
);
// Selects dashboard load error status indicator
export const selectDashboardLoadError = createSelector(
  selectDashboardState,
  (state) => state.loadError,
);
// Selects active dashboard filters
export const selectActiveFilters = createSelector(
  selectDashboardState,
  (state) => state?.activeFilters,
);
