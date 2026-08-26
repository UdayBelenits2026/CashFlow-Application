import { createAction, props } from '@ngrx/store';
import { CreateTransactionRequest, Transaction, TransactionFilters, TransactionSort } from '../models/models.transaction';

// Loads the full transaction collection from the API.
export const loadTransactions = createAction('[Transactions] Load');

export const loadTransactionsSuccess = createAction(
  '[Transactions API] Load Success',
  props<{ transactions: Transaction[] }>()
);

export const loadTransactionsFailure = createAction(
  '[Transactions API] Load Failure',
  props<{ error: string }>()
);

// Updates the active filters (resets pagination to the first page).
export const setTransactionFilters = createAction(
  '[Transactions] Set Filters',
  props<{ filters: Partial<TransactionFilters> }>()
);

// Clears all filters and search text (resets pagination to the first page).
export const clearTransactionFilters = createAction('[Transactions] Clear Filters');

// Updates the search term (resets pagination to the first page).
export const setTransactionSearch = createAction(
  '[Transactions] Set Search',
  props<{ search: string }>()
);

// Updates the sort field/direction (resets pagination to the first page).
export const setTransactionSort = createAction(
  '[Transactions] Set Sort',
  props<{ sort: TransactionSort }>()
);

// Changes the current page.
export const setTransactionPage = createAction(
  '[Transactions] Set Page',
  props<{ page: number }>()
);

// Changes the page size (resets pagination to the first page).
export const setTransactionPageSize = createAction(
  '[Transactions] Set Page Size',
  props<{ pageSize: number }>()
);

// Deletes a transaction.
export const deleteTransaction = createAction(
  '[Transactions] Delete',
  props<{ id: string }>()
);

export const deleteTransactionSuccess = createAction(
  '[Transactions API] Delete Success',
  props<{ id: string }>()
);

export const deleteTransactionFailure = createAction(
  '[Transactions API] Delete Failure',
  props<{ error: string }>()
);

// Duplicates a transaction (creates a copy with a new backend id).
export const duplicateTransaction = createAction(
  '[Transactions] Duplicate',
  props<{ transaction: Transaction }>()
);

export const duplicateTransactionSuccess = createAction(
  '[Transactions API] Duplicate Success',
  props<{ transactions: Transaction[] }>()
);

export const duplicateTransactionFailure = createAction(
  '[Transactions API] Duplicate Failure',
  props<{ error: string }>()
);

// Changes a transaction's category.
export const changeTransactionCategory = createAction(
  '[Transactions] Change Category',
  props<{ id: string; category: string }>()
);

export const changeTransactionCategorySuccess = createAction(
  '[Transactions API] Change Category Success',
  props<{ transactions: Transaction[] }>()
);

export const changeTransactionCategoryFailure = createAction(
  '[Transactions API] Change Category Failure',
  props<{ error: string }>()
);

// Clears the transient success/error feedback banner.
export const clearTransactionFeedback = createAction('[Transactions] Clear Feedback');

// Loads a single transaction for the edit form.
export const loadTransaction = createAction(
  '[Transaction Form] Load Transaction',
  props<{ id: string }>()
);

export const loadTransactionSuccess = createAction(
  '[Transactions API] Load Transaction Success',
  props<{ transaction: Transaction }>()
);

export const loadTransactionFailure = createAction(
  '[Transactions API] Load Transaction Failure',
  props<{ error: string }>()
);

// Clears the selected transaction (add mode / leaving the form).
export const clearSelectedTransaction = createAction('[Transaction Form] Clear Selected');

// Creates a new transaction from the form.
export const createTransaction = createAction(
  '[Transaction Form] Create Transaction',
  props<{ transaction: CreateTransactionRequest; idempotencyKey: string }>()
);

export const createTransactionSuccess = createAction(
  '[Transactions API] Create Transaction Success',
  props<{ transactions: Transaction[] }>()
);

export const createTransactionFailure = createAction(
  '[Transactions API] Create Transaction Failure',
  props<{ error: string }>()
);

// Updates an existing transaction from the form.
export const updateTransaction = createAction(
  '[Transaction Form] Update Transaction',
  props<{ id: string; changes: Partial<Transaction> }>()
);

export const updateTransactionSuccess = createAction(
  '[Transactions API] Update Transaction Success',
  props<{ transactions: Transaction[] }>()
);

export const updateTransactionFailure = createAction(
  '[Transactions API] Update Transaction Failure',
  props<{ error: string }>()
);
