// Dropdown option definitions for the dashboard filter modal
export interface FilterOption {
  label: string;
  value: string;
}

export const DASHBOARD_DATE_RANGES: FilterOption[] = [
  { label: 'Custom Range', value: 'custom' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this-week' },
  { label: 'Last Week', value: 'last-week' },
  { label: 'This Month', value: 'this-month' },
  { label: 'Last Month', value: 'last-month' },
  { label: 'This Quarter', value: 'this-quarter' },
  { label: 'Last Quarter', value: 'last-quarter' },
  { label: 'This Year', value: 'this-year' },
  { label: 'Last Year', value: 'last-year' },
];

export const DASHBOARD_ACCOUNTS: FilterOption[] = [
  { label: 'All Accounts', value: '' },
  { label: 'Chase Checking •••• 1234', value: 'account-1' },
  { label: 'Savings Account •••• 5678', value: 'account-2' },
  { label: 'Credit Card •••• 9012', value: 'account-3' },
];

export const INCOME_EXPENSE_OPTIONS: FilterOption[] = [
  { label: 'All', value: '' },
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
];

export const DASHBOARD_CATEGORIES: FilterOption[] = [
  { label: 'All Categories', value: '' },
  { label: 'Housing', value: 'housing' },
  { label: 'Food & Dining', value: 'food-dining' },
  { label: 'Transportation', value: 'transportation' },
  { label: 'Utilities', value: 'utilities' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Salary', value: 'salary' },
  { label: 'Freelance', value: 'freelance' },
  { label: 'Other', value: 'other' },
];

export const TRANSACTION_TYPE_OPTIONS: FilterOption[] = [
  { label: 'All Types', value: '' },
  { label: 'Purchase', value: 'purchase' },
  { label: 'Payment', value: 'payment' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'Refund', value: 'refund' },
  { label: 'Withdrawal', value: 'withdrawal' },
  { label: 'Deposit', value: 'deposit' },
  { label: 'Adjustment', value: 'adjustment' },
];

export const DASHBOARD_TAGS: FilterOption[] = [
  { label: 'All Tags', value: '' },
  { label: 'Business', value: 'business' },
  { label: 'Personal', value: 'personal' },
  { label: 'Essential', value: 'essential' },
  { label: 'Travel', value: 'travel' },
  { label: 'Subscription', value: 'subscription' },
];

export const PAYMENT_METHOD_OPTIONS: FilterOption[] = [
  { label: 'All Methods', value: '' },
  { label: 'Cash', value: 'cash' },
  { label: 'Debit Card', value: 'debit-card' },
  { label: 'Credit Card', value: 'credit-card' },
  { label: 'Bank Transfer', value: 'bank-transfer' },
  { label: 'UPI', value: 'upi' },
  { label: 'Cheque', value: 'cheque' },
];

export const TRANSACTION_STATUS_OPTIONS: FilterOption[] = [
  { label: 'All Status', value: '' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export const RECURRING_OPTIONS: FilterOption[] = [
  { label: 'All', value: '' },
  { label: 'Recurring', value: 'true' },
  { label: 'Non-Recurring', value: 'false' },
];

export const DASHBOARD_BUDGETS: FilterOption[] = [
  { label: 'All Budgets', value: '' },
  { label: 'Housing Budget', value: 'housing-budget' },
  { label: 'Food Budget', value: 'food-budget' },
  { label: 'Transportation Budget', value: 'transport-budget' },
  { label: 'Entertainment Budget', value: 'entertainment-budget' },
  { label: 'Monthly Expenses', value: 'monthly-expenses' },
];
