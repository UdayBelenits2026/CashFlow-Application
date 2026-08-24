import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IncomeOverviewData, IncomeTrendPoint } from '../models/income-summary.model';
import { IncomeSource } from '../models/income-source.model';
import { Income } from '../models/income.model';
import { RecurringIncome } from '../models/recurring-income.model';
import { AccountRef } from '../models/account-ref.model';

@Injectable({
  providedIn: 'root'
})
export class IncomeApiService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = (environment as any).incomeApiBaseUrl || 'http://localhost:3002';

  private url(path: string): string {
    return `${this.baseUrl}/${path}`;
  }

  /**
   * Fetches all core income datasets simultaneously for dashboard & overview initialization.
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
      overview: this.http.get<IncomeOverviewData>(this.url('income-overview')),
      sources: this.http.get<IncomeSource[]>(this.url('income-sources')),
      trendPoints: this.http.get<IncomeTrendPoint[]>(this.url('income-trend-points')),
      incomes: this.http.get<Income[]>(this.url('incomes')),
      recurringIncomes: this.http.get<RecurringIncome[]>(this.url('recurring-income')),
      accounts: this.http.get<AccountRef[]>(this.url('accounts'))
    });
  }

  // --- Incomes (Recorded Transactions) CRUD ---

  getIncomes(): Observable<Income[]> {
    return this.http.get<Income[]>(this.url('incomes'));
  }

  createIncome(payload: Partial<Income>): Observable<Income> {
    return this.http.post<Income>(this.url('incomes'), payload);
  }

  updateIncome(id: string, payload: Partial<Income>): Observable<Income> {
    return this.http.put<Income>(this.url(`incomes/${id}`), payload);
  }

  deleteIncome(id: string): Observable<void> {
    return this.http.delete<void>(this.url(`incomes/${id}`));
  }

  // --- Income Sources CRUD ---

  getSources(): Observable<IncomeSource[]> {
    return this.http.get<IncomeSource[]>(this.url('income-sources'));
  }

  createSource(source: Partial<IncomeSource>): Observable<IncomeSource> {
    return this.http.post<IncomeSource>(this.url('income-sources'), source);
  }

  updateSource(id: string, source: Partial<IncomeSource>): Observable<IncomeSource> {
    return this.http.put<IncomeSource>(this.url(`income-sources/${id}`), source);
  }

  patchSourceStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Observable<IncomeSource> {
    return this.http.patch<IncomeSource>(this.url(`income-sources/${id}`), { status });
  }

  deleteSource(id: string): Observable<void> {
    return this.http.delete<void>(this.url(`income-sources/${id}`));
  }

  // --- Recurring Income Schedules CRUD ---

  getRecurringIncomes(): Observable<RecurringIncome[]> {
    return this.http.get<RecurringIncome[]>(this.url('recurring-income'));
  }

  createRecurringIncome(item: Partial<RecurringIncome>): Observable<RecurringIncome> {
    return this.http.post<RecurringIncome>(this.url('recurring-income'), item);
  }

  updateRecurringIncome(id: string, item: Partial<RecurringIncome>): Observable<RecurringIncome> {
    return this.http.put<RecurringIncome>(this.url(`recurring-income/${id}`), item);
  }

  patchRecurringStatus(id: string, status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'): Observable<RecurringIncome> {
    return this.http.patch<RecurringIncome>(this.url(`recurring-income/${id}`), { status });
  }

  deleteRecurringIncome(id: string): Observable<void> {
    return this.http.delete<void>(this.url(`recurring-income/${id}`));
  }

  // --- Accounts Reference ---

  getAccounts(): Observable<AccountRef[]> {
    return this.http.get<AccountRef[]>(this.url('accounts'));
  }
}
