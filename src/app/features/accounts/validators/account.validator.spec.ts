import { FormControl } from '@angular/forms';
import { accountValidators } from './account.validator';

// Runs a control's validator set and returns the merged error object (or null).
function validate(value: unknown, validators: any[]): Record<string, unknown> | null {
  const control = new FormControl(value, validators);
  return control.errors;
}

describe('accountValidators', () => {
  it('accountType should be required', () => {
    expect(validate('', accountValidators.accountType)).toEqual({ required: true });
    expect(validate('Savings', accountValidators.accountType)).toBeNull();
  });

  it('accountNumber should require length and allowed characters', () => {
    expect(validate('', accountValidators.accountNumber)?.['required']).toBeTrue();
    expect(validate('12', accountValidators.accountNumber)?.['minlength']).toBeTruthy();
    expect(validate('12$$', accountValidators.accountNumber)?.['pattern']).toBeTruthy();
    expect(validate('AB-1234 5678', accountValidators.accountNumber)).toBeNull();
  });

  it('ifscCode should match the Indian IFSC format', () => {
    expect(validate('SBIN0001234', accountValidators.ifscCode)).toBeNull();
    expect(validate('SBIN1001234', accountValidators.ifscCode)?.['pattern']).toBeTruthy();
    expect(validate('', accountValidators.ifscCode)).toBeNull(); // optional
  });

  it('signedAmount should accept negative and decimal values', () => {
    expect(validate('-100.50', accountValidators.signedAmount)).toBeNull();
    expect(validate('100', accountValidators.signedAmount)).toBeNull();
    expect(validate('abc', accountValidators.signedAmount)?.['pattern']).toBeTruthy();
    expect(validate('', accountValidators.signedAmount)?.['required']).toBeTrue();
  });

  it('positiveAmount should reject negatives', () => {
    expect(validate('-5', accountValidators.positiveAmount)?.['pattern']).toBeTruthy();
    expect(validate('5.25', accountValidators.positiveAmount)).toBeNull();
  });

  it('optionalRate should be within 0..100', () => {
    expect(validate('50', accountValidators.optionalRate)).toBeNull();
    expect(validate('150', accountValidators.optionalRate)?.['max']).toBeTruthy();
  });

  it('notes should enforce a max length', () => {
    expect(validate('a'.repeat(501), accountValidators.notes)?.['maxlength']).toBeTruthy();
    expect(validate('short note', accountValidators.notes)).toBeNull();
  });
});
