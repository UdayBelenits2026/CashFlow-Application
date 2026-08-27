import { FormBuilder, FormControl } from '@angular/forms';
import {
  amountValidator,
  dateValidator,
  descriptionValidator,
  differentAccountsValidator,
  createTransactionForm,
  applyTypeValidators,
  maskAccountNumber,
  buildTransactionPayload,
  AccountOption,
} from './transaction-form.util';

describe('transaction-form.util', () => {
  const fb = new FormBuilder();

  describe('amountValidator', () => {
    it('should accept empty values (handled by required)', () => {
      expect(amountValidator(new FormControl(''))).toBeNull();
      expect(amountValidator(new FormControl(null))).toBeNull();
    });
    it('should reject zero/negative amounts', () => {
      expect(amountValidator(new FormControl(0))).toEqual({ amountMin: true });
      expect(amountValidator(new FormControl(-5))).toEqual({ amountMin: true });
    });
    it('should reject more than two decimals', () => {
      expect(amountValidator(new FormControl('10.123'))).toEqual({ amountDecimals: true });
    });
    it('should accept valid amounts', () => {
      expect(amountValidator(new FormControl('10.50'))).toBeNull();
    });
  });

  describe('dateValidator', () => {
    it('should reject an invalid date', () => {
      expect(dateValidator(new FormControl('not-a-date'))).toEqual({ invalidDate: true });
    });
    it('should reject a future date', () => {
      const future = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      expect(dateValidator(new FormControl(future))).toEqual({ futureDate: true });
    });
    it('should accept today or a past date', () => {
      expect(dateValidator(new FormControl('2020-01-01'))).toBeNull();
    });
  });

  describe('descriptionValidator', () => {
    it('should reject a 1-char trimmed value', () => {
      expect(descriptionValidator(new FormControl(' a '))).toEqual({ minTrimmed: true });
    });
    it('should reject an over-long value', () => {
      expect(descriptionValidator(new FormControl('a'.repeat(151)))).toEqual({ maxTrimmed: true });
    });
    it('should accept a valid description', () => {
      expect(descriptionValidator(new FormControl('Groceries'))).toBeNull();
    });
  });

  describe('differentAccountsValidator', () => {
    it('should flag identical from/to accounts', () => {
      const group = fb.group({ fromAccountId: 'a1', toAccountId: 'a1' });
      expect(differentAccountsValidator(group)).toEqual({ sameAccount: true });
    });
    it('should pass when accounts differ', () => {
      const group = fb.group({ fromAccountId: 'a1', toAccountId: 'a2' });
      expect(differentAccountsValidator(group)).toBeNull();
    });
  });

  describe('maskAccountNumber', () => {
    it('should mask all but the last four', () => {
      expect(maskAccountNumber('12345678')).toBe('**** 5678');
    });
    it('should handle undefined', () => {
      expect(maskAccountNumber(undefined)).toBe('****');
    });
  });

  describe('applyTypeValidators', () => {
    it('should require from/to accounts for a Transfer', () => {
      const form = createTransactionForm(fb, '2026-01-01');
      applyTypeValidators(form, 'Transfer', '');
      form.get('fromAccountId')!.setValue('');
      expect(form.get('fromAccountId')!.valid).toBeFalse();
      expect(form.get('category')!.valid).toBeTrue(); // category not required for transfers
    });

    it('should require category, account and payment method for an Expense', () => {
      const form = createTransactionForm(fb, '2026-01-01');
      applyTypeValidators(form, 'Expense', '');
      form.get('category')!.setValue('');
      form.get('paymentMethod')!.setValue('');
      expect(form.get('category')!.valid).toBeFalse();
      expect(form.get('paymentMethod')!.valid).toBeFalse();
    });
  });

  describe('buildTransactionPayload', () => {
    const accounts: AccountOption[] = [
      { id: 'a1', name: 'Checking', label: 'Checking ****1', status: 'Active' },
      { id: 'a2', name: 'Savings', label: 'Savings ****2', status: 'Active' },
    ];

    it('should build an expense payload with the account name', () => {
      const payload = buildTransactionPayload(
        {
          type: 'Expense', date: '2026-01-01', amount: 25, description: '  Lunch  ', category: 'Food & Dining',
          accountId: 'a1', fromAccountId: '', toAccountId: '', paymentMethod: 'Cash', referenceNumber: '', notes: '', tags: [],
        },
        accounts
      );
      expect(payload.amount).toBe(25);
      expect(payload.description).toBe('Lunch');
      expect(payload.accountName).toBe('Checking');
      expect(payload.category).toBe('Food & Dining');
    });

    it('should build a transfer payload combining both account names', () => {
      const payload = buildTransactionPayload(
        {
          type: 'Transfer', date: '2026-01-01', amount: 25, description: 'Move', category: '',
          accountId: '', fromAccountId: 'a1', toAccountId: 'a2', paymentMethod: '', referenceNumber: '', notes: '', tags: [],
        },
        accounts
      );
      expect(payload.accountName).toBe('Checking → Savings');
      expect(payload.fromAccountId).toBe('a1');
      expect(payload.toAccountId).toBe('a2');
    });
  });
});
