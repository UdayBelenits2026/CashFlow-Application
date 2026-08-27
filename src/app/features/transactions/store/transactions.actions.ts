import { createAction, props } from '@ngrx/store';
import { TransactionFilters, TransactionSort } from '../models/models.transaction';
import {
  CreateTransactionRequest,
  CreateTransactionResponse,
  DeleteTransactionData,
  EditTransactionData,
  PagedResult,
  TransactionDetail,
  TransactionListItem,
  UpdateTransactionRequest,
} from '../models/transaction-api.model';

// --- List (server-side paged) ---
export const loadTransactions = createAction('[Transactions] Load');

export const loadTransactionsSuccess = createAction(
  '[Transactions API] Load Success',
  props<{ result: PagedResult<TransactionListItem> }>(),
);

export const loadTransactionsFailure = createAction(
  '[Transactions API] Load Failure',
  props<{ error: string }>(),
);

// Sets the account filter (resets to the first page); null clears it.
export const setTransactionAccountFilter = createAction(
  '[Transactions] Set Account Filter',
  props<{ accountId: number | null }>(),
);

// Clears all filters and returns to the first page.
export const clearTransactionFilters = createAction('[Transactions] Clear Filters');

// Updates the sort column/direction (resets to the first page).
export const setTransactionSort = createAction(
  '[Transactions] Set Sort',
  props<{ sort: TransactionSort }>(),
);

// Changes the current page (0-based, matching the backend).
export const setTransactionPage = createAction(
  '[Transactions] Set Page',
  props<{ page: number }>(),
);

// Changes the page size (resets to the first page).
export const setTransactionPageSize = createAction(
  '[Transactions] Set Page Size',
  props<{ pageSize: number }>(),
);

// Clears the transient success/error feedback banner.
export const clearTransactionFeedback = createAction('[Transactions] Clear Feedback');

// --- Details (read-only single transaction) ---
export const loadTransactionDetail = createAction(
  '[Transaction Details] Load',
  props<{ id: number }>(),
);

export const loadTransactionDetailSuccess = createAction(
  '[Transactions API] Load Detail Success',
  props<{ detail: TransactionDetail }>(),
);

export const loadTransactionDetailFailure = createAction(
  '[Transactions API] Load Detail Failure',
  props<{ error: string }>(),
);

export const clearTransactionDetail = createAction('[Transaction Details] Clear');

// --- Edit-form data ---
export const loadTransactionForEdit = createAction(
  '[Transaction Form] Load For Edit',
  props<{ id: number }>(),
);

export const loadTransactionForEditSuccess = createAction(
  '[Transactions API] Load Edit Success',
  props<{ editData: EditTransactionData }>(),
);

export const loadTransactionForEditFailure = createAction(
  '[Transactions API] Load Edit Failure',
  props<{ error: string }>(),
);

export const clearTransactionEdit = createAction('[Transaction Form] Clear Edit');

// --- Create ---
export const createTransaction = createAction(
  '[Transaction Form] Create',
  props<{ request: CreateTransactionRequest; idempotencyKey: string }>(),
);

export const createTransactionSuccess = createAction(
  '[Transactions API] Create Success',
  props<{ response: CreateTransactionResponse }>(),
);

export const createTransactionFailure = createAction(
  '[Transactions API] Create Failure',
  props<{ error: string }>(),
);

// --- Update ---
export const updateTransaction = createAction(
  '[Transaction Form] Update',
  props<{ id: number; request: UpdateTransactionRequest }>(),
);

export const updateTransactionSuccess = createAction(
  '[Transactions API] Update Success',
  props<{ response: CreateTransactionResponse }>(),
);

export const updateTransactionFailure = createAction(
  '[Transactions API] Update Failure',
  props<{ error: string }>(),
);

// --- Delete (soft-cancel) ---
export const deleteTransaction = createAction('[Transactions] Delete', props<{ id: number }>());

export const deleteTransactionSuccess = createAction(
  '[Transactions API] Delete Success',
  props<{ data: DeleteTransactionData }>(),
);

export const deleteTransactionFailure = createAction(
  '[Transactions API] Delete Failure',
  props<{ error: string }>(),
);
