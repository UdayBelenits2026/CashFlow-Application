import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SpendingState, spendingFeatureKey } from './spending.state';
import { computeTopMerchants, computeBudgetVsActual, computeInsights } from '../utility/spending.calculations';

export const selectSpendingState = createFeatureSelector<SpendingState>(spendingFeatureKey);

// --- Status Selectors ---
export const selectIsLoading = createSelector(
  selectSpendingState,
  (state) => state.isLoading
);

export const selectSpendingError = createSelector(
  selectSpendingState,
  (state) => state.error
);

export const selectSuccessMessage = createSelector(
  selectSpendingState,
  (state) => state.successMessage
);

// --- Overview & KPI Selectors ---
export const selectSpendingOverview = createSelector(
  selectSpendingState,
  (state) => state.overview
);

export const selectHasLoadedData = createSelector(
  selectSpendingOverview,
  (overview) => overview !== null
);

export const selectTotalSpending = createSelector(
  selectSpendingOverview,
  (overview) => overview?.totalSpending ?? 0
);

export const selectTransactionCount = createSelector(
  selectSpendingOverview,
  (overview) => overview?.transactionsCount ?? 0
);

export const selectAverageDailySpending = createSelector(
  selectSpendingOverview,
  (overview) => overview?.averageDaily ?? 0
);

export const selectTopCategory = createSelector(
  selectSpendingOverview,
  (overview) => ({
    name: overview?.topCategoryName ?? 'N/A',
    amount: overview?.topCategoryAmount ?? 0
  })
);

export const selectBudgetUsed = createSelector(
  selectSpendingOverview,
  (overview) => overview?.budgetUsedPercentage ?? 66
);

// --- Analytics Selectors ---
export const selectSpendingCategories = createSelector(
  selectSpendingState,
  (state) => state.categories
);

export const selectSpendingTrendPoints = createSelector(
  selectSpendingState,
  (state) => state.trendPoints
);

// --- Budget vs Actual (derived from categories) ---
export const selectBudgetVsActual = createSelector(
  selectSpendingCategories,
  (categories) => computeBudgetVsActual(categories)
);

// --- Expenses Selectors ---
export const selectAllExpenses = createSelector(
  selectSpendingState,
  (state) => state.expenses
);

export const selectRecentExpenses = createSelector(
  selectAllExpenses,
  (expenses) => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }
);

export const selectExpenseFilters = createSelector(
  selectSpendingState,
  (state) => state.filters
);

export const selectFilteredExpenses = createSelector(
  selectAllExpenses,
  selectExpenseFilters,
  (expenses, filters) => {
    let result = [...expenses];

    // Search filter (merchant or notes)
    if (filters.searchTerm?.trim()) {
      const term = filters.searchTerm.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.merchantName.toLowerCase().includes(term) ||
          e.categoryName.toLowerCase().includes(term) ||
          e.accountName.toLowerCase().includes(term) ||
          (e.notes && e.notes.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (filters.categoryId) {
      result = result.filter((e) => e.categoryId === filters.categoryId || e.categoryName === filters.categoryId);
    }

    // Account filter
    if (filters.accountId) {
      result = result.filter((e) => e.accountId === filters.accountId || e.accountName === filters.accountId);
    }

    // Payment method filter
    if (filters.paymentMethod) {
      result = result.filter((e) => e.paymentMethod === filters.paymentMethod);
    }

    // Date range filter
    if (filters.startDate) {
      result = result.filter((e) => new Date(e.date) >= new Date(filters.startDate!));
    }
    if (filters.endDate) {
      result = result.filter((e) => new Date(e.date) <= new Date(filters.endDate!));
    }

    // Amount range filter
    if (filters.minAmount !== null && filters.minAmount !== undefined) {
      result = result.filter((e) => e.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== null && filters.maxAmount !== undefined) {
      result = result.filter((e) => e.amount <= filters.maxAmount!);
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'merchant':
          comparison = a.merchantName.localeCompare(b.merchantName);
          break;
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }
);

// --- Top Merchants (derived from expenses) ---
export const selectTopMerchants = createSelector(
  selectAllExpenses,
  (expenses) => computeTopMerchants(expenses)
);

// --- Tags Selectors ---
export const selectTags = createSelector(
  selectSpendingState,
  (state) => state.tags
);

// --- Recurring Expenses Selectors ---
export const selectRecurringExpenses = createSelector(
  selectSpendingState,
  (state) => state.recurringExpenses
);

// --- Alerts Selectors ---
export const selectAlerts = createSelector(
  selectSpendingState,
  (state) => state.alerts
);

export const selectUnreadAlertsCount = createSelector(
  selectAlerts,
  (alerts) => alerts.filter((a) => !a.isRead).length
);

// --- Rule-Based Insights Selector ---
export const selectCalculatedInsights = createSelector(
  selectSpendingOverview,
  selectAllExpenses,
  (overview, expenses) => computeInsights(overview, expenses)
);
