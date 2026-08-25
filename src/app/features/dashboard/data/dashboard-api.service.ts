import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, switchMap } from 'rxjs';
import {
  BudgetCategoryData,
  CashBalanceData,
  DashboardApiResponse,
  DashboardItem,
  DoughnutChartData,
  IncomeSourceData,
  LineChartData,
  NetWorthData,
  OnboardingAction,
  OnboardingStep,
  QuickAction,
  SavingsGoalData,
  SummaryCardResponse,
} from '../models/dashboard.models';
import { DashboardWidgetConfig } from '../utility/dashboard-widget-config';

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private readonly baseUrl = 'http://localhost:3000';
  constructor(private http: HttpClient) {}
  // Fetches summary card metrics
  getSummaryCards(): Observable<SummaryCardResponse[]> {
    return this.http.get<SummaryCardResponse[]>(`${this.baseUrl}/summaryCards`);
  }
  // Fetches list of upcoming bills
  getUpcomingBills(): Observable<DashboardItem[]> {
    return this.http.get<DashboardItem[]>(`${this.baseUrl}/upcomingBills`);
  }
  // Fetches list of recent transactions
  getRecentTransactions(): Observable<DashboardItem[]> {
    return this.http.get<DashboardItem[]>(`${this.baseUrl}/recentTransactions`);
  }
  // Fetches list of recent income entries
  getRecentIncome(): Observable<DashboardItem[]> {
    return this.http.get<DashboardItem[]>(`${this.baseUrl}/recentIncome`);
  }
  // Fetches list of recent expense entries
  getRecentExpenses(): Observable<DashboardItem[]> {
    return this.http.get<DashboardItem[]>(`${this.baseUrl}/recentExpenses`);
  }
  // Fetches saved dashboard widget configuration
  getWidgetConfig(): Observable<DashboardWidgetConfig[]> {
    return this.http.get<DashboardWidgetConfig[]>(`${this.baseUrl}/widgetConfig`);
  }
  // Fetches list of available quick actions
  getQuickActions(): Observable<QuickAction[]> {
    return this.http.get<QuickAction[]>(`${this.baseUrl}/quickActions`);
  }
  // Fetches total cash balance breakdown
  getCashBalance(): Observable<CashBalanceData> {
    return this.http.get<CashBalanceData>(`${this.baseUrl}/cashBalance`);
  }
  // Fetches budget categories summary
  getBudgetCategories(): Observable<BudgetCategoryData[]> {
    return this.http.get<BudgetCategoryData[]>(`${this.baseUrl}/budgetCategories`);
  }
  // Fetches user savings goal progress
  getSavingsGoal(): Observable<SavingsGoalData> {
    return this.http.get<SavingsGoalData>(`${this.baseUrl}/savingsGoal`);
  }
  // Fetches distribution of income sources
  getIncomeSources(): Observable<IncomeSourceData[]> {
    return this.http.get<IncomeSourceData[]>(`${this.baseUrl}/incomeSources`);
  }
  // Fetches user net worth metrics
  getNetWorth(): Observable<NetWorthData> {
    return this.http.get<NetWorthData>(`${this.baseUrl}/netWorth`);
  }
  // Fetches cash flow trend line chart data
  getCashFlowTrendChart(): Observable<LineChartData> {
    return this.http.get<LineChartData>(`${this.baseUrl}/cashFlowTrendChart`);
  }
  // Fetches spending by category doughnut chart data
  getSpendingByCategoryChart(): Observable<DoughnutChartData> {
    return this.http.get<DoughnutChartData>(`${this.baseUrl}/spendingByCategoryChart`);
  }
  // Fetches user onboarding steps
  getOnboardingSteps(): Observable<OnboardingStep[]> {
    return this.http.get<OnboardingStep[]>(`${this.baseUrl}/onboardingSteps`);
  }
  // Fetches list of available onboarding actions
  getOnboardingActions(): Observable<OnboardingAction[]> {
    return this.http.get<OnboardingAction[]>(`${this.baseUrl}/onboardingActions`);
  }
  // Fetches current dashboard settings
  getDashboardSettings(): Observable<{ isNewUser: boolean }> {
    return this.http.get<{ isNewUser: boolean }>(`${this.baseUrl}/dashboardSettings`);
  }
  // Fetches full dashboard consolidated data
  getDashboard(): Observable<DashboardApiResponse> {
    return this.http.get<DashboardApiResponse>(`${this.baseUrl}/dashboard`);
  }
  // Adds new upcoming bill entry to dashboard
  addUpcomingBill(item: DashboardItem): Observable<DashboardItem> {
    return this.http.get<DashboardApiResponse>(`${this.baseUrl}/dashboard`).pipe(
      switchMap((dashboardData) => {
        const currentBills = dashboardData.upcomingBills || [];
        const updatedBills = [item, ...currentBills];
        return this.http
          .patch<DashboardApiResponse>(`${this.baseUrl}/dashboard`, {
            upcomingBills: updatedBills,
          })
          .pipe(map(() => item));
      }),
    );
  }
  // Updates existing upcoming bill entry in dashboard
  updateUpcomingBill(item: DashboardItem): Observable<DashboardItem> {
    return this.http.get<DashboardApiResponse>(`${this.baseUrl}/dashboard`).pipe(
      switchMap((dashboardData) => {
        const currentBills = dashboardData.upcomingBills || [];
        const updatedBills = currentBills.map((b) => (String(b.id) === String(item.id) ? item : b));
        return this.http
          .patch<DashboardApiResponse>(`${this.baseUrl}/dashboard`, {
            upcomingBills: updatedBills,
          })
          .pipe(map(() => item));
      }),
    );
  }
  // Deletes upcoming bill entry from dashboard by ID
  deleteUpcomingBill(id: number | string): Observable<number | string> {
    return this.http.get<DashboardApiResponse>(`${this.baseUrl}/dashboard`).pipe(
      switchMap((dashboardData) => {
        const currentBills = dashboardData.upcomingBills || [];
        const updatedBills = currentBills.filter((b) => String(b.id) !== String(id));
        return this.http
          .patch<DashboardApiResponse>(`${this.baseUrl}/dashboard`, {
            upcomingBills: updatedBills,
          })
          .pipe(map(() => id));
      }),
    );
  }
  // Updates dashboard widget layout and order configuration
  updateWidgetConfig(widgetConfig: DashboardWidgetConfig[]): Observable<DashboardWidgetConfig[]> {
    return this.http
      .patch<DashboardApiResponse>(`${this.baseUrl}/dashboard`, { widgetConfig })
      .pipe(map(() => widgetConfig));
  }
}
