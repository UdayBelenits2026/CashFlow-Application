import { Component, OnInit, inject, DestroyRef, signal, computed, WritableSignal, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { Observable } from 'rxjs';
import { SpendingFacade } from '../../facades/spending.facade';
import { Expense } from '../../models/expense.model';
import { SpendingCategoryItem } from '../../models/spending-summary.model';
import { TrendTab, TrendBucket, DayStat } from '../../models/spending-trends.model';
import { downloadCsv } from '../../utility/spending.helpers';
import { LineChart } from '../../../../shared/charts/line-chart/line-chart';
import { DoughnutChart } from '../../../../shared/charts/doughnut-chart/doughnut-chart';

@Component({
  selector: 'app-spending-trends',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe, LineChart, DoughnutChart],
  templateUrl: './spending-trends.component.html',
  styleUrl: './spending-trends.component.scss'
})
export class SpendingTrendsComponent implements OnInit {
  private readonly spendingFacade: SpendingFacade = inject(SpendingFacade);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  readonly isLoading$: Observable<boolean> = this.spendingFacade.isLoading$;
  readonly categories$: Observable<SpendingCategoryItem[]> = this.spendingFacade.categories$;

  readonly tabs: { key: TrendTab; label: string }[] = [
    { key: 'DAILY', label: 'Daily' },
    { key: 'WEEKLY', label: 'Weekly' },
    { key: 'MONTHLY', label: 'Monthly' },
    { key: 'QUARTERLY', label: 'Quarterly' },
    { key: 'YEARLY', label: 'Yearly' }
  ];

  activeTab: WritableSignal<TrendTab> = signal<TrendTab>('DAILY');

  private expenses: Expense[] = [];
  private categories: SpendingCategoryItem[] = [];

  buckets: TrendBucket[] = [];
  chartLabels: string[] = [];
  chartDatasets: ChartConfiguration<'line'>['data']['datasets'] = [];

  totalSpending: number = 0;
  averageDaily: number = 0;
  highestDay: DayStat = { label: '—', amount: 0 };
  lowestDay: DayStat = { label: '—', amount: 0 };

  categoryLabels: string[] = [];
  categoryDatasets: ChartConfiguration<'doughnut'>['data']['datasets'] = [];
  categoryTotal: number = 0;

  ngOnInit(): void {
    this.spendingFacade.loadDashboard();
    this.spendingFacade.allExpenses$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((expenses) => {
      this.expenses = expenses || [];
      this.recompute();
    });
    this.categories$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((cats) => {
      this.categories = cats || [];
      this.buildCategoryChart();
    });
  }

  setTab(tab: TrendTab): void {
    this.activeTab.set(tab);
    this.recompute();
  }

  private recompute(): void {
    this.buckets = this.buildBuckets(this.activeTab());
    this.chartLabels = this.buckets.map((b) => b.label);
    this.chartDatasets = [
      {
        data: this.buckets.map((b) => b.amount),
        label: 'Spending',
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2563EB',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 3
      }
    ];
    this.computeStats();
  }

  private computeStats(): void {
    this.totalSpending = this.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const dailyMap = new Map<string, number>();
    for (const e of this.expenses) {
      dailyMap.set(e.date, (dailyMap.get(e.date) || 0) + (Number(e.amount) || 0));
    }

    const distinctDays = dailyMap.size || 1;
    this.averageDaily = Number((this.totalSpending / distinctDays).toFixed(2));

    let hi: DayStat = { label: '—', amount: -Infinity };
    let lo: DayStat = { label: '—', amount: Infinity };
    for (const [date, amt] of dailyMap.entries()) {
      const label = this.formatDayLabel(date);
      if (amt > hi.amount) hi = { label, amount: amt };
      if (amt < lo.amount) lo = { label, amount: amt };
    }
    this.highestDay = hi.amount === -Infinity ? { label: '—', amount: 0 } : hi;
    this.lowestDay = lo.amount === Infinity ? { label: '—', amount: 0 } : lo;
  }

  private buildCategoryChart(): void {
    this.categoryLabels = this.categories.map((c) => c.name);
    this.categoryDatasets = [
      {
        data: this.categories.map((c) => c.amount),
        backgroundColor: this.categories.map((c) => c.color || '#3B82F6'),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ];
    this.categoryTotal = this.categories.reduce((sum, c) => sum + (c.amount || 0), 0);
  }

  private buildBuckets(tab: TrendTab): TrendBucket[] {
    const map = new Map<string, { amount: number; sort: number }>();

    for (const e of this.expenses) {
      const d = new Date(e.date);
      if (isNaN(d.getTime())) continue;
      const { key, sort } = this.bucketKey(tab, d);
      const entry = map.get(key) || { amount: 0, sort };
      entry.amount += Number(e.amount) || 0;
      map.set(key, entry);
    }

    return Array.from(map.entries())
      .map(([label, data]) => ({ label, amount: Number(data.amount.toFixed(2)), sort: data.sort }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ label, amount }) => ({ label, amount }));
  }

  private bucketKey(tab: TrendTab, d: Date): { key: string; sort: number } {
    const year = d.getFullYear();
    const month = d.getMonth();
    switch (tab) {
      case 'DAILY': {
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return { key, sort: d.getTime() };
      }
      case 'WEEKLY': {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const key = `Wk ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        return { key, sort: weekStart.getTime() };
      }
      case 'MONTHLY': {
        const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        return { key, sort: year * 12 + month };
      }
      case 'QUARTERLY': {
        const q = Math.floor(month / 3) + 1;
        const key = `Q${q} ${year}`;
        return { key, sort: year * 4 + q };
      }
      case 'YEARLY': {
        return { key: String(year), sort: year };
      }
    }
  }

  private formatDayLabel(date: string): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  readonly chartTitle: Signal<string> = computed(() => {
    const found = this.tabs.find((t) => t.key === this.activeTab());
    return `${found?.label || 'Daily'} Spending`;
  });

  exportReport(): void {
    if (this.buckets.length === 0) return;
    const headers = ['Period', 'Amount (INR)'];
    const rows = this.buckets.map((b) => [`"${b.label}"`, b.amount]);
    downloadCsv(headers, rows, `spending_${this.activeTab().toLowerCase()}_report_${new Date().toISOString().split('T')[0]}.csv`);
  }
}
