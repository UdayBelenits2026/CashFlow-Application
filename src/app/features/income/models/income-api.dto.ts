// --- Standard Microservice Response Envelope ---

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  correlationId?: string;
  errors?: unknown[];
}

// --- Backend DTO shapes (income service); tolerant of field-name variations ---

export interface TopSourceDto {
  incomeSourceId?: number;
  sourceName?: string;
  name?: string;
  amount?: number;
  percentage?: number;
}

export interface IncomeOverviewDto {
  totalIncome?: number;
  incomeGrowthPercentage?: number;
  receiptsCount?: number;
  receiptsGrowthCount?: number;
  averageMonthly?: number;
  averageMonthlyGrowthPercentage?: number;
  topSource?: TopSourceDto;
  topSourceName?: string;
  topSourceAmount?: number;
  topSourcePercentage?: number;
  activeSourcesCount?: number;
  taxableIncome?: number;
  recurringIncome?: number;
  totalRecurringExpected?: number;
}

export interface IncomeSourceDto {
  id?: string;
  sourceId?: number;
  incomeSourceId?: number;
  name?: string;
  sourceName?: string;
  type?: string;
  sourceType?: string;
  description?: string;
  sourceDescription?: string;
  color?: string;
  icon?: string;
  taxable?: boolean;
  isRecurring?: boolean;
  recurring?: boolean;
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
  transactionId?: number;
  userId?: string;
  accountId?: string | number;
  accountName?: string;
  incomeSourceId?: string | number;
  sourceName?: string;
  sourceType?: string;
  sourceColor?: string;
  amount?: number;
  date?: string;
  incomeDate?: string;
  transactionDate?: string;
  paymentMethod?: string;
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

export interface IncomePageDto {
  content?: IncomeListItemDto[];
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
}

export interface IncomeTrendPointDto {
  xLabel?: string;
  period?: string;
  date?: string;
  thisPeriod?: number;
  amount?: number;
  lastPeriod?: number;
  projected?: number;
}

export interface RecurringIncomeDto {
  id?: string;
  recurringId?: number;
  userId?: string;
  incomeSourceId?: string | number;
  sourceName?: string;
  sourceType?: string;
  sourceColor?: string;
  accountId?: string | number;
  accountName?: string;
  expectedAmount?: number;
  frequency?: string;
  startDate?: string;
  nextDueDate?: string | null;
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

export interface IncomeCalendarDayDto {
  date: string;
  expectedIncome: number;
  recordedIncome: number;
  items?: {
    sourceName: string;
    amount: number;
    status: string;
  }[];
}

export interface IncomeCalendarDto {
  month?: string;
  days?: IncomeCalendarDayDto[];
}

export interface IncomeSourceReportItemDto {
  incomeSourceId?: number;
  sourceName?: string;
  amount?: number;
  percentage?: number;
}

export interface IncomeSourceReportDto {
  totalIncome?: number;
  sources?: IncomeSourceReportItemDto[];
}
