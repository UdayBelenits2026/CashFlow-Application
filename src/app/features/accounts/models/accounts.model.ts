import { ChartConfiguration } from 'chart.js';

// Canonical account shape used across UI, store, and API boundaries.
export interface Account {
  id: string;
  accountName: string;
  accountType: string;
  accountSubType?: string;
  accountNumber: string;
  balance: number;
  availableBalance: number;
  bankName?: string;
  ifscCode?: string;
  currency: string;
  openDate: string;
  status: string;
  overdraftLimit?: number;
  creditLimit?: number;
  institutionName?: string;
  interestRate?: number;
  loanType?: string;
  loanBalance?: number;
  accountCategory?: string;
  notes?: string;
  description?: string;
}

// Typed default account object used by account-card as a safe fallback input.
export const DEFAULT_ACCOUNT: Readonly<Account> = {
  id: '',
  accountName: '',
  accountType: 'Bank Account',
  accountNumber: '',
  balance: 0,
  availableBalance: 0,
  currency: 'USD',
  openDate: '',
  status: 'Active'
};

// Transaction shape used for account activity history.
export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category?: string;
  type?: string;
  status?: string;
  merchant?: string;
}

// Payload accepted when creating an account (id is assigned by the backend).
export type CreateAccountRequest = Omit<Account, 'id'> & { id?: string };

// A selectable account category (stored as an account sub-type) shown on the categories page.
export interface AccountCategory {
  id: string;
  accountType: string;
  name: string;
}

// Payload accepted when creating a category (id is assigned by the backend).
export type CreateAccountCategoryRequest = { accountType: string; name: string };

// Selectable currency option (code is the form value, label is the display text).
export interface CurrencyOption {
  code: string;
  label: string;
}

// Dropdown option lists loaded from the backend for the account form.
export interface AccountFormOptions {
  accountTypes: string[];
  banks: string[];
  currencies: CurrencyOption[];
  subTypes: string[];
}

// Empty option lists used before the form options are fetched.
export const initialAccountFormOptions: AccountFormOptions = {
  accountTypes: [],
  banks: [],
  currencies: [],
  subTypes: []
};

// --- Account form models ---
export type AccountFormMode = 'add' | 'edit';

// Strongly-typed representation of the reactive account form value.
export interface AccountFormValue {
  accountType: string;
  accountSubType: string;
  bankName: string;
  accountNickname: string;
  accountNumber: string;
  ifscCode: string;
  currency: string;
  openingBalance: number | null;
  openDate: string;
  accountStatus: string;
  description: string;
  institutionName: string;
  creditLimit: number | null;
  loanType: string;
  loanBalance: number | null;
  interestRate: number | null;
  accountCategory: string;
  notes: string;
}

// Behavior flags derived from the selected account type.
export interface AccountFormFlags {
  isLoanType: boolean;
  isCreditCardType: boolean;
  showBankName: boolean;
  showAccountNumber: boolean;
  showIfscCode: boolean;
  showInstitutionName: boolean;
}

// Single-category configuration (sub-types + field rules).
export interface AccountCategoryConfig {
  label: string;
  description: string;
  subTypes: string[];
  requiresAccountNumber: boolean;
  requiresIfscCode: boolean;
  showBankName: boolean;
}

// View-state contract for the account details page.
export interface AccountDetailsViewState {
  accountId: string;
  account: Account | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  actionsOpen: boolean;
  historyNotice: string | null;
  showAllTransactions: boolean;
}

// Initial values for the account details view state.
export const initialAccountDetailsViewState: AccountDetailsViewState = {
  accountId: '',
  account: null,
  transactions: [],
  loading: false,
  error: null,
  actionsOpen: false,
  historyNotice: null,
  showAllTransactions: false
};

// Aggregated balance for a single account type on the accounts list chart.
export interface AccountTypeBalance {
  label: string;
  accountType: Account['accountType'];
  color: string;
  balance: number;
  percentage: number;
}

// View model backing the accounts list balance-by-type doughnut chart.
export interface AccountTypeChartViewModel {
  labels: string[];
  total: number;
  balances: AccountTypeBalance[];
  datasets: ChartConfiguration<'doughnut'>['data']['datasets'];
}

// Account types and slice colors used to build the accounts list balance chart.
export const ACCOUNT_TYPE_CHART_CONFIG = [
  { label: 'Bank Accounts', accountType: 'Bank Account', color: '#2563eb' },
  { label: 'Credit Cards', accountType: 'Credit Card', color: '#5b8def' },
  { label: 'Cash / Wallet', accountType: 'Cash / Wallet', color: '#f59e0b' },
  { label: 'Investment', accountType: 'Investment', color: '#f97316' },
  { label: 'Loan', accountType: 'Loan', color: '#7c3aed' }
] as const;
