import { IncomeOverviewData, IncomeTrendPoint } from '../models/income-summary.model';
import { IncomeSource } from '../models/income-source.model';
import { Income } from '../models/income.model';
import { RecurringIncome } from '../models/recurring-income.model';
import { AccountRef } from '../models/account-ref.model';

export const incomeFeatureKey = 'income';

export interface IncomeFilters {
  searchTerm: string;
  sourceId: string | null;
  accountId: string | null;
  taxable: boolean | null;
  startDate: string | null;
  endDate: string | null;
  minAmount: number | null;
  maxAmount: number | null;
  sortBy: 'date' | 'amount' | 'source' | 'description';
  sortOrder: 'asc' | 'desc';
}

export interface IncomeState {
  overview: IncomeOverviewData | null;
  sources: IncomeSource[];
  trendPoints: IncomeTrendPoint[];
  incomes: Income[];
  recurringIncomes: RecurringIncome[];
  accounts: AccountRef[];
  filters: IncomeFilters;
  selectedMonth: { year: number; month: number };
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

export const initialIncomeFilters: IncomeFilters = {
  searchTerm: '',
  sourceId: null,
  accountId: null,
  taxable: null,
  startDate: null,
  endDate: null,
  minAmount: null,
  maxAmount: null,
  sortBy: 'date',
  sortOrder: 'desc'
};

const now = new Date();

export const initialIncomeState: IncomeState = {
  overview: null,
  sources: [],
  trendPoints: [],
  incomes: [],
  recurringIncomes: [],
  accounts: [],
  filters: initialIncomeFilters,
  selectedMonth: { year: now.getFullYear(), month: now.getMonth() + 1 },
  isLoading: false,
  error: null,
  successMessage: null
};
