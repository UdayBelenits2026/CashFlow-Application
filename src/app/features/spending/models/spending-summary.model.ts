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
