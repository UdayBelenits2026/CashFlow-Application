import { createReducer, on } from '@ngrx/store';
import { initialSpendingState, spendingFeatureKey, SpendingState } from './spending.state';
import * as SpendingActions from './spending.actions';
import { Expense } from '../models/expense.model';
import { SpendingCategoryItem, SpendingOverviewData } from '../models/spending-summary.model';

export { spendingFeatureKey };

function recalculateOverviewAndCategories(
  expenses: Expense[],
  currentOverview: SpendingOverviewData | null,
  currentCategories: SpendingCategoryItem[]
): { overview: SpendingOverviewData | null; categories: SpendingCategoryItem[] } {
  if (!currentOverview) {
    return { overview: currentOverview, categories: currentCategories };
  }

  const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const count = expenses.length;
  const daysInMonth = 31;
  const avgDaily = count > 0 ? Number((total / daysInMonth).toFixed(2)) : 0;

  // Group by category to find top category and recalculate amounts
  const catTotals: { [name: string]: number } = {};
  for (const exp of expenses) {
    const cat = exp.categoryName || 'Other';
    catTotals[cat] = (catTotals[cat] || 0) + (Number(exp.amount) || 0);
  }

  let topCatName = currentOverview.topCategoryName;
  let topCatAmount = currentOverview.topCategoryAmount;
  let maxCatAmount = -1;

  for (const [cName, cAmt] of Object.entries(catTotals)) {
    if (cAmt > maxCatAmount) {
      maxCatAmount = cAmt;
      topCatName = cName;
      topCatAmount = cAmt;
    }
  }

  const updatedOverview: SpendingOverviewData = {
    ...currentOverview,
    totalSpending: Number(total.toFixed(2)),
    transactionsCount: count,
    averageDaily: avgDaily,
    topCategoryName: topCatName,
    topCategoryAmount: Number(topCatAmount.toFixed(2)),
    budgetUsedPercentage: currentOverview.budgetTotal
      ? Math.min(100, Math.round((total / currentOverview.budgetTotal) * 100))
      : currentOverview.budgetUsedPercentage || 66
  };

  const updatedCategories = currentCategories.map((c) => {
    const amt = catTotals[c.name] ?? c.amount;
    const pct = total > 0 ? Number(((amt / total) * 100).toFixed(1)) : 0;
    return {
      ...c,
      amount: Number(amt.toFixed(2)),
      percentage: pct,
      barWidth: `${Math.min(100, Math.max(10, Math.round(pct * 3.5)))}%`
    };
  });

  return { overview: updatedOverview, categories: updatedCategories };
}

export const spendingReducer = createReducer(
  initialSpendingState,

  // Load Dashboard
  on(SpendingActions.loadSpendingDashboard, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(
    SpendingActions.loadSpendingDashboardSuccess,
    (state, { overview, categories, trendPoints, expenses, tags, recurringExpenses, alerts }) => ({
      ...state,
      overview,
      categories,
      trendPoints,
      expenses,
      tags,
      recurringExpenses,
      alerts,
      isLoading: false,
      error: null
    })
  ),

  on(SpendingActions.loadSpendingDashboardFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Add Expense
  on(SpendingActions.addExpense, (state) => ({
    ...state,
    isLoading: true,
    error: null,
    successMessage: null
  })),

  on(SpendingActions.addExpenseSuccess, (state, { expense }) => {
    const updatedExpenses = [expense, ...state.expenses];
    const { overview, categories } = recalculateOverviewAndCategories(
      updatedExpenses,
      state.overview,
      state.categories
    );
    return {
      ...state,
      expenses: updatedExpenses,
      overview: overview || state.overview,
      categories,
      isLoading: false,
      error: null,
      successMessage: 'Expense saved successfully.'
    };
  }),

  on(SpendingActions.addExpenseFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Update Expense
  on(SpendingActions.updateExpense, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(SpendingActions.updateExpenseSuccess, (state, { expense }) => {
    const updatedExpenses = state.expenses.map((e) => (e.id === expense.id ? expense : e));
    const { overview, categories } = recalculateOverviewAndCategories(
      updatedExpenses,
      state.overview,
      state.categories
    );
    return {
      ...state,
      expenses: updatedExpenses,
      overview: overview || state.overview,
      categories,
      selectedExpenseId: state.selectedExpenseId === expense.id ? expense.id : state.selectedExpenseId,
      isLoading: false,
      error: null,
      successMessage: 'Expense updated successfully.'
    };
  }),

  on(SpendingActions.updateExpenseFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Delete Expense
  on(SpendingActions.deleteExpense, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(SpendingActions.deleteExpenseSuccess, (state, { id }) => {
    const deleted = state.expenses.find((e) => e.id === id);
    const updatedExpenses = state.expenses.filter((e) => e.id !== id);
    const { overview, categories } = recalculateOverviewAndCategories(
      updatedExpenses,
      state.overview,
      state.categories
    );
    return {
      ...state,
      expenses: updatedExpenses,
      overview: overview || state.overview,
      categories,
      selectedExpenseId: state.selectedExpenseId === id ? null : state.selectedExpenseId,
      isLoading: false,
      error: null,
      successMessage: 'Expense deleted successfully.'
    };
  }),

  on(SpendingActions.deleteExpenseFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Active Selection
  on(SpendingActions.selectExpense, (state, { id }) => ({
    ...state,
    selectedExpenseId: id
  })),

  // Filters
  on(SpendingActions.setExpenseFilters, (state, { filters }) => ({
    ...state,
    filters: {
      ...state.filters,
      ...filters
    }
  })),

  on(SpendingActions.resetExpenseFilters, (state) => ({
    ...state,
    filters: {
      searchTerm: '',
      categoryId: null,
      accountId: null,
      startDate: null,
      endDate: null,
      minAmount: null,
      maxAmount: null,
      sortBy: 'date',
      sortOrder: 'desc'
    }
  })),

  // Tags
  on(SpendingActions.addTagSuccess, (state, { tag }) => ({
    ...state,
    tags: [...state.tags, tag],
    successMessage: 'Tag created successfully.'
  })),

  on(SpendingActions.deleteTagSuccess, (state, { id }) => ({
    ...state,
    tags: state.tags.filter((t) => t.id !== id),
    successMessage: 'Tag deleted successfully.'
  })),

  // Recurring Expenses
  on(SpendingActions.addRecurringExpenseSuccess, (state, { item }) => ({
    ...state,
    recurringExpenses: [...state.recurringExpenses, item],
    successMessage: 'Recurring subscription added.'
  })),

  on(SpendingActions.toggleRecurringExpenseSuccess, (state, { item }) => ({
    ...state,
    recurringExpenses: state.recurringExpenses.map((r) => (r.id === item.id ? item : r))
  })),

  on(SpendingActions.deleteRecurringExpenseSuccess, (state, { id }) => ({
    ...state,
    recurringExpenses: state.recurringExpenses.filter((r) => r.id !== id),
    successMessage: 'Recurring expense deleted successfully.'
  })),

  // Alerts
  on(SpendingActions.markAlertAsRead, (state, { id }) => ({
    ...state,
    alerts: state.alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a))
  })),

  on(SpendingActions.dismissAlert, (state, { id }) => ({
    ...state,
    alerts: state.alerts.filter((a) => a.id !== id)
  })),

  // Feedback
  on(SpendingActions.clearSpendingFeedback, (state) => ({
    ...state,
    error: null,
    successMessage: null
  }))
);
