import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CreateTransactionRequest, Transaction } from '../models/models.transaction';

// HTTP access for transactions served by JSON Server (port 3001).
@Injectable({
  providedIn: 'root',
})
export class ApiServices {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3001';

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions`);
  }

  getTransaction(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.baseUrl}/transactions/${id}`);
  }

  // Idempotency-Key (when supplied) lets the backend de-duplicate retried creates.
  createTransaction(payload: CreateTransactionRequest, idempotencyKey?: string): Observable<Transaction> {
    const options = idempotencyKey
      ? { headers: new HttpHeaders({ 'Idempotency-Key': idempotencyKey }) }
      : {};
    return this.http.post<Transaction>(`${this.baseUrl}/transactions`, payload, options);
  }

  updateTransaction(id: string, changes: Partial<Transaction>): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.baseUrl}/transactions/${id}`, changes);
  }

  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/transactions/${id}`);
  }
}
