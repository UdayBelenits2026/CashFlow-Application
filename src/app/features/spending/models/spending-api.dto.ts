import { PaymentMethod } from './expense.model';

// --- Backend DTO shapes (cashflow-spending-service) ---

export interface OverviewDto {
  period?: string;
  totalSpending?: number;
  spendingGrowthPercentage?: number;
  transactionCount?: number;
  transactionsCount?: number;
  transactionsGrowthCount?: number;
  averageDaily?: number;
  averageDailyGrowthPercentage?: number;
  topCategory?: { categoryId: number; categoryName: string; amount: number };
  topCategoryName?: string;
  topCategoryAmount?: number;
  budgetTotal?: number;
  budgetUsedPercentage?: number;
  trend?: { date: string; amount: number }[];
  categorySummary?: { categoryId: number; categoryName: string; amount: number; percentage: number }[];
}

export interface CategoryListDto {
  id?: string;
  categoryId?: number;
  categoryName?: string;
  name?: string;
  icon?: string;
  color?: string;
  budget?: number;
  amount?: number;
  percentage?: number;
  barWidth?: string;
}

export interface ExpenseListItemDto {
  id?: string;
  transactionId?: number;
  date?: string;
  description?: string;
  type?: string;
  amount?: number;
  currency?: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  merchant?: string;
  merchantName?: string;
  accountName?: string;
  accountId?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  tags?: string[];
  status?: string;
  createdAt?: string;
}

export interface ExpensePageDto {
  content?: ExpenseListItemDto[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}

export interface ExpenseCreateDto {
  transactionId?: number;
  id?: string;
  message?: string;
}

export interface TagDto {
  id?: string;
  tagId?: number;
  name: string;
  color?: string;
  count?: number;
  icon?: string;
}

export interface RecurringExpenseDto {
  id?: string;
  recurringId?: number;
  name: string;
  merchantName?: string;
  amount: number;
  categoryId?: number;
  categoryName?: string;
  frequency?: string;
  billingCycle?: string;
  nextBillingDate?: string;
  accountId?: number;
  accountName?: string;
  isActive?: boolean;
  icon?: string;
}

export interface SpendingAlertDto {
  id?: string;
  alertId?: number;
  title: string;
  message: string;
  severity: 'warning' | 'info' | 'success' | 'danger';
  date?: string;
  isRead: boolean;
}
