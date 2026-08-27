// Dashboard list items and onboarding interfaces
export interface DashboardItem {
  id: number | string;
  title: string;
  date: string;
  amount: number;
  icon: string;
  type: 'income' | 'expense' | 'bill';
}
export interface QuickAction {
  id: string;
  title: string;
  icon: string;
}
export interface OnboardingStep {
  id: string;
  title: string;
  actionId: string;
  completed: boolean;
}
export interface OnboardingAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  tone: 'blue' | 'green' | 'red' | 'purple';
}
// Transaction flow types used across filters and item typing
export const TRANSACTION_TYPE = {
  income: 'income',
  expense: 'expense',
  bill: 'bill',
} as const;
// Onboarding action identifiers
export const ONBOARDING_ACTION_ID = {
  connectAccount: 'connect-account',
  connectBank: 'connect-bank',
  completeProfile: 'complete-profile',
} as const;
