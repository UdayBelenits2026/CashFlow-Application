import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Account, AccountCategory, CreateAccountCategoryRequest, CurrencyOption, Transaction } from '../models/accounts.model';

// Encapsulates every HTTP call for account resources (json-server; URL from environment).
@Injectable({
  providedIn: 'root'
})
export class AccountApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.accountsApiBaseUrl;

  // Fetches the full account collection.
  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/accounts`);
  }

  // Fetches a single account by its identifier.
  getAccountById(id: string): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/accounts/${id}`);
  }

  // Persists a new account and returns the stored record.
  createAccount(payload: Omit<Account, 'id'> & { id?: string }): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/accounts`, payload);
  }

  // Replaces an existing account with the supplied values.
  updateAccount(account: Account): Observable<Account> {
    return this.http.put<Account>(`${this.baseUrl}/accounts/${account.id}`, account);
  }

  // Removes an account by its identifier.
  deleteAccount(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/accounts/${id}`);
  }

  // Fetches the transactions that belong to a specific account.
  getTransactionsByAccountId(accountId: string): Observable<Transaction[]> {
    const params = new HttpParams().set('accountId', accountId);
    return this.http.get<Transaction[]>(`${this.baseUrl}/transactions`, { params });
  }

  // Fetches the selectable account types for the form dropdown.
  getAccountTypes(): Observable<string[]> {
    return this.http
      .get<{ id: string; name: string }[]>(`${this.baseUrl}/accountTypes`)
      .pipe(map((types) => types.map((type) => type.name)));
  }

  // Fetches the selectable banks for the form dropdown.
  getBanks(): Observable<string[]> {
    return this.http
      .get<{ id: string; name: string }[]>(`${this.baseUrl}/banks`)
      .pipe(map((banks) => banks.map((bank) => bank.name)));
  }

  // Fetches the selectable currencies for the form dropdown.
  getCurrencies(): Observable<CurrencyOption[]> {
    return this.http
      .get<{ id: string; code: string; label: string }[]>(`${this.baseUrl}/currencies`)
      .pipe(map((list) => list.map(({ code, label }) => ({ code, label }))));
  }

  // Fetches the sub-types available for a given account type.
  getAccountSubTypes(accountType: string): Observable<string[]> {
    const params = new HttpParams().set('accountType', accountType);
    return this.http
      .get<{ id: string; accountType: string; name: string }[]>(`${this.baseUrl}/accountSubTypes`, { params })
      .pipe(map((list) => list.map((item) => item.name)));
  }

  // Fetches every account category (sub-type) for the categories page.
  getAccountCategories(): Observable<AccountCategory[]> {
    return this.http.get<AccountCategory[]>(`${this.baseUrl}/accountSubTypes`);
  }

  // Persists a new account category (sub-type) and returns the stored record.
  createAccountCategory(payload: CreateAccountCategoryRequest): Observable<AccountCategory> {
    return this.http.post<AccountCategory>(`${this.baseUrl}/accountSubTypes`, payload);
  }
}
