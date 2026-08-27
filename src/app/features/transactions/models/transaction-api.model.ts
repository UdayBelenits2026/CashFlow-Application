// Typed request/response contracts for the transactions backend (POST /api/v1/transactions).

export type TransactionApiType = 'EXPENSE' | 'INCOME';

// Expense create payload: includes merchantId + paymentMethod, never incomeSourceId.
export interface CreateExpenseTransactionRequest {
  accountId: number;
  transactionType: 'EXPENSE';
  transactionDate: string; // MM/DD/YYYY
  amount: number;
  currency: string;
  merchantId: number;
  categoryId: number;
  paymentMethod: string;
  description: string;
  notes?: string;
}

// Income create payload: includes incomeSourceId, never merchantId/paymentMethod.
export interface CreateIncomeTransactionRequest {
  accountId: number;
  transactionType: 'INCOME';
  transactionDate: string; // MM/DD/YYYY
  amount: number;
  currency: string;
  incomeSourceId: number;
  categoryId: number;
  description: string;
  notes?: string;
}

// Discriminated union of every supported create payload.
export type CreateTransactionRequest = CreateExpenseTransactionRequest | CreateIncomeTransactionRequest;

// Generic response envelope returned by the backend.
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  correlationId: string;
}

// Payload inside a successful create response (envelope.data).
export interface CreateTransactionResponse {
  transactionId: number;
  transactionType: TransactionApiType;
  amount: number;
  transactionDate: string; // ISO yyyy-MM-dd
  category: string;
  status: string;
}

// Generic { id, name } option for master-data dropdowns (accounts, categories, merchants, income sources).
export interface LookupItem {
  id: number;
  name: string;
}

// Server-side paged wrapper returned by GET /transactions.
export interface PagedResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Row shape returned in the transactions list.
export interface TransactionListItem {
  transactionId: number;
  date: string;
  description: string;
  type: string;
  amount: number;
  currency: string;
  category: string;
  merchant: string;
  accountName: string;
  status: string;
}

// Tag as returned by the backend.
export interface TransactionTag {
  tagId: number;
  tagName: string;
}

// Full transaction returned by GET /transactions/{id}.
export interface TransactionDetail {
  transactionId: number;
  accountId: number;
  transactionType: string;
  transactionDate: string;
  postingDate?: string;
  amount: number;
  currency: string;
  merchantId?: number;
  incomeSourceId?: number;
  categoryId: number;
  paymentMethod?: string;
  description: string;
  notes?: string;
  tags: TransactionTag[];
  status: string;
}

// Edit-form data returned by GET /transactions/{id}/edit.
export interface EditTransactionData {
  transactionId: number;
  accountId: number;
  transactionDate: string;
  postingDate?: string;
  amount: number;
  currency: string;
  merchantId?: number;
  merchantName?: string;
  incomeSourceId?: number;
  categoryId: number;
  description: string;
  paymentMethod?: string;
  referenceNumber?: string;
  notes?: string;
  attachmentUrl?: string;
  tags: TransactionTag[];
  bankSynced: boolean;
  readOnlyFieldNames: string[];
  accountEditable: boolean;
}

// Body for PUT /transactions/{id}/edit.
export interface UpdateTransactionRequest {
  transactionDate: string;
  accountId: number;
  description: string;
  categoryId: number;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  attachmentUrl?: string;
  tagIds: number[];
  updatedBy: number;
}

// Data inside a successful delete response.
export interface DeleteTransactionData {
  transactionId: number;
  status: string;
}

// --- Expense controller (Swagger /api/v1/expenses) ---

export interface ExpenseListItem {
  transactionId: number;
  accountId: number;
  transactionDate: string;
  amount: number;
  merchantId?: number;
  merchantName?: string;
  categoryId?: number;
  categoryName?: string;
  paymentMethod?: string;
  status: string;
}

export interface ExpenseListPage {
  content: ExpenseListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  filteredOutflow: number;
}

export interface ExpenseDetails {
  transactionId: number;
  accountId: number;
  transactionDate: string;
  amount: number;
  merchantId?: number;
  merchantName?: string;
  categoryId?: number;
  categoryName?: string;
  paymentMethod?: string;
  notes?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseCreateRequest {
  accountId: number;
  amount: number;
  transactionDate: string;
  merchantName?: string;
  categoryId?: number;
  paymentMethod?: string;
  notes?: string;
}

export type ExpenseUpdateRequest = ExpenseCreateRequest;

export interface ExpenseMutationResponse {
  transactionId: number;
  message: string;
}

export interface ExpenseListQuery {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
  accountId?: number;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  page?: number;
  size?: number;
  sort?: string;
}

// --- Spending controller (Swagger /api/v1/spending) ---

export interface TopCategory {
  categoryId: number;
  categoryName: string;
  amount: number;
}

export interface Comparison {
  totalSpendingChangePercent: number;
  transactionCountChange: number;
}

export interface TrendPoint {
  date: string;
  amount: number;
}

export interface CategorySummary {
  categoryId: number;
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface SpendingOverview {
  period: string;
  totalSpending: number;
  transactionCount: number;
  averageDaily: number;
  topCategory: TopCategory;
  comparisonToPrevious: Comparison;
  trend: TrendPoint[];
  categorySummary: CategorySummary[];
}

export interface CategoryBreakdown {
  categoryId: number;
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface RecentExpense {
  transactionId: number;
  merchantName: string;
  categoryName: string;
  amount: number;
  transactionDate: string;
}

export interface SpendingDashboard {
  period: string;
  totalSpending: number;
  totalSpendingChangePercent: number;
  categoryBreakdown: CategoryBreakdown[];
  recentExpenses: RecentExpense[];
}

export interface CategoryOption {
  categoryId: number;
  categoryName: string;
  icon?: string;
  color?: string;
}