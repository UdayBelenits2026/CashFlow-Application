import { IncomeSource, IncomeSourceType } from '../models/income-source.model';

/** Currency symbol used across the income module */
export const CURRENCY_SYMBOL = '₹';

export const MONTHS_PER_YEAR = 12;
export const WEEKS_PER_MONTH = 4.33;

export interface IncomeTypeOption {
  type: IncomeSourceType;
  label: string;
  color: string;
  icon: string;
  defaultTaxable: boolean;
}

export const INCOME_TYPE_OPTIONS: IncomeTypeOption[] = [
  { type: 'Salary', label: 'Salary / Wages', color: '#10B981', icon: 'briefcase', defaultTaxable: true },
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

export const DEFAULT_INCOME_SOURCES: IncomeSource[] = [
  {
    id: 'src-1',
    name: 'Tech Corp Salary',
    type: 'Salary',
    color: '#10B981',
    icon: 'briefcase',
    taxable: true,
    isRecurring: true,
    expectedAmount: 5500,
    frequency: 'MONTHLY',
    status: 'ACTIVE',
    totalReceivedYtd: 27500
  },
  {
    id: 'src-2',
    name: 'Freelance UI/UX',
    type: 'Freelance',
    color: '#3B82F6',
    icon: 'laptop-code',
    taxable: true,
    isRecurring: false,
    expectedAmount: 1200,
    frequency: 'IRREGULAR',
    status: 'ACTIVE',
    totalReceivedYtd: 6800
  },
  {
    id: 'src-3',
    name: 'Rental Property - Apt 4B',
    type: 'Rental',
    color: '#8B5CF6',
    icon: 'house-chimney',
    taxable: true,
    isRecurring: true,
    expectedAmount: 1200,
    frequency: 'MONTHLY',
    status: 'ACTIVE',
    totalReceivedYtd: 6000
  }
];
