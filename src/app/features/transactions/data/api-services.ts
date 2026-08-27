import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { UserContextService } from '../../../core/services/user-context.service';
import {
  ApiResponse,
  CategoryOption,
  CreateTransactionRequest,
  CreateTransactionResponse,
  DeleteTransactionData,
  EditTransactionData,
  ExpenseCreateRequest,
  ExpenseDetails,
  ExpenseListPage,
  ExpenseListQuery,
  ExpenseMutationResponse,
  ExpenseUpdateRequest,
  PagedResult,
  SpendingDashboard,
  SpendingOverview,
  TransactionDetail,
  TransactionListItem,
  UpdateTransactionRequest,
} from '../models/transaction-api.model';

// HTTP access for the transactions backend (environment.transactionsApiBaseUrl).
// Every endpoint returns the { success, data, ... } envelope, unwrapped to `.data` here.
@Injectable({
  providedIn: 'root',
})
export class ApiServices {
  private readonly http = inject(HttpClient);
  private readonly userContext = inject(UserContextService);
  private readonly baseUrl = environment.transactionsApiBaseUrl;

  // POST /transactions (create expense/income). No userId query param (user derived from the
  // auth token). Idempotency-Key (when supplied) lets the backend de-duplicate retried creates.
  createTransaction(
    request: CreateTransactionRequest,
    idempotencyKey?: string,
  ): Observable<CreateTransactionResponse> {
    const options = idempotencyKey
      ? { headers: new HttpHeaders({ 'Idempotency-Key': idempotencyKey }) }
      : {};
    return this.http
      .post<
        ApiResponse<CreateTransactionResponse>
      >(`${this.baseUrl}/transactions`, request, options)
      .pipe(map((response) => response.data));
  }

  // GET /transactions (server-side paged list).
  getTransactions(query: {
    accountId?: number;
    page: number;
    size: number;
    sort?: string;
  }): Observable<PagedResult<TransactionListItem>> {
    let params = new HttpParams()
      .set('userId', this.userContext.getUserId())
      .set('page', query.page)
      .set('size', query.size);
    if (query.accountId != null) {
      params = params.set('accountId', query.accountId);
    }
    if (query.sort) {
      params = params.set('sort', query.sort);
    }
    return this.http
      .get<
        ApiResponse<PagedResult<TransactionListItem>>
      >(`${this.baseUrl}/transactions`, { params })
      .pipe(map((response) => response.data));
  }

  // GET /transactions/{id} (read-only details).
  getTransactionById(id: number): Observable<TransactionDetail> {
    const params = new HttpParams().set('userId', this.userContext.getUserId());
    return this.http
      .get<ApiResponse<TransactionDetail>>(`${this.baseUrl}/transactions/${id}`, { params })
      .pipe(map((response) => response.data));
  }

  // GET /transactions/{id}/edit (edit-form data incl. readOnlyFieldNames + accountEditable).
  getTransactionForEdit(id: number): Observable<EditTransactionData> {
    const params = new HttpParams().set('userId', this.userContext.getUserId());
    return this.http
      .get<ApiResponse<EditTransactionData>>(`${this.baseUrl}/transactions/${id}/edit`, { params })
      .pipe(map((response) => response.data));
  }

  // PUT /transactions/{id}/edit.
  updateTransaction(
    id: number,
    request: UpdateTransactionRequest,
  ): Observable<CreateTransactionResponse> {
    const params = new HttpParams().set('userId', this.userContext.getUserId());
    return this.http
      .put<
        ApiResponse<CreateTransactionResponse>
      >(`${this.baseUrl}/transactions/${id}/edit`, request, { params })
      .pipe(map((response) => response.data));
  }

  // DELETE /transactions/{id} (soft-cancel; returns status CANCELLED). No userId query param.
  deleteTransaction(id: number): Observable<DeleteTransactionData> {
    return this.http
      .delete<ApiResponse<DeleteTransactionData>>(`${this.baseUrl}/transactions/${id}`)
      .pipe(map((response) => response.data));
  }

  // --- Expense controller (Swagger /expenses; responses are not enveloped) ---

  // GET /expenses (paged, filterable list of expense transactions).
  listExpenses(query: ExpenseListQuery = {}): Observable<ExpenseListPage> {
    let params = new HttpParams().set('userId', this.userContext.getUserId());
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value as string | number);
      }
    }
    return this.http.get<ExpenseListPage>(`${this.baseUrl}/expenses`, { params });
  }

  // GET /expenses/{id}.
  getExpense(id: number): Observable<ExpenseDetails> {
    const params = new HttpParams().set('userId', this.userContext.getUserId());
    return this.http.get<ExpenseDetails>(`${this.baseUrl}/expenses/${id}`, { params });
  }

  // POST /expenses.
  createExpense(request: ExpenseCreateRequest): Observable<ExpenseMutationResponse> {
    const params = new HttpParams().set('userId', this.userContext.getUserId());
    return this.http.post<ExpenseMutationResponse>(`${this.baseUrl}/expenses`, request, { params });
  }

  // PUT /expenses/{id}.
  updateExpense(id: number, request: ExpenseUpdateRequest): Observable<ExpenseMutationResponse> {
    const params = new HttpParams().set('userId', this.userContext.getUserId());
    return this.http.put<ExpenseMutationResponse>(`${this.baseUrl}/expenses/${id}`, request, { params });
  }

  // DELETE /expenses/{id}.
  deleteExpense(id: number): Observable<ExpenseMutationResponse> {
    const params = new HttpParams().set('userId', this.userContext.getUserId());
    return this.http.delete<ExpenseMutationResponse>(`${this.baseUrl}/expenses/${id}`, { params });
  }

  // --- Spending controller (Swagger /spending; responses are not enveloped) ---

  // GET /spending/overview.
  getSpendingOverview(period = 'this_month'): Observable<SpendingOverview> {
    const params = new HttpParams().set('userId', this.userContext.getUserId()).set('period', period);
    return this.http.get<SpendingOverview>(`${this.baseUrl}/spending/overview`, { params });
  }

  // GET /spending/dashboard.
  getSpendingDashboard(period = 'this_month'): Observable<SpendingDashboard> {
    const params = new HttpParams().set('userId', this.userContext.getUserId()).set('period', period);
    return this.http.get<SpendingDashboard>(`${this.baseUrl}/spending/dashboard`, { params });
  }

  // GET /spending/categories.
  getSpendingCategories(): Observable<CategoryOption[]> {
    const params = new HttpParams().set('userId', this.userContext.getUserId());
    return this.http.get<CategoryOption[]>(`${this.baseUrl}/spending/categories`, { params });
  }
}
