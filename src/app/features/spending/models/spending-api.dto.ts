import { PaymentMethod } from './expense.model';

// --- Standard Microservice Response Envelope ---

export interface ApiResponse<T> {
  success?: boolean;
  statusCode?: number;
  message?: string;
  correlationId?: string;
  fieldErrors?: Record<string, unknown>;
  timestamp?: string;
  data?: T;
}

// --- Live OpenAPI Schemas (spending-controller & expense-controller) ---

export interface Comparison {
  totalSpendingChangePercent?: number;
  transactionCountChange?: number;
}

export interface TopCategory {
  categoryId?: number;
  categoryName?: string;
  name?: string;
  amount?: number;
}

export interface TrendPoint {
  date?: string;
  amount?: number;
}

export interface CategorySummary {
  categoryId?: number;
  categoryName?: string;
  name?: string;
  amount?: number;
  percentage?: number;
}

export interface SpendingOverviewDto {
  period?: string;
  totalSpending?: number;
  transactionCount?: number;
  averageDaily?: number;
  topCategory?: TopCategory;
  comparisonToPrevious?: Comparison;
  trend?: TrendPoint[];
  categorySummary?: CategorySummary[];
  // Extended / frontend aliases
  spendingGrowthPercentage?: number;
  transactionsCount?: number;
  transactionsGrowthCount?: number;
  topCategoryName?: string;
  topCategoryAmount?: number;
  budgetTotal?: number;
  budgetUsedPercentage?: number;
  budgetUsed?: number;
}

export type OverviewDto = SpendingOverviewDto;

export interface CategoryOptionDto {
  categoryId?: number;
  categoryName?: string;
  name?: string;
  icon?: string;
  color?: string;
  amount?: number;
  percentage?: number;
  budget?: number;
}

export type CategoryListDto = CategoryOptionDto;

export interface CategoryBreakdown {
  categoryId?: number;
  categoryName?: string;
  amount?: number;
  percentage?: number;
}

export interface RecentExpense {
  transactionId?: number;
  merchantName?: string;
  categoryName?: string;
  amount?: number;
  transactionDate?: string;
}

export interface SpendingDashboardDto {
  period?: string;
  totalSpending?: number;
  totalSpendingChangePercent?: number;
  categoryBreakdown?: CategoryBreakdown[];
  recentExpenses?: RecentExpense[];
}

export interface ExpenseListItemDto {
  transactionId?: number;
  id?: string;
  accountId?: number | string;
  accountName?: string;
  transactionDate?: string;
  date?: string;
  amount?: number;
  merchantId?: number;
  merchantName?: string;
  merchant?: string;
  categoryId?: number | string;
  categoryName?: string;
  category?: string;
  paymentMethod?: PaymentMethod | string;
  notes?: string;
  description?: string;
  status?: string;
  type?: string;
  currency?: string;
  tags?: string[];
  createdAt?: string;
}

export interface ExpenseListPageDto {
  content?: ExpenseListItemDto[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  filteredOutflow?: number;
}

export type ExpensePageDto = ExpenseListPageDto;

export interface ExpenseDetailsDto {
  transactionId?: number;
  accountId?: number;
  transactionDate?: string;
  amount?: number;
  merchantId?: number;
  merchantName?: string;
  categoryId?: number;
  categoryName?: string;
  paymentMethod?: string;
  notes?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseCreateRequestDto {
  accountId: number;
  amount: number;
  transactionDate: string;
  merchantName?: string;
  categoryId: number;
  paymentMethod?: string;
  notes?: string;
}

export interface ExpenseUpdateRequestDto {
  accountId?: number;
  amount?: number;
  transactionDate?: string;
  merchantName?: string;
  categoryId?: number;
  paymentMethod?: string;
  notes?: string;
}

export interface ExpenseMutationResponseDto {
  transactionId?: number;
  id?: string;
  message?: string;
}

export type ExpenseCreateDto = ExpenseMutationResponseDto;

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
  name?: string;
  merchant?: string;
  merchantName?: string;
  amount?: number;
  expectedAmount?: number;
  categoryId?: number;
  categoryName?: string;
  frequency?: string;
  billingCycle?: string;
  nextDueDate?: string;
  nextBillingDate?: string;
  accountId?: number;
  accountName?: string;
  status?: string;
  isActive?: boolean;
  icon?: string;
}

export interface SpendingAlertDto {
  id?: string;
  alertId?: number;
  type?: string;
  title?: string;
  message?: string;
  severity?: 'warning' | 'info' | 'success' | 'danger' | 'INFO' | 'WARNING' | 'CRITICAL';
  status?: string;
  date?: string;
  createdAt?: string;
  isRead?: boolean;
}

export interface SpendingTrendsDto {
  granularity?: string;
  points?: { period?: string; date?: string; amount?: number }[];
  changePercent?: number;
}
