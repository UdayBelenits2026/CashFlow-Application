import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';
import { ChartConfiguration } from 'chart.js';
import { SpendingFacade } from '../../facades/spending.facade';
import { Expense } from '../../models/expense.model';

// Shared Chart Components
import { LineChart } from '../../../../shared/charts/line-chart/line-chart';
import { DoughnutChart } from '../../../../shared/charts/doughnut-chart/doughnut-chart';

// Reusable Presentation Components
import { SpendingKpiCardsComponent } from '../../components/spending-kpi-cards/spending-kpi-cards.component';
import { RecentExpensesComponent } from '../../components/recent-expenses/recent-expenses.component';
import { ExpenseDetailsDrawerComponent } from '../../components/expense-details-drawer/expense-details-drawer.component';
import { AddExpenseModalComponent } from '../../components/add-expense-modal/add-expense-modal.component';
import { DeleteConfirmDialogComponent } from '../../components/delete-confirm-dialog/delete-confirm-dialog.component';
import { ReceiptViewerModalComponent } from '../../components/receipt-viewer-modal/receipt-viewer-modal.component';
import { SpendingInsightsDrawerComponent } from '../../components/spending-insights-drawer/spending-insights-drawer.component';
import { SpendingAlertsDrawerComponent } from '../../components/spending-alerts-drawer/spending-alerts-drawer.component';
import { SplitExpenseModalComponent } from '../../components/split-expense-modal/split-expense-modal.component';

@Component({
  selector: 'app-spending-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LineChart,
    DoughnutChart,
    SpendingKpiCardsComponent,
    RecentExpensesComponent,
    ExpenseDetailsDrawerComponent,
    AddExpenseModalComponent,
    DeleteConfirmDialogComponent,
    ReceiptViewerModalComponent,
    SpendingInsightsDrawerComponent,
    SpendingAlertsDrawerComponent,
    SplitExpenseModalComponent
  ],
  templateUrl: './spending-dashboard.component.html',
  styleUrl: './spending-dashboard.component.scss'
})
export class SpendingDashboardComponent implements OnInit {
  private readonly spendingFacade = inject(SpendingFacade);

  // Observables from Facade
  readonly isLoading$ = this.spendingFacade.isLoading$;
  readonly error$ = this.spendingFacade.error$;
  readonly successMessage$ = this.spendingFacade.successMessage$;
  readonly overview$ = this.spendingFacade.overview$;
  readonly categories$ = this.spendingFacade.categories$;
  readonly trendPoints$ = this.spendingFacade.trendPoints$;
  readonly recentExpenses$ = this.spendingFacade.recentExpenses$;
  readonly insights$ = this.spendingFacade.insights$;
  readonly alerts$ = this.spendingFacade.alerts$;
  readonly unreadAlertsCount$ = this.spendingFacade.unreadAlertsCount$;

  // Line Chart Streams for Shared app-cf-line-chart
  readonly trendLabels$ = this.trendPoints$.pipe(
    map((points) => (points && points.length > 0 ? points.map((p) => p.xLabel) : ['May 1', 'May 8', 'May 15', 'May 22', 'May 29']))
  );

  readonly trendDatasets$ = this.trendPoints$.pipe(
    map((points) => {
      const currentData = points && points.length > 0 ? points.map((p) => p.thisMonth) : [350, 480, 520, 680, 620];
      const previousData = points && points.length > 0 ? points.map((p) => p.lastMonth) : [300, 420, 490, 550, 580];
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

  // Doughnut Chart Streams for Shared app-cf-doughnut-chart
  readonly categoryLabels$ = this.categories$.pipe(
    map((cats) => cats.map((c) => c.name))
  );

  readonly categoryDatasets$ = this.categories$.pipe(
    map((cats) => [
      {
        data: cats.map((c) => c.amount),
        backgroundColor: cats.map((c) => c.color || '#3B82F6'),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ])
  );

  readonly categoryTotal$ = this.overview$.pipe(
    map((ov) => ov?.totalSpending || 2650)
  );

  // Period Selector State
  selectedPeriod = 'THIS_MONTH';

  // Modal / Drawer UI State
  showDetailsDrawer = false;
  showEditModal = false;
  showDeleteDialog = false;
  showReceiptViewer = false;
  showInsightsDrawer = false;
  showAlertsDrawer = false;
  showSplitModal = false;

  activeExpense: Expense | null = null;

  ngOnInit(): void {
    this.spendingFacade.loadDashboard();
  }

  onPeriodChange(period: string): void {
    this.selectedPeriod = period;
  }

  onRetry(): void {
    this.spendingFacade.retry();
  }

  onClearFeedback(): void {
    this.spendingFacade.clearFeedback();
  }

  // --- Utility Drawer Triggers ---
  openInsightsDrawer(): void {
    this.showInsightsDrawer = true;
  }

  openAlertsDrawer(): void {
    this.showAlertsDrawer = true;
  }

  onMarkAlertAsRead(id: string): void {
    this.spendingFacade.markAlertAsRead(id);
  }

  onDismissAlert(id: string): void {
    this.spendingFacade.dismissAlert(id);
  }

  // --- Expense Drawer & Modal Handlers ---
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
      this.activeExpense = {
        ...this.activeExpense,
        receiptUrl: event.receiptUrl,
        receiptFileName: event.receiptFileName
      };
    }
  }

  onRemoveReceipt(id: string): void {
    if (this.activeExpense) {
      this.spendingFacade.updateExpense(id, { receiptUrl: undefined, receiptFileName: undefined });
      this.activeExpense = { ...this.activeExpense, receiptUrl: undefined, receiptFileName: undefined };
    }
  }

  // Split Feature Handlers
  onSplitExpense(exp: Expense): void {
    this.activeExpense = exp;
    this.showDetailsDrawer = false;
    this.showSplitModal = true;
  }

  onSaveSplits(event: { originalId: string; splits: Partial<Expense>[] }): void {
    this.spendingFacade.deleteExpense(event.originalId);
    event.splits.forEach((splitItem) => {
      this.spendingFacade.addExpense(splitItem);
    });
    this.showSplitModal = false;
    this.activeExpense = null;
  }
}
