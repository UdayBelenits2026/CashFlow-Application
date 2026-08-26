// Static option lists, step labels, and user-facing messages for the account form.
import { AccountCategoryConfig } from '../models/accounts.model';

// Types now live in the consolidated accounts model; re-exported for existing importers.
export type { AccountCategoryConfig, AccountFormMode } from '../models/accounts.model';

// Selectable option lists rendered by the account form template.
export const ACCOUNT_FORM_OPTIONS = {
  accountTypes: ['Bank Account', 'Credit Card', 'Cash / Wallet', 'Investment', 'Loan'],
  banks: ['Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank', 'Capital One', 'US Bank', 'Other'],
  currencies: ['INR'],
  accountStatuses: ['Active', 'Inactive', 'Closed'],
  accountCategories: ['Personal', 'Business', 'Joint'],
  loanTypes: ['Personal Loan', 'Home Loan', 'Auto Loan', 'Student Loan', 'Business Loan']
} as const;

// Labels shown in the 3-step add flow.
export const ACCOUNT_FORM_STEPS = ['Account Info', 'Additional Info', 'Review & Save'];

// Centralized feedback strings used by the form component.
export const ACCOUNT_FORM_MESSAGES = {
  duplicate: 'An account with the same type, number, and bank already exists.',
  requiredDetails: 'Please complete the required fields before continuing.',
  addSuccess: 'Account created successfully.',
  editSuccess: 'Account updated successfully.',
  editLoadError: 'We could not find the account you are trying to edit.'
};

// Single source of truth for account categories, their sub-types, and field rules.
export const ACCOUNT_CATEGORIES: readonly AccountCategoryConfig[] = [
  {
    label: 'Bank Account',
    description: 'Accounts held at banks and financial institutions',
    subTypes: ['Current', 'Savings', 'Salary'],
    requiresAccountNumber: true,
    requiresIfscCode: true,
    showBankName: true
  },
  {
    label: 'Credit Card',
    description: 'Credit card accounts and balances',
    subTypes: ['Standard'],
    requiresAccountNumber: false,
    requiresIfscCode: false,
    showBankName: true
  },
  {
    label: 'Cash / Wallet',
    description: 'Physical cash and digital wallets',
    subTypes: ['Cash', 'Digital Wallet'],
    requiresAccountNumber: false,
    requiresIfscCode: false,
    showBankName: false
  },
  {
    label: 'Investment',
    description: 'Investment and brokerage accounts',
    subTypes: ['Fixed Deposit', 'Mutual Funds', 'Stocks', 'Other Investments'],
    requiresAccountNumber: false,
    requiresIfscCode: false,
    showBankName: false
  },
  {
    label: 'Loan',
    description: 'Loans and credit accounts',
    subTypes: ['Education Loan', 'Home', 'Personal', 'Vehicle'],
    requiresAccountNumber: false,
    requiresIfscCode: false,
    showBankName: false
  },
  {
    label: 'Others',
    description: 'Other account types that do not belong to the predefined account categories.',
    subTypes: [],
    requiresAccountNumber: false,
    requiresIfscCode: false,
    showBankName: false
  }
];

// Sub-type options for a given account type label (case-insensitive).
export function getSubTypesForAccountType(accountType: string): string[] {
  return getAccountCategoryConfig(accountType)?.subTypes ?? [];
}

// Full category configuration for a given account type label (case-insensitive).
export function getAccountCategoryConfig(accountType: string): AccountCategoryConfig | undefined {
  const key = (accountType || '').toLowerCase();
  return ACCOUNT_CATEGORIES.find((category) => category.label.toLowerCase() === key);
}
