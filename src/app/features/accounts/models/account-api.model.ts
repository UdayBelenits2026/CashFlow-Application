// Typed request/response contracts for the Cashflow Account service
// (environment.accountsApiBaseUrl). Every endpoint returns the { success, data, ... }
// envelope; services unwrap `.data` before returning to the store.

export interface AccountApiResponse<T> {
  correlationId?: string;
  statusCode?: number;
  statuscode?: number;
  message: string;
  success: boolean;
  data: T;
}

export type AccountTypeCode = 'BANK' | 'CREDIT_CARD' | 'CASH_WALLET' | 'INVESTMENT' | 'LOAN';

// GET /account-types/type-names
export interface AccountTypeDto {
  account_type_id: number;
  typeCode: AccountTypeCode;
  typeName: string;
  description: string;
}

// GET /account-types/subtypes?accountTypeId
export interface AccountSubtypeDto {
  account_subtype_id: number;
  subtypeCode: string;
  subtypeName: string;
  description: string;
}

// GET /account-types/institutions?accountTypeId
export interface InstitutionDto {
  institution_id: number;
  institutionCode: string;
  institutionName: string;
}

// GET /account-types/{userId}/counts
export interface AccountTypeCountDto {
  accountTypeId: number;
  typeCode: AccountTypeCode;
  typeName: string;
  description: string;
  accountCount: number;
}

// GET /accounts/{userId}/overview
export interface AccountOverviewTypeSummaryDto {
  accountTypeId: number;
  accountTypeName: string;
  totalBalance: number;
  percentage: number;
}

export interface AccountOverviewItemDto {
  accountId: number;
  accountName: string;
  accountTypeName: string;
  balance: number;
  maskedIdentifier: string | null;
  status: string;
}

export interface AccountOverviewDto {
  totalBalance: number;
  totalAccounts: number;
  accountsByType: AccountOverviewTypeSummaryDto[];
  accounts: AccountOverviewItemDto[];
}

// GET /accounts/{accountId}?userId — type-specific detail unions.
export interface BankTypeDetails {
  accountNumberLast4: string;
  ifscCode: string;
}
export interface CreditCardTypeDetails {
  cardNumberLast4: string;
  creditLimit: number;
  billingCycleDay: number;
  paymentDueDay: number;
}
export interface CashWalletTypeDetails {
  providerName: string | null;
  walletIdentifier: string | null;
}
export interface InvestmentTypeDetails {
  platformName: string;
  investedAmount: number;
}
export interface LoanTypeDetails {
  loanAccountNumberLast4: string;
  loanAmount: number;
  interestRate: number;
  emiAmount: number;
  emiDueDay: number;
}
export type AccountTypeSpecificDetails =
  | BankTypeDetails
  | CreditCardTypeDetails
  | CashWalletTypeDetails
  | InvestmentTypeDetails
  | LoanTypeDetails;

export interface AccountRecentTransactionDto {
  date: string;
  description: string;
  amount: number;
}

export interface AccountDetailDto {
  accountId: number;
  accountName: string;
  accountTypeName: string;
  typeCode: AccountTypeCode;
  institutionName?: string;
  currencyCode: string;
  currentBalance: number;
  availableBalance: number | null;
  status: string;
  typeSpecificDetails: AccountTypeSpecificDetails;
  recentTransactions: AccountRecentTransactionDto[];
  transactionsLoadFailed: boolean;
}

// POST /accounts — typed create request per account type.
export interface CreateAccountBankDetails {
  accountNumber: string;
  ifscCode: string;
}
export interface CreateAccountCreditCardDetails {
  cardNumber: string;
  creditLimit: number;
  billingCycleDay: number;
  paymentDueDay: number;
}
export interface CreateAccountCashWalletDetails {
  providerName: string;
  walletIdentifier: string;
}
export interface CreateAccountInvestmentDetails {
  platformName: string;
  investedAmount: number;
}
export interface CreateAccountLoanDetails {
  loanAccountNumber: string;
  originalLoanAmount: number;
  interestRate: number;
  emiAmount: number;
  emiDueDay: number;
}

export interface CreateAccountApiRequest {
  accountTypeId: number;
  accountSubtypeId: number;
  institutionId?: number;
  accountName: string;
  openingBalance: number;
  currencyCode: string;
  bankDetails?: CreateAccountBankDetails;
  creditCardDetails?: CreateAccountCreditCardDetails;
  cashWalletDetails?: CreateAccountCashWalletDetails;
  investmentDetails?: CreateAccountInvestmentDetails;
  loanDetails?: CreateAccountLoanDetails;
}

// POST /accounts response data.
export interface CreatedAccountDto {
  accountId: number;
  accountName: string;
  accountTypeId: number;
  accountTypeCode: AccountTypeCode;
  accountTypeName: string;
  accountSubtypeId: number;
  accountSubtypeCode: string;
  accountSubtypeName: string;
  institutionId: number | null;
  institutionName: string | null;
  currencyCode: string;
  openingBalance: number;
  currentBalance: number;
  availableBalance: number | null;
  status: string;
  details: AccountTypeSpecificDetails;
}

// GET /accounts/{accountId}/sensitive-details — shape varies by account type.
export interface SensitiveDetailsDto {
  bankDetails?: { accountNumber: string };
  creditCardDetails?: { cardNumber: string };
  loanDetails?: { loanAccountNumber: string };
  cashWalletDetails?: { walletIdentifier: string };
  [key: string]: unknown;
}

// Fixed account-type ids (typeCode is the stable key across the backend).
export const ACCOUNT_TYPE_ID_BY_CODE: Record<AccountTypeCode, number> = {
  BANK: 1,
  CREDIT_CARD: 2,
  CASH_WALLET: 3,
  INVESTMENT: 4,
  LOAN: 5,
};

// Maps the UI account-type label to the backend typeCode.
export const ACCOUNT_TYPE_CODE_BY_LABEL: Record<string, AccountTypeCode> = {
  'Bank Account': 'BANK',
  'Credit Card': 'CREDIT_CARD',
  'Cash / Wallet': 'CASH_WALLET',
  Investment: 'INVESTMENT',
  Loan: 'LOAN',
};
