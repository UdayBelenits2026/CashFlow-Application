import { SelectOption } from './account-link.model';

export interface ProfileSetupForm {
  fullName: string;
  email: string;
  currency: string;
  financialGoal: string;
  monthlyIncomeGoal: number | null;
}

export interface ProfileSetupValidationErrors {
  fullName?: string;
  email?: string;
  financialGoal?: string;
  monthlyIncomeGoal?: string;
}

export const FINANCIAL_GOAL_OPTIONS: SelectOption[] = [
  { label: 'Select primary financial goal', value: '' },
  { label: 'Track Daily Expenses & Spending', value: 'track_spending' },
  { label: 'Build Emergency Savings', value: 'build_savings' },
  { label: 'Pay Off Debt / Loans', value: 'pay_debt' },
  { label: 'Stick to a Monthly Budget', value: 'monthly_budget' },
  { label: 'Invest & Grow Wealth', value: 'investing' },
];
