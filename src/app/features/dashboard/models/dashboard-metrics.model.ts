// Dashboard metric and chart data interfaces
export interface CashBalanceData {
  totalBalance: number;
  inAccounts: number;
  pending: number;
}
export interface BudgetCategoryData {
  category: string;
  spent: number;
  limit: number;
  color: string;
}
export type BudgetCategoryProgress = BudgetCategoryData;
export interface SavingsGoalData {
  goalName: string;
  savedAmount: number;
  targetAmount: number;
  dueDate: string;
}
export interface IncomeSourceData {
  source: string;
  amount: number;
  color: string;
}
export type IncomeSourceItem = IncomeSourceData;
export interface NetWorthData {
  totalAssets: number;
  totalLiabilities: number;
}
// Chart dataset and configuration interfaces
export interface ChartDataset {
  label?: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string | string[];
  pointBackgroundColor?: string;
  fill?: boolean;
  borderWidth?: number;
  hoverOffset?: number;
}
export interface LineChartData {
  labels: string[];
  datasets: ChartDataset[];
}
export interface DoughnutChartData {
  labels: string[];
  datasets: ChartDataset[];
  total: number;
}
