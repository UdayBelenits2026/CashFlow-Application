import { createReducer, on } from '@ngrx/store';
import { Transaction, TransactionFilters, TransactionSort } from '../models/models.transaction';
import * as TransactionsActions from './transactions.actions';

export const transactionsFeatureKey = 'transactions';

export interface TransactionsState {
  transactions: Transaction[];
  selectedTransaction: Transaction | null;
  selectedLoading: boolean;
  selectedError: string | null;
  saving: boolean;
  filters: TransactionFilters;
  search: string;
  sort: TransactionSort;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

export const initialTransactionFilters: TransactionFilters = {
  accountId: '',
  category: '',
  type: '',
  startDate: '',
  endDate: '',
  minAmount: null,
  maxAmount: null
};

export const initialTransactionsState: TransactionsState = {
  transactions: [],
  selectedTransaction: null,
  selectedLoading: false,
  selectedError: null,
  saving: false,
  filters: initialTransactionFilters,
  search: '',
  sort: { field: 'date', direction: 'desc' },
  page: 1,
  pageSize: 10,
  loading: false,
  error: null,
  successMessage: null
};

export const transactionsReducer = createReducer(
  initialTransactionsState,

  on(TransactionsActions.loadTransactions, (state) => ({ ...state, loading: true, error: null })),
  on(TransactionsActions.loadTransactionsSuccess, (state, { transactions }) => ({
    ...state,
    transactions,
    loading: false,
    error: null
  })),
  on(TransactionsActions.loadTransactionsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Merge new filter values and reset to the first page.
  on(TransactionsActions.setTransactionFilters, (state, { filters }) => ({
    ...state,
    filters: { ...state.filters, ...filters },
    page: 1
  })),

  // Reset every filter + search and return to the first page.
  on(TransactionsActions.clearTransactionFilters, (state) => ({
    ...state,
    filters: initialTransactionFilters,
    search: '',
    page: 1
  })),

  // Update the search term and reset to the first page.
  on(TransactionsActions.setTransactionSearch, (state, { search }) => ({ ...state, search, page: 1 })),

  // Update sort field/direction and reset to the first page.
  on(TransactionsActions.setTransactionSort, (state, { sort }) => ({ ...state, sort, page: 1 })),

  on(TransactionsActions.setTransactionPage, (state, { page }) => ({ ...state, page })),
  on(TransactionsActions.setTransactionPageSize, (state, { pageSize }) => ({ ...state, pageSize, page: 1 })),

  on(TransactionsActions.deleteTransaction, (state) => ({ ...state, loading: true, error: null, successMessage: null })),
  on(TransactionsActions.deleteTransactionSuccess, (state, { id }) => ({
    ...state,
    transactions: state.transactions.filter((transaction) => transaction.id !== id),
    loading: false,
    error: null,
    successMessage: 'Transaction deleted successfully.'
  })),
  on(TransactionsActions.deleteTransactionFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(TransactionsActions.duplicateTransaction, (state) => ({ ...state, loading: true, error: null, successMessage: null })),
  on(TransactionsActions.duplicateTransactionSuccess, (state, { transactions }) => ({
    ...state,
    transactions,
    loading: false,
    error: null,
    successMessage: 'Transaction duplicated successfully.'
  })),
  on(TransactionsActions.duplicateTransactionFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(TransactionsActions.changeTransactionCategory, (state) => ({ ...state, loading: true, error: null, successMessage: null })),
  on(TransactionsActions.changeTransactionCategorySuccess, (state, { transactions }) => ({
    ...state,
    transactions,
    loading: false,
    error: null,
    successMessage: 'Category updated successfully.'
  })),
  on(TransactionsActions.changeTransactionCategoryFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(TransactionsActions.clearTransactionFeedback, (state) => ({ ...state, error: null, successMessage: null })),

  // Edit-form: load a single transaction.
  on(TransactionsActions.loadTransaction, (state) => ({
    ...state,
    selectedTransaction: null,
    selectedLoading: true,
    selectedError: null
  })),
  on(TransactionsActions.loadTransactionSuccess, (state, { transaction }) => ({
    ...state,
    selectedTransaction: transaction,
    selectedLoading: false,
    selectedError: null
  })),
  on(TransactionsActions.loadTransactionFailure, (state, { error }) => ({
    ...state,
    selectedTransaction: null,
    selectedLoading: false,
    selectedError: error
  })),
  on(TransactionsActions.clearSelectedTransaction, (state) => ({
    ...state,
    selectedTransaction: null,
    selectedError: null
  })),

  // Create / update from the form.
  on(TransactionsActions.createTransaction, TransactionsActions.updateTransaction, (state) => ({
    ...state,
    saving: true,
    error: null,
    successMessage: null
  })),
  on(TransactionsActions.createTransactionSuccess, (state, { transactions }) => ({
    ...state,
    transactions,
    saving: false,
    error: null,
    successMessage: 'Transaction added successfully.'
  })),
  on(TransactionsActions.updateTransactionSuccess, (state, { transactions }) => ({
    ...state,
    transactions,
    saving: false,
    error: null,
    successMessage: 'Transaction updated successfully.'
  })),
  on(
    TransactionsActions.createTransactionFailure,
    TransactionsActions.updateTransactionFailure,
    (state, { error }) => ({ ...state, saving: false, error })
  )
);
