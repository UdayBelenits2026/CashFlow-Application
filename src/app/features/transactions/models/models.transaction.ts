export type TransactionType = 'Income' | 'Expense' | 'Transfer';

// Payment methods available for expense/income transactions.
export type PaymentMethod = 'Debit Card' | 'Credit Card' | 'ACH' | 'Check' | 'Cash' | 'Transfer' | 'Wallet' | 'Other';

// Where a transaction originated; institution-controlled records restrict editing.
export type TransactionSource = 'Manual' | 'File Import' | 'Bank Sync' | 'Admin';

// Canonical transaction shape served by the transactions API.
export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  accountId: string;
  accountName: string;
  type: TransactionType;
  amount: number;
  merchant?: string;
  paymentMethod?: PaymentMethod | '';
  referenceNumber?: string;
  notes?: string;
  tags?: string[];
  fromAccountId?: string;
  toAccountId?: string;
  source?: TransactionSource;
  status?: string;
}

// Active filters applied to the transaction list ('' / null means "all").
export interface TransactionFilters {
  accountId: string;
  category: string;
  type: TransactionType | '';
  startDate: string;
  endDate: string;
  minAmount: number | null;
  maxAmount: number | null;
}

// Payload sent when creating (or duplicating) a transaction; the backend assigns the id.
export type CreateTransactionRequest = Omit<Transaction, 'id'>;

// Sortable columns and direction for the transaction list.
export type TransactionSortField = 'date' | 'description' | 'amount' | 'category' | 'accountName';
export type SortDirection = 'asc' | 'desc';

export interface TransactionSort {
  field: TransactionSortField;
  direction: SortDirection;
}

// Account option used by the account filter dropdown.
export interface AccountOption {
  id: string;
  name: string;
}

// Pagination summary consumed by the list template.
export interface TransactionPageInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  from: number;
  to: number;
  pages: number[];
}
