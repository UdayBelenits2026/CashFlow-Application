import {
  cloneWidgetConfig,
  DASHBOARD_WIDGET_DEFAULT_CONFIG,
} from '../utility/dashboard-widget-config';
import { mapSummaryCardResponse } from '../models/summary-card.model';
import { DashboardState } from '../models/dashboard-state.model';
import {
  MOCK_RECENT_TRANSACTIONS,
  MOCK_RECENT_INCOME,
  MOCK_RECENT_EXPENSES,
} from './dashboard-mock-transactions.data';
import {
  MOCK_QUICK_ACTIONS,
  MOCK_ONBOARDING_STEPS,
  MOCK_ONBOARDING_ACTIONS,
} from './dashboard-mock-widgets.data';
import {
  MOCK_CASH_BALANCE,
  MOCK_BUDGET_CATEGORIES,
  MOCK_SAVINGS_GOAL,
  MOCK_INCOME_SOURCES,
  MOCK_NET_WORTH,
  MOCK_CASH_FLOW_TREND_CHART,
  MOCK_SPENDING_BY_CATEGORY_CHART,
} from './dashboard-mock-metrics.data';
// Initial state for dashboard feature store
export const initialDashboardState: DashboardState = {
  summaryCards: mapSummaryCardResponse([
    { id: 'income', selectedMonthAmount: 6780, previousMonthAmount: 6027 },
    { id: 'expenses', selectedMonthAmount: 2650, previousMonthAmount: 2828 },
    { id: 'cashFlow', selectedMonthAmount: 4130, previousMonthAmount: 3476 },
    { id: 'savings', selectedMonthAmount: 12850, previousMonthAmount: 11746 },
  ]),
  upcomingBills: [],
  recentTransactions: MOCK_RECENT_TRANSACTIONS,
  recentIncome: MOCK_RECENT_INCOME,
  recentExpenses: MOCK_RECENT_EXPENSES,
  widgetConfig: cloneWidgetConfig(DASHBOARD_WIDGET_DEFAULT_CONFIG),
  quickActions: MOCK_QUICK_ACTIONS,
  onboardingSteps: MOCK_ONBOARDING_STEPS,
  onboardingActions: MOCK_ONBOARDING_ACTIONS,
  isNewUser: true,
  cashBalance: MOCK_CASH_BALANCE,
  budgetCategories: MOCK_BUDGET_CATEGORIES,
  savingsGoal: MOCK_SAVINGS_GOAL,
  incomeSources: MOCK_INCOME_SOURCES,
  netWorth: MOCK_NET_WORTH,
  cashFlowTrendChart: MOCK_CASH_FLOW_TREND_CHART,
  spendingByCategoryChart: MOCK_SPENDING_BY_CATEGORY_CHART,
  selectedAction: null,
  loading: true,
  loadError: false,
  activeFilters: {
    dateRange: 'this-month',
  },
};
