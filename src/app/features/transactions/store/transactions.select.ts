import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TransactionPageInfo, TransactionSortField } from '../models/models.transaction';
import { TransactionsState, transactionsFeatureKey } from './transactions.reducers';

export const selectTransactionsState = createFeatureSelector<TransactionsState>(transactionsFeatureKey);

export const selectTransactionContent = createSelector(selectTransactionsState, (state) => state.content);
export const selectTransactionsLoading = createSelector(selectTransactionsState, (state) => state.loading);
export const selectTransactionsError = createSelector(selectTransactionsState, (state) => state.error);
export const selectTransactionsSuccess = createSelector(selectTransactionsState, (state) => state.successMessage);
export const selectTransactionSort = createSelector(selectTransactionsState, (state) => state.sort);
export const selectTransactionFilters = createSelector(selectTransactionsState, (state) => state.filters);
export const selectTransactionAccountId = createSelector(selectTransactionsState, (state) => state.filters.accountId);
export const selectTransactionPage = createSelector(selectTransactionsState, (state) => state.page);
export const selectTransactionPageSize = createSelector(selectTransactionsState, (state) => state.size);
export const selectTransactionTotalElements = createSelector(selectTransactionsState, (state) => state.totalElements);
export const selectTransactionTotalPages = createSelector(selectTransactionsState, (state) => state.totalPages);

// Read-only details.
export const selectTransactionDetail = createSelector(selectTransactionsState, (state) => state.detail);
export const selectTransactionDetailLoading = createSelector(selectTransactionsState, (state) => state.detailLoading);
export const selectTransactionDetailError = createSelector(selectTransactionsState, (state) => state.detailError);

// Edit-form data.
export const selectTransactionEditData = createSelector(selectTransactionsState, (state) => state.editData);
export const selectTransactionEditLoading = createSelector(selectTransactionsState, (state) => state.editLoading);
export const selectTransactionEditError = createSelector(selectTransactionsState, (state) => state.editError);

export const selectTransactionSaving = createSelector(selectTransactionsState, (state) => state.saving);

// Maps UI sort fields to the backend sort columns (assumed names; confirm with backend).
const SORT_COLUMNS: Record<TransactionSortField, string> = {
  date: 'transactiondate',
  description: 'description',
  amount: 'amount',
  category: 'category',
  accountName: 'accountname'
};

// Combined query used by the load effect to build the GET /transactions request.
export const selectTransactionQuery = createSelector(selectTransactionsState, (state) => ({
  page: state.page,
  size: state.size,
  sort: `${SORT_COLUMNS[state.sort.field]},${state.sort.direction}`,
  accountId: state.filters.accountId
}));

// Pagination summary derived from server totals (page is 0-based internally).
export const selectTransactionPageInfo = createSelector(
  selectTransactionsState,
  (state): TransactionPageInfo => {
    const total = state.totalElements;
    const pageSize = state.size;
    const totalPages = Math.max(1, state.totalPages || Math.ceil(total / pageSize) || 1);
    const current = Math.min(state.page, totalPages - 1);
    const from = total === 0 ? 0 : current * pageSize + 1;
    const to = Math.min((current + 1) * pageSize, total);

    const windowSize = 5;
    let start = Math.max(0, current - Math.floor(windowSize / 2));
    const end = Math.min(totalPages - 1, start + windowSize - 1);
    start = Math.max(0, end - windowSize + 1);

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return { page: current, pageSize, total, totalPages, from, to, pages };
  }
);
