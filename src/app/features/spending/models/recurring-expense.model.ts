export interface RecurringExpense {
  id: string;
  name: string;
  merchantName: string;
  amount: number;
  categoryName: string;
  frequency: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'YEARLY';
  billingCycle: string;
  nextBillingDate: string;
  accountName: string;
  isActive: boolean;
  icon?: string;
}

export interface CreateRecurringExpenseRequest {
  name: string;
  merchantName: string;
  amount: number;
  categoryName: string;
  frequency: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'YEARLY';
  billingCycle: string;
  nextBillingDate: string;
  accountName: string;
  isActive: boolean;
  icon?: string;
}
