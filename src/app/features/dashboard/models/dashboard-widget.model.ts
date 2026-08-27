// Dashboard widget identifier types
export type DashboardWidgetId =
  | 'cashFlowTrend'
  | 'spendingByCategory'
  | 'upcomingBills'
  | 'recentTransactions'
  | 'recentIncome'
  | 'recentExpenses'
  | 'budgetOverview'
  | 'savingsGoal'
  | 'netWorth'
  | 'incomeBySource'
  | 'cashBalance';
export type DashboardWidgetLayout = 'medium' | 'wide';
// Dashboard widget configuration interfaces
export interface DashboardWidgetDefinition {
  id: DashboardWidgetId;
  title: string;
  description: string;
  icon: string;
}
export interface DashboardWidgetConfig {
  id: DashboardWidgetId;
  selected: boolean;
  layout: DashboardWidgetLayout;
  order: number;
}
export type CustomizeTab = 'available' | 'layout';
export type PreviewMode = 'desktop' | 'tablet';
// Widget ids rendered as charts
export const CHART_WIDGET_IDS: DashboardWidgetId[] = ['cashFlowTrend', 'spendingByCategory'];
// Widget layout width values
export const WIDGET_LAYOUT = {
  medium: 'medium',
  wide: 'wide',
} as const;
