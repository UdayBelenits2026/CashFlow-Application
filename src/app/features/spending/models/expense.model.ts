/**
 * Payment method options supported for expense recording.
 */
export type PaymentMethod = 'DEBIT_CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH';

/**
 * Status of an expense transaction.
 */
export type ExpenseStatus = 'CLEARED' | 'PENDING';


export interface Expense {
  id: string;
  amount: number;
  date: string; // ISO format (YYYY-MM-DD)
  merchantName: string;
  merchantId?: string;
  merchantLogo?: string;
  categoryId: string;
  categoryName: string;
  categoryColor?: string;
  categoryIcon?: string;
  accountId: string;
  accountName: string;
  paymentMethod: PaymentMethod;
  tags?: string[];
  notes?: string;
  receiptUrl?: string;
  receiptFileName?: string;
  isRecurring?: boolean;
  recurringFrequency?: 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY' | 'YEARLY';
  status: ExpenseStatus;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Request payload for creating a new expense.
 */
export interface CreateExpenseRequest {
  amount: number;
  date: string;
  merchantName: string;
  categoryId: string;
  accountId: string;
  paymentMethod: PaymentMethod;
  tags?: string[];
  notes?: string;
  receiptUrl?: string;
  isRecurring?: boolean;
  splits?: SplitExpenseItem[];
}

/**
 * Request payload for updating an existing expense.
 */
export interface UpdateExpenseRequest extends Partial<CreateExpenseRequest> {
  id: string;
}

/**
 * Item structure for splitting an expense across multiple categories.
 */
export interface SplitExpenseItem {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage?: number;
  notes?: string;
}
