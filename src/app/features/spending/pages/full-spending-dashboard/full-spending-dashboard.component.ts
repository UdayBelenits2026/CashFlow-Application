import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChartConfiguration } from 'chart.js';
import { SpendingFacade } from '../../facades/spending.facade';
import { Expense } from '../../models/expense.model';
import { SpendingOverviewData, SpendingCategoryItem, SpendingTrendPoint, SpendingMerchant, BudgetVsActualItem, SpendingInsight } from '../../models/spending-summary.model';

import { LineChart } from '../../../../shared/charts/line-chart/line-chart';
import { DoughnutChart } from '../../../../shared/charts/doughnut-chart/doughnut-chart';

import { SpendingKpiCardsComponent } from '../../components/spending-kpi-cards/spending-kpi-cards.component';
import { RecentExpensesComponent } from '../../components/recent-expenses/recent-expenses.component';
import { TopMerchantsComponent } from '../../components/top-merchants/top-merchants.component';
import { BudgetVsActualComponent } from '../../components/budget-vs-actual/budget-vs-actual.component';
import { ExpenseDetailsDrawerComponent } from '../../components/expense-details-drawer/expense-details-drawer.component';
import { AddExpenseModalComponent } from '../../components/add-expense-modal/add-expense-modal.component';
import { DeleteConfirmDialogComponent } from '../../components/delete-confirm-dialog/delete-confirm-dialog.component';
import { ReceiptViewerModalComponent } from '../../components/receipt-viewer-modal/receipt-viewer-modal.component';
import { SplitExpenseModalComponent } from '../../components/split-expense-modal/split-expense-modal.component';

@Component({
  selector: 'app-full-spending-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LineChart,
    DoughnutChart,
    SpendingKpiCardsComponent,
    RecentExpensesComponent,
    TopMerchantsComponent,
    BudgetVsActualComponent,
    ExpenseDetailsDrawerComponent,
    AddExpenseModalComponent,
    DeleteConfirmDialogComponent,
    ReceiptViewerModalComponent,
    SplitExpenseModalComponent
  ],
  templateUrl: './full-spending-dashboard.component.html',
  styleUrl: './full-spending-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FullSpendingDashboardComponent implements OnInit {
  private readonly spendingFacade: SpendingFacade = inject(SpendingFacade);

  readonly isLoading$: Observable<boolean> = this.spendingFacade.isLoading$;
  readonly error$: Observable<string | null> = this.spendingFacade.error$;
  readonly successMessage$: Observable<string | null> = this.spendingFacade.successMessage$;
  readonly overview$: Observable<SpendingOverviewData | null> = this.spendingFacade.overview$;
  readonly categories$: Observable<SpendingCategoryItem[]> = this.spendingFacade.categories$;
  readonly trendPoints$: Observable<SpendingTrendPoint[]> = this.spendingFacade.trendPoints$;
  readonly recentExpenses$: Observable<Expense[]> = this.spendingFacade.recentExpenses$;
  readonly insights$: Observable<SpendingInsight[]> = this.spendingFacade.insights$;
  readonly topMerchants$: Observable<SpendingMerchant[]> = this.spendingFacade.topMerchants$;
  readonly budgetVsActual$: Observable<BudgetVsActualItem[]> = this.spendingFacade.budgetVsActual$;

  readonly trendLabels$: Observable<string[]> = this.trendPoints$.pipe(
    map((points) => points.map((p) => p.xLabel))
  );

  readonly trendDatasets$: Observable<ChartConfiguration<'line'>['data']['datasets']> = this.trendPoints$.pipe(
    map((points) => {
      const currentData = points.map((p) => p.thisMonth);
      const previousData = points.map((p) => p.lastMonth);
      return [
        {
          data: currentData,
          label: 'This Month',
          borderColor: '#2563EB',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#2563EB',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4
        },
        {
          data: previousData,
          label: 'Last Month',
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

  readonly categoryLabels$: Observable<string[]> = this.categories$.pipe(map((cats) => cats.map((c) => c.name)));
  readonly categoryDatasets$: Observable<ChartConfiguration<'doughnut'>['data']['datasets']> = this.categories$.pipe(
    map((cats) => [
      {
        data: cats.map((c) => c.amount),
        backgroundColor: cats.map((c) => c.color || '#3B82F6'),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ])
  );
  readonly categoryTotal$: Observable<number> = this.overview$.pipe(map((ov) => ov?.totalSpending ?? 0));

  selectedPeriod: string = 'THIS_MONTH';
  selectedAccount: string = 'ALL';

  showDetailsDrawer: boolean = false;
  showEditModal: boolean = false;
  showDeleteDialog: boolean = false;
  showReceiptViewer: boolean = false;
  showSplitModal: boolean = false;
  activeExpense: Expense | null = null;

  ngOnInit(): void {
    this.spendingFacade.loadDashboard();
  }

  onRetry(): void {
    this.spendingFacade.retry();
  }

  onClearFeedback(): void {
    this.spendingFacade.clearFeedback();
  }

  onExpenseSelected(exp: Expense): void {
    this.activeExpense = exp;
    this.showDetailsDrawer = true;
  }

  openEditModal(exp: Expense): void {
    this.activeExpense = exp;
    this.showDetailsDrawer = false;
    this.showEditModal = true;
  }

  onUpdateExpense(event: { id: string; expense: Partial<Expense> } | Partial<Expense>): void {
    if ('expense' in event && event.id) {
      this.spendingFacade.updateExpense(event.id, event.expense);
    } else if (this.activeExpense) {
      this.spendingFacade.updateExpense(this.activeExpense.id, event as Partial<Expense>);
    }
    this.showEditModal = false;
  }

  openDeleteDialog(exp: Expense): void {
    this.activeExpense = exp;
    this.showDetailsDrawer = false;
    this.showDeleteDialog = true;
  }

  onConfirmDeleteExpense(id: string): void {
    this.spendingFacade.deleteExpense(id);
    this.showDeleteDialog = false;
    this.showDetailsDrawer = false;
    this.activeExpense = null;
  }

  openReceiptViewer(exp: Expense): void {
    this.activeExpense = exp;
    this.showReceiptViewer = true;
  }

  onUpdateReceipt(event: { id: string; receiptUrl: string; receiptFileName: string }): void {
    if (this.activeExpense) {
      this.spendingFacade.updateExpense(event.id, {
        receiptUrl: event.receiptUrl,
        receiptFileName: event.receiptFileName
      });
      this.activeExpense = { ...this.activeExpense, receiptUrl: event.receiptUrl, receiptFileName: event.receiptFileName };
    }
  }

  onRemoveReceipt(id: string): void {
    if (this.activeExpense) {
      this.spendingFacade.updateExpense(id, { receiptUrl: undefined, receiptFileName: undefined });
      this.activeExpense = { ...this.activeExpense, receiptUrl: undefined, receiptFileName: undefined };
    }
  }

  onSplitExpense(exp: Expense): void {
    this.activeExpense = exp;
    this.showDetailsDrawer = false;
    this.showSplitModal = true;
  }

  onSaveSplits(event: { originalId: string; splits: Partial<Expense>[] }): void {
    this.spendingFacade.deleteExpense(event.originalId);
    event.splits.forEach((splitItem) => this.spendingFacade.addExpense(splitItem));
    this.showSplitModal = false;
    this.activeExpense = null;
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
