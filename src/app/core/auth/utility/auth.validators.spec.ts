import { FormControl, FormGroup } from '@angular/forms';
import { cashflowPasswordPattern, passwordMatchValidator } from './auth.validators';

describe('auth.validators', () => {
  describe('cashflowPasswordPattern', () => {
    it('should accept a password meeting every rule', () => {
      expect(cashflowPasswordPattern.test('Password@123')).toBeTrue();
    });

    it('should reject passwords missing a required character class or length', () => {
      expect(cashflowPasswordPattern.test('password1!')).toBeFalse();
      expect(cashflowPasswordPattern.test('PASSWORD1!')).toBeFalse();
      expect(cashflowPasswordPattern.test('Password!')).toBeFalse();
      expect(cashflowPasswordPattern.test('Password1')).toBeFalse();
      expect(cashflowPasswordPattern.test('Pass1!')).toBeFalse();
    });
  });

  describe('passwordMatchValidator', () => {
    const buildGroup = (newPassword: string, confirmPassword: string): FormGroup =>
      new FormGroup({
        newPassword: new FormControl(newPassword),
        confirmPassword: new FormControl(confirmPassword),
      });

    it('should return null when the passwords match', () => {
      const group = buildGroup('Password@123', 'Password@123');
      expect(passwordMatchValidator('newPassword', 'confirmPassword')(group)).toBeNull();
    });

    it('should return passwordMismatch when the passwords differ', () => {
      const group = buildGroup('Password@123', 'Different@123');
      expect(passwordMatchValidator('newPassword', 'confirmPassword')(group)).toEqual({
        passwordMismatch: true,
      });
    });

    it('should return null when either password is empty', () => {
      const group = buildGroup('', 'Password@123');
      expect(passwordMatchValidator('newPassword', 'confirmPassword')(group)).toBeNull();
    });
  });
});
