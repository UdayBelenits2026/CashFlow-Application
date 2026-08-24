import { Component, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowRight,
  faBuildingColumns,
  faChartPie,
  faCheck,
  faFileLines,
  faReceipt,
  faWallet,
} from '@fortawesome/free-solid-svg-icons';
import { DashboardFacade } from '../../facades/dashboard.facade';
import { SummaryCardComponent } from '../../widgets/summary-card/summary-card';
import { LineChart } from '../../../../shared/charts/line-chart/line-chart';
import { SummaryCard } from '../../models/dashboard.models';

@Component({
  selector: 'app-dashboard-new-user',
  standalone: true,
  imports: [FontAwesomeModule, SummaryCardComponent, LineChart],
  templateUrl: './dashboard-new-user.html',
  styleUrl: './dashboard-new-user.scss',
})
export class DashboardNewUser {
  readonly facade = inject(DashboardFacade);
  readonly onboardingSteps = this.facade.onboardingSteps;
  readonly onboardingActions = this.facade.onboardingActions;

  readonly summaryCards: SummaryCard[] = [
    {
      id: 'income',
      title: 'Total Income',
      amount: 0,
      percentage: 0,
      trend: 'up',
      comparison: 'vs Apr 2026',
      icon: 'fa-wallet',
    },
    {
      id: 'expenses',
      title: 'Total Expense',
      amount: 0,
      percentage: 0,
      trend: 'down',
      comparison: 'vs Apr 2026',
      icon: 'fa-money-bill-transfer',
    },
    {
      id: 'cashFlow',
      title: 'Net Cash Flow',
      amount: 0,
      percentage: 0,
      trend: 'up',
      comparison: 'vs Apr 2026',
      icon: 'fa-chart-line',
    },
    {
      id: 'savings',
      title: 'Total Savings',
      amount: 0,
      percentage: 0,
      trend: 'up',
      comparison: 'vs Apr 2026',
      icon: 'fa-piggy-bank',
    },
  ];

  readonly icons: Record<string, any> = {
    bank: faBuildingColumns,
    wallet: faWallet,
    receipt: faReceipt,
    chart: faChartPie,
  };
  readonly checkIcon = faCheck;
  readonly arrowIcon = faArrowRight;
  readonly docIcon = faFileLines;
  readonly lineChartLabels = ['May 1', 'May 8', 'May 15', 'May 22', 'May 31'];

  start(actionId: string): void {
    this.facade.startOnboarding(actionId);
  }
}
