import {
  CashBalanceData,
  BudgetCategoryData,
  SavingsGoalData,
  IncomeSourceData,
  NetWorthData,
  LineChartData,
  DoughnutChartData,
} from '../models/dashboard-metrics.model';
// Mock cash balance summary
export const MOCK_CASH_BALANCE: CashBalanceData = {
  totalBalance: 8450,
  inAccounts: 8760,
  pending: -310,
};
// Mock budget category progress
export const MOCK_BUDGET_CATEGORIES: BudgetCategoryData[] = [
  { category: 'Food & Dining', spent: 660, limit: 1000, color: '#16a34a' },
  { category: 'Transportation', spent: 528, limit: 800, color: '#f59e0b' },
  { category: 'Utilities', spent: 396, limit: 600, color: '#2563eb' },
];
// Mock savings goal
export const MOCK_SAVINGS_GOAL: SavingsGoalData = {
  goalName: 'Emergency Fund',
  savedAmount: 12850,
  targetAmount: 20000,
  dueDate: 'Dec 2026',
};
// Mock income sources breakdown
export const MOCK_INCOME_SOURCES: IncomeSourceData[] = [
  { source: 'Primary Salary', amount: 4600, color: '#2563eb' },
  { source: 'Freelance', amount: 450, color: '#0ea5e9' },
  { source: 'Investments', amount: 405, color: '#14b8a6' },
];
// Mock net worth summary
export const MOCK_NET_WORTH: NetWorthData = {
  totalAssets: 95400,
  totalLiabilities: 32100,
};
// Mock cash flow trend line chart data
export const MOCK_CASH_FLOW_TREND_CHART: LineChartData = {
  labels: ['May 1', 'May 8', 'May 15', 'May 22', 'May 31'],
  datasets: [
    {
      label: 'Income',
      data: [5200, 5800, 5600, 6200, 6780],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, .1)',
      pointBackgroundColor: '#22c55e',
      fill: true,
    },
    {
      label: 'Expenses',
      data: [2800, 2400, 2900, 2500, 2650],
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, .1)',
      pointBackgroundColor: '#ef4444',
      fill: true,
    },
    {
      label: 'Net Cash Flow',
      data: [2400, 3400, 2700, 3700, 4130],
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, .1)',
      pointBackgroundColor: '#2563eb',
      fill: true,
    },
  ],
};
// Mock spending by category doughnut chart data
export const MOCK_SPENDING_BY_CATEGORY_CHART: DoughnutChartData = {
  labels: ['Housing', 'Food & Dining', 'Transportation', 'Utilities', 'Entertainment', 'Others'],
  datasets: [
    {
      data: [795, 530, 398, 265, 212, 185],
      backgroundColor: ['#2563eb', '#22c55e', '#f97316', '#7c3aed', '#ef4444', '#94a3b8'],
      borderWidth: 0,
      hoverOffset: 4,
    },
  ],
  total: 2650,
};
