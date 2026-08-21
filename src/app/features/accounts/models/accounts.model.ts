/** File purpose: Implements logic for app\features\accounts\models\accounts.model.ts. */
// Canonical account shape used across UI, store, and API boundaries.
export interface Account {
  id: string;
  accountName: string;
  accountType: string;
  accountNumber: string;
  balance: number;
  availableBalance: number;
  bankName?: string;
  routingNumber?: string;
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
}
