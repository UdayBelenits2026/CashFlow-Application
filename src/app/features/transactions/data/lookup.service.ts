import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, LookupItem } from '../models/transaction-api.model';

// Master-data lookups that populate the transaction form's ID-based dropdowns so it can
// submit the numeric IDs (accountId/categoryId/merchantId/incomeSourceId/tagIds) the
// transactions backend requires.
//
// CONTRACT GAP: the paths below are ASSUMED REST endpoints on transactionsApiBaseUrl and
// are NOT yet confirmed by the backend team. Each is expected to return the standard
// ApiResponse envelope wrapping LookupItem[] ({ id, name }). When the backend confirms the
// real paths/shapes, update ONLY this service - no other transaction code needs to change.
@Injectable({ providedIn: 'root' })
export class LookupService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.transactionsApiBaseUrl;

  getAccounts(): Observable<LookupItem[]> {
    return this.fetch('accounts');
  }

  getCategories(): Observable<LookupItem[]> {
    return this.fetch('categories');
  }

  getMerchants(): Observable<LookupItem[]> {
    return this.fetch('merchants');
  }

  getIncomeSources(): Observable<LookupItem[]> {
    return this.fetch('income-sources');
  }

  getTags(): Observable<LookupItem[]> {
    return this.fetch('tags');
  }

  private fetch(path: string): Observable<LookupItem[]> {
    return this.http
      .get<ApiResponse<LookupItem[]>>(`${this.baseUrl}/${path}`)
      .pipe(map((response) => response.data));
  }
}
