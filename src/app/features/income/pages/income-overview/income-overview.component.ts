import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChartConfiguration } from 'chart.js';
import { IncomeFacade } from '../../facades/income.facade';
import {
  IncomeOverviewData,
  IncomeSourceReportItem,
  IncomeTrendPoint,
  IncomeInsight
} from '../../models/income-summary.model';
import { IncomeSource } from '../../models/income-source.model';
import { Income } from '../../models/income.model';
import { AccountRef } from '../../models/account-ref.model';

import { LineChart } from '../../../../shared/charts/line-chart/line-chart';
import { DoughnutChart } from '../../../../shared/charts/doughnut-chart/doughnut-chart';

import { IncomeKpiCardsComponent } from '../../components/income-kpi-cards/income-kpi-cards.component';
import { AddIncomeModalComponent } from '../../components/add-income-modal/add-income-modal.component';
import { IncomeSourceModalComponent } from '../../components/income-source-modal/income-source-modal.component';

@Component({
  selector: 'app-income-overview',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DecimalPipe,
    LineChart,
    DoughnutChart,
    IncomeKpiCardsComponent,
    AddIncomeModalComponent,
    IncomeSourceModalComponent
  ],
  templateUrl: './income-overview.component.html',
  styleUrl: './income-overview.component.scss'
})
export class IncomeOverviewComponent implements OnInit {
  private readonly incomeFacade: IncomeFacade = inject(IncomeFacade);

  readonly isLoading$: Observable<boolean> = this.incomeFacade.isLoading$;
  readonly overview$: Observable<IncomeOverviewData | null> = this.incomeFacade.overview$;
  readonly sources$: Observable<IncomeSource[]> = this.incomeFacade.sources$;
  readonly trendPoints$: Observable<IncomeTrendPoint[]> = this.incomeFacade.trendPoints$;
  readonly sourceBreakdown$: Observable<IncomeSourceReportItem[]> = this.incomeFacade.sourceBreakdown$;
  readonly insights$: Observable<IncomeInsight[]> = this.incomeFacade.insights$;
  readonly accounts$: Observable<AccountRef[]> = this.incomeFacade.accounts$;

  readonly trendLabels$: Observable<string[]> = this.trendPoints$.pipe(
    map((points) => points.map((p) => p.xLabel))
  );

  readonly trendDatasets$: Observable<ChartConfiguration<'line'>['data']['datasets']> = this.trendPoints$.pipe(
    map((points) => {
      const currentData = points.map((p) => p.thisPeriod);
      const previousData = points.map((p) => p.lastPeriod);
      return [
        {
          data: currentData,
          label: 'This Period',
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4
        },
        {
          data: previousData,
          label: 'Last Period',
          borderColor: '#94A3B8',
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#94A3B8',
          pointRadius: 3
        }
      ];
    })
  );

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

  readonly totalReceived$: Observable<number> = this.overview$.pipe(
    map((ov) => ov?.totalIncome ?? 0)
  );

  selectedPeriod: string = 'THIS_MONTH';
  selectedAccount: string = 'ALL';

  showAddModal: boolean = false;
  showSourceModal: boolean = false;

  ngOnInit(): void {
    this.incomeFacade.loadDashboard();
  }

  onSaveIncome(income: Partial<Income>): void {
    this.incomeFacade.addIncome(income);
    this.showAddModal = false;
  }

  onSaveSource(source: Partial<IncomeSource>): void {
    this.incomeFacade.addSource(source);
    this.showSourceModal = false;
  }

  insightAccentClass(type: string): string {
    switch (type) {
      case 'positive': return 'accent-positive';
      case 'negative': return 'accent-negative';
      case 'info': return 'accent-info';
      default: return 'accent-neutral';
    }
  }
}
