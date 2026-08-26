import { createReducer, on } from '@ngrx/store';
import { initialSpendingState, spendingFeatureKey, SpendingState } from './spending.state';
import * as SpendingActions from './spending.actions';
import { recalculateOverviewAndCategories } from '../utility/spending.calculations';

export { spendingFeatureKey };

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
      paymentMethod: null,
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
    error: null,
    tags: [...state.tags, tag],
    successMessage: 'Tag created successfully.'
  })),

  on(SpendingActions.deleteTagSuccess, (state, { id }) => ({
    ...state,
    error: null,
    tags: state.tags.filter((t) => t.id !== id),
    successMessage: 'Tag deleted successfully.'
  })),

  // Recurring Expenses
  on(SpendingActions.addRecurringExpenseSuccess, (state, { item }) => ({
    ...state,
    error: null,
    recurringExpenses: [...state.recurringExpenses, item],
    successMessage: 'Recurring subscription added.'
  })),

  on(SpendingActions.toggleRecurringExpenseSuccess, (state, { item }) => ({
    ...state,
    error: null,
    recurringExpenses: state.recurringExpenses.map((r) => (r.id === item.id ? item : r))
  })),

  on(SpendingActions.deleteRecurringExpenseSuccess, (state, { id }) => ({
    ...state,
    error: null,
    recurringExpenses: state.recurringExpenses.filter((r) => r.id !== id),
    successMessage: 'Recurring expense deleted successfully.'
  })),

  // Generic mutation failure (tags, recurring)
  on(SpendingActions.spendingOperationFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
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
