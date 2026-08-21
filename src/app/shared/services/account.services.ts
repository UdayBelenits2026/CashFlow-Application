import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { Account, Transaction } from '../../features/accounts/models/accounts.model';

@Injectable({
  providedIn: 'root'
})
export class AccountServices {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3007';

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/accounts`);
  }

  getAccountById(accountId: string): Observable<Account | null> {
    return this.http
      .get<Account>(`${this.baseUrl}/accounts/${accountId}`)
      .pipe(map(account => account ?? null));
  }

  createAccount(account: Omit<Account, 'id'> & { id?: string }): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/accounts`, account);
  }

  updateAccount(account: Account): Observable<Account> {
    return this.http.put<Account>(`${this.baseUrl}/accounts/${account.id}`, account);
  }

  getTransactionsByAccountId(accountId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions?accountId=${accountId}`);
  }
}