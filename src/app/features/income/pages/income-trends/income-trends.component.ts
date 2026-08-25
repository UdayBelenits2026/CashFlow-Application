import { ChangeDetectionStrategy, Component, OnInit, inject, computed, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ChartConfiguration } from 'chart.js';
import { IncomeFacade } from '../../facades/income.facade';
import { IncomeTrendPoint } from '../../models/income-summary.model';
import { CHART_COLORS } from '../../utility/income.constants';
import { LineChart } from '../../../../shared/charts/line-chart/line-chart';

@Component({
  selector: 'app-income-trends',
  standalone: true,
  imports: [CommonModule, DecimalPipe, LineChart],
  templateUrl: './income-trends.component.html',
  styleUrl: './income-trends.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IncomeTrendsComponent implements OnInit {
  private readonly incomeFacade: IncomeFacade = inject(IncomeFacade);

  readonly trendPoints: Signal<IncomeTrendPoint[]> = toSignal(this.incomeFacade.trendPoints$, {
    initialValue: [] as IncomeTrendPoint[]
  });
  readonly isLoading: Signal<boolean> = toSignal(this.incomeFacade.isLoading$, { initialValue: false });

  readonly trendLabels: Signal<string[]> = computed(() => this.trendPoints().map((p) => p.xLabel));

  readonly trendDatasets: Signal<ChartConfiguration<'line'>['data']['datasets']> = computed(() => {
    const points = this.trendPoints();
    return [
      {
        data: points.map((p) => p.thisPeriod),
        label: 'Actual Inflow',
        borderColor: CHART_COLORS.primary,
        backgroundColor: 'rgba(37, 99, 235, 0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: CHART_COLORS.primary,
        pointBorderColor: CHART_COLORS.white,
        pointBorderWidth: 2,
        pointRadius: 5
      },
      {
        data: points.map((p) => p.lastPeriod),
        label: 'Previous Period',
        borderColor: CHART_COLORS.muted,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointBackgroundColor: CHART_COLORS.muted,
        pointRadius: 3
      },
      {
        data: points.map((p) => p.projected || p.thisPeriod),
        label: 'Projected Target',
        borderColor: CHART_COLORS.accent,
        borderDash: [2, 2],
        fill: false,
        tension: 0.4,
        pointBackgroundColor: CHART_COLORS.accent,
        pointRadius: 3
      }
    ];
  });

  readonly totalInflow: Signal<number> = computed(() =>
    this.trendPoints().reduce((sum, p) => sum + (p.thisPeriod || 0), 0)
  );
  readonly totalPrevious: Signal<number> = computed(() =>
    this.trendPoints().reduce((sum, p) => sum + (p.lastPeriod || 0), 0)
  );
  readonly totalProjected: Signal<number> = computed(() =>
    this.trendPoints().reduce((sum, p) => sum + (p.projected || p.thisPeriod || 0), 0)
  );
  readonly monthsTracked: Signal<number> = computed(() => this.trendPoints().length);
  readonly averageMonthly: Signal<number> = computed(() => {
    const n = this.monthsTracked();
    return n > 0 ? this.totalInflow() / n : 0;
  });
  readonly overallGrowthPct: Signal<number> = computed(() => {
    const prev = this.totalPrevious();
    return prev > 0 ? Math.round(((this.totalInflow() - prev) / prev) * 100) : 0;
  });
  readonly peakPoint: Signal<IncomeTrendPoint | null> = computed(() => {
    const pts = this.trendPoints();
    if (pts.length === 0) return null;
    return pts.reduce((mx, p) => (p.thisPeriod > mx.thisPeriod ? p : mx), pts[0]);
  });

  ngOnInit(): void {
    this.incomeFacade.loadDashboard();
  }

  variance(p: IncomeTrendPoint): number {
    return (p.thisPeriod || 0) - (p.lastPeriod || 0);
  }

  variancePct(p: IncomeTrendPoint): number {
    return p.lastPeriod > 0 ? Math.round(((p.thisPeriod - p.lastPeriod) / p.lastPeriod) * 100) : 0;
  }
}
