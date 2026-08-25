import { IncomeFrequency, IncomeSourceType } from './income-source.model';

export type RecurringIncomeStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface RecurringIncome {
  id: string;
  userId?: string;
  incomeSourceId: string;
  sourceName: string;
  sourceType: IncomeSourceType;
  sourceColor?: string;
  accountId: string;
  accountName: string;
  expectedAmount: number;
  frequency: IncomeFrequency;
  startDate: string;
  nextIncomeDate: string | null;
  endDate?: string | null;
  status: RecurringIncomeStatus;
  lastRecordedDate?: string | null;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
