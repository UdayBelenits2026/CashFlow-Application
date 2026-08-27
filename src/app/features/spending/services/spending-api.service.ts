import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, catchError, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SpendingOverviewData, SpendingCategoryItem, SpendingTrendPoint, SpendingAlert } from '../models/spending-summary.model';
import { Expense, ExpenseStatus, PaymentMethod } from '../models/expense.model';
import { Tag } from '../models/tag.model';
import { RecurringExpense } from '../models/recurring-expense.model';
import {
  OverviewDto,
  CategoryListDto,
  ExpenseListItemDto,
  ExpensePageDto,
  ExpenseCreateDto,
  TagDto,
  RecurringExpenseDto,
  SpendingAlertDto
} from '../models/spending-api.dto';

/** Fallback monthly budget per category if not supplied by the backend. */
const CATEGORY_BUDGETS: Record<string, number> = {
  'Food & Dining': 800,
  'Shopping': 600,
  'Transportation': 500,
  'Utilities': 350,
  'Entertainment': 400,
  'Health': 300,
  'Travel': 500,
  'Education': 200
};

@Injectable({
  providedIn: 'root'
})
export class SpendingApiService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly apiBaseUrl: string = environment.spendingApiBaseUrl;
  private readonly backendTimeoutMs: number = 15000;

  private api(path: string): string {
    return `${this.apiBaseUrl}/${path}`;
  }

  /** GET against the backend with a timeout so a hung request fails instead of waiting forever. */
  private backendGet<T>(path: string): Observable<T> {
    return this.http.get<T>(this.api(path)).pipe(timeout(this.backendTimeoutMs));
  }

  /** Hides zero-amount/placeholder rows that the backend occasionally returns. */
  private isDisplayableExpense(e: Expense): boolean {
    return e.amount > 0 || (!!e.merchantName && e.merchantName !== '—' && e.merchantName !== '-');
  }

  /**
   * Fetches all dashboard datasets from the backend. A failing endpoint degrades to an empty
   * dataset so a single broken widget does not break the whole dashboard load.
   */
  getDashboardData(): Observable<{
    overview: SpendingOverviewData;
    categories: SpendingCategoryItem[];
    trendPoints: SpendingTrendPoint[];
    expenses: Expense[];
    tags: Tag[];
    recurringExpenses: RecurringExpense[];
    alerts: SpendingAlert[];
  }> {
    return forkJoin({
      overview: this.backendGet<OverviewDto>('spending/overview').pipe(
        catchError(() => of({} as OverviewDto))
      ),
      categoryList: this.backendGet<CategoryListDto[]>('spending/categories').pipe(
        catchError(() => of([] as CategoryListDto[]))
      ),
      expensesRaw: this.backendGet<ExpensePageDto>('expenses?size=500').pipe(
        map((res) => res?.content || []),
        catchError(() => of([] as ExpenseListItemDto[]))
      ),
      tags: this.backendGet<TagDto[]>('tags').pipe(
        catchError(() => of([] as TagDto[]))
      ),
      recurringExpenses: this.backendGet<RecurringExpenseDto[]>('recurring-expenses').pipe(
        catchError(() => of([] as RecurringExpenseDto[]))
      ),
      alerts: this.backendGet<SpendingAlertDto[]>('spending-alerts').pipe(
        catchError(() => of([] as SpendingAlertDto[]))
      )
    }).pipe(
      map(({ overview, categoryList, expensesRaw, tags, recurringExpenses, alerts }) => {
        const trendPoints = (overview?.trend && overview.trend.length > 0)
          ? this.mapTrend(overview.trend)
          : [];

        const categories = this.resolveCategories(overview, categoryList);

        return {
          overview: this.mapOverview(overview),
          categories,
          trendPoints,
          expenses: (expensesRaw || [])
            .map((e) => this.mapExpense(e))
            .filter((e) => this.isDisplayableExpense(e)),
          tags: (tags || []).map((t) => this.mapTag(t)),
          recurringExpenses: (recurringExpenses || []).map((r) => this.mapRecurring(r)),
          alerts: (alerts || []).map((a) => this.mapAlert(a))
        };
      })
    );
  }

  // --- Expenses CRUD ---

  getExpenses(): Observable<Expense[]> {
    return this.backendGet<ExpensePageDto>('expenses?size=500')
      .pipe(
        map((page) =>
          (page?.content || [])
            .map((e) => this.mapExpense(e))
            .filter((e) => this.isDisplayableExpense(e))
        )
      );
  }

  createExpense(payload: Partial<Expense>): Observable<Expense> {
    return this.http
      .post<ExpenseCreateDto>(this.api('expenses'), this.toUpsertRequest(payload))
      .pipe(
        map((res) => ({ ...(payload as Expense), id: String(res.transactionId || res.id || Date.now()) }))
      );
  }

  updateExpense(id: string, payload: Partial<Expense>): Observable<Expense> {
    const numericId = this.toId(id) || id;
    return this.http
      .put(this.api(`expenses/${numericId}`), this.toUpsertRequest(payload))
      .pipe(
        map(() => ({ ...(payload as Expense), id }))
      );
  }

  deleteExpense(id: string): Observable<void> {
    const numericId = this.toId(id) || id;
    return this.http.delete<void>(this.api(`expenses/${numericId}`));
  }

  // --- Tags CRUD ---

  getTags(): Observable<Tag[]> {
    return this.backendGet<TagDto[]>('tags')
      .pipe(
        map((tags) => (tags || []).map((t) => this.mapTag(t)))
      );
  }

  createTag(tag: Partial<Tag>): Observable<Tag> {
    return this.http
      .post<TagDto>(this.api('tags'), tag)
      .pipe(
        map((t) => this.mapTag(t))
      );
  }

  deleteTag(id: string): Observable<void> {
    const numericId = this.toId(id) || id;
    return this.http.delete<void>(this.api(`tags/${numericId}`));
  }

  // --- Recurring Expenses CRUD ---

  getRecurringExpenses(): Observable<RecurringExpense[]> {
    return this.backendGet<RecurringExpenseDto[]>('recurring-expenses')
      .pipe(
        map((items) => (items || []).map((r) => this.mapRecurring(r)))
      );
  }

  createRecurringExpense(item: Partial<RecurringExpense>): Observable<RecurringExpense> {
    return this.http
      .post<RecurringExpenseDto>(this.api('recurring-expenses'), item)
      .pipe(
        map((r) => this.mapRecurring(r))
      );
  }

  updateRecurringExpense(id: string, item: Partial<RecurringExpense>): Observable<RecurringExpense> {
    const numericId = this.toId(id) || id;
    return this.http
      .patch<RecurringExpenseDto>(this.api(`recurring-expenses/${numericId}`), item)
      .pipe(
        map((r) => this.mapRecurring(r))
      );
  }

  deleteRecurringExpense(id: string): Observable<void> {
    const numericId = this.toId(id) || id;
    return this.http.delete<void>(this.api(`recurring-expenses/${numericId}`));
  }

  // --- Alerts CRUD ---

  getAlerts(): Observable<SpendingAlert[]> {
    return this.backendGet<SpendingAlertDto[]>('spending-alerts')
      .pipe(
        map((alerts) => (alerts || []).map((a) => this.mapAlert(a)))
      );
  }

  updateAlert(id: string, alert: Partial<SpendingAlert>): Observable<SpendingAlert> {
    const numericId = this.toId(id) || id;
    return this.http
      .patch<SpendingAlertDto>(this.api(`spending-alerts/${numericId}`), alert)
      .pipe(
        map((a) => this.mapAlert(a))
      );
  }

  deleteAlert(id: string): Observable<void> {
    const numericId = this.toId(id) || id;
    return this.http.delete<void>(this.api(`spending-alerts/${numericId}`));
  }

  // --- DTO -> model mappers ---

  private resolveCategories(overview: OverviewDto, list: CategoryListDto[]): SpendingCategoryItem[] {
    // If backend returns categorySummary, use it merged with category list metadata
    if (overview?.categorySummary && overview.categorySummary.length > 0) {
      return overview.categorySummary.map((s) => {
        const meta = (list || []).find((c) => (c.categoryId === s.categoryId) || (c.categoryName === s.categoryName) || (c.name === s.categoryName));
        const percentage = Number(s.percentage) || 0;
        return {
          id: s.categoryId != null ? String(s.categoryId) : s.categoryName,
          name: s.categoryName,
          amount: Number(s.amount) || 0,
          percentage,
          color: meta?.color || '#3B82F6',
          barWidth: `${percentage}%`,
          icon: meta?.icon,
          budget: meta?.budget != null ? Number(meta.budget) : CATEGORY_BUDGETS[s.categoryName]
        };
      });
    }

    // Otherwise if a flat category list is available, use it directly
    if (list && list.length > 0) {
      return list.map((c) => ({
        id: c.id || (c.categoryId != null ? String(c.categoryId) : (c.categoryName || c.name || '')),
        name: c.categoryName || c.name || '',
        amount: Number(c.amount) || 0,
        percentage: Number(c.percentage) || 0,
        color: c.color || '#3B82F6',
        barWidth: c.barWidth || `${c.percentage || 0}%`,
        icon: c.icon,
        budget: c.budget != null ? Number(c.budget) : CATEGORY_BUDGETS[c.categoryName || c.name || '']
      }));
    }

    return [];
  }

  private mapOverview(dto: OverviewDto): SpendingOverviewData {
    const totalSpending: number = Number(dto.totalSpending) || 0;
    const budgetTotal: number = Number(dto.budgetTotal) || 0;
    const budgetUsedPercentage: number = dto.budgetUsedPercentage != null
      ? Number(dto.budgetUsedPercentage)
      : (budgetTotal > 0 ? Math.min(100, Math.round((totalSpending / budgetTotal) * 100)) : 0);

    return {
      totalSpending,
      spendingGrowthPercentage: Number(dto.spendingGrowthPercentage) || 0,
      transactionsCount: dto.transactionsCount || dto.transactionCount || 0,
      transactionsGrowthCount: dto.transactionsGrowthCount || 0,
      averageDaily: Number(dto.averageDaily) || 0,
      averageDailyGrowthPercentage: Number(dto.averageDailyGrowthPercentage) || 0,
      topCategoryName: dto.topCategory?.categoryName || dto.topCategoryName || '—',
      topCategoryAmount: Number(dto.topCategory?.amount) || Number(dto.topCategoryAmount) || 0,
      budgetTotal,
      budgetUsedPercentage
    };
  }

  private mapTrend(trend: OverviewDto['trend']): SpendingTrendPoint[] {
    return (trend || []).map((t) => ({ xLabel: t.date, thisMonth: Number(t.amount) || 0, lastMonth: 0 }));
  }

  private mapExpense(dto: ExpenseListItemDto): Expense {
    return {
      id: String(dto.transactionId || dto.id || Date.now()),
      amount: Number(dto.amount) || 0,
      date: dto.date || new Date().toISOString().substring(0, 10),
      merchantName: dto.merchantName || dto.merchant || dto.description || dto.categoryName || dto.category || '—',
      categoryId: dto.categoryId != null ? String(dto.categoryId) : '',
      categoryName: dto.categoryName || dto.category || '',
      accountId: dto.accountId != null ? String(dto.accountId) : '',
      accountName: dto.accountName || '',
      paymentMethod: dto.paymentMethod || 'DEBIT_CARD',
      notes: dto.notes || dto.description || '',
      status: this.mapStatus(dto.status),
      createdAt: dto.createdAt || dto.date || new Date().toISOString()
    };
  }

  private mapTag(dto: TagDto): Tag {
    return {
      id: dto.id || (dto.tagId != null ? `tag-${dto.tagId}` : ''),
      name: dto.name,
      color: dto.color || '#2563EB',
      count: dto.count || 0
    };
  }

  private mapRecurring(dto: RecurringExpenseDto): RecurringExpense {
    return {
      id: dto.id || (dto.recurringId != null ? `rec-${dto.recurringId}` : ''),
      name: dto.name,
      merchantName: dto.merchantName || dto.name,
      amount: Number(dto.amount) || 0,
      categoryName: dto.categoryName || 'General',
      frequency: this.mapFrequency(dto.frequency),
      billingCycle: dto.billingCycle || 'Monthly',
      nextBillingDate: dto.nextBillingDate || '',
      accountName: dto.accountName || 'Main Checking',
      isActive: dto.isActive !== false,
      icon: dto.icon || 'repeat'
    };
  }

  private mapFrequency(freq: string | undefined): 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'YEARLY' {
    if (freq === 'WEEKLY' || freq === 'BI_WEEKLY' || freq === 'YEARLY') {
      return freq;
    }
    return 'MONTHLY';
  }

  private mapAlert(dto: SpendingAlertDto): SpendingAlert {
    return {
      id: dto.id || (dto.alertId != null ? `alt-${dto.alertId}` : ''),
      title: dto.title,
      message: dto.message,
      severity: dto.severity || 'info',
      date: dto.date || new Date().toISOString().substring(0, 10),
      isRead: dto.isRead === true
    };
  }

  private mapStatus(status: string | undefined): ExpenseStatus {
    return status === 'PENDING' ? 'PENDING' : 'CLEARED';
  }

  private toUpsertRequest(payload: Partial<Expense>): {
    accountId: number;
    amount: number;
    transactionDate: string | undefined;
    merchantName: string;
    categoryId: number;
    paymentMethod: PaymentMethod;
    description: string;
    notes: string;
  } {
    return {
      accountId: this.toId(payload.accountId) || 1,
      amount: Number(payload.amount) || 0,
      transactionDate: payload.date,
      merchantName: payload.merchantName || 'Expense',
      categoryId: this.toId(payload.categoryId) || 1,
      paymentMethod: payload.paymentMethod || 'DEBIT_CARD',
      description: payload.merchantName || payload.notes || 'Expense',
      notes: payload.notes || ''
    };
  }

  /** Extracts a numeric id from values like "acc-2" or "cat-3" or "tag-5" or plain numbers. */
  private toId(value: string | number | undefined): number {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    const digits = String(value).replace(/\D/g, '');
    return digits ? Number(digits) : 0;
  }
}
