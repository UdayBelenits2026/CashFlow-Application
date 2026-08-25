import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed, Signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { IncomeFacade } from '../../facades/income.facade';
import { Income } from '../../models/income.model';
import { IncomeSource } from '../../models/income-source.model';
import { AccountRef } from '../../models/account-ref.model';
import {
  IncomeOverviewData,
  UpcomingIncomeItem,
  IncomeSourceReportItem,
  IncomeTrendPoint
} from '../../models/income-summary.model';
import { CHART_COLORS } from '../../utility/income.constants';

import { LineChart } from '../../../../shared/charts/line-chart/line-chart';
import { DoughnutChart } from '../../../../shared/charts/doughnut-chart/doughnut-chart';
import { IncomeKpiCardsComponent } from '../../components/income-kpi-cards/income-kpi-cards.component';
import { RecentIncomeComponent } from '../../components/recent-income/recent-income.component';
import { UpcomingIncomeComponent } from '../../components/upcoming-income/upcoming-income.component';
import { IncomeDetailsDrawerComponent } from '../../components/income-details-drawer/income-details-drawer.component';
import { AddIncomeModalComponent } from '../../components/add-income-modal/add-income-modal.component';
import { DeleteConfirmDialogComponent } from '../../components/delete-confirm-dialog/delete-confirm-dialog.component';
import { IncomeErrorStateComponent } from '../../components/income-error-state/income-error-state.component';

@Component({
  selector: 'app-full-income-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DecimalPipe,
    LineChart,
    DoughnutChart,
    IncomeKpiCardsComponent,
    RecentIncomeComponent,
    UpcomingIncomeComponent,
    IncomeDetailsDrawerComponent,
    IncomeErrorStateComponent,
    AddIncomeModalComponent,
    DeleteConfirmDialogComponent
  ],
  templateUrl: './full-income-dashboard.component.html',
  styleUrl: './full-income-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FullIncomeDashboardComponent implements OnInit {
  private readonly incomeFacade: IncomeFacade = inject(IncomeFacade);

  readonly isLoading: Signal<boolean> = toSignal(this.incomeFacade.isLoading$, { initialValue: false });
  readonly overview: Signal<IncomeOverviewData | null> = toSignal(this.incomeFacade.overview$, { initialValue: null });
  readonly recentIncomes: Signal<Income[]> = toSignal(this.incomeFacade.recentIncomes$, { initialValue: [] as Income[] });
  readonly upcomingIncomes: Signal<UpcomingIncomeItem[]> = toSignal(this.incomeFacade.upcomingIncomes$, { initialValue: [] as UpcomingIncomeItem[] });
  readonly sources: Signal<IncomeSource[]> = toSignal(this.incomeFacade.sources$, { initialValue: [] as IncomeSource[] });
  readonly accounts: Signal<AccountRef[]> = toSignal(this.incomeFacade.accounts$, { initialValue: [] as AccountRef[] });
  readonly trendPoints: Signal<IncomeTrendPoint[]> = toSignal(this.incomeFacade.trendPoints$, { initialValue: [] as IncomeTrendPoint[] });
  readonly sourceBreakdown: Signal<IncomeSourceReportItem[]> = toSignal(this.incomeFacade.sourceBreakdown$, { initialValue: [] as IncomeSourceReportItem[] });
  readonly error: Signal<string | null> = toSignal(this.incomeFacade.error$, { initialValue: null });
  readonly hasData: Signal<boolean> = toSignal(this.incomeFacade.hasData$, { initialValue: false });

  readonly trendLabels: Signal<string[]> = computed(() => this.trendPoints().map((p) => p.xLabel));

  readonly trendDatasets: Signal<ChartConfiguration<'line'>['data']['datasets']> = computed(() => {
    const points = this.trendPoints();
    return [
      {
        data: points.map((p) => p.thisPeriod),
        label: 'This Period',
        borderColor: CHART_COLORS.primary,
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: CHART_COLORS.primary,
        pointBorderColor: CHART_COLORS.white,
        pointBorderWidth: 2,
        pointRadius: 4
      },
      {
        data: points.map((p) => p.lastPeriod),
        label: 'Last Period',
        borderColor: CHART_COLORS.muted,
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointBackgroundColor: CHART_COLORS.muted,
        pointRadius: 3
      }
    ];
  });

  readonly sourceLabels: Signal<string[]> = computed(() => this.sourceBreakdown().map((i) => i.sourceName));

  readonly sourceDatasets: Signal<ChartConfiguration<'doughnut'>['data']['datasets']> = computed(() => [
    {
      data: this.sourceBreakdown().map((i) => i.amount),
      backgroundColor: this.sourceBreakdown().map((i) => i.color || CHART_COLORS.primary),
      borderWidth: 2,
      borderColor: CHART_COLORS.white
    }
  ]);

  readonly totalReceived: Signal<number> = computed(() => this.overview()?.totalIncome ?? 0);

  readonly showDetailsDrawer: WritableSignal<boolean> = signal(false);
  readonly showAddModal: WritableSignal<boolean> = signal(false);
  readonly showDeleteDialog: WritableSignal<boolean> = signal(false);
  readonly activeIncome: WritableSignal<Income | null> = signal<Income | null>(null);

  ngOnInit(): void {
    this.incomeFacade.loadDashboard();
  }

  onIncomeSelected(inc: Income): void {
    this.activeIncome.set(inc);
    this.showDetailsDrawer.set(true);
  }

  openEditModal(inc: Income): void {
    this.activeIncome.set(inc);
    this.showDetailsDrawer.set(false);
    this.showAddModal.set(true);
  }

  onUpdateIncome(event: { id: string; income: Partial<Income> } | Partial<Income>): void {
    if ('income' in event && event.id) {
      this.incomeFacade.updateIncome(event.id, event.income);
    } else {
      const inc = this.activeIncome();
      if (inc) this.incomeFacade.updateIncome(inc.id, event as Partial<Income>);
    }
    this.showAddModal.set(false);
  }

  onSaveIncome(income: Partial<Income>): void {
    this.incomeFacade.addIncome(income);
    this.showAddModal.set(false);
  }

  openDeleteDialog(inc: Income): void {
    this.activeIncome.set(inc);
    this.showDetailsDrawer.set(false);
    this.showDeleteDialog.set(true);
  }

  onConfirmDelete(): void {
    const inc = this.activeIncome();
    if (inc) {
      this.incomeFacade.deleteIncome(inc.id);
      this.showDeleteDialog.set(false);
      this.activeIncome.set(null);
    }
  }

  onRecordRecurring(recurringId: string): void {
    this.incomeFacade.recordRecurringIncome(recurringId);
  }

  reload(): void {
    this.incomeFacade.loadDashboard();
  }
}
