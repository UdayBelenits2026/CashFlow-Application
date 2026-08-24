import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChartConfiguration } from 'chart.js';
import { IncomeFacade } from '../../facades/income.facade';
import { IncomeTrendPoint } from '../../models/income-summary.model';
import { LineChart } from '../../../../shared/charts/line-chart/line-chart';

@Component({
  selector: 'app-income-trends',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, LineChart],
  templateUrl: './income-trends.component.html',
  styleUrl: './income-trends.component.scss'
})
export class IncomeTrendsComponent implements OnInit {
  private readonly incomeFacade: IncomeFacade = inject(IncomeFacade);

  readonly trendPoints$: Observable<IncomeTrendPoint[]> = this.incomeFacade.trendPoints$;
  readonly isLoading$: Observable<boolean> = this.incomeFacade.isLoading$;

  readonly trendLabels$: Observable<string[]> = this.trendPoints$.pipe(
    map((points) => points.map((p) => p.xLabel))
  );

  readonly trendDatasets$: Observable<ChartConfiguration<'line'>['data']['datasets']> = this.trendPoints$.pipe(
    map((points) => [
      {
        data: points.map((p) => p.thisPeriod),
        label: 'Actual Inflow',
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5
      },
      {
        data: points.map((p) => p.lastPeriod),
        label: 'Previous Period',
        borderColor: '#94A3B8',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#94A3B8',
        pointRadius: 3
      },
      {
        data: points.map((p) => p.projected || p.thisPeriod),
        label: 'Projected Target',
        borderColor: '#3B82F6',
        borderDash: [2, 2],
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointRadius: 3
      }
    ])
  );

  ngOnInit(): void {
    this.incomeFacade.loadDashboard();
  }
}
