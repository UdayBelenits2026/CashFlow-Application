import { IncomeSourceType } from './income-source.model';

export type IncomeTransactionStatus = 'RECORDED' | 'POSTED' | 'PENDING' | 'CLEARED' | 'CANCELLED';

export type SortField = 'date' | 'amount' | 'source' | 'description';

export interface Income {
  id: string;
  userId?: string;
  accountId: string;
  accountName: string;
  incomeSourceId: string;
  sourceName: string;
  sourceType: IncomeSourceType;
  sourceColor?: string;
  amount: number;
  date: string;
  description: string;
  notes?: string;
  taxable: boolean;
  isRecurring?: boolean;
  status: IncomeTransactionStatus;
  paymentMethod?: string;
  receiptUrl?: string;
  receiptFileName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateIncomePayload {
  accountId: string;
  accountName: string;
  incomeSourceId: string;
  sourceName: string;
  sourceType: IncomeSourceType;
  sourceColor?: string;
  amount: number;
  date: string;
  description: string;
  notes?: string;
  taxable: boolean;
  isRecurring?: boolean;
  receiptUrl?: string;
  receiptFileName?: string;
}
