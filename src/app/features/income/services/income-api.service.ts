import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, catchError, throwError, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IncomeOverviewData, IncomeTrendPoint } from '../models/income-summary.model';
import { IncomeSource, IncomeSourceType, IncomeFrequency, IncomeSourceStatus } from '../models/income-source.model';
import { Income, IncomeTransactionStatus } from '../models/income.model';
import { RecurringIncome, RecurringIncomeStatus } from '../models/recurring-income.model';
import { AccountRef } from '../models/account-ref.model';
import {
  IncomeOverviewDto,
  IncomeSourceDto,
  IncomeListItemDto,
  IncomeTrendPointDto,
  RecurringIncomeDto,
  AccountRefDto
} from '../models/income-api.dto';

const SOURCE_TYPES: IncomeSourceType[] = ['Salary', 'Freelance', 'Business', 'Rental', 'Investment', 'Dividend', 'Interest', 'Gift', 'Refund', 'Other'];
const FREQUENCIES: IncomeFrequency[] = ['WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY', 'IRREGULAR'];
const ACCOUNT_TYPES: AccountRef['type'][] = ['CHECKING', 'SAVINGS', 'INVESTMENT', 'CREDIT_CARD', 'OTHER'];

@Injectable({
  providedIn: 'root'
})
export class IncomeApiService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly apiBaseUrl: string = environment.incomeApiBaseUrl;
  private readonly mockBaseUrl: string = environment.incomeMockBaseUrl;
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
      : throwError(() => new Error('Income backend request failed and mock fallback is disabled.'));
  }

  /**
   * Fetches all core income datasets. Tries the live backend first, then falls back to json-server.
   */
  getDashboardData(): Observable<{
    overview: IncomeOverviewData;
    sources: IncomeSource[];
    trendPoints: IncomeTrendPoint[];
    incomes: Income[];
    recurringIncomes: RecurringIncome[];
    accounts: AccountRef[];
  }> {
    return forkJoin({
      overview: this.backendGet<IncomeOverviewDto>('income-overview').pipe(
        catchError(() => this.mockOrRethrow(() => this.http.get<IncomeOverviewDto>(this.mock('income-overview')).pipe(catchError(() => of({} as IncomeOverviewDto)))))
      ),
      sources: this.backendGet<IncomeSourceDto[]>('income-sources').pipe(
        catchError(() => this.mockOrRethrow(() => this.http.get<IncomeSourceDto[]>(this.mock('income-sources')).pipe(catchError(() => of([] as IncomeSourceDto[])))))
      ),
      trendPoints: this.backendGet<IncomeTrendPointDto[]>('income-trend-points').pipe(
        catchError(() => this.mockOrRethrow(() => this.http.get<IncomeTrendPointDto[]>(this.mock('income-trend-points')).pipe(catchError(() => of([] as IncomeTrendPointDto[])))))
      ),
      incomes: this.backendGet<IncomeListItemDto[]>('incomes').pipe(
        catchError(() => this.mockOrRethrow(() => this.http.get<IncomeListItemDto[]>(this.mock('incomes')).pipe(catchError(() => of([] as IncomeListItemDto[])))))
      ),
      recurringIncomes: this.backendGet<RecurringIncomeDto[]>('recurring-income').pipe(
        catchError(() => this.mockOrRethrow(() => this.http.get<RecurringIncomeDto[]>(this.mock('recurring-income')).pipe(catchError(() => of([] as RecurringIncomeDto[])))))
      ),
      accounts: this.backendGet<AccountRefDto[]>('accounts').pipe(
        catchError(() => this.mockOrRethrow(() => this.http.get<AccountRefDto[]>(this.mock('accounts')).pipe(catchError(() => of([] as AccountRefDto[])))))
      )
    }).pipe(
      map((data) => ({
        overview: this.mapOverview(data.overview),
        sources: (data.sources || []).map((s) => this.mapSource(s)),
        trendPoints: (data.trendPoints || []).map((t) => this.mapTrend(t)),
        incomes: (data.incomes || []).map((i) => this.mapIncome(i)),
        recurringIncomes: (data.recurringIncomes || []).map((r) => this.mapRecurring(r)),
        accounts: (data.accounts || []).map((a) => this.mapAccount(a))
      }))
    );
  }

  // --- Incomes (Recorded Transactions) CRUD ---

  getIncomes(): Observable<Income[]> {
    return this.backendGet<IncomeListItemDto[]>('incomes').pipe(
      map((list) => (list || []).map((i) => this.mapIncome(i))),
      catchError(() =>
        this.mockOrRethrow(() =>
          this.http.get<IncomeListItemDto[]>(this.mock('incomes')).pipe(map((list) => (list || []).map((i) => this.mapIncome(i))))
        )
      )
    );
  }

  createIncome(payload: Partial<Income>): Observable<Income> {
    return this.http.post<IncomeListItemDto>(this.api('incomes'), payload).pipe(
      map((res) => this.mapIncome({ ...(payload as IncomeListItemDto), ...res })),
      catchError(() =>
        this.mockOrRethrow(() =>
          this.http.post<IncomeListItemDto>(this.mock('incomes'), payload).pipe(map((res) => this.mapIncome({ ...(payload as IncomeListItemDto), ...res })))
        )
      )
    );
  }

  updateIncome(id: string, payload: Partial<Income>): Observable<Income> {
    return this.http.put<IncomeListItemDto>(this.api(`incomes/${id}`), payload).pipe(
      map((res) => this.mapIncome({ ...(payload as IncomeListItemDto), ...res, id })),
      catchError(() =>
        this.mockOrRethrow(() =>
          this.http.put<IncomeListItemDto>(this.mock(`incomes/${id}`), payload).pipe(map((res) => this.mapIncome({ ...(payload as IncomeListItemDto), ...res, id })))
        )
      )
    );
  }

  deleteIncome(id: string): Observable<void> {
    return this.http.delete<void>(this.api(`incomes/${id}`)).pipe(
      catchError(() => this.mockOrRethrow(() => this.http.delete<void>(this.mock(`incomes/${id}`))))
    );
  }

  // --- Income Sources CRUD ---

  getSources(): Observable<IncomeSource[]> {
    return this.backendGet<IncomeSourceDto[]>('income-sources').pipe(
      map((list) => (list || []).map((s) => this.mapSource(s))),
      catchError(() =>
        this.mockOrRethrow(() =>
          this.http.get<IncomeSourceDto[]>(this.mock('income-sources')).pipe(map((list) => (list || []).map((s) => this.mapSource(s))))
        )
      )
    );
  }

  createSource(source: Partial<IncomeSource>): Observable<IncomeSource> {
    return this.http.post<IncomeSourceDto>(this.api('income-sources'), source).pipe(
      map((res) => this.mapSource({ ...(source as IncomeSourceDto), ...res })),
      catchError(() =>
        this.mockOrRethrow(() =>
          this.http.post<IncomeSourceDto>(this.mock('income-sources'), source).pipe(map((res) => this.mapSource({ ...(source as IncomeSourceDto), ...res })))
        )
      )
    );
  }

  updateSource(id: string, source: Partial<IncomeSource>): Observable<IncomeSource> {
    return this.http.put<IncomeSourceDto>(this.api(`income-sources/${id}`), source).pipe(
      map((res) => this.mapSource({ ...(source as IncomeSourceDto), ...res, id })),
      catchError(() =>
        this.mockOrRethrow(() =>
          this.http.put<IncomeSourceDto>(this.mock(`income-sources/${id}`), source).pipe(map((res) => this.mapSource({ ...(source as IncomeSourceDto), ...res, id })))
        )
      )
    );
  }

  patchSourceStatus(id: string, status: IncomeSourceStatus): Observable<IncomeSource> {
    return this.http.patch<IncomeSourceDto>(this.api(`income-sources/${id}`), { status }).pipe(
      map((res) => this.mapSource(res)),
      catchError(() =>
        this.mockOrRethrow(() =>
          this.http.patch<IncomeSourceDto>(this.mock(`income-sources/${id}`), { status }).pipe(map((res) => this.mapSource(res)))
        )
      )
    );
  }

  deleteSource(id: string): Observable<void> {
    return this.http.delete<void>(this.api(`income-sources/${id}`)).pipe(
      catchError(() => this.mockOrRethrow(() => this.http.delete<void>(this.mock(`income-sources/${id}`))))
    );
  }

  // --- Recurring Income Schedules CRUD ---

  getRecurringIncomes(): Observable<RecurringIncome[]> {
    return this.backendGet<RecurringIncomeDto[]>('recurring-income').pipe(
      map((list) => (list || []).map((r) => this.mapRecurring(r))),
      catchError(() =>
        this.mockOrRethrow(() =>
          this.http.get<RecurringIncomeDto[]>(this.mock('recurring-income')).pipe(map((list) => (list || []).map((r) => this.mapRecurring(r))))
        )
      )
    );
  }

  createRecurringIncome(item: Partial<RecurringIncome>): Observable<RecurringIncome> {
    return this.http.post<RecurringIncomeDto>(this.api('recurring-income'), item).pipe(
      map((res) => this.mapRecurring({ ...(item as RecurringIncomeDto), ...res })),
      catchError(() =>
        this.mockOrRethrow(() =>
          this.http.post<RecurringIncomeDto>(this.mock('recurring-income'), item).pipe(map((res) => this.mapRecurring({ ...(item as RecurringIncomeDto), ...res })))
        )
      )
    );
  }

  updateRecurringIncome(id: string, item: Partial<RecurringIncome>): Observable<RecurringIncome> {
    return this.http.put<RecurringIncomeDto>(this.api(`recurring-income/${id}`), item).pipe(
      map((res) => this.mapRecurring({ ...(item as RecurringIncomeDto), ...res, id })),
      catchError(() =>
        this.mockOrRethrow(() =>
          this.http.put<RecurringIncomeDto>(this.mock(`recurring-income/${id}`), item).pipe(map((res) => this.mapRecurring({ ...(item as RecurringIncomeDto), ...res, id })))
        )
      )
    );
  }

  patchRecurringStatus(id: string, status: RecurringIncomeStatus): Observable<RecurringIncome> {
    return this.http.patch<RecurringIncomeDto>(this.api(`recurring-income/${id}`), { status }).pipe(
      map((res) => this.mapRecurring(res)),
      catchError(() =>
        this.mockOrRethrow(() =>
          this.http.patch<RecurringIncomeDto>(this.mock(`recurring-income/${id}`), { status }).pipe(map((res) => this.mapRecurring(res)))
        )
      )
    );
  }

  deleteRecurringIncome(id: string): Observable<void> {
    return this.http.delete<void>(this.api(`recurring-income/${id}`)).pipe(
      catchError(() => this.mockOrRethrow(() => this.http.delete<void>(this.mock(`recurring-income/${id}`))))
    );
  }

  // --- Accounts Reference ---

  getAccounts(): Observable<AccountRef[]> {
    return this.backendGet<AccountRefDto[]>('accounts').pipe(
      map((list) => (list || []).map((a) => this.mapAccount(a))),
      catchError(() =>
        this.mockOrRethrow(() =>
          this.http.get<AccountRefDto[]>(this.mock('accounts')).pipe(map((list) => (list || []).map((a) => this.mapAccount(a))))
        )
      )
    );
  }

  // --- DTO -> model mappers ---

  private mapOverview(dto: IncomeOverviewDto): IncomeOverviewData {
    return {
      totalIncome: Number(dto.totalIncome) || 0,
      incomeGrowthPercentage: Number(dto.incomeGrowthPercentage) || 0,
      receiptsCount: Number(dto.receiptsCount) || 0,
      receiptsGrowthCount: Number(dto.receiptsGrowthCount) || 0,
      averageMonthly: Number(dto.averageMonthly) || 0,
      averageMonthlyGrowthPercentage: Number(dto.averageMonthlyGrowthPercentage) || 0,
      topSourceName: dto.topSourceName || '—',
      topSourceAmount: Number(dto.topSourceAmount) || 0,
      topSourcePercentage: Number(dto.topSourcePercentage) || 0,
      activeSourcesCount: Number(dto.activeSourcesCount) || 0,
      taxableIncome: Number(dto.taxableIncome) || 0,
      totalRecurringExpected: Number(dto.totalRecurringExpected) || 0
    };
  }

  private mapSource(dto: IncomeSourceDto): IncomeSource {
    return {
      id: dto.id || (dto.sourceId != null ? `src-${dto.sourceId}` : ''),
      name: dto.name || '',
      type: this.toSourceType(dto.type),
      description: dto.description,
      color: dto.color || '#2563EB',
      icon: dto.icon,
      taxable: dto.taxable === true,
      isRecurring: dto.isRecurring === true,
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
    return {
      id: String(dto.incomeId || dto.id || Date.now()),
      userId: dto.userId,
      accountId: dto.accountId || '',
      accountName: dto.accountName || '',
      incomeSourceId: dto.incomeSourceId || '',
      sourceName: dto.sourceName || '',
      sourceType: this.toSourceType(dto.sourceType),
      sourceColor: dto.sourceColor,
      amount: Number(dto.amount) || 0,
      date: dto.date || new Date().toISOString().substring(0, 10),
      description: dto.description || '',
      notes: dto.notes,
      taxable: dto.taxable === true,
      isRecurring: dto.isRecurring === true,
      status: this.toIncomeStatus(dto.status),
      receiptUrl: dto.receiptUrl,
      receiptFileName: dto.receiptFileName,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt
    };
  }

  private mapTrend(dto: IncomeTrendPointDto): IncomeTrendPoint {
    return {
      xLabel: dto.xLabel || '',
      thisPeriod: Number(dto.thisPeriod) || 0,
      lastPeriod: Number(dto.lastPeriod) || 0,
      projected: dto.projected != null ? Number(dto.projected) : undefined
    };
  }

  private mapRecurring(dto: RecurringIncomeDto): RecurringIncome {
    return {
      id: dto.id || (dto.recurringId != null ? `rec-${dto.recurringId}` : ''),
      userId: dto.userId,
      incomeSourceId: dto.incomeSourceId || '',
      sourceName: dto.sourceName || '',
      sourceType: this.toSourceType(dto.sourceType),
      sourceColor: dto.sourceColor,
      accountId: dto.accountId || '',
      accountName: dto.accountName || '',
      expectedAmount: Number(dto.expectedAmount) || 0,
      frequency: this.toFrequency(dto.frequency),
      startDate: dto.startDate || '',
      nextIncomeDate: dto.nextIncomeDate ?? null,
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
    return SOURCE_TYPES.includes(value as IncomeSourceType) ? (value as IncomeSourceType) : 'Other';
  }

  private toFrequency(value: string | undefined): IncomeFrequency {
    return FREQUENCIES.includes(value as IncomeFrequency) ? (value as IncomeFrequency) : 'MONTHLY';
  }

  private toIncomeStatus(value: string | undefined): IncomeTransactionStatus {
    return value === 'PENDING' || value === 'CLEARED' || value === 'CANCELLED' ? value : 'RECORDED';
  }

  private toRecurringStatus(value: string | undefined): RecurringIncomeStatus {
    return value === 'PAUSED' || value === 'COMPLETED' || value === 'CANCELLED' ? value : 'ACTIVE';
  }
}
