import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { accountValidators } from '../../../shared/validators/account.validators';
import { Account } from '../models/accounts.model';
import { ACCOUNT_FORM_DEFAULTS, ACCOUNT_FORM_MESSAGES, AccountFormMode } from './account-form.config';

export interface AccountFormValue {
  accountType: string;
  bankName: string;
  accountNickname: string;
  accountNumber: string;
  routingNumber: string;
  currency: string;
  openingBalance: number | null;
  openDate: string;
  accountStatus: string;
  description: string;
  institutionName: string;
  creditLimit: number | null;
  interestRate: number | null;
  loanType: string;
  loanBalance: number | null;
  accountCategory: string;
  notes: string;
}

export interface AccountFormFlags {
  isLoanType: boolean;
  isCreditCardType: boolean;
  showBankFields: boolean;
  showInstitutionName: boolean;
}

interface BuildPayloadOptions {
  value: AccountFormValue;
  mode: AccountFormMode;
  accountId: string | null;
  selectedAccount: Account | null;
  today: string;
}

export function createInitialAccountFormValue(today: string): AccountFormValue {
  return {
    accountType: '',
    bankName: '',
    accountNickname: '',
    accountNumber: '',
    routingNumber: '',
    currency: '',
    openingBalance: null,
    openDate: today,
    accountStatus: 'Active',
    description: '',
    institutionName: '',
    creditLimit: null,
    interestRate: null,
    loanType: '',
    loanBalance: null,
    accountCategory: '',
    notes: ''
  };
}

export function createAccountFormGroup(formBuilder: FormBuilder, today: string): FormGroup {
  return formBuilder.group({
    accountType: ['', accountValidators.accountType],
    bankName: ['', Validators.maxLength(80)],
    accountNickname: ['', accountValidators.accountNickname],
    accountNumber: ['', accountValidators.accountNumber],
    routingNumber: ['', accountValidators.routingNumber],
    currency: ['', accountValidators.currency],
    openingBalance: [null as number | null, accountValidators.signedAmount],
    openDate: [today, Validators.required],
    accountStatus: ['Active', Validators.required],
    description: ['', accountValidators.description],
    institutionName: ['', Validators.maxLength(80)],
    creditLimit: [null as number | null, accountValidators.positiveAmount],
    interestRate: [null as number | null, accountValidators.optionalRate],
    loanType: [''],
    loanBalance: [null as number | null, accountValidators.positiveAmount],
    accountCategory: ['', accountValidators.accountCategory],
    notes: ['', accountValidators.notes]
  });
}

export function getAccountFormFlags(accountType: string): AccountFormFlags {
  return {
    isLoanType: accountType === 'Loan',
    isCreditCardType: accountType === 'Credit Card',
    showBankFields: accountType === 'Bank Account',
    showInstitutionName: ['Credit Card', 'Investment', 'Loan'].includes(accountType)
  };
}

export function applyConditionalValidators(form: FormGroup, accountType: string, currency: string): void {
  const flags = getAccountFormFlags(accountType);
  setValidators(form, 'bankName', flags.showBankFields ? accountValidators.bankNameRequired : [Validators.maxLength(80)]);
  setValidators(form, 'routingNumber', flags.showBankFields && currency === 'USD'
    ? [Validators.required, ...accountValidators.routingNumberNineDigits]
    : accountValidators.routingNumber);
  setValidators(form, 'institutionName', flags.showInstitutionName ? [Validators.required, Validators.maxLength(80)] : [Validators.maxLength(80)]);
  setValidators(form, 'creditLimit', flags.isCreditCardType ? [Validators.required, ...accountValidators.positiveAmount] : accountValidators.positiveAmount);
  setValidators(form, 'loanType', flags.isLoanType ? [Validators.required] : []);
  setValidators(form, 'loanBalance', flags.isLoanType ? [Validators.required, ...accountValidators.positiveAmount] : accountValidators.positiveAmount);
}

export function getStepFields(step: number, flags: AccountFormFlags, currency: string): string[] {
  if (step === 1) {
    const fields = ['accountType', 'accountNickname', 'accountNumber', 'currency', 'openingBalance'];
    if (flags.showBankFields) {
      fields.push('bankName');
      if (currency === 'USD') {
        fields.push('routingNumber');
      }
    }
    return fields;
  }

  if (step === 2) {
    const fields = ['openDate', 'accountStatus', 'accountCategory', 'description', 'notes'];
    if (flags.showInstitutionName) {
      fields.push('institutionName');
    }
    if (flags.isCreditCardType) {
      fields.push('creditLimit');
    }
    if (flags.isLoanType) {
      fields.push('loanType', 'loanBalance', 'interestRate');
    }
    return fields;
  }

  return [];
}

export function getFieldErrorMessage(fieldName: string, errors: ValidationErrors | null | undefined): string {
  if (!errors) {
    return '';
  }

  if (fieldName === 'accountType' && errors['required']) return ACCOUNT_FORM_MESSAGES.accountTypeRequired;
  if (fieldName === 'bankName' && errors['required']) return ACCOUNT_FORM_MESSAGES.bankRequired;
  if (fieldName === 'accountNickname' && errors['required']) return ACCOUNT_FORM_MESSAGES.nicknameRequired;
  if (fieldName === 'accountNickname' && errors['maxlength']) return ACCOUNT_FORM_MESSAGES.nicknameMaxLength;
  if (fieldName === 'accountNumber' && errors['required']) return ACCOUNT_FORM_MESSAGES.accountNumberRequired;
  if (fieldName === 'accountNumber' && (errors['pattern'] || errors['minlength'] || errors['maxlength'])) return ACCOUNT_FORM_MESSAGES.accountNumberInvalid;
  if (fieldName === 'routingNumber' && errors['required']) return ACCOUNT_FORM_MESSAGES.routingRequired;
  if (fieldName === 'routingNumber' && errors['pattern']) return ACCOUNT_FORM_MESSAGES.routingInvalid;
  if (fieldName === 'currency' && errors['required']) return ACCOUNT_FORM_MESSAGES.currencyRequired;
  if (fieldName === 'openingBalance' && errors['required']) return ACCOUNT_FORM_MESSAGES.openingBalanceRequired;
  if (['openingBalance', 'creditLimit', 'loanBalance'].includes(fieldName) && errors['pattern']) return ACCOUNT_FORM_MESSAGES.amountInvalid;
  return ACCOUNT_FORM_MESSAGES.requiredDetails;
}

export function markAndValidate(form: FormGroup, fields: string[]): boolean {
  fields.forEach(field => form.get(field)?.markAsTouched());
  return fields.every(field => form.get(field)?.valid);
}

export function getCombinedSubmissionFields(flags: AccountFormFlags, currency: string): string[] {
  return [...new Set(getStepFields(1, flags, currency).concat(getStepFields(2, flags, currency)))];
}

export function mapAccountToFormValue(account: Account, today: string): AccountFormValue {
  const normalizedType = account.accountType === 'LOAN' ? 'Loan' : account.accountType;
  return {
    accountType: normalizedType || 'Bank Account',
    bankName: account.bankName ?? '',
    accountNickname: account.accountName ?? '',
    accountNumber: account.accountNumber ?? '',
    routingNumber: account.routingNumber ?? '',
    currency: account.currency || 'USD',
    openingBalance: account.balance ?? 0,
    openDate: account.openDate || today,
    accountStatus: account.status || 'Active',
    description: account.description ?? '',
    institutionName: account.institutionName ?? '',
    creditLimit: account.creditLimit ?? null,
    interestRate: account.interestRate ?? null,
    loanType: account.loanType ?? '',
    loanBalance: account.loanBalance ?? null,
    accountCategory: account.accountCategory ?? '',
    notes: account.notes ?? ''
  };
}

export function tryFindEditAccount(accounts: Account[], accountId: string | null): Account | null {
  if (!accountId) {
    return null;
  }
  return accounts.find(item => item.id === accountId) ?? null;
}

export function buildPayload(options: BuildPayloadOptions): Account {
  const { value, mode, accountId, selectedAccount, today } = options;
  const accountType = String(value.accountType ?? '');
  const openingBalance = Number(value.openingBalance ?? 0);
  const account: Account = {
    id: mode === 'edit' && accountId ? accountId : `ACC${Date.now()}`,
    accountName: normalizeOptionalText(value.accountNickname) ?? '',
    accountType,
    accountNumber: normalizeOptionalText(value.accountNumber) ?? '',
    balance: openingBalance,
    availableBalance: mode === 'edit' ? Number(selectedAccount?.availableBalance ?? openingBalance) : openingBalance,
    bankName: normalizeOptionalText(value.bankName),
    routingNumber: normalizeOptionalText(value.routingNumber),
    currency: String(value.currency ?? ''),
    openDate: String(value.openDate ?? today),
    status: String(value.accountStatus ?? ''),
    creditLimit: normalizeOptionalNumber(value.creditLimit),
    institutionName: normalizeOptionalText(value.institutionName),
    interestRate: normalizeOptionalNumber(value.interestRate),
    loanType: normalizeOptionalText(value.loanType),
    loanBalance: normalizeOptionalNumber(value.loanBalance),
    accountCategory: normalizeOptionalText(value.accountCategory),
    notes: normalizeOptionalText(value.notes),
    description: normalizeOptionalText(value.description)
  };

  if (accountType !== 'Bank Account') {
    account.bankName = undefined;
    account.routingNumber = undefined;
  }
  if (!['Credit Card', 'Investment', 'Loan'].includes(accountType)) {
    account.institutionName = undefined;
  }
  if (accountType !== 'Credit Card') {
    account.creditLimit = undefined;
  }
  if (accountType !== 'Loan') {
    account.loanType = undefined;
    account.loanBalance = undefined;
    account.interestRate = undefined;
  }
  return account;
}

export function buildSubmissionMessage(mode: AccountFormMode, error: string | null): string {
  if (!error) {
    return mode === 'add' ? ACCOUNT_FORM_MESSAGES.addSuccess : ACCOUNT_FORM_MESSAGES.updateSuccess;
  }
  const duplicateError = error.toLowerCase().includes('duplicate') || error.toLowerCase().includes('exist');
  if (duplicateError) {
    return ACCOUNT_FORM_MESSAGES.duplicate;
  }
  return mode === 'add' ? ACCOUNT_FORM_MESSAGES.addFailure : ACCOUNT_FORM_MESSAGES.updateFailure;
}

export function getEditLoadError(): string {
  return ACCOUNT_FORM_DEFAULTS.editLoadError;
}

export function normalizeOptionalText(value: string | null | undefined): string | undefined {
  const text = value?.trim();
  return text ? text : undefined;
}

export function normalizeOptionalNumber(value: number | null | undefined): number | undefined {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return undefined;
  }
  return Number(value);
}

function normalizeAccountNumber(value: string): string {
  return value.replace(/[\s-]/g, '').toLowerCase();
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

export function buildDuplicateAccountKey(accountType: string, accountNumber: string, bankName: string): string {
  return `${normalizeText(accountType)}::${normalizeAccountNumber(accountNumber)}::${normalizeText(bankName)}`;
}

export function buildDuplicateAccountKeyFromAccount(account: Account): string {
  return buildDuplicateAccountKey(account.accountType, account.accountNumber, account.bankName ?? '');
}

function setValidators(form: FormGroup, controlName: string, validators: ValidatorFn[]): void {
  const control = form.get(controlName);
  if (!control) {
    return;
  }
  control.setValidators(validators);
  control.updateValueAndValidity({ emitEvent: false });
}
