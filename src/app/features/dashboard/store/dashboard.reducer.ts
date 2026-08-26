import { createReducer, on } from '@ngrx/store';
import { initialDashboardState } from '../data/dashboard.data';
import { mapSummaryCardResponse, DashboardState, SummaryCard } from '../models/dashboard.models';
import * as DashboardActions from './dashboard.actions';
// Feature reducer handling all dashboard state transitions
export const dashboardReducer = createReducer<DashboardState>(
  initialDashboardState,
  on(DashboardActions.loadDashboard, (state, { filters }) => ({
    ...state,
    loading: true,
    loadError: false,
    activeFilters: filters ? { ...state.activeFilters, ...filters } : state.activeFilters,
  })),
  on(DashboardActions.setDashboardFilters, (state, { filters }) => ({
    ...state,
    activeFilters: { ...state.activeFilters, ...filters },
  })),
  on(DashboardActions.loadDashboardSuccess, (state, { data }) => ({
    ...state,
    summaryCards: mapSummaryCardResponse(data.summaryCards),
    upcomingBills: data.upcomingBills,
    recentTransactions: data.recentTransactions,
    recentIncome: data.recentIncome,
    recentExpenses: data.recentExpenses,
    widgetConfig: data.widgetConfig,
    quickActions: data.quickActions ?? state.quickActions,
    onboardingSteps: data.onboardingSteps,
    onboardingActions: data.onboardingActions,
    isNewUser: data.isNewUser,
    cashBalance: data.cashBalance,
    budgetCategories: data.budgetCategories ?? state.budgetCategories,
    savingsGoal: data.savingsGoal ?? state.savingsGoal,
    incomeSources: data.incomeSources ?? state.incomeSources,
    netWorth: data.netWorth ?? state.netWorth,
    cashFlowTrendChart: data.cashFlowTrendChart ?? state.cashFlowTrendChart,
    spendingByCategoryChart: data.spendingByCategoryChart ?? state.spendingByCategoryChart,
    loading: false,
    loadError: false,
  })),
  on(DashboardActions.loadDashboardFailure, (state) => ({
    ...state,
    loading: false,
    loadError: true,
  })),
  on(DashboardActions.saveDashboardWidgetConfig, (state, { widgetConfig }) => ({
    ...state,
    widgetConfig,
  })),
  on(DashboardActions.saveDashboardWidgetConfigSuccess, (state, { widgetConfig }) => ({
    ...state,
    widgetConfig,
  })),
  on(DashboardActions.saveDashboardWidgetConfigFailure, (state) => ({
    ...state,
    loadError: true,
  })),
  on(DashboardActions.addUpcomingBill, (state, { item }) => ({
    ...state,
    upcomingBills: [item, ...state.upcomingBills],
  })),
  on(DashboardActions.addUpcomingBillSuccess, (state, { item }) => ({
    ...state,
    upcomingBills: [
      item,
      ...state.upcomingBills.filter(
        (b) => b.id !== item.id && (b.title !== item.title || b.date !== item.date),
      ),
    ],
  })),
  on(DashboardActions.addUpcomingBillFailure, (state) => ({
    ...state,
    loadError: true,
  })),
  on(DashboardActions.updateUpcomingBill, (state, { item }) => ({
    ...state,
    upcomingBills: state.upcomingBills.map((b) => (String(b.id) === String(item.id) ? item : b)),
  })),
  on(DashboardActions.updateUpcomingBillSuccess, (state, { item }) => ({
    ...state,
    upcomingBills: state.upcomingBills.map((b) => (String(b.id) === String(item.id) ? item : b)),
  })),
  on(DashboardActions.updateUpcomingBillFailure, (state) => ({
    ...state,
    loadError: true,
  })),
  on(DashboardActions.deleteUpcomingBill, (state, { id }) => ({
    ...state,
    upcomingBills: state.upcomingBills.filter((b) => String(b.id) !== String(id)),
  })),
  on(DashboardActions.deleteUpcomingBillSuccess, (state, { id }) => ({
    ...state,
    upcomingBills: state.upcomingBills.filter((b) => String(b.id) !== String(id)),
  })),
  on(DashboardActions.deleteUpcomingBillFailure, (state) => ({
    ...state,
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
