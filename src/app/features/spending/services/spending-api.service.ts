import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, catchError, throwError, timeout } from 'rxjs';
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

/** Fallback monthly budget per category if not supplied by backend or json-server. */
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
  private readonly mockBaseUrl: string = environment.spendingMockBaseUrl;
  // Fail fast when the mock fallback is available (dev); allow longer for a live prod backend.
  private readonly backendTimeoutMs: number = environment.useMockFallback ? 2000 : 15000;

  private api(path: string): string {
    return `${this.apiBaseUrl}/${path}`;
  }

  private mock(path: string): string {
    return `${this.mockBaseUrl}/${path}`;
  }

  /** GET against the live backend with a fail-fast timeout so a dead backend falls back quickly. */
  private backendGet<T>(path: string): Observable<T> {
    return this.http.get<T>(this.api(path)).pipe(timeout(this.backendTimeoutMs));
  }

  /** Runs the mock fallback when enabled, otherwise rethrows so callers surface the backend error. */
  private mockOrRethrow<T>(factory: () => Observable<T>): Observable<T> {
    return environment.useMockFallback
      ? factory()
      : throwError(() => new Error('Spending backend request failed and mock fallback is disabled.'));
  }

  /** Hides zero-amount/placeholder rows that the backend occasionally returns. */
  private isDisplayableExpense(e: Expense): boolean {
    return e.amount > 0 || (!!e.merchantName && e.merchantName !== '—' && e.merchantName !== '-');
  }

  /**
   * Fetches all dashboard datasets:
   * 1. Attempts the live Spring Boot Backend (http://localhost:8083/api/v1)
   * 2. If the backend is unreachable or returns an error, seamlessly falls back to json-server (database/spending.json :3003)
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
      // Overview: try backend -> fallback to mock
      overview: this.backendGet<OverviewDto>('spending/overview').pipe(
        catchError(() => this.mockOrRethrow(() => this.http.get<OverviewDto>(this.mock('spending-overview')).pipe(catchError(() => of({} as OverviewDto)))))
      ),
      // Categories: try backend -> fallback to mock
      categoryList: this.backendGet<CategoryListDto[]>('spending/categories').pipe(
        catchError(() => this.mockOrRethrow(() => this.http.get<CategoryListDto[]>(this.mock('spending-categories')).pipe(catchError(() => of([] as CategoryListDto[])))))
      ),
      // Expenses: try backend -> fallback to mock
      expensesRaw: this.backendGet<ExpensePageDto>('expenses?size=500').pipe(
        map((res) => res?.content || []),
        catchError(() => this.mockOrRethrow(() => this.http.get<ExpenseListItemDto[]>(this.mock('expenses')).pipe(catchError(() => of([] as ExpenseListItemDto[])))))
      ),
      // Tags: try backend -> fallback to mock
      tags: this.backendGet<TagDto[]>('tags').pipe(
        catchError(() => this.mockOrRethrow(() => this.http.get<TagDto[]>(this.mock('tags')).pipe(catchError(() => of([] as TagDto[])))))
      ),
      // Recurring: try backend -> fallback to mock
      recurringExpenses: this.backendGet<RecurringExpenseDto[]>('recurring-expenses').pipe(
        catchError(() => this.mockOrRethrow(() => this.http.get<RecurringExpenseDto[]>(this.mock('recurring-expenses')).pipe(catchError(() => of([] as RecurringExpenseDto[])))))
      ),
      // Alerts: try backend -> fallback to mock
      alerts: this.backendGet<SpendingAlertDto[]>('spending-alerts').pipe(
        catchError(() => this.mockOrRethrow(() => this.http.get<SpendingAlertDto[]>(this.mock('spending-alerts')).pipe(catchError(() => of([] as SpendingAlertDto[])))))
      ),
      // Trend Points fallback (mock-only; skipped when mock fallback is disabled)
      mockTrendPoints: environment.useMockFallback
        ? this.http.get<SpendingTrendPoint[]>(this.mock('spending-trend-points')).pipe(catchError(() => of([] as SpendingTrendPoint[])))
        : of([] as SpendingTrendPoint[])
    }).pipe(
      map(({ overview, categoryList, expensesRaw, tags, recurringExpenses, alerts, mockTrendPoints }) => {
        const trendPoints = (overview?.trend && overview.trend.length > 0)
          ? this.mapTrend(overview.trend)
          : (mockTrendPoints && mockTrendPoints.length > 0 ? mockTrendPoints : []);

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
        ),
        catchError(() =>
          this.mockOrRethrow(() =>
            this.http.get<ExpenseListItemDto[]>(this.mock('expenses')).pipe(
              map((list) =>
                (list || [])
                  .map((e) => this.mapExpense(e))
                  .filter((e) => this.isDisplayableExpense(e))
              )
            )
          )
        )
      );
  }

  createExpense(payload: Partial<Expense>): Observable<Expense> {
    return this.http
      .post<ExpenseCreateDto>(this.api('expenses'), this.toUpsertRequest(payload))
      .pipe(
        map((res) => ({ ...(payload as Expense), id: String(res.transactionId || res.id || Date.now()) })),
        catchError(() =>
          this.mockOrRethrow(() =>
            this.http
              .post<Expense>(this.mock('expenses'), payload)
              .pipe(map((res) => ({ ...payload, ...res } as Expense)))
          )
        )
      );
  }

  updateExpense(id: string, payload: Partial<Expense>): Observable<Expense> {
    const numericId = this.toId(id) || id;
    return this.http
      .put(this.api(`expenses/${numericId}`), this.toUpsertRequest(payload))
      .pipe(
        map(() => ({ ...(payload as Expense), id })),
        catchError(() =>
          this.mockOrRethrow(() =>
            this.http
              .put<Expense>(this.mock(`expenses/${id}`), payload)
              .pipe(map(() => ({ ...(payload as Expense), id })))
          )
        )
      );
  }

  deleteExpense(id: string): Observable<void> {
    const numericId = this.toId(id) || id;
    return this.http
      .delete<void>(this.api(`expenses/${numericId}`))
      .pipe(
        catchError(() => this.mockOrRethrow(() => this.http.delete<void>(this.mock(`expenses/${id}`))))
      );
  }

  // --- Tags CRUD ---

  getTags(): Observable<Tag[]> {
    return this.backendGet<TagDto[]>('tags')
      .pipe(
        map((tags) => (tags || []).map((t) => this.mapTag(t))),
        catchError(() =>
          this.mockOrRethrow(() =>
            this.http
              .get<TagDto[]>(this.mock('tags'))
              .pipe(map((tags) => (tags || []).map((t) => this.mapTag(t))))
          )
        )
      );
  }

  createTag(tag: Partial<Tag>): Observable<Tag> {
    return this.http
      .post<TagDto>(this.api('tags'), tag)
      .pipe(
        map((t) => this.mapTag(t)),
        catchError(() =>
          this.mockOrRethrow(() =>
            this.http
              .post<Tag>(this.mock('tags'), tag)
              .pipe(map((t) => this.mapTag(t)))
          )
        )
      );
  }

  deleteTag(id: string): Observable<void> {
    const numericId = this.toId(id) || id;
    return this.http
      .delete<void>(this.api(`tags/${numericId}`))
      .pipe(
        catchError(() => this.mockOrRethrow(() => this.http.delete<void>(this.mock(`tags/${id}`))))
      );
  }

  // --- Recurring Expenses CRUD ---

  getRecurringExpenses(): Observable<RecurringExpense[]> {
    return this.backendGet<RecurringExpenseDto[]>('recurring-expenses')
      .pipe(
        map((items) => (items || []).map((r) => this.mapRecurring(r))),
        catchError(() =>
          this.mockOrRethrow(() =>
            this.http
              .get<RecurringExpenseDto[]>(this.mock('recurring-expenses'))
              .pipe(map((items) => (items || []).map((r) => this.mapRecurring(r))))
          )
        )
      );
  }

  createRecurringExpense(item: Partial<RecurringExpense>): Observable<RecurringExpense> {
    return this.http
      .post<RecurringExpenseDto>(this.api('recurring-expenses'), item)
      .pipe(
        map((r) => this.mapRecurring(r)),
        catchError(() =>
          this.mockOrRethrow(() =>
            this.http
              .post<RecurringExpense>(this.mock('recurring-expenses'), item)
              .pipe(map((r) => this.mapRecurring(r)))
          )
        )
      );
  }

  updateRecurringExpense(id: string, item: Partial<RecurringExpense>): Observable<RecurringExpense> {
    const numericId = this.toId(id) || id;
    return this.http
      .patch<RecurringExpenseDto>(this.api(`recurring-expenses/${numericId}`), item)
      .pipe(
        map((r) => this.mapRecurring(r)),
        catchError(() =>
          this.mockOrRethrow(() =>
            this.http
              .patch<RecurringExpense>(this.mock(`recurring-expenses/${id}`), item)
              .pipe(map((r) => this.mapRecurring(r)))
          )
        )
      );
  }

  deleteRecurringExpense(id: string): Observable<void> {
    const numericId = this.toId(id) || id;
    return this.http
      .delete<void>(this.api(`recurring-expenses/${numericId}`))
      .pipe(
        catchError(() => this.mockOrRethrow(() => this.http.delete<void>(this.mock(`recurring-expenses/${id}`))))
      );
  }

  // --- Alerts CRUD ---

  getAlerts(): Observable<SpendingAlert[]> {
    return this.backendGet<SpendingAlertDto[]>('spending-alerts')
      .pipe(
        map((alerts) => (alerts || []).map((a) => this.mapAlert(a))),
        catchError(() =>
          this.mockOrRethrow(() =>
            this.http
              .get<SpendingAlertDto[]>(this.mock('spending-alerts'))
              .pipe(map((alerts) => (alerts || []).map((a) => this.mapAlert(a))))
          )
        )
      );
  }

  updateAlert(id: string, alert: Partial<SpendingAlert>): Observable<SpendingAlert> {
    const numericId = this.toId(id) || id;
    return this.http
      .patch<SpendingAlertDto>(this.api(`spending-alerts/${numericId}`), alert)
      .pipe(
        map((a) => this.mapAlert(a)),
        catchError(() =>
          this.mockOrRethrow(() =>
            this.http
              .patch<SpendingAlert>(this.mock(`spending-alerts/${id}`), alert)
              .pipe(map((a) => this.mapAlert(a)))
          )
        )
      );
  }

  deleteAlert(id: string): Observable<void> {
    const numericId = this.toId(id) || id;
    return this.http
      .delete<void>(this.api(`spending-alerts/${numericId}`))
      .pipe(
        catchError(() => this.mockOrRethrow(() => this.http.delete<void>(this.mock(`spending-alerts/${id}`))))
      );
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

    // Otherwise if mock list is directly available (from spending.json "spending-categories")
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
