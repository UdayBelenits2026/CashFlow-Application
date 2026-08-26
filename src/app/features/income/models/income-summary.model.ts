import { IncomeSourceType } from './income-source.model';

export type ReportPeriod = 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR';

export interface IncomeOverviewData {
  totalIncome: number;
  incomeGrowthPercentage: number;
  receiptsCount: number;
  receiptsGrowthCount: number;
  averageMonthly: number;
  averageMonthlyGrowthPercentage: number;
  topSourceName: string;
  topSourceAmount: number;
  topSourcePercentage: number;
  activeSourcesCount: number;
  taxableIncome: number;
  totalRecurringExpected: number;
}

export interface IncomeSourceReportItem {
  id?: string;
  sourceId: string;
  sourceName: string;
  sourceType: IncomeSourceType;
  amount: number;
  percentage: number;
  color: string;
  icon?: string;
  barWidth?: string;
  growthAmount?: number;
  growthPercentage?: number;
  transactionCount?: number;
}

export interface IncomeTrendPoint {
  xLabel: string;
  thisPeriod: number;
  lastPeriod: number;
  projected?: number;
}

export interface UpcomingIncomeItem {
  recurringId: string;
  sourceName: string;
  sourceType: IncomeSourceType;
  sourceColor: string;
  accountName: string;
  amount: number;
  expectedDate: string;
  daysRemaining: number;
  status: 'UPCOMING' | 'DUE_TODAY' | 'OVERDUE';
}
