import {
  formatFrequency,
  getRecurringNextLabel,
  getSourceTypeColor,
  formatAccountLabel,
  toIncomeCsv,
  exportIncomeToCsv
} from './income.helpers';
import { Income } from '../models/income.model';
describe('income.helpers', () => {
  describe('formatFrequency', () => {
    it('should map known frequencies to labels', () => {
      expect(formatFrequency('WEEKLY')).toBe('Weekly');
      expect(formatFrequency('BI_WEEKLY')).toBe('Bi-Weekly');
      expect(formatFrequency('MONTHLY')).toBe('Monthly');
      expect(formatFrequency('QUARTERLY')).toBe('Quarterly');
      expect(formatFrequency('ANNUALLY')).toBe('Annually');
      expect(formatFrequency('IRREGULAR')).toBe('Irregular / As Received');
    });

    it('should fall back to One-time when frequency is missing', () => {
      expect(formatFrequency(undefined)).toBe('One-time');
    });
  });

  describe('getRecurringNextLabel', () => {
    it('should handle null, today, tomorrow and overdue', () => {
      expect(getRecurringNextLabel(null)).toBe('—');
      expect(getRecurringNextLabel(0)).toBe('Due today');
      expect(getRecurringNextLabel(1)).toBe('Tomorrow');
      expect(getRecurringNextLabel(5)).toBe('In 5 days');
      expect(getRecurringNextLabel(-1)).toBe('1 day overdue');
      expect(getRecurringNextLabel(-3)).toBe('3 days overdue');
    });
  });

  describe('getSourceTypeColor', () => {
    it('should return the brand color for a known type', () => {
      expect(getSourceTypeColor('Salary')).toBe('#2563EB');
    });

    it('should return the fallback color for unknown/undefined', () => {
      expect(getSourceTypeColor(undefined)).toBe('#64748B');
    });
  });

  describe('formatAccountLabel', () => {
    it('should mask the account when provided', () => {
      expect(formatAccountLabel({ name: 'Chase', accountNumberLast4: '1234' } as any)).toBe('Chase ••••1234');
    });

    it('should use the default label when no account', () => {
      expect(formatAccountLabel(null)).toBe('Main Account');
    });
  });

  describe('toIncomeCsv', () => {
    const income: Income = {
      id: '1',
      date: '2026-01-01',
      description: 'Pay "Jan"',
      sourceName: 'Acme',
      sourceType: 'Salary',
      accountName: 'Checking',
      amount: 5000,
      taxable: true,
      isRecurring: false,
      status: 'RECORDED',
      notes: 'ok'
    } as Income;

    it('should produce headers and one row per income', () => {
      const { headers, rows } = toIncomeCsv([income]);
      expect(headers[0]).toBe('Transaction ID');
      expect(rows.length).toBe(1);
      expect(rows[0]).toContain(5000);
      expect(rows[0]).toContain('Yes'); // taxable
      expect(rows[0]).toContain('No'); // recurring
    });

    it('should escape embedded quotes', () => {
      const { rows } = toIncomeCsv([income]);
      expect(rows[0][2]).toBe('"Pay ""Jan"""');
    });
  });

  describe('exportIncomeToCsv', () => {
    it('should trigger a CSV download for non-empty data', () => {
      const createUrl = spyOn(URL, 'createObjectURL').and.returnValue('blob:mock');
      spyOn(URL, 'revokeObjectURL');
      const anchor = document.createElement('a');
      spyOn(anchor, 'click');
      spyOn(document, 'createElement').and.returnValue(anchor);

      exportIncomeToCsv([{ id: '1', date: '2026-01-01', amount: 10 } as Income], 'my-income');

      expect(createUrl).toHaveBeenCalledTimes(1);
      expect(anchor.getAttribute('download')).toBe('my-income.csv');
    });
  });
});
