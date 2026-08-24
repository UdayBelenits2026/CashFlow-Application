import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IncomeState, incomeFeatureKey, IncomeFilters } from './income.state';
import {
  calculateUpcomingIncomeItems,
  computeSourceReportItems,
  computeCalendarDays,
  deriveIncomeInsights
} from '../utility/income.calculations';

export const selectIncomeState = createFeatureSelector<IncomeState>(incomeFeatureKey);

// Status & Feedback
export const selectIsLoading = createSelector(selectIncomeState, (state) => state.isLoading);
export const selectIncomeError = createSelector(selectIncomeState, (state) => state.error);
export const selectSuccessMessage = createSelector(selectIncomeState, (state) => state.successMessage);
export const selectHasLoadedData = createSelector(
  selectIncomeState,
  (state) => !!state.overview || state.incomes.length > 0 || state.sources.length > 0
);

// Overview & KPIs
export const selectIncomeOverview = createSelector(selectIncomeState, (state) => state.overview);

export const selectTotalIncome = createSelector(
  selectIncomeOverview,
  (overview) => overview?.totalIncome ?? 0
);

export const selectReceiptsCount = createSelector(
  selectIncomeOverview,
  (overview) => overview?.receiptsCount ?? 0
);

export const selectTaxableIncome = createSelector(
  selectIncomeOverview,
  (overview) => overview?.taxableIncome ?? 0
);

export const selectActiveSourcesCount = createSelector(
  selectIncomeOverview,
  (overview) => overview?.activeSourcesCount ?? 0
);

export const selectAvgMonthlyIncome = createSelector(
  selectIncomeOverview,
  (overview) => overview?.averageMonthly ?? 0
);

export const selectTopSource = createSelector(selectIncomeOverview, (overview) => ({
  name: overview?.topSourceName || 'None',
  amount: overview?.topSourceAmount || 0,
  percentage: overview?.topSourcePercentage || 0
}));

export const selectTotalRecurringExpected = createSelector(
  selectIncomeOverview,
  (overview) => overview?.totalRecurringExpected ?? 0
);

// Sources
export const selectIncomeSources = createSelector(selectIncomeState, (state) => state.sources);

export const selectActiveSources = createSelector(selectIncomeSources, (sources) =>
  sources.filter((s) => s.status === 'ACTIVE')
);

export const selectIncomeSourceById = (sourceId: string) =>
  createSelector(selectIncomeSources, (sources) => sources.find((s) => s.id === sourceId) || null);

// Trends
export const selectIncomeTrendPoints = createSelector(selectIncomeState, (state) => state.trendPoints);

// Incomes (Transactions)
export const selectAllIncomes = createSelector(selectIncomeState, (state) => state.incomes);

export const selectRecentIncomes = createSelector(selectAllIncomes, (incomes) =>
  [...incomes]
    .filter((i) => i.status === 'RECORDED')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
);

export const selectIncomeFilters = createSelector(selectIncomeState, (state) => state.filters);

export const selectFilteredIncomes = createSelector(
  selectAllIncomes,
  selectIncomeFilters,
  (incomes, filters) => {
    let result = [...incomes];

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          i.description?.toLowerCase().includes(term) ||
          i.sourceName?.toLowerCase().includes(term) ||
          i.accountName?.toLowerCase().includes(term) ||
          i.notes?.toLowerCase().includes(term)
      );
    }

    if (filters.sourceId && filters.sourceId !== 'ALL') {
      result = result.filter((i) => i.incomeSourceId === filters.sourceId || i.sourceName === filters.sourceId);
    }

    if (filters.accountId && filters.accountId !== 'ALL') {
      result = result.filter((i) => i.accountId === filters.accountId || i.accountName === filters.accountId);
    }

    if (filters.taxable !== null) {
      result = result.filter((i) => i.taxable === filters.taxable);
    }

    if (filters.startDate) {
      result = result.filter((i) => i.date >= filters.startDate!);
    }

    if (filters.endDate) {
      result = result.filter((i) => i.date <= filters.endDate!);
    }

    if (filters.minAmount !== null) {
      result = result.filter((i) => i.amount >= filters.minAmount!);
    }

    if (filters.maxAmount !== null) {
      result = result.filter((i) => i.amount <= filters.maxAmount!);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (filters.sortBy === 'date') {
        comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (filters.sortBy === 'amount') {
        comparison = b.amount - a.amount;
      } else if (filters.sortBy === 'source') {
        comparison = (a.sourceName || '').localeCompare(b.sourceName || '');
      } else if (filters.sortBy === 'description') {
        comparison = (a.description || '').localeCompare(b.description || '');
      }
      return filters.sortOrder === 'asc' ? -comparison : comparison;
    });

    return result;
  }
);

// Recurring Incomes
export const selectRecurringIncomes = createSelector(selectIncomeState, (state) => state.recurringIncomes);

export const selectActiveRecurringIncomes = createSelector(selectRecurringIncomes, (list) =>
  list.filter((r) => r.status === 'ACTIVE')
);

// Derived Upcoming Income List
export const selectUpcomingIncomes = createSelector(selectRecurringIncomes, (recurringList) =>
  calculateUpcomingIncomeItems(recurringList)
);

// Derived Source Breakdown Report
export const selectIncomeSourceBreakdown = createSelector(
  selectAllIncomes,
  selectIncomeSources,
  (incomes, sources) => computeSourceReportItems(incomes, sources)
);

// Calendar Data
export const selectSelectedCalendarMonth = createSelector(
  selectIncomeState,
  (state) => state.selectedMonth
);

export const selectIncomeCalendarDays = createSelector(
  selectAllIncomes,
  selectRecurringIncomes,
  selectSelectedCalendarMonth,
  (incomes, recurring, { year, month }) => computeCalendarDays(year, month, incomes, recurring)
);

// Insights
export const selectCalculatedIncomeInsights = createSelector(
  selectAllIncomes,
  selectIncomeOverview,
  selectIncomeSources,
  selectRecurringIncomes,
  (incomes, overview, sources, recurring) => deriveIncomeInsights(incomes, overview, sources, recurring)
);

// Accounts Reference
export const selectAccounts = createSelector(selectIncomeState, (state) => state.accounts);
