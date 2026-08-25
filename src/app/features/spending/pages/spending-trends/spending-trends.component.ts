import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed, WritableSignal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { Observable } from 'rxjs';
import { SpendingFacade } from '../../facades/spending.facade';
import { Expense } from '../../models/expense.model';
import { SpendingCategoryItem } from '../../models/spending-summary.model';
import { TrendTab, TrendBucket, TrendStats } from '../../models/spending-trends.model';
import { downloadCsv } from '../../utility/spending.helpers';
import { buildTrendBuckets, computeTrendStats } from '../../utility/spending.calculations';
import { buildDoughnutDataset, DoughnutChartVm } from '../../utility/spending.charts';
import { CHART_LINE_COLOR, CHART_LINE_FILL, CHART_BORDER_COLOR } from '../../utility/spending.constants';
import { LineChart } from '../../../../shared/charts/line-chart/line-chart';
import { DoughnutChart } from '../../../../shared/charts/doughnut-chart/doughnut-chart';

@Component({
  selector: 'app-spending-trends',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe, LineChart, DoughnutChart],
  templateUrl: './spending-trends.component.html',
  styleUrl: './spending-trends.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SpendingTrendsComponent implements OnInit {
  private readonly spendingFacade: SpendingFacade = inject(SpendingFacade);

  readonly isLoading$: Observable<boolean> = this.spendingFacade.isLoading$;

  private readonly expenses: Signal<Expense[]> = toSignal(this.spendingFacade.allExpenses$, { initialValue: [] as Expense[] });
  private readonly categories: Signal<SpendingCategoryItem[]> = toSignal(this.spendingFacade.categories$, { initialValue: [] as SpendingCategoryItem[] });

  readonly tabs: { key: TrendTab; label: string }[] = [
    { key: 'DAILY', label: 'Daily' },
    { key: 'WEEKLY', label: 'Weekly' },
    { key: 'MONTHLY', label: 'Monthly' },
    { key: 'QUARTERLY', label: 'Quarterly' },
    { key: 'YEARLY', label: 'Yearly' }
  ];

  readonly activeTab: WritableSignal<TrendTab> = signal<TrendTab>('DAILY');

  readonly buckets: Signal<TrendBucket[]> = computed(() => buildTrendBuckets(this.expenses(), this.activeTab()));

  readonly chartLabels: Signal<string[]> = computed(() => this.buckets().map((b) => b.label));

  readonly chartDatasets: Signal<ChartConfiguration<'line'>['data']['datasets']> = computed(() => [
    {
      data: this.buckets().map((b) => b.amount),
      label: 'Spending',
      borderColor: CHART_LINE_COLOR,
      backgroundColor: CHART_LINE_FILL,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: CHART_LINE_COLOR,
      pointBorderColor: CHART_BORDER_COLOR,
      pointBorderWidth: 2,
      pointRadius: 3
    }
  ]);

  readonly stats: Signal<TrendStats> = computed(() => computeTrendStats(this.expenses()));

  readonly categoryChart: Signal<DoughnutChartVm> = computed(() => {
    const cats: SpendingCategoryItem[] = this.categories();
    return {
      labels: cats.map((c) => c.name),
      datasets: buildDoughnutDataset(cats.map((c) => c.amount), cats.map((c) => c.color || '')),
      total: cats.reduce((sum, c) => sum + (c.amount || 0), 0)
    };
  });

  readonly chartTitle: Signal<string> = computed(() => {
    const found = this.tabs.find((t) => t.key === this.activeTab());
    return `${found?.label || 'Daily'} Spending`;
  });

  ngOnInit(): void {
    this.spendingFacade.loadDashboard();
  }

  setTab(tab: TrendTab): void {
    this.activeTab.set(tab);
  }

  exportReport(): void {
    const buckets: TrendBucket[] = this.buckets();
    if (buckets.length === 0) return;
    const headers: string[] = ['Period', 'Amount (INR)'];
    const rows: (string | number)[][] = buckets.map((b) => [`"${b.label}"`, b.amount]);
    downloadCsv(headers, rows, `spending_${this.activeTab().toLowerCase()}_report_${new Date().toISOString().split('T')[0]}.csv`);
  }
}
