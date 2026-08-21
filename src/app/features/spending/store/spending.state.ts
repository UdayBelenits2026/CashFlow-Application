import { SpendingOverviewData, SpendingCategoryItem, SpendingTrendPoint, SpendingAlert } from '../models/spending-summary.model';
import { Expense } from '../models/expense.model';
import { Tag } from '../models/tag.model';
import { RecurringExpense } from '../models/recurring-expense.model';

export const spendingFeatureKey = 'spending';

export interface ExpenseFilters {
  searchTerm: string;
  categoryId: string | null;
  accountId: string | null;
  startDate: string | null;
  endDate: string | null;
  minAmount: number | null;
  maxAmount: number | null;
  sortBy: 'date' | 'amount' | 'merchant';
  sortOrder: 'asc' | 'desc';
}

export interface SpendingState {
  overview: SpendingOverviewData | null;
  categories: SpendingCategoryItem[];
  trendPoints: SpendingTrendPoint[];
  expenses: Expense[];
  tags: Tag[];
  recurringExpenses: RecurringExpense[];
  alerts: SpendingAlert[];
  selectedExpenseId: string | null;
  filters: ExpenseFilters;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

export const initialExpenseFilters: ExpenseFilters = {
  searchTerm: '',
  categoryId: null,
  accountId: null,
  startDate: null,
  endDate: null,
  minAmount: null,
  maxAmount: null,
  sortBy: 'date',
  sortOrder: 'desc'
};

export const initialSpendingState: SpendingState = {
  overview: null,
  categories: [],
  trendPoints: [],
  expenses: [],
  tags: [],
  recurringExpenses: [],
  alerts: [],
  selectedExpenseId: null,
  filters: initialExpenseFilters,
  isLoading: false,
  error: null,
  successMessage: null
};
