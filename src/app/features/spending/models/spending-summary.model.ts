export interface SpendingOverviewData {
  totalSpending: number;
  spendingGrowthPercentage: number;
  transactionsCount: number;
  transactionsGrowthCount: number;
  averageDaily: number;
  averageDailyGrowthPercentage: number;
  topCategoryName: string;
  topCategoryAmount: number;
  budgetTotal?: number;
  budgetUsedPercentage?: number;
}

export interface SpendingCategoryItem {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
  barWidth: string;
  budget?: number;
  icon?: string;
}

export interface SpendingTrendPoint {
  xLabel: string;
  thisMonth: number;
  lastMonth: number;
}

export interface SpendingMerchant {
  name: string;
  amount: number;
  transactionCount: number;
  percentage: number;
  topCategoryName: string;
  color: string;
}

export type BudgetStatus = 'ON_TRACK' | 'WARNING' | 'OVER_BUDGET';

export interface BudgetVsActualItem {
  id: string;
  name: string;
  color: string;
  budget: number;
  spent: number;
  percentUsed: number;
  status: BudgetStatus;
}

export interface SpendingInsight {
  id: string;
  title: string;
  message: string;
  type: 'positive' | 'negative' | 'neutral' | 'info';
  icon?: string;
  badge?: string;
}

export interface SpendingAlert {
  id: string;
  title: string;
  message: string;
  severity: 'warning' | 'info' | 'success' | 'danger';
  date: string;
  isRead: boolean;
}

export type AlertTab = 'ALL' | 'UNREAD' | 'READ';
