import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChartConfiguration } from 'chart.js';
import { IncomeFacade } from '../../facades/income.facade';
import { IncomeSourceReportItem, IncomeOverviewData } from '../../models/income-summary.model';
import { DoughnutChart } from '../../../../shared/charts/doughnut-chart/doughnut-chart';
import { downloadCsv } from '../../../../shared/utility/csv.util';

@Component({
  selector: 'app-income-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DoughnutChart],
  templateUrl: './income-reports.component.html',
  styleUrl: './income-reports.component.scss'
})
export class IncomeReportsComponent implements OnInit {
  private readonly incomeFacade: IncomeFacade = inject(IncomeFacade);

  readonly overview$: Observable<IncomeOverviewData | null> = this.incomeFacade.overview$;
  readonly sourceBreakdown$: Observable<IncomeSourceReportItem[]> = this.incomeFacade.sourceBreakdown$;
  readonly isLoading$: Observable<boolean> = this.incomeFacade.isLoading$;

  readonly sourceLabels$: Observable<string[]> = this.sourceBreakdown$.pipe(
    map((items) => items.map((i) => i.sourceName))
  );

  readonly sourceDatasets$: Observable<ChartConfiguration<'doughnut'>['data']['datasets']> = this.sourceBreakdown$.pipe(
    map((items) => [
      {
        data: items.map((i) => i.amount),
        backgroundColor: items.map((i) => i.color || '#10B981'),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ])
  );

  readonly totalIncome$: Observable<number> = this.overview$.pipe(
    map((ov) => ov?.totalIncome ?? 0)
  );

  selectedPeriod: string = 'THIS_MONTH';

  ngOnInit(): void {
    this.incomeFacade.loadDashboard();
  }

  getTaxableRatio(ov: IncomeOverviewData | null): number {
    if (!ov || !ov.totalIncome || ov.totalIncome === 0) return 0;
    return Math.round((ov.taxableIncome / ov.totalIncome) * 100);
  }

  onExportReport(items: IncomeSourceReportItem[]): void {
    const headers = ['Source Name', 'Source Category', 'Transaction Count', 'Total Amount (INR)', 'Percentage (%)'];
    const rows = items.map((i) => [
      `"${i.sourceName}"`,
      `"${i.sourceType}"`,
      i.transactionCount || 0,
      i.amount,
      i.percentage
    ]);
    downloadCsv(headers, rows, `income-by-source-report-${this.selectedPeriod}.csv`);
  }
}
