export type IncomeSourceType =
  | 'Salary'
  | 'Freelance'
  | 'Business'
  | 'Rental'
  | 'Investment'
  | 'Dividend'
  | 'Interest'
  | 'Gift'
  | 'Refund'
  | 'Other';

export type IncomeSourceStatus = 'ACTIVE' | 'INACTIVE';
export type IncomeFrequency = 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | 'IRREGULAR';

export interface IncomeSource {
  id: string;
  name: string;
  type: IncomeSourceType;
  description?: string;
  color?: string;
  icon?: string;
  taxable: boolean;
  isRecurring: boolean;
  expectedAmount?: number;
  frequency?: IncomeFrequency;
  status: IncomeSourceStatus;
  accountId?: string;
  accountName?: string;
  totalReceivedYtd?: number;
  lastReceivedDate?: string | null;
  nextExpectedDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
