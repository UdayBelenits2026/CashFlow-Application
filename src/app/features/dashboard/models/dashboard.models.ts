import {
  cloneWidgetConfig,
  DASHBOARD_WIDGET_DEFAULT_CONFIG,
} from '../utility/dashboard-widget-config';
// Dashboard widget identifier types
export type DashboardWidgetId =
  | 'cashFlowTrend'
  | 'spendingByCategory'
  | 'upcomingBills'
  | 'recentTransactions'
  | 'recentIncome'
  | 'recentExpenses'
  | 'budgetOverview'
  | 'savingsGoal'
  | 'netWorth'
  | 'incomeBySource'
  | 'cashBalance';
export type DashboardWidgetLayout = 'medium' | 'wide';
// Dashboard widget configuration interfaces
export interface DashboardWidgetDefinition {
  id: DashboardWidgetId;
  title: string;
  description: string;
  icon: string;
}
export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  selected: boolean;
  layout: DashboardWidgetLayout;
  order: number;
}
export type CustomizeTab = 'available' | 'layout';
export type PreviewMode = 'desktop' | 'tablet';
// Filter state model for dashboard transactions
export interface DashboardFilterState {
  dateRange: string;
  fromDate: string;
  toDate: string;
  quickSelect: string;
  account: string;
  incomeExpense: string;
  category: string;
  merchant: string;
  minAmount: number | null;
  maxAmount: number | null;
  transactionType: string;
  tag: string;
  paymentMethod: string;
  transactionStatus: string;
  recurring: string;
  budget: string;
  applyToAllWidgets: boolean;
}
// Summary card models and metadata mapping
export interface SummaryCard {
  id: 'income' | 'expenses' | 'cashFlow' | 'savings';
  title: string;
  amount: number;
  selectedMonthAmount: number;
  previousMonthAmount: number;
  percentage: number;
  trend: 'up' | 'down';
  comparison: string;
  icon: string;
}
export type SummaryCardResponse = SummaryCard;
export const SUMMARY_CARD_METADATA: Record<SummaryCard['id'], { title: string; icon: string }> = {
  income: { title: 'Total Income', icon: 'fa-wallet' },
  expenses: { title: 'Total Expenses', icon: 'fa-money-bill-transfer' },
  cashFlow: { title: 'Net Cash Flow', icon: 'fa-chart-line' },
  savings: { title: 'Total Savings', icon: 'fa-piggy-bank' },
};
// Maps summary card API response data to full UI model
export function mapSummaryCardResponse(rawCards: any[] | undefined | null): SummaryCard[] {
  if (!rawCards) return [];
  return rawCards.map((card): SummaryCard => {
    const cardId = card.id as SummaryCard['id'];
    const meta = SUMMARY_CARD_METADATA[cardId] ?? { title: '', icon: 'fa-wallet' };
    const selected = card.selectedMonthAmount ?? card.amount ?? 0;
    const previous = card.previousMonthAmount ?? 0;
    let percentage = card.percentage ?? 0;
    if (previous !== 0) {
      percentage = Math.round(Math.abs(((selected - previous) / previous) * 100) * 10) / 10;
    }
    const trend: 'up' | 'down' = card.trend ?? (selected >= previous ? 'up' : 'down');
    return {
      id: cardId,
      title: card.title || meta.title,
      icon: card.icon || meta.icon,
      selectedMonthAmount: selected,
      previousMonthAmount: previous,
      amount: selected,
      percentage,
      trend,
      comparison: 'vs last month',
    };
  });
}
// Dashboard items and onboarding interfaces
export interface DashboardItem {
  id: number | string;
  title: string;
  date: string;
  amount: number;
  icon: string;
  type: 'income' | 'expense' | 'bill';
}
export interface QuickAction {
  id: string;
  title: string;
  icon: string;
}
export interface OnboardingStep {
  id: string;
  title: string;
  actionId: string;
  completed: boolean;
}
export interface OnboardingAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  tone: 'blue' | 'green' | 'red' | 'purple';
}
export interface CashBalanceData {
  totalBalance: number;
  inAccounts: number;
  pending: number;
}
export interface BudgetCategoryData {
  category: string;
  spent: number;
  limit: number;
  color: string;
}
export type BudgetCategoryProgress = BudgetCategoryData;
export interface SavingsGoalData {
  goalName: string;
  savedAmount: number;
  targetAmount: number;
  dueDate: string;
}
export interface IncomeSourceData {
  source: string;
  amount: number;
  color: string;
}
export type IncomeSourceItem = IncomeSourceData;
export interface NetWorthData {
  totalAssets: number;
  totalLiabilities: number;
}
// Chart dataset and configuration interfaces
export interface ChartDataset {
  label?: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string | string[];
  pointBackgroundColor?: string;
  fill?: boolean;
  borderWidth?: number;
  hoverOffset?: number;
}
export interface LineChartData {
  labels: string[];
  datasets: ChartDataset[];
}
export interface DoughnutChartData {
  labels: string[];
  datasets: ChartDataset[];
  total: number;
}
// API response and NgrX state interfaces
export interface DashboardApiResponse {
  summaryCards: SummaryCard[];
  upcomingBills: DashboardItem[];
  recentTransactions: DashboardItem[];
  recentIncome: DashboardItem[];
  recentExpenses: DashboardItem[];
  widgetConfig: DashboardWidgetConfig[];
  quickActions?: QuickAction[];
  onboardingSteps: OnboardingStep[];
  onboardingActions: OnboardingAction[];
  isNewUser: boolean;
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
}
// Initial state for dashboard feature store
export const initialDashboardState: DashboardState = {
  summaryCards: mapSummaryCardResponse([
    { id: 'income', selectedMonthAmount: 6780, previousMonthAmount: 6027 },
    { id: 'expenses', selectedMonthAmount: 2650, previousMonthAmount: 2828 },
    { id: 'cashFlow', selectedMonthAmount: 4130, previousMonthAmount: 3476 },
    { id: 'savings', selectedMonthAmount: 12850, previousMonthAmount: 11746 },
  ]),
  upcomingBills: [],
  recentTransactions: [
    {
      id: 1,
      title: 'Starbucks Coffee',
      date: 'May 29, 2026',
      amount: -5.45,
      icon: 'fa-mug-hot',
      type: 'expense',
    },
    {
      id: 2,
      title: 'Amazon.com',
      date: 'May 29, 2026',
      amount: -49.99,
      icon: 'fa-a',
      type: 'expense',
    },
    {
      id: 3,
      title: 'Uber Ride',
      date: 'May 28, 2026',
      amount: -18.32,
      icon: 'fa-car',
      type: 'expense',
    },
    {
      id: 4,
      title: 'Netflix Subscription',
      date: 'May 27, 2026',
      amount: -15.49,
      icon: 'fa-film',
      type: 'expense',
    },
    {
      id: 5,
      title: 'Walmart',
      date: 'May 27, 2026',
      amount: -85.65,
      icon: 'fa-cart-shopping',
      type: 'expense',
    },
  ],
  recentIncome: [
    {
      id: 1,
      title: 'Salary - May',
      date: 'May 31, 2026',
      amount: 4600,
      icon: 'fa-sack-dollar',
      type: 'income',
    },
    {
      id: 2,
      title: 'Freelance Project',
      date: 'May 25, 2026',
      amount: 450,
      icon: 'fa-laptop-code',
      type: 'income',
    },
    {
      id: 3,
      title: 'Stock Dividend',
      date: 'May 22, 2026',
      amount: 280,
      icon: 'fa-chart-column',
      type: 'income',
    },
    {
      id: 4,
      title: 'Interest Received',
      date: 'May 20, 2026',
      amount: 125,
      icon: 'fa-building-columns',
      type: 'income',
    },
    {
      id: 5,
      title: 'Refund Received',
      date: 'May 18, 2026',
      amount: 75,
      icon: 'fa-arrow-right-arrow-left',
      type: 'income',
    },
  ],
  recentExpenses: [
    {
      id: 1,
      title: 'Swiggy Order',
      date: 'May 29, 2026',
      amount: -25.49,
      icon: 'fa-utensils',
      type: 'expense',
    },
    {
      id: 2,
      title: 'Fuel',
      date: 'May 28, 2026',
      amount: -60,
      icon: 'fa-gas-pump',
      type: 'expense',
    },
    {
      id: 3,
      title: 'Phone Recharge',
      date: 'May 27, 2026',
      amount: -19,
      icon: 'fa-mobile-screen',
      type: 'expense',
    },
    {
      id: 4,
      title: 'Groceries',
      date: 'May 25, 2026',
      amount: -64.3,
      icon: 'fa-cart-shopping',
      type: 'expense',
    },
    {
      id: 5,
      title: 'Pharmacy',
      date: 'May 24, 2026',
      amount: -22.11,
      icon: 'fa-kit-medical',
      type: 'expense',
    },
  ],
  widgetConfig: cloneWidgetConfig(DASHBOARD_WIDGET_DEFAULT_CONFIG),
  quickActions: [
    { id: 'add-income', title: 'Add Income', icon: 'fa-arrow-trend-up' },
    { id: 'add-expense', title: 'Add Expense', icon: 'fa-arrow-trend-down' },
    { id: 'upload-statement', title: 'Upload Statement', icon: 'fa-cloud-arrow-up' },
    { id: 'create-budget', title: 'Create Budget', icon: 'fa-wallet' },
    { id: 'transfer-funds', title: 'Transfer Funds', icon: 'fa-arrow-right-arrow-left' },
    { id: 'view-reports', title: 'View Reports', icon: 'fa-chart-column' },
  ],
  onboardingSteps: [
    {
      id: 'connect-account',
      title: 'Connect your first bank account',
      actionId: 'connect-account',
      completed: false,
    },
    { id: 'add-income', title: 'Add your first income', actionId: 'add-income', completed: false },
    {
      id: 'add-expense',
      title: 'Add your first expense',
      actionId: 'add-expense',
      completed: false,
    },
    {
      id: 'create-budget',
      title: 'Create your first budget',
      actionId: 'create-budget',
      completed: false,
    },
    {
      id: 'customize-dashboard',
      title: 'Customize your dashboard',
      actionId: 'customize-dashboard',
      completed: false,
    },
  ],
  onboardingActions: [
    {
      id: 'connect-account',
      title: 'Connect Bank Account',
      description: 'Securely connect your bank accounts to automatically import transactions.',
      icon: 'bank',
      tone: 'blue',
    },
    {
      id: 'add-income',
      title: 'Add First Income',
      description: 'Record your first income source to see your cash flow take shape.',
      icon: 'wallet',
      tone: 'green',
    },
    {
      id: 'add-expense',
      title: 'Add First Expense',
      description: 'Track your first expense to understand where your money goes.',
      icon: 'receipt',
      tone: 'red',
    },
    {
      id: 'create-budget',
      title: 'Create Your Budget',
      description: 'Set spending limits and stay on track with your financial goals.',
      icon: 'chart',
      tone: 'purple',
    },
  ],
  isNewUser: true,
  cashBalance: {
    totalBalance: 8450,
    inAccounts: 8760,
    pending: -310,
  },
  budgetCategories: [
    { category: 'Food & Dining', spent: 660, limit: 1000, color: '#16a34a' },
    { category: 'Transportation', spent: 528, limit: 800, color: '#f59e0b' },
    { category: 'Utilities', spent: 396, limit: 600, color: '#2563eb' },
  ],
  savingsGoal: {
    goalName: 'Emergency Fund',
    savedAmount: 12850,
    targetAmount: 20000,
    dueDate: 'Dec 2026',
  },
  incomeSources: [
    { source: 'Primary Salary', amount: 4600, color: '#2563eb' },
    { source: 'Freelance', amount: 450, color: '#0ea5e9' },
    { source: 'Investments', amount: 405, color: '#14b8a6' },
  ],
  netWorth: {
    totalAssets: 95400,
    totalLiabilities: 32100,
  },
  cashFlowTrendChart: {
    labels: ['May 1', 'May 8', 'May 15', 'May 22', 'May 31'],
    datasets: [
      {
        label: 'Income',
        data: [5200, 5800, 5600, 6200, 6780],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, .1)',
        pointBackgroundColor: '#22c55e',
        fill: true,
      },
      {
        label: 'Expenses',
        data: [2800, 2400, 2900, 2500, 2650],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, .1)',
        pointBackgroundColor: '#ef4444',
        fill: true,
      },
      {
        label: 'Net Cash Flow',
        data: [2400, 3400, 2700, 3700, 4130],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, .1)',
        pointBackgroundColor: '#2563eb',
        fill: true,
      },
    ],
  },
  spendingByCategoryChart: {
    labels: ['Housing', 'Food & Dining', 'Transportation', 'Utilities', 'Entertainment', 'Others'],
    datasets: [
      {
        data: [795, 530, 398, 265, 212, 185],
        backgroundColor: ['#2563eb', '#22c55e', '#f97316', '#7c3aed', '#ef4444', '#94a3b8'],
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
    total: 2650,
  },
  selectedAction: null,
  loading: true,
  loadError: false,
};
