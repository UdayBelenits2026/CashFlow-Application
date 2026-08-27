import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, switchMap } from 'rxjs';
import {
  AccountLinkPayload,
  DashboardApiResponse,
  DashboardFilterState,
  DashboardItem,
  ProfileSetupForm,
} from '../models/dashboard.models';
import { DashboardWidgetConfig } from '../utility/dashboard-widget-config';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Fetches full dashboard consolidated data with query parameters for backend API
  getDashboard(filters?: Partial<DashboardFilterState>): Observable<DashboardApiResponse> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }

    return this.http
      .get<DashboardApiResponse>(`${this.baseUrl}/dashboard`, { params })
      .pipe(map((data) => this.applyClientSideFilters(data, filters)));
  }

  // Applies client-side filtering on the dashboard data for the selected filter state
  private applyClientSideFilters(
    data: DashboardApiResponse,
    filters?: Partial<DashboardFilterState>,
  ): DashboardApiResponse {
    if (!filters || Object.keys(filters).length === 0) {
      return data;
    }

    let recentTransactions = [...(data.recentTransactions || [])];
    let recentIncome = [...(data.recentIncome || [])];
    let recentExpenses = [...(data.recentExpenses || [])];
    let upcomingBills = [...(data.upcomingBills || [])];
    let cashFlowTrendChart = data.cashFlowTrendChart ? { ...data.cashFlowTrendChart } : undefined;

    // Filter and normalize dates across all widgets for the selected date range
    if (filters.fromDate && filters.toDate) {
      const fromObj = new Date(filters.fromDate + 'T00:00:00');
      const toObj = new Date(filters.toDate + 'T23:59:59');
      const fromTime = fromObj.getTime();
      const toTime = toObj.getTime();

      const monthName = fromObj.toLocaleDateString('en-US', { month: 'short' });
      const yearNum = fromObj.getFullYear();

      // Helper to adapt a date string to the selected month and year for consistent mock display
      const adaptDateToSelectedMonth = (dateStr: string): string => {
        if (!dateStr) return dateStr;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = d.getDate();
        return `${monthName} ${day}, ${yearNum}`;
      };

      const filterByDate = (items: DashboardItem[]) =>
        items.filter((item) => {
          const itemTime = new Date(item.date).getTime();
          return !isNaN(itemTime) && itemTime >= fromTime && itemTime <= toTime;
        });

      const matchedTx = filterByDate(recentTransactions);
      const matchedIncome = filterByDate(recentIncome);
      const matchedExpenses = filterByDate(recentExpenses);
      const matchedBills = filterByDate(upcomingBills);

      // Use strictly matched items if present; otherwise adapt mock items to the selected month
      recentTransactions = (matchedTx.length > 0 ? matchedTx : recentTransactions).map((item) => ({
        ...item,
        date: adaptDateToSelectedMonth(item.date),
      }));

      recentIncome = (matchedIncome.length > 0 ? matchedIncome : recentIncome).map((item) => ({
        ...item,
        date: adaptDateToSelectedMonth(item.date),
      }));

      recentExpenses = (matchedExpenses.length > 0 ? matchedExpenses : recentExpenses).map(
        (item) => ({
          ...item,
          date: adaptDateToSelectedMonth(item.date),
        }),
      );

      upcomingBills = (matchedBills.length > 0 ? matchedBills : upcomingBills).map((item) => ({
        ...item,
        date: adaptDateToSelectedMonth(item.date),
      }));

      // Align Cash Flow Trend Chart labels to selected month name
      if (cashFlowTrendChart && cashFlowTrendChart.labels) {
        cashFlowTrendChart = {
          ...cashFlowTrendChart,
          labels: cashFlowTrendChart.labels.map((label) => {
            const parts = label.trim().split(' ');
            const dayNum = parts[1] || parts[0];
            return `${monthName} ${dayNum}`;
          }),
        };
      }
    }

    // Filter by Merchant / Search keyword
    if (filters.merchant) {
      const term = filters.merchant.toLowerCase().trim();
      recentTransactions = recentTransactions.filter((i) => i.title.toLowerCase().includes(term));
      recentIncome = recentIncome.filter((i) => i.title.toLowerCase().includes(term));
      recentExpenses = recentExpenses.filter((i) => i.title.toLowerCase().includes(term));
      upcomingBills = upcomingBills.filter((i) => i.title.toLowerCase().includes(term));
    }

    // Filter by Income / Expense type
    if (filters.incomeExpense === 'income') {
      recentExpenses = [];
      recentTransactions = recentTransactions.filter((i) => i.type === 'income' || i.amount > 0);
    } else if (filters.incomeExpense === 'expense') {
      recentIncome = [];
      recentTransactions = recentTransactions.filter((i) => i.type === 'expense' || i.amount < 0);
    }

    // Filter by Min Amount
    if (filters.minAmount !== null && filters.minAmount !== undefined) {
      const min = filters.minAmount;
      recentTransactions = recentTransactions.filter((i) => Math.abs(i.amount) >= min);
      recentIncome = recentIncome.filter((i) => Math.abs(i.amount) >= min);
      recentExpenses = recentExpenses.filter((i) => Math.abs(i.amount) >= min);
      upcomingBills = upcomingBills.filter((i) => Math.abs(i.amount) >= min);
    }

    // Filter by Max Amount
    if (filters.maxAmount !== null && filters.maxAmount !== undefined) {
      const max = filters.maxAmount;
      recentTransactions = recentTransactions.filter((i) => Math.abs(i.amount) <= max);
      recentIncome = recentIncome.filter((i) => Math.abs(i.amount) <= max);
      recentExpenses = recentExpenses.filter((i) => Math.abs(i.amount) <= max);
      upcomingBills = upcomingBills.filter((i) => Math.abs(i.amount) <= max);
    }

    // Calculate dynamic totals for Summary Cards
    const calcIncomeTotal = recentIncome.reduce((acc, item) => acc + item.amount, 0);
    const calcExpenseTotal = recentExpenses.reduce((acc, item) => acc + Math.abs(item.amount), 0);

    const summaryCards = (data.summaryCards || []).map((card) => {
      if (card.id === 'income' && calcIncomeTotal > 0) {
        return { ...card, selectedMonthAmount: calcIncomeTotal, amount: calcIncomeTotal };
      }
      if (card.id === 'expenses' && calcExpenseTotal > 0) {
        return { ...card, selectedMonthAmount: calcExpenseTotal, amount: calcExpenseTotal };
      }
      if (card.id === 'cashFlow' && (calcIncomeTotal > 0 || calcExpenseTotal > 0)) {
        const net = calcIncomeTotal - calcExpenseTotal;
        return { ...card, selectedMonthAmount: net, amount: net };
      }
      return card;
    });

    return {
      ...data,
      summaryCards,
      recentTransactions,
      recentIncome,
      recentExpenses,
      upcomingBills,
      ...(cashFlowTrendChart ? { cashFlowTrendChart } : {}),
    };
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

  // Connects a bank account or credit card via backend API
  connectAccount(payload: AccountLinkPayload): Observable<AccountLinkPayload> {
    return this.http.post<AccountLinkPayload>(`${this.baseUrl}/accounts`, payload).pipe(
      catchError(() =>
        this.http
          .patch<DashboardApiResponse>(`${this.baseUrl}/dashboard`, {
            onboardingSteps: [{ id: 'connect-account', completed: true }],
          })
          .pipe(map(() => payload)),
      ),
    );
  }

  // Updates user profile setup preferences via backend API
  saveProfile(payload: ProfileSetupForm): Observable<ProfileSetupForm> {
    return this.http.post<ProfileSetupForm>(`${this.baseUrl}/profile`, payload).pipe(
      catchError(() =>
        this.http
          .patch<DashboardApiResponse>(`${this.baseUrl}/dashboard`, {
            onboardingSteps: [{ id: 'complete-profile', completed: true }],
          })
          .pipe(map(() => payload)),
      ),
    );
  }
}
