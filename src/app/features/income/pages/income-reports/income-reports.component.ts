import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed, WritableSignal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration } from 'chart.js';
import { IncomeFacade } from '../../facades/income.facade';
import { IncomeSourceReportItem, ReportPeriod } from '../../models/income-summary.model';
import { Income } from '../../models/income.model';
import { IncomeSource } from '../../models/income-source.model';
import { computeSourceReportItems, getReportPeriodRange } from '../../utility/income.calculations';
import { CHART_COLORS } from '../../utility/income.constants';
import { DoughnutChart } from '../../../../shared/charts/doughnut-chart/doughnut-chart';
import { downloadCsv } from '../../../../shared/utility/csv.util';

@Component({
  selector: 'app-income-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DoughnutChart],
  templateUrl: './income-reports.component.html',
  styleUrl: './income-reports.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeReportsComponent implements OnInit {
  private readonly incomeFacade: IncomeFacade = inject(IncomeFacade);
  private readonly now: Date = new Date();

  private readonly allIncomes: Signal<Income[]> = toSignal(this.incomeFacade.allIncomes$, {
    initialValue: [] as Income[]
  });
  private readonly sources: Signal<IncomeSource[]> = toSignal(this.incomeFacade.sources$, {
    initialValue: [] as IncomeSource[]
  });
  readonly isLoading: Signal<boolean> = toSignal(this.incomeFacade.isLoading$, { initialValue: false });

  readonly selectedPeriod: WritableSignal<ReportPeriod> = signal<ReportPeriod>('THIS_MONTH');

  readonly periodOptions: Signal<{ value: ReportPeriod; label: string }[]> = computed(() => {
    const y = this.now.getFullYear();
    const monthName = (offset: number): string =>
      new Date(y, this.now.getMonth() + offset, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const quarter = Math.floor(this.now.getMonth() / 3) + 1;
    return [
      { value: 'THIS_MONTH', label: `This Month (${monthName(0)})` },
      { value: 'LAST_MONTH', label: `Last Month (${monthName(-1)})` },
      { value: 'THIS_QUARTER', label: `This Quarter (Q${quarter} ${y})` },
      { value: 'THIS_YEAR', label: `This Year (${y})` }
    ];
  });

  private readonly filteredRecorded: Signal<Income[]> = computed(() => {
    const { start, end } = getReportPeriodRange(this.selectedPeriod(), this.now);
    return this.allIncomes().filter((i) => {
      if (i.status !== 'RECORDED' || !i.date) return false;
      const d = new Date(`${i.date}T00:00:00`);
      return d >= start && d <= end;
    });
  });

  readonly reportItems: Signal<IncomeSourceReportItem[]> = computed(() =>
    computeSourceReportItems(this.filteredRecorded(), this.sources()).slice().sort((a, b) => b.amount - a.amount)
  );

  readonly totalIncome: Signal<number> = computed(() =>
    this.filteredRecorded().reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
  );
  readonly receiptsCount: Signal<number> = computed(() => this.filteredRecorded().length);
  readonly taxableTotal: Signal<number> = computed(() =>
    this.filteredRecorded().filter((i) => i.taxable).reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
  );
  readonly taxableRatio: Signal<number> = computed(() => {
    const total = this.totalIncome();
    return total > 0 ? Math.round((this.taxableTotal() / total) * 100) : 0;
  });
  readonly averageReceipt: Signal<number> = computed(() => {
    const n = this.receiptsCount();
    return n > 0 ? this.totalIncome() / n : 0;
  });
  readonly activeSourcesCount: Signal<number> = computed(() =>
    this.sources().filter((s) => s.status === 'ACTIVE').length
  );
  readonly topSource: Signal<IncomeSourceReportItem | null> = computed(() => this.reportItems()[0] || null);

  readonly chartLabels: Signal<string[]> = computed(() => this.reportItems().map((i) => i.sourceName));
  readonly chartDatasets: Signal<ChartConfiguration<'doughnut'>['data']['datasets']> = computed(() => [
    {
      data: this.reportItems().map((i) => i.amount),
      backgroundColor: this.reportItems().map((i) => i.color || CHART_COLORS.primary),
      borderWidth: 2,
      borderColor: CHART_COLORS.white
    }
  ]);

  ngOnInit(): void {
    this.incomeFacade.loadDashboard();
  }

  onPeriodChange(period: ReportPeriod): void {
    this.selectedPeriod.set(period);
  }

  onExportReport(): void {
    const items = this.reportItems();
    if (items.length === 0) return;
    const headers = ['Source Name', 'Source Category', 'Receipts', 'Total Amount (INR)', 'Portfolio Share (%)'];
    const rows = items.map((i) => [
      `"${i.sourceName}"`,
      `"${i.sourceType}"`,
      i.transactionCount || 0,
      i.amount,
      i.percentage
    ]);
    downloadCsv(headers, rows, `income-by-source-report-${this.selectedPeriod().toLowerCase()}.csv`);
  }
}
