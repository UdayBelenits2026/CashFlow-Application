export type TrendTab = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

/** An aggregated spending amount for a trend period. */
export interface TrendBucket {
  label: string;
  amount: number;
}

/** A single day's spending stat. */
export interface DayStat {
  label: string;
  amount: number;
}

/** Aggregated statistics for the trends view. */
export interface TrendStats {
  totalSpending: number;
  averageDaily: number;
  highestDay: DayStat;
  lowestDay: DayStat;
}
