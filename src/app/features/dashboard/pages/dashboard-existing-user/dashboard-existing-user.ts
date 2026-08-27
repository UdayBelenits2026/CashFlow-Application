import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { DashboardFacade } from '../../facades/dashboard.facade';
import { BudgetOverview } from '../../components/budget-overview/budget-overview';
import { CashBalance } from '../../components/cash-balance/cash-balance';
import { DashboardList } from '../../components/dashboard-list/dashboard-list';
import { IncomeBySource } from '../../components/income-by-source/income-by-source';
import { NetWorth } from '../../components/net-worth/net-worth';
import { QuickActions } from '../../components/quick-actions/quick-actions';
import { SavingsGoal } from '../../components/savings-goal/savings-goal';
import { SummaryCardComponent } from '../../components/summary-card/summary-card';
import { LineChart } from '../../../../shared/charts/line-chart/line-chart';
import { DoughnutChart } from '../../../../shared/charts/doughnut-chart/doughnut-chart';
import { ErrorBannerComponent } from '../../../../shared/ui/error-banner/error-banner';
import { DashboardWidgetConfig, sortWidgetConfig } from '../../utility/dashboard-widget-config';
import { CHART_WIDGET_IDS, DashboardWidgetId } from '../../models/dashboard.models';
import { AddReminderModalComponent } from '../../components/add-reminder-modal/add-reminder-modal';

@Component({
  selector: 'app-dashboard-existing-user',
  standalone: true,
  imports: [
    SummaryCardComponent,
    QuickActions,
    CashBalance,
    DashboardList,
    BudgetOverview,
    SavingsGoal,
    NetWorth,
    IncomeBySource,
    LineChart,
    DoughnutChart,
    ErrorBannerComponent,
    AddReminderModalComponent,
  ],
  templateUrl: './dashboard-existing-user.html',
  styleUrl: './dashboard-existing-user.scss',
})
export class DashboardExistingUser implements OnInit {
  private readonly router = inject(Router);
  readonly facade = inject(DashboardFacade);
  // Reactive facade signals for dashboard widgets
  readonly summaryCards = this.facade.summaryCards;
  readonly cashBalance = this.facade.cashBalance;
  readonly upcomingBills = this.facade.upcomingBills;
  // Slices top 5 upcoming bills sorted chronologically by due date
  readonly displayUpcomingBills = computed(() => {
    const list = [...this.upcomingBills()];
    list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return list.slice(0, 5);
  });
  readonly recentTransactions = this.facade.recentTransactions;
  readonly recentIncome = this.facade.recentIncome;
  readonly recentExpenses = this.facade.recentExpenses;
  readonly budgetCategories = this.facade.budgetCategories;
  readonly savingsGoal = this.facade.savingsGoal;
  readonly incomeSources = this.facade.incomeSources;
  readonly netWorth = this.facade.netWorth;
  readonly cashFlowTrendChart = this.facade.cashFlowTrendChart;
  readonly spendingByCategoryChart = this.facade.spendingByCategoryChart;
  readonly loading = this.facade.loading;
  readonly loadError = this.facade.loadError;
  readonly bannerDismissed = signal(false);
  readonly isAddReminderModalOpen = signal(false);
  // Computes active selected widgets ordered by order index
  readonly selectedWidgets = computed(() =>
    sortWidgetConfig(this.facade.widgetConfig()).filter(
      (widget: DashboardWidgetConfig) => widget.selected,
    ),
  );
  // Triggers loading dashboard data on init
  ngOnInit(): void {
    this.facade.loadDashboard();
  }
  // Opens add bill reminder modal
  openAddReminderModal(): void {
    this.isAddReminderModalOpen.set(true);
  }
  // Closes add bill reminder modal
  closeAddReminderModal(): void {
    this.isAddReminderModalOpen.set(false);
  }
  // Navigates to full upcoming bills page
  navigateToUpcomingBills(): void {
    void this.router.navigate(['/dashboard/upcoming-bills']);
  }
  // Handles saving new reminder item from modal
  onSaveReminder(reminder: { title: string; amount: number; dueDate: string; icon: string }): void {
    this.facade.addUpcomingBill(reminder);
  }
  // Retries dashboard data load
  retryLoad(): void {
    this.bannerDismissed.set(false);
    this.facade.loadDashboard();
  }
  // Dismisses error banner overlay
  dismissBanner(): void {
    this.bannerDismissed.set(true);
  }
  // Checks if widget is a chart component
  isChartWidget(widgetId: string): boolean {
    return CHART_WIDGET_IDS.includes(widgetId as DashboardWidgetId);
  }
}
