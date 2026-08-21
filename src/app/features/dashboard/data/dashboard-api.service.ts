import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardApiResponse } from '../models/dashboard.models';

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardApiResponse> {
    return this.http.get<DashboardApiResponse>(`${this.baseUrl}/dashboard`);
  }
}
