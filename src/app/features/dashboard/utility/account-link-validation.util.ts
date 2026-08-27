import {
  AccountLinkTab,
  AccountLinkValidationErrors,
  ACCOUNT_LINK_TAB,
} from '../models/account-link.model';

export interface AccountLinkFormValues {
  bankName: string;
  accountType: string;
  routingNumber: string;
  accountNumber: string;
  bankNickname: string;
  cardIssuer: string;
  cardType: string;
  last4Digits: string;
  cardNickname: string;
}

// Builds validation errors for the active account-link tab
export function buildAccountLinkErrors(
  tab: AccountLinkTab,
  values: AccountLinkFormValues,
): AccountLinkValidationErrors {
  const errs: AccountLinkValidationErrors = {};

  if (tab === ACCOUNT_LINK_TAB.bank) {
    const bank = values.bankName.trim();
    const type = values.accountType.trim();
    const routing = values.routingNumber.trim();
    const accNum = values.accountNumber.trim();

    if (!bank) {
      errs.bankName = 'Bank name is required';
    }
    if (!type) {
      errs.accountType = 'Account type is required';
    }
    if (!routing) {
      errs.routingNumber = 'Routing number is required';
    } else if (!/^\d{9}$/.test(routing)) {
      errs.routingNumber = 'Routing number must be 9 digits';
    }
    if (!accNum) {
      errs.accountNumber = 'Account number is required';
    } else if (!/^\d{4,17}$/.test(accNum)) {
      errs.accountNumber = 'Account number must be 4 to 17 digits';
    }
    if (values.bankNickname.length > 30) {
      errs.nickname = 'Account nickname cannot exceed 30 characters';
    }
  } else {
    const issuer = values.cardIssuer.trim();
    const type = values.cardType.trim();
    const digits = values.last4Digits.trim();

    if (!issuer) {
      errs.cardIssuer = 'Card issuer is required';
    }
    if (!type) {
      errs.cardType = 'Card type is required';
    }
    if (!digits) {
      errs.last4Digits = 'Last 4 digits are required';
    } else if (!/^\d{4}$/.test(digits)) {
      errs.last4Digits = 'Must be exactly 4 digits';
    }
    if (values.cardNickname.length > 30) {
      errs.nickname = 'Account nickname cannot exceed 30 characters';
    }
  }

  return errs;
}
