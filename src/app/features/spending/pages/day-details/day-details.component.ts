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
import { exportExpensesToCsv, formatPaymentMethod } from '../../utility/spending.helpers';
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
  private categories: SpendingCategoryItem[] = [];

  ngOnInit(): void {
    this.spendingFacade.loadDashboard();
    combineLatest([this.route.paramMap, this.spendingFacade.allExpenses$, this.categories$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([params, expenses, categories]) => {
        this.selectedDate = params.get('date') || new Date().toISOString().split('T')[0];
        this.categories = categories || [];
        this.dayExpenses = (expenses || []).filter((e) => e.date === this.selectedDate);
        this.recompute();
      });
  }

  private recompute(): void {
    this.totalSpent = this.dayExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    this.transactionCount = this.dayExpenses.length;

    const merchantMap = new Map<string, number>();
    const categoryMap = new Map<string, { amount: number; color: string }>();
    for (const e of this.dayExpenses) {
      merchantMap.set(e.merchantName, (merchantMap.get(e.merchantName) || 0) + (Number(e.amount) || 0));
      const cat = categoryMap.get(e.categoryName) || { amount: 0, color: e.categoryColor || '#3B82F6' };
      cat.amount += Number(e.amount) || 0;
      categoryMap.set(e.categoryName, cat);
    }

    this.topMerchant = this.topKey(merchantMap) || '—';
    const topCatEntry = Array.from(categoryMap.entries()).sort((a, b) => b[1].amount - a[1].amount)[0];
    this.topCategory = topCatEntry ? topCatEntry[0] : '—';

    this.categoryLabels = Array.from(categoryMap.keys());
    this.categoryDatasets = [
      {
        data: Array.from(categoryMap.values()).map((c) => Number(c.amount.toFixed(2))),
        backgroundColor: Array.from(categoryMap.values()).map((c) => c.color),
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ];
    this.categoryTotal = this.totalSpent;
  }

  private topKey(map: Map<string, number>): string {
    let key = '';
    let max = -Infinity;
    for (const [k, v] of map.entries()) {
      if (v > max) {
        max = v;
        key = k;
      }
    }
    return key;
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
