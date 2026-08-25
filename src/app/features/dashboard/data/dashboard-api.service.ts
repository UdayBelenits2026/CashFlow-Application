import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable } from 'rxjs';
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
  SummaryCard,
} from '../models/dashboard.models';
import { DashboardWidgetConfig } from '../utility/dashboard-widget-config';

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private readonly baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getSummaryCards(): Observable<SummaryCard[]> {
    return this.http.get<SummaryCard[]>(`${this.baseUrl}/summaryCards`);
  }

  getUpcomingBills(): Observable<DashboardItem[]> {
    return this.http.get<DashboardItem[]>(`${this.baseUrl}/upcomingBills`);
  }

  getRecentTransactions(): Observable<DashboardItem[]> {
    return this.http.get<DashboardItem[]>(`${this.baseUrl}/recentTransactions`);
  }

  getRecentIncome(): Observable<DashboardItem[]> {
    return this.http.get<DashboardItem[]>(`${this.baseUrl}/recentIncome`);
  }

  getRecentExpenses(): Observable<DashboardItem[]> {
    return this.http.get<DashboardItem[]>(`${this.baseUrl}/recentExpenses`);
  }

  getWidgetConfig(): Observable<DashboardWidgetConfig[]> {
    return this.http.get<DashboardWidgetConfig[]>(`${this.baseUrl}/widgetConfig`);
  }

  getQuickActions(): Observable<QuickAction[]> {
    return this.http.get<QuickAction[]>(`${this.baseUrl}/quickActions`);
  }

  getCashBalance(): Observable<CashBalanceData> {
    return this.http.get<CashBalanceData>(`${this.baseUrl}/cashBalance`);
  }

  getBudgetCategories(): Observable<BudgetCategoryData[]> {
    return this.http.get<BudgetCategoryData[]>(`${this.baseUrl}/budgetCategories`);
  }

  getSavingsGoal(): Observable<SavingsGoalData> {
    return this.http.get<SavingsGoalData>(`${this.baseUrl}/savingsGoal`);
  }

  getIncomeSources(): Observable<IncomeSourceData[]> {
    return this.http.get<IncomeSourceData[]>(`${this.baseUrl}/incomeSources`);
  }

  getNetWorth(): Observable<NetWorthData> {
    return this.http.get<NetWorthData>(`${this.baseUrl}/netWorth`);
  }

  getCashFlowTrendChart(): Observable<LineChartData> {
    return this.http.get<LineChartData>(`${this.baseUrl}/cashFlowTrendChart`);
  }

  getSpendingByCategoryChart(): Observable<DoughnutChartData> {
    return this.http.get<DoughnutChartData>(`${this.baseUrl}/spendingByCategoryChart`);
  }

  getOnboardingSteps(): Observable<OnboardingStep[]> {
    return this.http.get<OnboardingStep[]>(`${this.baseUrl}/onboardingSteps`);
  }

  getOnboardingActions(): Observable<OnboardingAction[]> {
    return this.http.get<OnboardingAction[]>(`${this.baseUrl}/onboardingActions`);
  }

  getDashboardSettings(): Observable<{ isNewUser: boolean }> {
    return this.http.get<{ isNewUser: boolean }>(`${this.baseUrl}/dashboardSettings`);
  }

  getDashboard(): Observable<DashboardApiResponse> {
    return this.http.get<DashboardApiResponse>(`${this.baseUrl}/dashboard`);
  }

  updateWidgetConfig(widgetConfig: DashboardWidgetConfig[]): Observable<DashboardWidgetConfig[]> {
    const putTopLevel = widgetConfig.map((item) =>
      this.http.put<DashboardWidgetConfig>(`${this.baseUrl}/widgetConfig/${item.id}`, item),
    );
    const patchDashboard = this.http.patch<DashboardApiResponse>(`${this.baseUrl}/dashboard`, {
      widgetConfig,
    });
    return forkJoin([...putTopLevel, patchDashboard]).pipe(map(() => widgetConfig));
  }
}
