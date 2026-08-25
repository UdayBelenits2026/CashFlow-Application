// --- Backend DTO shapes (income service); tolerant of field-name variations. ---

export interface IncomeOverviewDto {
  totalIncome?: number;
  incomeGrowthPercentage?: number;
  receiptsCount?: number;
  receiptsGrowthCount?: number;
  averageMonthly?: number;
  averageMonthlyGrowthPercentage?: number;
  topSourceName?: string;
  topSourceAmount?: number;
  topSourcePercentage?: number;
  activeSourcesCount?: number;
  taxableIncome?: number;
  totalRecurringExpected?: number;
}

export interface IncomeSourceDto {
  id?: string;
  sourceId?: number;
  name?: string;
  type?: string;
  description?: string;
  color?: string;
  icon?: string;
  taxable?: boolean;
  isRecurring?: boolean;
  expectedAmount?: number;
  frequency?: string;
  status?: string;
  accountId?: string;
  accountName?: string;
  totalReceivedYtd?: number;
  lastReceivedDate?: string | null;
  nextExpectedDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IncomeListItemDto {
  id?: string;
  incomeId?: number;
  userId?: string;
  accountId?: string;
  accountName?: string;
  incomeSourceId?: string;
  sourceName?: string;
  sourceType?: string;
  sourceColor?: string;
  amount?: number;
  date?: string;
  description?: string;
  notes?: string;
  taxable?: boolean;
  isRecurring?: boolean;
  status?: string;
  receiptUrl?: string;
  receiptFileName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IncomeTrendPointDto {
  xLabel?: string;
  thisPeriod?: number;
  lastPeriod?: number;
  projected?: number;
}

export interface RecurringIncomeDto {
  id?: string;
  recurringId?: number;
  userId?: string;
  incomeSourceId?: string;
  sourceName?: string;
  sourceType?: string;
  sourceColor?: string;
  accountId?: string;
  accountName?: string;
  expectedAmount?: number;
  frequency?: string;
  startDate?: string;
  nextIncomeDate?: string | null;
  endDate?: string | null;
  status?: string;
  lastRecordedDate?: string | null;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountRefDto {
  id?: string;
  accountId?: number;
  name?: string;
  type?: string;
  accountNumberLast4?: string;
  balance?: number;
  isActive?: boolean;
}
