import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DashboardFacade } from '../../facades/dashboard.facade';
import { BudgetOverview } from '../../widgets/budget-overview/budget-overview';
import { CashBalance } from '../../widgets/cash-balance/cash-balance';
import { DashboardList } from '../../widgets/dashboard-list/dashboard-list';
import { IncomeBySource } from '../../widgets/income-by-source/income-by-source';
import { NetWorth } from '../../widgets/net-worth/net-worth';
import { QuickActions } from '../../widgets/quick-actions/quick-actions';
import { SavingsGoal } from '../../widgets/savings-goal/savings-goal';
import { SummaryCardComponent } from '../../widgets/summary-card/summary-card';
import { LineChart } from '../../../../shared/charts/line-chart/line-chart';
import { DoughnutChart } from '../../../../shared/charts/doughnut-chart/doughnut-chart';
import { ErrorBannerComponent } from '../../../../shared/ui/error-banner/error-banner';
import { DashboardWidgetConfig, sortWidgetConfig } from '../../utility/dashboard-widget-config';

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
  ],
  templateUrl: './dashboard-existing-user.html',
  styleUrl: './dashboard-existing-user.scss',
})
export class DashboardExistingUser implements OnInit {
  readonly facade = inject(DashboardFacade);

  readonly summaryCards = this.facade.summaryCards;
  readonly quickActions = this.facade.quickActions;
  readonly cashBalance = this.facade.cashBalance;
  readonly upcomingBills = this.facade.upcomingBills;
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
  readonly selectedWidgets = computed(() =>
    sortWidgetConfig(this.facade.widgetConfig()).filter(
      (widget: DashboardWidgetConfig) => widget.selected,
    ),
  );

  ngOnInit(): void {
    this.facade.loadDashboard();
  }

  retryLoad(): void {
    this.bannerDismissed.set(false);
    this.facade.loadDashboard();
  }

  dismissBanner(): void {
    this.bannerDismissed.set(true);
  }

  isChartWidget(widgetId: string): boolean {
    return widgetId === 'cashFlowTrend' || widgetId === 'spendingByCategory';
  }
}
