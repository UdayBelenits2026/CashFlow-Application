import { createAction, props } from '@ngrx/store';
import { IncomeOverviewData, IncomeTrendPoint } from '../models/income-summary.model';
import { IncomeSource } from '../models/income-source.model';
import { Income } from '../models/income.model';
import { RecurringIncome } from '../models/recurring-income.model';
import { AccountRef } from '../models/account-ref.model';
import { IncomeFilters } from './income.state';

// --- Load Dashboard & Overview Datasets ---
export const loadIncomeDashboard = createAction(
  '[Income] Load Dashboard'
);

export const loadIncomeDashboardSuccess = createAction(
  '[Income] Load Dashboard Success',
  props<{
    overview: IncomeOverviewData;
    sources: IncomeSource[];
    trendPoints: IncomeTrendPoint[];
    incomes: Income[];
    recurringIncomes: RecurringIncome[];
    accounts: AccountRef[];
  }>()
);

export const loadIncomeDashboardFailure = createAction(
  '[Income] Load Dashboard Failure',
  props<{ error: string }>()
);

// --- Incomes (Recorded Transactions) CRUD ---
export const addIncome = createAction(
  '[Income] Add Income',
  props<{ income: Partial<Income> }>()
);

export const addIncomeSuccess = createAction(
  '[Income] Add Income Success',
  props<{ income: Income }>()
);

export const addIncomeFailure = createAction(
  '[Income] Add Income Failure',
  props<{ error: string }>()
);

export const updateIncome = createAction(
  '[Income] Update Income',
  props<{ id: string; income: Partial<Income> }>()
);

export const updateIncomeSuccess = createAction(
  '[Income] Update Income Success',
  props<{ income: Income }>()
);

export const updateIncomeFailure = createAction(
  '[Income] Update Income Failure',
  props<{ error: string }>()
);

export const deleteIncome = createAction(
  '[Income] Delete Income',
  props<{ id: string }>()
);

export const deleteIncomeSuccess = createAction(
  '[Income] Delete Income Success',
  props<{ id: string }>()
);

export const deleteIncomeFailure = createAction(
  '[Income] Delete Income Failure',
  props<{ error: string }>()
);

// --- Income Sources CRUD ---
export const addIncomeSource = createAction(
  '[Income] Add Income Source',
  props<{ source: Partial<IncomeSource> }>()
);

export const addIncomeSourceSuccess = createAction(
  '[Income] Add Income Source Success',
  props<{ source: IncomeSource }>()
);

export const updateIncomeSource = createAction(
  '[Income] Update Income Source',
  props<{ id: string; source: Partial<IncomeSource> }>()
);

export const updateIncomeSourceSuccess = createAction(
  '[Income] Update Income Source Success',
  props<{ source: IncomeSource }>()
);

export const toggleIncomeSourceStatus = createAction(
  '[Income] Toggle Income Source Status',
  props<{ id: string; status: 'ACTIVE' | 'INACTIVE' }>()
);

export const toggleIncomeSourceStatusSuccess = createAction(
  '[Income] Toggle Income Source Status Success',
  props<{ source: IncomeSource }>()
);

export const deleteIncomeSource = createAction(
  '[Income] Delete Income Source',
  props<{ id: string }>()
);

export const deleteIncomeSourceSuccess = createAction(
  '[Income] Delete Income Source Success',
  props<{ id: string }>()
);

// --- Recurring Income Schedules CRUD ---
export const addRecurringIncome = createAction(
  '[Income] Add Recurring Income',
  props<{ item: Partial<RecurringIncome> }>()
);

export const addRecurringIncomeSuccess = createAction(
  '[Income] Add Recurring Income Success',
  props<{ item: RecurringIncome }>()
);

export const updateRecurringIncome = createAction(
  '[Income] Update Recurring Income',
  props<{ id: string; item: Partial<RecurringIncome> }>()
);

export const updateRecurringIncomeSuccess = createAction(
  '[Income] Update Recurring Income Success',
  props<{ item: RecurringIncome }>()
);

export const toggleRecurringIncomeStatus = createAction(
  '[Income] Toggle Recurring Income Status',
  props<{ id: string; status: 'ACTIVE' | 'PAUSED' }>()
);

export const toggleRecurringIncomeStatusSuccess = createAction(
  '[Income] Toggle Recurring Income Status Success',
  props<{ item: RecurringIncome }>()
);

export const deleteRecurringIncome = createAction(
  '[Income] Delete Recurring Income',
  props<{ id: string }>()
);

export const deleteRecurringIncomeSuccess = createAction(
  '[Income] Delete Recurring Income Success',
  props<{ id: string }>()
);

/** Action to record an expected upcoming recurring income as an actual transaction */
export const recordRecurringIncome = createAction(
  '[Income] Record Recurring Income',
  props<{ recurringId: string; date?: string; notes?: string }>()
);

export const recordRecurringIncomeSuccess = createAction(
  '[Income] Record Recurring Income Success',
  props<{ recordedIncome: Income; updatedRecurring: RecurringIncome }>()
);

// --- Filters & Navigation ---
export const setIncomeFilters = createAction(
  '[Income] Set Filters',
  props<{ filters: Partial<IncomeFilters> }>()
);

export const resetIncomeFilters = createAction(
  '[Income] Reset Filters'
);

export const setSelectedCalendarMonth = createAction(
  '[Income] Set Selected Calendar Month',
  props<{ year: number; month: number }>()
);

// --- Generic Operations Failure & Feedback Clearing ---
export const incomeOperationFailure = createAction(
  '[Income] Operation Failure',
  props<{ error: string }>()
);

export const clearIncomeFeedback = createAction(
  '[Income] Clear Feedback'
);
