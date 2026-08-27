import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, throwError, timeout, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TokenService } from '../../../core/auth/services/token.service';
import { SpendingOverviewData, SpendingCategoryItem, SpendingTrendPoint, SpendingAlert } from '../models/spending-summary.model';
import { Expense, ExpenseStatus, PaymentMethod } from '../models/expense.model';
import { Tag } from '../models/tag.model';
import { RecurringExpense } from '../models/recurring-expense.model';
import {
  SpendingOverviewDto,
  SpendingDashboardDto,
  CategoryOptionDto,
  ExpenseListItemDto,
  ExpenseListPageDto,
  ExpenseCreateRequestDto,
  ExpenseUpdateRequestDto,
  ExpenseMutationResponseDto,
  TagDto,
  RecurringExpenseDto,
  SpendingAlertDto
} from '../models/spending-api.dto';

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
  private readonly tokenService: TokenService = inject(TokenService);
  private readonly apiBaseUrl: string = environment.spendingApiBaseUrl;
  private readonly requestTimeoutMs: number = 20000;

  private api(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.apiBaseUrl}/${cleanPath}`;
  }


  /** Decodes the JWT payload to extract numeric internal user ID without modifying AuthModule. */
  private extractUserIdFromToken(token: string | null): string | null {
    if (!token) return null;
    const payload = token.split('.')[1];
    if (!payload) return null;
    try {
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '==='.slice((base64.length + 3) % 4);
      const claims = JSON.parse(atob(padded)) as Record<string, unknown>;
      const raw = claims['userId'] ?? claims['sub'] ?? claims['uid'] ?? claims['id'];
      return raw != null ? String(raw) : null;
    } catch {
      return null;
    }
  }

  /** Resolves the current user's numeric ID from the JWT token or falls back to the configured default. */
  private getUserId(): string {
    const token = this.tokenService.getAccessToken();
    const fromToken = this.extractUserIdFromToken(token);
    return fromToken && /^\d+$/.test(fromToken) ? fromToken : (environment.defaultUserId || '1');
  }


  /** Safely unwraps { success: true, data: T, correlationId: ... } or returns raw payload. */
  private unwrap<T>(res: unknown): T {
    if (res && typeof res === 'object' && 'data' in (res as Record<string, unknown>)) {
      return (res as { data: T }).data;
    }
    return res as T;
  }

  /** Formats and rethrows backend error messages cleanly. */
  private handleError(error: unknown, defaultMessage: string): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      const serverMsg = error.error?.message || error.error?.detail || error.error?.title;
      if (serverMsg) {
        return throwError(() => new Error(serverMsg));
      }
      if (error.status === 0) {
        return throwError(() => new Error('Cannot connect to Spending backend service. Please check network/backend status.'));
      }
      if (error.status === 401) {
        return throwError(() => new Error('Session expired or unauthorized. Please sign in again.'));
      }
      if (error.status === 403) {
        return throwError(() => new Error('You do not have permission to access spending resources.'));
      }
      if (error.status === 404) {
        return throwError(() => new Error('Spending resource not found on the server.'));
      }
      if (error.status >= 500) {
        return throwError(() => new Error('Spending service encountered an internal error. Please try again later.'));
      }
    }
    const message = (error as Error)?.message || defaultMessage;
    return throwError(() => new Error(message));
  }

  /** GET against the live backend with standard unwrapping and error handling. */
  private backendGet<T>(path: string): Observable<T> {
    return this.http.get<unknown>(this.api(path)).pipe(
      timeout(this.requestTimeoutMs),
      map((res) => this.unwrap<T>(res)),
      catchError((err) => this.handleError(err, `Failed to load ${path}`))
    );
  }

  /** Hides zero-amount/placeholder rows that may be returned. */
  private isDisplayableExpense(e: Expense): boolean {
    return e.amount > 0 || (!!e.merchantName && e.merchantName !== '—' && e.merchantName !== '-');
  }

  /**
   * Fetches all spending dashboard datasets directly from the live OpenAPI Backend:
   * - GET /api/v1/spending/overview?userId={userId}&period=this_month
   * - GET /api/v1/spending/categories?userId={userId}
   * - GET /api/v1/expenses?userId={userId}&size=500
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
    const userId = this.getUserId();

    return forkJoin({
      overview: this.backendGet<SpendingOverviewDto>(`spending/overview?userId=${userId}&period=this_month`),
      categoriesRaw: this.backendGet<CategoryOptionDto[]>(`spending/categories?userId=${userId}`).pipe(
        catchError(() => of([] as CategoryOptionDto[]))
      ),
      expensesPage: this.backendGet<ExpenseListPageDto | ExpenseListItemDto[]>(`expenses?userId=${userId}&size=500`).pipe(
        catchError(() => of({ content: [], page: 0, size: 0, totalElements: 0, totalPages: 0 } as ExpenseListPageDto))
      ),
      tags: of([] as Tag[]),
      recurringExpenses: of([] as RecurringExpense[]),
      alerts: of([] as SpendingAlert[])
    }).pipe(
      map(({ overview, categoriesRaw, expensesPage, tags, recurringExpenses, alerts }) => {
        const categories = this.resolveCategories(overview, categoriesRaw);
        const trendPoints = this.resolveTrends(overview);
        const expenseList = this.extractExpenseList(expensesPage);

        return {
          overview: this.mapOverview(overview),
          categories,
          trendPoints,
          expenses: expenseList
            .map((e) => this.mapExpense(e))
            .filter((e) => this.isDisplayableExpense(e)),
          tags,
          recurringExpenses,
          alerts
        };
      }),
      catchError((err) => this.handleError(err, 'Failed to load spending dashboard data'))
    );
  }

  // GET /spending/dashboard — condensed dashboard payload (overview totals, category breakdown
  // and recent expenses). Exposed typed for single-call summaries; getDashboardData() remains the
  // primary composed feed for the full spending UI.
  getSpendingDashboard(period: string = 'this_month'): Observable<SpendingDashboardDto> {
    const userId = this.getUserId();
    return this.backendGet<SpendingDashboardDto>(`spending/dashboard?userId=${userId}&period=${period}`);
  }

  // --- Expenses CRUD (expense-controller) ---

  getExpenses(): Observable<Expense[]> {
    const userId = this.getUserId();
    return this.backendGet<ExpenseListPageDto | ExpenseListItemDto[]>(`expenses?userId=${userId}&size=500`).pipe(
      map((res) =>
        this.extractExpenseList(res)
          .map((e) => this.mapExpense(e))
          .filter((e) => this.isDisplayableExpense(e))
      ),
      catchError((err) => this.handleError(err, 'Failed to load expenses'))
    );
  }

  createExpense(payload: Partial<Expense>): Observable<Expense> {
    const userId = this.getUserId();
    const reqBody: ExpenseCreateRequestDto = {
      accountId: this.toId(payload.accountId) || 1,
      amount: Number(payload.amount) || 0,
      transactionDate: payload.date || new Date().toISOString().substring(0, 10),
      merchantName: payload.merchantName || 'Expense',
      categoryId: this.toId(payload.categoryId) || 1,
      paymentMethod: payload.paymentMethod || 'DEBIT_CARD',
      notes: payload.notes || payload.merchantName || ''
    };

    return this.http
      .post<unknown>(this.api(`expenses?userId=${userId}`), reqBody)
      .pipe(
        timeout(this.requestTimeoutMs),
        map((raw) => {
          const res = this.unwrap<ExpenseMutationResponseDto>(raw) || {};
          return { ...(payload as Expense), id: String(res.transactionId || res.id || Date.now()) };
        }),
        catchError((err) => this.handleError(err, 'Failed to create expense'))
      );
  }

  updateExpense(id: string, payload: Partial<Expense>): Observable<Expense> {
    const userId = this.getUserId();
    const numericId = this.toId(id) || id;
    const reqBody: ExpenseUpdateRequestDto = {
      accountId: this.toId(payload.accountId) || 1,
      amount: Number(payload.amount) || 0,
      transactionDate: payload.date || new Date().toISOString().substring(0, 10),
      merchantName: payload.merchantName || 'Expense',
      categoryId: this.toId(payload.categoryId) || 1,
      paymentMethod: payload.paymentMethod || 'DEBIT_CARD',
      notes: payload.notes || ''
    };

    return this.http
      .put<unknown>(this.api(`expenses/${numericId}?userId=${userId}`), reqBody)
      .pipe(
        timeout(this.requestTimeoutMs),
        map(() => ({ ...(payload as Expense), id })),
        catchError((err) => this.handleError(err, `Failed to update expense #${id}`))
      );
  }

  deleteExpense(id: string): Observable<void> {
    const userId = this.getUserId();
    const numericId = this.toId(id) || id;
    return this.http
      .delete<void>(this.api(`expenses/${numericId}?userId=${userId}`))
      .pipe(
        timeout(this.requestTimeoutMs),
        catchError((err) => this.handleError(err, `Failed to delete expense #${id}`))
      );
  }

  // --- Tags CRUD ---

  getTags(): Observable<Tag[]> {
    return of([] as Tag[]);
  }

  createTag(tag: Partial<Tag>): Observable<Tag> {
    const newTag: Tag = {
      id: tag.id || `tag-${Date.now()}`,
      name: tag.name || 'New Tag',
      color: tag.color || '#2563EB',
      count: 0
    };
    return of(newTag);
  }

  deleteTag(_id: string): Observable<void> {
    return of(undefined);
  }

  // --- Recurring Expenses CRUD ---

  getRecurringExpenses(): Observable<RecurringExpense[]> {
    return of([] as RecurringExpense[]);
  }

  createRecurringExpense(item: Partial<RecurringExpense>): Observable<RecurringExpense> {
    const newRec: RecurringExpense = {
      id: item.id || `rec-${Date.now()}`,
      name: item.name || 'Recurring Expense',
      merchantName: item.merchantName || item.name || 'Merchant',
      amount: Number(item.amount) || 0,
      categoryName: item.categoryName || 'General',
      frequency: item.frequency || 'MONTHLY',
      billingCycle: item.billingCycle || 'Monthly',
      nextBillingDate: item.nextBillingDate || new Date().toISOString().substring(0, 10),
      accountName: item.accountName || 'Main Account',
      isActive: true,
      icon: item.icon || 'repeat'
    };
    return of(newRec);
  }

  updateRecurringExpense(id: string, item: Partial<RecurringExpense>): Observable<RecurringExpense> {
    return of({ ...(item as RecurringExpense), id });
  }

  deleteRecurringExpense(_id: string): Observable<void> {
    return of(undefined);
  }

  // --- Alerts CRUD ---

  getAlerts(): Observable<SpendingAlert[]> {
    return of([] as SpendingAlert[]);
  }

  updateAlert(id: string, alert: Partial<SpendingAlert>): Observable<SpendingAlert> {
    return of({ ...(alert as SpendingAlert), id });
  }

  deleteAlert(_id: string): Observable<void> {
    return of(undefined);
  }

  // --- Helpers & DTO -> Model Mappers ---

  private extractExpenseList(res: unknown): ExpenseListItemDto[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (typeof res === 'object' && 'content' in (res as Record<string, unknown>)) {
      return (res as ExpenseListPageDto).content || [];
    }
    return [];
  }

  private resolveCategories(overview: SpendingOverviewDto, list: CategoryOptionDto[]): SpendingCategoryItem[] {
    if (overview?.categorySummary && overview.categorySummary.length > 0) {
      return overview.categorySummary.map((s) => {
        const name = s.categoryName || s.name || '';
        const meta = (list || []).find((c) => (c.categoryId === s.categoryId) || (c.categoryName === name));
        const percentage = Number(s.percentage) || 0;
        return {
          id: s.categoryId != null ? String(s.categoryId) : name,
          name,
          amount: Number(s.amount) || 0,
          percentage,
          color: meta?.color || '#3B82F6',
          barWidth: `${percentage}%`,
          icon: meta?.icon,
          budget: CATEGORY_BUDGETS[name] || 500
        };
      });
    }

    if (list && list.length > 0) {
      return list.map((c) => {
        const name = c.categoryName || c.name || '';
        const percentage = Number(c.percentage) || 0;
        return {
          id: c.categoryId != null ? String(c.categoryId) : name,
          name,
          amount: Number(c.amount) || 0,
          percentage,
          color: c.color || '#3B82F6',
          barWidth: `${percentage}%`,
          icon: c.icon,
          budget: CATEGORY_BUDGETS[name] || 500
        };
      });
    }

    return [];
  }

  private resolveTrends(overview: SpendingOverviewDto): SpendingTrendPoint[] {
    if (overview?.trend && overview.trend.length > 0) {
      return overview.trend.map((t) => ({
        xLabel: t.date || '',
        thisMonth: Number(t.amount) || 0,
        lastMonth: 0
      }));
    }
    return [];
  }

  private mapOverview(dto: SpendingOverviewDto): SpendingOverviewData {
    const totalSpending: number = Number(dto?.totalSpending) || 0;
    const budgetTotal: number = Number(dto?.budgetTotal) || 0;
    const budgetUsedPercentage: number = dto?.budgetUsedPercentage != null
      ? Number(dto.budgetUsedPercentage)
      : (budgetTotal > 0 ? Math.min(100, Math.round((totalSpending / budgetTotal) * 100)) : 0);

    const growthPercentage = Number(dto?.comparisonToPrevious?.totalSpendingChangePercent ?? dto?.spendingGrowthPercentage ?? 0);
    const topCategoryName = dto?.topCategory?.categoryName || dto?.topCategory?.name || dto?.topCategoryName || '—';
    const topCategoryAmount = Number(dto?.topCategory?.amount ?? dto?.topCategoryAmount ?? 0);
    const count = dto?.transactionCount ?? dto?.transactionsCount ?? 0;
    const countGrowth = dto?.comparisonToPrevious?.transactionCountChange ?? dto?.transactionsGrowthCount ?? 0;

    return {
      totalSpending,
      spendingGrowthPercentage: growthPercentage,
      transactionsCount: count,
      transactionsGrowthCount: countGrowth,
      averageDaily: Number(dto?.averageDaily) || 0,
      averageDailyGrowthPercentage: 0,
      topCategoryName,
      topCategoryAmount,
      budgetTotal,
      budgetUsedPercentage
    };
  }

  private mapExpense(dto: ExpenseListItemDto): Expense {
    return {
      id: String(dto.transactionId || dto.id || Date.now()),
      amount: Number(dto.amount) || 0,
      date: dto.transactionDate || dto.date || new Date().toISOString().substring(0, 10),
      merchantName: dto.merchantName || dto.merchant || dto.description || dto.categoryName || '—',
      categoryId: dto.categoryId != null ? String(dto.categoryId) : '',
      categoryName: dto.categoryName || dto.category || '',
      accountId: dto.accountId != null ? String(dto.accountId) : '',
      accountName: dto.accountName || '',
      paymentMethod: (dto.paymentMethod as PaymentMethod) || 'DEBIT_CARD',
      notes: dto.notes || dto.description || '',
      status: this.mapStatus(dto.status),
      createdAt: dto.createdAt || dto.transactionDate || dto.date || new Date().toISOString()
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
    const name = dto.name || dto.merchantName || dto.merchant || 'Recurring Expense';
    return {
      id: dto.id || (dto.recurringId != null ? `rec-${dto.recurringId}` : ''),
      name,
      merchantName: dto.merchantName || dto.merchant || name,
      amount: Number(dto.expectedAmount ?? dto.amount ?? 0),
      categoryName: dto.categoryName || 'General',
      frequency: this.mapFrequency(dto.frequency),
      billingCycle: dto.billingCycle || 'Monthly',
      nextBillingDate: dto.nextDueDate || dto.nextBillingDate || '',
      accountName: dto.accountName || 'Main Checking',
      isActive: dto.isActive !== false && dto.status !== 'INACTIVE' && dto.status !== 'CANCELLED',
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
    const sev = (dto.severity || 'info').toLowerCase();
    const severityMap: Record<string, 'warning' | 'info' | 'success' | 'danger'> = {
      warning: 'warning',
      info: 'info',
      success: 'success',
      danger: 'danger',
      critical: 'danger'
    };
    return {
      id: dto.id || (dto.alertId != null ? `alt-${dto.alertId}` : ''),
      title: dto.title || 'Spending Alert',
      message: dto.message || '',
      severity: severityMap[sev] || 'info',
      date: dto.createdAt ? dto.createdAt.substring(0, 10) : (dto.date || new Date().toISOString().substring(0, 10)),
      isRead: dto.isRead === true || dto.status === 'READ'
    };
  }

  private mapStatus(status: string | undefined): ExpenseStatus {
    return status === 'PENDING' ? 'PENDING' : 'CLEARED';
  }

  /** Extracts a numeric id from values like "acc-2" or "cat-3" or "tag-5" or plain numbers. */
  private toId(value: string | number | undefined): number {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    const digits = String(value).replace(/\D/g, '');
    return digits ? Number(digits) : 0;
  }
}
