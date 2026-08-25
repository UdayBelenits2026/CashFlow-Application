import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { combineLatest, Observable } from 'rxjs';
import { SpendingFacade } from '../../facades/spending.facade';
import { Expense } from '../../models/expense.model';
import { SpendingCategoryItem } from '../../models/spending-summary.model';
import { DayDetailsStats } from '../../models/day-details.model';
import { exportExpensesToCsv, formatPaymentMethod } from '../../utility/spending.helpers';
import { computeDayDetailsStats } from '../../utility/spending.calculations';
import { DoughnutChart } from '../../../../shared/charts/doughnut-chart/doughnut-chart';
import { ExpenseDetailsDrawerComponent } from '../../components/expense-details-drawer/expense-details-drawer.component';
import { AddExpenseModalComponent } from '../../components/add-expense-modal/add-expense-modal.component';

@Component({
  selector: 'app-day-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    DoughnutChart,
    ExpenseDetailsDrawerComponent,
    AddExpenseModalComponent
  ],
  templateUrl: './day-details.component.html',
  styleUrl: './day-details.component.scss'
})
export class DayDetailsComponent implements OnInit {
  private readonly spendingFacade: SpendingFacade = inject(SpendingFacade);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  readonly categories$: Observable<SpendingCategoryItem[]> = this.spendingFacade.categories$;

  selectedDate: string = '';
  dayExpenses: Expense[] = [];

  totalSpent: number = 0;
  transactionCount: number = 0;
  topMerchant: string = '—';
  topCategory: string = '—';

  categoryLabels: string[] = [];
  categoryDatasets: ChartConfiguration<'doughnut'>['data']['datasets'] = [];
  categoryTotal: number = 0;

  notes: string = '';

  showDetailsDrawer: boolean = false;
  showAddModal: boolean = false;
  activeExpense: Expense | null = null;

  ngOnInit(): void {
    this.spendingFacade.loadDashboard();
    combineLatest([this.route.paramMap, this.spendingFacade.allExpenses$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, expenses]) => {
        this.selectedDate = params.get('date') || new Date().toISOString().split('T')[0];
        this.dayExpenses = (expenses || []).filter((e) => e.date === this.selectedDate);
        this.recompute();
      });
  }

  private recompute(): void {
    const stats: DayDetailsStats = computeDayDetailsStats(this.dayExpenses);
    this.totalSpent = stats.totalSpent;
    this.transactionCount = stats.transactionCount;
    this.topMerchant = stats.topMerchant;
    this.topCategory = stats.topCategory;

    this.categoryLabels = stats.categoryLabels;
    this.categoryDatasets = [
      {
        data: stats.categoryAmounts,
        backgroundColor: stats.categoryColors,
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ];
    this.categoryTotal = stats.totalSpent;
  }

  formatPayment(method?: string): string {
    return formatPaymentMethod(method);
  }

  openExpenseDetails(exp: Expense): void {
    this.activeExpense = exp;
    this.showDetailsDrawer = true;
  }

  onSaveNewExpense(expense: Partial<Expense>): void {
    this.spendingFacade.addExpense({ ...expense, date: expense.date || this.selectedDate });
    this.showAddModal = false;
  }

  exportDayReport(): void {
    if (this.dayExpenses.length === 0) return;
    exportExpensesToCsv(this.dayExpenses, `spending_day_report_${this.selectedDate}`);
  }
}
