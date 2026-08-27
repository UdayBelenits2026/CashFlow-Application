import { mapSummaryCardResponse, SummaryCard } from '../models/summary-card.model';
import { DashboardItem } from '../models/dashboard-item.model';
import {
  CashBalanceData,
  DoughnutChartData,
  LineChartData,
} from '../models/dashboard-metrics.model';
import {
  CashBalanceDto,
  CashFlowTrendDto,
  DashboardSummaryDto,
  RecentExpenseDto,
  RecentIncomeDto,
  RecentTransactionDto,
  SpendingByCategoryDto,
  UpcomingBillDto,
  UpcomingBillWriteDto,
} from '../models/dashboard-api.dto';
// Widget-config mappers live in their own file; re-exported for a single import surface
export { mapConfiguration, toConfigurationDto } from './dashboard-config.mapper';

const CATEGORY_CHART_COLORS = ['#2563eb', '#22c55e', '#f97316', '#7c3aed', '#ef4444', '#94a3b8'];

// Maps the KPI summary into the four dashboard summary cards
export function mapSummaryToCards(dto: DashboardSummaryDto): SummaryCard[] {
  return mapSummaryCardResponse([
    {
      id: 'income',
      selectedMonthAmount: dto.totalIncome,
      previousMonthAmount: dto.previousTotalIncome,
    },
    {
      id: 'expenses',
      selectedMonthAmount: dto.totalExpenses,
      previousMonthAmount: dto.previousTotalExpenses,
    },
    {
      id: 'cashFlow',
      selectedMonthAmount: dto.netCashFlow,
      previousMonthAmount: dto.previousNetCashFlow,
    },
    {
      id: 'savings',
      selectedMonthAmount: dto.totalBalance,
      previousMonthAmount: dto.previousTotalBalance,
    },
  ]);
}

// Maps the cash-flow trend series into line chart data
export function mapCashFlowTrend(dto: CashFlowTrendDto): LineChartData {
  const points = dto.points ?? [];
  return {
    labels: points.map((p) => p.period),
    datasets: [
      {
        label: 'Income',
        data: points.map((p) => p.income),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, .1)',
        pointBackgroundColor: '#22c55e',
        fill: true,
      },
      {
        label: 'Expenses',
        data: points.map((p) => p.expense),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, .1)',
        pointBackgroundColor: '#ef4444',
        fill: true,
      },
      {
        label: 'Net Cash Flow',
        data: points.map((p) => p.net),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, .1)',
        pointBackgroundColor: '#2563eb',
        fill: true,
      },
    ],
  };
}

// Maps spending categories into doughnut chart data
export function mapSpendingByCategory(dto: SpendingByCategoryDto): DoughnutChartData {
  const categories = dto.categories ?? [];
  return {
    labels: categories.map((c) => c.categoryName),
    datasets: [
      {
        data: categories.map((c) => c.amount),
        backgroundColor: categories.map(
          (_, i) => CATEGORY_CHART_COLORS[i % CATEGORY_CHART_COLORS.length],
        ),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
    total: dto.totalSpending,
  };
}

// Maps a single recurring bill into a dashboard list item
export function mapUpcomingBill(b: UpcomingBillDto): DashboardItem {
  return {
    id: b.recurringId,
    title: b.name,
    date: b.nextDueDate,
    amount: b.amount,
    icon: b.icon || 'fa-receipt',
    type: 'bill',
  };
}

// Maps recurring upcoming bills into dashboard list items
export function mapUpcomingBills(dtos: UpcomingBillDto[]): DashboardItem[] {
  return (dtos ?? []).map(mapUpcomingBill);
}

// Converts a UI bill item into the create/update payload
export function toUpcomingBillWriteDto(item: DashboardItem): UpcomingBillWriteDto {
  return {
    name: item.title,
    amount: Math.abs(item.amount),
    nextDueDate: item.date,
    icon: item.icon,
    status: 'ACTIVE',
  };
}

// Maps recent transactions into dashboard list items
export function mapRecentTransactions(dtos: RecentTransactionDto[]): DashboardItem[] {
  return (dtos ?? []).map((t) => {
    const isIncome = t.type?.toUpperCase() === 'INCOME';
    return {
      id: t.transactionId,
      title: t.description,
      date: t.date,
      amount: isIncome ? Math.abs(t.amount) : -Math.abs(t.amount),
      icon: t.icon || 'fa-circle-question',
      type: isIncome ? 'income' : 'expense',
    };
  });
}

// Maps recent income into dashboard list items
export function mapRecentIncome(dtos: RecentIncomeDto[]): DashboardItem[] {
  return (dtos ?? []).map((i) => ({
    id: i.transactionId,
    title: i.sourceName,
    date: i.date,
    amount: Math.abs(i.amount),
    icon: i.icon || 'fa-sack-dollar',
    type: 'income',
  }));
}

// Maps recent expenses into dashboard list items
export function mapRecentExpenses(dtos: RecentExpenseDto[]): DashboardItem[] {
  return (dtos ?? []).map((e) => ({
    id: e.transactionId,
    title: e.merchant,
    date: e.date,
    amount: -Math.abs(e.amount),
    icon: e.icon || 'fa-cart-shopping',
    type: 'expense',
  }));
}

// Maps the cash-balance summary into the cash balance widget model
export function mapCashBalance(dto: CashBalanceDto): CashBalanceData {
  const inAccounts =
    dto.inAccounts ?? (dto.accounts ?? []).reduce((sum, a) => sum + a.currentBalance, 0);
  const pending = dto.pending ?? dto.availableBalance - dto.totalBalance;
  return {
    totalBalance: dto.totalBalance,
    inAccounts,
    pending,
  };
}
