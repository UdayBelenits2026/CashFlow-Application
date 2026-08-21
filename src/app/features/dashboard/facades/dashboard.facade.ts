import { Injectable, Optional } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { initialDashboardState } from '../data/dashboard.data';
import { DashboardState } from '../models/dashboard.models';
import * as DashboardActions from '../store/dashboard.actions';
import * as DashboardSelectors from '../store/dashboard.selectors';

@Injectable({
  providedIn: 'root',
})
export class DashboardFacade {
  constructor(@Optional() private store: Store<DashboardState> | null) {}

  private select<T>(selector: (state: any) => T, fallback: T): Observable<T> {
    return this.store ? this.store.select(selector) : of(fallback);
  }

  get summaryCards$() {
    return this.select(DashboardSelectors.selectSummaryCards, initialDashboardState.summaryCards);
  }
  get upcomingBills$() {
    return this.select(DashboardSelectors.selectUpcomingBills, initialDashboardState.upcomingBills);
  }
  get recentTransactions$() {
    return this.select(
      DashboardSelectors.selectRecentTransactions,
      initialDashboardState.recentTransactions,
    );
  }
  get recentIncome$() {
    return this.select(DashboardSelectors.selectRecentIncome, initialDashboardState.recentIncome);
  }
  get recentExpenses$() {
    return this.select(
      DashboardSelectors.selectRecentExpenses,
      initialDashboardState.recentExpenses,
    );
  }
  get quickActions$() {
    return this.select(DashboardSelectors.selectQuickActions, initialDashboardState.quickActions);
  }
  get cashBalance$() {
    return this.select(DashboardSelectors.selectCashBalance, initialDashboardState.cashBalance);
  }
  get selectedAction$() {
    return this.select(
      DashboardSelectors.selectSelectedAction,
      initialDashboardState.selectedAction,
    );
  }
  get loading$() {
    return this.select(DashboardSelectors.selectDashboardLoading, initialDashboardState.loading);
  }
  get loadError$() {
    return this.select(
      DashboardSelectors.selectDashboardLoadError,
      initialDashboardState.loadError,
    );
  }
  get onboardingSteps$() {
    return this.select(
      DashboardSelectors.selectOnboardingSteps,
      initialDashboardState.onboardingSteps,
    );
  }
  get onboardingActions$() {
    return this.select(
      DashboardSelectors.selectOnboardingActions,
      initialDashboardState.onboardingActions,
    );
  }
  get dashboardState$() {
    return this.select(DashboardSelectors.selectDashboardState, initialDashboardState);
  }
  get isNewUser$() {
    return this.select(DashboardSelectors.selectIsNewUser, initialDashboardState.isNewUser);
  }

  loadDashboard(): void {
    this.store?.dispatch(DashboardActions.loadDashboard());
  }

  failDashboardLoad(error?: string): void {
    this.store?.dispatch(DashboardActions.loadDashboardFailure({ error }));
  }

  selectQuickAction(actionId: string): void {
    this.store?.dispatch(DashboardActions.selectQuickAction({ actionId }));
  }

  viewAll(section: string): void {
    this.store?.dispatch(DashboardActions.viewAllItems({ section }));
  }

  addReminder(): void {
    this.store?.dispatch(DashboardActions.addReminder());
  }

  startOnboarding(actionId: string): void {
    this.store?.dispatch(DashboardActions.selectQuickAction({ actionId }));
  }
}
