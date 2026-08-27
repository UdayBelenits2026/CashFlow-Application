import { SummaryCard } from './summary-card.model';
import {
  DashboardItem,
  QuickAction,
  OnboardingStep,
  OnboardingAction,
} from './dashboard-item.model';
import { DashboardWidgetConfig } from './dashboard-widget.model';
import { DashboardFilterState } from './dashboard-filter.model';
import {
  CashBalanceData,
  BudgetCategoryData,
  SavingsGoalData,
  IncomeSourceData,
  NetWorthData,
  LineChartData,
  DoughnutChartData,
} from './dashboard-metrics.model';
// API response and NgRx state interfaces
export interface DashboardApiResponse {
  summaryCards: SummaryCard[];
  upcomingBills: DashboardItem[];
  recentTransactions: DashboardItem[];
  recentIncome: DashboardItem[];
  recentExpenses: DashboardItem[];
  widgetConfig: DashboardWidgetConfig[];
  quickActions?: QuickAction[];
  onboardingSteps?: OnboardingStep[];
  isNewUser?: boolean;
  cashBalance: CashBalanceData;
  budgetCategories?: BudgetCategoryData[];
  savingsGoal?: SavingsGoalData;
  incomeSources?: IncomeSourceData[];
  netWorth?: NetWorthData;
  cashFlowTrendChart?: LineChartData;
  spendingByCategoryChart?: DoughnutChartData;
}
export interface DashboardState {
  summaryCards: SummaryCard[];
  upcomingBills: DashboardItem[];
  recentTransactions: DashboardItem[];
  recentIncome: DashboardItem[];
  recentExpenses: DashboardItem[];
  widgetConfig: DashboardWidgetConfig[];
  quickActions: QuickAction[];
  onboardingSteps: OnboardingStep[];
  onboardingActions: OnboardingAction[];
  isNewUser: boolean;
  cashBalance: CashBalanceData;
  budgetCategories: BudgetCategoryData[];
  savingsGoal: SavingsGoalData;
  incomeSources: IncomeSourceData[];
  netWorth: NetWorthData;
  cashFlowTrendChart: LineChartData;
  spendingByCategoryChart: DoughnutChartData;
  selectedAction: string | null;
  loading: boolean;
  loadError: boolean;
  activeFilters?: Partial<DashboardFilterState>;
}
