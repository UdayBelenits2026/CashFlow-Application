import { ValidatorFn, Validators } from '@angular/forms';

const ACCOUNT_NUMBER_PATTERN = /^[A-Za-z0-9]{6,34}$/;
const SIGNED_AMOUNT_PATTERN = /^-?\d+(\.\d{1,2})?$/;
const POSITIVE_AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/;
const RATE_PATTERN = /^(100(\.0{1,2})?|\d{1,2}(\.\d{1,2})?)$/;

interface AccountValidators {
  accountType: ValidatorFn[];
  bankNameRequired: ValidatorFn[];
  accountNickname: ValidatorFn[];
  accountNumber: ValidatorFn[];
  routingNumber: ValidatorFn[];
  routingNumberNineDigits: ValidatorFn[];
  currency: ValidatorFn[];
  signedAmount: ValidatorFn[];
  positiveAmount: ValidatorFn[];
  optionalRate: ValidatorFn[];
  description: ValidatorFn[];
  accountCategory: ValidatorFn[];
  notes: ValidatorFn[];
}

export const accountValidators: AccountValidators = {
  accountType: [Validators.required],
  bankNameRequired: [Validators.required, Validators.maxLength(80)],
  accountNickname: [Validators.required, Validators.maxLength(80)],
  accountNumber: [Validators.required, Validators.pattern(ACCOUNT_NUMBER_PATTERN)],
  routingNumber: [Validators.pattern(/^\d*$/), Validators.maxLength(9)],
  routingNumberNineDigits: [Validators.pattern(/^\d{9}$/)],
  currency: [Validators.required],
  signedAmount: [Validators.required, Validators.pattern(SIGNED_AMOUNT_PATTERN)],
  positiveAmount: [Validators.pattern(POSITIVE_AMOUNT_PATTERN)],
  optionalRate: [Validators.pattern(RATE_PATTERN)],
  description: [Validators.maxLength(250)],
  accountCategory: [Validators.required],
  notes: [Validators.maxLength(500)]
};