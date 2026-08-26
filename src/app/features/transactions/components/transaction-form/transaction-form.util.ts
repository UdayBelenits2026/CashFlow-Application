import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { CreateTransactionRequest, PaymentMethod, TransactionType } from '../../models/models.transaction';

// Selectable payment methods for expense/income transactions.
export const PAYMENT_METHODS: PaymentMethod[] = [
  'Debit Card',
  'Credit Card',
  'ACH',
  'Check',
  'Cash',
  'Transfer',
  'Wallet',
  'Other'
];

// Category options depend on the transaction type.
export const EXPENSE_CATEGORIES = [
  'Shopping',
  'Food & Dining',
  'Groceries',
  'Utilities',
  'Transportation',
  'Business Expense',
  'Entertainment',
  'Healthcare',
  'Other'
];

export const INCOME_CATEGORIES = ['Income', 'Salary', 'Interest', 'Dividend', 'Refund', 'Other'];

// Fields controlled by the financial institution on bank-synced transactions.
export const BANK_CONTROLLED_FIELDS = ['amount', 'description', 'date', 'accountId', 'referenceNumber'] as const;

// Option displayed in the account dropdowns (masked account number).
export interface AccountOption {
  id: string;
  name: string;
  label: string;
  status: string;
}

// Amount must be numeric, greater than zero, max two decimals.
export function amountValidator(control: AbstractControl): ValidationErrors | null {
  const raw = control.value;
  if (raw === null || raw === '') {
    return null;
  }
  const num = Number(raw);
  if (Number.isNaN(num) || num <= 0) {
    return { amountMin: true };
  }
  if (!/^\d+(\.\d{1,2})?$/.test(String(raw))) {
    return { amountDecimals: true };
  }
  return null;
}

// Date must be a valid calendar date and not in the future.
export function dateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { invalidDate: true };
  }
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  if (parsed.getTime() > endOfToday.getTime()) {
    return { futureDate: true };
  }
  return null;
}

// Description must be 2-150 characters after trimming (not only whitespace).
export function descriptionValidator(control: AbstractControl): ValidationErrors | null {
  const value = (control.value ?? '').trim();
  if (value.length === 0) {
    return null;
  }
  if (value.length < 2) {
    return { minTrimmed: true };
  }
  if (value.length > 150) {
    return { maxTrimmed: true };
  }
  return null;
}

// Transfer accounts must differ.
export const differentAccountsValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const from = group.get('fromAccountId')?.value;
  const to = group.get('toAccountId')?.value;
  return from && to && from === to ? { sameAccount: true } : null;
};

// Builds the single reactive form shared by add and edit.
export function createTransactionForm(fb: FormBuilder, today: string): FormGroup {
  return fb.group({
    type: ['Expense' as TransactionType, [Validators.required]],
    date: [today, [Validators.required, dateValidator]],
    amount: [null as number | null, [Validators.required, amountValidator]],
    description: ['', [Validators.required, descriptionValidator]],
    category: [''],
    accountId: [''],
    fromAccountId: [''],
    toAccountId: [''],
    paymentMethod: ['' as PaymentMethod | ''],
    referenceNumber: ['', [Validators.maxLength(50)]],
    notes: ['', [Validators.maxLength(500)]],
    tags: fb.control<string[]>([])
  });
}

// Switches validators on/off based on the selected type + payment method.
export function applyTypeValidators(form: FormGroup, type: TransactionType, paymentMethod: string): void {
  const category = form.get('category')!;
  const accountId = form.get('accountId')!;
  const fromAccountId = form.get('fromAccountId')!;
  const toAccountId = form.get('toAccountId')!;
  const paymentMethodControl = form.get('paymentMethod')!;
  const reference = form.get('referenceNumber')!;

  [category, accountId, fromAccountId, toAccountId, paymentMethodControl].forEach((control) => control.clearValidators());
  form.clearValidators();

  if (type === 'Transfer') {
    fromAccountId.setValidators([Validators.required]);
    toAccountId.setValidators([Validators.required]);
    form.setValidators([differentAccountsValidator]);
  } else {
    category.setValidators([Validators.required]);
    accountId.setValidators([Validators.required]);
    if (type === 'Expense') {
      paymentMethodControl.setValidators([Validators.required]);
    }
  }

  const referenceValidators: ValidatorFn[] = [Validators.maxLength(50)];
  if (paymentMethod === 'Check') {
    referenceValidators.push(Validators.required);
  }
  reference.setValidators(referenceValidators);

  [category, accountId, fromAccountId, toAccountId, paymentMethodControl, reference].forEach((control) =>
    control.updateValueAndValidity({ emitEvent: false })
  );
  form.updateValueAndValidity({ emitEvent: false });
}

// Masks an account number so only the last four digits are shown.
export function maskAccountNumber(accountNumber: string | undefined): string {
  const tail = (accountNumber ?? '').slice(-4);
  return tail ? `**** ${tail}` : '****';
}

type TransactionFormValue = {
  type: TransactionType;
  date: string;
  amount: number | null;
  description: string;
  category: string;
  accountId: string;
  fromAccountId: string;
  toAccountId: string;
  paymentMethod: PaymentMethod | '';
  referenceNumber: string;
  notes: string;
  tags: string[];
};

// Builds a create/update payload, including only fields relevant to the type.
export function buildTransactionPayload(value: TransactionFormValue, accounts: AccountOption[]): CreateTransactionRequest {
  const base = {
    date: value.date,
    amount: Number(value.amount),
    description: value.description.trim(),
    merchant: value.description.trim(),
    type: value.type,
    tags: value.tags ?? [],
    referenceNumber: (value.referenceNumber ?? '').trim(),
    notes: value.notes ?? ''
  };

  if (value.type === 'Transfer') {
    const from = accounts.find((account) => account.id === value.fromAccountId);
    const to = accounts.find((account) => account.id === value.toAccountId);
    return {
      ...base,
      category: '',
      accountId: value.fromAccountId,
      accountName: from && to ? `${from.name} → ${to.name}` : from?.name ?? '',
      fromAccountId: value.fromAccountId,
      toAccountId: value.toAccountId,
      paymentMethod: ''
    };
  }

  const account = accounts.find((item) => item.id === value.accountId);
  return {
    ...base,
    category: value.category,
    accountId: value.accountId,
    accountName: account?.name ?? '',
    paymentMethod: value.paymentMethod || ''
  };
}
