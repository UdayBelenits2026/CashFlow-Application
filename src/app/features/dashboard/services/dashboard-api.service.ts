import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import {
  AccountLinkPayload,
  DashboardApiResponse,
  DashboardFilterState,
  DashboardItem,
  ProfileSetupForm,
} from '../models/dashboard.models';

import {
  ApiEnvelope,
  CashBalanceDto,
  CashFlowTrendDto,
  DashboardConfigurationDto,
  DashboardSummaryDto,
  RecentExpenseDto,
  RecentIncomeDto,
  RecentTransactionDto,
  SpendingByCategoryDto,
  UpcomingBillDto,
} from '../models/dashboard-api.dto';

import {
  mapCashBalance,
  mapCashFlowTrend,
  mapConfiguration,
  mapRecentExpenses,
  mapRecentIncome,
  mapRecentTransactions,
  mapSpendingByCategory,
  mapSummaryToCards,
  mapUpcomingBill,
  mapUpcomingBills,
  toConfigurationDto,
  toUpcomingBillWriteDto,
} from '../utility/dashboard-api.mappers';

import { DashboardWidgetConfig } from '../utility/dashboard-widget-config';

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private readonly baseUrl = `${environment.apiBaseUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  // Loads dashboard data from the documented dashboard endpoints in parallel
  getDashboard(
    filters?: Partial<DashboardFilterState>
  ): Observable<DashboardApiResponse> {
    return forkJoin({
      summary: this.http.get<ApiEnvelope<DashboardSummaryDto>>(
        `${this.baseUrl}/summary`,
        {
          params: {
            period: 'MONTH',
          },
        }
      ),

      trend: this.http.get<ApiEnvelope<CashFlowTrendDto>>(
        `${this.baseUrl}/cash-flow-trend`,
        {
          params: {
            period: '6M',
          },
        }
      ),

      spending: this.http.get<ApiEnvelope<SpendingByCategoryDto>>(
        `${this.baseUrl}/spending-by-category`,
        {
          params: {
            period: 'MONTH',
            limit: '5',
          },
        }
      ),

      upcomingBills: this.http.get<ApiEnvelope<UpcomingBillDto[]>>(
        `${this.baseUrl}/upcoming-bills`,
        {
          params: {
            days: '30',
          },
        }
      ),

      recentTransactions: this.http.get<ApiEnvelope<RecentTransactionDto[]>>(
        `${this.baseUrl}/recent-transactions`,
        {
          params: {
            limit: '10',
          },
        }
      ),

      recentIncome: this.http.get<ApiEnvelope<RecentIncomeDto[]>>(
        `${this.baseUrl}/recent-income`,
        {
          params: {
            limit: '5',
          },
        }
      ),

      recentExpenses: this.http.get<ApiEnvelope<RecentExpenseDto[]>>(
        `${this.baseUrl}/recent-expenses`,
        {
          params: {
            limit: '5',
          },
        }
      ),

      cashBalance: this.http.get<ApiEnvelope<CashBalanceDto>>(
        `${this.baseUrl}/cash-balance`,
        {
          params: {
            includeInactive: 'false',
          },
        }
      ),

      config: this.http.get<ApiEnvelope<DashboardConfigurationDto>>(
        `${this.baseUrl}/configuration`
      ),
    }).pipe(
      map((r) => {
        const data: DashboardApiResponse = {
          summaryCards: mapSummaryToCards(r.summary.data),
          cashFlowTrendChart: mapCashFlowTrend(r.trend.data),
          spendingByCategoryChart: mapSpendingByCategory(
            r.spending.data
          ),
          upcomingBills: mapUpcomingBills(
            r.upcomingBills.data
          ),
          recentTransactions: mapRecentTransactions(
            r.recentTransactions.data
          ),
          recentIncome: mapRecentIncome(
            r.recentIncome.data
          ),
          recentExpenses: mapRecentExpenses(
            r.recentExpenses.data
          ),
          cashBalance: mapCashBalance(
            r.cashBalance.data
          ),
          widgetConfig: mapConfiguration(
            r.config.data
          ),
        };

        return data;
      })
    );
  }

  // Saves widget layout/order via the documented configuration endpoint
  updateWidgetConfig(
    widgetConfig: DashboardWidgetConfig[]
  ): Observable<DashboardWidgetConfig[]> {
    return this.http
      .put<ApiEnvelope<DashboardConfigurationDto>>(
        `${this.baseUrl}/configuration`,
        toConfigurationDto(widgetConfig)
      )
      .pipe(
        map(() => widgetConfig)
      );
  }

  // Adds a new upcoming bill
  addUpcomingBill(
    item: DashboardItem
  ): Observable<DashboardItem> {
    return this.http
      .post<ApiEnvelope<UpcomingBillDto>>(
        `${this.baseUrl}/upcoming-bills`,
        toUpcomingBillWriteDto(item)
      )
      .pipe(
        map((r) => mapUpcomingBill(r.data))
      );
  }

  // Updates an existing upcoming bill
  updateUpcomingBill(
    item: DashboardItem
  ): Observable<DashboardItem> {
    return this.http
      .put<ApiEnvelope<UpcomingBillDto>>(
        `${this.baseUrl}/upcoming-bills/${item.id}`,
        toUpcomingBillWriteDto(item)
      )
      .pipe(
        map((r) => mapUpcomingBill(r.data))
      );
  }

  // Deletes an upcoming bill
  deleteUpcomingBill(
    id: number | string
  ): Observable<number | string> {
    return this.http
      .delete<ApiEnvelope<unknown>>(
        `${this.baseUrl}/upcoming-bills/${id}`
      )
      .pipe(
        map(() => id)
      );
  }

  // Connects a bank account or credit card via backend API
  connectAccount(
    payload: AccountLinkPayload
  ): Observable<AccountLinkPayload> {
    return this.http.post<AccountLinkPayload>(
      `${environment.apiBaseUrl}/accounts`,
      payload
    );
  }

  // Updates user profile setup preferences via backend API
  saveProfile(
    payload: ProfileSetupForm
  ): Observable<ProfileSetupForm> {
    return this.http.post<ProfileSetupForm>(
      `${environment.apiBaseUrl}/profile`,
      payload
    );
  }
}