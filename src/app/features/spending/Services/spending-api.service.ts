import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { SpendingOverviewData, SpendingCategoryItem, SpendingTrendPoint, SpendingAlert } from '../models/spending-summary.model';
import { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../models/expense.model';
import { Tag } from '../models/tag.model';
import { RecurringExpense, CreateRecurringExpenseRequest } from '../models/recurring-expense.model';

@Injectable({
  providedIn: 'root'
})
export class SpendingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3003';

  /**
   * Fetches all core dashboard datasets simultaneously.
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
      overview: this.http.get<SpendingOverviewData>(`${this.baseUrl}/spending-overview`),
      categories: this.http.get<SpendingCategoryItem[]>(`${this.baseUrl}/spending-categories`),
      trendPoints: this.http.get<SpendingTrendPoint[]>(`${this.baseUrl}/spending-trend-points`),
      expenses: this.http.get<Expense[]>(`${this.baseUrl}/expenses`),
      tags: this.http.get<Tag[]>(`${this.baseUrl}/tags`),
      recurringExpenses: this.http.get<RecurringExpense[]>(`${this.baseUrl}/recurring-expenses`),
      alerts: this.http.get<SpendingAlert[]>(`${this.baseUrl}/spending-alerts`)
    });
  }

  // --- Expenses CRUD ---

  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(`${this.baseUrl}/expenses`);
  }

  createExpense(payload: Partial<Expense>): Observable<Expense> {
    return this.http.post<Expense>(`${this.baseUrl}/expenses`, payload);
  }

  updateExpense(id: string, payload: Partial<Expense>): Observable<Expense> {
    return this.http.put<Expense>(`${this.baseUrl}/expenses/${id}`, payload);
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/expenses/${id}`);
  }

  // --- Tags ---

  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/tags`);
  }

  createTag(tag: Tag): Observable<Tag> {
    return this.http.post<Tag>(`${this.baseUrl}/tags`, tag);
  }

  deleteTag(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tags/${id}`);
  }

  // --- Recurring Expenses ---

  getRecurringExpenses(): Observable<RecurringExpense[]> {
    return this.http.get<RecurringExpense[]>(`${this.baseUrl}/recurring-expenses`);
  }

  createRecurringExpense(item: Partial<RecurringExpense>): Observable<RecurringExpense> {
    return this.http.post<RecurringExpense>(`${this.baseUrl}/recurring-expenses`, item);
  }

  updateRecurringExpense(id: string, item: Partial<RecurringExpense>): Observable<RecurringExpense> {
    return this.http.patch<RecurringExpense>(`${this.baseUrl}/recurring-expenses/${id}`, item);
  }

  deleteRecurringExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/recurring-expenses/${id}`);
  }

  // --- Alerts ---

  getAlerts(): Observable<SpendingAlert[]> {
    return this.http.get<SpendingAlert[]>(`${this.baseUrl}/spending-alerts`);
  }

  updateAlert(id: string, alert: Partial<SpendingAlert>): Observable<SpendingAlert> {
    return this.http.patch<SpendingAlert>(`${this.baseUrl}/spending-alerts/${id}`, alert);
  }

  deleteAlert(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/spending-alerts/${id}`);
  }
}
