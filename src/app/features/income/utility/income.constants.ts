import { IncomeSourceType } from '../models/income-source.model';

/** Currency symbol used across the income module */
export const CURRENCY_SYMBOL = '₹';

export const MONTHS_PER_YEAR = 12;
export const WEEKS_PER_MONTH = 4.33;

/** Milliseconds in a day, for whole-day date math. */
export const MS_PER_DAY = 86_400_000;

/** Default label shown when an income has no resolved destination account. */
export const MAIN_ACCOUNT_LABEL = 'Main Account';

/** Shared palette for income charts (line/doughnut datasets). */
export const CHART_COLORS = {
  primary: '#2563EB',
  muted: '#94A3B8',
  accent: '#3B82F6',
  white: '#ffffff'
} as const;

export interface IncomeTypeOption {
  type: IncomeSourceType;
  label: string;
  color: string;
  icon: string;
  defaultTaxable: boolean;
}

export const INCOME_TYPE_OPTIONS: IncomeTypeOption[] = [
  { type: 'Salary', label: 'Salary / Wages', color: '#2563EB', icon: 'briefcase', defaultTaxable: true },
  { type: 'Freelance', label: 'Freelance / Contract', color: '#3B82F6', icon: 'laptop-code', defaultTaxable: true },
  { type: 'Business', label: 'Business / Self-Employed', color: '#8B5CF6', icon: 'building', defaultTaxable: true },
  { type: 'Rental', label: 'Rental Income', color: '#6366F1', icon: 'house-chimney', defaultTaxable: true },
  { type: 'Investment', label: 'Capital Gains / Investment', color: '#EC4899', icon: 'arrow-trend-up', defaultTaxable: true },
  { type: 'Dividend', label: 'Dividend Payouts', color: '#F59E0B', icon: 'chart-pie', defaultTaxable: false },
  { type: 'Interest', label: 'Savings Interest', color: '#06B6D4', icon: 'piggy-bank', defaultTaxable: true },
  { type: 'Gift', label: 'Gift / Grant', color: '#14B8A6', icon: 'gift', defaultTaxable: false },
  { type: 'Refund', label: 'Refund / Reimbursement', color: '#84CC16', icon: 'rotate-left', defaultTaxable: false },
  { type: 'Other', label: 'Other Miscellaneous', color: '#64748B', icon: 'wallet', defaultTaxable: false }
];
