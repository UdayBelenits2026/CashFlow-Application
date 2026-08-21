export const ACCOUNT_FORM_OPTIONS = {
  accountTypes: ['Bank Account', 'Credit Card', 'Cash / Wallet', 'Investment', 'Loan'],
  banks: ['Chase Bank', 'Bank of America', 'Wells Fargo', 'Citi', 'Capital One'],
  currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
  accountStatuses: ['Active', 'Inactive'],
  accountCategories: ['Personal', 'Business', 'Savings', 'Debt', 'Investment'],
  loanTypes: ['Home Loan', 'Auto Loan', 'Personal Loan', 'Student Loan', 'Business Loan', 'Other']
} as const;

export const ACCOUNT_FORM_MESSAGES = {
  accountTypeRequired: 'Please select an account type.',
  bankRequired: 'Please select a bank.',
  nicknameRequired: 'Account nickname is required.',
  nicknameMaxLength: 'Account nickname cannot exceed 50 characters.',
  accountNumberRequired: 'Account number is required.',
  accountNumberInvalid: 'Please enter a valid account number.',
  routingRequired: 'Routing number is required.',
  routingInvalid: 'Please enter a valid 9-digit routing number.',
  currencyRequired: 'Please select a currency.',
  openingBalanceRequired: 'Opening balance is required.',
  amountInvalid: 'Please enter a valid amount.',
  requiredDetails: 'Please fill the required details.',
  addSuccess: 'Account added successfully.',
  updateSuccess: 'Account updated successfully.',
  addFailure: 'We couldn\'t add the account. Please try again.',
  updateFailure: 'We couldn\'t update the account. Please try again.',
  duplicate: 'This account appears to already exist. Please review the account details.'
} as const;

export const ACCOUNT_FORM_STEPS = ['Account Info', 'Additional Info', 'Review & Save'] as const;
export const ACCOUNT_FORM_DEFAULTS = {
  editLoadError: 'Unable to load account details.'
} as const;

export type AccountFormMode = 'add' | 'edit';