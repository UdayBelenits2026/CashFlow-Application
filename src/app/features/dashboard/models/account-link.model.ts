export type AccountLinkTab = 'bank' | 'credit-card';

export interface BankAccountForm {
  bankName: string;
  accountType: string;
  routingNumber: string;
  accountNumber: string;
  nickname: string;
}

export interface CreditCardForm {
  cardIssuer: string;
  cardType: string;
  last4Digits: string;
  nickname: string;
}

export interface AccountLinkPayload {
  linkType: AccountLinkTab;
  bankAccount?: BankAccountForm;
  creditCard?: CreditCardForm;
}

export interface AccountLinkValidationErrors {
  bankName?: string;
  accountType?: string;
  routingNumber?: string;
  accountNumber?: string;
  nickname?: string;
  cardIssuer?: string;
  cardType?: string;
  last4Digits?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export const BANK_OPTIONS: SelectOption[] = [
  { label: 'Select your bank', value: '' },
  { label: 'Chase Bank', value: 'chase' },
  { label: 'Bank of America', value: 'bofa' },
  { label: 'Wells Fargo', value: 'wells_fargo' },
  { label: 'Capital One', value: 'capital_one' },
  { label: 'Citibank', value: 'citibank' },
  { label: 'TD Bank', value: 'td_bank' },
  { label: 'US Bank', value: 'us_bank' },
  { label: 'PNC Bank', value: 'pnc' },
  { label: 'Fidelity', value: 'fidelity' },
  { label: 'Other Financial Institution', value: 'other' },
];

export const ACCOUNT_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Select account type', value: '' },
  { label: 'Checking Account', value: 'checking' },
  { label: 'Savings Account', value: 'savings' },
  { label: 'Money Market Account', value: 'money_market' },
  { label: 'Business Checking', value: 'business_checking' },
  { label: 'Investment Account', value: 'investment' },
];

export const CARD_ISSUER_OPTIONS: SelectOption[] = [
  { label: 'Select card issuer / bank', value: '' },
  { label: 'Chase Visa / Mastercard', value: 'chase' },
  { label: 'American Express', value: 'amex' },
  { label: 'Capital One', value: 'capital_one' },
  { label: 'Discover Card', value: 'discover' },
  { label: 'Bank of America', value: 'bofa' },
  { label: 'Citi Card', value: 'citi' },
];

export const CARD_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Select card type', value: '' },
  { label: 'Rewards Credit Card', value: 'rewards' },
  { label: 'Cash Back Card', value: 'cashback' },
  { label: 'Travel & Dining Card', value: 'travel' },
  { label: 'Business Credit Card', value: 'business' },
  { label: 'Balance Transfer Card', value: 'balance_transfer' },
];
