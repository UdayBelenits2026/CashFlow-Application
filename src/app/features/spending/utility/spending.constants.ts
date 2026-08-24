import { SpendingCategoryItem } from '../models/spending-summary.model';

/** Symbol used for all monetary values in the spending module. */
export const CURRENCY_SYMBOL = '₹';

/** Factors to normalize recurring amounts to a monthly figure. */
export const MONTHS_PER_YEAR = 12;
export const WEEKS_PER_MONTH = 4.33;

/** Fallback category palette used by the add/split expense pickers when the store has none loaded. */
export const DEFAULT_CATEGORIES: SpendingCategoryItem[] = [
  { id: 'cat-1', name: 'Food & Dining', color: '#0F172A', amount: 0, percentage: 0, barWidth: '0%' },
  { id: 'cat-2', name: 'Shopping', color: '#1D4ED8', amount: 0, percentage: 0, barWidth: '0%' },
  { id: 'cat-3', name: 'Transportation', color: '#EA580C', amount: 0, percentage: 0, barWidth: '0%' },
  { id: 'cat-4', name: 'Utilities', color: '#D97706', amount: 0, percentage: 0, barWidth: '0%' },
  { id: 'cat-5', name: 'Entertainment', color: '#6366F1', amount: 0, percentage: 0, barWidth: '0%' },
  { id: 'cat-6', name: 'Health', color: '#10B981', amount: 0, percentage: 0, barWidth: '0%' },
  { id: 'cat-7', name: 'Travel', color: '#06B6D4', amount: 0, percentage: 0, barWidth: '0%' },
  { id: 'cat-8', name: 'Education', color: '#8B5CF6', amount: 0, percentage: 0, barWidth: '0%' },
  { id: 'cat-9', name: 'Others', color: '#64748B', amount: 0, percentage: 0, barWidth: '0%' }
];
