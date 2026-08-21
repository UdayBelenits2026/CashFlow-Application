import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { DashboardFacade } from '../../facades/dashboard.facade';
import { SummaryCardComponent } from '../../widgets/summary-card/summary-card';
import { DashboardList } from '../../widgets/dashboard-list/dashboard-list';
import { CashBalance } from '../../widgets/cash-balance/cash-balance';
import { QuickActions } from '../../widgets/quick-actions/quick-actions';
import { LineChart } from '../../../../shared/charts/line-chart/line-chart';
import { DoughnutChart } from '../../../../shared/charts/doughnut-chart/doughnut-chart';

@Component({
  selector: 'app-dashboard-existing-user',
  standalone: true,
  imports: [
    AsyncPipe,
    SummaryCardComponent,
    DashboardList,
    CashBalance,
    QuickActions,
    LineChart,
    DoughnutChart,
  ],
  templateUrl: './dashboard-existing-user.html',
  styleUrl: './dashboard-existing-user.scss',
})
export class DashboardExistingUser implements OnInit {
  readonly facade = inject(DashboardFacade);
  readonly summaryCards$ = this.facade.summaryCards$;
  readonly upcomingBills$ = this.facade.upcomingBills$;
  readonly recentTransactions$ = this.facade.recentTransactions$;
  readonly recentIncome$ = this.facade.recentIncome$;
  readonly recentExpenses$ = this.facade.recentExpenses$;
  readonly quickActions$ = this.facade.quickActions$;
  readonly cashBalance$ = this.facade.cashBalance$;
  readonly loading$ = this.facade.loading$;
  readonly loadError$ = this.facade.loadError$;
  readonly lineChartLabels = ['May 1', 'May 8', 'May 15', 'May 22', 'May 31'];
  readonly lineChartDatasets = [
    {
      label: 'Income',
      data: [5200, 5800, 5600, 6200, 6780],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, .1)',
      pointBackgroundColor: '#22c55e',
      fill: true,
    },
    {
      label: 'Expenses',
      data: [2800, 2400, 2900, 2500, 2650],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, .1)',
      pointBackgroundColor: '#ef4444',
      fill: true,
    },
    {
      label: 'Net Cash Flow',
      data: [2400, 3400, 2700, 3700, 4130],
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, .1)',
      pointBackgroundColor: '#2563eb',
      fill: true,
    },
  ];
  readonly doughnutLabels = [
    'Housing',
    'Food & Dining',
    'Transportation',
    'Utilities',
    'Entertainment',
    'Others',
  ];
  readonly doughnutDatasets = [
    {
      data: [795, 530, 398, 265, 212, 185],
      backgroundColor: ['#2563eb', '#22c55e', '#f97316', '#7c3aed', '#ef4444', '#94a3b8'],
      borderWidth: 0,
      hoverOffset: 4,
    },
  ];

  ngOnInit(): void {
    this.facade.loadDashboard();
  }

  retryLoad(): void {
    this.facade.loadDashboard();
  }
}
