import { Injectable, Signal, inject, signal, DestroyRef } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { DashboardApiService } from '../services/dashboard-api.service';
import { initialDashboardState } from '../data/dashboard.data';
import {
  AccountLinkPayload,
  DashboardFilterState,
  DashboardItem,
  DashboardState,
  ProfileSetupForm,
} from '../models/dashboard.models';
import * as DashboardActions from '../store/dashboard.actions';
import * as DashboardSelectors from '../store/dashboard.selectors';
import { DashboardWidgetConfig } from '../utility/dashboard-widget-config';

@Injectable({
  providedIn: 'root',
})
export class DashboardFacade {
  private readonly store = inject<Store<DashboardState>>(Store, { optional: true });
  private readonly apiService = inject(DashboardApiService);
  private readonly destroyRef = inject(DestroyRef);
  // Helper to create signals from store selectors with fallback values
  private select<T>(selector: (state: DashboardState) => T, fallback: T): Signal<T> {
    if (this.store) {
      return toSignal(this.store.select(selector), { initialValue: fallback });
    }
    return signal(fallback);
  }
  // Reactive selectors for dashboard state slices
  readonly summaryCards = this.select(
    DashboardSelectors.selectSummaryCards,
    initialDashboardState.summaryCards,
  );
  readonly upcomingBills = this.select(
    DashboardSelectors.selectUpcomingBills,
    initialDashboardState.upcomingBills,
  );
  readonly recentTransactions = this.select(
    DashboardSelectors.selectRecentTransactions,
    initialDashboardState.recentTransactions,
  );
  readonly recentIncome = this.select(
    DashboardSelectors.selectRecentIncome,
    initialDashboardState.recentIncome,
  );
  readonly recentExpenses = this.select(
    DashboardSelectors.selectRecentExpenses,
    initialDashboardState.recentExpenses,
  );
  readonly widgetConfig = this.select(
    DashboardSelectors.selectDashboardWidgetConfig,
    initialDashboardState.widgetConfig,
  );
  readonly quickActions = this.select(
    DashboardSelectors.selectQuickActions,
    initialDashboardState.quickActions,
  );
  readonly cashBalance = this.select(
    DashboardSelectors.selectCashBalance,
    initialDashboardState.cashBalance,
  );
  readonly budgetCategories = this.select(
    DashboardSelectors.selectBudgetCategories,
    initialDashboardState.budgetCategories,
  );
  readonly savingsGoal = this.select(
    DashboardSelectors.selectSavingsGoal,
    initialDashboardState.savingsGoal,
  );
  readonly incomeSources = this.select(
    DashboardSelectors.selectIncomeSources,
    initialDashboardState.incomeSources,
  );
  readonly netWorth = this.select(
    DashboardSelectors.selectNetWorth,
    initialDashboardState.netWorth,
  );
  readonly cashFlowTrendChart = this.select(
    DashboardSelectors.selectCashFlowTrendChart,
    initialDashboardState.cashFlowTrendChart,
  );
  readonly spendingByCategoryChart = this.select(
    DashboardSelectors.selectSpendingByCategoryChart,
    initialDashboardState.spendingByCategoryChart,
  );
  readonly selectedAction = this.select(
    DashboardSelectors.selectSelectedAction,
    initialDashboardState.selectedAction,
  );
  readonly loading = this.select(
    DashboardSelectors.selectDashboardLoading,
    initialDashboardState.loading,
  );
  readonly loadError = this.select(
    DashboardSelectors.selectDashboardLoadError,
    initialDashboardState.loadError,
  );
  readonly onboardingSteps = this.select(
    DashboardSelectors.selectOnboardingSteps,
    initialDashboardState.onboardingSteps,
  );
  readonly onboardingActions = this.select(
    DashboardSelectors.selectOnboardingActions,
    initialDashboardState.onboardingActions,
  );
  readonly dashboardState = this.select(
    DashboardSelectors.selectDashboardState,
    initialDashboardState,
  );
  readonly isNewUser = this.select(
    DashboardSelectors.selectIsNewUser,
    initialDashboardState.isNewUser,
  );
  readonly activeFilters = this.select(
    DashboardSelectors.selectActiveFilters,
    initialDashboardState.activeFilters,
  );
  // Dispatches action to load full dashboard data with optional filters
  loadDashboard(filters?: Partial<DashboardFilterState>): void {
    this.store?.dispatch(DashboardActions.loadDashboard({ filters }));
  }
  // Dispatches action to set/apply dashboard filter parameters
  applyFilters(filters: Partial<DashboardFilterState>): void {
    this.store?.dispatch(DashboardActions.setDashboardFilters({ filters }));
  }
  // Helper method to update dashboard date range filter from top navigation bar
  updateDateRange(fromDate: string, toDate: string): void {
    this.store?.dispatch(
      DashboardActions.setDashboardFilters({
        filters: { fromDate, toDate, dateRange: 'custom' },
      }),
    );
  }
  // Dispatches action for failed dashboard data load
  failDashboardLoad(error?: string): void {
    this.store?.dispatch(DashboardActions.loadDashboardFailure({ error }));
  }
  // Dispatches action when user selects a quick action
  selectQuickAction(actionId: string): void {
    this.store?.dispatch(DashboardActions.selectQuickAction({ actionId }));
  }
  // Dispatches action to view all items for a section
  viewAll(section: string): void {
    this.store?.dispatch(DashboardActions.viewAllItems({ section }));
  }
  // Dispatches action to add reminder
  addReminder(): void {
    this.store?.dispatch(DashboardActions.addReminder());
  }
  // Creates and dispatches action to add a new upcoming bill
  addUpcomingBill(bill: { title: string; amount: number; dueDate: string; icon?: string }): void {
    const item: DashboardItem = {
      id: Date.now().toString(),
      title: bill.title,
      date: bill.dueDate,
      amount: bill.amount,
      icon: bill.icon || 'fa-receipt',
      type: 'bill',
    };
    this.store?.dispatch(DashboardActions.addUpcomingBill({ item }));
  }
  // Dispatches action to update an existing upcoming bill
  updateUpcomingBill(item: DashboardItem): void {
    this.store?.dispatch(DashboardActions.updateUpcomingBill({ item }));
  }
  // Dispatches action to delete an upcoming bill by ID
  deleteUpcomingBill(id: number | string): void {
    this.store?.dispatch(DashboardActions.deleteUpcomingBill({ id }));
  }
  // Dispatches action to save updated widget configuration
  saveWidgetConfig(widgetConfig: DashboardWidgetConfig[]): void {
    this.store?.dispatch(DashboardActions.saveDashboardWidgetConfig({ widgetConfig }));
  }
  // Dispatches action to start onboarding step
  startOnboarding(actionId: string): void {
    this.store?.dispatch(DashboardActions.selectQuickAction({ actionId }));
  }
  // Connects account using API service and updates onboarding state
  connectAccount(payload: AccountLinkPayload): void {
    this.apiService
      .connectAccount(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.startOnboarding('connect-account'),
        error: () => this.startOnboarding('connect-account'),
      });
  }
  // Saves user profile using API service and updates onboarding state
  saveProfile(payload: ProfileSetupForm): void {
    this.apiService
      .saveProfile(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.startOnboarding('complete-profile'),
        error: () => this.startOnboarding('complete-profile'),
      });
  }
}
