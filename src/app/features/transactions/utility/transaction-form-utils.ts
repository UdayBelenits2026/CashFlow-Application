import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import {
  PaymentMethod,
  TransactionFormModel,
  TransactionFormValue,
  TransactionType,
  UpdateFormModel
} from '../models/models.transaction';
import {
  CreateTransactionRequest,
  EditTransactionData,
  UpdateTransactionRequest
} from '../models/transaction-api.model';
import { mapFormToUpdateRequest, mapTransactionFormToRequest } from './transaction.mapper';

// Selectable payment methods for expense transactions.
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

// Maps backend readOnlyFieldNames to form control names where they differ.
const FIELD_NAME_MAP: Record<string, string> = { transactionDate: 'date' };

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

// Transfer accounts must differ (Transfer is UI-only).
export const differentAccountsValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const from = group.get('fromAccountId')?.value;
  const to = group.get('toAccountId')?.value;
  return from && to && from === to ? { sameAccount: true } : null;
};

// Builds the single reactive form shared by add and edit. Dropdowns hold numeric IDs.
export function createTransactionForm(fb: FormBuilder, today: string): FormGroup {
  return fb.group({
    type: ['Expense' as TransactionType, [Validators.required]],
    date: [today, [Validators.required, dateValidator]],
    amount: [null as number | null, [Validators.required, amountValidator]],
    description: ['', [Validators.required, descriptionValidator]],
    categoryId: [null as number | null],
    accountId: [null as number | null],
    merchantId: [null as number | null],
    incomeSourceId: [null as number | null],
    paymentMethod: [''],
    referenceNumber: ['', [Validators.maxLength(50)]],
    notes: ['', [Validators.maxLength(500)]],
    attachmentUrl: [''],
    tagIds: fb.control<number[]>([]),
    fromAccountId: [null as number | null],
    toAccountId: [null as number | null]
  });
}

// Switches required validators on/off based on mode + type + payment method.
export function applyTypeValidators(
  form: FormGroup,
  mode: 'add' | 'edit',
  type: TransactionType,
  paymentMethod: string
): void {
  const amount = form.get('amount')!;
  const categoryId = form.get('categoryId')!;
  const accountId = form.get('accountId')!;
  const merchantId = form.get('merchantId')!;
  const incomeSourceId = form.get('incomeSourceId')!;
  const paymentMethodControl = form.get('paymentMethod')!;
  const referenceNumber = form.get('referenceNumber')!;
  const fromAccountId = form.get('fromAccountId')!;
  const toAccountId = form.get('toAccountId')!;

  [amount, categoryId, accountId, merchantId, incomeSourceId, paymentMethodControl, fromAccountId, toAccountId].forEach(
    (control) => control.clearValidators()
  );
  form.clearValidators();

  if (mode === 'edit') {
    // PUT contract fields: date, accountId, description, categoryId, paymentMethod (amount/merchant/type are not editable).
    accountId.setValidators([Validators.required]);
    categoryId.setValidators([Validators.required]);
  } else if (type === 'Transfer') {
    amount.setValidators([Validators.required, amountValidator]);
    fromAccountId.setValidators([Validators.required]);
    toAccountId.setValidators([Validators.required]);
    form.setValidators([differentAccountsValidator]);
  } else {
    amount.setValidators([Validators.required, amountValidator]);
    categoryId.setValidators([Validators.required]);
    accountId.setValidators([Validators.required]);
    if (type === 'Expense') {
      merchantId.setValidators([Validators.required]);
      paymentMethodControl.setValidators([Validators.required]);
    } else {
      incomeSourceId.setValidators([Validators.required]);
    }
  }

  const referenceValidators: ValidatorFn[] = [Validators.maxLength(50)];
  if (paymentMethod === 'Check') {
    referenceValidators.push(Validators.required);
  }
  referenceNumber.setValidators(referenceValidators);

  [amount, categoryId, accountId, merchantId, incomeSourceId, paymentMethodControl, referenceNumber, fromAccountId, toAccountId].forEach(
    (control) => control.updateValueAndValidity({ emitEvent: false })
  );
  form.updateValueAndValidity({ emitEvent: false });
}

// Disables fields the backend marks read-only (readOnlyFieldNames) and the account when not editable.
export function applyReadOnlyFields(form: FormGroup, readOnlyFieldNames: string[], accountEditable: boolean): void {
  (readOnlyFieldNames ?? []).forEach((name) => {
    form.get(FIELD_NAME_MAP[name] ?? name)?.disable({ emitEvent: false });
  });
  if (!accountEditable) {
    form.get('accountId')?.disable({ emitEvent: false });
  }
}

// Today's date as an ISO yyyy-MM-dd string.
export function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

// Maps the raw Add-form value to the typed create request.
export function buildCreateRequest(value: TransactionFormValue): CreateTransactionRequest {
  const model: TransactionFormModel = {
    type: value.type as 'Expense' | 'Income',
    accountId: value.accountId,
    categoryId: value.categoryId,
    merchantId: value.merchantId,
    incomeSourceId: value.incomeSourceId,
    paymentMethod: value.paymentMethod,
    date: value.date,
    amount: value.amount,
    description: value.description,
    notes: value.notes
  };
  return mapTransactionFormToRequest(model);
}

// Maps the raw Edit-form value to the typed update request.
export function buildUpdateRequest(value: TransactionFormValue, updatedBy: number): UpdateTransactionRequest {
  const model: UpdateFormModel = {
    date: value.date,
    accountId: value.accountId,
    description: value.description,
    categoryId: value.categoryId,
    paymentMethod: value.paymentMethod,
    referenceNumber: value.referenceNumber,
    notes: value.notes,
    attachmentUrl: value.attachmentUrl,
    tagIds: value.tagIds ?? []
  };
  return mapFormToUpdateRequest(model, updatedBy);
}

// Builds the patch to populate the form from edit data (infers Income vs Expense).
export function editDataToFormPatch(data: EditTransactionData): Partial<TransactionFormValue> {
  return {
    type: data.incomeSourceId != null ? 'Income' : 'Expense',
    date: data.transactionDate,
    amount: data.amount,
    description: data.description,
    categoryId: data.categoryId,
    accountId: data.accountId,
    merchantId: data.merchantId ?? null,
    incomeSourceId: data.incomeSourceId ?? null,
    paymentMethod: data.paymentMethod ?? '',
    referenceNumber: data.referenceNumber ?? '',
    notes: data.notes ?? '',
    attachmentUrl: data.attachmentUrl ?? '',
    tagIds: (data.tags ?? []).map((tag) => tag.tagId)
  };
}

// Disables fields the update contract does not accept (display-only in edit mode).
export function lockEditOnlyFields(form: FormGroup): void {
  ['type', 'amount', 'merchantId', 'incomeSourceId'].forEach((name) => form.get(name)?.disable({ emitEvent: false }));
}

// Adds or removes a tag id, returning a new array.
export function toggleTagId(tagIds: number[], id: number): number[] {
  return tagIds.includes(id) ? tagIds.filter((tagId) => tagId !== id) : [...tagIds, id];
}

// Resets the Add form for "Save & New", keeping the selected type.
export function resetFormForNew(form: FormGroup, keepType: TransactionType): void {
  form.reset({ type: keepType, date: getToday(), amount: null, paymentMethod: '', tagIds: [] });
  applyTypeValidators(form, 'add', keepType, '');
  form.markAsPristine();
}
