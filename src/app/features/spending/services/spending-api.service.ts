import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, map, of, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SpendingOverviewData, SpendingCategoryItem, SpendingTrendPoint, SpendingAlert } from '../models/spending-summary.model';
import { Expense, ExpenseStatus, PaymentMethod } from '../models/expense.model';
import { Tag } from '../models/tag.model';
import { RecurringExpense } from '../models/recurring-expense.model';

/** Dev-only user id; the backend's dev auth shim resolves the user from the X-User-Id header. */
const DEV_USER_ID = '42';

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

// --- Backend DTO shapes (cashflow-spending-service) ---
interface OverviewDto {
  period?: string;
  totalSpending?: number;
  spendingGrowthPercentage?: number;
  transactionCount?: number;
  transactionsCount?: number;
  transactionsGrowthCount?: number;
  averageDaily?: number;
  averageDailyGrowthPercentage?: number;
  topCategory?: { categoryId: number; categoryName: string; amount: number };
  topCategoryName?: string;
  topCategoryAmount?: number;
  trend?: { date: string; amount: number }[];
  categorySummary?: { categoryId: number; categoryName: string; amount: number; percentage: number }[];
}

interface CategoryListDto {
  id?: string;
  categoryId?: number;
  categoryName?: string;
  name?: string;
  icon?: string;
  color?: string;
  budget?: number;
  amount?: number;
  percentage?: number;
  barWidth?: string;
}

interface ExpenseListItemDto {
  id?: string;
  transactionId?: number;
  date?: string;
  description?: string;
  type?: string;
  amount?: number;
  currency?: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  merchant?: string;
  merchantName?: string;
  accountName?: string;
  accountId?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  tags?: string[];
  status?: string;
  createdAt?: string;
}

interface ExpensePageDto {
  content?: ExpenseListItemDto[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}

interface ExpenseCreateDto {
  transactionId?: number;
  id?: string;
  message?: string;
}

interface TagDto {
  id?: string;
  tagId?: number;
  name: string;
  color?: string;
  count?: number;
  icon?: string;
}

interface RecurringExpenseDto {
  id?: string;
  recurringId?: number;
  name: string;
  merchantName?: string;
  amount: number;
  categoryId?: number;
  categoryName?: string;
  frequency?: string;
  billingCycle?: string;
  nextBillingDate?: string;
  accountId?: number;
  accountName?: string;
  isActive?: boolean;
  icon?: string;
}

interface SpendingAlertDto {
  id?: string;
  alertId?: number;
  title: string;
  message: string;
  severity: 'warning' | 'info' | 'success' | 'danger';
  date?: string;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SpendingApiService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly apiBaseUrl: string = environment.spendingApiBaseUrl;
  private readonly mockBaseUrl: string = environment.spendingMockBaseUrl;
  private readonly devHeaders: HttpHeaders = new HttpHeaders({ 'X-User-Id': DEV_USER_ID });

  private api(path: string): string {
    return `${this.apiBaseUrl}/${path}`;
  }

  private mock(path: string): string {
    return `${this.mockBaseUrl}/${path}`;
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
      overview: this.http.get<OverviewDto>(this.api('spending/overview'), { headers: this.devHeaders }).pipe(
        catchError(() => this.http.get<OverviewDto>(this.mock('spending-overview')).pipe(catchError(() => of({} as OverviewDto))))
      ),
      // Categories: try backend -> fallback to mock
      categoryList: this.http.get<CategoryListDto[]>(this.api('spending/categories'), { headers: this.devHeaders }).pipe(
        catchError(() => this.http.get<CategoryListDto[]>(this.mock('spending-categories')).pipe(catchError(() => of([] as CategoryListDto[]))))
      ),
      // Expenses: try backend -> fallback to mock
      expensesRaw: this.http.get<ExpensePageDto>(this.api('expenses?size=500'), { headers: this.devHeaders }).pipe(
        map((res) => res?.content || []),
        catchError(() => this.http.get<ExpenseListItemDto[]>(this.mock('expenses')).pipe(catchError(() => of([] as ExpenseListItemDto[]))))
      ),
      // Tags: try backend -> fallback to mock
      tags: this.http.get<TagDto[]>(this.api('tags'), { headers: this.devHeaders }).pipe(
        catchError(() => this.http.get<TagDto[]>(this.mock('tags')).pipe(catchError(() => of([] as TagDto[]))))
      ),
      // Recurring: try backend -> fallback to mock
      recurringExpenses: this.http.get<RecurringExpenseDto[]>(this.api('recurring-expenses'), { headers: this.devHeaders }).pipe(
        catchError(() => this.http.get<RecurringExpenseDto[]>(this.mock('recurring-expenses')).pipe(catchError(() => of([] as RecurringExpenseDto[]))))
      ),
      // Alerts: try backend -> fallback to mock
      alerts: this.http.get<SpendingAlertDto[]>(this.api('spending-alerts'), { headers: this.devHeaders }).pipe(
        catchError(() => this.http.get<SpendingAlertDto[]>(this.mock('spending-alerts')).pipe(catchError(() => of([] as SpendingAlertDto[]))))
      ),
      // Trend Points fallback
      mockTrendPoints: this.http.get<SpendingTrendPoint[]>(this.mock('spending-trend-points')).pipe(
        catchError(() => of([] as SpendingTrendPoint[]))
      )
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
            .filter((e) => e.amount > 0 || (e.merchantName && e.merchantName !== '—' && e.merchantName !== '-')),
          tags: (tags || []).map((t) => this.mapTag(t)),
          recurringExpenses: (recurringExpenses || []).map((r) => this.mapRecurring(r)),
          alerts: (alerts || []).map((a) => this.mapAlert(a))
        };
      })
    );
  }

  // --- Expenses CRUD ---

  getExpenses(): Observable<Expense[]> {
    return this.http
      .get<ExpensePageDto>(this.api('expenses?size=500'), { headers: this.devHeaders })
      .pipe(
        map((page) =>
          (page?.content || [])
            .map((e) => this.mapExpense(e))
            .filter((e) => e.amount > 0 || (e.merchantName && e.merchantName !== '—' && e.merchantName !== '-'))
        ),
        catchError(() =>
          this.http.get<ExpenseListItemDto[]>(this.mock('expenses')).pipe(
            map((list) =>
              (list || [])
                .map((e) => this.mapExpense(e))
                .filter((e) => e.amount > 0 || (e.merchantName && e.merchantName !== '—' && e.merchantName !== '-'))
            )
          )
        )
      );
  }

  createExpense(payload: Partial<Expense>): Observable<Expense> {
    return this.http
      .post<ExpenseCreateDto>(this.api('expenses'), this.toUpsertRequest(payload), { headers: this.devHeaders })
      .pipe(
        map((res) => ({ ...(payload as Expense), id: String(res.transactionId || res.id || Date.now()) })),
        catchError(() =>
          this.http
            .post<Expense>(this.mock('expenses'), payload)
            .pipe(map((res) => ({ ...payload, ...res } as Expense)))
        )
      );
  }

  updateExpense(id: string, payload: Partial<Expense>): Observable<Expense> {
    const numericId = this.toId(id) || id;
    return this.http
      .put(this.api(`expenses/${numericId}`), this.toUpsertRequest(payload), { headers: this.devHeaders })
      .pipe(
        map(() => ({ ...(payload as Expense), id })),
        catchError(() =>
          this.http
            .put<Expense>(this.mock(`expenses/${id}`), payload)
            .pipe(map(() => ({ ...(payload as Expense), id })))
        )
      );
  }

  deleteExpense(id: string): Observable<void> {
    const numericId = this.toId(id) || id;
    return this.http
      .delete<void>(this.api(`expenses/${numericId}`), { headers: this.devHeaders })
      .pipe(
        catchError(() => this.http.delete<void>(this.mock(`expenses/${id}`)))
      );
  }

  // --- Tags CRUD ---

  getTags(): Observable<Tag[]> {
    return this.http
      .get<TagDto[]>(this.api('tags'), { headers: this.devHeaders })
      .pipe(
        map((tags) => (tags || []).map((t) => this.mapTag(t))),
        catchError(() =>
          this.http
            .get<TagDto[]>(this.mock('tags'))
            .pipe(map((tags) => (tags || []).map((t) => this.mapTag(t))))
        )
      );
  }

  createTag(tag: Partial<Tag>): Observable<Tag> {
    return this.http
      .post<TagDto>(this.api('tags'), tag, { headers: this.devHeaders })
      .pipe(
        map((t) => this.mapTag(t)),
        catchError(() =>
          this.http
            .post<Tag>(this.mock('tags'), tag)
            .pipe(map((t) => this.mapTag(t)))
        )
      );
  }

  deleteTag(id: string): Observable<void> {
    const numericId = this.toId(id) || id;
    return this.http
      .delete<void>(this.api(`tags/${numericId}`), { headers: this.devHeaders })
      .pipe(
        catchError(() => this.http.delete<void>(this.mock(`tags/${id}`)))
      );
  }

  // --- Recurring Expenses CRUD ---

  getRecurringExpenses(): Observable<RecurringExpense[]> {
    return this.http
      .get<RecurringExpenseDto[]>(this.api('recurring-expenses'), { headers: this.devHeaders })
      .pipe(
        map((items) => (items || []).map((r) => this.mapRecurring(r))),
        catchError(() =>
          this.http
            .get<RecurringExpenseDto[]>(this.mock('recurring-expenses'))
            .pipe(map((items) => (items || []).map((r) => this.mapRecurring(r))))
        )
      );
  }

  createRecurringExpense(item: Partial<RecurringExpense>): Observable<RecurringExpense> {
    return this.http
      .post<RecurringExpenseDto>(this.api('recurring-expenses'), item, { headers: this.devHeaders })
      .pipe(
        map((r) => this.mapRecurring(r)),
        catchError(() =>
          this.http
            .post<RecurringExpense>(this.mock('recurring-expenses'), item)
            .pipe(map((r) => this.mapRecurring(r)))
        )
      );
  }

  updateRecurringExpense(id: string, item: Partial<RecurringExpense>): Observable<RecurringExpense> {
    const numericId = this.toId(id) || id;
    return this.http
      .patch<RecurringExpenseDto>(this.api(`recurring-expenses/${numericId}`), item, { headers: this.devHeaders })
      .pipe(
        map((r) => this.mapRecurring(r)),
        catchError(() =>
          this.http
            .patch<RecurringExpense>(this.mock(`recurring-expenses/${id}`), item)
            .pipe(map((r) => this.mapRecurring(r)))
        )
      );
  }

  deleteRecurringExpense(id: string): Observable<void> {
    const numericId = this.toId(id) || id;
    return this.http
      .delete<void>(this.api(`recurring-expenses/${numericId}`), { headers: this.devHeaders })
      .pipe(
        catchError(() => this.http.delete<void>(this.mock(`recurring-expenses/${id}`)))
      );
  }

  // --- Alerts CRUD ---

  getAlerts(): Observable<SpendingAlert[]> {
    return this.http
      .get<SpendingAlertDto[]>(this.api('spending-alerts'), { headers: this.devHeaders })
      .pipe(
        map((alerts) => (alerts || []).map((a) => this.mapAlert(a))),
        catchError(() =>
          this.http
            .get<SpendingAlertDto[]>(this.mock('spending-alerts'))
            .pipe(map((alerts) => (alerts || []).map((a) => this.mapAlert(a))))
        )
      );
  }

  updateAlert(id: string, alert: Partial<SpendingAlert>): Observable<SpendingAlert> {
    const numericId = this.toId(id) || id;
    return this.http
      .patch<SpendingAlertDto>(this.api(`spending-alerts/${numericId}`), alert, { headers: this.devHeaders })
      .pipe(
        map((a) => this.mapAlert(a)),
        catchError(() =>
          this.http
            .patch<SpendingAlert>(this.mock(`spending-alerts/${id}`), alert)
            .pipe(map((a) => this.mapAlert(a)))
        )
      );
  }

  deleteAlert(id: string): Observable<void> {
    const numericId = this.toId(id) || id;
    return this.http
      .delete<void>(this.api(`spending-alerts/${numericId}`), { headers: this.devHeaders })
      .pipe(
        catchError(() => this.http.delete<void>(this.mock(`spending-alerts/${id}`)))
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
    return {
      totalSpending: Number(dto.totalSpending) || 0,
      spendingGrowthPercentage: Number(dto.spendingGrowthPercentage) || 0,
      transactionsCount: dto.transactionsCount || dto.transactionCount || 0,
      transactionsGrowthCount: dto.transactionsGrowthCount || 0,
      averageDaily: Number(dto.averageDaily) || 0,
      averageDailyGrowthPercentage: Number(dto.averageDailyGrowthPercentage) || 0,
      topCategoryName: dto.topCategory?.categoryName || dto.topCategoryName || '—',
      topCategoryAmount: Number(dto.topCategory?.amount) || Number(dto.topCategoryAmount) || 0
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
