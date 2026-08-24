import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as IncomeActions from '../store/income.actions';
import * as IncomeSelectors from '../store/income.selectors';
import { Income } from '../models/income.model';
import { IncomeSource } from '../models/income-source.model';
import { RecurringIncome } from '../models/recurring-income.model';
import { AccountRef } from '../models/account-ref.model';
import {
  IncomeOverviewData,
  IncomeSourceReportItem,
  IncomeTrendPoint,
  UpcomingIncomeItem,
  IncomeInsight
} from '../models/income-summary.model';
import { IncomeCalendarDay } from '../models/income-calendar.model';
import { IncomeFilters } from '../store/income.state';

@Injectable({
  providedIn: 'root'
})
export class IncomeFacade {
  private readonly store: Store = inject(Store);

  // Status & Feedback
  readonly isLoading$: Observable<boolean> = this.store.select(IncomeSelectors.selectIsLoading);
  readonly error$: Observable<string | null> = this.store.select(IncomeSelectors.selectIncomeError);
  readonly successMessage$: Observable<string | null> = this.store.select(IncomeSelectors.selectSuccessMessage);
  readonly hasData$: Observable<boolean> = this.store.select(IncomeSelectors.selectHasLoadedData);

  // Overview & KPIs
  readonly overview$: Observable<IncomeOverviewData | null> = this.store.select(IncomeSelectors.selectIncomeOverview);
  readonly totalIncome$: Observable<number> = this.store.select(IncomeSelectors.selectTotalIncome);
  readonly receiptsCount$: Observable<number> = this.store.select(IncomeSelectors.selectReceiptsCount);
  readonly taxableIncome$: Observable<number> = this.store.select(IncomeSelectors.selectTaxableIncome);
  readonly activeSourcesCount$: Observable<number> = this.store.select(IncomeSelectors.selectActiveSourcesCount);
  readonly avgMonthlyIncome$: Observable<number> = this.store.select(IncomeSelectors.selectAvgMonthlyIncome);
  readonly topSource$: Observable<{ name: string; amount: number; percentage: number }> = this.store.select(
    IncomeSelectors.selectTopSource
  );
  readonly totalRecurringExpected$: Observable<number> = this.store.select(IncomeSelectors.selectTotalRecurringExpected);

  // Sources
  readonly sources$: Observable<IncomeSource[]> = this.store.select(IncomeSelectors.selectIncomeSources);
  readonly activeSources$: Observable<IncomeSource[]> = this.store.select(IncomeSelectors.selectActiveSources);

  // Trends & Charts
  readonly trendPoints$: Observable<IncomeTrendPoint[]> = this.store.select(IncomeSelectors.selectIncomeTrendPoints);
  readonly sourceBreakdown$: Observable<IncomeSourceReportItem[]> = this.store.select(
    IncomeSelectors.selectIncomeSourceBreakdown
  );

  // Incomes (Transactions)
  readonly allIncomes$: Observable<Income[]> = this.store.select(IncomeSelectors.selectAllIncomes);
  readonly recentIncomes$: Observable<Income[]> = this.store.select(IncomeSelectors.selectRecentIncomes);
  readonly filteredIncomes$: Observable<Income[]> = this.store.select(IncomeSelectors.selectFilteredIncomes);
  readonly filters$: Observable<IncomeFilters> = this.store.select(IncomeSelectors.selectIncomeFilters);

  // Recurring & Upcoming
  readonly recurringIncomes$: Observable<RecurringIncome[]> = this.store.select(IncomeSelectors.selectRecurringIncomes);
  readonly activeRecurringIncomes$: Observable<RecurringIncome[]> = this.store.select(
    IncomeSelectors.selectActiveRecurringIncomes
  );
  readonly upcomingIncomes$: Observable<UpcomingIncomeItem[]> = this.store.select(IncomeSelectors.selectUpcomingIncomes);

  // Calendar
  readonly selectedMonth$: Observable<{ year: number; month: number }> = this.store.select(
    IncomeSelectors.selectSelectedCalendarMonth
  );
  readonly calendarDays$: Observable<IncomeCalendarDay[]> = this.store.select(IncomeSelectors.selectIncomeCalendarDays);

  // Insights & Accounts
  readonly insights$: Observable<IncomeInsight[]> = this.store.select(IncomeSelectors.selectCalculatedIncomeInsights);
  readonly accounts$: Observable<AccountRef[]> = this.store.select(IncomeSelectors.selectAccounts);

  // --- Dispatch Methods ---

  loadDashboard(): void {
    this.store.dispatch(IncomeActions.loadIncomeDashboard());
  }

  retry(): void {
    this.loadDashboard();
  }

  addIncome(income: Partial<Income>): void {
    this.store.dispatch(IncomeActions.addIncome({ income }));
  }

  updateIncome(id: string, income: Partial<Income>): void {
    this.store.dispatch(IncomeActions.updateIncome({ id, income }));
  }

  deleteIncome(id: string): void {
    this.store.dispatch(IncomeActions.deleteIncome({ id }));
  }

  addSource(source: Partial<IncomeSource>): void {
    this.store.dispatch(IncomeActions.addIncomeSource({ source }));
  }

  updateSource(id: string, source: Partial<IncomeSource>): void {
    this.store.dispatch(IncomeActions.updateIncomeSource({ id, source }));
  }

  toggleSourceStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): void {
    this.store.dispatch(IncomeActions.toggleIncomeSourceStatus({ id, status }));
  }

  deleteSource(id: string): void {
    this.store.dispatch(IncomeActions.deleteIncomeSource({ id }));
  }

  addRecurring(item: Partial<RecurringIncome>): void {
    this.store.dispatch(IncomeActions.addRecurringIncome({ item }));
  }

  updateRecurring(id: string, item: Partial<RecurringIncome>): void {
    this.store.dispatch(IncomeActions.updateRecurringIncome({ id, item }));
  }

  toggleRecurring(id: string, status: 'ACTIVE' | 'PAUSED'): void {
    this.store.dispatch(IncomeActions.toggleRecurringIncomeStatus({ id, status }));
  }

  deleteRecurring(id: string): void {
    this.store.dispatch(IncomeActions.deleteRecurringIncome({ id }));
  }

  recordRecurringIncome(recurringId: string, date?: string, notes?: string): void {
    this.store.dispatch(IncomeActions.recordRecurringIncome({ recurringId, date, notes }));
  }

  setFilters(filters: Partial<IncomeFilters>): void {
    this.store.dispatch(IncomeActions.setIncomeFilters({ filters }));
  }

  resetFilters(): void {
    this.store.dispatch(IncomeActions.resetIncomeFilters());
  }

  setSelectedCalendarMonth(year: number, month: number): void {
    this.store.dispatch(IncomeActions.setSelectedCalendarMonth({ year, month }));
  }

  clearFeedback(): void {
    this.store.dispatch(IncomeActions.clearIncomeFeedback());
  }
}
