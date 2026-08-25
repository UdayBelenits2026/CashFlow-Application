import { createAction, props } from '@ngrx/store';
import { SpendingOverviewData, SpendingCategoryItem, SpendingTrendPoint, SpendingAlert } from '../models/spending-summary.model';
import { Expense } from '../models/expense.model';
import { Tag } from '../models/tag.model';
import { RecurringExpense } from '../models/recurring-expense.model';
import { ExpenseFilters } from './spending.state';

// --- Load Dashboard ---
export const loadSpendingDashboard = createAction(
  '[Spending] Load Dashboard'
);

export const loadSpendingDashboardSuccess = createAction(
  '[Spending] Load Dashboard Success',
  props<{
    overview: SpendingOverviewData;
    categories: SpendingCategoryItem[];
    trendPoints: SpendingTrendPoint[];
    expenses: Expense[];
    tags: Tag[];
    recurringExpenses: RecurringExpense[];
    alerts: SpendingAlert[];
  }>()
);

export const loadSpendingDashboardFailure = createAction(
  '[Spending] Load Dashboard Failure',
  props<{ error: string }>()
);

export const addExpense = createAction(
  '[Spending] Add Expense',
  props<{ expense: Partial<Expense> }>()
);

export const addExpenseSuccess = createAction(
  '[Spending] Add Expense Success',
  props<{ expense: Expense }>()
);

export const addExpenseFailure = createAction(
  '[Spending] Add Expense Failure',
  props<{ error: string }>()
);

export const updateExpense = createAction(
  '[Spending] Update Expense',
  props<{ id: string; expense: Partial<Expense> }>()
);

export const updateExpenseSuccess = createAction(
  '[Spending] Update Expense Success',
  props<{ expense: Expense }>()
);

export const updateExpenseFailure = createAction(
  '[Spending] Update Expense Failure',
  props<{ error: string }>()
);

export const deleteExpense = createAction(
  '[Spending] Delete Expense',
  props<{ id: string }>()
);

export const deleteExpenseSuccess = createAction(
  '[Spending] Delete Expense Success',
  props<{ id: string }>()
);

export const deleteExpenseFailure = createAction(
  '[Spending] Delete Expense Failure',
  props<{ error: string }>()
);

// --- Filters ---
export const setExpenseFilters = createAction(
  '[Spending] Set Filters',
  props<{ filters: Partial<ExpenseFilters> }>()
);

export const resetExpenseFilters = createAction(
  '[Spending] Reset Filters'
);

// --- Tags ---
export const addTag = createAction(
  '[Spending] Add Tag',
  props<{ tag: Tag }>()
);

export const addTagSuccess = createAction(
  '[Spending] Add Tag Success',
  props<{ tag: Tag }>()
);

export const deleteTag = createAction(
  '[Spending] Delete Tag',
  props<{ id: string }>()
);

export const deleteTagSuccess = createAction(
  '[Spending] Delete Tag Success',
  props<{ id: string }>()
);

// --- Recurring Expenses ---
export const addRecurringExpense = createAction(
  '[Spending] Add Recurring Expense',
  props<{ item: Partial<RecurringExpense> }>()
);

export const addRecurringExpenseSuccess = createAction(
  '[Spending] Add Recurring Expense Success',
  props<{ item: RecurringExpense }>()
);

export const toggleRecurringExpense = createAction(
  '[Spending] Toggle Recurring Expense',
  props<{ id: string; isActive: boolean }>()
);

export const toggleRecurringExpenseSuccess = createAction(
  '[Spending] Toggle Recurring Expense Success',
  props<{ item: RecurringExpense }>()
);

export const deleteRecurringExpense = createAction(
  '[Spending] Delete Recurring Expense',
  props<{ id: string }>()
);

export const deleteRecurringExpenseSuccess = createAction(
  '[Spending] Delete Recurring Expense Success',
  props<{ id: string }>()
);

// --- Alerts ---
export const markAlertAsRead = createAction(
  '[Spending] Mark Alert As Read',
  props<{ id: string }>()
);

export const dismissAlert = createAction(
  '[Spending] Dismiss Alert',
  props<{ id: string }>()
);

// --- Generic operation failure (tags, recurring) ---
export const spendingOperationFailure = createAction(
  '[Spending] Operation Failure',
  props<{ error: string }>()
);

// --- Feedback clear ---
export const clearSpendingFeedback = createAction(
  '[Spending] Clear Feedback'
);
