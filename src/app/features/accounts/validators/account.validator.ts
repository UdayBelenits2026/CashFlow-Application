import { Validators } from '@angular/forms';

// Shared validator sets used by add/edit account forms.
export const accountValidators = {
  accountType: [Validators.required],
  bankNameRequired: [Validators.required, Validators.maxLength(80)],
  accountNickname: [Validators.required, Validators.maxLength(50)],
  // Required account name with a short practical limit.
  accountName: [Validators.required, Validators.maxLength(80)],
  // Accepts common account number formats (letters, numbers, spaces, hyphens).
  accountNumber: [
    Validators.required,
    Validators.minLength(4),
    Validators.maxLength(30),
    Validators.pattern(/^[a-zA-Z0-9 -]+$/)
  ],
  // Indian IFSC code: 4 letters, then 0, then 6 alphanumerics.
  ifscCode: [Validators.pattern(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/)],
  currency: [Validators.required],
  // Signed currency amount (supports negative balances).
  signedAmount: [Validators.required, Validators.pattern(/^-?\d+(\.\d{1,2})?$/)],
  // Non-negative currency amount for limits.
  positiveAmount: [Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)],
  optionalRate: [Validators.pattern(/^\d+(\.\d{1,2})?$/), Validators.min(0), Validators.max(100)],
  accountCategory: [Validators.required],
  notes: [Validators.maxLength(500)],
  // Optional short notes field.
  description: [Validators.maxLength(300)]
};
