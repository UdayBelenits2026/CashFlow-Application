import { createReducer, on } from '@ngrx/store';
import { initialIncomeState, IncomeState, incomeFeatureKey, initialIncomeFilters } from './income.state';
import * as IncomeActions from './income.actions';
import { recalculateIncomeOverviewAndSources } from '../utility/income.calculations';

export { incomeFeatureKey };

export const incomeReducer = createReducer(
  initialIncomeState,

  // --- Load Dashboard ---
  on(IncomeActions.loadIncomeDashboard, (state): IncomeState => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(
    IncomeActions.loadIncomeDashboardSuccess,
    (state, { overview, sources, trendPoints, incomes, recurringIncomes, accounts }): IncomeState => ({
      ...state,
      overview,
      sources,
      trendPoints,
      incomes,
      recurringIncomes,
      accounts,
      isLoading: false,
      error: null
    })
  ),

  on(IncomeActions.loadIncomeDashboardFailure, (state, { error }): IncomeState => ({
    ...state,
    isLoading: false,
    error
  })),

  // --- Add Income ---
  on(IncomeActions.addIncome, (state): IncomeState => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(IncomeActions.addIncomeSuccess, (state, { income }): IncomeState => {
    const updatedIncomes = [income, ...state.incomes];
    const { overview, sources } = recalculateIncomeOverviewAndSources(
      updatedIncomes,
      state.sources,
      state.recurringIncomes,
      state.overview
    );
    return {
      ...state,
      incomes: updatedIncomes,
      overview,
      sources,
      isLoading: false,
      successMessage: 'Income recorded successfully.'
    };
  }),

  on(IncomeActions.addIncomeFailure, (state, { error }): IncomeState => ({
    ...state,
    isLoading: false,
    error
  })),

  // --- Update Income ---
  on(IncomeActions.updateIncome, (state): IncomeState => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(IncomeActions.updateIncomeSuccess, (state, { income }): IncomeState => {
    const updatedIncomes = state.incomes.map((item) => (item.id === income.id ? income : item));
    const { overview, sources } = recalculateIncomeOverviewAndSources(
      updatedIncomes,
      state.sources,
      state.recurringIncomes,
      state.overview
    );
    return {
      ...state,
      incomes: updatedIncomes,
      overview,
      sources,
      isLoading: false,
      successMessage: 'Income updated successfully.'
    };
  }),

  on(IncomeActions.updateIncomeFailure, (state, { error }): IncomeState => ({
    ...state,
    isLoading: false,
    error
  })),

  // --- Delete Income ---
  on(IncomeActions.deleteIncome, (state): IncomeState => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(IncomeActions.deleteIncomeSuccess, (state, { id }): IncomeState => {
    const updatedIncomes = state.incomes.filter((item) => item.id !== id);
    const { overview, sources } = recalculateIncomeOverviewAndSources(
      updatedIncomes,
      state.sources,
      state.recurringIncomes,
      state.overview
    );
    return {
      ...state,
      incomes: updatedIncomes,
      overview,
      sources,
      isLoading: false,
      successMessage: 'Income deleted successfully.'
    };
  }),

  on(IncomeActions.deleteIncomeFailure, (state, { error }): IncomeState => ({
    ...state,
    isLoading: false,
    error
  })),

  // --- Income Sources ---
  on(IncomeActions.addIncomeSourceSuccess, (state, { source }): IncomeState => {
    const updatedSources = [...state.sources, source];
    return {
      ...state,
      sources: updatedSources,
      overview: state.overview
        ? { ...state.overview, activeSourcesCount: updatedSources.filter((s) => s.status === 'ACTIVE').length }
        : null,
      isLoading: false,
      successMessage: 'Income source created successfully.'
    };
  }),

  on(IncomeActions.updateIncomeSourceSuccess, (state, { source }): IncomeState => {
    const updatedSources = state.sources.map((s) => (s.id === source.id ? source : s));
    return {
      ...state,
      sources: updatedSources,
      isLoading: false,
      successMessage: 'Income source updated successfully.'
    };
  }),

  on(IncomeActions.toggleIncomeSourceStatusSuccess, (state, { source }): IncomeState => {
    const updatedSources = state.sources.map((s) => (s.id === source.id ? source : s));
    return {
      ...state,
      sources: updatedSources,
      overview: state.overview
        ? { ...state.overview, activeSourcesCount: updatedSources.filter((s) => s.status === 'ACTIVE').length }
        : null,
      isLoading: false,
      successMessage: `Income source set to ${source.status}.`
    };
  }),

  on(IncomeActions.deleteIncomeSourceSuccess, (state, { id }): IncomeState => {
    const updatedSources = state.sources.filter((s) => s.id !== id);
    return {
      ...state,
      sources: updatedSources,
      overview: state.overview
        ? { ...state.overview, activeSourcesCount: updatedSources.filter((s) => s.status === 'ACTIVE').length }
        : null,
      isLoading: false,
      successMessage: 'Income source removed.'
    };
  }),

  // --- Recurring Income ---
  on(IncomeActions.addRecurringIncomeSuccess, (state, { item }): IncomeState => {
    const updatedRecurring = [...state.recurringIncomes, item];
    const totalRecurring = updatedRecurring
      .filter((r) => r.status === 'ACTIVE')
      .reduce((sum, r) => sum + r.expectedAmount, 0);
    return {
      ...state,
      recurringIncomes: updatedRecurring,
      overview: state.overview ? { ...state.overview, totalRecurringExpected: totalRecurring } : null,
      isLoading: false,
      successMessage: 'Recurring income schedule added.'
    };
  }),

  on(IncomeActions.updateRecurringIncomeSuccess, (state, { item }): IncomeState => {
    const updatedRecurring = state.recurringIncomes.map((r) => (r.id === item.id ? item : r));
    const totalRecurring = updatedRecurring
      .filter((r) => r.status === 'ACTIVE')
      .reduce((sum, r) => sum + r.expectedAmount, 0);
    return {
      ...state,
      recurringIncomes: updatedRecurring,
      overview: state.overview ? { ...state.overview, totalRecurringExpected: totalRecurring } : null,
      isLoading: false,
      successMessage: 'Recurring schedule updated.'
    };
  }),

  on(IncomeActions.toggleRecurringIncomeStatusSuccess, (state, { item }): IncomeState => {
    const updatedRecurring = state.recurringIncomes.map((r) => (r.id === item.id ? item : r));
    const totalRecurring = updatedRecurring
      .filter((r) => r.status === 'ACTIVE')
      .reduce((sum, r) => sum + r.expectedAmount, 0);
    return {
      ...state,
      recurringIncomes: updatedRecurring,
      overview: state.overview ? { ...state.overview, totalRecurringExpected: totalRecurring } : null,
      isLoading: false,
      successMessage: `Recurring schedule is now ${item.status}.`
    };
  }),

  on(IncomeActions.deleteRecurringIncomeSuccess, (state, { id }): IncomeState => {
    const updatedRecurring = state.recurringIncomes.filter((r) => r.id !== id);
    const totalRecurring = updatedRecurring
      .filter((r) => r.status === 'ACTIVE')
      .reduce((sum, r) => sum + r.expectedAmount, 0);
    return {
      ...state,
      recurringIncomes: updatedRecurring,
      overview: state.overview ? { ...state.overview, totalRecurringExpected: totalRecurring } : null,
      isLoading: false,
      successMessage: 'Recurring schedule deleted.'
    };
  }),

  // --- Record Recurring Occurrence ---
  on(IncomeActions.recordRecurringIncomeSuccess, (state, { recordedIncome, updatedRecurring }): IncomeState => {
    const updatedIncomes = [recordedIncome, ...state.incomes];
    const updatedRecurringList = state.recurringIncomes.map((r) =>
      r.id === updatedRecurring.id ? updatedRecurring : r
    );
    const { overview, sources } = recalculateIncomeOverviewAndSources(
      updatedIncomes,
      state.sources,
      updatedRecurringList,
      state.overview
    );
    return {
      ...state,
      incomes: updatedIncomes,
      recurringIncomes: updatedRecurringList,
      overview,
      sources,
      isLoading: false,
      successMessage: `Recorded ₹${recordedIncome.amount} from ${recordedIncome.sourceName}. Next date updated.`
    };
  }),

  // --- Filters & Navigation ---
  on(IncomeActions.setIncomeFilters, (state, { filters }): IncomeState => ({
    ...state,
    filters: { ...state.filters, ...filters }
  })),

  on(IncomeActions.resetIncomeFilters, (state): IncomeState => ({
    ...state,
    filters: initialIncomeFilters
  })),

  on(IncomeActions.setSelectedCalendarMonth, (state, { year, month }): IncomeState => ({
    ...state,
    selectedMonth: { year, month }
  })),

  // --- Feedback & Generic Error ---
  on(IncomeActions.incomeOperationFailure, (state, { error }): IncomeState => ({
    ...state,
    isLoading: false,
    error
  })),

  on(IncomeActions.clearIncomeFeedback, (state): IncomeState => ({
    ...state,
    error: null,
    successMessage: null
  }))
);
