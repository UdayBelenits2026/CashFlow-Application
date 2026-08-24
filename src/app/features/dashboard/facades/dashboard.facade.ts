import { Injectable, Signal, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { initialDashboardState } from '../data/dashboard.data';
import { DashboardState } from '../models/dashboard.models';
import * as DashboardActions from '../store/dashboard.actions';
import * as DashboardSelectors from '../store/dashboard.selectors';
import { DashboardWidgetConfig } from '../utility/dashboard-widget-config';

@Injectable({
  providedIn: 'root',
})
export class DashboardFacade {
  private readonly store = inject<Store<DashboardState>>(Store, { optional: true });

  private select<T>(selector: (state: any) => T, fallback: T): Signal<T> {
    if (this.store) {
      return toSignal(this.store.select(selector), { initialValue: fallback });
    }
    return signal(fallback);
  }

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

  saveWidgetConfig(widgetConfig: DashboardWidgetConfig[]): void {
    this.store?.dispatch(DashboardActions.saveDashboardWidgetConfig({ widgetConfig }));
  }

  startOnboarding(actionId: string): void {
    this.store?.dispatch(DashboardActions.selectQuickAction({ actionId }));
  }
}
