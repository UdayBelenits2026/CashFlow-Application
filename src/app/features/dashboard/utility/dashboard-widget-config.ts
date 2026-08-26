import {
  DashboardWidgetConfig,
  DashboardWidgetDefinition,
  DashboardWidgetId,
  DashboardWidgetLayout,
} from '../models/dashboard.models';

export type {
  DashboardWidgetConfig,
  DashboardWidgetDefinition,
  DashboardWidgetId,
  DashboardWidgetLayout,
};
// List of all dashboard widget definitions and metadata
export const DASHBOARD_WIDGET_DEFINITIONS: DashboardWidgetDefinition[] = [
  {
    id: 'cashFlowTrend',
    title: 'Cash Flow Trend',
    description: 'Income, expense and cash flow over time',
    icon: 'fa-chart-line',
  },
  {
    id: 'spendingByCategory',
    title: 'Spending by Category',
    description: 'Breakdown of expenses by category',
    icon: 'fa-chart-pie',
  },
  {
    id: 'upcomingBills',
    title: 'Upcoming Bills',
    description: 'Upcoming bills and due dates',
    icon: 'fa-calendar-days',
  },
  {
    id: 'recentTransactions',
    title: 'Recent Transactions',
    description: 'Latest bank transactions',
    icon: 'fa-receipt',
  },
  {
    id: 'recentIncome',
    title: 'Recent Income',
    description: 'Latest income received',
    icon: 'fa-sack-dollar',
  },
  {
    id: 'recentExpenses',
    title: 'Recent Expenses',
    description: 'Latest expenses',
    icon: 'fa-money-bill-trend-up',
  },
  {
    id: 'budgetOverview',
    title: 'Budget Overview',
    description: 'Budget progress and summary',
    icon: 'fa-bullseye',
  },
  {
    id: 'savingsGoal',
    title: 'Savings Goal',
    description: 'Savings goals and progress',
    icon: 'fa-piggy-bank',
  },
  {
    id: 'netWorth',
    title: 'Net Worth',
    description: 'Net worth summary',
    icon: 'fa-building-columns',
  },
  {
    id: 'incomeBySource',
    title: 'Income by Source',
    description: 'Breakdown of income sources',
    icon: 'fa-wallet',
  },
  {
    id: 'cashBalance',
    title: 'Cash Balance',
    description: 'Total balance, accounts, and pending funds',
    icon: 'fa-building-columns',
  },
];
// Default display, layout, and ordering configuration for widgets
export const DASHBOARD_WIDGET_DEFAULT_CONFIG: DashboardWidgetConfig[] = [
  { id: 'cashFlowTrend', selected: true, layout: 'wide', order: 0 },
  { id: 'spendingByCategory', selected: true, layout: 'wide', order: 1 },
  { id: 'upcomingBills', selected: true, layout: 'wide', order: 2 },
  { id: 'recentTransactions', selected: true, layout: 'medium', order: 3 },
  { id: 'recentIncome', selected: true, layout: 'medium', order: 4 },
  { id: 'recentExpenses', selected: true, layout: 'medium', order: 5 },
  { id: 'budgetOverview', selected: true, layout: 'wide', order: 6 },
  { id: 'savingsGoal', selected: false, layout: 'medium', order: 7 },
  { id: 'netWorth', selected: false, layout: 'medium', order: 8 },
  { id: 'incomeBySource', selected: true, layout: 'wide', order: 9 },
  { id: 'cashBalance', selected: true, layout: 'medium', order: 10 },
];
// Returns shallow copy of widget configurations
export function cloneWidgetConfig(config: DashboardWidgetConfig[]): DashboardWidgetConfig[] {
  return config.map((item) => ({ ...item }));
}
// Sorts widget configurations by order index
export function sortWidgetConfig(config: DashboardWidgetConfig[]): DashboardWidgetConfig[] {
  return [...config].sort((a, b) => a.order - b.order);
}
