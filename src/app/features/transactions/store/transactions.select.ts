import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AccountOption, TransactionPageInfo } from '../models/models.transaction';
import { TransactionsState, transactionsFeatureKey } from './transactions.reducers';

export const selectTransactionsState = createFeatureSelector<TransactionsState>(transactionsFeatureKey);

export const selectAllTransactions = createSelector(selectTransactionsState, (state) => state.transactions);
export const selectTransactionFilters = createSelector(selectTransactionsState, (state) => state.filters);
export const selectTransactionSearch = createSelector(selectTransactionsState, (state) => state.search);
export const selectTransactionSort = createSelector(selectTransactionsState, (state) => state.sort);
export const selectTransactionsLoading = createSelector(selectTransactionsState, (state) => state.loading);
export const selectTransactionsError = createSelector(selectTransactionsState, (state) => state.error);
export const selectTransactionsSuccess = createSelector(selectTransactionsState, (state) => state.successMessage);
export const selectTransactionPage = createSelector(selectTransactionsState, (state) => state.page);
export const selectTransactionPageSize = createSelector(selectTransactionsState, (state) => state.pageSize);

// Edit-form single-transaction state.
export const selectSelectedTransaction = createSelector(selectTransactionsState, (state) => state.selectedTransaction);
export const selectSelectedLoading = createSelector(selectTransactionsState, (state) => state.selectedLoading);
export const selectSelectedError = createSelector(selectTransactionsState, (state) => state.selectedError);
export const selectTransactionSaving = createSelector(selectTransactionsState, (state) => state.saving);

// Distinct accounts (id + name) derived from the loaded transactions.
export const selectAccountOptions = createSelector(selectAllTransactions, (transactions): AccountOption[] => {
  const map = new Map<string, string>();
  transactions.forEach((transaction) => {
    if (transaction.accountId && !map.has(transaction.accountId)) {
      map.set(transaction.accountId, transaction.accountName);
    }
  });
  return [...map.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

// Distinct categories derived from the loaded transactions.
export const selectCategoryOptions = createSelector(selectAllTransactions, (transactions) =>
  [...new Set(transactions.map((transaction) => transaction.category).filter(Boolean))].sort()
);

// Applies account/category/type/date/amount filters + text search, then sorts by the selected column.
export const selectFilteredTransactions = createSelector(
  selectAllTransactions,
  selectTransactionFilters,
  selectTransactionSearch,
  selectTransactionSort,
  (transactions, filters, search, sort) => {
    let result = transactions;
    if (filters.accountId) {
      result = result.filter((transaction) => transaction.accountId === filters.accountId);
    }
    if (filters.category) {
      result = result.filter((transaction) => transaction.category === filters.category);
    }
    if (filters.type) {
      result = result.filter((transaction) => transaction.type === filters.type);
    }
    if (filters.startDate) {
      result = result.filter((transaction) => transaction.date >= filters.startDate);
    }
    if (filters.endDate) {
      result = result.filter((transaction) => transaction.date <= filters.endDate);
    }
    if (filters.minAmount !== null) {
      result = result.filter((transaction) => transaction.amount >= (filters.minAmount as number));
    }
    if (filters.maxAmount !== null) {
      result = result.filter((transaction) => transaction.amount <= (filters.maxAmount as number));
    }

    const term = search.trim().toLowerCase();
    if (term.length >= 2) {
      result = result.filter((transaction) =>
        transaction.description.toLowerCase().includes(term) ||
        (transaction.merchant ?? '').toLowerCase().includes(term) ||
        transaction.category.toLowerCase().includes(term) ||
        transaction.accountName.toLowerCase().includes(term) ||
        String(transaction.amount).includes(term)
      );
    }

    const direction = sort.direction === 'asc' ? 1 : -1;
    return [...result].sort((a, b) => {
      const comparison =
        sort.field === 'amount'
          ? a.amount - b.amount
          : String(a[sort.field] ?? '').localeCompare(String(b[sort.field] ?? ''));
      return comparison * direction;
    });
  }
);

export const selectFilteredCount = createSelector(selectFilteredTransactions, (transactions) => transactions.length);

// Current page slice of the filtered transactions (page is clamped to the available range).
export const selectPagedTransactions = createSelector(
  selectFilteredTransactions,
  selectTransactionPage,
  selectTransactionPageSize,
  (transactions, page, pageSize) => {
    const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
    const current = Math.min(page, totalPages);
    const start = (current - 1) * pageSize;
    return transactions.slice(start, start + pageSize);
  }
);

// Pagination summary + a windowed list of page numbers for the pager.
export const selectTransactionPageInfo = createSelector(
  selectFilteredCount,
  selectTransactionPage,
  selectTransactionPageSize,
  (total, page, pageSize): TransactionPageInfo => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const current = Math.min(page, totalPages);
    const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
    const to = Math.min(current * pageSize, total);

    const windowSize = 5;
    let start = Math.max(1, current - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return { page: current, pageSize, total, totalPages, from, to, pages };
  }
);
