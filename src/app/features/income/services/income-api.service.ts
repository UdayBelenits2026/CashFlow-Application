import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, throwError, timeout, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TokenService } from '../../../core/auth/services/token.service';
import { IncomeOverviewData, IncomeTrendPoint } from '../models/income-summary.model';
import { IncomeSource, IncomeSourceType, IncomeFrequency, IncomeSourceStatus } from '../models/income-source.model';
import { Income, IncomeTransactionStatus } from '../models/income.model';
import { RecurringIncome, RecurringIncomeStatus } from '../models/recurring-income.model';
import { AccountRef } from '../models/account-ref.model';
import {
  IncomeOverviewDto,
  IncomeSourceDto,
  IncomeListItemDto,
  IncomePageDto,
  IncomeTrendPointDto,
  RecurringIncomeDto,
  AccountRefDto
} from '../models/income-api.dto';

const SOURCE_TYPES: IncomeSourceType[] = ['Salary', 'Freelance', 'Business', 'Rental', 'Investment', 'Dividend', 'Pension', 'Royalty', 'Other'];
const FREQUENCIES: IncomeFrequency[] = ['WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'IRREGULAR'];
const ACCOUNT_TYPES: AccountRef['type'][] = ['CHECKING', 'SAVINGS', 'INVESTMENT', 'CREDIT_CARD', 'OTHER'];

@Injectable({
  providedIn: 'root'
})
export class IncomeApiService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly tokenService: TokenService = inject(TokenService);
  private readonly apiBaseUrl: string = environment.incomeApiBaseUrl;
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

  /** Resolves the current user's numeric ID from TokenService or configured default. */
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
        return throwError(() => new Error('Cannot connect to Income backend service. Please check your network or server status.'));
      }
      if (error.status === 401) {
        return throwError(() => new Error('Session expired or unauthorized. Please sign in again.'));
      }
      if (error.status === 403) {
        return throwError(() => new Error('You do not have permission to access income resources.'));
      }
      if (error.status === 404) {
        return throwError(() => new Error('Income resource not found.'));
      }
      if (error.status >= 500) {
        return throwError(() => new Error('Income service encountered an internal error. Please try again later.'));
      }
    }
    const message = (error as Error)?.message || defaultMessage;
    return throwError(() => new Error(message));
  }

  /** GET against the live backend with automatic response unwrapping, timeout, and error handling. */
  private backendGet<T>(path: string): Observable<T> {
    return this.http.get<unknown>(this.api(path)).pipe(
      timeout(this.requestTimeoutMs),
      map((res) => this.unwrap<T>(res)),
      catchError((err) => this.handleError(err, `Failed to load ${path}`))
    );
  }

  // Backend transaction ids are numeric; the UI uses string ids like 'acc-1' / 'src-1'.
  private toNumericId(id: string | number | undefined): number | null {
    if (id == null) return null;
    if (typeof id === 'number') return id;
    const digits = String(id).replace(/\D/g, '');
    return digits ? Number(digits) : null;
  }

  // Maps a source model to the backend specification request body.
  private toSourceRequest(source: Partial<IncomeSource>): {
    sourceName: string;
    sourceDescription: string;
    sourceType: string;
    taxable: boolean;
    recurring: boolean;
    status: string;
  } {
    return {
      sourceName: source.name || '',
      sourceDescription: source.description || '',
      sourceType: this.toBackendSourceType(source.type),
      taxable: source.taxable ?? false,
      recurring: source.isRecurring ?? false,
      status: source.status || 'ACTIVE'
    };
  }

  // Maps an income model to the backend specification request body.
  private toTransactionRequest(income: Partial<Income>): {
    accountId: number;
    incomeSourceId: number;
    amount: number;
    incomeDate: string;
    description: string;
    taxable: boolean;
  } {
    return {
      accountId: this.toNumericId(income.accountId) || 1,
      incomeSourceId: this.toNumericId(income.incomeSourceId) || 1,
      amount: Number(income.amount) || 0,
      incomeDate: income.date || new Date().toISOString().substring(0, 10),
      description: income.description || income.sourceName || 'Income',
      taxable: income.taxable ?? true
    };
  }

  // Maps a recurring income model to the backend specification request body.
  private toRecurringRequest(item: Partial<RecurringIncome>): {
    accountId: number;
    incomeSourceId: number;
    expectedAmount: number;
    frequency: string;
    startDate: string;
    nextDueDate: string;
    status: string;
  } {
    const today = new Date().toISOString().substring(0, 10);
    return {
      accountId: this.toNumericId(item.accountId) || 1,
      incomeSourceId: this.toNumericId(item.incomeSourceId) || 1,
      expectedAmount: Number(item.expectedAmount) || 0,
      frequency: item.frequency || 'MONTHLY',
      startDate: item.startDate || today,
      nextDueDate: item.nextIncomeDate || item.startDate || today,
      status: item.status || 'ACTIVE'
    };
  }

  /**
   * Fetches all core income datasets directly from the live Backend.
   */
  getDashboardData(): Observable<{
    overview: IncomeOverviewData;
    sources: IncomeSource[];
    trendPoints: IncomeTrendPoint[];
    incomes: Income[];
    recurringIncomes: RecurringIncome[];
    accounts: AccountRef[];
  }> {
    const userId = this.getUserId();

    return forkJoin({
      overview: this.backendGet<IncomeOverviewDto>(`income/overview?userId=${userId}`),
      sources: this.backendGet<IncomeSourceDto[]>(`income/sources?status=ACTIVE&page=0&size=50&userId=${userId}`).pipe(
        catchError(() => of([] as IncomeSourceDto[]))
      ),
      trendPoints: this.backendGet<IncomeTrendPointDto[]>(`income/trends?userId=${userId}`).pipe(
        catchError(() => of([] as IncomeTrendPointDto[]))
      ),
      incomesRaw: this.backendGet<IncomePageDto | IncomeListItemDto[]>(`income/history?page=0&size=500&userId=${userId}`).pipe(
        catchError(() => of({ content: [], page: 0, size: 0, totalElements: 0, totalPages: 0 } as IncomePageDto))
      ),
      recurringIncomes: this.backendGet<RecurringIncomeDto[]>(`income/recurring?userId=${userId}`).pipe(
        catchError(() => of([] as RecurringIncomeDto[]))
      ),
      accounts: this.backendGet<AccountRefDto[]>(`accounts?userId=${userId}`).pipe(
        catchError(() => of([] as AccountRefDto[]))
      )
    }).pipe(
      map(({ overview, sources, trendPoints, incomesRaw, recurringIncomes, accounts }) => ({
        overview: this.mapOverview(overview),
        sources: (sources || []).map((s) => this.mapSource(s)),
        trendPoints: (trendPoints || []).map((t) => this.mapTrend(t)),
        incomes: this.extractIncomeList(incomesRaw).map((i) => this.mapIncome(i)),
        recurringIncomes: (recurringIncomes || []).map((r) => this.mapRecurring(r)),
        accounts: (accounts || []).map((a) => this.mapAccount(a))
      })),
      catchError((err) => this.handleError(err, 'Failed to load income dashboard data'))
    );
  }

  // --- Incomes (Recorded Transactions) CRUD ---

  getIncomes(): Observable<Income[]> {
    const userId = this.getUserId();
    return this.backendGet<IncomePageDto | IncomeListItemDto[]>(`income/history?page=0&size=500&userId=${userId}`).pipe(
      map((res) => this.extractIncomeList(res).map((i) => this.mapIncome(i))),
      catchError((err) => this.handleError(err, 'Failed to load recorded incomes'))
    );
  }

  createIncome(payload: Partial<Income>): Observable<Income> {
    const userId = this.getUserId();
    const reqBody = this.toTransactionRequest(payload);
    return this.http.post<unknown>(this.api(`income?userId=${userId}`), reqBody).pipe(
      timeout(this.requestTimeoutMs),
      map((res) => this.mapIncome({ ...(payload as IncomeListItemDto), ...this.unwrap<IncomeListItemDto>(res) })),
      catchError((err) => this.handleError(err, 'Failed to record income'))
    );
  }

  updateIncome(id: string, payload: Partial<Income>): Observable<Income> {
    const userId = this.getUserId();
    const numericId = this.toNumericId(id) || id;
    const reqBody = this.toTransactionRequest(payload);
    return this.http.put<unknown>(this.api(`income/${numericId}?userId=${userId}`), reqBody).pipe(
      timeout(this.requestTimeoutMs),
      map((res) => this.mapIncome({ ...(payload as IncomeListItemDto), ...this.unwrap<IncomeListItemDto>(res), id })),
      catchError((err) => this.handleError(err, `Failed to update income transaction #${id}`))
    );
  }

  deleteIncome(_accountId: string, id: string): Observable<void> {
    const userId = this.getUserId();
    const numericId = this.toNumericId(id) || id;
    return this.http.delete<void>(this.api(`income/${numericId}?userId=${userId}`)).pipe(
      timeout(this.requestTimeoutMs),
      catchError((err) => this.handleError(err, `Failed to delete income transaction #${id}`))
    );
  }

  // --- Income Sources CRUD ---

  getSources(): Observable<IncomeSource[]> {
    const userId = this.getUserId();
    return this.backendGet<IncomeSourceDto[]>(`income/sources?status=ACTIVE&page=0&size=50&userId=${userId}`).pipe(
      map((list) => (list || []).map((s) => this.mapSource(s))),
      catchError((err) => this.handleError(err, 'Failed to load income sources'))
    );
  }

  createSource(source: Partial<IncomeSource>): Observable<IncomeSource> {
    const userId = this.getUserId();
    const reqBody = this.toSourceRequest(source);
    return this.http.post<unknown>(this.api(`income/sources?userId=${userId}`), reqBody).pipe(
      timeout(this.requestTimeoutMs),
      map((res) => this.mapSource(this.unwrap<IncomeSourceDto>(res))),
      catchError((err) => this.handleError(err, 'Failed to create income source'))
    );
  }

  updateSource(id: string, source: Partial<IncomeSource>): Observable<IncomeSource> {
    const userId = this.getUserId();
    const numericId = this.toNumericId(id) || id;
    const reqBody = this.toSourceRequest(source);
    return this.http.put<unknown>(this.api(`income/sources/${numericId}?userId=${userId}`), reqBody).pipe(
      timeout(this.requestTimeoutMs),
      map((res) => this.mapSource(this.unwrap<IncomeSourceDto>(res))),
      catchError((err) => this.handleError(err, `Failed to update income source #${id}`))
    );
  }

  patchSourceStatus(id: string, status: IncomeSourceStatus): Observable<IncomeSource> {
    const userId = this.getUserId();
    const numericId = this.toNumericId(id) || id;
    return this.http.patch<unknown>(this.api(`income/sources/${numericId}/status?userId=${userId}`), { status }).pipe(
      timeout(this.requestTimeoutMs),
      map((res) => this.mapSource(this.unwrap<IncomeSourceDto>(res))),
      catchError((err) => this.handleError(err, `Failed to update source status for #${id}`))
    );
  }

  deleteSource(id: string): Observable<void> {
    const userId = this.getUserId();
    const numericId = this.toNumericId(id) || id;
    return this.http.delete<void>(this.api(`income/sources/${numericId}?userId=${userId}`)).pipe(
      timeout(this.requestTimeoutMs),
      catchError((err) => this.handleError(err, `Failed to delete income source #${id}`))
    );
  }

  // --- Recurring Income Schedules CRUD ---

  getRecurringIncomes(): Observable<RecurringIncome[]> {
    const userId = this.getUserId();
    return this.backendGet<RecurringIncomeDto[]>(`income/recurring?userId=${userId}`).pipe(
      map((list) => (list || []).map((r) => this.mapRecurring(r))),
      catchError((err) => this.handleError(err, 'Failed to load recurring incomes'))
    );
  }

  createRecurringIncome(item: Partial<RecurringIncome>): Observable<RecurringIncome> {
    const userId = this.getUserId();
    const reqBody = this.toRecurringRequest(item);
    return this.http.post<unknown>(this.api(`income/recurring?userId=${userId}`), reqBody).pipe(
      timeout(this.requestTimeoutMs),
      map((res) => this.mapRecurring(this.unwrap<RecurringIncomeDto>(res) || (item as RecurringIncomeDto))),
      catchError((err) => this.handleError(err, 'Failed to create recurring income schedule'))
    );
  }

  updateRecurringIncome(id: string, item: Partial<RecurringIncome>): Observable<RecurringIncome> {
    const userId = this.getUserId();
    const numericId = this.toNumericId(id) || id;
    const reqBody = this.toRecurringRequest(item);
    return this.http.put<unknown>(this.api(`income/recurring/${numericId}?userId=${userId}`), reqBody).pipe(
      timeout(this.requestTimeoutMs),
      map((res) => this.mapRecurring(this.unwrap<RecurringIncomeDto>(res) || (item as RecurringIncomeDto), id)),
      catchError((err) => this.handleError(err, `Failed to update recurring income schedule #${id}`))
    );
  }

  patchRecurringStatus(id: string, status: RecurringIncomeStatus): Observable<RecurringIncome> {
    const userId = this.getUserId();
    const numericId = this.toNumericId(id) || id;
    return this.http.patch<unknown>(this.api(`income/recurring/${numericId}/status?userId=${userId}`), { status }).pipe(
      timeout(this.requestTimeoutMs),
      map((res) => this.mapRecurring(this.unwrap<RecurringIncomeDto>(res))),
      catchError((err) => this.handleError(err, `Failed to update status for recurring income #${id}`))
    );
  }

  deleteRecurringIncome(id: string): Observable<void> {
    const userId = this.getUserId();
    const numericId = this.toNumericId(id) || id;
    return this.http.delete<void>(this.api(`income/recurring/${numericId}?userId=${userId}`)).pipe(
      timeout(this.requestTimeoutMs),
      catchError((err) => this.handleError(err, `Failed to delete recurring income schedule #${id}`))
    );
  }

  // --- Accounts Reference ---

  getAccounts(): Observable<AccountRef[]> {
    const userId = this.getUserId();
    return this.backendGet<AccountRefDto[]>(`accounts?userId=${userId}`).pipe(
      map((list) => (list || []).map((a) => this.mapAccount(a))),
      catchError(() => of([] as AccountRef[]))
    );
  }

  // --- Helper & DTO -> Model Mappers ---

  private extractIncomeList(res: unknown): IncomeListItemDto[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (typeof res === 'object' && 'content' in (res as Record<string, unknown>)) {
      return (res as IncomePageDto).content || [];
    }
    return [];
  }

  private mapOverview(dto: IncomeOverviewDto): IncomeOverviewData {
    const topName = dto?.topSource?.sourceName || dto?.topSource?.name || dto?.topSourceName || '—';
    const topAmt = Number(dto?.topSource?.amount ?? dto?.topSourceAmount ?? 0);
    const topPct = Number(dto?.topSource?.percentage ?? dto?.topSourcePercentage ?? 0);

    return {
      totalIncome: Number(dto?.totalIncome) || 0,
      incomeGrowthPercentage: Number(dto?.incomeGrowthPercentage) || 0,
      receiptsCount: Number(dto?.receiptsCount) || 0,
      receiptsGrowthCount: Number(dto?.receiptsGrowthCount) || 0,
      averageMonthly: Number(dto?.averageMonthly) || 0,
      averageMonthlyGrowthPercentage: Number(dto?.averageMonthlyGrowthPercentage) || 0,
      topSourceName: topName,
      topSourceAmount: topAmt,
      topSourcePercentage: topPct,
      activeSourcesCount: Number(dto?.activeSourcesCount) || 0,
      taxableIncome: Number(dto?.taxableIncome) || 0,
      totalRecurringExpected: Number(dto?.recurringIncome ?? dto?.totalRecurringExpected ?? 0)
    };
  }

  private mapSource(dto: IncomeSourceDto): IncomeSource {
    const name = dto.sourceName || dto.name || '';
    const id = dto.incomeSourceId != null ? String(dto.incomeSourceId) : (dto.sourceId != null ? `src-${dto.sourceId}` : (dto.id || ''));
    return {
      id,
      name,
      type: this.toSourceType(dto.sourceType || dto.type),
      description: dto.sourceDescription || dto.description,
      color: dto.color || '#2563EB',
      icon: dto.icon,
      taxable: dto.taxable === true,
      isRecurring: (dto.recurring ?? dto.isRecurring) === true,
      expectedAmount: dto.expectedAmount != null ? Number(dto.expectedAmount) : undefined,
      frequency: this.toFrequency(dto.frequency),
      status: dto.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      accountId: dto.accountId,
      accountName: dto.accountName,
      totalReceivedYtd: dto.totalReceivedYtd != null ? Number(dto.totalReceivedYtd) : undefined,
      lastReceivedDate: dto.lastReceivedDate ?? null,
      nextExpectedDate: dto.nextExpectedDate ?? null,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt
    };
  }

  private mapIncome(dto: IncomeListItemDto): Income {
    const date = dto.incomeDate || dto.transactionDate || dto.date || new Date().toISOString().substring(0, 10);
    return {
      id: String(dto.transactionId ?? dto.incomeId ?? dto.id ?? Date.now()),
      userId: dto.userId,
      accountId: dto.accountId ? String(dto.accountId) : '',
      accountName: dto.accountName || '',
      incomeSourceId: dto.incomeSourceId ? String(dto.incomeSourceId) : '',
      sourceName: dto.sourceName || '',
      sourceType: this.toSourceType(dto.sourceType),
      sourceColor: dto.sourceColor,
      amount: Number(dto.amount) || 0,
      date,
      description: dto.description || '',
      notes: dto.notes,
      paymentMethod: dto.paymentMethod,
      taxable: dto.taxable === true,
      isRecurring: dto.isRecurring === true,
      status: this.toIncomeStatus(dto.status),
      receiptUrl: dto.receiptUrl,
      receiptFileName: dto.receiptFileName,
      createdAt: dto.createdAt || date,
      updatedAt: dto.updatedAt
    };
  }

  private mapTrend(dto: IncomeTrendPointDto): IncomeTrendPoint {
    return {
      xLabel: dto.xLabel || dto.period || dto.date || '',
      thisPeriod: Number(dto.thisPeriod ?? dto.amount ?? 0),
      lastPeriod: Number(dto.lastPeriod) || 0,
      projected: dto.projected != null ? Number(dto.projected) : undefined
    };
  }

  private mapRecurring(dto: RecurringIncomeDto, fallbackId?: string): RecurringIncome {
    const nextDate = dto.nextDueDate || dto.nextIncomeDate || null;
    return {
      id: dto.id || (dto.recurringId != null ? `rec-${dto.recurringId}` : (fallbackId || '')),
      userId: dto.userId,
      incomeSourceId: dto.incomeSourceId ? String(dto.incomeSourceId) : '',
      sourceName: dto.sourceName || '',
      sourceType: this.toSourceType(dto.sourceType),
      sourceColor: dto.sourceColor,
      accountId: dto.accountId ? String(dto.accountId) : '',
      accountName: dto.accountName || '',
      expectedAmount: Number(dto.expectedAmount) || 0,
      frequency: this.toFrequency(dto.frequency),
      startDate: dto.startDate || '',
      nextIncomeDate: nextDate,
      endDate: dto.endDate ?? null,
      status: this.toRecurringStatus(dto.status),
      lastRecordedDate: dto.lastRecordedDate ?? null,
      notes: dto.notes,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt
    };
  }

  private mapAccount(dto: AccountRefDto): AccountRef {
    return {
      id: dto.id || (dto.accountId != null ? `acc-${dto.accountId}` : ''),
      name: dto.name || '',
      type: ACCOUNT_TYPES.includes(dto.type as AccountRef['type']) ? (dto.type as AccountRef['type']) : 'OTHER',
      accountNumberLast4: dto.accountNumberLast4 || '',
      balance: Number(dto.balance) || 0,
      isActive: dto.isActive !== false
    };
  }

  private toSourceType(value: string | undefined): IncomeSourceType {
    if (!value) return 'Other';
    if (SOURCE_TYPES.includes(value as IncomeSourceType)) return value as IncomeSourceType;
    const map: Record<string, IncomeSourceType> = {
      SALARY: 'Salary',
      FREELANCE: 'Freelance',
      BUSINESS: 'Business',
      INVESTMENT: 'Investment',
      RENTAL: 'Rental',
      DIVIDEND: 'Dividend',
      PENSION: 'Pension',
      ROYALTY: 'Royalty'
    };
    return map[value.toUpperCase()] ?? 'Other';
  }

  private toBackendSourceType(value: string | undefined): string {
    const backend = ['SALARY', 'FREELANCE', 'BUSINESS', 'INVESTMENT', 'RENTAL', 'DIVIDEND', 'PENSION', 'ROYALTY', 'OTHER'];
    const upper = (value || '').toUpperCase();
    return backend.includes(upper) ? upper : 'OTHER';
  }

  private toFrequency(value: string | undefined): IncomeFrequency {
    return FREQUENCIES.includes(value as IncomeFrequency) ? (value as IncomeFrequency) : 'MONTHLY';
  }

  private toIncomeStatus(value: string | undefined): IncomeTransactionStatus {
    return value === 'POSTED' || value === 'PENDING' || value === 'CLEARED' || value === 'CANCELLED' ? value : 'RECORDED';
  }

  private toRecurringStatus(value: string | undefined): RecurringIncomeStatus {
    return value === 'PAUSED' || value === 'COMPLETED' || value === 'CANCELLED' ? value : 'ACTIVE';
  }
}
