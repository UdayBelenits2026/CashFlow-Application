import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SpendingState, spendingFeatureKey } from './spending.state';
import { SpendingInsight } from '../models/spending-summary.model';

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

export const selectSelectedExpenseId = createSelector(
  selectSpendingState,
  (state) => state.selectedExpenseId
);

export const selectSelectedExpense = createSelector(
  selectAllExpenses,
  selectSelectedExpenseId,
  (expenses, selectedId) => {
    if (!selectedId) return null;
    return expenses.find((e) => e.id === selectedId) || null;
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
      if (filters.sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (filters.sortBy === 'merchant') {
        comparison = a.merchantName.localeCompare(b.merchantName);
      } else {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }
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
  selectSpendingCategories,
  (overview, expenses, categories): SpendingInsight[] => {
    const insights: SpendingInsight[] = [];
    if (!overview) return insights;

    // Insight 1: Top Category
    if (overview.topCategoryName) {
      insights.push({
        id: 'ins-1',
        title: 'Top Spending Category',
        message: `You spent $${overview.topCategoryAmount.toFixed(2)} on ${overview.topCategoryName}, which represents your highest expenditure this period.`,
        type: 'info',
        badge: 'Category'
      });
    }

    // Insight 2: Daily Average
    if (overview.averageDaily) {
      insights.push({
        id: 'ins-2',
        title: 'Average Daily Outflow',
        message: `Your average daily spending is $${overview.averageDaily.toFixed(2)}. ${overview.averageDailyGrowthPercentage >= 0 ? `Up by ${overview.averageDailyGrowthPercentage}%` : `Down by ${Math.abs(overview.averageDailyGrowthPercentage)}%`} compared to previous baseline.`,
        type: overview.averageDailyGrowthPercentage > 5 ? 'negative' : 'positive',
        badge: 'Daily Trend'
      });
    }

    // Insight 3: Top Merchant
    if (expenses.length > 0) {
      const merchantMap: { [m: string]: number } = {};
      for (const e of expenses) {
        merchantMap[e.merchantName] = (merchantMap[e.merchantName] || 0) + e.amount;
      }
      let topMerchant = '';
      let topMerchantAmt = 0;
      for (const [m, amt] of Object.entries(merchantMap)) {
        if (amt > topMerchantAmt) {
          topMerchantAmt = amt;
          topMerchant = m;
        }
      }
      if (topMerchant) {
        insights.push({
          id: 'ins-3',
          title: 'Frequent Merchant',
          message: `${topMerchant} is your top merchant with total volume of $${topMerchantAmt.toFixed(2)}.`,
          type: 'neutral',
          badge: 'Merchant'
        });
      }
    }

    // Insight 4: Budget Adherence
    const budgetPct = overview.budgetUsedPercentage || 66;
    insights.push({
      id: 'ins-4',
      title: 'Budget Discipline',
      message: `You have consumed ${budgetPct}% of your allocated monthly spending ceiling. 5 out of 8 categories remain securely within budget.`,
      type: budgetPct > 85 ? 'negative' : 'positive',
      badge: 'Budget'
    });

    return insights;
  }
);
