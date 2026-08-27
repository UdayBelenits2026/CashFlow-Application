import { createReducer, on } from '@ngrx/store';
import * as TransactionsActions from './transactions.actions';
import { initialTransactionFilters, initialTransactionsState } from './transactions.state';

// Re-export state so existing importers (selectors, routes, specs) keep resolving from here.
export * from './transactions.state';

export const transactionsReducer = createReducer(
  initialTransactionsState,

  // --- List ---
  on(TransactionsActions.loadTransactions, (state) => ({ ...state, loading: true, error: null })),
  on(TransactionsActions.loadTransactionsSuccess, (state, { result }) => ({
    ...state,
    content: result.content ?? [],
    page: result.page,
    size: result.size,
    totalElements: result.totalElements,
    totalPages: result.totalPages,
    loading: false,
    error: null
  })),
  on(TransactionsActions.loadTransactionsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(TransactionsActions.setTransactionAccountFilter, (state, { accountId }) => ({
    ...state,
    filters: { ...state.filters, accountId },
    page: 0
  })),
  on(TransactionsActions.clearTransactionFilters, (state) => ({
    ...state,
    filters: initialTransactionFilters,
    page: 0
  })),
  on(TransactionsActions.setTransactionSort, (state, { sort }) => ({ ...state, sort, page: 0 })),
  on(TransactionsActions.setTransactionPage, (state, { page }) => ({ ...state, page })),
  on(TransactionsActions.setTransactionPageSize, (state, { pageSize }) => ({ ...state, size: pageSize, page: 0 })),

  on(TransactionsActions.clearTransactionFeedback, (state) => ({ ...state, error: null, successMessage: null })),

  // --- Details ---
  on(TransactionsActions.loadTransactionDetail, (state) => ({
    ...state,
    detail: null,
    detailLoading: true,
    detailError: null
  })),
  on(TransactionsActions.loadTransactionDetailSuccess, (state, { detail }) => ({
    ...state,
    detail,
    detailLoading: false,
    detailError: null
  })),
  on(TransactionsActions.loadTransactionDetailFailure, (state, { error }) => ({
    ...state,
    detail: null,
    detailLoading: false,
    detailError: error
  })),
  on(TransactionsActions.clearTransactionDetail, (state) => ({ ...state, detail: null, detailError: null })),

  // --- Edit-form data ---
  on(TransactionsActions.loadTransactionForEdit, (state) => ({
    ...state,
    editData: null,
    editLoading: true,
    editError: null
  })),
  on(TransactionsActions.loadTransactionForEditSuccess, (state, { editData }) => ({
    ...state,
    editData,
    editLoading: false,
    editError: null
  })),
  on(TransactionsActions.loadTransactionForEditFailure, (state, { error }) => ({
    ...state,
    editData: null,
    editLoading: false,
    editError: error
  })),
  on(TransactionsActions.clearTransactionEdit, (state) => ({ ...state, editData: null, editError: null })),

  // --- Create / update ---
  on(TransactionsActions.createTransaction, TransactionsActions.updateTransaction, (state) => ({
    ...state,
    saving: true,
    error: null,
    successMessage: null
  })),
  on(TransactionsActions.createTransactionSuccess, (state) => ({
    ...state,
    saving: false,
    error: null,
    successMessage: 'Transaction created successfully.'
  })),
  on(TransactionsActions.updateTransactionSuccess, (state) => ({
    ...state,
    saving: false,
    error: null,
    successMessage: 'Transaction updated successfully.'
  })),
  on(
    TransactionsActions.createTransactionFailure,
    TransactionsActions.updateTransactionFailure,
    (state, { error }) => ({ ...state, saving: false, error })
  ),

  // --- Delete (soft-cancel; the list reloads via effect) ---
  on(TransactionsActions.deleteTransaction, (state) => ({ ...state, loading: true, error: null, successMessage: null })),
  on(TransactionsActions.deleteTransactionSuccess, (state) => ({
    ...state,
    error: null,
    successMessage: 'Transaction deleted successfully.'
  })),
  on(TransactionsActions.deleteTransactionFailure, (state, { error }) => ({ ...state, loading: false, error }))
);
