import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';

import { Account, CreateAccountRequest, AccountFormValue, AccountFormFlags } from '../models/accounts.model';
import { ACCOUNT_FORM_MESSAGES, AccountFormMode, getAccountCategoryConfig } from './account-form.config';

// Form value/flag types now live in the consolidated accounts model; re-exported for existing importers.
export type { AccountFormValue, AccountFormFlags } from '../models/accounts.model';

// Derives which conditional field groups apply to the selected account type.
export function getAccountFormFlags(accountType: string): AccountFormFlags {
  const type = (accountType || '').toLowerCase();
  const config = getAccountCategoryConfig(accountType);
  return {
    isLoanType: type === 'loan',
    isCreditCardType: type === 'credit card',
    showBankName: config?.showBankName ?? false,
    showAccountNumber: config?.requiresAccountNumber ?? false,
    showIfscCode: config?.requiresIfscCode ?? false,
    showInstitutionName: type === 'loan' || type === 'investment'
  };
}

// Default form value used for a fresh add flow and for post-submit resets.
export function createInitialAccountFormValue(today: string): AccountFormValue {
  return {
    accountType: '',
    accountSubType: '',
    bankName: '',
    accountNickname: '',
    accountNumber: '',
    ifscCode: '',
    currency: 'INR',
    openingBalance: null,
    openDate: today,
    accountStatus: 'Active',
    description: '',
    institutionName: '',
    creditLimit: null,
    loanType: '',
    loanBalance: null,
    interestRate: null,
    accountCategory: '',
    notes: ''
  };
}

// Builds the reactive form group with base (always-on) validators.
export function createAccountFormGroup(fb: FormBuilder, today: string): FormGroup {
  return fb.group({
    accountType: ['', [Validators.required]],
    accountSubType: ['', [Validators.required]],
    bankName: [''],
    accountNickname: ['', [Validators.required, Validators.maxLength(50)]],
    accountNumber: [''],
    ifscCode: [''],
    currency: ['INR', [Validators.required]],
    openingBalance: [null as number | null, [Validators.required]],
    openDate: [today, [Validators.required]],
    accountStatus: ['Active', [Validators.required]],
    description: ['', [Validators.maxLength(300)]],
    institutionName: [''],
    creditLimit: [null as number | null],
    loanType: [''],
    loanBalance: [null as number | null],
    interestRate: [null as number | null, [Validators.min(0), Validators.max(100)]],
    accountCategory: ['', [Validators.required]],
    notes: ['', [Validators.maxLength(500)]]
  });
}

// Applies/clears validators that depend on the account type.
export function applyConditionalValidators(form: FormGroup, accountType: string, currency: string): void {
  const flags = getAccountFormFlags(accountType);

  setValidators(
    form,
    'accountNumber',
    flags.showAccountNumber
      ? [Validators.required, Validators.minLength(4), Validators.maxLength(30), Validators.pattern(/^[a-zA-Z0-9 -]+$/)]
      : []
  );
  setValidators(form, 'ifscCode', flags.showIfscCode ? [Validators.required, Validators.pattern(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/)] : []);
  setValidators(form, 'bankName', flags.showBankName ? [Validators.required, Validators.maxLength(80)] : []);
  setValidators(form, 'institutionName', flags.showInstitutionName ? [Validators.required, Validators.maxLength(80)] : []);
  setValidators(form, 'creditLimit', flags.isCreditCardType ? [Validators.required, Validators.min(0)] : []);
  setValidators(form, 'loanType', flags.isLoanType ? [Validators.required] : []);
  setValidators(form, 'loanBalance', flags.isLoanType ? [Validators.required, Validators.min(0)] : []);
}

// Returns the control names that must be valid for a given add-flow step.
export function getStepFields(step: number, flags: AccountFormFlags, currency: string): string[] {
  if (step === 1) {
    const fields = ['accountType', 'accountSubType', 'accountNickname', 'currency', 'openingBalance'];
    if (flags.showBankName) {
      fields.push('bankName');
    }
    if (flags.showAccountNumber) {
      fields.push('accountNumber');
    }
    if (flags.showIfscCode) {
      fields.push('ifscCode');
    }
    return fields;
  }

  if (step === 2) {
    const fields = ['openDate', 'accountStatus', 'accountCategory'];
    if (flags.showInstitutionName) {
      fields.push('institutionName');
    }
    if (flags.isCreditCardType) {
      fields.push('creditLimit');
    }
    if (flags.isLoanType) {
      fields.push('loanType', 'loanBalance');
    }
    return fields;
  }

  return [];
}

// Combines every required field for a single-page (edit) submission.
export function getCombinedSubmissionFields(flags: AccountFormFlags, currency: string): string[] {
  return [...getStepFields(1, flags, currency), ...getStepFields(2, flags, currency)];
}

// Marks the supplied fields as touched and returns whether they are all valid.
export function markAndValidate(form: FormGroup, fields: string[]): boolean {
  return fields.every((name) => {
    const control = form.get(name);
    if (!control) {
      return true;
    }
    control.markAsTouched();
    control.updateValueAndValidity({ onlySelf: true });
    return control.valid;
  });
}

// Maps a control's validation errors into a human-readable message.
export function getFieldErrorMessage(name: string, errors: ValidationErrors | null): string {
  if (!errors) {
    return '';
  }
  if (errors['required']) {
    return 'This field is required.';
  }
  if (errors['minlength']) {
    return `Minimum ${errors['minlength'].requiredLength} characters.`;
  }
  if (errors['maxlength']) {
    return `Maximum ${errors['maxlength'].requiredLength} characters.`;
  }
  if (errors['min']) {
    return `Value must be at least ${errors['min'].min}.`;
  }
  if (errors['max']) {
    return `Value must be at most ${errors['max'].max}.`;
  }
  if (errors['pattern']) {
    if (name === 'ifscCode') {
      return 'Enter a valid IFSC code (e.g. HDFC0001234).';
    }
    if (name === 'accountNumber') {
      return 'Enter a valid account number.';
    }
    return 'Enter a valid value.';
  }
  return 'Enter a valid value.';
}

// Converts the raw form value into an account payload for create/update.
export function buildPayload(args: {
  value: AccountFormValue;
  mode: AccountFormMode;
  accountId: string | null;
  selectedAccount: Account | null;
  today: string;
}): Account {
  const { value, mode, accountId, selectedAccount, today } = args;
  const flags = getAccountFormFlags(value.accountType);
  const balance = Number(value.openingBalance) || 0;

  const payload: Account = {
    id: mode === 'edit' ? accountId ?? selectedAccount?.id ?? '' : generateAccountId(),
    accountName: value.accountNickname.trim(),
    accountType: value.accountType,
    accountSubType: value.accountSubType || undefined,
    accountNumber: flags.showAccountNumber ? value.accountNumber.trim() : '',
    balance,
    availableBalance: mode === 'edit' && selectedAccount ? selectedAccount.availableBalance : balance,
    currency: 'INR',
    openDate: (value.openDate || today).slice(0, 10),
    status: value.accountStatus || 'Active'
  };

  if (flags.showBankName) {
    payload.bankName = value.bankName || undefined;
  }
  if (flags.showIfscCode) {
    payload.ifscCode = value.ifscCode.trim().toUpperCase() || undefined;
  }
  if (flags.isCreditCardType) {
    payload.creditLimit = Number(value.creditLimit) || 0;
  }
  if (flags.isLoanType) {
    payload.loanType = value.loanType || undefined;
    payload.loanBalance = Number(value.loanBalance) || 0;
    payload.interestRate = Number(value.interestRate) || 0;
  }
  if (flags.showInstitutionName) {
    payload.institutionName = value.institutionName || undefined;
  }
  if (value.accountCategory) {
    payload.accountCategory = value.accountCategory;
  }
  if (value.description) {
    payload.description = value.description.trim();
  }

  return payload;
}

// Maps an existing account back into editable form values.
export function mapAccountToFormValue(account: Account, today: string): AccountFormValue {
  return {
    accountType: account.accountType ?? '',
    accountSubType: account.accountSubType ?? '',
    bankName: account.bankName ?? '',
    accountNickname: account.accountName ?? '',
    accountNumber: account.accountNumber ?? '',
    ifscCode: account.ifscCode ?? '',
    currency: 'INR',
    openingBalance: account.balance ?? null,
    openDate: (account.openDate || today).slice(0, 10),
    accountStatus: account.status || 'Active',
    description: account.description ?? '',
    institutionName: account.institutionName ?? '',
    creditLimit: account.creditLimit ?? null,
    loanType: account.loanType ?? '',
    loanBalance: account.loanBalance ?? null,
    interestRate: account.interestRate ?? null,
    accountCategory: account.accountCategory ?? '',
    notes: account.notes ?? ''
  };
}

// Finds the account targeted by an edit route, if it is already loaded.
export function tryFindEditAccount(accounts: Account[], accountId: string | null): Account | null {
  if (!accountId) {
    return null;
  }
  return accounts.find((account) => account.id === accountId) ?? null;
}

// Message shown when an edit target cannot be located.
export function getEditLoadError(): string {
  return ACCOUNT_FORM_MESSAGES.editLoadError;
}

// Success/error feedback text produced after a submission completes.
export function buildSubmissionMessage(mode: AccountFormMode, error: string | null): string {
  if (error) {
    return error;
  }
  return mode === 'add' ? ACCOUNT_FORM_MESSAGES.addSuccess : ACCOUNT_FORM_MESSAGES.editSuccess;
}

// Normalized key used to detect duplicate accounts.
export function buildDuplicateAccountKey(accountType: string, accountNumber: string, bankName: string, accountName: string): string {
  return [accountType, accountNumber, bankName, accountName]
    .map((part) => (part || '').trim().toLowerCase())
    .join('::');
}

// Duplicate key derived from a stored account.
export function buildDuplicateAccountKeyFromAccount(account: Account): string {
  return buildDuplicateAccountKey(account.accountType, account.accountNumber, account.bankName ?? '', account.accountName);
}

// Ensures the CreateAccountRequest contract stays referenced for type-safety.
export function toCreateRequest(payload: Account): CreateAccountRequest {
  return payload;
}

// Applies a validator set to a control and refreshes its validity.
function setValidators(form: FormGroup, name: string, validators: Parameters<AbstractControl['setValidators']>[0]): void {
  const control = form.get(name);
  if (!control) {
    return;
  }
  control.setValidators(validators);
  control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
}

// Generates a short, collision-resistant account identifier for new records.
function generateAccountId(): string {
  return `acc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
