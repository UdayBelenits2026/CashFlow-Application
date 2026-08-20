import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const cashflowPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export const passwordMatchValidator = (passwordKey: string, confirmationKey: string): ValidatorFn =>
  (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordKey)?.value;
    const confirmation = control.get(confirmationKey)?.value;
    return password && confirmation && password !== confirmation ? { passwordMismatch: true } : null;
  };
