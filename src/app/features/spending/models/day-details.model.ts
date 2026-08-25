/** Aggregated statistics for a single day's expenses. */
export interface DayDetailsStats {
  totalSpent: number;
  transactionCount: number;
  topMerchant: string;
  topCategory: string;
  categoryLabels: string[];
  categoryAmounts: number[];
  categoryColors: string[];
}
