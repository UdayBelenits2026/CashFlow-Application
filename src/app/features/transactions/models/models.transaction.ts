// UI-only view models for the transactions feature.
// Backend request/response contracts live in transaction-api.model.ts.
// Transaction type shown in the form. 'Transfer' is UI-only (no backend contract yet).
export type TransactionType = 'Income' | 'Expense' | 'Transfer';

// Payment methods offered for expense transactions.
export type PaymentMethod =
  | 'Debit Card'
  | 'Credit Card'
  | 'ACH'
  | 'Check'
  | 'Cash'
  | 'Transfer'
  | 'Wallet'
  | 'Other';

// Sortable columns for the server-paged list.
export type TransactionSortField = 'date' | 'description' | 'amount' | 'category' | 'accountName';
export type SortDirection = 'asc' | 'desc';

export interface TransactionSort {
  field: TransactionSortField;
  direction: SortDirection;
}

// List filters mapped to backend query params. Only accountId is server-supported today.
export interface TransactionFilters {
  accountId: number | null;
}

// Pagination summary consumed by the list template (derived from server totals).
export interface TransactionPageInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  from: number;
  to: number;
  pages: number[];
}

// Raw value produced by the transaction reactive form (form.getRawValue()).
export interface TransactionFormValue {
  type: TransactionType;
  date: string;
  amount: number | null;
  description: string;
  categoryId: number | null;
  accountId: number | null;
  merchantId: number | null;
  incomeSourceId: number | null;
  paymentMethod: string;
  referenceNumber: string;
  notes: string;
  attachmentUrl: string;
  tagIds: number[];
  fromAccountId: number | null;
  toAccountId: number | null;
}

// User-friendly Add-Transaction form values; dropdowns store numeric IDs (null = not selected yet).
export interface TransactionFormModel {
  type: 'Expense' | 'Income';
  accountId: number | null;
  categoryId: number | null;
  merchantId: number | null;
  incomeSourceId: number | null;
  paymentMethod: string;
  date: string;
  amount: number | null;
  description: string;
  notes?: string;
}

// Edit-form values mapped to the PUT contract.
export interface UpdateFormModel {
  date: string;
  accountId: number | null;
  description: string;
  categoryId: number | null;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  attachmentUrl?: string;
  tagIds: number[];
}
