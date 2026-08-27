import { DashboardWidgetId } from './dashboard-widget.model';

// Standard API response envelope used by the backend gateway
export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  correlationId?: string;
}

// GET /dashboard/summary
export interface DashboardSummaryDto {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  // Previous-period values the UI needs for the vs-last-month comparison
  previousTotalBalance: number;
  previousTotalIncome: number;
  previousTotalExpenses: number;
  previousNetCashFlow: number;
  budgetUsedPercentage: number;
  accountsCount: number;
  unreadNotifications: number;
  upcomingBills: number;
}

// GET /dashboard/cash-flow-trend
export interface CashFlowTrendPointDto {
  period: string;
  income: number;
  expense: number;
  net: number;
}
export interface CashFlowTrendDto {
  period: string;
  points: CashFlowTrendPointDto[];
}

// GET /dashboard/spending-by-category
export interface SpendingCategoryDto {
  categoryId: number;
  categoryName: string;
  amount: number;
  percentage: number;
}
export interface SpendingByCategoryDto {
  totalSpending: number;
  categories: SpendingCategoryDto[];
}

// GET /dashboard/upcoming-bills
export interface UpcomingBillDto {
  recurringId: number;
  name: string;
  amount: number;
  nextDueDate: string;
  accountId: number;
  status: string;
  // Icon key the UI renders per bill
  icon: string;
}
// POST / PUT /dashboard/upcoming-bills request body
export interface UpcomingBillWriteDto {
  name: string;
  amount: number;
  nextDueDate: string;
  icon: string;
  status?: string;
}

// GET /dashboard/recent-transactions
export interface RecentTransactionDto {
  transactionId: number;
  date: string;
  description: string;
  type: string;
  amount: number;
  category: string;
  accountName: string;
  // Icon key the UI renders per row
  icon: string;
}

// GET /dashboard/recent-income
export interface RecentIncomeDto {
  transactionId: number;
  date: string;
  sourceName: string;
  amount: number;
  accountName: string;
  icon: string;
}

// GET /dashboard/recent-expenses
export interface RecentExpenseDto {
  transactionId: number;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  icon: string;
}

// GET /dashboard/cash-balance
export interface CashBalanceAccountDto {
  accountId: number;
  accountName: string;
  currentBalance: number;
  availableBalance: number;
  currency: string;
}
export interface CashBalanceDto {
  totalBalance: number;
  availableBalance: number;
  // Amounts the UI shows directly
  inAccounts: number;
  pending: number;
  accounts: CashBalanceAccountDto[];
}

// GET / PUT /dashboard/configuration
export interface DashboardWidgetDto {
  code: string;
  position: number;
  visible: boolean;
  // Per-widget width the customize UI needs
  layout: 'medium' | 'wide';
}
export interface DashboardConfigurationDto {
  layout: string;
  widgets: DashboardWidgetDto[];
  updatedAt?: string;
}

// Maps backend widget codes to internal widget ids and back
export const WIDGET_CODE_TO_ID: Record<string, DashboardWidgetId> = {
  CASH_FLOW: 'cashFlowTrend',
  SPENDING_BY_CATEGORY: 'spendingByCategory',
  UPCOMING_BILLS: 'upcomingBills',
  RECENT_TRANSACTIONS: 'recentTransactions',
  RECENT_INCOME: 'recentIncome',
  RECENT_EXPENSES: 'recentExpenses',
  BUDGET_OVERVIEW: 'budgetOverview',
  SAVINGS_GOAL: 'savingsGoal',
  NET_WORTH: 'netWorth',
  INCOME_BY_SOURCE: 'incomeBySource',
  CASH_BALANCE: 'cashBalance',
};
export const WIDGET_ID_TO_CODE: Record<DashboardWidgetId, string> = Object.entries(
  WIDGET_CODE_TO_ID,
).reduce(
  (acc, [code, id]) => {
    acc[id] = code;
    return acc;
  },
  {} as Record<DashboardWidgetId, string>,
);
