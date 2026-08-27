// Filter state model for dashboard transactions
export interface DashboardFilterState {
  dateRange: string;
  fromDate: string;
  toDate: string;
  quickSelect: string;
  account: string;
  incomeExpense: string;
  category: string;
  merchant: string;
  minAmount: number | null;
  maxAmount: number | null;
  transactionType: string;
  tag: string;
  paymentMethod: string;
  transactionStatus: string;
  recurring: string;
  budget: string;
}
// Date range value requiring manual from/to selection
export const CUSTOM_DATE_RANGE = 'custom';
